<template>
  <FContainer
    display="flex"
    height="auto"
    minHeight="100px"
    padding="containerXLarge"
    borderBottom="1px solid"
    borderColor="borderNeutralGrey02Light"
  >
    <FContainer width="30px">
      <FContainer display="flex" alignItems="center" height="20%">
        <FCheckbox
          v-model="criteriaObj.selected"
          @change="handleRecordSelectionUpdate"
        />
      </FContainer>
    </FContainer>
    <FContainer width="calc(100% - 30px)">
      <FContainer
        height="20%"
        display="flex"
        alignItems="center"
        marginBottom="containerXxLarge"
      >
        <FContainer display="flex" marginRight="sectionLarge">
          <FText>
            {{
              `${$t('field_names.alarm_definition', {
                ns: 'remote_monitor',
              })} :`
            }}
          </FText>
          <FText fontWeight="bold" marginLeft="containerMedium">
            {{ criteriaObj.alarmDefinition.name }}
          </FText>
        </FContainer>
        <FContainer display="flex" marginRight="sectionLarge">
          <FText>
            {{
              `${$t('field_names.controller_type', {
                ns: 'remote_monitor',
              })} :`
            }}
          </FText>
          <FText fontWeight="bold" marginLeft="containerMedium">
            {{ criteriaObj.controllerTypeLabel }}
          </FText>
        </FContainer>
      </FContainer>

      <FForm
        :ref="`alarm-filter-rule-criteria-form-${index}`"
        uniqueId="alarm-filter-rule-criteria-form"
        :model="criteriaObj"
        position="top"
        :rules="formRules"
        class="h-4/5"
      >
        <FContainer height="100%" display="flex" columnGap="containerXxLarge">
          <FContainer v-if="!isControllerOffline" width="35%">
            <FFormItem
              prop="filterCriteria"
              :label="
                $t('field_names.criteria_type', {
                  ns: 'remote_monitor',
                })
              "
            >
              <FSelect
                v-model="criteriaObj.filterCriteria"
                :placeholder="
                  $t('alarm_filter_rule.select_filter_type', {
                    ns: 'remote_monitor',
                  })
                "
                :options="criteriaTypeOptionsList"
                size="small"
              />
            </FFormItem>
          </FContainer>

          <FContainer
            v-if="rmHelpers.isDurationFieldNeeded(criteriaObj)"
            width="15%"
          >
            <FFormItem
              prop="alarmDuration"
              :label="
                $t('field_names.duration', {
                  ns: 'remote_monitor',
                })
              "
            >
              <DurationTag
                v-model="criteriaObj.alarmDuration"
                placeholder="DD:HH:MM"
                size="small"
              />
            </FFormItem>
          </FContainer>

          <FContainer
            v-if="rmHelpers.isAlarmCountFieldNeeded(criteriaObj)"
            width="15%"
          >
            <FFormItem
              prop="alarmCount"
              :label="
                $t('field_names.alarm_count', {
                  ns: 'remote_monitor',
                })
              "
            >
              <FInput
                v-model="criteriaObj.alarmCount"
                :placeholder="
                  $t('alarm_filter_rule.enter_alarm_count', {
                    ns: 'remote_monitor',
                  })
                "
                size="small"
              >
              </FInput>
            </FFormItem>
          </FContainer>

          <FContainer
            v-if="rmHelpers.isCountPeriodNeeded(criteriaObj)"
            width="15%"
          >
            <FFormItem
              prop="alarmCountPeriod"
              :label="
                $t('field_names.count_period', {
                  ns: 'remote_monitor',
                })
              "
            >
              <DurationTag
                v-model="criteriaObj.alarmCountPeriod"
                placeholder="DD:HH:MM"
                size="small"
              />
            </FFormItem>
          </FContainer>
          <FContainer v-if="isControllerOffline" width="40%">
            <FFormItem prop="message">
              <template #header>
                <FContainer
                  display="flex"
                  justifyContent="space-between"
                  marginBottom="containerMedium"
                >
                  <FText appearance="captionReg12" color="textMain">
                    {{
                      $t('field_names.message', {
                        ns: 'remote_monitor',
                      })
                    }}
                  </FText>
                  <FText appearance="captionReg12" color="textCaption">
                    {{ remainingCharaters }}
                  </FText>
                </FContainer>
              </template>
              <FInput
                v-model="criteriaObj.message"
                :placeholder="
                  $t('alarm_filter_rule.enter_alarm_message', {
                    ns: 'remote_monitor',
                  })
                "
                :maxlength="2000"
                size="small"
                :clearable="true"
                :clearValue="clearMessage"
              >
              </FInput>
            </FFormItem>
          </FContainer>
          <template
            v-if="rmHelpers.isClearPeriodNeeded(criteriaObj, alarmApproach)"
          >
            <FDivider height="70%" />
            <FContainer width="15%">
              <FFormItem
                prop="alarmClearPeriod"
                :label="
                  $t('field_names.clear_period', {
                    ns: 'remote_monitor',
                  })
                "
              >
                <DurationTag
                  v-model="criteriaObj.alarmClearPeriod"
                  placeholder="DD:HH:MM"
                  size="small"
                />
              </FFormItem>
            </FContainer>
          </template>
        </FContainer>
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
  FInput,
  FDropdown,
  FTags,
  FSelect,
  FDivider,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import rmHelpers from '../utils/rmHelpers'
import DurationTag from './DurationTag.vue'
import getProperty from 'dlv'

