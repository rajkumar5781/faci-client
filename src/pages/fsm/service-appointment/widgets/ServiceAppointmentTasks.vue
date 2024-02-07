<template>
  <div class="h-full">
    <FContainer
      v-if="!recordClosed"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <portal :to="`action-${widget.id}-${widget.name}`">
        <FDropdown
          v-if="!isEmpty(tasks)"
          :name="$t('service_appointment.associate_tasks', { ns: 'fsm' })"
          :options="[
            {
              label: $t('service_appointment.add_task', { ns: 'fsm' }),
              value: 2,
            },
          ]"
          split
          :loading="false"
          contentWidth="200px"
          @dropdown="openTaskCreateDialog"
          @click="showLookupWizard"
          :buttonProps="buttonPropsObj"
        />
      </portal>
    </FContainer>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FSpinner :size="30"
    /></FContainer>
    <FContainer
      v-else-if="isEmpty(tasks)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FEmptyState
        illustration="end-of-list"
        :title="
          $t('service_appointment.no_tasks_emptystate_title', { ns: 'fsm' })
        "
        :description="
          $t('service_appointment.no_tasks_emptystate_desc', { ns: 'fsm' })
        "
        :vertical="true"
        :size="'M'"
      >
        <template #buttons>
          <FContainer
            gap="containerLarge"
            display="flex"
            justifyContent="flex-start"
          >
            <FButton
              appearance="secondary"
              @click="openTaskCreateDialog"
              size="small"
            >
              {{ $t('service_appointment.add_task', { ns: 'fsm' }) }}
            </FButton>
            <FButton
              appearance="primary"
              @click="showLookupWizard"
              size="small"
            >
              {{ $t('service_appointment.associate_tasks', { ns: 'fsm' }) }}
            </FButton>
          </FContainer>
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="space-between"
    >
      <FContainer overflow="scroll">
        <FTable
          :columns="columns"
          :data="tasks"
          :showSelectBar="false"
          :rounded="false"
          :hideBorder="true"
          @onCellClick="openOverview"
        >
          <template #[`cell.status`]="{ row, prop }">
            <FTags
              v-if="row[prop] !== '---'"
              appearance="status"
              :text="statusDisplayName(row[prop])"
              :statusType="statusType(row[prop])"
            />
            <div v-else>{{ row[prop] }}</div>
          </template>
          <template #[`cell.workType`]="{ row, prop }">
            <FTags
              v-if="row[prop] !== '---'"
              :text="row[prop]"
              statusType="default"
              appearance="simple"
            ></FTags>
            <div v-else>{{ row[prop] }}</div>
          </template>
          <template #[`cell.skills`]="{ row, prop }">
            <MultiLookupTag
              v-if="!isEmpty(row[prop])"
              :values="row[prop]"
              :toShow="1"
            ></MultiLookupTag>
            <div v-else>---</div>
          </template>
          <template #[`cell.execute`]="{ row }">
            <FContainer
              gap="containerLarge"
              display="flex"
              justifyContent="flex-start"
            >
              <FButton
                v-for="(button, idx) in systemButtonsForRecord(row)"
                :key="idx"
                appearance="secondary"
                size="small"
                @click="executeButtonAction(button, row)"
              >
                {{ button.label }}
              </FButton>
            </FContainer>
          </template>
        </FTable>
      </FContainer>
      <FContainer
        display="flex"
        alignItems="center"
        padding="containerLarge"
        backgroundColor="backgroundCanvas"
        marginTop="containerLarge containerXLarge"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-start"
        position="sticky"
        bottom="0"
      >
        <FPagination
          :pageSize="pageSize"
          :total="totalRecords"
          :currentPage="currentPage"
          :disabled="disabled"
          @nextClick="currentChange"
          @prevClick="currentChange"
          @currentChange="currentChange"
        />
      </FContainer>
    </FContainer>
    <TaskDetails
      v-if="taskDetailsVisibility"
      :visiblity="taskDetailsVisibility"
      :recordId="recordId"
      :serviceOrderId="serviceOrderId"
      @cancelDialog="
        () => {
          taskDetailsVisibility = false
        }
      "
    ></TaskDetails>
    <TaskEditMode
      v-if="visibility"
      :visibility="visibility"
      :editMode="showEditMode"
      :confirmLoading="confirmLoading"
      :serviceTask="serviceTask"
      @cancelDialog="cancelDialog"
      @onCreate="createTask"
    >
    </TaskEditMode>
    <LookupWizard
      v-if="canShowLookupWizard"
      :canShowLookupWizard.sync="canShowLookupWizard"
      @setLookupFieldValue="setLookupFieldValue"
      :field.sync="lookupField"
      :parentModuleName="moduleName"
    />
    <OngoingTimeSheetWarning
      v-if="showTimeSheetConflictWarningModel"
      :timeConflictData="errorData"
      @complete="forceExecuteButtonAction"
      @cancel="cancelTimeSheetConflictWarning"
    />
    <AppointmentCompleteConfirmation
      v-if="showCompleteAppointmentWarningModel"
      :warning="errorData"
      @completeAppointment="completeAppointment"
      @completeTask="forceExecuteButtonAction"
      @cancel="toggleCompleteAppointmentWarning(false)"
    ></AppointmentCompleteConfirmation>
  </div>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FTable,
  FButton,
  FTags,
  ftoast,
  FSpinner,
  FEmptyState,
  FPagination,
  FDropdown,
} from '@facilio/design-system'
import { MultiLookupTag, TaskDetails, TaskEditMode } from '@facilio/ui/tasks'
import { LookupWizard } from '@facilio/ui/new-forms'
import { getFieldOptions } from '../../../../utils/picklist'
import getProperty from 'dlv'
import OngoingTimeSheetWarning from '../actions/OngoingTimeSheetWarning.vue'
import AppointmentCompleteConfirmation from '../actions/AppointmentCompleteConfirmation.vue'
import { RelatedListData } from '../../../../components/page-builder/widgets/relatedList/RelatedListData'

