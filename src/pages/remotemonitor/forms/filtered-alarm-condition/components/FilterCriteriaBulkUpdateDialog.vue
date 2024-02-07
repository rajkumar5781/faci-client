<template>
  <FModal
    :visible="true"
    :title="$t('apply_criteria', { ns: 'remote_monitor' })"
    :saveText="$t('apply_to_selected', { ns: 'remote_monitor' })"
    size="S"
    :hideFooter="false"
    type="default"
    @ok="handleOk"
    @cancel="handleCancel"
    padding="containerNone"
    class="bulk-criteria-update-form"
  >
    <FContainer v-if="!loading" padding="containerXxLarge sectionSmall">
      <FForm
        ref="criteria-bulk-update-dialog-form"
        :model="criteriaObj"
        position="top"
        :rules="formRules"
        uniqueId="criteria-bulk-update-form"
      >
        <template v-if="!isControllerOffline">
          <FContainer>
            <FFormItem
              prop="bulkFilterCriteria"
              :label="
                $t('field_names.criteria_type', {
                  ns: 'remote_monitor',
                })
              "
            >
              <FSelect
                v-model="criteriaObj.bulkFilterCriteria"
                :placeholder="
                  $t('alarm_filter_rule.select_filter_type', {
                    ns: 'remote_monitor',
                  })
                "
                :options="criteriaTypeOptionsList"
                size="medium"
              />
            </FFormItem>
          </FContainer>
          <FDivider
            v-if="canShowDivider"
            width="100%"
            backgroundColor="backgroundMidgroundDark"
            margin="containerXxLarge containerNone"
          />
        </template>
        <FContainer display="flex" flexWrap="wrap" gap="containerXxLarge">
          <FContainer v-if="isDurationFieldNeeded" width="48%">
            <FFormItem
              prop="bulkAlarmDuration"
              :label="
                $t('field_names.duration', {
                  ns: 'remote_monitor',
                })
              "
            >
              <DurationTag
                v-model="criteriaObj.bulkAlarmDuration"
                placeholder="DD:HH:MM"
                size="medium"
              />
            </FFormItem>
          </FContainer>
          <FContainer v-if="isAlarmCountFieldNeeded" width="48%">
            <FFormItem
              prop="bulkAlarmCount"
              :label="
                $t('field_names.alarm_count', {
                  ns: 'remote_monitor',
                })
              "
            >
              <FInput
                v-model="criteriaObj.bulkAlarmCount"
                :placeholder="
                  $t('alarm_filter_rule.enter_alarm_count', {
                    ns: 'remote_monitor',
                  })
                "
                size="medium"
              >
              </FInput>
            </FFormItem>
          </FContainer>
          <FContainer v-if="isCountPeriodNeeded" width="48%">
            <FFormItem
              prop="bulkAlarmCountPeriod"
              :label="
                $t('field_names.count_period', {
                  ns: 'remote_monitor',
                })
              "
            >
              <DurationTag
                v-model="criteriaObj.bulkAlarmCountPeriod"
                placeholder="DD:HH:MM"
                size="medium"
              />
            </FFormItem>
          </FContainer>
          <FContainer v-if="isClearPeriodNeeded" width="48%">
            <FFormItem
              prop="bulkAlarmClearPeriod"
              :label="
                $t('field_names.clear_period', {
                  ns: 'remote_monitor',
                })
              "
            >
              <DurationTag
                v-model="criteriaObj.bulkAlarmClearPeriod"
                placeholder="DD:HH:MM"
                size="medium"
              />
            </FFormItem>
          </FContainer>
        </FContainer>

        <FContainer v-if="isControllerOffline" marginTop="containerXxLarge">
          <FFormItem
            prop="bulkAlarmMessage"
            :label="
              $t('field_names.message', {
                ns: 'remote_monitor',
              })
            "
          >
            <FInput
              v-model="criteriaObj.bulkAlarmMessage"
              :placeholder="
                $t('alarm_filter_rule.enter_alarm_message', {
                  ns: 'remote_monitor',
                })
              "
              size="medium"
            />
          </FFormItem>
        </FContainer>
      </FForm>
    </FContainer>
  </FModal>
</template>

