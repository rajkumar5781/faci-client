<template>
  <FContainer>
    <FContainer borderRadius="high" backgroundColor="backgroundMidgroundSubtle">
      <!-- field mapping header with toggle  -->
      <FContainer
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding="sectionXSmall"
        columnGap="containerLarge"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          rowGap="containerMedium"
          height="45px"
        >
          <FContainer display="flex" alignItems="center" height="20px">
            <FText appearance="headingMed14" color="textMain">
              {{
                $t('flagged_event_rule.template_field_mapping', {
                  ns: 'remote_monitor',
                })
              }}
            </FText>
          </FContainer>
          <FText
            appearance="captionReg12"
            color="textCaption"
            verticalAlign="middle"
          >
            {{
              $t('flagged_event_rule.template_field_mapping_description', {
                ns: 'remote_monitor',
              })
            }}
          </FText>
        </FContainer>
      </FContainer>
      <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
      <FContainer
        display="flex"
        flexDirection="column"
        rowGap="containerXxLarge"
        padding="sectionXSmall"
      >
        <!-- field mapping list -->
        <FText appearance="headingMed14" color="textMain">
          {{ $t('flagged_event_rule.field_mapping', { ns: 'remote_monitor' }) }}
        </FText>
        <ModuleFieldsFieldMapping
          ref="field-mapping-form"
          :moduleName="ticketModuleName"
          :fieldMappingList="fieldMapping"
          :fieldConfig="fieldConfig"
          :isNew="isNew"
          :parentLoading="loading"
        />
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import ModuleFieldsFieldMapping from './ModuleFieldsFieldMapping.vue'
import getProperty from 'dlv'

const FILED_CONFIG = {
  workorder: {
    INCLUDE_SYSTEM_FIELDS: [
      'subject',
      'assignedBy',
      'category',
      'description',
      'dueDate',
      'estimatedEnd',
      'isQuotationNeeded',
      'priority',
      'requestedBy',
      'requester',
      'actualWorkEnd',
      'responseDueDate',
      'scheduledStart',
      'sendForApproval',
      'serviceRequest',
      'siteId',
      'sourceType',
      'resource',
      'assignedTo',
      'actualWorkStart',
      'moduleState',
      'assignmentGroup',
      'type',
      'actualWorkDuration',
    ],
    EXCLUDE_SYSTEM_FIELDS: [],
    DEFAULT_FIELDS: ['subject'],
  },
  serviceOrder: {
    INCLUDE_SYSTEM_FIELDS: [],
    EXCLUDE_SYSTEM_FIELDS: [],
    DEFAULT_FIELDS: ['name'],
  },
}
import {
  FContainer,
  FText,
  FSelect,
  FDivider,
  FSwitch,
} from '@facilio/design-system'
export default {
  components: {
    FContainer,
    FText,
    FSelect,
    ModuleFieldsFieldMapping,
    FDivider,
    FSwitch,
  },
  props: ['flaggedEventRuleWoConfig', 'ticketModuleName', 'isNew'],
  data() {
    return {
      dataDeserialized: false,
      appId: -1,
      workorderTemplateId: null,
      woTemplateOptions: [],
      fieldMapping: [],
      loading: false,
    }
  },
  computed: {
    fieldConfig() {
      let { ticketModuleName } = this
      return !isEmpty(ticketModuleName) ? FILED_CONFIG[ticketModuleName] : {}
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.loading = true
      this.deserializeData()
      this.loading = false
    },
    getSerializedData() {
      let { dataDeserialized } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }
      let { workorderTemplateId, fieldMapping = {} } = this
      let fieldMappingForm = getProperty(this, '$refs.field-mapping-form', {})
      if (!isEmpty(fieldMappingForm)) {
        fieldMapping = fieldMappingForm.getSerializedData()
      }
      let { invalid } = fieldMapping || {}
      if (invalid) {
        return { invalid }
      }
      return { workorderTemplateId, fieldMapping }
    },
    deserializeData() {
      let { isNew } = this
      if (!isNew) {
        let { flaggedEventRuleWoConfig = {} } = this
        let { workorderTemplateId, fieldMapping } = flaggedEventRuleWoConfig
        this.workorderTemplateId = workorderTemplateId
        this.fieldMapping = fieldMapping
      }
      this.dataDeserialized = true
    },
  },
}
</script>
