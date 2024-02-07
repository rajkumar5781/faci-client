import { API } from '@facilio/api'
import getProperty from 'dlv'

export const EXCLUDE_OPERATORS = [74, 75, 76, 77, 78, 79, 35, 81, 82]

export const loadMeterReadingFields = async (
  meterId,
  categoryId,
  excludeEmptyFields,
  type,
  fetchValidationRules,
  permissionModuleName
) => {
  if (excludeEmptyFields !== false) {
    excludeEmptyFields = true
  }
  let url =
    meterId > 0
      ? 'v2/reading/getmeterspecificreadings?parentId=' + meterId
      : `v2/meterReading/${permissionModuleName}/utilitytype?id=` + categoryId
  url += '&excludeEmptyFields=' + excludeEmptyFields
  if (type) {
    url += '&readingType=' + type
  }
  if (fetchValidationRules) {
    url += '&fetchValidationRules=' + fetchValidationRules
  }
  let fields = []
  if (meterId > 0) {
    // API for meter specific readings not added yet
    //promise = get(url)
  } else {
    let { data } = await API.get(url)
    if (data) {
      if (meterId > 0) {
        data.forEach(reading => {
          reading.fields.forEach(field => {
            field.module = { name: reading.name }
            fields.push(field)
          })
        })
      } else {
        data.readings.forEach(field => {
          field.module = { name: field.module.name }
          if (fetchValidationRules && data.fieldVsRules) {
            field.readingRules = data.fieldVsRules[field.fieldId]
          }
          let operators = getProperty(field, 'dataTypeEnum.operators')
          if (operators) {
            for (let operatorKey in operators) {
              let operator = operators[operatorKey]
              if (EXCLUDE_OPERATORS.includes(operator.operatorId)) {
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
}
