import router from '/src/router.js'
import constants from '/src/utils/constants.js'
import { findRouteForTab, tabTypes } from '@facilio/router'
import { compressToEncodedURIComponent } from 'lz-string'

export function goToAnalytics(reading, details) {
  let measures = constructMeasures(reading, details)
  redirectToReportCreation(measures)
}
function constructMeasures(reading, details) {
  let { field } = reading || {}
  let { id, moduleName, categoryId, parentModuleName } = details || {}
  let point = {
    ...field,
    parentModuleName,
    categoryId,
    moduleName,
    category: categoryId,
    criteriaType: 2,
    criteria: getIdCriteria(id),
    yAxis: '1',
    aliases: { actual: 'A' },
    aggr: getPointAggr(field),
  }
  return [point]
}
export function redirectToReportCreation(measures = {}) {
  let { name } = findRouteForTab(tabTypes.ANALYTICS)
  let { ANALYTICS_PATH = {} } = constants
  let { creationPath } = ANALYTICS_PATH

  let href = router.resolve({
    name,
  }).href
  href = href + '/' + creationPath
  let targetUrl =
    href +
    `?measures=${compressToEncodedURIComponent(JSON.stringify(measures))}`
  window.open(targetUrl, '_blank')
}
const getIdCriteria = id => {
  return {
    conditions: {
      1: {
        fieldName: 'id',
        operatorId: 9,
        value: `${id}`,
        prevOperator: true,
        valueNeeded: true,
      },
    },
    pattern: '( 1 )',
  }
}

let getPointAggr = (point, withLabel) => {
  let { unit } = point || {}
  let aggr = '2'
  if (
    unit &&
    ['currency', 'kwh', 'co2', 'kg', 'mwh'].includes(unit.trim().toLowerCase())
  ) {
    aggr = '3'
  }
  if (withLabel) {
    let currOption = aggrOptions.find(option => option.value == aggr)
    return currOption.label
  } else {
    return aggr
  }
}
