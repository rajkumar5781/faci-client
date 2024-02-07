<template>
  <FContainer
    v-if="loading"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <FSpinner :size="30"></FSpinner>
  </FContainer>
  <FContainer
    v-else
    display="flex"
    flexDirection="column"
    rowGap="sectionSmall"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="sectionXSmall sectionSmall"
  >
    <FContainer
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <FText appearance="headingMed14" color="textMain">
        {{
          $t('flagged_event_rule.wo_close_command_description', {
            ns: 'remote_monitor',
          })
        }}
      </FText>
      <FSwitch
        v-model="closeWoOnFlaggedEventCloseConfig.sendWorkorderCloseCommand"
        size="small"
      />
    </FContainer>
    <FContainer
      v-if="closeWoOnFlaggedEventCloseConfig.sendWorkorderCloseCommand"
      borderRadius="high"
      backgroundColor="backgroundMidgroundSubtle"
      padding="sectionSmall"
    >
      <FForm
        ref="wo-close-config-form"
        uniqueId="wo-close-config-form"
        :model="closeWoOnFlaggedEventCloseConfig"
        :rules="formRules"
        class="flex flex-col gap-y-6"
      >
        <FFormItem
          :label="
            $t('flagged_event_rule.wo_status_as_criteria', {
              ns: 'remote_monitor',
            })
          "
          prop="workorderCloseCommandCriteria"
        >
          <FSelect
            v-model="
              closeWoOnFlaggedEventCloseConfig.workorderCloseCommandCriteria
            "
            :placeholder="`${$t('actions.select')} ${$t(
              'field_names.workorder_status',
              { ns: 'remote_monitor' }
            )}`"
            :multiple="true"
            :options="woStausOptions"
          />
        </FFormItem>
        <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
        <FFormItem
          :label="
            $t('flagged_event_rule.wo_status_to_set', { ns: 'remote_monitor' })
          "
          prop="workorderCloseStatus"
        >
          <FSelect
            v-model="closeWoOnFlaggedEventCloseConfig.workorderCloseStatus"
            :placeholder="`${$t('actions.select')} ${$t(
              'field_names.workorder_status',
              { ns: 'remote_monitor' }
            )}`"
            :options="woCloseStausOptions"
          />
        </FFormItem>
      </FForm>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FForm,
  FFormItem,
  FCheckbox,
  FText,
  FSelect,
  FDivider,
  FSwitch,
  FSpinner,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
export default {
  components: {
    FContainer,
    FForm,
    FFormItem,
    FCheckbox,
    FText,
    FSelect,
    FDivider,
    FSwitch,
    FSpinner,
  },
  props: [
    'isNew',
    'flaggedEventRuleClosureConfig',
    'woStausOptions',
    'woCloseStausOptions',
    'ticketModuleName',
  ],
  data() {
    return {
      loading: false,
      closeWoOnFlaggedEventCloseConfig: {
        sendWorkorderCloseCommand: false,
        workorderCloseCommandCriteria: null,
        workorderCloseStatus: null,
      },
      formRules: {
        workorderCloseCommandCriteria: {
          trigger: 'change',
          required: true,
          message: `${this.$t('field_names.wo_status_as_criteria', {
            ns: 'remote_monitor',
          })} ${this.$t('cant_be_empty', { ns: 'remote_monitor' })}`,
        },
        workorderCloseStatus: {
          trigger: 'change',
          required: true,
          message: `${this.$t('field_names.wo_status_to_set', {
            ns: 'remote_monitor',
          })} ${this.$t('cant_be_empty', { ns: 'remote_monitor' })}`,
        },
      },
    }
  },
  computed: {
    sendWorkorderCloseCommand() {
      let sendWorkorderCloseCommand = getProperty(
        this,
        'closeWoOnFlaggedEventCloseConfig.sendWorkorderCloseCommand',
        false
      )
      return sendWorkorderCloseCommand
    },
  },
  watch: {
    sendWorkorderCloseCommand(newVal) {
      if (!newVal) {
        this.closeWoOnFlaggedEventCloseConfig = {
          sendWorkorderCloseCommand: false,
          workorderCloseCommandCriteria: [],
          workorderCloseStatus: null,
        }
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
      let { closeWoOnFlaggedEventCloseConfig = {}, ticketModuleName } = this
      let {
        sendWorkorderCloseCommand,
        workorderCloseCommandCriteria,
        workorderCloseStatus,
      } = closeWoOnFlaggedEventCloseConfig
      if (sendWorkorderCloseCommand) {
        let woCloseConfigForm = getProperty(
          this,
          '$refs.wo-close-config-form',
          {}
        )
        let isValidData = false
        if (!isEmpty(woCloseConfigForm)) {
          isValidData = woCloseConfigForm.validate()
        }
        if (!isValidData) {
          return { invalid: true }
        } else {
          workorderCloseCommandCriteria = workorderCloseCommandCriteria.map(
            statusId => {
              return { id: statusId }
            }
          )
          workorderCloseStatus = { id: workorderCloseStatus }

          let ticketModuleCloseCommandCriteriaObj = {
            workorderCloseCommandCriteria,
          }
          let ticketModuleCloseStatusObj = { workorderCloseStatus }
          if (ticketModuleName === 'serviceOrder') {
            ticketModuleCloseCommandCriteriaObj = {
              serviceOrderCloseCommandCriteria: workorderCloseCommandCriteria,
            }
            ticketModuleCloseStatusObj = {
              serviceOrderCloseStatus: workorderCloseStatus,
            }
          }
          return {
            sendWorkorderCloseCommand,
            ...ticketModuleCloseCommandCriteriaObj,
            ...ticketModuleCloseStatusObj,
          }
        }
      }
      return {
        sendWorkorderCloseCommand: false,
        workorderCloseCommandCriteria: null,
        serviceOrderCloseCommandCriteria: null,
        workorderCloseStatus: null,
        serviceOrderCloseStatus: null,
      }
    },
    deserializeData() {
      let { isNew, flaggedEventRuleClosureConfig = {}, ticketModuleName } = this
      if (!isNew) {
        let {
          sendWorkorderCloseCommand,
          workorderCloseCommandCriteria = [],
          serviceOrderCloseCommandCriteria = [],
          workorderCloseStatus,
          serviceOrderCloseStatus,
        } = flaggedEventRuleClosureConfig

        workorderCloseCommandCriteria = workorderCloseCommandCriteria.map(
          statusObj => {
            let id = statusObj?.id
            return !isEmpty(id) ? `${id}` : null
          }
        )
        workorderCloseStatus = workorderCloseStatus?.id

        if (ticketModuleName === 'serviceOrder') {
          workorderCloseCommandCriteria = serviceOrderCloseCommandCriteria.map(
            statusObj => {
              let id = statusObj?.id
              return !isEmpty(id) ? `${id}` : null
            }
          )
          workorderCloseStatus = serviceOrderCloseStatus?.id
        }

        this.closeWoOnFlaggedEventCloseConfig = {
          sendWorkorderCloseCommand,
          workorderCloseCommandCriteria,
          workorderCloseStatus,
        }
      }
    },
  },
}
</script>
