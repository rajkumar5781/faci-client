<template>
  <FModal
    :title="
      isSection ? $t('Job Plan Section Details') : $t('JobPlan Task Details')
    "
    :visible="showSettingDialog"
    :append-to-body="true"
    @cancel="closeDialog"
    :hideFooter="true"
    size="M"
  >
    <FContainer
      padding="containerXLarge sectionSmall"
      display="flex"
      flexDirection="column"
      gap="containerXxLarge"
    >
      <FTags appearance="simple" text="General Information" :disabled="false" />
      <FRecordDetails
        :record="selectedTask"
        :fields="generalFieldList"
        layout="4"
      />
      <FDivider width="100" />
      <FTags
        appearance="simple"
        text="Configure Information"
        :disabled="false"
      />
      <FRecordDetails
        :record="scopeDetail"
        :fields="scopeFieldList"
        layout="4"
      />
      <FDivider width="100" />
      <FTags appearance="simple" text="Input Configuration" :disabled="false" />
      <FRecordDetails
        :record="selectedTask"
        :fields="inputConfigFields"
        layout="4"
      />
      <FDivider width="100" />
      <FContainer
        v-if="inputType === 'Option'"
        display="flex"
        flexDirection="column"
        gap="containerXxLarge"
      >
        <FTags appearance="simple" text="Validation" :disabled="false" />
        <FRecordDetails
          :record="selectedTask"
          :fields="inputConfigFields"
          layout="4"
        />
        <FDivider width="100" />
      </FContainer>
      <FContainer
        v-if="selectedTask.sfgScheduleId"
        display="flex"
        flexDirection="column"
        gap="containerXxLarge"
      >
        <FTags appearance="simple" text="Actions" :disabled="false" />
        <FText>{{ selectedTask.actionContent || '---' }}</FText>
        <FDivider width="100" />
        <FTags appearance="simple" text="Notes" :disabled="false" />
        <FText>{{ selectedTask.notes || '---' }}</FText>
        <FDivider width="100"
      /></FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { JOB_PLAN_SECTION_SCOPE, JOB_PLAN_TASK_SCOPE } from '../scope-util'
import getProperty from 'dlv'
import { API } from '@facilio/api'
import { getRelatedFieldName } from '../../../../utils/relatedFieldUtil'
import {
  FSpinner,
  FModal,
  FRecordDetails,
  FContainer,
  FTags,
  FDivider,
  FText,
} from '@facilio/design-system'

