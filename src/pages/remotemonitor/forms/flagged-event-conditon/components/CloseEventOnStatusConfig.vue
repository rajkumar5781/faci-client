<template>
  <FContainer v-if="loading"></FContainer>
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
    <FContainer display="flex" flexDirection="column" rowGap="containerMedium">
      <FContainer
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <FContainer display="flex" alignItems="center">
          <FText appearance="headingMed14" color="textMain">
            {{
              $t('flagged_event_rule.flagged_alarm_auto_closure', {
                ns: 'remote_monitor',
              })
            }}
          </FText>
        </FContainer>
        <FSwitch v-model="flaggedEventAutoClosure" size="small" />
      </FContainer>
      <FContainer v-if="canShowErrorMessage" display="flex" alignItems="center">
        <FIcon
          group="alert"
          name="critical-filled"
          size="14"
          color="textSemanticRed"
          :pressable="false"
        />
        <FText appearance="captionReg12" color="textSemanticRed">
          {{
            $t('flagged_event_rule.slect_atleast_one_criterion', {
              ns: 'remote_monitor',
            })
          }}
        </FText>
      </FContainer>
    </FContainer>

    <FContainer
      v-if="flaggedEventAutoClosure"
      borderRadius="high"
      backgroundColor="backgroundMidgroundSubtle"
      padding="sectionSmall"
    >
      <FForm
        :model="closeOnStatusConfig"
        uniqueId="close-event-on-status-form"
        class="flex flex-col gap-y-6"
      >
        <FFormItem
          :label="
            $t('field_names.flagged_alarm_status', { ns: 'remote_monitor' })
          "
          prop="selectedFlaggedEventStatusList"
        >
          <FSelect
            v-model="closeOnStatusConfig.flaggedEventStatuses"
            :placeholder="`${$t('actions.select')} ${$t(
              'field_names.flagged_alarm_status',
              { ns: 'remote_monitor' }
            )}`"
            :multiple="true"
            :options="flaggedEventStatusOptions"
          />
        </FFormItem>
        <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
        <FFormItem
          :label="$t('field_names.workorder_status', { ns: 'remote_monitor' })"
          prop="selectedWoStatusList"
        >
          <FSelect
            v-model="closeOnStatusConfig.workorderStatuses"
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
          :label="$t('field_names.time_criteria', { ns: 'remote_monitor' })"
          prop="timeCriteriaForEventClose"
        >
          <FTimePicker
            v-model="closeOnStatusConfig.autoClosureDuration"
            :selectableRange="selectableRange"
            placeholder="HH:MM"
          />
        </FFormItem>
        <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
        <FFormItem prop="autoCloseOnClear">
          <FContainer display="flex" alignItems="center">
            <FContainer width="16px" marginRight="containerLarge">
              <FCheckbox v-model="closeOnStatusConfig.autoCloseOnClear" />
            </FContainer>
            <FText appearance="bodyReg14" color="textDefault">
              {{
                $t('flagged_event_rule.auto_close_on_filtered_alarm_clear', {
                  ns: 'remote_monitor',
                })
              }}
            </FText>
          </FContainer>
        </FFormItem>
      </FForm>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FForm,
  FFormItem,
  FContainer,
  FText,
  FSwitch,
  FSelect,
  FDivider,
  FTimePicker,
  FIcon,
  FCheckbox,
} from '@facilio/design-system'
import {
  loadModuleMeta,
  constructSelectOptionList,
} from '../../utils/rmHelpers'
import { isEmpty } from '@facilio/utils/validation'
import every from 'lodash/every'
import getProperty from 'dlv'
import { API } from '@facilio/api'

export default {
  components: {
    FForm,
    FFormItem,
    FContainer,
    FText,
    FSwitch,
    FSelect,
    FDivider,
    FTimePicker,
    FIcon,
    FCheckbox,
  },
  props: [
    'isNew',
    'flaggedEventRuleClosureConfig',
    'woStausOptions',
    'ticketModuleName',
  ],
  data() {
    return {
      loading: false,
      selectableRange: { from: 300000, to: null },
      closeOnStatusConfig: {
        flaggedEventStatuses: null,
        workorderStatuses: null,
        autoClosureDuration: null,
        autoCloseOnClear: false,
      },
      flaggedEventStatusOptions: [],
      flaggedEventAutoClosure: false,
      canShowErrorMessage: false,
    }
  },
  computed: {
    flaggedEventStatuses() {
      let flaggedEventStatuses = getProperty(
        this,
        'closeOnStatusConfig.flaggedEventStatuses',
        null
      )
      return flaggedEventStatuses
    },
    workorderStatuses() {
      let workorderStatuses = getProperty(
        this,
        'closeOnStatusConfig.workorderStatuses',
        null
      )
      return workorderStatuses
    },
    autoClosureDuration() {
      let autoClosureDuration = getProperty(
        this,
        'closeOnStatusConfig.autoClosureDuration',
        null
      )
      return autoClosureDuration
    },
    autoCloseOnClear() {
      let autoCloseOnClear = getProperty(
        this,
        'closeOnStatusConfig.autoCloseOnClear',
        false
      )
      return autoCloseOnClear
    },
  },
  watch: {
    flaggedEventAutoClosure(newVal) {
      if (!newVal) {
        this.closeOnStatusConfig = {
          flaggedEventStatuses: null,
          workorderStatuses: null,
          autoClosureDuration: null,
        }
      }
    },
    flaggedEventStatuses(newVal, oldVal) {
      this.handleFormFieldsChange(newVal, oldVal)
    },
    workorderStatuses(newVal, oldVal) {
      this.handleFormFieldsChange(newVal, oldVal)
    },
    autoClosureDuration(newVal, oldVal) {
      this.handleFormFieldsChange(newVal, oldVal)
    },
    autoCloseOnClear(newVal, oldVal) {
      this.handleFormFieldsChange(newVal, oldVal)
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.loading = true
      await this.setFlaggedEventStatusOptions()
      this.deserializeData()
      this.loading = false
    },
    getSerializedData() {
      let { flaggedEventAutoClosure, closeOnStatusConfig, ticketModuleName } =
        this
      if (flaggedEventAutoClosure) {
        let {
          flaggedEventStatuses,
          workorderStatuses,
          autoClosureDuration,
          autoCloseOnClear,
        } = closeOnStatusConfig
        if (flaggedEventAutoClosure) {
          if (this.isAllKeysOfObjectEmpty(closeOnStatusConfig)) {
            this.canShowErrorMessage = true
            return { invalid: true }
          } else {
            workorderStatuses = (workorderStatuses || []).map(woStatus => {
              return { id: woStatus }
            })
            autoClosureDuration =
              autoClosureDuration <= 0 ? null : autoClosureDuration
            let ticketModuleStatusObj = { workorderStatuses }
            if (ticketModuleName === 'serviceOrder') {
              ticketModuleStatusObj = {
                serviceOrderStatuses: workorderStatuses,
              }
            }

            return {
              flaggedEventStatuses,
              ...ticketModuleStatusObj,
              autoClosureDuration,
              autoCloseOnClear,
            }
          }
        }
      }
      return {
        flaggedEventStatuses: null,
        workorderStatuses: null,
        serviceOrderStatuses: null,
        autoClosureDuration: null,
      }
    },
    deserializeData() {
      let { isNew, flaggedEventRuleClosureConfig = {}, ticketModuleName } = this
      if (!isNew) {
        let {
          flaggedEventStatuses,
          workorderStatuses = [],
          serviceOrderStatuses = [],
          autoClosureDuration = [],
          autoCloseOnClear = false,
        } = flaggedEventRuleClosureConfig
        if (
          !isEmpty(flaggedEventStatuses) ||
          !isEmpty(workorderStatuses) ||
          !isEmpty(autoClosureDuration) ||
          !isEmpty(serviceOrderStatuses) ||
          autoCloseOnClear
        ) {
          this.flaggedEventAutoClosure = true
        }

        workorderStatuses = workorderStatuses.map(workorderStatus => {
          return `${workorderStatus?.id}`
        })
        if (ticketModuleName === 'serviceOrder') {
          workorderStatuses = serviceOrderStatuses.map(serviceOrderStatus => {
            return `${serviceOrderStatus?.id}`
          })
        }
        this.closeOnStatusConfig = {
          flaggedEventStatuses,
          workorderStatuses,
          autoClosureDuration,
          autoCloseOnClear,
        }
      }
    },
    async setFlaggedEventStatusOptions() {
      let { data = {}, error } = await API.get(
        '/v3/flaggedAlarmProcess/flaggedAlarm/statusOptions'
      )
      if (isEmpty(error)) {
        let { flaggedAlarmStatuses = [] } = data
        let filteredOptions = flaggedAlarmStatuses.filter((statusObj = {}) => {
          let { value } = statusObj
          return value !== 'AUTO_CLOSED'
        })
        this.flaggedEventStatusOptions = filteredOptions
      }
    },
    handleFormFieldsChange(newVal, oldVal) {
      let { closeOnStatusConfig, flaggedEventAutoClosure } = this
      if (flaggedEventAutoClosure) {
        if (!isEmpty(oldVal)) {
          this.canShowErrorMessage =
            this.isAllKeysOfObjectEmpty(closeOnStatusConfig)
        } else if (!isEmpty(newVal)) {
          this.canShowErrorMessage = false
        }
      } else {
        this.canShowErrorMessage = false
      }
    },
    isAllKeysOfObjectEmpty(obj) {
      const allValuesEmpty = every(obj, isEmpty)
      return allValuesEmpty
    },
  },
}
</script>
