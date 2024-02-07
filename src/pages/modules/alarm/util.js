import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { isNullOrUndefined, isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'

let excludeOperators = [74, 75, 76, 77, 78, 79, 35, 81, 82]

let getUrl = (url, filter, searchText, orderBy, paging) => {
  if (!url.includes('?')) {
    url += '?'
  }
  if (filter && Object.keys(filter).length) {
    url += '&filters=' + encodeURIComponent(JSON.stringify(filter))
  }
  if (searchText) {
    url += '&search=' + searchText
  }
  if (orderBy) {
    url += '&orderBy=' + orderBy.field
    if (orderBy.type) {
      url += '&orderType=' + orderBy.type
    }
    if (orderBy.isZone) {
      url += '&isZone=' + orderBy.isZone
    }
  }
  if (paging) {
    url += '&page=' + paging.page + '&perPage=' + paging.perPage
  }
  return url
}

let v1get = async (url, filter, searchText, orderBy, paging) => {
  url = getUrl(url, filter, searchText, orderBy, paging)
  let response = await API.get(url)
  if (response.data) return Promise.resolve(response.data)
  return Promise.reject(Error(response.error.message))
}

let v2get = async (url, { filter, searchText, orderBy, paging } = {}) => {
  if (filter || searchText || orderBy || paging) {
    url = getUrl(url, filter, searchText, orderBy, paging)
  }
  let response = await API.get('/v2' + url)
  if (response.data) return Promise.resolve(response.data.result)
  return Promise.reject(Error(response.error.message))
}

export async function loadAssetReadingFields(
  assetId,
  categoryId,
  excludeEmptyFields,
  type,
  fetchValidationRules
) {
  if (excludeEmptyFields !== false) {
    excludeEmptyFields = true
  }
  let url =
    assetId > 0
      ? '/reading/getassetspecificreadings?parentId=' + assetId
      : '/readings/assetcategory?id=' + categoryId
  url += '&excludeEmptyFields=' + excludeEmptyFields
  if (type) {
    url += '&readingType=' + type
  }
  if (fetchValidationRules) {
    url += '&fetchValidationRules=' + fetchValidationRules
  }
  let promise
  if (assetId > 0) {
    promise = v1get(url)
  } else {
    promise = v2get(url)
  }
  try {
    const response = await promise
  } catch (error) {
    ftoast.critical(error)
  }
  let fields = []
  if (response) {
    if (assetId > 0) {
      response.forEach(reading => {
        reading.fields.forEach(field => {
          field.module = { name: reading.name }
          fields.push(field)
        })
      })
    } else {
      response.readings.forEach(field => {
        field.module = { name: field.module.name }
        if (fetchValidationRules && response.fieldVsRules) {
          field.readingRules = response.fieldVsRules[field.fieldId]
        }
        let operators = getProperty(field, 'dataTypeEnum.operators')
        if (operators) {
          for (let operatorKey in operators) {
            let operator = operators[operatorKey]
            if (excludeOperators.includes(operator.operatorId)) {
              delete operators[operatorKey]
            }
          }
        }
        fields.push(field)
      })
    }
  }
  return fields
}

export async function getWorkFlowResult(moduleName, paramsList) {
  let url = `v3/fddDefaultWorkflow/getAlarmInsightWorkflow/${moduleName}`
  let params = {}
  if (paramsList) {
    params.paramList = paramsList
  }
  let { data = {}, error } = await API.get(url, params)
  if (error) {
    ftoast.critical(error.message)
  } else {
    let { workflow } = data || {}
    let { returnValue } = workflow || {}
    return returnValue
  }
}

export const genericCachedGet = (
  { commit, state },
  param,
  { url, extraction, forceUpdate, moduleName, canFreeze, commitName }
) => {
  let dataObj, promise

  if (!isEmpty(moduleName)) {
    dataObj = state[param][moduleName]
  } else {
    dataObj = state[param]
  }

  if (isNullOrUndefined(dataObj) || forceUpdate) {
    promise = new Promise((resolve, reject) => {
      API.get(url, null, { force: forceUpdate }).then(({ error, data }) => {
        promise = null
        if (error) {
          promise = null
          reject()
        } else {
          let responseData = extraction(data)
          if (!isNullOrUndefined(responseData)) {
            commitName = commitName || 'GENERIC_SET'
            commit(commitName, {
              type: param,
              data: responseData,
              moduleName,
              canFreeze,
            })
            resolve()
          } else {
            reject()
          }
        }
      })
    })
    return promise
  }
  return Promise.resolve()
}
