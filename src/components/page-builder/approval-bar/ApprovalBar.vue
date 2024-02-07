<template>
  <FContainer>
    <FContainer display="flex" padding="containerNone containerXLarge">
      <template v-if="resendApproval">
        <FContainer
          padding="containerNone containerLarge containerNone containerNone"
          v-if="canShowEdit"
        >
          <FButton
            :loading="disableTransitions"
            :appearance="primaryAppearance || 'primary'"
            @click="$emit('onEdit')"
            >{{ $t('edit', 'Edit') }}</FButton
          >
        </FContainer>
        <FButton
          :appearance="secondaryAppearance || 'secondaryInverse'"
          :loading="isResending"
          :disabled="disableTransitions"
          @click="requestToSave(resendApproval, 'resend')"
        >
          {{ $t('resend', 'Resend') }}</FButton
        ></template
      >
      <template v-if="approveTransition && !isEmpty(transitions)">
        <FContainer v-if="rejectTransition" marginRight="containerLarge">
          <FButton
            iconPosition="prefix"
            iconGroup="action"
            iconName="cross"
            :appearance="secondaryAppearance || 'secondaryInverse'"
            @click="requestToSave(rejectTransition, 'reject')"
            :loading="isRejecting"
            :disabled="disableTransitions"
          >
            {{ rejectTransition.name }}
          </FButton>
        </FContainer>
        <FButton
          iconPosition="prefix"
          iconGroup="action"
          iconName="tick"
          :appearance="primaryAppearance || 'primary'"
          @click="requestToSave(approveTransition, 'approve')"
          :loading="isApproving"
          :disabled="disableTransitions"
        >
          {{ approveTransition.name }}
        </FButton>
      </template>
    </FContainer>
    <TransitionForm
      v-if="canShowForm"
      v-bind="transitionFormProps"
    ></TransitionForm>
  </FContainer>
</template>
<script>
import { isEmpty, isArray, isNullOrUndefined } from '@facilio/utils/validation'
import {
  FNotification,
  FButton,
  FContainer,
  ftoast,
} from '@facilio/design-system'
import dlv from 'dlv'
import views from '../../../store/views'
import { API } from '@facilio/api'
import TransitionForm from '../../../pages/form/DialogForm.vue'
import cloneDeep from 'lodash/cloneDeep'
import { CustomModuleData } from '../../../../src/data/CustomModuleData'

const viewStore = views()

const actionStatusFlag = {
  NOT_CONFIGURED: -1,
  YET_TO_START: 0,
  IN_PROCESS: 1,
  FAILED: 2,
  SUCCESS: 3,
}
const transitionBtnActionsOrder = ['FORM']
const transitionBtnActions = { FORM: 'formId' }

