<template>
  <FContainer>
    <FContainer
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <portal :to="`action-${widget.id}-${widget.name}`">
        <FButton
          v-if="canShowCreate"
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="openTaskCreateDialog"
        >
          {{ $t('tasks.add_task', { ns: 'fsm' }) }}
        </FButton></portal
      >
    </FContainer>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FSpinner :size="30"
    /></FContainer>
    <FContainer height="100%" v-else-if="!isEmpty(tasks)">
      <FTable
        :columns="columns"
        :data="tasks"
        :rounded="false"
        :hideBorder="true"
        @onCellClick="openOverview"
      >
        <template #[`cell.id`]="{ row, prop }"
          ><FText>#{{ row[prop] }}</FText>
        </template>
        <template #[`cell.status`]="{ row, prop }">
          <FTags
            v-if="row[prop] !== '---'"
            appearance="status"
            :text="statusDisplayName(row[prop])"
            :statusType="statusType(row[prop])"
          />
          <FContainer v-else>{{ row[prop] }}</FContainer>
        </template>
        <template #[`cell.workType`]="{ row, prop }"
          ><FTags
            v-if="row[prop] !== '---'"
            :text="row[prop]"
            statusType="default"
            appearance="simple"
          ></FTags>
          <FContainer v-else>{{ row[prop] }}</FContainer>
        </template>
        <template #[`cell.skills`]="{ row, prop }"
          ><MultiLookupTag
            v-if="!isEmpty(row[prop])"
            :values="row[prop]"
            :toShow="1"
          ></MultiLookupTag>
          <FContainer v-else>---</FContainer>
        </template>
        <template #[`cell.serviceAppointment`]="{ row, prop }">
            <FButton v-if="!isEmpty(row[prop])" appearance="link" @click="redirectToAppointmentOverview(row[prop].id)">
              <FText appearance="bodyReg14" color="textCaption">
                {{ getProperty(row[prop], 'code', '---') }}
              </FText>
            </FButton>
            <FContainer v-else>{{ '---' }}</FContainer>
        </template>
        <!-- <template #float-bar>
        <FButton appearance="secondary">Delete</FButton>
      </template> -->
        <template #[`cell.action`]="data">
          <FContainer display="flex">
            <FIcon
              v-if="canShowEdit(data)"
              group="default"
              name="edit"
              size="16"
              @click="editTask(data)"
            />
            <FIcon
              v-if="canShowDelete(data)"
              group="default"
              name="trash-can"
              size="16"
              @click="deleteTask(data)"
            />
          </FContainer> </template
      ></FTable>
    </FContainer>
    <FContainer
      v-else
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FEmptyState
        :title="$t('tasks.task_title', { ns: 'fsm' })"
        :description="$t('tasks.task_description', { ns: 'fsm' })"
        vertical
        size="M"
        illustration="end-of-list"
      >
        <template #buttons>
          <FButton
            v-if="canShowCreate"
            appearance="secondary"
            size="medium"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            @click="openTaskCreateDialog"
          >
            {{ $t('tasks.add_task', { ns: 'fsm' }) }}
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>

    <TaskDetails
      v-if="taskDetailsVisibility"
      :visiblity="taskDetailsVisibility"
      :recordId="recordId"
      :serviceOrderId="details.id"
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
      @onUpdate="updateServiceTask"
      @onCreate="createTask"
    >
    </TaskEditMode>
  </FContainer>
</template>
<script>
import {
  FTable,
  FButton,
  FTags,
  FText,
  FIcon,
  FContainer,
  FSpinner,
  ftoast,
  FEmptyState,
  FDivider,
} from '@facilio/design-system'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { MultiLookupTag, TaskDetails, TaskEditMode } from '@facilio/ui/tasks'
import getProperty from 'dlv'
import FetchViewsMixin from '../../../../components/views/FetchViews.vue'
import { RelatedListData } from '../../../../components/page-builder/widgets/relatedList/RelatedListData'
import { findRouteForModule, pageTypes } from '@facilio/router'

