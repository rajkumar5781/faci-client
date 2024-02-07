<template>
  <FContainer
    display="flex"
    flexDirection="column"
    padding="containerXLarge containerXxLarge"
  >
    <FContainer
      height="100%"
      borderBottom="1px solid"
      borderColor="borderNeutralBaseSubtler"
      paddingBottom="containerLarge"
    >
      <RuleAlarmInsightSection
        :title="
          $t('create.no_of_faults', 'No Of Faults', {
            ns: 'rule',
          })
        "
        :value="stats.noOfOccurrence"
        :tillLastMonthValue="stats.noOfOccurrenceTillLstMnt"
        :percentage="noOfOccurrencePercentage"
      />
    </FContainer>
    <FContainer
      height="100%"
      borderBottom="1px solid"
      borderColor="borderNeutralBaseSubtler"
      paddingTop="containerLarge"
      paddingBottom="containerLarge"
    >
      <RuleAlarmInsightSection
        :title="
          $t('create.mean_time_clear', 'Mean time to Clear', {
            ns: 'rule',
          })
        "
        :value="stats.mttc"
        :tillLastMonthValue="stats.pmttc"
      />
    </FContainer>
    <FContainer height="100%" paddingTop="containerLarge">
      <RuleAlarmInsightSection
        :widgetHeight="widgetHeight"
        :title="
          $t('create.mean_time_ack', 'Mean time taken to Acknowledge', {
            ns: 'rule',
          })
        "
        :value="stats.acknowledgedDuration"
        :tillLastMonthValue="stats.tillLstMntAcknowledgedDuration"
      />
    </FContainer>
  </FContainer>
</template>

<script>
import moment from 'moment-timezone'
import { isEmpty } from '@facilio/utils/validation'
import { getWorkFlowResult } from './util.js'
import { FContainer } from '@facilio/design-system'
import RuleAlarmInsightSection from './RuleAlarmInsightSection.vue'
export default {
  components: {
    FContainer,
    RuleAlarmInsightSection,
  },
  props: ['details', 'widget'],
  computed: {
    widgetHeight() {
      let { widget } = this
      let { h } = widget || {}
      return h / 3 + 'px'
    },
    stats() {
      if (isEmpty(this.values)) {
        return {
          mtbt: '00:00 Hrs',
          pmtbt: '00:00 Hrs',
          mttc: '00:00 Hrs',
          pmttc: '00:00 Hrs',
          timeToClear: '00:00 Hrs',
          previousMonthTimeToClear: '00:00 Hrs',
          acknowledgedDuration: '00:00 Hrs',
          tillLstMntAcknowledgedDuration: '00:00 Hrs',
          noOfOccurrence: '--',
          noOfOccurrenceTillLstMnt: '--',
          percentage: 0,
          increased: false,
        }
      } else {
        return Object.entries(this.values).reduce((result, [key, value]) => {
          if (key === 'noOfOccurrence' || key === 'noOfOccurrenceTillLstMnt') {
            if (value > 1) {
              result[key] = `${value} Faults`
            } else if (value === 0) {
              result[key] = `${value} Fault`
            } else {
              result[key] = `No alarm`
            }
          } else {
            result[key] = this.getFormattedDuration(value, 'milliseconds')
          }
          return result
        }, {})
      }
    },
    ruleId() {
      let { details } = this
      let { moduleName } = details
      let ruleId = null
      if (moduleName === 'newreadingrules') {
        let { id } = details || {}
        ruleId = id
      } else {
        let { preRequsite: { id } = {} } = details || {}
        ruleId = id
      }
      return ruleId
    },
  },
  data() {
    return {
      values: null,
      meanTimeBWFailure: null,
      noOfOccurrencePercentage: null,
    }
  },
  mounted() {
    this.loadInsightsDetails()
  },
  methods: {
    calculatePercentages() {
      let { values } = this

      let { noOfOccurrenceTillLstMnt, noOfOccurrence } = values || {}
      this.noOfOccurrencePercentage =
        isEmpty(noOfOccurrenceTillLstMnt) || isEmpty(noOfOccurrence)
          ? 0
          : this.percent(noOfOccurrenceTillLstMnt, noOfOccurrence)
    },
    percent(prevData, currData) {
      if (prevData === 0) {
        return 0
      }
      let percentage =
        (100 * (parseFloat(currData) - parseFloat(prevData))) /
        parseFloat(prevData)
      return percentage
    },
    loadInsightsDetails() {
      let workFlowId

      let { ruleId } = this
      getWorkFlowResult('ruleAlarmInsight', ruleId ? ruleId : null).then(d => {
        this.values = d
        this.calculatePercentages()
      })
    },
    getTrendClasses(durationA, durationB) {
      if (durationA === 0 && durationB === 0) return 'hide'
      return durationA - durationB ? 'fill-green' : 'fill-red rotate-bottom'
    },
    getFormattedDuration(value, format) {
      if (!value) return '00:00 Hrs'

      let duration = moment.duration(parseInt(value, 10), format)
      let days = parseInt(duration.asDays(), 10)
      let hours = duration.hours()
      let minutes = duration.minutes()
      let seconds = duration.seconds()

      const pad = val => String(val).padStart(2, '0')

      if (days > 0) {
        return hours
          ? `${pad(days)} Days ${pad(hours)} Hrs`
          : `${pad(days)} Days`
      } else if (hours > 0) {
        return minutes
          ? `${pad(hours)} Hrs ${pad(minutes)} Mins`
          : `${pad(hours)} Hrs`
      } else if (minutes > 0) {
        return `${pad(minutes)}:${pad(seconds)} Mins`
      } else {
        return `${pad(seconds)} Secs`
      }
    },
  },
}
</script>

<style scoped></style>
