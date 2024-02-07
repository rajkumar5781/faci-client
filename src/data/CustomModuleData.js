import { ModuleData } from '@facilio/data'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { dset as setProperty } from 'dset'
import cloneDeep from 'lodash/cloneDeep'
import { getBaseURL } from '../utils/api/base-url'
import constants from '../utils/constants'
import Vue from 'vue'
import {
  isEmpty,
  isObject,
  areValuesEmpty,
  isNullOrUndefined,
  isFunction,
} from '@facilio/utils/validation'
import { ftoast } from '@facilio/design-system'
import view from '../store/views'
import module from '../store/module'
import access from '../utils/access'
import { getTolgee } from '../utils/tolgee'
const $t = getTolgee().t

const viewStore = view()
const moduleStore = module()

export class CustomModuleData extends ModuleData {
  static displayTypeEnumMap = {
    TEAMSTAFFASSIGNMENT: {
      deserialize: (fieldObj, instance) => {
        let { assignedTo, assignmentGroup } = instance
        let { id: assignedToId } = assignedTo || {}
        let { id: assignmentGroupId } = assignmentGroup || {}
        let fieldValue = {
          assignedTo: { id: assignedToId || '' },
          assignmentGroup: { id: assignmentGroupId || '' },
        }

        setProperty(fieldObj, 'value', fieldValue)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { assignment } = formModel || {}
        let { assignedTo } = assignment || {}
        let { assignmentGroup } = assignment || {}

        if (assignedTo.id == null && assignmentGroup.id == null) {
          finalObj['assignedTo'] = null
          finalObj['assignmentGroup'] = null
          return finalObj
        } else if (assignedTo.id == null && assignmentGroup.id != null) {
          finalObj['assignedTo'] = null
          finalObj['assignmentGroup'] = assignmentGroup
          return finalObj
        } else if (assignedTo.id != null && assignmentGroup.id == null) {
          finalObj['assignedTo'] = assignedTo
          finalObj['assignmentGroup'] = null
          return finalObj
        } else {
          finalObj['assignedTo'] = assignedTo
          finalObj['assignmentGroup'] = assignmentGroup
          return finalObj
        }
      },
    },
    LOOKUP_SIMPLE: {
      deserialize: (fieldObj, instance) => {
        let { name } = fieldObj || {}
        let value
        if (name === 'siteId') {
          value = instance[name] || ''
        } else {
          value = (instance[name] || {}).id
        }
        setProperty(fieldObj, 'value', value)
        return fieldObj
      },
    },
    MULTI_LOOKUP_SIMPLE: {
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        let { [name]: value } = formModel || {}
        finalObj[name] = (value || []).map(currId => {
          return isObject(currId) ? currId : { id: currId }
        })
        return finalObj
      },
    },
    SADDRESS: {
      deserialize: (fieldObj, instance) => {
        let { name } = fieldObj || {}
        let fieldValue = instance[name] || {
          ...constants.ADDRESS_FIELD_DEFAULTS,
        }
        setProperty(fieldObj, 'value', fieldValue)
        return fieldObj
      },
    },
    ADDRESS: {
      deserialize: (fieldObj, instance) => {
        let { name } = fieldObj || {}
        let fieldValue = instance[name] || {
          ...constants.ADDRESS_FIELD_DEFAULTS,
        }
        setProperty(fieldObj, 'value', fieldValue)
        return fieldObj
      },
    },
    NUMBER: {
      serialize: (finalObj, field, formModel) => {
        let { name, field: fieldObj } = field || {}
        let { unitId } = fieldObj || {}
        let value = formModel[name]

        if (!isEmpty(unitId)) {
          setProperty(finalObj, `${name}Unit`, unitId)
        }
        finalObj[name] = parseInt(value)

        return finalObj
      },
    },
    DECIMAL: {
      serialize: (finalObj, field, formModel) => {
        let { name, field: fieldObj } = field || {}
        let { unitId } = fieldObj || {}
        let value = formModel[name]

        if (!isEmpty(unitId)) {
          setProperty(finalObj, `${name}Unit`, unitId)
        }
        finalObj[name] = parseFloat(value)

        return finalObj
      },
    },
    ATTACHMENT: {
      serialize: (finalObj, field, formModel) => {
        let { lookupModuleName } = field || {}
        let deletedItemKey = `${lookupModuleName}_delete`

        finalObj[lookupModuleName] = formModel[lookupModuleName]
        if (getProperty(formModel, deletedItemKey)) {
          finalObj[deletedItemKey] = formModel[deletedItemKey]
        }
        return finalObj
      },
    },
    TICKETNOTES: {
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        if (isEmpty(formModel[name])) {
          finalObj[name] = null
          return finalObj
        }

        if (!access.isLicenseEnabled('NEW_COMMENTS')) {
          finalObj[name] = [
            {
              body: formModel[name],
              createdTime: Date.now(),
              createdBy: (Vue.prototype.$account || {}).user,
            },
          ]
        } else {
          let comment = formModel[name] || {}
          this.$setProperty(comment, 'createdTime', Date.now())
          this.$setProperty(comment, 'createdBy', (this.$account || {}).user)
          finalObj[name] = [comment]
        }
        return finalObj
      },
    },
    CALENDAR_EVENT_CONFIGURATION: {
      serialize: (finalObj, field, formModel = {}) => {
        let { description, name, eventConfiguration = {} } = formModel
        let firstSlotStartTime = getProperty(
          eventConfiguration,
          'timeSlotList.0.startMinMilliSecond',
          null
        )
        let firstSlotEndTime = getProperty(
          eventConfiguration,
          'timeSlotList.0.endMinMilliSecond',
          null
        )

        if (isEmpty(firstSlotStartTime) || isEmpty(firstSlotEndTime)) {
          delete eventConfiguration['timeSlotList']
        }

        eventConfiguration = {
          ...eventConfiguration,
          name,
          description,
          eventSequence: 1,
        }
        return eventConfiguration
      },
    },
    CALENDAR_CONFIGURATION: {
      serialize: (finalObj, field, formModel) => {
        let {
          name,
          calendarType,
          client,
          description,
          calendarEventList = [],
        } = formModel || {}
        let calendarEventMappingContextList = []
        calendarEventMappingContextList = calendarEventList.map(event => {
          let { calendarTimeSlotContextList, event: calEvent } = event || {}
          let { id: eventId } = calEvent || {}
          return { event: { id: eventId }, calendarTimeSlotContextList }
        })
        let calendarFormData = {
          calendarType,
          name,
          description,
          calendarEventMappingContextList,
          client,
        }
        return calendarFormData
      },
    },
    IMAGE: {
      deserialize: (fieldObj, instance) => {
        let { name } = fieldObj
        let photoFieldName = `${name}Id`
        let imageId = instance[photoFieldName]
        let imgUrl = instance.getImage(photoFieldName)

        setProperty(fieldObj, 'imgUrl', imageId ? imgUrl : null)
        setProperty(fieldObj, 'value', imageId)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        finalObj[`${name}Id`] = formModel[name]
        return finalObj
      },
    },
    SIGNATURE: {
      deserialize: (fieldObj, instance) => {
        let { name } = fieldObj
        let photoFieldName = `${name}Id`
        let imageId = instance[photoFieldName]
        let imgUrl = instance.getImage(photoFieldName)
        setProperty(fieldObj, 'imgUrl', imageId ? imgUrl : null)
        setProperty(fieldObj, 'value', imageId)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        finalObj[`${name}Id`] = formModel[name]
        return finalObj
      },
    },
    FILE: {
      deserialize: (fieldObj, instance) => {
        let { name } = fieldObj || {}
        let fileId = instance[`${name}Id`]
        let fileObj = { name: instance[`${name}FileName`] }
        setProperty(fieldObj, 'fileObj', fileId ? fileObj : null)
        setProperty(fieldObj, 'value', fileId)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        let value = formModel[name]
        if (!isEmpty(value)) {
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value)
            } catch (e) {
              ftoast.warning($t('common._common.error_parsing_value'))
            }
            let defaultFileObj = value[0] || {}
            let { fileId } = defaultFileObj || {}
            value = fileId
          }
        }
        finalObj[`${name}Id`] = value
        return finalObj
      },
    },
    URL_FIELD: {
      deserialize: (fieldObj, instance) => {
        let { name: fieldName } = fieldObj || {}
        let fieldValue = instance[fieldName]
        let value = { href: '', name: '' }

        if (!isEmpty(fieldValue)) {
          let { href, name } = fieldValue || {}
          value = { href, name }
        }
        setProperty(fieldObj, 'value', value)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        let value = formModel[name] || {}

        let { href } = value || {}

        if (isEmpty(href)) {
          formModel[name] = null
        } else {
          formModel[name] = value
          let isValidUrl =
            href.startsWith('http://', 0) || href.startsWith('https://', 0)

          if (!isValidUrl) {
            formModel[name].href = 'http://' + href
          }
        }
        finalObj[name] = formModel[name]
        return finalObj
      },
    },
    NOTES: {
      deserialize: finalObj => {
        return finalObj
      },
    },
    CURRENCY: {
      deserialize: (fieldObj, instance) => {
        let { name: fieldName } = fieldObj || {}
        let fieldValue = instance[fieldName]
        let value = {
          currencyCode: null,
          currencyValue: null,
        }
        if (!isEmpty(fieldValue)) {
          let { currencyCode, currencyValue } = fieldValue || {}
          value = { currencyCode, currencyValue }
        }
        setProperty(fieldObj, 'value', value)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        finalObj[name] = formModel[name]
        return finalObj
      },
    },
    MULTI_CURRENCY: {
      deserialize: (fieldObj, instance) => {
        let { name: fieldName } = fieldObj || {}
        let fieldValue = instance[fieldName]
        setProperty(fieldObj, 'value', fieldValue)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        finalObj[name] = formModel[name]
        finalObj.currencyCode = formModel.currencyCode || null
        finalObj.exchangeRate = formModel.exchangeRate || null

        return finalObj
      },
    },
    TERRITORY: {
      deserialize: (fieldObj, instance) => {
        let fieldValue = null
        let { name } = fieldObj || {}
        let value = instance[name]
        if (!isEmpty(value)) {
          fieldValue = JSON.parse(value)
        }
        setProperty(fieldObj, 'value', fieldValue)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        finalObj[name] = JSON.stringify(formModel[name] || {})
        return finalObj
      },
    },
    GEO_LOCATION: {
      deserialize: (fieldObj, instance) => {
        let fieldValue = null
        let { name } = fieldObj || {}
        let value = instance[name] || {}
        if (!isEmpty(value)) {
          let isStringField =
            fieldObj?.field?.dataTypeEnum === 'STRING' &&
            fieldObj?.displayTypeEnum === 'GEO_LOCATION'
          if (!isObject(value)) {
            if (!isStringField) {
              value = JSON.parse(value)
            } else {
              let [lat, lng] = value.split(',') || []
              lat = !isEmpty(lat) ? parseFloat(lat) : null
              lng = !isEmpty(lng) ? parseFloat(lng) : null
              value = { lat, lng }
            }
          }

          fieldValue = { id: value.id || -99 }
          fieldValue.lat = value?.lat
          fieldValue.lng = value?.lng
        }
        setProperty(fieldObj, 'value', fieldValue)

        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        finalObj[name] = formModel[name]
        let isStringField =
          field?.displayTypeEnum === 'GEO_LOCATION' &&
          field?.field?.dataTypeEnum === 'STRING'
        if (isStringField) {
          let lat = formModel[name]?.lat
          let lng = formModel[name]?.lng
          let stringLocationValue = ''
          if (!isEmpty(lat) && !isEmpty(lng)) {
            stringLocationValue = `${lat},` + `${lng}`
          }
          finalObj[name] = stringLocationValue
        }
        return finalObj
      },
    },
    BUDGET_AMOUNT: {
      deserialize: (fieldObj, instance) => {
        let { budgetAmountList } = instance
        let incomes = (budgetAmountList || []).filter(
          amtObj => amtObj.amountType === 1
        )
        let expenses = (budgetAmountList || []).filter(
          amtObj => amtObj.amountType === 2
        )
        let { budgetIncomeDefaults, budgetExpenseDefaults } =
          constants.BUDGET_CONSTANTS || {}
        let fieldValue = {
          incomes: !isEmpty(incomes)
            ? incomes
            : [cloneDeep(budgetIncomeDefaults)],
          expenses: !isEmpty(expenses)
            ? expenses
            : [cloneDeep(budgetExpenseDefaults)],
        }

        setProperty(fieldObj, 'value', fieldValue)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        let { currencyCode, exchangeRate } = formModel || {}
        finalObj[name] = formModel[name]
        finalObj['currencyCode'] = currencyCode
        finalObj['exchangeRate'] = exchangeRate

        return finalObj
      },
    },
    RELATIONSHIP: {
      serialize: (finalObj, field, formModel) => {
        let { relationship } = formModel || {}

        finalObj = {
          ...finalObj,
          relationship,
        }
        return finalObj
      },
    },
    SERVICE_PM_TRIGGER: {
      serialize: (finalObj, field, formModel) => {
        let { servicePMTrigger } = formModel || {}
        if (!isEmpty(servicePMTrigger)) {
          setProperty(finalObj, 'relations.servicePMTrigger', [
            servicePMTrigger,
          ])
        }
        return finalObj
      },
    },
    SERVICE_PM_TEMPLATE_TRIGGER: {
      deserialize: (fieldObj, instance) => {
        let { servicePMTrigger = {} } = instance || {}
        setProperty(fieldObj, 'value', servicePMTrigger)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { servicePMTemplateTrigger } = formModel || {}
        if (!isEmpty(servicePMTemplateTrigger)) {
          setProperty(finalObj, 'relations.servicePMTrigger', [
            servicePMTemplateTrigger,
          ])
        }
        return finalObj
      },
    },
    SERVICE_TASK_TEMPLATE: {
      deserialize: (fieldObj, instance) => {
        let { serviceTaskTemplate = [] } = instance || {}
        let serviceTaskArr = serviceTaskTemplate.reduce((acc, task) => {
          let { servicePlanItems, servicePlanTools, servicePlanServices } =
            task || {}

          task = {
            ...(task || {}),
            relations: {
              serviceOrderPlannedItems: [
                {
                  data: servicePlanItems,
                },
              ],
              serviceOrderPlannedTools: [
                {
                  data: servicePlanTools,
                },
              ],
              serviceOrderPlannedServices: [
                {
                  data: servicePlanServices,
                },
              ],
            },
          }

          delete task['servicePlanItems']
          delete task['servicePlanTools']
          delete task['servicePlanServices']

          acc.push(task)
          return acc
        }, [])

        setProperty(fieldObj, 'value', serviceTaskArr)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { serviceTaskTemplate } = formModel || {}
        if (!isEmpty(serviceTaskTemplate)) {
          let { data } = serviceTaskTemplate || {}
          let { relations } = data[0] || {}
          let {
            serviceOrderPlannedItems,
            serviceOrderPlannedTools,
            serviceOrderPlannedServices,
          } = relations || {}
          serviceTaskTemplate.data[0].relations = {
            servicePlanItems: serviceOrderPlannedItems,
            servicePlanTools: serviceOrderPlannedTools,
            servicePlanServices: serviceOrderPlannedServices,
          }

          setProperty(finalObj, 'relations.serviceTaskTemplate', [
            serviceTaskTemplate,
          ])
        }
        return finalObj
      },
    },
    SERVICE_TASK_ITEMS: {
      deserialize: (fieldObj, instance) => {
        let { serviceTask = [] } = instance || {}
        let serviceTaskArr = serviceTask.reduce((acc, task) => {
          let {
            serviceOrderPlannedItems,
            serviceOrderPlannedTools,
            serviceOrderPlannedServices,
          } = task || {}

          task = {
            ...(task || {}),
            relations: {
              serviceOrderPlannedItems: [
                {
                  data: serviceOrderPlannedItems,
                },
              ],
              serviceOrderPlannedTools: [
                {
                  data: serviceOrderPlannedTools,
                },
              ],
              serviceOrderPlannedServices: [
                {
                  data: serviceOrderPlannedServices,
                },
              ],
            },
          }

          delete task['serviceOrderPlannedItems']
          delete task['serviceOrderPlannedTools']
          delete task['serviceOrderPlannedServices']

          acc.push(task)
          return acc
        }, [])

        setProperty(fieldObj, 'value', serviceTaskArr)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { serviceTask } = formModel || {}
        if (!isEmpty(serviceTask)) {
          setProperty(finalObj, 'relations.serviceTask', [serviceTask])
        }
        return finalObj
      },
    },
    SERVICE_APPOINTMENT_TASKS: {
      deserialize: (fieldObj, instance) => {
        let { serviceTasks = [] } = instance || {}
        let serviceTasksArr = serviceTasks.reduce((acc, task) => {
          let {
            serviceOrderPlannedItems,
            serviceOrderPlannedTools,
            serviceOrderPlannedServices,
          } = task || {}

          task = {
            ...(task || {}),
            relations: {
              serviceOrderPlannedItems: [
                {
                  data: serviceOrderPlannedItems,
                },
              ],
              serviceOrderPlannedTools: [
                {
                  data: serviceOrderPlannedTools,
                },
              ],
              serviceOrderPlannedServices: [
                {
                  data: serviceOrderPlannedServices,
                },
              ],
            },
          }

          delete task['serviceOrderPlannedItems']
          delete task['serviceOrderPlannedTools']
          delete task['serviceOrderPlannedServices']

          acc.push(task)
          return acc
        }, [])

        setProperty(fieldObj, 'value', serviceTasksArr)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { serviceTasks = [] } = formModel || {}
        if (!isEmpty(serviceTasks)) {
          let newTasks = serviceTasks.filter(task => isEmpty(task.id))
          let associatedTasks = serviceTasks.filter(task => !isEmpty(task.id))
          let taskData = {
            newTasks,
            associatedTasks,
          }
          setProperty(finalObj, 'associatedTasks', taskData)
        }
        return finalObj
      },
    },
    TASKS: {
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        let { sectionNameList, tasksString } = formModel || {}
        finalObj[name] = formModel[name]
        if (!isEmpty(tasksString)) {
          finalObj['tasksString'] = Object.keys(tasksString).reduce(
            (result, sectionName) => {
              let sectionItems = tasksString[sectionName]
              let transformedSectionItems = sectionItems.map(task => {
                return { ...task, uniqueId: task.taskId }
              })
              result[sectionName] = transformedSectionItems
              return result
            },
            {}
          )
        }
        finalObj['sectionNameList'] = sectionNameList
        return finalObj
      },
    },
    INSPECTION_TRIGGER: {
      deserialize: (fieldObj, instance) => {
        let { triggers } = instance
        let triggerList = []
        if (!isEmpty(triggers)) {
          // filtering manual trigger type
          triggers.forEach(trigger => {
            let { type } = trigger || {}
            if (type != 2) {
              let name = getProperty(trigger, 'name')
              let id = getProperty(trigger, 'id')
              let schedule = getProperty(trigger, 'schedule.scheduleInfo')
              let startTime = getProperty(trigger, 'schedule.startTime')
              let endTime = getProperty(trigger, 'schedule.endDate')
              let assets = getProperty(trigger, 'resInclExclList')

              if (!isEmpty(assets)) {
                assets = assets.map(asset => {
                  let { resource } = asset
                  return { ...asset, label: resource.name, value: resource.id }
                })
              }

              triggerList.push({
                name,
                id,
                type,
                schedule: JSON.stringify(schedule),
                assets: assets ? assets : [],
                startTime,
                endTime,
              })
            }
          })
        }
        setProperty(fieldObj, 'triggerData', triggerList)
        return fieldObj
      },
      serialize: (finalObj, field, formModel) => {
        let { triggers = [] } = formModel || {}
        if (!isEmpty(triggers)) {
          triggers = triggers.map(trigger => {
            let { name, schedule, assets, startTime } = trigger || {}
            let param = {
              name,
              type: 1,
              schedule: { scheduleInfo: JSON.parse(schedule), startTime },
            }

            if (!isEmpty(assets)) {
              let resInclExclList = assets.map(asset => {
                let { value } = asset || {}
                return { resource: { id: value }, isInclude: true }
              })
              param['resInclExclList'] = resInclExclList
            }
            return param
          })
          setProperty(finalObj, 'triggers', triggers)
        }
        return finalObj
      },
    },
    FACILITY_BOOKING_SLOTS: {
      serialize: (finalObj, field, formModel) => {
        let { name } = field || {}
        finalObj[name] = formModel[name]
        finalObj['bookingDate'] = formModel.bookingDate
        return finalObj
      },
    },
    FACILITY_AVAILABILITY: {
      serialize: (finalObj, field, formModel) => {
        let { facilityWeekdayAvailability = [] } = formModel
        let selectedList = []
        let skippedIds = []
        facilityWeekdayAvailability.forEach(record => {
          if (record.isSelected) {
            delete record.isSelected
            selectedList.push(record)
          } else {
            record?.id && skippedIds.push(record.id)
          }
        })
        let { isEdit } = this
        let relationParams = {
          facilityWeekdayAvailability: [
            {
              deleteIds: skippedIds,
              data: selectedList,
            },
          ],
        }
        setProperty(finalObj, 'relations', relationParams)

        if (isEdit) {
          delete finalObj.facilityWeekdayAvailability
        }

        return finalObj
      },
      deserialize: (fieldObj, instance) => {
        let { weekDayAvailabilities = [] } = instance || {}

        let availabilities = constants.facilityAvailabilityDefaults || {}

        let ids = []

        weekDayAvailabilities.forEach(data => {
          data.isSelected = true
          ids.push(data.dayOfWeek)
        })

        availabilities.forEach(data => {
          if (!ids.includes(data.dayOfWeek)) {
            let insertIndex = weekDayAvailabilities.findIndex(
              item => item.dayOfWeek > data.dayOfWeek
            )
            if (insertIndex === -1) {
              weekDayAvailabilities.push(data)
            } else {
              weekDayAvailabilities.splice(insertIndex, 0, data)
            }
          }
        })

        setProperty(fieldObj, 'value', weekDayAvailabilities)

        return fieldObj
      },
    },
  }
  static recordListCount = null
  static customButtonList = []

  static async loadSystemButtons({ moduleName, record, position, force }) {
    let { id = null } = record || {}
    let params = { moduleName, id, positionType: position }
    let config = { force }
    let url = `v2/systemButton/${moduleName}/getAvailableButtons`

    let { data, error } = await API.post(url, params, config)

    if (error) throw error
    else {
      return data?.workflowRuleList || []
    }
  }
  static async loadSystemButtonsForRecords({
    moduleName,
    position,
    recordIds,
  }) {
    let { data } = await API.post(
      `/v2/systemButton/${moduleName}/getAvailableButtonsForList`,
      {
        moduleName,
        positionType: position,
        recordIds,
      }
    )
    return data || {}
  }

  static async loadSystemButtonsForRecord({
    moduleName,
    position,
    force = false,
    id,
  }) {
    let { data } = await API.get(
      `v2/systemButton/${moduleName}/getAvailableButtons`,
      {
        moduleName,
        positionType: position,
        id,
      },
      { force }
    )
    let { workflowRuleList } = data || {}
    return workflowRuleList || []
  }
  static async fetchAllRecords(payload) {
    let {
      moduleName,
      filters,
      perPage,
      force = false,
      quickFilter,
    } = payload || {}

    let params = {
      fetchOnlyViewGroupColumn: true,
      ...(payload || {}),
      filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
      perPage: perPage || 50,
      withoutCustomButtons: true,
      force: null,
      quickFilter: !isEmpty(quickFilter) ? JSON.stringify(quickFilter) : null,
    }

    let config = { force, uniqueKey: `${moduleName}_LIST` }
    let { list, error, meta } = await API.fetchAll(moduleName, params, config)

    if (error) {
      console.warn(`${moduleName} fetchRecord API failed or cancelled`)
      let { isCancelled } = error || {}
      if (!isCancelled) throw error
    } else {
      this.recordListCount = getProperty(meta, 'pagination.totalCount', null)
      return { data: list || [], moduleName }
    }
  }
  static async loadCustomButtons({ moduleName, record, position, force }) {
    let { id = null } = record || {}
    let params = { moduleName, id, positionType: position }
    let config = {
      force,
    }
    let url = `/v2/custombutton/${moduleName}/getAvailableButtons`

    let { data } = await API.post(url, params, config)
    let { workflowRuleList } = data || {}

    return workflowRuleList || []
  }
  static async loadSortableFields({ moduleName, viewDetailFields }) {
    let defaultFieldIds = (viewDetailFields || []).map(field => field.id)
    let { data, error } = await API.post(
      `/v2/fields/config/sortable/${moduleName}`,
      { defaultFieldIds }
    )

    if (!error) {
      let { fields } = data || {}
      return fields || []
    }
  }
  static async updateListCustomization(payload) {
    let { moduleName, params } = payload
    let url = `v2/views/${moduleName}/column/customization`
    let { error, data } = await API.post(url, params)
    if (error) {
      throw error
    } else {
      return data
    }
  }
  static async updateSchedulerEvent(params, moduleName) {
    let url = `v3/modules/data/timelineScheduledView/${moduleName}/update`
    let { error, data } = await API.post(url, params)

    if (error) {
      return { error }
    } else {
      return { data: data?.timelineData || {} }
    }
  }
  static async fetchCalendarRecords({ moduleName, viewname, payload }) {
    let url = `v3/modules/calendarData/${moduleName}/view/${viewname}/get`
    let { data, error } = await API.get(url, payload)

    if (!error) {
      return { data: data[moduleName] }
    } else {
      let { isCancelled } = error || {}
      if (!isCancelled) throw error
    }
  }
  static async fetchCalendarSideBarList({ moduleName, viewname, payload }) {
    let url = `v3/modules/calendarData/${moduleName}/view/${viewname}/list`
    let {
      data: { [moduleName]: list },
      error,
    } = await API.get(url, payload)

    if (!error) {
      return { data: list }
    } else {
      let { isCancelled } = error || {}
      if (!isCancelled) throw error
    }
  }
  static async loadCustomButtonsForRecords({
    moduleName,
    recordIds = [],
    position,
    force,
  }) {
    let params = {
      moduleName,
      recordIds,
      positionTypes: position,
    }
    let url = `/v2/custombutton/${moduleName}/getAvailableButtonsForRecords`
    let config = { force }

    if (!isEmpty(recordIds)) {
      let { error, data } = await API.get(url, params, config)

      if (!isEmpty(error)) {
        let { isCancelled } = error || {}
        if (!isCancelled) throw error
      } else {
        let { customButtons = [], customButtonsforRecords = [] } = data || {}
        return { customButtons, customButtonsforRecords }
      }
    } else {
      return { customButtons: [], customButtonsforRecords: [] }
    }
  }
  static async fetchRecordsCount({
    moduleName,
    viewname,
    filters,
    search,
    additionalParams,
    force = false,
    quickFilter,
  }) {
    let config = { force, uniqueKey: `${moduleName}_LIST_COUNT` }
    let params = {
      viewName: viewname,
      filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
      includeParentFilter: !isEmpty(filters),
      search,
      moduleName,
      quickFilter: !isEmpty(quickFilter) ? JSON.stringify(quickFilter) : null,
      ...(additionalParams || {}),
    }
    let url = 'v3/modules/data/count'
    let { data, error } = await API.get(url, params, config)

    if (error) {
      console.warn(`${moduleName} count API failed or cancelled`)
      let { isCancelled } = error || {}
      if (!isCancelled) throw error
    } else {
      return data.count || null
    }
  }
  static async fetchRecord({ moduleName, id, force = false }) {
    let { [moduleName]: data, error } = await API.fetchRecord(
      moduleName,
      { id },
      { force }
    )

    if (error) {
      console.warn(`${moduleName} fetchRecord API failed or cancelled`)
      let { isCancelled } = error || {}
      if (!isCancelled) throw error
    } else {
      return { data: data || {}, moduleName }
    }
  }

  static async deleteRecord(moduleName, idList) {
    let { error } = await API.deleteRecord(moduleName, idList)

    if (error) {
      console.warn(`${moduleName} deleteRecord API failed or cancelled`)
      let { isCancelled } = error || {}
      if (!isCancelled) throw error
    }
  }

  getImage(photoFieldName) {
    return `${getBaseURL()}/v2/files/preview/${this[photoFieldName]}`
  }

  getImageUrl(photoUrlFieldName) {
    return this[photoUrlFieldName]
  }

  isStateFlowEnabled() {
    let moduleMeta = viewStore.metaInfo
    let hasState = getProperty(this.moduleState, 'id')
    let isCustomModule = getProperty(moduleMeta, 'module.custom')
    let isEnabled = getProperty(moduleMeta, 'module.stateFlowEnabled')

    return hasState && (!isCustomModule || (isCustomModule && isEnabled))
  }

  canEdit() {
    return !this.isRecordLocked() && !this.isRequestedState()
  }

  isRecordLocked() {
    let { moduleState, moduleName } = this

    if (this.isStateFlowEnabled) {
      let hasState = getProperty(moduleState, 'id')
      return hasState && moduleStore.isStatusLocked(hasState, moduleName)
    }
    return false
  }

  isRequestedState() {
    let { approvalStatus } = this

    if (!isEmpty(approvalStatus)) {
      let statusObj = moduleStore.getApprovalStatus(approvalStatus.id)
      return getProperty(statusObj, 'requestedState', false)
    }
    return false
  }

  isApprovalEnabled() {
    let { approvalFlowId, approvalStatus } = this
    return !isEmpty(approvalFlowId) && !isEmpty(approvalStatus)
  }

  currentModuleState() {
    let { displayName, status } = this.moduleState || {}
    return !isEmpty(displayName) ? displayName : status || null
  }

  static async loadFormsList(moduleName) {
    let { data, error } = await API.get(`/v2/${moduleName}/forms`, {
      moduleName,
    })

    if (error) {
      console.warn(`${moduleName} /v2/forms API failed or cancelled`)
      let { isCancelled } = error || {}
      if (!isCancelled) throw error
    } else {
      let { forms } = data || {}
      return forms || []
    }
  }
  static async loadFilterableFields({ moduleName }) {
    let { data, error } = await API.get(
      `v2/fields/config/advancedFilterFields/${moduleName}`
    )
    if (error) {
      ftoast.critical($t('column_customization.error_message'))
    } else {
      return data?.fields || []
    }
  }

  static async loadFormData({ formId, moduleName, selectedForm }) {
    let { id, name } = selectedForm
    let params = { fetchFormRuleFields: true, forCreate: true }

    if (id === -1) {
      params = { ...params, formName: name }
    } else {
      params = { ...params, formId: formId || id }
    }

    let { data, error } = await API.get(`/v2/forms/${moduleName}`, params)
    if (error) {
      console.warn(`/v2/forms/${moduleName} formDetail API failed or cancelled`)
      let { isCancelled } = error || {}
      if (!isCancelled) throw error
    } else {
      let { form } = data || {}
      return form
    }
  }

  static async loadWidgets(filters) {
    let params = { filters: JSON.stringify(filters) }

    let { data, error } = await API.get('/v2/connectedApps/widgetList', params)

    if (error) {
      console.warn(`/v2/connectedApps/widgetList API failed or cancelled`)
      let { isCancelled } = error || {}
      if (!isCancelled) throw error
    } else {
      return data || {}
    }
  }

  async saveRecord(serilaizedData) {
    let { moduleName } = this
    let { id } = serilaizedData || {}

    try {
      if (isEmpty(id)) {
        return await API.createRecord(moduleName, {
          data: serilaizedData,
        })
      } else {
        return await API.updateRecord(moduleName, {
          id: id,
          data: serilaizedData,
        })
      }
    } catch (error) {
      console.warn(`${moduleName} create/update record API failed or cancelled`)
    }
  }

  deserialize(formObj) {
    let copiedFormObj = cloneDeep(formObj || {})
    let { sections } = copiedFormObj || {}

    if (!isEmpty(sections)) {
      sections.forEach(section => {
        let { fields } = section || {}

        if (!isEmpty(fields)) {
          let deserializedFields = fields.map(field => {
            return this.deserializeField(field)
          })
          setProperty(section, 'fields', deserializedFields)
        }
      })
    }
    return copiedFormObj
  }

  serialize(formObj, formModel, afterSerializeHook) {
    let { sections } = formObj
    let { subFormData, formId, actionFormId } = formModel
    let finalObj = {}

    if (!isEmpty(sections)) {
      sections.forEach(section => {
        let { fields } = section

        if (!isEmpty(fields)) {
          fields.forEach(field => {
            finalObj = this.serializeField(finalObj, field, formModel)
          })
        }
      })
    }

    if (!isNullOrUndefined(formModel.notifyRequester)) {
      finalObj.notifyRequester = formModel.notifyRequester
    }

    if (!isEmpty(finalObj)) {
      if (!isEmpty(subFormData)) {
        finalObj = { ...finalObj, ...subFormData }
      }
      finalObj = this.v3NullHandler(finalObj)
    }

    if (!isEmpty(formId)) {
      finalObj.formId = formId
      finalObj.actionFormId = actionFormId
    }
    if (!isEmpty(this.id)) {
      finalObj.id = this.id
    }

    if (!isEmpty(afterSerializeHook) && isFunction(afterSerializeHook)) {
      finalObj = afterSerializeHook({
        data: finalObj,
        formModel,
        formObj,
      })
    }
    return finalObj
  }

  v3NullHandler(data) {
    Object.entries(data || {}).forEach(([key, value]) => {
      let isValueEmpty =
        isObject(value) &&
        !isEmpty(value) &&
        key !== 'relations' &&
        key !== 'relationship' &&
        areValuesEmpty(value)

      if (isValueEmpty) {
        data[key] = null
      }
    })
    return data
  }
}
