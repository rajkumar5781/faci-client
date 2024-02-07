<template>
  <FContainer
    display="flex"
    flexDirection="column"
    rowGap="containerXxLarge"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="sectionXSmall sectionSmall"
    class="wo-create-config"
  >
    <!-- header -->
    <FContainer
      display="flex"
      flexDirection="column"
      rowGap="containerMedium"
      height="45px"
    >
      <FContainer display="flex" alignItems="center" height="20px">
        <FContainer width="16px" marginRight="containerLarge">
          <FCheckbox v-model="flaggedEventRuleWoConfig.createWorkorder" />
        </FContainer>
        <FText appearance="headingMed14" color="textMain">
          {{
            $t('flagged_event_rule.create_workorder', { ns: 'remote_monitor' })
          }}
        </FText>
      </FContainer>
      <FText
        appearance="captionReg12"
        color="textCaption"
        height="20px"
        verticalAlign="middle"
      >
        {{
          $t('flagged_event_rule.wo_create_description', {
            ns: 'remote_monitor',
          })
        }}
      </FText>
    </FContainer>

    <!-- config contents -->
    <template v-if="flaggedEventRuleWoConfig.createWorkorder">
      <FContainer display="flex" alignItems="center" height="20px">
        <FContainer width="16px" marginRight="containerLarge">
          <FCheckbox v-model="flaggedEventRuleWoConfig.autoCreateWorkOrder" />
        </FContainer>
        <FText color="textMain">
          {{
            $t('flagged_event_rule.auto_create_wo_description', {
              ns: 'remote_monitor',
            })
          }}
        </FText>
      </FContainer>
      <!-- wo field mapping -->
      <WoCreateFieldMapping
        ref="wo-create-field-mapping"
        :isNew="isNew"
        :flaggedEventRuleWoConfig="flaggedEventRuleWoConfig"
        :ticketModuleName="ticketModuleName"
      />
    </template>
  </FContainer>
</template>
<script>
import WoCreateFieldMapping from './WoCreateFieldMapping.vue'
import EmailNotificationToSitesOnWoCreation from './EmailNotificationToSitesOnWoCreation.vue'
import {
  FContainer,
  FCheckbox,
  FText,
  FRadioGroup,
} from '@facilio/design-system'
import { eventBus } from '../../../../../components/page-builder/event-bus'

export default {
  components: {
    WoCreateFieldMapping,
    FContainer,
    FCheckbox,
    FText,
    EmailNotificationToSitesOnWoCreation,
    FRadioGroup,
  },
  props: ['isNew', 'flaggedEventRule'],
  data() {
    return {
      dataDeserialized: false,
      ticketModuleName: 'workorder',
      flaggedEventRuleWoConfig: {
        fieldMapping: [],
        autoCreateWorkOrder: true,
      },
    }
  },
  computed: {
    createWorkorder() {
      let { flaggedEventRuleWoConfig = {} } = this
      let { createWorkorder = false } = flaggedEventRuleWoConfig
      return createWorkorder
    },
  },
  watch: {
    createWorkorder(newVal, oldVal) {
      if (newVal != oldVal) {
        eventBus.$emit('create-wo-enable', newVal)
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.deserializeData()
    },
    getSerializedData() {
      let { dataDeserialized } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }
      let { flaggedEventRuleWoConfig = {}, ticketModuleName } = this
      let { createWorkorder, autoCreateWorkOrder } = flaggedEventRuleWoConfig
      let WoCreateFieldMappingData = {}
      if (createWorkorder) {
        let WoCreateFieldMappingForm = this.$refs['wo-create-field-mapping']

        WoCreateFieldMappingData = WoCreateFieldMappingForm.getSerializedData()
        let { invalid } = WoCreateFieldMappingData || {}
        if (invalid) {
          return { invalid: true }
        }
        return {
          ...flaggedEventRuleWoConfig,
          ...WoCreateFieldMappingData,
          ticketModuleName,
        }
      } else {
        return {
          workorderTemplateId: null,
          fieldMapping: [],
          createWorkorder: false,
          ticketModuleName,
          autoCreateWorkOrder,
        }
      }
    },
    deserializeData() {
      let { isNew, flaggedEventRule } = this

      let { ticketModuleName, autoCreateWorkOrder } = flaggedEventRule
      this.ticketModuleName = ticketModuleName

      if (!isNew) {
        let { flaggedEventRule = {} } = this
        let {
          createWorkorder,
          incorporateWoAndActivities,
          refrainConclusionWoGeneration,
          sendEmailNotification,
          workorderTemplateId,
          fieldMapping,
        } = flaggedEventRule
        this.flaggedEventRuleWoConfig = {
          createWorkorder,
          incorporateWoAndActivities,
          refrainConclusionWoGeneration,
          sendEmailNotification,
          workorderTemplateId,
          fieldMapping,
          autoCreateWorkOrder,
        }
      }
      this.dataDeserialized = true
    },
  },
}
</script>

<style lang="scss">
.wo-create-config {
  .ant-radio-wrapper {
    padding: 0px;
  }
}
</style>
