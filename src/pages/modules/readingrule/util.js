import Vue from 'vue'
import moment from 'moment-timezone'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'

export function getOrgMoment() {
  //return a new moment with the org timezone and specified params
  return moment.tz(...arguments, Vue.prototype.$timezone)
}

export const getWorkFlowResult = async (widgetName, paramsList) => {
  let url = `v3/fddDefaultWorkflow/getAlarmInsightWorkflow/newreadingrules/${widgetName}`
  let params = {}
  if (paramsList) {
    params.paramList = paramsList
  }
  let { data = {}, error } = await API.get(url, params)
  if (isEmpty(error)) {
    let { workflow: { returnValue } = {} } = data || {}
    return returnValue
  }
}
