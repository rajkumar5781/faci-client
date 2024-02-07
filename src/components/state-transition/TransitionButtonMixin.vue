<script>
import { API } from '@facilio/api' // have to handle new form
import ConfirmationDialog from './TransitionConfirmation.vue'
import TransitionComment from './TransitionCommentWrapper.vue'
import { isEmpty, isFunction, isObject } from '@facilio/utils/validation'
import cloneDeep from 'lodash/cloneDeep'
import dlv from 'dlv'
import delay from 'lodash/delay'
import { ftoast } from '@facilio/design-system'

const actionStatusFlag = {
  NOT_CONFIGURED: -1,
  YET_TO_START: 0,
  IN_PROCESS: 1,
  FAILED: 2,
  SUCCESS: 3,
}

const transitionBtnActions = {
  FORM: 'formId',
  CONFIRMATION: 'confirmationDialogs',
  COMMENT: 'commentRequired',
}

export default {
  props: ['transitionFilter', 'disabled', 'hideNotifications'],
  components: { ConfirmationDialog, TransitionComment },
  data() {
    return {
      stateTransitions: null,
      transitionLoading: false,
      canShowForm: false,
      selectedTransition: null,
      dataForCurrentTransition: null,
      confirmationDialogs: null,
      showConfirmationDialog: false,
      selectedTransitionActions: null,
      showCommentDialog: false,
      transitionBtnActionsOrder: [],
      transitionCommentData: {},
    }
  },
  computed: {
    hasTransitionBtns() {
      let { record, stateTransitions } = this
      return record.isStateFlowEnabled() && !isEmpty(stateTransitions)
    },
    shouldCreateModuleRecord() {
      let { selectedTransition = {} } = this
      let { dialogType = null, formModuleName } = selectedTransition || {}

      return (
        !isEmpty(dialogType) && !isEmpty(formModuleName) && dialogType === 2
      )
    },
    shouldCreateNotes() {
      let { form } = this.selectedTransition || {}
      return dlv(form, 'module.type', null) === 5
    },
    transitionButtonLoading() {
      return !isEmpty(this.selectedTransition)
    },
    isTransitionDisabled() {
      let { transitionLoading, disabled, transitionButtonLoading } = this

      return transitionLoading || disabled || transitionButtonLoading
    },
    transitionFormProps() {
      let {
        selectedTransition,
        record,
        shouldCreateModuleRecord,
        saveDataForTransition,
        formCancelTransition,
      } = this
      let { moduleName, formId, formModuleName } = selectedTransition || {}
      moduleName = shouldCreateModuleRecord ? formModuleName : moduleName
      let { id: recordId } = record || {}

      return {
        moduleName,
        recordId,
        formId,
        record: shouldCreateModuleRecord ? null : record,
        parentModuleName: shouldCreateModuleRecord ? moduleName : null,
        title: selectedTransition.name,
        transition: selectedTransition,
        isExternalModule: shouldCreateModuleRecord,
        saveAction: saveDataForTransition,
        closeAction: formCancelTransition,
      }
    },
  },
  methods: {
    async transitionButtonInit() {
      if (this.record?.isStateFlowEnabled()) {
        await this.fetchAvailableStates(...arguments)
      }
    },
    async fetchAvailableStates({ force = false } = {}) {
      this.transitionLoading = true
      let { data, error } = await API.get(
        '/v2/statetransition/getAvailableState',
        {
          moduleName: this.moduleName,
          id: this.record.id,
        },
        { force }
      )

      if (error) {
        this.stateTransitions = null
      } else {
        let { currentState = null, states = [] } = data || {}

        if (currentState) {
          this.$emit('currentState', currentState.id)
        }
        if (!isEmpty(this.transitionFilter) && !isEmpty(this.states)) {
          states = states.filter(this.transitionFilter)
        }
        this.stateTransitions = (states || []).map(transition => {
          return {
            ...transition,
            clickAction: this.startTransition,
            loading: false,
            disable: false,
          }
        })
      }
      this.transitionLoading = false
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
      let { selectedTransitionActions, selectedTransition } = this
      let { YET_TO_START, IN_PROCESS, FAILED } = actionStatusFlag
      let { stateFlowTransitionSequence = [] } = selectedTransition || {}
      if (isEmpty(stateFlowTransitionSequence)) {
        stateFlowTransitionSequence = []
      }
      this.transitionBtnActionsOrder = []
      if (!isEmpty(stateFlowTransitionSequence)) {
        stateFlowTransitionSequence.forEach(action => {
          if (
            ['field_update', 'create_record'].includes(
              action.transitionActionType
            )
          ) {
            this.transitionBtnActionsOrder.push('FORM')
          } else if ('comment' === action.transitionActionType) {
            this.transitionBtnActionsOrder.push('COMMENT')
          }
        })
        this.transitionBtnActionsOrder.push('CONFIRMATION')
      } else {
        this.transitionBtnActionsOrder = ['FORM', 'CONFIRMATION']
      }

      let isAnyActionFailed = this.transitionBtnActionsOrder.some(
        action => selectedTransitionActions[action] === FAILED
      )
      let currentRunningProcess = this.transitionBtnActionsOrder.some(
        action => selectedTransitionActions[action] === IN_PROCESS
      )

      if (isAnyActionFailed || currentRunningProcess) return

      let nextProcessToStart =
        this.transitionBtnActionsOrder.find(
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
        } else if (nextProcessToStart === 'CONFIRMATION') {
          return this.checkConfirmations(selectedTransition)
        } else if (nextProcessToStart === 'COMMENT') {
          this.openComment()
        }
      } else {
        return this.continueTransition()
      }
    },
    saveDataForTransition(formData) {
      this.dataForCurrentTransition = cloneDeep(formData)
      this.$set(
        this.selectedTransitionActions,
        'FORM',
        actionStatusFlag.SUCCESS
      )
      return Promise.resolve()
    },
    async checkConfirmations(transition) {
      let { moduleName, record } = this
      let params = {
        id: record.id,
        moduleName: moduleName,
        transitionId: transition.id,
      }

      let { dataForCurrentTransition } = this
      if (!isEmpty(transition.formId) && !isEmpty(dataForCurrentTransition)) {
        let formData = {
          ...dataForCurrentTransition,
          ...(dataForCurrentTransition.data || {}),
        }
        delete formData.data
        params['data'] = formData
      }

      let { error, data } = await API.post(
        `v2/statetransition/confirmationDialogs`,
        params
      )
      if (error) {
        this.defaultResponseHandler({ error })
      } else {
        let { validConfirmationDialogs } = data

        if (!isEmpty(validConfirmationDialogs)) {
          this.confirmationDialogs = validConfirmationDialogs
          this.showConfirmationDialog = true
        } else {
          this.$set(
            this.selectedTransitionActions,
            'CONFIRMATION',
            actionStatusFlag.SUCCESS
          )
          return this.startTransitionProcess()
        }
      }
    },
    proceedAfterConfirmation() {
      this.$set(
        this.selectedTransitionActions,
        'CONFIRMATION',
        actionStatusFlag.SUCCESS
      )
      this.startTransitionProcess()
    },

    continueTransition() {
      let { selectedTransition, dataForCurrentTransition: formData = null } =
        this

      return this.transitionToState(formData, selectedTransition)
    },
    cancelTransition() {
      this.selectedTransition?.onActionComplete()
      this.dataForCurrentTransition = null
      this.confirmationDialogs = null
      this.showCommentDialog = false
      this.closeConfirmationDialogs()
    },
    formCancelTransition() {
      this.selectedTransition?.onActionComplete()
      this.dataForCurrentTransition = null
      this.confirmationDialogs = null
      this.showCommentDialog = false
      this.closeStateFlowForm()
      this.closeConfirmationDialogs()
    },
    getParams({ formData, transition }) {
      let { moduleName, record } = this
      let { id } = record || {}
      let { id: stateTransitionId, formId, formModuleName } = transition || {}
      let serializedFormData = formData

      if (this.shouldCreateModuleRecord) {
        serializedFormData = {
          relations: {
            [formModuleName]: [{ data: [{ ...formData, formId }] }],
          },
        }
      }
      if (this.transitionBtnActionsOrder.includes('COMMENT')) {
        let { transitionCommentData } = this

        serializedFormData = { ...serializedFormData, transitionCommentData }
      }

      if (this.shouldCreateNotes && isFunction(this.transformFn)) {
        let firstArg = { moduleName, id, stateTransitionId }
        let secondArg = !this.isV3 && !this.shouldCreateNotes ? formData : null

        return this.transformFn(firstArg, secondArg)
      } else {
        return { id, stateTransitionId, data: serializedFormData || {} }
      }
    },
    async transitionToState(formData, transition) {
      if (isEmpty(transition)) transition = this.selectedTransition

      let params = this.getParams({ formData, transition })
      let { defaultResponseHandler, moduleName, record } = this

      let { id: recordId } = record || {}
      let transitionUpdateMethod

      try {
        if (this.updateUrl) {
          let url = this.getUrl(transition)
          transitionUpdateMethod = API.post(url, params)
        } else {
          let url = `v3/action/${moduleName}/${recordId}/transition`
          transitionUpdateMethod = API.patch(url, params)
        }

        let { error } = await transitionUpdateMethod

        if (error) {
          defaultResponseHandler({ error })
        } else if (this.shouldCreateNotes) {
          try {
            await this.v2SubModuleHandler(formData, transition)
            defaultResponseHandler({})
          } catch (error) {
            // Edge case where transition is success but record creation fails
            this.fetchAvailableStates({ force: true })
            this.$emit('transitionSuccess')
            defaultResponseHandler({ error: {} })
          }
        } else {
          defaultResponseHandler({})
        }
      } catch (error) {
        // error handled in defaultResponseHandler
      }
    },
    async v2SubModuleHandler(formData, transition) {
      let { shouldCreateNotes, shouldCreateModuleRecord } = this
      let { formModuleName } = transition

      if (shouldCreateNotes) {
        return this.createNoteForModule(formModuleName, formData, transition)
      }
    },
    createNoteForModule(moduleName, formData) {
      let url = `v2/notes/${moduleName}/${this.moduleName}/add/${record.id}`
      return new Promise((resolve, reject) => {
        API.post(url, {
          module: moduleName,
          ticketModuleName: this.moduleName,
          note: {
            parentId: this.record.id,
            notifyRequester: false,
            body: formData.body,
          },
        }).then(({ error }) => {
          if (error) {
            reject()
          } else {
            resolve()
          }
        })
      })
    },
    defaultResponseHandler({ error } = {}) {
      if (!error) {
        this.fetchAvailableStates({ force: true })
        this.$emit('transitionSuccess')
      } else {
        this.$emit('transitionFailure')
      }
      this.cancelTransition()

      if (!this.hideNotifications) {
        if (error) {
          ftoast.critical(error.message || 'Failed to update state')
        } else {
          delay(ftoast.success('State updated successfully'), 200)
        }
      }
    },
    closeStateFlowForm() {
      this.showCommentDialog = false
      this.canShowForm = false
    },
    showStateFlowForm() {
      this.canShowForm = true
    },
    closeConfirmationDialogs() {
      this.showConfirmationDialog = false
    },
    openComment() {
      this.showCommentDialog = true
    },
    async onSaveComment(data) {
      this.transitionCommentData = {
        ...(this.transitionCommentData || {}),
        ...(data || {}),
      }
      let body = ''

      if (this.moduleName === 'serviceRequest') {
        let tempDiv = document.createElement('div')

        tempDiv.innerHTML = this.transitionCommentData?.htmlContent
        body = tempDiv.querySelector('.rich-text-container')?.textContent
      } else {
        body = this.transitionCommentData.body
      }
      if (isEmpty(body)) {
        this.defaultResponseHandler({
          error: { message: 'Comment cannot be empty' },
        })
      } else {
        this.$set(
          this.selectedTransitionActions,
          'COMMENT',
          actionStatusFlag.SUCCESS
        )
        this.startTransitionProcess()
      }
      this.showCommentDialog = false
    },
    reStartTransitionProcess() {
      this.showCommentDialog = false
      this.$nextTick(() => {
        this.startTransitionProcess()
      })
    },
  },
}
</script>