export default {
  name: 'AlarmFilterRuleCriteria',
  props: [
    'criteria',
    'index',
    'criteriaTypeOptionsList',
    'alarmApproach',
    'ruleType',
  ],
  components: {
    FContainer,
    FForm,
    FFormItem,
    FCheckbox,
    FText,
    FInput,
    FDropdown,
    FTags,
    DurationTag,
    FSelect,
    FDivider,
  },
  data() {
    return {
      criteriaObj: {},
      rmHelpers: {},
      formRules: {
        alarmDuration: {
          trigger: 'change',
          validator: value => {
            let { rmHelpers = {}, criteriaObj = {}, isControllerOffline } = this
            let { filterCriteria, alarmDuration, message } = criteriaObj
            value = alarmDuration
            if (isControllerOffline) {
              if (isEmpty(message) && isEmpty(alarmDuration)) {
                return { invalid: false }
              }
            }
            if (
              rmHelpers.isDurationFieldNeeded(criteriaObj) &&
              !isEmpty(filterCriteria)
            )
              if (isEmpty(value) || value <= 0) {
                return {
                  errorMessage: this.$t(
                    'alarm_filter_rule.duration_is_mandatory',
                    { ns: 'remote_monitor' }
                  ),
                  invalid: true,
                }
              }
          },
        },
        alarmCount: {
          trigger: 'blur',
          validator: value => {
            let { rmHelpers = {}, criteriaObj = {} } = this
            let { filterCriteria, alarmCount } = criteriaObj
            value = alarmCount
            if (
              rmHelpers.isAlarmCountFieldNeeded(criteriaObj) &&
              !isEmpty(filterCriteria)
            )
              if (isEmpty(value) || value <= 0) {
                return {
                  errorMessage: this.$t('alarm_filter_rule.enter_alarm_count', {
                    ns: 'remote_monitor',
                  }),
                  invalid: true,
                }
              }
          },
        },
        alarmCountPeriod: {
          trigger: 'change',
          validator: value => {
            let { rmHelpers = {}, criteriaObj = {} } = this
            let { filterCriteria, alarmCountPeriod } = criteriaObj
            value = alarmCountPeriod
            if (
              rmHelpers.isCountPeriodNeeded(criteriaObj) &&
              !isEmpty(filterCriteria)
            )
              if (isEmpty(value) || value <= 0) {
                return {
                  errorMessage: this.$t(
                    'alarm_filter_rule.count_period_is_mandatory',
                    {
                      ns: 'remote_monitor',
                    }
                  ),
                  invalid: true,
                }
              }
          },
        },
        alarmClearPeriod: {
          trigger: 'change',
          validator: value => {
            let { rmHelpers = {}, criteriaObj = {}, alarmApproach } = this
            let { filterCriteria, alarmClearPeriod } = criteriaObj
            value = alarmClearPeriod
            if (
              rmHelpers.isClearPeriodNeeded(criteriaObj, alarmApproach) &&
              !isEmpty(filterCriteria)
            )
              if (isEmpty(value) || value <= 0) {
                return {
                  errorMessage: this.$t(
                    'alarm_filter_rule.clear_period_is_mandatory',
                    {
                      ns: 'remote_monitor',
                    }
                  ),
                  invalid: true,
                }
              }
          },
        },
        message: {
          trigger: 'blur',
          validator: value => {
            let { criteriaObj = {}, isControllerOffline } = this
            let { alarmDuration } = criteriaObj
            if (isControllerOffline) {
              if (!isEmpty(alarmDuration) && isEmpty(value)) {
                return {
                  errorMessage: this.$t(
                    'alarm_filter_rule.message_is_mandatory',
                    {
                      ns: 'remote_monitor',
                    }
                  ),
                  invalid: true,
                }
              }
            }
          },
        },
      },
    }
  },
  computed: {
    isControllerOffline() {
      let { ruleType } = this
      return ruleType === 'CONTROLLER_OFFLINE'
    },
    remainingCharaters() {
      let { criteriaObj = {} } = this
      let { message = '' } = criteriaObj
      let remainingCharaters = 2000
      let wordVariant = 'characters'
      if (!isEmpty(message)) {
        let messageLength = message.length
        remainingCharaters = 2000 - messageLength
        if (remainingCharaters == 1) {
          wordVariant = 'character'
        }
      }
      return `${remainingCharaters} ${wordVariant} remaining `
    },
  },
  watch: {
    //this watcher sets value when getback to visited page
    criteria: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.criteriaObj = newVal
        }
      },
      deep: true,
    },
  },
  created() {
    this.rmHelpers = rmHelpers
    this.criteriaObj = this.criteria
  },
  methods: {
    getSerializedData() {
      let { index, criteriaObj = {}, isControllerOffline } = this
      let { message, alarmDuration } = criteriaObj
      let criteriaForm = getProperty(
        this,
        `$refs.alarm-filter-rule-criteria-form-${index}`,
        {}
      )
      if (isControllerOffline && isEmpty(message) && isEmpty(alarmDuration)) {
        return {}
      }
      if (!isEmpty(criteriaForm)) {
        let valid = criteriaForm.validate()
        if (!valid) {
          return { invalid: true }
        }
      }
      return {}
    },
    handleRecordSelectionUpdate(value) {
      let { index, criteriaObj } = this
      criteriaObj = { ...criteriaObj, index, selected: value }
      this.$emit('recordSelectionUpdate', { criteriaObj, value })
    },
    clearMessage() {
      let { criteriaObj = {}, index } = this
      let criteria = {
        ...criteriaObj,
        message: null,
      }
      this.$emit('updateCriteria', { ...criteria, index })
    },
  },
}
</script>
