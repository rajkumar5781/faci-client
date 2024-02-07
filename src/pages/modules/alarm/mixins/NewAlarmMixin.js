// mixin for NewFaultsList, FaultsSummary and BMSAlarmsList, BMSAlarmsSummary independent of store
import { ftoast } from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  findRouteForModule,
  isWebTabsEnabled,
  pageTypes,
} from '@facilio/router'
import { getWorkFlowResult } from '../util'
import moment from 'moment'
import { CustomModuleData } from '../../../../data/CustomModuleData'

export default {
  data() {
    return {
      occurrenceList: null,
      eventList: null,
      dialogVisible: false,
      createWoIds: [],
      accentObject: {
        Critical: {
          accentColor: 'red',
          accentLevel: 'L1',
        },
        Major: {
          accentColor: 'red',
          accentLevel: 'L2',
        },
        Minor: {
          accentColor: 'red',
          accentLevel: 'L3',
        },
        Warning: {
          accentColor: 'yellow',
          accentLevel: 'L2',
        },
        Info: {
          accentColor: 'blue',
          accentLevel: 'L2',
        },
        Clear: {
          accentColor: 'green',
          accentLevel: 'L3',
        },
      },
    }
  },
  computed: {
    modelDataClass() {
      return CustomModuleData
    },
  },
  methods: {
    //data fetching methods
    //used in both list and summary
    getFieldFromViewDetail(name) {
      let { viewDetailFields } = this
      let viewDetailField = viewDetailFields.find(viewDetail => {
        let { fieldName = {} } = viewDetail
        return fieldName === name
      })
      let { field = {} } = viewDetailField || {}
      return field
    },
    getAlarmDisplayName(alarm) {
      let { severity } = alarm || {}
      let { displayName } = severity || {}
      return displayName || '--'
    },
    getSensorDisplayName(alarm) {
      let { readingField } = alarm || {}
      let { displayName } = readingField || {}
      return displayName || '--'
    },

    async acknowledgeAlarms(alarm, option = 'list') {
      let { id } = alarm
      let dataObj = {
        acknowledged: true,
        acknowledgedBy: this.$account.user,
        acknowledgedTime: Date.now(),
      }
      let params = {
        data: dataObj,
        moduleName: this.currentModuleName || this.moduleName,
        id,
      }
      let { error } = await API.updateRecord(this.moduleName, params)
      if (!error) {
        if (option === 'list') {
          await this.refreshRecordDetails()
        } else {
          await this.refreshData()
        }
      } else {
        ftoast.critical(error)
      }
    },

    //occurrence and event list
    async getOccurrenceFromId(alarmId, force = false) {
      try {
        let moduleName = 'alarmoccurrence'
        let filters = {
          alarm: { operatorId: 9, value: [alarmId.toString()] },
        }
        let { page } = this
        let params = {
          moduleName,
          filters,
          page,
          force,
          orderBy: 'CREATED_TIME',
          orderType: 'desc',
        }

        this.occurrenceList = await this.modelDataClass.fetchAll(params)
      } catch (errorMsg) {
        ftoast.critical(errorMsg)
      }
    },
    async getEventsFromId(alarmId, force = false) {
      try {
        let moduleName = 'baseevent'
        let filters = {
          baseAlarm: { operatorId: 9, value: [alarmId.toString()] },
        }
        let { page } = this
        let params = {
          moduleName,
          filters,
          page,
          force,
          orderBy: 'CREATED_TIME',
          orderType: 'desc',
        }

        this.eventList = await this.modelDataClass.fetchAll(params)
      } catch (errorMsg) {
        ftoast.critical(errorMsg)
      }
    },
    // work order stuff
    createWoDialog(idList) {
      this.createWoIds = idList
      this.dialogVisible = true
    },
    closeWoDialog() {
      this.createWoIds = []
      this.dialogVisible = false
    },
    openWorkorder(id) {
      if (id > 0) {
        if (isWebTabsEnabled()) {
          let { name } =
            findRouteForModule('workorder', pageTypes.OVERVIEW) || {}
          if (name) {
            this.$router.push({ name, params: { viewname: 'all', id } })
          }
          return
        }
      } else {
        return false
      }
    },

    //export stuff
    async exportEvent() {
      let { selectedFields } = this
      let array = {
        alarmId: this.alarm.id,
        fieldId: selectedFields,
        type: this.exportType,
        parentId: this.alarm.resource.id,
      }
      let url = 'event/eventExport'
      ftoast.success(
        this.$t('alarm.downloading', 'Downloading ...', { ns: 'alarm' })
      )
      let { error, data } = await API.post(url, array)
      if (isEmpty(error)) {
        this.exportDownloadUrl = data.fileUrl
        this.showAssetExport = false
      }
    },
    getAlarmAccentTagObject(alarm, property = 'severity') {
      let { accentObject } = this
      let { [property]: severity } = alarm
      let { severity: name } = severity || {}
      return accentObject[name]
    },
    getAccentColor(alarm, property) {
      let { accentColor } = this.getAlarmAccentTagObject(alarm, property)
      return accentColor
    },
    getAccentLevel(alarm, property) {
      let { accentLevel } = this.getAlarmAccentTagObject(alarm, property)
      return accentLevel
    },
    canAcknowledge(alarm) {
      const { acknowledged } = alarm || {}
      let hasPermission = this.$access.hasPermission('alarm:ACKNOWLEDGE_ALARM')

      if (
        isEmpty(acknowledged) ||
        acknowledged === 'No' ||
        acknowledged === false
      ) {
        return this.isActiveAlarm(alarm) && hasPermission
      }

      return false
    },
    isWoCreated(alarm) {
      let { lastWoId: woId } = alarm || {}
      return !isEmpty(woId) && woId > 0
    },
    isActiveAlarm(alarm) {
      let { severity } = alarm
      if (severity.hasOwnProperty('primaryValue')) {
        let { primaryValue } = severity
        return primaryValue !== 'Clear'
      }
      return severity !== 'Clear'
    },
    getResourceNameForAlarm(alarm) {
      let { resource } = alarm || {}
      let { name } = resource || {}
      return name || '--'
    },
    async loadMeanMetrics() {
      let { moduleName } = this

      let params = this.details.id
      let value = await getWorkFlowResult(moduleName, params)
      this.$set(this.details, 'metricsPromise', value)
      return this.details.metricsPromise
    },
    getDuration(value, format, padValue = 2) {
      if (!value) {
        return {
          Hrs: 0,
        }
      }

      let duration = moment.duration(parseInt(value, 10), format)
      let days = parseInt(duration.asDays(), 10)
      let hours = duration.hours()
      let minutes = duration.minutes()
      let seconds = duration.seconds()

      const pad = val => String(val).padStart(padValue, '0')

      if (days > 0) {
        return hours
          ? {
              Days: pad(days),
              Hrs: pad(hours),
            }
          : {
              Days: pad(days),
            }
      } else if (hours > 0) {
        return minutes
          ? {
              Hrs: pad(hours),
              Mins: pad(minutes),
            }
          : {
              Hrs: pad(hours),
            }
      } else if (minutes > 0) {
        return minutes
          ? {
              Mins: pad(minutes),
            }
          : {
              Secs: pad(seconds),
            }
      }
      return {
        Secs: pad(seconds),
      }
    },
  },
}
