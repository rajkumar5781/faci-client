<template>
  <FModal
    :visible="canShowPlannerFieldSelector"
    :title="selectorTitle"
    :breadCrumbProps="breadCrumbProps"
    size="L"
    :confirmLoading="isSaving"
    @ok="handleOk"
    @cancel="cancelDialog"
    @path="handlePathChange"
  >
    <FContainer
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="start"
      minHeight="491px"
      class="planner-field-selector-container"
    >
      <FContainer width="60%">
        <FText>{{
          $t('pm_creation.assigned_to', { ns: 'maintenance' })
        }}</FText>
        <FSelect
          v-model="assoications.assignedTo"
          :options="userOptions"
          placeholder="Select"
          :multiple="false"
          :disabled="false"
          filterable
          :remote-method="userSearch"
          clearable
          size="medium"
        />
      </FContainer>
      <FContainer width="60%" marginTop="containerXxLarge">
        <FText>{{ $t('pm_creation.jobPlan', { ns: 'maintenance' }) }}</FText>
        <Lookup
          :canShowLookupWizard="true"
          :field.sync="lookupFields['jobplan']"
          parentModuleName="pmResourcePlanner"
          :formModel="assoications"
          :moduleName="moduleName"
          :fetchOptionsOnLoad="true"
          :placeholder="$t('pm_creation.select_jobPlan', { ns: 'maintenance' })"
          :hideLookupIcon="false"
          @showLookupWizard="showLookupWizard"
          @recordSelected="setLookupFieldValue"
        />
        <LookupWizard
          :field.sync="lookupFields['jobplan']"
          parentModuleName="pmResourcePlanner"
          :canShowLookupWizard.sync="canShowLookupWizard"
          @closeWizard="closeWizard"
          @setLookupFieldValue="setLookupFieldValueFromWizard"
        ></LookupWizard>
      </FContainer>
    </FContainer>
  </FModal>
</template>

<script>
import { API } from '@facilio/api'
import {
  getPlaceholderText,
  getCategoryFilter,
  JOB_PLAN_SCOPE,
} from './utils/pm-utils.js'
import {
  FContainer,
  FModal,
  FText,
  FSelect,
  ftoast,
} from '@facilio/design-system'
import { LookupWizard, Lookup } from '@facilio/ui/new-forms'
import debounce from 'lodash/debounce'
import { getApp } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'PlannerFieldSelector',
  components: { FContainer, FModal, FText, FSelect, Lookup, LookupWizard },

  props: {
    planner: {
      type: Object,
      required: true,
    },
    pmRecord: {
      type: Object,
      required: true,
    },
    moduleName: {
      type: String,
      required: true,
    },
    breadCrumbProps: {
      type: Object,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    canShowPlannerFieldSelector: {
      type: Boolean,
      default: true,
    },
    handlePath: {
      type: Function,
      required: true,
    },
    bulkCreateResources: {
      type: Function,
      required: true,
    },
  },

  created() {
    this.initResources()
    this.userSearch = debounce(this.loadUsers, 500)
  },

  data() {
    return {
      assoications: { assignedTo: null, jobPlan: { id: null } },
      isSaving: false,
      isLoading: false,
      userOptions: [],
      canShowLookupWizard: false,
      selectedLookupField: null,
    }
  },

  computed: {
    selectorTitle() {
      let { pmRecord } = this
      let title = getPlaceholderText({
        pmRecord,
        text: this.$t('pm_creation.field_selector_title', {
          ns: 'maintenance',
        }),
        replaceAll: true,
      })
      return title
    },
    lookupFields() {
      let { pmRecord } = this
      let { assignmentTypeEnum } = pmRecord || {}
      let scopeCategory = JOB_PLAN_SCOPE[assignmentTypeEnum]
      let fields = {
        user: {
          isDataLoading: false,
          options: [],
          lookupModuleName: 'users',
          field: {
            lookupModule: {
              name: 'users',
              displayName: 'Users',
            },
          },
          multiple: false,
          filters: {
            user: {
              operatorId: 15,
              value: ['true'],
            },
          },
        },
        jobplan: {
          name: 'jobPlan',
          isDataLoading: false,
          options: [],
          config: {},
          lookupModuleName: 'jobplan',
          moduleName: 'pmResourcePlanner',
          field: {
            lookupModule: {
              name: 'jobplan',
              displayName: 'Job Plan',
            },
          },
          filters: {
            jobPlanCategory: { operatorId: 54, value: [`${scopeCategory}`] },
            jpStatus: { operatorId: 54, value: ['2'] },
            ...getCategoryFilter(pmRecord, scopeCategory),
          },
          multiple: false,
        },
      }
      return fields
    },
  },

  methods: {
    showLookupWizard(field, canShow) {
      this.$set(this, 'selectedLookupField', field)
      this.$set(this, 'canShowLookupWizard', canShow)
    },
    setLookupFieldValueFromWizard(data) {
      let { field } = data || {}

      this.setLookupFieldValue([], field)
    },
    setLookupFieldValue(values, field) {
      let { options = [], selectedItems = [], lookupModuleName } = field || {}
      let selectedItemIds = []
      let selectedField

      if (!isEmpty(selectedItems)) {
        selectedItemIds = (selectedItems || []).map(item => {
          return item.value
        })
        if (!isEmpty(options)) {
          let ids = options.map(item => item.value)
          let newOptions = selectedItems.filter(
            item => !ids.includes(item.value)
          )

          options.unshift(...newOptions)
        } else {
          options = [...selectedItems]
        }
      }
      selectedField = lookupModuleName === 'jobplan' ? 'jobPlan' : 'assignedTo'
      if (!isEmpty(selectedItemIds)) {
        this.$set(this.assoications, `${selectedField}`, {
          id: selectedItemIds[0],
        })
      }
    },
    async initResources() {
      await this.loadUsers()
    },
    async loadUsers(search) {
      this.isLoading = true
      let { id: appId } = getApp()
      let params = { appId, page: 1, perPage: 50, inviteAcceptStatus: true }

      if (!isEmpty(search)) {
        params = { ...params, search }
      }

      let { error, data } = await API.get(`/v2/application/users/list`, params)
      if (error) {
        ftoast.critical(
          error.message ||
            this.$t('pm_creation.error_occurred', { ns: 'maintenance' })
        )
      } else {
        let { users } = data || {}
        this.userOptions = (users || []).map(user => {
          let { name, id } = user || {}
          return {
            label: name,
            value: id,
          }
        })
      }
      this.isLoading = false
    },

    async saveResources() {
      let { assoications, planner } = this || {}
      this.isSaving = true
      let response = await this.bulkCreateResources(assoications)
      let { error } = response || {}
      if (error) {
        ftoast.critical(
          error.message || 'Error occured while associating resources'
        )
      } else {
        let { name } = planner || {}
        this.$emit('reloadResourcePlanner')
        this.cancelDialog()
        let message =
          name +
          this.$t('pm_creation.details_have_saved_successfully', {
            ns: 'maintenance',
          })
        ftoast.success(message)
      }
      this.isSaving = false
    },

    handlePathChange(val) {
      this.handlePath(val)
    },
    handleOk() {
      this.saveResources()
    },
    closeWizard() {
      this.canShowLookupWizard = false
    },
    cancelDialog() {
      this.$emit('closeDialog')
      this.$emit('update:canShowPlannerFieldSelector', false)
    },
  },
}
</script>
<style scoped>
.planner-field-selector-container {
  padding: 16px 215px 0px 215px;
}
</style>