export default {
  name: 'JPSettingDialog',
  props: ['showSettingDialog', 'isSection', 'selectedTask'],
  created() {
    this.isEmpty = isEmpty
  },
  components: {
    FSpinner,
    FRecordDetails,
    FModal,
    FContainer,
    FTags,
    FDivider,
    FText,
  },
  data() {
    return {
      optionsList: [],
      //woForms: [],
      operatorHash: { 9: '=', 10: '!=', 11: '<', 12: '<=', 13: '>', 14: '>=' },
      generalFieldList: [
        { displayName: 'Subject', name: 'subject', span: 1, type: 'text' },
        {
          displayName: 'Frequency',
          name: 'taskFrequencyName',
          span: 1,
          type: 'text',
        },
        {
          displayName: 'Skill Set',
          name: 'skillSetName',
          span: 1,
          type: 'text',
        },
        {
          displayName: 'Criticality',
          name: 'taskCriticalityName',
          span: 1,
          type: 'text',
        },
        {
          displayName: 'Description',
          name: 'description',
          span: 4,
          type: 'text',
        },
      ],
      scopeFieldList: [
        { displayName: 'Scope', name: 'scopeName', span: 1, type: 'text' },
      ],
      inputConfigFields: [
        { displayName: 'Values', name: 'values', span: 1, type: 'text' },
        {
          displayName: 'Default Value',
          name: 'defaultValue',
          span: 1,
          type: 'text',
        },
        {
          displayName: 'Deviation Value',
          name: 'failureValue',
          span: 1,
          type: 'text',
        },
      ],
    }
  },
  mounted() {
    let { inputType } = this
    if (inputType === 'Option') this.loadOptions()
    //this.loadWoForms()
  },
  computed: {
    inputEnabled() {
      let { selectedTask } = this
      let { inputType } = selectedTask || {}

      return !isEmpty(inputType) && inputType !== 1
    },
    inputType() {
      let { selectedTask } = this
      let { inputType } = selectedTask || {}
      let inputOption = ''

      if (!isEmpty(inputType)) {
        let inputHash = {
          2: 'Reading',
          3: 'Text',
          4: 'Number',
          5: 'Option',
        }
        inputOption = !isEmpty(inputHash[inputType]) ? inputHash[inputType] : ''
      }
      return inputOption
    },
    createWoOnFailureConfigured() {
      let { selectedTask } = this
      let { createWoOnFailure = false } = selectedTask || {}
      return createWoOnFailure
    },
    attachmentRequired() {
      let { selectedTask } = this
      let { attachmentRequired } = selectedTask || {}

      return attachmentRequired
    },
    remarksRequired() {
      let { selectedTask } = this
      let { remarksRequired } = selectedTask || {}

      return remarksRequired
    },
    deviationOperator() {
      let { selectedTask, operatorHash } = this
      let { deviationOperatorId } = selectedTask || {}

      return `${operatorHash[deviationOperatorId]} ` || ''
    },
    validationFields() {
      let { attachmentRequired, remarksRequired } = this
      let validation = ''

      if (attachmentRequired) validation = 'Photo'
      if (remarksRequired) validation = `${validation}, Remarks`
      return validation
    },
    attachmentTitle() {
      let { selectedTask } = this
      let { attachmentOption } = selectedTask || {}
      if (attachmentOption === 'all') return this.$t('jobplan.photo_all')
      else return this.$t('jobplan.photo_specific')
    },
    remarksTitle() {
      let { selectedTask } = this
      let { remarkOption } = selectedTask || {}
      if (remarkOption === 'all') return this.$t('jobplan.remarks_all')
      else return this.$t('jobplan.remarks_specific')
    },
    attachmentOptions() {
      let { selectedTask } = this
      let { attachmentOption, attachmentOptionValues } = selectedTask || {}

      if (attachmentOption === 'specific')
        return attachmentOptionValues.toString()
      else return ``
    },
    remarksOptions() {
      let { selectedTask } = this
      let { remarkOption, remarkOptionValues } = selectedTask || {}

      if (remarkOption === 'specific') return remarkOptionValues.toString()
      else return ``
    },
    dataValidationEnabled() {
      let { selectedTask } = this
      let { validation } = selectedTask || {}

      return !isEmpty(validation)
    },
    validationEnabled() {
      let { attachmentRequired, remarksRequired } = this
      return attachmentRequired || remarksRequired
    },
    scopeName() {
      let { selectedTask, isSection } = this
      let scopeName = ''
      if (isSection) scopeName = this.getSectionScope(selectedTask)
      else scopeName = this.getTaskScope(selectedTask)
      return scopeName
    },
    scopeDetail() {
      return { scopeName: this.scopeName || null }
    },
    canShowResourceCategory() {
      let { scopeName } = this
      return ['Asset Category', 'Space Category'].includes(scopeName)
    },
    scopeCategoryName() {
      let { scopeName, selectedTask } = this
      if (scopeName === 'Asset Category') {
        let { assetCategory } = selectedTask || {}
        return getProperty(assetCategory, 'displayName', '---')
      } else {
        let { spaceCategory } = selectedTask || {}
        return getProperty(spaceCategory, 'displayName', '---')
      }
    },
    readingFieldName() {
      let { selectedTask } = this
      let { readingField } = selectedTask || {}
      return getProperty(readingField, 'displayName', '---')
    },
    sectionName() {
      let { selectedTask, isSection } = this

      if (isSection) return getProperty(selectedTask, 'name', 'N/A')
      else return getProperty(selectedTask, 'subject', 'N/A')
    },
  },
  methods: {
    closeDialog() {
      this.$emit('update:showSettingDialog', false)
    },
    async loadOptions() {
      let { isSection, selectedTask } = this
      let { id } = selectedTask || {}

      let optionsModuleName
      let currentModuleName
      if (isSection) {
        optionsModuleName = 'jobPlanSectionInputOptions'
        currentModuleName = 'jobplansection'
      } else {
        optionsModuleName = 'jobPlanTaskInputOptions'
        currentModuleName = 'jobplantask'
      }
      let relatedFieldName = getRelatedFieldName(
        currentModuleName,
        optionsModuleName
      )
      let relatedConfig = {
        moduleName: currentModuleName,
        id,
        relatedModuleName: optionsModuleName,
        relatedFieldName,
      }
      let { error, list } = await API.fetchAllRelatedList(relatedConfig)

      if (error) {
        this.$message.error(error.message || 'Error Occured')
      } else {
        let value = list.map(val => val.value)
        console.log('ooo==>>', value.join(', '))
        this.$set(this.selectedTask, 'values', value.join(', '))
        this.$set(this, 'optionsList', list)
      }
    },
    getSectionScope(section) {
      let { jobPlanSectionCategory, jobPlan } = section || {}
      let { jobPlanCategory } = jobPlan || {}
      let sectionScopeOptions = JOB_PLAN_SECTION_SCOPE[jobPlanCategory] || []
      let sectionScope = Object.keys(sectionScopeOptions).find(
        key => sectionScopeOptions[key] === jobPlanSectionCategory
      )

      return !isEmpty(sectionScope) ? sectionScope : '---'
    },
    // async loadWoForms() {
    //   let url = `/v2/forms?moduleName=workorder`
    //   let { error, data } = await API.get(url)

    //   if (error) {
    //     this.$message.error('Error Occured')
    //   } else {
    //     let { forms = [] } = data || {}
    //     this.woForms = forms.filter(
    //       form => form.id > 0 && form.name !== 'default_workorder_web'
    //     )
    //   }
    // },
    getTaskScope(task) {
      let { taskSection, jobPlanTaskCategory, jobPlan } = task || {}
      let { jobPlanCategory } = jobPlan || {}
      let { jobPlanSectionCategory } = taskSection || {}
      let currentSectionScopeOptions = JOB_PLAN_SECTION_SCOPE[jobPlanCategory]
      let taskScopeKey = Object.keys(currentSectionScopeOptions).find(
        key => currentSectionScopeOptions[key] === jobPlanSectionCategory
      )
      let taskScopeOptions = JOB_PLAN_TASK_SCOPE[taskScopeKey] || {}
      let taskScope = Object.keys(taskScopeOptions).find(
        key => taskScopeOptions[key] === jobPlanTaskCategory
      )

      return !isEmpty(taskScope) ? taskScope : '---'
    },
  },
}
</script>
<style lang="scss">
.jp-setting-dialog {
  .FModal {
    padding: 10px !important;
  }
}
</style>
