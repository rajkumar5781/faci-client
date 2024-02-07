import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { isEmpty, isNumber } from '@facilio/utils/validation'
import getProperty from 'dlv'
import Vue from 'vue'
import { getApp } from '@facilio/router'
export async function loadTaxes() {
  let { list = [], error } = await API.fetchAll(`tax`, {
    viewName: 'all',
  })
  if (error) {
    let { message = 'Error Occured while fetching Tax list' } = error
    ftoast.critical(message)
  } else {
    return list
  }
}
export async function loadEnumMap() {
  let { data, error } = await API.get('/v2/modules/meta/purchaseorderlineitems')
  if (error) {
    let { message } = error
    ftoast.critical(
      message ||
        this.$t('purchase_request.error_msg_purchase_request', {
          ns: 'procurement',
        })
    )
  } else {
    let fields = getProperty(data, 'meta.fields', [])
    let uomField = fields.filter(field => field.name === 'unitOfMeasure')
    if (!isEmpty(uomField)) {
      return getProperty(uomField, [0, 'enumMap'], {})
    }
  }
}

export const taxMode = () => {
  let formDataString =
    getProperty(
      Vue.prototype.$account,
      'data.orgEnabledPrefs.taxApplication.formData',
      '{}'
    ) || '{}'
  let formData = JSON.parse(formDataString)
  return getProperty(formData, 'taxApplication', 1)
}
export function sumValues(array) {
  let sum = 0
  for (let i = 0; i < array.length; i++) {
    sum += array[i]
  }
  return sum
}
export const getPdfPreviewUrl = (moduleName, templateId, recordId) => {
  let { location = {} } = window
  let { protocol, host } = location || {}
  let { linkName } = getApp()
  let url = `${protocol}//${host}/${linkName}/pdftemplate/preview/${moduleName}/${recordId}?`
  if (!isEmpty(templateId)) {
    url = `${url}id=${templateId}&`
  }
  return url
}
export function discountMode() {
  let formDataString = getProperty(
    this,
    '$account.data.orgEnabledPrefs.discountApplication.formData',
    '{}'
  )
  let formData = JSON.parse(formDataString)
  return getProperty(formData, 'discountApplication', 1)
}

export function getStatusEnumMap(fields, statusFieldName) {
  let statusField = fields.filter(field => field.name === statusFieldName)
  return getProperty(statusField, '0.enumMap', {})
}
