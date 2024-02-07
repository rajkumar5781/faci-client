import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'
const constructOptionsToMap = valueArr => {
  let optionsObj = valueArr.reduce((optionsObj, option) => {
    let { label, value } = option || {}
    optionsObj[value] = label
    return optionsObj
  }, {})

  return optionsObj
}

export const getFieldOptions = async props => {
  let {
    field,
    siteId,
    searchText,
    page,
    perPage,
    defaultIds,
    parentModuleName,
  } = props
  let {
    filters = {},
    field: fieldObj,
    name: fieldName,
    clientCriteria = {},
    lookupModule,
    resourceLookupModuleName,
    lookupModuleName,
    skipDeserialize,
    operatorLookupModule,
    additionalParams = {},
  } = field || {}
  let { name } = lookupModule || {}
  let { name: operatorLookupModuleName } = operatorLookupModule || {}
  let moduleName = resourceLookupModuleName || lookupModuleName || name
  if (!isEmpty(operatorLookupModuleName)) {
    moduleName = operatorLookupModuleName
  }
  let { filters: lookupModuleFilters } = lookupModule || {}
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
  }
  let { error, options = [], meta } = (await fetchFieldOptions(payload)) || {}
  if (error) {
    return { error }
  } else {
    if (skipDeserialize) {
      let optionsObj = constructOptionsToMap(options || [])
      return { options: optionsObj, meta }
    } else {
      return { options, meta }
    }
  }
}

export const fetchFieldOptions = async payload => {
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
  } = payload

  let url =
    !isEmpty(parentModuleName) && !isEmpty(fieldName)
      ? `/v3/pickList/forms/${parentModuleName}/${fieldName}`
      : `/v3/picklist/${moduleName}`
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
  let { error, data, meta = {} } = (await API.get(url, params)) || {}
  if (error) {
    return { error }
  } else {
    let { pickList: options } = data || {}
    return { options: options || [], meta }
  }
}

export const getFieldValue = async props => {
  let { lookupModuleName, selectedOptionId } = props
  let labelMeta = {}

  labelMeta[lookupModuleName] = selectedOptionId

  let { data, error } = await API.post(`/v2/picklist/label`, { labelMeta })

  if (error) {
    return { error }
  } else {
    let { label } = data || {}
    return { data: label[lookupModuleName] } || { data: null }
  }
}
