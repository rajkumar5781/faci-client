import { isEmpty } from '@facilio/utils/validation'

const DURATION_NEEDED_CRITERIA_TYPES = [
  'ALARM_OPEN_FOR_SPECIFIED_DURATION',
  'ALARM_COUNTS_IN_A_PERIOD_OF_TIME_OR_OPEN_FOR_DURATION',
  'NO_ALARM_RECEIVED_FOR_SPECIFIC_PERIOD',
]
const COUNT_NEEDED_CRITERIA_TYPES = [
  'ALARM_COUNTS_IN_A_PERIOD_OF_TIME',
  'ALARM_COUNTS_IN_A_PERIOD_OF_TIME_OR_OPEN_FOR_DURATION',
]

export default {
  isDurationFieldNeeded(criteriaObj) {
    let { filterCriteria } = criteriaObj || {}
    return DURATION_NEEDED_CRITERIA_TYPES.includes(filterCriteria)
  },
  isAlarmCountFieldNeeded(criteriaObj) {
    let { filterCriteria } = criteriaObj || {}
    return COUNT_NEEDED_CRITERIA_TYPES.includes(filterCriteria)
  },
  isCountPeriodNeeded(criteriaObj) {
    let { filterCriteria } = criteriaObj || {}
    return COUNT_NEEDED_CRITERIA_TYPES.includes(filterCriteria)
  },
  isClearPeriodNeeded(criteriaObj, alarmApproach) {
    let { filterCriteria } = criteriaObj || {}
    return (
      alarmApproach === 1 &&
      !isEmpty(filterCriteria) &&
      filterCriteria !== 'NO_ALARM_RECEIVED_FOR_SPECIFIC_PERIOD'
    )
  },
}