export default {
  name: 'ServiceTasks',
  props: [
    'details',
    'widget',
    'fitToViewArea',
    'reloadSummary',
    'moduleName',
    'record',
  ],
  components: {
    FText,
    FContainer,
    FTable,
    FButton,
    FSpinner,
    FTags,
    MultiLookupTag,
    TaskEditMode,
    TaskDetails,
    FEmptyState,
    FPagination,
    FDropdown,
    LookupWizard,
    OngoingTimeSheetWarning,
    AppointmentCompleteConfirmation,
  },
  data() {
    return {
      systemButtons: {},
      isLoading: false,
      confirmLoading: false,
      showEditMode: false,
      recordId: null,
      taskDetailsVisibility: false,
      visibility: false,
      tasks: [],
      relatedModuleName: 'serviceTask',
      relatedFieldName: 'serviceAppointment',
      buttonActionHashMap: {},
      buttonMap: [],
      buttonIconsArray: [],
      buttons: {
        startWork: this.startWork,
        pause: this.pause,
        resume: this.resume,
        complete: this.complete,
      },
      columns: [
        {
          displayName: 'Task Name',
          name: 'name',
          id: 1,
          fixed: true,
          resize: true,
          width: 200,
          clickable: true,
        },
        {
          displayName: 'Status',
          name: 'status',
          id: 2,
        },
        {
          displayName: 'Code',
          name: 'taskCode',
          id: 3,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Work Type',
          name: 'workType',
          id: 4,
        },
        {
          displayName: 'Skills',
          name: 'skills',
          id: 5,
        },
        {
          displayName: '',
          name: 'execute',
          id: 6,
        },
      ],
      serviceTask: null,
      lookupField: {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'serviceTask',
        name: 'serviceTasks',
        field: {
          lookupModule: {
            name: 'serviceTask',
            displayName: 'Tasks',
          },
        },
        config: { lookupModuleName: 'serviceTask' },
        multiple: true,
        filters: {},
      },
      canShowLookupWizard: false,
      pageSize: 10,
      totalPage: 1,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      showTimeSheetConflictWarningModel: false,
      showCompleteAppointmentWarningModel: false,
      errorData: null,
    }
  },
  created() {
    this.fitToViewArea()
    this.constructLookupFilters()
    this.getServiceTasksList()
  },
  computed: {
    buttonPropsObj() {
      return {
        appearance: 'secondary',
        size: 'small',
      }
    },
    serviceOrderId() {
      let { details } = this
      let { serviceOrder } = details || {}
      let { id } = serviceOrder || {}
      return id
    },
    recordClosed() {
      let { record = {} } = this
      let status = getProperty(record, 'status.status', '')
      return ['completed', 'cancelled'].includes(status)
    },
  },
  methods: {
    isEmpty,
    async constructLookupFilters() {
      let { details: serviceAppointment } = this
      let { serviceOrder } = serviceAppointment || {}
      let { id: soId } = serviceOrder || {}
      let count = 0
      if (!isEmpty(serviceAppointment)) {
        let { error, options } = await getFieldOptions({
          field: {
            lookupModuleName: 'serviceTaskStatus',
            skipDeserialize: true,
          },
        })
        if (!error) {
          this.statusOptions = options
          let val = Object.keys(options || {}).find(
            key => options[key] === 'new'
          )
          if (!isEmpty(val)) {
            let statusCriteria = {
              operatorId: 36,
              value: [val],
              id: ++count,
            }
            this.$set(this.lookupField.filters, 'status', statusCriteria)
          }
        }
        if (!isEmpty(soId)) {
          let serviceOrderCriteria = {
            operatorId: 36,
            value: [`${soId}`],
            id: ++count,
          }
          this.$set(
            this.lookupField.filters,
            'serviceOrder',
            serviceOrderCriteria
          )
        }

        this.$set(this.lookupField.filters, 'drillDownPattern', '( 1 and 2 )')
      }
    },
    showLookupWizard() {
      this.canShowLookupWizard = true
    },
    async setLookupFieldValue(props) {
      let { lookupField: selectedLookupField, details, tasks } = this
      let { id } = details || {}
      let { field } = props

      if (isEmpty(selectedLookupField)) this.selectedLookupField = field

      let { selectedItems } = field || {}
      if (!isEmpty(selectedItems) && !isEmpty(id)) {
        let tasksToAssociate = selectedItems.map(task => {
          return { id: task.value }
        })
        let params = {
          serviceTasks: tasksToAssociate,
          appointmentId: id,
        }
        let { error } = await API.post(
          '/v3/serviceAppointment/associateTask',
          params
        )
        if (error) {
          let { message, title = '' } = error
          ftoast.critical(message || this.$t('error_occurred'), {
            title,
            menuType: 'alerts',
            timeout: 5000,
          })
        } else {
          let message = 'Task Associated Successfully!'
          ftoast.success(message, {
            title: '',
            menuType: 'alerts',
            timeout: 5000,
          })
          this.refreshData()
        }
      }
      this.$set(this.lookupField, 'options', [])
      this.$set(this.lookupField, 'selectedItems', [])
    },
    systemButtonsForRecord(record) {
      let { systemButtons } = this
      let { id } = record || {}
      return (systemButtons || {})[id] || []
    },
    statusDisplayName(status) {
      let { displayName } = status || {}
      return displayName
    },
    statusType(status) {
      let { statusType } = status || {}
      return statusType
    },
    async getServiceTasksList(force = true) {
      this.isLoading = true
      let {
        details,
        moduleName,
        relatedFieldName,
        relatedModuleName,
        currentPage,
        pageSize,
      } = this
      let { id: recordId } = details || {}

      let params = {
        moduleName: relatedModuleName,
        viewname: 'hidden-all',
        page: currentPage,
        perPage: pageSize,
        force,
        recordId,
        relatedFieldName,
        currentModuleName: moduleName,
      }
      try {
        let recordList = await RelatedListData.fetchAll(params)
        if (isArray(recordList)) {
          this.tasks = this.getTasksArray(recordList)
          await this.loadSystemButtons(recordList)
        }
        this.totalRecords = RelatedListData.recordListCount
      } catch (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title,
          menuType: 'alerts',
          timeout: 5000,
        })
      }
      this.isLoading = false
    },
    getTasksArray(tasks) {
      if (!isEmpty(tasks)) {
        let tasksList = tasks.map(task => {
          let { skills } = task || {}
          return {
            id: task.id,
            name: getProperty(task, 'name', '---'),
            taskCode: getProperty(task, 'taskCode', '---'),
            status: !isEmpty(task.status) ? task.status : '---',
            workType: getProperty(task, 'workType.name', '---'),
            skills,
          }
        })
        return tasksList
      }
      return []
    },
    async createTask(task) {
      this.confirmLoading = true
      let { details, relatedModuleName, moduleName } = this
      let { id, serviceOrder } = details || {}
      let { id: serviceOrderId } = serviceOrder || {}
      task['serviceOrder'] = {
        id: serviceOrderId,
      }
      task['serviceAppointment'] = {
        id,
      }
      let { error } = await API.post(
        `v3/modules/data/${moduleName}/${relatedModuleName}`,
        {
          data: task,
        }
      )
      if (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title,
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        this.visibility = false
        let message = 'Task Created Successfully!'
        ftoast.success(message, {
          title: '',
          menuType: 'alerts',
          timeout: 5000,
        })
        this.refreshData()
      }
      this.confirmLoading = false
    },
    openTaskCreateDialog() {
      this.visibility = true
    },
    cancelDialog() {
      this.visibility = false
      this.showEditMode = false
    },
    openOverview(record) {
      this.taskDetailsVisibility = true
      this.recordId = record.id
    },
    async loadSystemButtons(tasks) {
      this.buttonIconsArray = []
      let { relatedModuleName } = this || {}
      if (!isEmpty(tasks)) {
        let recordIds = tasks.map(task => task.id)
        let url = `v2/systemButton/serviceAppointment/serviceTask/getAvailableButtonsForList`
        let bodyReg = {
          recordIds: recordIds,
          moduleName: relatedModuleName,
          positionType: 2,
        }
        let { error, data } = await API.post(url, bodyReg, { force: true })
        if (error) {
          let { message } = error
          this.$message.error(message)
        } else {
          tasks.forEach(record => {
            let { systemButtons, systemButtonsForRecords } = data || {}

            let { evaluatedButtonIds: buttonIds } =
              (systemButtonsForRecords || []).find(r => r.id === record.id) ||
              {}

            if (!isEmpty(buttonIds)) {
              this.systemButtons[record.id] = buttonIds.map(buttonId => {
                let { buttonTypeEnum, identifier, name, id } =
                  systemButtons[buttonId] || {}
                return {
                  identifier: identifier,
                  label: name,
                  buttonId: id,
                  recordParentId: record.id,
                }
              })
            }
          })
        }
      }
    },
    async executeButtonAction(button, record, params) {
      let { refreshData } = this || {}
      let { error, data } = await this.invokeSystemButton(
        button,
        record,
        params
      )
      if (error) {
        let { errorData = {}, message = '', title = '' } = error
        if (!isEmpty(errorData)) {
          let {
            errorCode,
            errorTitle = '',
            errorMessage,
            errorSeverity = '',
            errorRelatedData,
          } = errorData
          if (errorCode === 'TIMESHEET_ALREADY_RUNNING') {
            this.errorData = {
              title: errorTitle,
              severity: errorSeverity.toLowerCase(),
              message: errorMessage,
              errorRelatedData,
              button,
              record,
            }
            this.toggleTimeSheetConflictWarning(true)
          } else if (errorCode === 'TASK_COMPLETE_APPOINTMENT') {
            this.errorData = {
              title: errorTitle,
              severity: errorSeverity.toLowerCase(),
              message: errorMessage,
              button,
              record,
            }
            this.toggleCompleteAppointmentWarning(true)
          } else {
            ftoast.critical(errorMessage || this.$t('error_occurred'), {
              title: errorTitle,
              menuType: 'alerts',
              timeout: 5000,
            })
          }
        } else {
          ftoast.critical(message || this.$t('error_occurred'), {
            title: title,
            menuType: 'alerts',
            timeout: 5000,
          })
        }
      } else {
        if (data?.serviceTaskStatusActions) {
          let { message = '', title = '' } = data.serviceTaskStatusActions
          ftoast.success(message, {
            title: title,
            menuType: 'alerts',
            timeout: 5000,
          })
        }
        this.errorData = null
        this.toggleTimeSheetConflictWarning(false)
        this.toggleCompleteAppointmentWarning(false)
        refreshData()
      }
    },
    refreshData() {
      this.reloadSummary()
      this.getServiceTasksList()
    },
    async invokeSystemButton(button, record, params = {}) {
      let { id } = record || {}
      let { identifier } = button || {}
      if (!isEmpty(id) && !isEmpty(identifier)) {
        let url = `v3/module/serviceAppointment/serviceTask/${id}/systemButton/${identifier}`
        this.isLoading = true
        let { error, data } = await API.post(url, { validate: true, ...params })
        this.isLoading = false
        return { error, data }
      } else {
        ftoast.critical(this.$t('error_occurred'))
      }
    },
    currentChange(page) {
      this.currentPage = page
      this.getServiceTasksList()
    },
    cancelTimeSheetConflictWarning() {
      this.showTimeSheetConflictWarningModel = false
    },
    toggleTimeSheetConflictWarning(action) {
      this.showTimeSheetConflictWarningModel = action
    },
    toggleCompleteAppointmentWarning(action) {
      this.showCompleteAppointmentWarningModel = action
    },
    forceExecuteButtonAction() {
      let { errorData } = this
      let { button, record } = errorData || {}
      if (!isEmpty(button) && !isEmpty(record)) {
        this.executeButtonAction(button, record, { validate: false })
      } else {
        ftoast.critical(this.$t('error_occurred'))
      }
      this.errorData = null
      this.toggleCompleteAppointmentWarning(false)
      this.toggleTimeSheetConflictWarning(false)
    },
    async completeAppointment(params = {}) {
      let { record = {}, refreshData } = this
      let id = getProperty(record, 'id', null)
      if (isEmpty(id)) return
      let url = `v3/module/serviceAppointment/${id}/systemButton/complete`
      let { error, data } = await API.post(url, params)
      if (!error) {
        if (data?.serviceAppointmentStatusActions) {
          let { message = '', title = '' } =
            data.serviceAppointmentStatusActions
          ftoast.success(message, {
            title: title,
            menuType: 'alerts',
            timeout: 5000,
          })
        }
        this.errorData = null
        this.toggleCompleteAppointmentWarning(false)
        this.toggleTimeSheetConflictWarning(false)
        refreshData()
      } else {
        let { message = '', title = '' } = error || {}
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
      }
    },
  },
}
</script>