<script>
import rmHelpers from '../utils/rmHelpers'
import { isEmpty } from '@facilio/utils/validation'
import DurationTag from './DurationTag.vue'
import {
  FForm,
  FFormItem,
  FContainer,
  FModal,
  FInput,
  FDivider,
  FDropdown,
  FTags,
  FText,
  FSelect,
} from '@facilio/design-system'
export default {
  components: {
    FForm,
    FFormItem,
    FContainer,
    FModal,
    FInput,
    FDivider,
    FDropdown,
    FTags,
    DurationTag,
    FText,
    FSelect,
  },
  props: ['criteriaTypeOptionsList', 'alarmApproach', 'ruleType'],
  data() {
    return {
      criteriaObj: {
        bulkFilterCriteria: null,
        bulkAlarmDuration: [],
        bulkAlarmCount: null,
        bulkAlarmCountPeriod: [],
        bulkAlarmClearPeriod: [],
        bulkAlarmMessage: null,
      },
      formRules: {
        bulkFilterCriteria: {
          trigger: 'change',
          validator: value => {
            let { criteriaWithOriginalKey = {} } = this
            let { filterCriteria } = criteriaWithOriginalKey
            value = filterCriteria
            if (isEmpty(value)) {
              return {
                errorMessage: this.$t(
                  'alarm_filter_rule.please_select_criteria_type',
                  {
                    ns: 'remote_monitor',
                  }
                ),
                invalid: true,
              }
            }
          },
        },
        bulkAlarmDuration: {
          trigger: 'change',
          validator: value => {
            let { criteriaWithOriginalKey = {}, isDurationFieldNeeded } = this
            let { alarmDuration } = criteriaWithOriginalKey
            value = alarmDuration
            if (isDurationFieldNeeded)
              if (isEmpty(value)) {
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
        bulkAlarmCount: {
          trigger: 'blur',
          validator: value => {
            let { criteriaWithOriginalKey = {}, isAlarmCountFieldNeeded } = this
            let { alarmCount } = criteriaWithOriginalKey
            value = alarmCount
            if (isAlarmCountFieldNeeded)
              if (isEmpty(value)) {
                return {
                  errorMessage: this.$t('alarm_filter_rule.enter_alarm_count', {
                    ns: 'remote_monitor',
                  }),
                  invalid: true,
                }
              }
          },
        },
        bulkAlarmCountPeriod: {
          trigger: 'change',
          validator: value => {
            let { criteriaWithOriginalKey = {}, isCountPeriodNeeded } = this
            let { alarmCountPeriod } = criteriaWithOriginalKey
            value = alarmCountPeriod
            if (isCountPeriodNeeded)
              if (isEmpty(value)) {
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
        bulkAlarmClearPeriod: {
          trigger: 'change',
          validator: value => {
            let { criteriaWithOriginalKey = {}, isClearPeriodNeeded } = this
            let { alarmClearPeriod } = criteriaWithOriginalKey
            value = alarmClearPeriod
            if (isClearPeriodNeeded)
              if (isEmpty(value)) {
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
        bulkAlarmMessage: {
          trigger: 'change',
          validator: value => {
            let { isControllerOffline } = this
            if (isControllerOffline) {
              if (isEmpty(value)) {
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
      rmHelpers: {},
      loading: false,
    }
  },
  computed: {
    criteriaWithOriginalKey() {
      let { criteriaObj } = this
      let {
        bulkFilterCriteria: filterCriteria,
        bulkAlarmDuration: alarmDuration,
        bulkAlarmCount: alarmCount,
        bulkAlarmCountPeriod: alarmCountPeriod,
        bulkAlarmClearPeriod: alarmClearPeriod,
        bulkAlarmMessage: message,
      } = criteriaObj
      criteriaObj = {
        ...criteriaObj,
        filterCriteria,
        alarmDuration,
        alarmCount,
        alarmCountPeriod,
        alarmClearPeriod,
        message,
      }
      return criteriaObj
    },
    isControllerOffline() {
      let { ruleType } = this
      return ruleType === 'CONTROLLER_OFFLINE'
    },
    canShowDivider() {
      let { criteriaObj = {} } = this
      let { bulkFilterCriteria } = criteriaObj
      return !isEmpty(bulkFilterCriteria)
    },
    isDurationFieldNeeded() {
      let { criteriaWithOriginalKey } = this
      let isDurationFieldNeeded = this.rmHelpers.isDurationFieldNeeded(
        criteriaWithOriginalKey
      )
      return isDurationFieldNeeded
    },
    isAlarmCountFieldNeeded() {
      let { criteriaWithOriginalKey } = this
      let isAlarmCountFieldNeeded = this.rmHelpers.isAlarmCountFieldNeeded(
        criteriaWithOriginalKey
      )
      return isAlarmCountFieldNeeded
    },
    isCountPeriodNeeded() {
      let { criteriaWithOriginalKey } = this
      let isCountPeriodNeeded = this.rmHelpers.isCountPeriodNeeded(
        criteriaWithOriginalKey
      )
      return isCountPeriodNeeded
    },
    isClearPeriodNeeded() {
      let { criteriaWithOriginalKey, alarmApproach } = this
      let isClearPeriodNeeded = this.rmHelpers.isClearPeriodNeeded(
        criteriaWithOriginalKey,
        alarmApproach
      )
      return isClearPeriodNeeded
    },
  },
  created() {
    this.loading = true
    this.rmHelpers = rmHelpers
    let { isControllerOffline } = this
    if (isControllerOffline) {
      this.criteriaObj.bulkFilterCriteria =
        'NO_ALARM_RECEIVED_FOR_SPECIFIC_PERIOD'
    }
    this.loading = false
  },
  methods: {
    isEmpty,
    handleOk() {
      if (this.$refs['criteria-bulk-update-dialog-form'].validate()) {
        let { criteriaWithOriginalKey } = this
        this.$emit('bulkUpdateCriteria', criteriaWithOriginalKey)
      }
    },
    handleCancel() {
      this.$emit('closeBulkUpdateDialog')
    },
  },
}
</script>
<style lang="scss" scoped>
.bulk-criteria-update-form {
  .filter-type-tag {
    width: 270px;
    display: flex;
    justify-content: space-between;
  }
}
</style>
