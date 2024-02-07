<template>
  <FContainer gap="containerXLarge" display="flex" flexDirection="column">
    <FContainer gap="containerMedium" display="flex" flexDirection="column">
      <FText appearance="captionReg12" color="textMain">
        {{ $t('faultToWorkorder.dateField', 'Date Fields', { ns: 'rule' }) }}
      </FText>
      <FSelect
        v-model="scheduleObj.dateFieldId"
        placeholder="Select"
        :options="filteredDateFields"
        size="large"
      >
      </FSelect>
    </FContainer>
    <FContainer gap="containerMedium" display="flex" flexDirection="column">
      <FText appearance="captionReg12" color="textMain">
        {{
          $t('faultToWorkorder.scheduled_type', 'Scheduled Type', {
            ns: 'rule',
          })
        }}
      </FText>
      <FContainer>
        <FRadioGroup
          alignment="horizontal"
          v-model="scheduleObj.scheduleType"
          :options="buttonOptions"
        />
      </FContainer>
    </FContainer>
    <FContainer v-if="[1, 3].includes(parseInt(scheduleObj.scheduleType))">
      <FContainer display="flex" gap="containerXLarge">
        <FContainer float="left" width="216px">
          <FSelect
            v-model="scheduleObj.dateObject.days"
            clearable
            placeholder="Select Days"
            :options="daysOptions"
            size="large"
          >
          </FSelect>
        </FContainer>

        <FContainer v-if="checkDateTimeField" float="left" width="216px">
          <FContainer>
            <FSelect
              v-model="scheduleObj.dateObject.hours"
              clearable
              placeholder="Select Hours"
              :options="hoursList"
              size="large"
            >
            </FSelect>
          </FContainer>
        </FContainer>
        <FContainer
          v-if="checkDateTimeField"
          float="left"
          marginRight="containerXxLarge"
          width="30%"
        >
          <FContainer>
            <FSelect
              v-model="scheduleObj.dateObject.minute"
              clearable
              placeholder="Select Minutes"
              :options="minutesList"
              size="large"
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FFormItem,
  FButton,
  FSelect,
  FRow,
  FCol,
  FRadioGroup,
  FText,
} from '@facilio/design-system'
import Constants from '../../../utils/constants'
import { dset as setProperty } from 'dset'
import { isDateTimeField } from '@facilio/utils/field'
import { isEmpty } from '@facilio/utils/validation'
export default {
  components: {
    FContainer,
    FFormItem,
    FButton,
    FSelect,
    FRow,
    FCol,
    FRadioGroup,
    FText,
  },
  props: ['moduleFields', 'workflowRule', 'isEdit'],
  data() {
    return {
      dateFieldToExclude: [
        'sysCreatedTime',
        'sysModifiedTime',
        'sysDeletedTime',
      ],
      beforeDateFieldsToExclude: ['createdTime', 'modifiedTime'],
      dateFieldName: ['DATE', 'DATE_TIME'],
      metaInfo: {},
      scheduleObj: {
        time: null,
        scheduleType: 3,
        dateFieldId: null,
        dateObject: {
          days: null,
          minu: null,
          minute: 0,
          hours: 0,
        },
      },
    }
  },
  watch: {
    scheduleObj: {
      handler: function (newVal, oldVal) {
        this.dateField(newVal)
      },
      deep: true,
    },
  },
  created() {
    let { isEdit } = this
    if (isEdit) {
      let { workflowRule } = this
      let { interval } = workflowRule || {}
      let dateFieldId = this.dateFieldsCheck(workflowRule, interval)
      setProperty(this, 'scheduleObj.dateFieldId', dateFieldId)
      setProperty(this, 'scheduleObj.scheduleType', workflowRule.scheduleType)
      this.dateField(this.scheduleObj)
    }
  },
  computed: {
    daysOptions() {
      let options = []
      for (let step = 1; step < 60; step++) {
        options.push({ value: step, label: step })
      }
      return options
    },
    buttonOptions() {
      let options = [
        {
          label: 'Before',
          value: 1,
        },
        {
          label: 'On',
          value: 2,
        },
        {
          label: 'After',
          value: 3,
        },
      ]
      return options
    },
    hoursList() {
      let hour = []
      Constants.HOURS.forEach(m => {
        if (m > 0) {
          hour.push({ label: m, value: m })
        }
      })
      return hour
    },
    minutesList() {
      let minute = []
      Constants.MINUTES.forEach(m => {
        if (m > 0) {
          minute.push({ value: m, label: m })
        }
      })
      return minute
    },
    checkDateTimeField() {
      let { dateFields, scheduleObj } = this
      let { dateFieldId } = scheduleObj || {}
      let field =
        (dateFields || []).find(fld => fld.fieldId === dateFieldId) || {}

      return !isEmpty(field) ? isDateTimeField(field) : false
    },

    filteredDateFields() {
      let fields = [...this.dateFieldToExclude]
      if (this.scheduleType === 1) {
        fields = [...fields, ...this.beforeDateFieldsToExclude]
      }
      return (this.dateFields || [])
        .filter(field => !fields.includes(field.name))
        .map(field => ({
          label: field.displayName,
          id: field.id,
          value: field.id,
        }))
    },
    dateFields() {
      let { moduleFields, dateFieldName } = this
      return (moduleFields || []).filter(d =>
        (dateFieldName || []).includes(d.dataTypeEnum._name)
      )
    },
    beforeFieldIds() {
      return (this.dateFields || [])
        .filter(field =>
          (this.beforeDateFieldsToExclude || []).includes(field.name)
        )
        .map(field => field.id)
    },
  },
  methods: {
    dateFieldsCheck(rule, dateObj) {
      let { event, dateFieldId, scheduleType } = rule || {}
      let { activityType } = event || {}
      if (activityType === 524288 && !isEmpty(dateFieldId)) {
        if (dateObj && [1, 3].includes(parseInt(scheduleType))) {
          let dateObject = this.secTodaysHoursMinu(dateObj)
          this.scheduleObj.dateObject = {
            ...dateObject,
          }
        }
        return rule.dateFieldId
      }
      return null
    },
    dateField(scheduleObj) {
      this.scheduleObj['checkDateTimeField'] = this.checkDateTimeField
      this.$emit('schedulerFields', scheduleObj)
    },
    secTodaysHoursMinu(second) {
      let dateObject = {}

      let seconds = parseInt(second, 10)
      let days = Math.floor(seconds / 86400)
      seconds -= days * 86400
      let hrs = Math.floor(seconds / 3600)
      seconds -= hrs * 3600
      let mnts = Math.floor(seconds / 60)
      seconds -= mnts * 60

      dateObject.days = days > 0 ? days : null
      dateObject.hours = hrs
      dateObject.minute = mnts
      dateObject.seconds = seconds > 0 ? seconds : 0

      return dateObject
    },
  },
}
</script>
