import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { constructOptionsToMap } from '@facilio/utils/utility-methods'

const DURATION_NEEDED_CRITERIA_TYPES = [
  'ALARM_OPEN_FOR_SPECIFIED_DURATION',
  'ALARM_COUNTS_IN_A_PERIOD_OF_TIME_OR_OPEN_FOR_DURATION',
  'NO_ALARM_RECEIVED_FOR_SPECIFIC_PERIOD',
]
const COUNT_NEEDED_CRITERIA_TYPES = [
  'ALARM_COUNTS_IN_A_PERIOD_OF_TIME',
  'ALARM_COUNTS_IN_A_PERIOD_OF_TIME_OR_OPEN_FOR_DURATION',
]
const ALARM_APPROACH_ENUM_MAP = {
  REPEAT_UNTIL_RESOLVED: 1,
  RETURN_TO_NORMAL: 2,
}

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
      alarmApproach === ALARM_APPROACH_ENUM_MAP['REPEAT_UNTIL_RESOLVED'] &&
      !isEmpty(filterCriteria) &&
      filterCriteria !== 'NO_ALARM_RECEIVED_FOR_SPECIFIC_PERIOD'
    )
  },
}

export async function loadModuleMeta(moduleName) {
  let url = '/module/meta'
  let params = { moduleName }
  return await API.get(url, params)
}

export function getTimeAsList(time, omitSeconds) {
  if (isEmpty(time)) {
    return []
  }
  let hrs = Math.floor(time / (60 * 60 * 1000))
  time = time % (60 * 60 * 1000)
  let mins = Math.floor(time / (60 * 1000))
  time = time % (60 * 1000)
  let sec = Math.floor(time / 1000)
  if (omitSeconds) {
    return [hrs, mins]
  }
  return [hrs, mins, sec]
}

export function getTimeAsListWithDays(value) {
  if (isEmpty(value)) {
    return value || []
  }
  let days = Math.floor(value / (24 * 60 * 60 * 1000))
  value = value % (24 * 60 * 60 * 1000)
  let hrs = Math.floor(value / (60 * 60 * 1000))
  value = value % (60 * 60 * 1000)
  let mins = Math.floor(value / (60 * 1000))
  return [days, hrs, mins]
}
export function constructSelectOptionList(metaInfo, fieldName) {
  if (!isEmpty(metaInfo)) {
    let { fields: moduleFields = [] } = metaInfo
    let selectField = moduleFields.find(field => field.name == fieldName)
    let { values: selectFieldOptionsList = [] } = selectField
    selectFieldOptionsList = selectFieldOptionsList.map((currentField = {}) => {
      let { value: label, index: value } = currentField
      return { label, value }
    })
    return selectFieldOptionsList
  }
  return []
}
export function constructEnumValueLabelMap(metaInfo, fieldName) {
  if (!isEmpty(metaInfo)) {
    let moduleFields = metaInfo.fields
    let enumField = (moduleFields || []).find(field => field.name == fieldName)
    let enumFieldValues = enumField?.values || []
    let enumValueLabelMap = (enumFieldValues || []).reduce(
      (enumValueLabelMap, enumObj) => {
        let key = enumObj?.index
        let value = enumObj?.value
        enumValueLabelMap[key] = value
        return enumValueLabelMap
      },
      {}
    )
    return enumValueLabelMap
  }
  return {}
}

export async function getOptionsForSecondLevelLookup(
  props,
  directLookupFieldName,
  subModuleLookup,
  url = ''
) {
  let {
    field = {},
    siteId,
    searchText,
    page,
    perPage,
    defaultIds,
    customOptions,
    moduleName: parentModuleName,
    isResourceField,
  } = props
  let {
    filters = {},
    field: fieldObj,
    clientCriteria = {},
    lookupModule = {},
    resourceLookupModuleName,
    lookupModuleName,
    skipDeserialize,
    operatorLookupModule = {},
    additionalParams = {},
    name: fieldName,
  } = field
  let name = getProperty(lookupModule, 'name')
  let operatorLookupModuleName = getProperty(operatorLookupModule, 'name')
  let moduleName = resourceLookupModuleName || lookupModuleName || name
  if (!isEmpty(operatorLookupModuleName)) {
    moduleName = operatorLookupModuleName
  }
  let lookupModuleFilters = getProperty(lookupModule, 'filters')
  if (!isEmpty(lookupModuleFilters)) {
    filters = {
      ...filters,
      ...lookupModuleFilters,
    }
  }
  if (!isEmpty(siteId)) {
    filters = {
      ...filters,
      siteId: {
        operatorId: 36,
        value: [`${siteId}`],
      },
    }
  }
  if (
    getProperty(fieldObj, 'module.name') === 'quote' &&
    moduleName === 'workorder'
  ) {
    filters = {
      ...filters,
      isQuotationNeeded: {
        operatorId: 15,
        value: [String(true)],
      },
    }
  }
  let defaultIdsStr = !isEmpty(defaultIds) ? defaultIds.toString() : ''
  let payload = {
    moduleName,
    searchText,
    page,
    perPage,
    filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
    clientCriteria: !isEmpty(clientCriteria)
      ? JSON.stringify(clientCriteria)
      : null,
    defaultIds: defaultIdsStr || null,
    additionalParams,
    parentModuleName,
    fieldName,
    isResourceField,
  }
  let {
    error,
    options = [],
    meta,
  } = await fetchFieldOptions(
    payload,
    directLookupFieldName,
    subModuleLookup,
    url
  )
  if (error) {
    return { error }
  } else {
    if (!isEmpty(customOptions)) {
      options = [...options, ...customOptions]
    }
    if (skipDeserialize) {
      let optionsObj = constructOptionsToMap(options)

      return { options: optionsObj, meta }
    } else {
      return { options, meta }
    }
  }
}

export async function fetchFieldOptions(
  payload,
  directLookupFieldName,
  subModuleLookup,
  url
) {
  let {
    moduleName,
    searchText,
    page,
    perPage,
    filters,
    clientCriteria,
    defaultIds,
    additionalParams,
    parentModuleName,
    fieldName,
    isResourceField,
  } = payload

  if (isEmpty(url)) {
    if (!isEmpty(directLookupFieldName)) {
      url = `/v3/flaggedAlarmProcess/pickList/${directLookupFieldName}/${parentModuleName}/${fieldName}`
    }
    if (!isEmpty(subModuleLookup) && subModuleLookup) {
      url = `/v3/flaggedAlarmProcess/subModulePickList/${fieldName}/${parentModuleName}`
    }
  }
  let params = {
    page,
    perPage,
    clientCriteria,
    filters,
    search: searchText,
    default: defaultIds,
    viewName: 'hidden-all',
    ...additionalParams,
  }
  let { error, data = {}, meta = {} } = await API.get(url, params)
  if (error) {
    return { error }
  } else {
    let options = getProperty(data, 'pickList', [])
    return { options: options, meta }
  }
}