export default {
  props: ['details', 'widget', 'fitToViewArea','moduleName'],
  mixins:[FetchViewsMixin],
  components: {
    FTable,
    FTags,
    FText,
    FSpinner,
    FIcon,
    MultiLookupTag,
    FContainer,
    FButton,
    TaskDetails,
    TaskEditMode,
    FEmptyState,
    FDivider,
  },
  data() {
    return {
      confirmLoading: false,
      showEditMode: false,
      recordId: null,
      taskDetailsVisibility: false,
      visibility: false,
      isLoading: false,
      tasks: [],
      relatedModuleName: 'serviceTask',
      relatedFieldName: 'serviceOrder',
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
          displayName: 'Appointment',
          name: 'serviceAppointment',
          id: 6,
        }
      ],
      isEmpty,
      getProperty,
      serviceTask: null,
    }
  },
  created() {
    this.fitToViewArea()
    this.init()
  },
  computed: {
    canShowCreate() {
      let { details } = this
      let { status } = details || {}
      let { typeCodeEnum } = status || {}
      return typeCodeEnum !== 'CLOSED'
    },
  },
  methods: {
    async redirectToAppointmentOverview(id) {
      let moduleName = 'serviceAppointment'
      let { $route } = this
      let viewname = await this.fetchView(moduleName)
      let { query } = $route
      if (!isEmpty(id) && !isEmpty(viewname)) {
        let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
        let route = { name, params: { viewname, id }, query }
        this.$router.push(route)
      }
    },
    statusDisplayName(status) {
      let { displayName } = status || {}
      return displayName
    },
    statusType(status) {
      let { statusType } = status || {}
      return statusType
    },
    init() {
      this.getTasksList()
    },
    async getTasksList(force = true) {
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
        return tasks.map(task => {
          let { skills } = task || {}
          return {
            id: task.id,
            name: getProperty(task, 'name', '---'),
            taskCode: getProperty(task, 'taskCode', '---'),
            status: !isEmpty(task.status) ? task.status : '---',
            workType: getProperty(task, 'workType.name', '---'),
            skills,
            serviceAppointment: getProperty(task, 'serviceAppointment', {})
          }
        })
      }
      return []
    },
    async createTask(task) {
      this.confirmLoading = true
      let { details, relatedModuleName, moduleName } = this
      let { id } = details || {}
      task['serviceOrder'] = {
        id,
      }
      let { error } = await API.post(`v3/modules/data/${moduleName}/${relatedModuleName}`, {
        data: task,
      })
      if (error) {
        let { message } = error || 'Error Occured'
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        this.visibility = false
        ftoast.success('Task created Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })
        this.getTasksList()
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
    async deleteTask(task) {
      let { relatedModuleName,moduleName } = this
      let { row } = task || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { error } = await API.delete(`v3/modules/data/${moduleName}/${relatedModuleName}/${id}`)
        if (error) {
          let { message } = error || 'Error Occured'
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          await this.getTasksList()
          ftoast.success('Deleted Successfully', {
            menuType: 'alerts',
            timeout: 3000,
          })
        }
      }
    },
    canShowEdit(data) {
      let { row } = data || {}
      let { status } = row || {}
      let { recordLocked } = status || {}
      return !recordLocked
    },
    canShowDelete(data) {
      let { row } = data || {}
      let { status } = row || {}
      let { deleteLocked } = status || {}
      return !deleteLocked
    },
    async editTask(data) {
      let { relatedModuleName,moduleName } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { data, error } = await API.get(`v3/modules/data/${moduleName}/${relatedModuleName}/${id}`)
        if (error) {
          let { message } = error || 'Error Occured'
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          let {serviceTask} = data || {}
          let {
            serviceOrderPlannedItems,
            serviceOrderPlannedTools,
            serviceOrderPlannedServices,
          } = serviceTask || {}

          this.serviceTask = {
            ...(serviceTask || {}),
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
          delete this.serviceTask['serviceOrderPlannedItems']
          delete this.serviceTask['serviceOrderPlannedTools']
          delete this.serviceTask['serviceOrderPlannedServices']

          this.visibility = true
          this.showEditMode = true
        }
      }
    },
    async updateServiceTask(serviceTask) {
      this.confirmLoading = true
      let { relatedModuleName,moduleName } = this
      let { id } = serviceTask
      let params = {
        id,
        data: serviceTask,
      }
      let { error } = await API.patch(`v3/modules/data/${moduleName}/${relatedModuleName}/${id}`, params)
      if (error) {
        let { message } = error || 'Error Occured'
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        this.cancelDialog()
        this.confirmLoading = false
        ftoast.success('Updated Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        this.getTasksList()
      }
    },
  },
}
</script>