export default {
  props: [
    'hideApprovers',
    'canShowEdit',
    'canHideMsg',
    'approvalText',
    'availableTransitions',
    'moduleName',
    'record',
    'updateFn',
    'primaryAppearance',
    'secondaryAppearance',
    'isList',
  ],
  components: { FNotification, FButton, FContainer, TransitionForm },

  data() {
    return {
      savingButtonName: null,
      pendingApprovalList: [],
      approvalRule: {},
      currentState: {},
      stateTransitions: null,
      loading: false,
      canShowForm: false,
      selectedTransition: null,
      dataForCurrentTransition: null,
      selectedTransitionActions: null,
      isEmpty,
      data: {},
    }
  },
  computed: {
    getMessage() {
      let { loading } = this
      if (loading) return 'loading'
      let {
        isRejected,
        hasApprovalList,
        hideApprovers,
        approvers,
        policyName,
        moduleName,
        moduleDisplayName,
      } = this
      let approvalList = ''
      if (hasApprovalList && !hideApprovers) {
        let approverNameList = approvers.map(approver => {
          return approver?.name
        })
        approvalList = approverNameList.join(',')
      }
      let message = isRejected
        ? `${policyName} ${this.$t('was')} ${this.$t(
            'summary.rejected'
          )} ${this.$t('summary.for_this')} ${moduleDisplayName || moduleName}`
        : hasApprovalList && !hideApprovers
          ? `${this.policyName} ${this.$t('summary.is_pending')} ${this.$t(
              'from',
              'from',
              { ns: 'common' }
            )} ${approvalList}`
          : `${this.policyName}  ${this.$t('summary.is_pending')}`
      return message
    },
    transitions() {
      if (!isEmpty(this.stateTransitions)) {
        return [...this.stateTransitions].slice(0, 2)
      } else {
        return []
      }
    },
    disableTransitions() {
      return !isEmpty(this.savingButtonName)
    },
    isApproving() {
      return this.savingButtonName == 'approve'
    },
    isRejecting() {
      return this.savingButtonName == 'reject'
    },
    isResending() {
      return this.savingButtonName == 'resend'
    },
    policyName() {
      return isEmpty(this.approvalRule)
        ? 'Approval'
        : dlv(this.approvalRule, 'name')
    },
    shouldCurrentUserApprove() {
      return !isEmpty(this.transitions)
    },
    hasApprovalList() {
      return !isEmpty(this.approvers)
    },
    approvalMeta() {
      return { approvalList: this.pendingApprovalList }
    },
    approvers() {
      let approvers = []

      this.pendingApprovalList.forEach(approver => {
        let { value, type } = approver

        if (!isEmpty(value)) {
          if (isArray(value)) {
            approvers.push(...value)
          } else {
            approvers.push(value)
          }
        } else if (type === 'TENANT') {
          approvers.push({ name: 'Tenant', type: 'TENANT' })
        } else if (type === 'VENDOR') {
          approvers.push({ name: 'Vendor', type: 'VENDOR' })
        }
      })

      return approvers
    },
    isRejected() {
      return dlv(this.currentState, 'status') === 'Rejected'
    },
    approveTransition() {
      return this.transitions.find(t => t.name === 'Approve')
    },
    rejectTransition() {
      return this.transitions.find(t => t.name === 'Reject')
    },
    resendApproval() {
      return this.transitions.find(t => !['Approve', 'Reject'].includes(t.name))
    },
    moduleDisplayName() {
      return viewStore.metaInfo?.displayName
    },
    transitionFormProps() {
      let {
        selectedTransition,
        saveDataForTransition,
        cancelTransition,
        approvalRule,
        data: record,
      } = this
      let { moduleName, formId } = selectedTransition || {}
      let { id: recordId } = record || {}

      return {
        moduleName,
        recordId,
        formId,
        record,
        id: recordId,
        transition: selectedTransition,
        isExternalModule: false,
        title: approvalRule?.name,
        saveAction: saveDataForTransition,
        closeAction: cancelTransition,
      }
    },
    modelDataClass() {
      const moduleNameVsModelData = {}
      return moduleNameVsModelData[this.moduleName] || CustomModuleData
    },
  },
  watch: {
    getMessage: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('update:approvalText', newVal)
        }
      },
      immediate: true,
    },
  },
  created() {
    this.data = this.record
    this.fetchAvailableStates()
  },
  methods: {
    async fetchAvailableStates({ force = false } = {}) {
      let { moduleName, record } = this

      if (!isNullOrUndefined(this.availableTransitions)) {
        this.stateTransitions = this.availableTransitions || []
      } else if (!isEmpty(moduleName) && !isEmpty(record.id)) {
        this.loading = true

        let { data, error } = await API.post(
          '/v2/approval/availableTransitions',
          {
            moduleName: this.moduleName,
            id: this.record.id,
          },
          { force }
        )

        if (error) {
          this.stateTransitions = null
        } else {
          this.pendingApprovalList = dlv(data, 'pendingApprovalList') || []
          this.stateTransitions = dlv(data, 'states') || []
          this.approvalRule = dlv(data, 'approvalRule') || {}
          this.currentState = dlv(data, 'currentState') || {}
        }

        this.loading = false
      }
    },
    startTransition(transition) {
      let { NOT_CONFIGURED, YET_TO_START } = actionStatusFlag

      this.selectedTransitionActions = Object.entries(
        transitionBtnActions || {}
      ).reduce((actionList, [action, transKey]) => {
        actionList[action] = !isEmpty(transition[transKey])
          ? YET_TO_START
          : NOT_CONFIGURED
        return actionList
      }, {})

      this.selectedTransition = cloneDeep(transition)
      return this.startTransitionProcess()
    },
    startTransitionProcess() {
      let { selectedTransitionActions } = this
      let { YET_TO_START, IN_PROCESS, FAILED } = actionStatusFlag
      let isAnyActionFailed = transitionBtnActionsOrder.some(
        action => selectedTransitionActions[action] === FAILED
      )
      let currentRunningProcess = transitionBtnActionsOrder.some(
        action => selectedTransitionActions[action] === IN_PROCESS
      )

      if (isAnyActionFailed || currentRunningProcess) return

      let nextProcessToStart =
        transitionBtnActionsOrder.find(
          action => selectedTransitionActions[action] === YET_TO_START
        ) || null

      if (!isEmpty(nextProcessToStart)) {
        this.$set(
          this.selectedTransitionActions,
          nextProcessToStart,
          IN_PROCESS
        )

        if (nextProcessToStart === 'FORM') {
          this.showStateFlowForm()
          return Promise.resolve()
        }
      } else {
        return this.continueTransition()
      }
    },
    continueTransition() {
      let { selectedTransition, dataForCurrentTransition: formData = null } =
        this

      return this.transitionToState(formData, selectedTransition)
    },
    showMessage(transition) {
      let { name } = transition
      let action = ''

      if (!['Approve', 'Reject'].includes(name)) {
        action = 'resent for approval'
      } else if (name === 'Approve') {
        action = 'approved'
      } else if (name === 'Reject') {
        action = 'rejected'
      }

      ftoast.success(
        `${this.moduleDisplayName || this.moduleName} was ${action}`
      )
    },
    async requestToSave(transition, type) {
      this.savingButtonName = type
      await this.loadSummary()
      this.startTransition(transition).finally(
        () => (this.savingButtonName = null)
      )
    },

    saveAction(formData) {
      return this.transitionToState(formData)
    },

    getApproverType(approver) {
      return approver.id ? { type: 'USER', value: approver } : approver
    },

    defaultResponseHandler({ error }, transition) {
      let { canShowForm } = this

      if (error) {
        !this.canHideMsg && ftoast.critical(error.message)
        this.$emit('onFailure', { error, transition })
      } else {
        if (canShowForm) {
          this.closeStateFlowForm()
        }
        this.fetchAvailableStates()
        this.$emit('onSuccess', { error, transition })

        !this.canHideMsg && this.showMessage(transition)
      }
    },
    closeStateFlowForm() {
      this.canShowForm = false
    },
    showStateFlowForm() {
      this.canShowForm = true
    },
    saveDataForTransition(formData) {
      this.dataForCurrentTransition = cloneDeep(formData)
      this.$set(
        this.selectedTransitionActions,
        'FORM',
        actionStatusFlag.SUCCESS
      )
      this.closeStateFlowForm()
      return this.startTransitionProcess()
    },
    cancelTransition() {
      this.selectedTransition = null
      this.dataForCurrentTransition = null
      this.selectedTransitionActions = null

      this.closeStateFlowForm()
    },
    transitionToState(formData, transition) {
      if (isEmpty(transition)) transition = this.selectedTransition

      let { moduleName, updateFn, defaultResponseHandler, record } = this
      let params = {
        id: record.id,
        approvalTransitionId: transition.id,
        data: formData || {},
      }

      if (!isEmpty(updateFn) && isFunction(updateFn)) {
        return updateFn(moduleName, params).then(defaultResponseHandler)
      } else {
        let url = `v3/approval/action/${moduleName}/${record.id}/approval`

        return API.patch(url, params).then(response =>
          this.defaultResponseHandler(response, transition)
        )
      }
    },
    async loadSummary() {
      await Promise.all([this.loadApprovalMeta(), this.loadRecord()])
    },
    async loadRecord() {
      if (!this.isList) return

      try {
        let { moduleName, record } = this

        let data = await this.modelDataClass.fetch({
          moduleName,
          id: record.id,
        })

        this.data = data
      } catch (error) {
        ftoast.critical(error?.message || this.$t('error_occurred'))
      }
    },
    async loadApprovalMeta() {
      if (!this.isList) return

      let {
        record: { id },
        moduleName,
      } = this

      if (id) {
        return API.post('v2/approval/approvalDetails', {
          moduleName,
          id,
        })
          .then(({ error, data }) => {
            if (!error) {
              this.approvalRule = dlv(data, 'approvalRule') || {}
            }
          })
          .catch(error => {
            ftoast.critical(error?.message || this.$t('error_occurred'))
          })
      } else {
        return Promise.resolve()
      }
    },
  },
}
</script>
