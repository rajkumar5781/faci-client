import { findRouteForModule, pageTypes, getApp } from '@facilio/router'
import { isEmpty, isArray, isObject } from '@facilio/utils/validation'
import debounce from 'lodash/debounce'
import module from '../../../store/module'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { dset as setProperty } from 'dset'
import { ftoast } from '@facilio/design-system'
import { cloneDeep } from 'lodash'
import { formatCustomDate } from '../../../utils/formatter'
let moduleStore = module()
export default {
  created() {
    moduleStore.loadTicketStatus('workorder')
  },
  data() {
    return {
      isEmpty,
      portalApps: [],
      selectedPortalApp: [],
      selectedResourceType: null,
      appCategory: {
        PORTALS: 1,
        WORK_CENTERS: 2,
        FEATURE_GROUPING: 3,
        TOOLS: 4,
      },
    }
  },
  computed: {
    isNotPortal() {
      let {
        appCategory: { PORTALS },
      } = this.appCategory
      let { appCategory } = getApp()

      return appCategory !== PORTALS
    },
  },
  methods: {
    updateStatus(status) {
      if (status === 'On Hold') {
        this.rejectWorkOrderDialog()
        return
      } else if (
        status === 'Resolved' &&
        this.workorder.isWorkDurationChangeAllowed
      ) {
        this.workDurationCallBack = this.setStatusUpdate.bind(this, status)
        this.showWorkDurationDialog = true
        return
      }
      this.setStatusUpdate(status)
    },
    setStatusUpdate(status, actualDuration) {
      let statusField = {
        id: moduleStore.getTicketStatusByLabel(status, 'workorder').id,
        status: status,
      }

      let paramObj = { status: statusField }
      let workTimings = []
      let duration = -1
      if (actualDuration) {
        workTimings = actualDuration.workTimings
        duration = actualDuration.duration
      }
      if (status === 'Resolved') {
        this.resolveWorkOrder(
          [this.workorder.id],
          duration,
          workTimings,
          statusField
        )
      } else if (status) {
        this.updateWorkOrder([this.workorder.id], paramObj, workTimings)
        this.$set(this, 'workorder.status', statusField)
      }
      // this.workorder.status = statusField
    },

    rejectWorkOrderDialog() {
      let promptObj = {
        title: this.$t('maintenance._workorder.wo_pause_title'),
        message: this.$t('maintenance._workorder.wo_pause_message'),
        promptType: 'textarea',
        promptPlaceholder: this.$t(
          'maintenance._workorder.wo_pause_message_area'
        ),
        rbDanger: true,
        rbLabel: this.$t('maintenance._workorder.pause'),
      }

      this.$dialog.prompt(promptObj).then(value => {
        if (value !== null) {
          let newComments = {
            parentModuleLinkName: 'ticketnotes',
            parentId: this.workorder.id,
            body: value,
            notifyRequester: false,
          }
          this.setStatusUpdate('On Hold')
          API.post('v2/notes/add', {
            note: newComments,
            module: 'ticketnotes',
            ticketModuleName: 'workorder',
          }).then(response => {
            if (response.data) {
              this.comments.push(response.data.Notes)
              this.reset()
              this.loadactivitie()
            }
          })
        }
      })
    },
    formDate(time, format) {
      fomat = fomat || 'DD-MMM-YYYY'
      return formatCustomDate(time, format)
    },
    fetchWo(force) {
      return this.$store.dispatch('workorder/fetchWorkOrder', {
        id: this.openWorkorderId,
        force,
      })
    },
    fetchVendorWo(force) {
      return this.$store.dispatch('workorder/fetchVendorWorkOrder', {
        id: this.openWorkorderId,
        force,
      })
    },
    updateEmptyField() {
      if (
        this.selectedFieldUpdate.dataTypeEnum === 'DATE' ||
        this.selectedFieldUpdate.dataTypeEnum._name === 'DATE'
      ) {
        this.$refs.showcustomdatepicker.focus()
      } else if (
        this.selectedFieldUpdate.dataTypeEnum === 'DATE_TIME' ||
        this.selectedFieldUpdate.dataTypeEnum._name === 'DATE_TIME'
      ) {
        this.$refs.showcustomdatepicker.focus()
      } else {
        this.customFieldUpdate = true
      }
    },
    updateCustomFields() {
      let updateCustomfield = {}
      if (this.selectedFieldUpdate.dataTypeEnum._name === 'ENUM') {
        updateCustomfield[this.selectedFieldUpdate.name] =
          this.selectedFieldUpdate.enumMap[parseInt(this.selectedFieldValue)]
      } else {
        updateCustomfield[this.selectedFieldUpdate.name] =
          this.selectedFieldValue
      }
      this.updateWorkOrder([this.workorder.id], { data: updateCustomfield })
      this.customFieldUpdate = false
    },
    closeUpdateDialog() {
      this.customFieldUpdate = false
    },
    getSiteName(siteId) {
      if (this.sites) {
        let s = this.sites.find(i => i.id === siteId)
        if (!s) {
          return '---'
        }
        return s.name
      }
      return '---'
    },
    openAssetBreakDown(assetid, wosubject, woId) {
      this.assetBDSourceDetails.condition = wosubject
      this.assetBDSourceDetails.assetid = assetid
      this.assetBDSourceDetails.sourceId = woId
      this.assetBDSourceDetails.sourceType = 1
      this.showAssetBreakdown = true
    },
    openAsset(id) {
      if (id) {
        let { name } = findRouteForModule('asset', pageTypes.OVERVIEW) || {}

        if (name) {
          this.$router.push({
            name,
            params: {
              viewname: 'all',
              id,
            },
          })
        }
      }
    },
    openPM() {
      let { name } =
        findRouteForModule('preventivemaintenance', pageTypes.OVERVIEW) || {}

      if (name) {
        this.$router.push({
          name,
          params: {
            viewname: 'all',
            id: this.workorder.pm.id,
          },
        })
      }
    },
    updateSite(woId, siteId) {
      this.$dialog
        .confirm({
          title: this.$t('maintenance._workorder.change_site'),
          message: this.$t('maintenance._workorder.change_site_message'),
          rbDanger: true,
          rbLabel: this.$t('maintenance._workorder.change_site_message_label'),
        })
        .then(value => {
          if (value) {
            this.updateWorkOrder([woId], { siteId })
          }
        })
    },
    setDueDate(duedate) {
      if (duedate === -1) {
        this.duedate = Date.now() - 3600 * 1000 * 24
      } else {
        this.duedate = new Date(duedate)
      }
    },
    onChangeDueDate(pickVal) {
      this.updateWorkOrderDueDate(
        [this.workorder.id],
        new Date(pickVal).getTime()
      )
    },
    onChangeCustomField(pickVal) {
      let updateCustomfield = {}
      updateCustomfield[this.selectedFieldUpdate.name] = new Date(
        pickVal
      ).getTime()
      this.updateWorkOrder([this.workorder.id], { data: updateCustomfield })
    },
    // back() {
    //   this.$router.go(-1)
    // },
    closeAllTask(sectionId) {
      let taskIds = []
      let ticketId
      for (let idx in this.taskList) {
        for (let idx2 in this.taskList[idx]) {
          let task = this.taskList[idx][idx2]

          if (task.status.type === 'OPEN' && task.isUpdating) {
            ftoast.warning('Task Updating!!')
            return
          }

          ticketId = task.parentTicketId
          if (
            this.selectedTaskResource === null ||
            (this.selectedTaskResource !== null &&
              getProperty(task,'resource.id')=== this.selectedTaskResource &&
              task.status.type === 'OPEN')
          ) {
            if (sectionId) {
              if (this.taskList[idx][idx2].sectionId === Number(sectionId)) {
                taskIds.push(this.taskList[idx][idx2].id)
              }
            } else {
              taskIds.push(this.taskList[idx][idx2].id)
            }
          }
        }
      }
      let data = {
        taskIdList: taskIds,
        parentTicketId: ticketId,
      }
      if (this.selectedTaskResource === null) {
        API.post('v2/tasks/closeAllTask', data).then(response => {
          if (!response.error) {
            if (this.ticketstatusvalue !== 'Work in Progress') {
              let statusField = moduleStore.getTicketStatusByLabel(
                'Work in Progress',
                'workorder'
              )
              let { id: statusId = -1 } = statusField || {}
              setProperty(this, 'workorder.status.id', statusId)
            }
            this.loadTasks()
            //this.fetchWo(true) // commented this out, as we're gonna fetch the workorder obj from API, instead of from store
            this.reloadWorkOrderSummaryToUpdateState(response.data)
          } else {
            ftoast.critical(response.error.message)
          }
        })
      } else {
        API.post(
          '/v2/tasks/closeAllTask?resourceId=' + this.selectedTaskResource,
          data
        ).then(response => {
          if (!response.error) {
            if (this.ticketstatusvalue !== 'Work in Progress') {
              let statusField =
                moduleStore.getTicketStatusByLabel('Work in Progress')
              let { id: statusId = -1 } = statusField || {}
              // this.$set(this, 'workorder.status.id', statusId)
            }
            this.loadTasks()
            // this.fetchWo(true) // commented this out, as we're gonna fetch the workorder obj from API, instead of from store
            this.reloadWorkOrderSummaryToUpdateState(response.data)
          } else {
            ftoast.critical(response.error.message)
          }
        })
      }
    },
    loadFields() {
      this.loading = true
      let moduleName = 'workorder'
      API.get('/module/meta', { moduleName }).then(({ data }) => {
        this.fields = data.meta.fields
        this.loading = false
      })
    },
    taskStatus(task) {
      let completed = task.status.type === 'OPEN'
      let data = {
        id: [task.id],
        task: {
          id: task.id,
          parentTicketId: task.parentTicketId,
          sectionId: task.sectionId,
          status: {
            id: completed ? this.closedStatusId : this.openStatusId,
            type: completed ? 'CLOSED' : 'OPEN',
          },
        },
      }

      API.post('v2/tasks/updatestatus', data).then(response => {
        console.log('response: ', response)
        if (response.data) {
          if (typeof response.data === 'object') {
            if (completed) {
              task.status = {
                id: this.closedStatusId,
                type: 'CLOSED',
              }
              ftoast.success(this.$t('workorder.task_closed_success','Tasked Closed Successfully',{ns:'workorder'}))
            } else {
              task.status = {
                id: this.openStatusId,
                type: 'OPEN',
              }
              ftoast.success(this.$t('Tasked Reopened Successfully'))
            }
            if (this.ticketstatusvalue !== 'Work in Progress') {
              let statusField = moduleStore.getTicketStatusByLabel(
                'Work in Progress',
                'workorder'
              )
              let { id: statusId = -1 } = statusField || {}
              // this.$set(this, 'workorder.status.id', statusId)
            }
          } else {
            ftoast.critical('Operation failed')
          }
          //this.fetchWo(true) // commented this out, as we're gonna fetch the workorder obj from API, instead of from store
          // this.forceReloadIfTaskActionExecuted(response)
          // let { isTaskActionExecuted = false } = response.data || {}
          // if (!isTaskActionExecuted) {
          //   // Added this check as forceReloadIfTaskActionExecuted() already has onTransitionSuccess() to reload the page.
          //   this.reloadWorkOrderSummaryToUpdateState(
          //     response.data || {}
          //   )
          // }
          let updatedTask = response.data?.task || {}

          let clonedTaskList = cloneDeep(this.taskList)

          let taskListInSection = clonedTaskList[updatedTask.sectionId]

          let taskIndex = taskListInSection.findIndex(
            task => task.id === updatedTask.id
          )

          if (taskIndex !== -1) {
            taskListInSection[taskIndex].statusNew = updatedTask.statusNew
            taskListInSection[taskIndex].statusNewEnum =
              updatedTask.statusNewEnum
          } else {
            console.log('Task not found in the list.')
          }
          this.taskList = clonedTaskList
          this.getSortedTaskList()
        } else {
          ftoast.critical(response.error?.message || this.$t('error_occurred'))
        }
      })
    },
    reloadWorkOrderSummaryToUpdateState(response) {
      let { reloadWorkOrder = false } = response || {}
      if (reloadWorkOrder) {
        this.reloadSummary()
      }
    },
    changeTaskStatus(task) {
      let { preRequestStatus = -1 } = this.workorder || {}
      if (preRequestStatus !== 1 || preRequestStatus !== 4) {
        let isOpen = task.status.type === 'OPEN'

        let { id = -1 } = task || {}
        if (isOpen && id === -1) {
          ftoast.warning(
            this.$t('Please save the task before updating the status')
          )
          return
        }

        if (isOpen && task.inputType !== 1 && !task.inputValue) {
          ftoast.critical(this.$t('Enter details to complete the task'))
          return
        }

        if (isOpen && task.isUpdating) {
          ftoast.warning(this.$t('Task Updating!!'))
          return
        }

        if (isOpen && this.taskBulkList.length) {
          setTimeout(() => this.taskStatus(task), 500)
        } else {
          this.taskStatus(task)
        }
      }
    },
    showSpaceAssetChooser() {
      this.visibility = true
    },
    associate(selectedObj) {
      this.visibility = false
      this.selectedTask.resource = selectedObj
      this.selectedTask.selectedResourceName = selectedObj.name
    },
    onReadingChange(task, skipValidation) {
      if (!task.inputValue) {
        return
      }
      return this.addTask(task, skipValidation)
    },
    asyncTaskUpdate(doValidation = true, skipValidation = true) {
      let taskListContext = []
      let taskBulkListRef = this.taskBulkList

      if (this.waitBoolean) {
        if (this.taskBulkList) {
          this.taskBulkList.filter(task => {
            let data = {
              id: task.id,
              inputValue: task.inputValue,
              inputValues: task.inputValues,
              remarks: task.remarks,
              readingFieldId: task.readingFieldId,
              attachment: task.attachment,
              sectionId: task.sectionId,
            }
            if (
              this.$access.isLicenseEnabled('READING_FIELD_UNITS_VALIDATION')
            ) {
              data['readingFieldUnit'] = task.readingFieldUnit
            }

            if (task.inputTime > 0) {
              data.inputTime = task.inputTime
            }

            if (this.readingData === 3) {
              data.additionalInfo = {
                isMeterReset: true,
                meterResetConsumption: this.consumptionData,
              }
            }

            taskListContext.push(data)
          })
          if (taskListContext) {
            let promise = this.updateTaskList(
              { taskContextList: taskListContext },
              doValidation,
              skipValidation
            )

            Promise.all([promise]).finally(() => {
              /*
                Temporary fix to solve changestatus being called before updatetask command when the input is entered
                and task closed immediately
              */
              taskBulkListRef.forEach(task => {
                task.isUpdating = false
              })
            })
          }
        }
      }
    },
    asyncPreRequestUpdate(doValidation = true) {
      let taskListContext = []
      let taskBulkListRef = this.taskBulkList

      if (this.waitBoolean) {
        if (this.taskBulkList) {
          this.taskBulkList.filter(task => {
            let data = {
              id: task.id,
              inputValue: task.inputValue,
              inputValues: task.inputValues,
              remarks: task.remarks,
              readingFieldId: task.readingFieldId,
              preRequest: true,
            }
            taskListContext.push(data)
          })
          if (taskListContext) {
            this.updatePreRequestList(
              { taskContextList: taskListContext },
              doValidation
            ).finally(() => {
              /*
                Temporary fix to solve changestatus being called before updatetask command when the input is entered
                and task closed immediately
              */
              taskBulkListRef.forEach(task => {
                task.isUpdating = false
              })
            })
          }
        }
      }
    },
    updatePreRequestList(data, doValidation = true) {
      this.taskBulkList = []
      this.waitBoolean = false
      this.readingFieldSuggestions = []
      this.readingFieldError = null
      return API.post(
        `v2/tasks/updateAllTask?doValidation=${doValidation}`,
        data
      )
        .then(response => {
          if (response.data) {
            if (typeof response.data === 'object') {
              this.workorder.preRequestStatus = response.data.preRequestStatus
              this.waitBoolean = true
              this.noOfUpdatedTAsk =
                this.noOfUpdatedTAsk + response.data.rowsUpdated
              if (
                typeof response.data.error !== 'undefined' &&
                response.data.error
              ) {
                data.taskContextList.forEach(datum => {
                  if (!(datum.id in response.data.error)) {
                    this.$set(this.errorMap, datum.id, false)
                    this.$set(this.errorMessage, datum.id, null)
                  }
                })
                Object.assign(this.errorQue, response.data.error)
              } else {
                data.taskContextList.forEach(datum => {
                  this.$set(this.errorMap, datum.id, false)
                  this.$set(this.errorMessage, datum.id, null)
                })
              }
              if (this.taskBulkList.length > 0) {
                this.asyncPreRequestUpdate(doValidation)
                return
              } else {
                ftoast.success(
                  this.noOfUpdatedTAsk +
                    this.$t(
                      'maintenance._workorder.prerequisite_updated_success'
                    )
                )
                this.noOfUpdatedTAsk = 0
              }
              if (Object.keys(this.errorQue).length > 0) {
                this.$dialog
                  .confirm({
                    title: this.$t('_workoder.add_readings'),
                    message: this.$t('_workoder.add_readings_message'),
                    rbDanger: true,
                    rbLabel: this.$t('maintenance._workorder.save'),
                  })
                  .then(function (val) {
                    if (val) {
                      let tasks = this.newTaskList
                        .map(v => v.taskList)
                        .reduce((a, b) => a.concat(b))
                        .filter(v => {
                          return v.id in this.errorQue
                        })
                      let taskContextList = []
                      tasks.forEach(t => {
                        let data = {
                          id: t.id,
                          inputValue: t.inputValue,
                          inputValues: t.inputValues,
                          remarks: t.remarks,
                          readingFieldId: t.readingFieldId,
                        }
                        taskContextList.push(data)
                      })
                      this.errorQue = {}
                      this.updatePreRequestList({ taskContextList }, false)
                    } else {
                      Object.keys(this.errorQue).forEach(key => {
                        this.$set(
                          this.errorMessage,
                          key,
                          this.errorQue[key].message
                        )
                        this.$set(this.errorMap, key, true)
                      })
                    }
                    this.errorQue = {}
                  })
              }
              this.taskBulkList = []
            } else {
              ftoast.critical(this.$t('workorder.prerequisite_update_fail',"Prerequisite updation failed",{ns:'workorder'}))
            }
            this.loadactivitie()
          }
        })
        .finally(() => {
          this.waitBoolean = true
        })
    },
    setFormData(prop, object, formdata) {
      if (typeof object === 'string' || object || object === false) {
        if (Array.isArray(object)) {
          object.forEach((element, index) => {
            this.setFormData(prop + '[' + index + ']', element, formdata)
          })
        } else if (typeof object === 'object') {
          if (isFileObject(object)) {
            if (object instanceof File) {
              formdata.append(prop + 'FileName', object.name)
            }
            formdata.append(prop + 'ContentType', object.type)
            formdata.append(prop, object, object.name)
          } else {
            for (let key in object) {
              if (
                typeof object[key] === 'string' ||
                object[key] ||
                object[key] === false
              ) {
                this.setFormData(prop + '.' + key, object[key], formdata)
              }
            }
          }
        } else {
          formdata.append(prop, object)
        }
      }
    },
    updateTaskList(data, doValidation = true, skipValidation = true) {
      this.taskBulkList = []
      this.waitBoolean = false
      let apiurl = `v2/tasks/updateAllTask?doValidation=${doValidation}`
      if (this.$access.isLicenseEnabled('READING_FIELD_UNITS_VALIDATION')) {
        apiurl = `v2/tasks/updateAllTask?doValidation=${doValidation}&skipValidation=${skipValidation}`
        if (data.taskContextList.length > 0) {
          this.currentTaskObj = data.taskContextList[0]
        }
      }
      let formData = data
      // its assumed that there is only one task that is being saved
      if (data.taskContextList[0].attachment) {
        formData = new FormData()
        formData.append('module', data.taskContextList[0].attachment.module)
        formData.append('recordId', data.taskContextList[0].attachment.recordId)
        let attachment = data.taskContextList[0].attachment
        delete data.taskContextList[0].attachment
        this.setFormData('taskContextList', data.taskContextList, formData)
        if (attachment.beforeFile) {
          formData.append(
            'beforeAttachment',
            attachment.beforeFile,
            attachment.beforeFileName
          )
        }
        if (attachment.afterFile) {
          formData.append(
            'afterAttachment',
            attachment.afterFile,
            attachment.afterFileName
          )
        }
      }
      return API.post(apiurl, formData)
        .then(response => {
          if (response.data) {
            if (typeof response.data === 'object') {
              if (response.data.taskErrors) {
                response.data.taskErrors.forEach(taskError => {
                  if (taskError.mode == 1 && taskError.failType == 1) {
                    this.readingFieldErrorToggle = true
                    this.readingFieldError = taskError.message
                    this.currentValue = taskError.currentValue
                    this.previousValue = taskError.previousValue
                  } else if (taskError.mode == 2) {
                    this.readingFieldSuggestionToggle = true
                    this.readingFieldSuggestions.push(taskError.message)
                    this.suggestedUnits.push(taskError.suggestedUnit)
                  }
                })
              } else if (
                response.data.requiresRemarks ||
                response.data.requiresAttachment
              ) {
                if (isArray(data.taskContextList)) {
                  let id = data.taskContextList[0].id
                  let selectedTask
                  this.newTaskList.forEach(section => {
                    if (
                      !isEmpty(section.taskList) &&
                      isArray(section.taskList) &&
                      !selectedTask
                    ) {
                      selectedTask = section.taskList.find(
                        task => task.id === id
                      )
                      if (selectedTask) {
                        this.selectedTask = selectedTask
                        this.addTaskRemarksDialog =
                          response.data.requiresRemarks
                        this.addAttachmentRequiredDialog =
                          response.data.requiresAttachment
                        this.showMandatoryInputsDialog = true
                        return
                      }
                    }
                  })
                }
              } else {
                this.workorder.preRequestStatus = response.data.preRequestStatus
                this.waitBoolean = true
                this.noOfUpdatedTAsk =
                  this.noOfUpdatedTAsk + response.data.rowsUpdated
                if (
                  typeof response.data.error !== 'undefined' &&
                  response.data.error
                ) {
                  data.taskContextList.forEach(datum => {
                    if (!(datum.id in response.data.error)) {
                      this.$set(this.errorMap, datum.id, false)
                      this.$set(this.errorMessage, datum.id, null)
                    }
                  })
                  Object.assign(this.errorQue, response.data.error)
                }
                if (this.taskBulkList.length > 0) {
                  this.asyncTaskUpdate(doValidation, skipValidation)
                  return
                } else {
                  ftoast.success(
                    (this.noOfUpdatedTAsk > 1
                      ? this.noOfUpdatedTAsk + ' '
                      : '') +
                      this.$t(
                        'workorder.task_updated_success',
                        'Task updated successfully!',
                        { ns: 'workorder' }
                      )
                  )
                  this.noOfUpdatedTAsk = 0
                  this.readingFieldErrorToggle = false
                  this.readingFieldSuggestionToggle = false
                  this.readingData = 6
                  this.consumptionData = ''
                }
                if (this.ticketstatusvalue !== 'Work in Progress') {
                  let statusField = moduleStore.getTicketStatusByLabel(
                    'Work in Progress',
                    'workorder'
                  )
                  let { id: statusId = -1 } = statusField || {}
                  // this.$set(this, 'workorder.status.id', statusId)
                }
                if (Object.keys(this.errorQue).length > 0) {
                  this.$dialog
                    .confirm({
                      title: this.$t('_workoder.add_readings'),
                      message: this.$t('_workoder.add_readings_message'),
                      rbDanger: true,
                      rbLabel: this.$t('maintenance._workorder.save'),
                    })
                    .then(function (val) {
                      if (val) {
                        let tasks = this.newTaskList
                          .map(v => v.taskList)
                          .reduce((a, b) => a.concat(b))
                          .filter(v => {
                            return v.id in this.errorQue
                          })
                        let taskContextList = []
                        tasks.forEach(t => {
                          let data = {
                            id: t.id,
                            inputValue: t.inputValue,
                            inputValues: t.inputValues,
                            remarks: t.remarks,
                            readingFieldId: t.readingFieldId,
                          }
                          taskContextList.push(data)
                        })
                        this.errorQue = {}
                        this.updateTaskList({ taskContextList }, false)
                      } else {
                        Object.keys(this.errorQue).forEach(key => {
                          this.$set(
                            this.errorMessage,
                            key,
                            this.errorQue[key].message
                          )
                          this.$set(this.errorMap, key, true)
                        })
                      }
                      this.errorQue = {}
                    })
                }
                this.taskBulkList = []
              }
            } else {
              ftoast.critical(this.$t('workorder.task_updated_failed',"Task updation failed",{ns:'workorder'}))
            }
            this.loadactivitie()
            // this.$root.$emit('reloadWO')
            this.forceReloadIfTaskActionExecuted(response)
          } else {
            if (data.taskContextList && data.taskContextList.length === 1) {
              let cl = JSON.parse(JSON.stringify(this.taskErrorMap))
              cl[data.taskContextList[0].id] = response.error.message
              this.taskErrorMap = cl
            }
            ftoast.critical(response.error.message)
          }
        })
        .finally(() => {
          this.waitBoolean = true
        })
    },
    forceReloadIfTaskActionExecuted(response) {
      // force reload the UI, if isTaskActionExecuted, through WorkFlow
      let { isTaskActionExecuted } = response.data || {}
      if (isTaskActionExecuted) {
        this.onTransitionSuccess()
      }
    },

    getNextWorkOrderTime() {
      return API.get(
        `/v2/workorders/getNextWorkOrderTime?workOrderId=${this.openWorkorderId}`
      )
    },

    waitFunc: debounce(function () {
      if (this.taskBulkList.length) {
        this.asyncTaskUpdate()
      }
    }, 5000),

    addTask(task, skipValidation) {
      if (task.id && task.id !== -1) {
        task.isUpdating = true
        this.taskBulkList.push(task)
        this.asyncTaskUpdate(null, skipValidation)
      } else {
        let formData = {}
        if (task.subject.trim() === '') {
          ftoast.critical(
            this.$t('workorder.task_title_required', 'Please enter a task', {
              ns: 'workorder',
            })
          )
          return true
        }
        let emptyOption = false
        if(task.enableInput && Number(task.inputType)=== 5){
          task.options.forEach(function(opt, index) {
            if (opt === "") {
              emptyOption=true
             }
          })
          if(emptyOption){
            ftoast.critical("Please ensure that all options are filled before proceeding.")
            return true
          }
        }
        if (isEmpty(task.resource)) {
          if (!isEmpty(this.workorder.resource)) {
            let { id, name } = this.workorder.resource
            task.resource = { id, name }
          } else {
            delete task.resource
          }
        } else if (!isObject(task.resource)) {
          task.resource = { id: task.resource }
        }
        if (!task.assignedTo) {
          delete task.assignedTo
        }
        if (!task.readingFieldId) {
          task.readingFieldId = -1
        }
        if (task.inputType === '5' || task.inputType === '6') {
          let taskOptions = []
          for (let key in task.options) {
            let option = task.options[key]
            taskOptions[key] = option.name
          }
          task.options = taskOptions
        }

        task.parentTicketId = this.workorder.id
        formData.task = task

        API.post('/task/add', formData).then(function (response) {
          if(response.error){
            ftoast.critical(response.error.message)
          }
          else{
          task.id = response.data.taskId
          let clonedTaskList = cloneDeep(this.taskList)
          let taskListInSection = clonedTaskList[task.sectionId]
          taskListInSection.push(task)
          this.getSortedTaskList()
          this.taskList = clonedTaskList
          this.newTask = {
            subject: '',
            description: '',
            resource: {
              id: -1,
            },
            isReadingTask: false,
            readingFieldId: -1,
            options: [],
            taskType: -1,
            enableInput: false,
            attachmentRequired: false,
            id: -1,
          }
          this.loadactivitie()
          ftoast.success(this.$t('Tasked Added Successfully'))

          // show the + button back on screen
          this.isUserAddingTask = false
          this.onTransitionSuccess()
        }
        })
      }
    },
    addPreRequest(task) {
      if (task.id !== -1) {
        task.inputValue = task.inputValue === task.truevalue ? '1' : '0'
        task.isUpdating = true
        this.taskBulkList.push(task)
        this.asyncPreRequestUpdate()
        task.inputValue =
          task.inputValue === '1' ? task.truevalue : task.falsevalue
      }
    },
    addPreRequesites(taskList) {
      taskList.forEach(task => {
        if (task.id !== -1) {
          task.inputValue = task.inputValue === task.truevalue ? '1' : '0'
          task.isUpdating = true
          this.taskBulkList.push(task)
        }
      })
      this.asyncPreRequestUpdate()
      taskList.forEach(task => {
        task.inputValue =
          task.inputValue === '1' ? task.truevalue : task.falsevalue
      })
    },
    addTaskOption(selectedTask) {
      selectedTask.options.push({ name: '' })
    },
    getPMType(type) {
      return this.$store.getters.getTicketTypePickList()[type]
    },
    addNewSection() {
      //
    },
    // Adding task with section
    addNewTaskToASection(sectionId) {
      if (isEmpty(sectionId)) {
        return
      }

      // disable the + button when user is adding a new task
      this.isUserAddingTask = true

      // Add a new task to the section with ID "sectionId"
      this.newTask = {
        subject: '',
        description: '',
        resource: {
          id: -1,
        },
        isReadingTask: false,
        readingFieldId: null,
        options: [],
        taskType: -1,
        enableInput: false,
        inputType: 1,
        attachmentRequired: false,
        status: {
          type: 'OPEN',
          typeCode: 1,
          id: -1,
        },
        id: -1,
        sectionId: sectionId,
      }
      if (!this.taskList[sectionId]) {
        this.taskList[sectionId] = []
      }
      this.taskList[sectionId].push(this.newTask)
      this.showTaskDetails(this.newTask)
    },
    // Adding task without section
    addNewTask() {
      // if (this.selectedTask && this.selectedTask.subject !== '') {
      //   this.addTask(this.selectedTask)
      // }

      // disable the + button when user is adding a new task
      this.isUserAddingTask = true

      let lastSection = -1
      for (let key in this.taskList) {
        if (this.taskList.hasOwnProperty(key)) {
          if (
            key !== -1 ||
            (key === -1 && Object.keys(this.taskList).length === 1)
          ) {
            lastSection = key
          }
        }
      }
      this.newTask = {
        subject: '',
        description: '',
        resource: {
          id: -1,
        },
        isReadingTask: false,
        readingFieldId: null,
        options: [],
        taskType: -1,
        enableInput: false,
        inputType: 1,
        attachmentRequired: false,
        status: {
          type: 'OPEN',
          typeCode: 1,
          id: -1,
        },
        id: -1,
        sectionId: lastSection,
      }
      let taskListCopy = this.taskList
      if (!taskListCopy[lastSection]) {
        taskListCopy[lastSection] = []
      }
      taskListCopy[lastSection].push(this.newTask)
      this.$set(this, 'taskList', {})
      this.$set(this, 'taskList', taskListCopy)
      this.showTaskDetails(this.newTask)
    },
    checkAndShowTask(task) {
      if (this.showAddTask) {
        this.showTaskDetails(task)
      }
    },
    checkAndShowPreRequest(task) {
      if (this.showAddPreRequest) {
        this.showPreRequestDetails(task)
      }
    },
    checkOptionsLength(options) {
      return options.length <= 2 && !options.some(option => option.length > 10)
    },
    onSelectInput() {
      if (this.selectedTask.inputType === '2') {
        this.fillTaskReadings()
      }
    },
    fillTaskReadings() {
      if (
        this.selectedTask.resource &&
        this.selectedTask.resource.resourceType === 2 &&
        this.selectedTask.resource.category
      ) {
        let categoryId = getProperty(this, 'selectedTask.resource.category.id')
        let result = util.loadAssetReadingFields(null, categoryId, false)
        result.then(fields => {
          this.$set(this, 'taskReadingFields', fields)
        })
      } else if (this.selectedTask.resource) {
        let parentCategoryId = -1
        if (this.selectedTask.resource.category) {
          parentCategoryId = this.selectedTask.resource.category.id
        }
        let resourceId = getProperty(this, 'selectedTask.resource.id')
        let result = util.loadSpaceReadingFields(
          resourceId,
          false,
          parentCategoryId,
          null
        )
        result.then(fields => {
          this.$set(this, 'taskReadingFields', fields)
        })
      }
    },
    showTaskDetails(task) {
      this.showAddTask = true
      this.selectedTask = task
    },
    showPreRequestDetails(preRequest) {
      this.showAddPreRequest = true
      this.selectedPreRequest = preRequest
    },
    focusCommentBox() {
      this.$refs.commentBoxRef.focus()
      this.commentFocus = true
    },
    loadactivitie() {
      if (this.$refs['activitiesDiv']) {
        this.$refs['activitiesDiv'].loadActivities()
      }
    },
    reset() {
      this.newComment = {
        parentModuleLinkName: 'ticketnotes',
        parentId: this.openWorkorderId,
        body: null,
        notifyRequester: false,
        selectedPortalApp: this.selectedPortalApp,
      }
    },
    sort(arr) {
      let len = arr.length
      for (let i = len - 1; i >= 0; i--) {
        for (let j = 1; j <= i; j++) {
          if (arr[j - 1].seq > arr[j].seq) {
            let temp = arr[j - 1]
            arr[j - 1] = arr[j]
            arr[j] = temp
          }
        }
      }
      return arr
    },
    async loadTasks() {
      this.loading = true

      if (this.openWorkorderId <= 0) {
        return // Exit early if openWorkorderId is not valid.
      }

    await  API.get(`/v2/tasks/parent/${this.openWorkorderId}`)
        .then(response => {
          console.log('response===>', response)
          if (!response.data) {
            return // Exit early if there's no data in the response.
          }
          // Check if the tasks are sequenced, if not, set sequencedData to false.

          // Process other data (taskList, sections, preRequestList, preRequestSections).
          this.taskList = response.data.tasks || {}
              for (let idx in this.taskList) {
                for (let idx2 in this.taskList[idx]) {
                 
                  if (this.taskList[idx][idx2].inputTime === -1) {
                    this.taskList[idx][idx2].inputTime = this.workorder.createdTime
                  }    
              
                }
              }
          this.sections = response.data.sections || {}
          this.preRequestList = response.data.prerequisites || {}
          this.preRequestSections = response.data.prerequisiteSections || {}

          // Finally, get the sorted task list.
          this.getSortedTaskList()
          this.loading = false
        })
        .catch(error => {
          // Handle error here
        })
    },

    // Temp...needs to be sorted in server itthis
    // getSortedTaskList(taskTab) {
    //   let sorted = []
    //   if (this.taskList[-1]) {
    //     let list = this.taskList[-1]
    //     if (this.selectedTaskResource > 0) {
    //       list = list.filter(task => {
    //         if (
    //           task.resource &&
    //           task.resource.id === this.selectedTaskResource &&
    //           taskTab === 1
    //         ) {
    //           return task
    //         } else if (
    //           task.resource &&
    //           task.resource.id === this.selectedTaskResource &&
    //           taskTab === 2 &&
    //           task.statusNewEnum === 'OPEN'
    //         ) {
    //           return task
    //         } else if (
    //           task.resource &&
    //           task.resource.id === this.selectedTaskResource &&
    //           taskTab === 3 &&
    //           task.statusNewEnum === 'CLOSED'
    //         ) {
    //           return task
    //         }
    //         return {}
    //       })
    //     }
    //     sorted.push({ sectionId: -1, taskList: list })
    //   }
    //   let { sections } = this
    //   if (!isEmpty(sections)) {
    //     let seqList = Object.keys(sections).map(secId => ({
    //       secId,
    //       sequence: this.getSection(secId),
    //     }))
    //     sorted.push(
    //       ...seqList
    //         .sort((a, b) => a.sequence - b.sequence)
    //         .map(obj => ({
    //           sectionId: obj.secId,
    //           section: obj,
    //           taskList:
    //             this.selectedTaskResource > 0
    //               ? this.taskList[obj.secId].filter(
    //                   task =>
    //                     task.resource &&
    //                     task.resource.id === this.selectedTaskResource
    //                 )
    //               : this.taskList[obj.secId],
    //         }))
    //     )
    //   }
    //   return sorted.filter(obj => !isEmpty(obj.taskList))
    // },

    getSortedTaskList() {
      let sorted = []
      if (this.taskList[-1]) {
        let list = this.taskList[-1]
        if (this.selectedTaskResource > 0) {
          if (this.selectedResourceType === 'meter') {
            list = list.filter((task = {}) => {
              let { meter = {} } = task
              let { id: meterId } = meter
              return !isEmpty(meter) && meterId === this.selectedTaskResource
            })
          } else {
            list = list.filter(
              task =>
                task.resource && task.resource.id === this.selectedTaskResource
            )
          }
        }
        sorted.push({ sectionId: -1, taskList: list })
        this.sortedTaskList = sorted
      }
      let { sections } = this
      console.log('sections-->', sections)
      if (!isEmpty(sections)) {
        let seqList = Object.keys(sections).map(secId => ({
          secId,
          sequence: this.getSection(secId),
        }))
        console.log('seqlist-->', seqList)
        console.log('sections-->', sections)
        seqList.sort((a, b) => a.sequence - b.sequence)

        seqList.forEach(obj => {
          let sectionId = obj.secId
          let taskList = this.taskList[sectionId]

          if (this.selectedTaskResource > 0) {
            if (this.selectedResourceType === 'meter') {
              taskList = taskList.filter((task = {}) => {
                let { meter = {} } = task
                let { id: meterId } = meter
                return !isEmpty(meter) && meterId === this.selectedTaskResource
              })
            } else {
              taskList = taskList.filter(
                task =>
                  task.resource &&
                  task.resource.id === this.selectedTaskResource
              )
            }
          }
          sorted.push({
            sectionId,
            taskList,
          })
          this.sortedTaskList = sorted
        })
      }
      return this.sortedTaskList
    },
    getSection(secId) {
      let { taskList } = this
      let { [secId]: section } = taskList || {}
      let task = !isEmpty(section) ? section[0] : {}
      return getProperty(task, 'sequence', -1)
    },
    closedisplay() {
      this.showAddTask = false
    },
    closedisplayPreRequest() {
      this.showAddPreRequest = false
    },
    ticketstatusvalue(id) {
      if (id !== null) {
        let status = this.$store.getters.getTicketStatus(id, 'workorder').status
        if (status) {
          return status
        }
      }
      return ''
    },
    assignWorkOrder(assignedTo, assignmentGroup) {
      let assignObj = {}
      assignObj.id = [this.workorder.id]
      if (assignedTo) {
        assignObj.assignedTo = assignedTo
      }
      if (assignmentGroup) {
        assignObj.assignmentGroup = assignmentGroup
      }
      assignObj.status = {
        id: moduleStore.getTicketStatusByLabel('Assigned', 'workorder').id,
        status: 'Assigned',
      }

      this.$store.dispatch('workorder/assignWorkOrder', assignObj).then(() => {
        this.$dialog.notify(
          this.$t('maintenance._workorder.wo_assigned_success')
        )
        this.loadactivitie()
        this.fetchWo(true)
      })
    },
    updateWorkOrderDueDate(idList, datetime) {
      let updateObj = {
        id: idList,
        fields: {
          dueDate: datetime,
        },
      }
      this.$store
        .dispatch('workorder/updateWorkOrder', updateObj)
        .then(() => {
          this.loading = true
          ftoast.success(this.$t('workorder.wo_duedate_update_success',"Work Order Due Date updated successfully!",{ns:'workorder'}))
          this.loading = false
          this.fetchWo(true)
        })
        .catch(() => {
          ftoast.critical('Workorder Due Date updation failed')
        })
    },
    updateWorkOrder(idList, field, actualTimings) {
      let updateObj = {
        id: idList,
        fields: field,
        actualTimings,
      }
      this.workorder.loadTimer = false
      this.$store
        .dispatch('workorder/updateWorkOrder', updateObj)
        .then(() => {
          ftoast.success(this.$t('workorder.wo_update_success',"Work Order(s) updated successfully!",{ns:'workorder'}))

          this.fetchWo(true)
          this.loadactivitie()
        })
        .catch(() => {
         ftoast.critical(this.$t('workorder.wo_update_failed',"Work Order(s) updation failed",{ns:'workorder'}))
        })
    },
    resolveWorkOrder(idList, actualWorkDuration, actualTimings) {
      if (!this.checkInputTasksCompletion()) {
        return
      }
      let updateObj = {
        id: idList,
      }
      if (actualWorkDuration > 0) {
        updateObj.actualWorkDuration = actualWorkDuration
        updateObj.actualTimings = actualTimings
      }
      this.$store
        .dispatch('workorder/resolve', updateObj)
        .then(() => {
          ftoast.success(this.$t('workorder.wo_resolved_success',"Work Order resolved successfully!",{ns:'workorder'}))
          this.loading = false
          this.fetchWo(true)
          this.loadactivitie()
          this.updateGAEvent('Resolved', 'Resolve btn')
        })
        .catch(() => {
          ftoast.critical(this.$t('workorder.wo_resolved_failed',"Please complete all tasks before Resolve",{ns:'workorder'}))
        })
    },
    updateGAEvent(action, label) {
      try {
        Vue.prototype.$gtag &&
          Vue.prototype.$gtag.event('custom_event', {
            event_category: 'Workorder',
            event_action: action,
            event_label: label,
            event_value: 1,
          })

        console.log('sent event update status')
      } catch (e) {
        console.log('failed to send event' + e)
      }
    },
    formatTime(date, period, enableFormating) {
      if (date === null) {
        date = 0
      }
      if (date > 0) {
        let dateFormat = period || 'DD-MM-YYY'
        return formatCustomDate(date, dateFormat)
      } else {
        return ''
      }
    },
    closeWO(status) {
      if (!this.checkInputTasksCompletion()) {
        return
      }
      if (
        this.workorder.isWorkDurationChangeAllowed &&
        this.ticketStatusValue !== 'Resolved'
      ) {
        this.workDurationCallBack = this.closeWorkOrder.bind(this)
        this.showWorkDurationDialog = true
        return
      } else if (status) {
        let statusField = {
          id: moduleStore.getTicketStatusByLabel(status, 'workorder').id,
          status: status,
        }
        this.$set(this, 'workorder.status', statusField)
      }
      this.closeWorkOrder()
    },
    closeWorkOrder(actualDuration) {
      let paramObj = {
        id: [this.workorder.id],
      }
      if (actualDuration) {
        if (actualDuration.duration !== -1) {
          paramObj.actualWorkDuration = actualDuration.duration
        }
      }
      this.$store
        .dispatch('workorder/closeWorkOrder', paramObj)
        .then(() => {
          ftoast.success(this.$t('workorder.wo_closed_success',"Work Order(s) closed successfully!",{ns:'workorder'}))
        
          this.closeSummary()
          this.updateGAEvent('Closed', 'close btn')
          this.fetchWo(true)
        })
        .catch(() => {
          ftoast.critical(this.$t('workorder.wo_close_error_failed',"Work Order(s) cannot be closed!",{ns:'workorder'}))
        })
    },
    checkInputTasksCompletion() {
      for (let idx in this.taskList) {
        if (this.taskList.hasOwnProperty(idx)) {
          let check = this.taskList[idx].some(
            task => task.status.type === 'OPEN'
          )
          if (check) {
            ftoast.warning(this.$t('workorder.wo_resolved_failed',"Please complete all tasks before Resolve",{ns:'workorder'}))
            return false
          }
        }
      }
      return true
    },
    closeSummary() {
      this.summoryview = false
      let newpath = this.$route.path.substring(
        0,
        this.$route.path.indexOf('/summary/')
      )
      this.$router.replace({ path: newpath })
    },
    download() {
      this.downloadSummary = true
      window.open(
        window.location.protocol +
          '//' +
          window.location.host +
          '/app/pdf/summarydownloadreport?workorderId=' +
          this.openWorkorderId
      )
    },
    updateTaskChartData() {
      if (this.workorder) {
        this.taskChartData = {
          value: this.workorder.noOfTasks > -1 ? this.workorder.noOfTasks : 0,
          currentValue:
            this.workorder.noOfClosedTasks > -1
              ? this.workorder.noOfClosedTasks
              : 0,
          color: '#9c5fb8,#f87a60',
          unit: '',
          centerText: [
            {
              label: this.$t('maintenance._workorder.completed'),
            },
            {
              label:
                this.$t('maintenance._workorder.of') +
                ' ' +
                (this.workorder.noOfTasks > -1 ? this.workorder.noOfTasks : 0) +
                ' ' +
                this.$t('maintenance._workorder.tasks'),
            },
          ],
        }
      }
    },
    selectItem(item, index) {
      this.selectedInventory = item
      this.selectedInventory.index = index
      this.loadindividualTrackingList([item])
    },
    handeler1(item, index) {
      if (item.addedQuantity === 0) {
        this.inventoryList[index].checked = true
      }
    },
    addindIvidualTrackingItem() {
      this.inventoryList[
        this.inventoryList.findIndex(rt => rt.id === this.selectedInventory.id)
      ].invidualList = [
        ...this.individualItemListwrapper.filter(rt => rt.checked),
        ...this.selectedInventory.invidualList,
      ]
      this.selectedInventory = null
      this.individualItemList = []
    },
    selectTool(tool, index) {
      this.selectedTool = tool
      this.selectedTool.index = index
      this.loadindividualToolTrackingList([tool])
    },
    addindIvidualTrackingTool() {
      this.toolsList[
        this.toolsList.findIndex(rt => rt.id === this.selectedTool.id)
      ].invidualList = [
        ...this.individualToolListwrapper.filter(rt => rt.checked),
        ...this.selectedTool.invidualList,
      ]
      this.selectedTool = null
      this.individualToolList = []
    },
    closeTaskRemarksDialog() {
      this.addTaskRemarksDialog = false
    },
    openWoEditForm() {
      this.editFormVisibilty = true
    },
    isLookupSimpleField(field) {
      let { displayType } = field || {}
      return displayType === 'LOOKUP_SIMPLE'
    },
    isLookupLocationField(field) {
      let { displayType } = field || {}
      return displayType === 'GEO_LOCATION'
    },
    loadTaskProgress() {
      if (this.workorder) {
        let total = this.workorder.noOfTasks > -1 ? this.workorder.noOfTasks : 0
        let closed =
          this.workorder.noOfClosedTasks > -1
            ? this.workorder.noOfClosedTasks
            : 0
        this.taskChartData = {
          value: total,
          currentValue: closed,
          open: total - closed,
          color: '#9c5fb8,#f87a60',
          unit: '',
          centerText: [
            {
              label: this.$t('maintenance._workorder.completed'),
            },
            {
              label:
                this.$t('maintenance._workorder.of') +
                ' ' +
                (this.workorder.noOfTasks > -1 ? this.workorder.noOfTasks : 0) +
                ' ' +
                this.$t('maintenance._workorder.tasks'),
            },
          ],
        }
      }
    },
  },
}
