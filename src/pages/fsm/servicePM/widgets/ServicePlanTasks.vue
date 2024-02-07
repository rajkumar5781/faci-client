<template>
  <FContainer>
    <FContainer
      v-if="canShowActionButtons"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <portal :to="`action-${widget.id}-${widget.name}`">
        <FButton
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="
            () => {
              taskVisibility = true
            }
          "
        >
          {{ $t('tasks.add_task', { ns: 'fsm' }) }}
        </FButton>
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
        <template #[`cell.action`]="data" v-if="canShowActionButtons">
          <FContainer display="flex">
            <FIcon
              group="default"
              name="edit"
              size="16"
              @click="editTask(data)"
            />
            <FIcon
              group="default"
              name="trash-can"
              size="16"
              @click="deleteTask(data)"
            />
          </FContainer>
        </template>
      </FTable>
    </FContainer>
    <FContainer
      v-else
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FEmptyState
        :title="$t('tasks.tasks_empty_msg', { ns: 'fsm' })"
        :description="$t('tasks.task_empty_msg_description', { ns: 'fsm' })"
        :vertical="false"
        size="S"
        illustration="end-of-list"
      >
      </FEmptyState>
    </FContainer>
    <TaskEditMode
      v-if="taskVisibility"
      :visibility="taskVisibility"
      :editMode="showEditMode"
      :confirmLoading="confirmLoading"
      :serviceTask="serviceTaskTemplate"
      @cancelDialog="cancelDialog"
      @onUpdate="updateServiceTask"
      @onCreate="createTask"
    >
    </TaskEditMode>
    <TaskDetails
      v-if="taskDetailsVisibility"
      :visiblity="taskDetailsVisibility"
      :recordId="recordId"
      :summaryView="true"
      moduleName="serviceTaskTemplate"
      @cancelDialog="
        () => {
          taskDetailsVisibility = false
        }
      "
    ></TaskDetails>
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
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { MultiLookupTag, TaskEditMode, TaskDetails } from '@facilio/ui/tasks'
import getProperty from 'dlv'
export default {
  name: 'ServicePlanTasks',
  props: ['details', 'widget', 'fitToViewArea'],
  components: {
    FTable,
    FTags,
    FText,
    FSpinner,
    FIcon,
    MultiLookupTag,
    FContainer,
    FButton,
    FEmptyState,
    FDivider,
    TaskEditMode,
    TaskDetails,
  },
  data() {
    return {
      taskDetailsVisibility: false,
      serviceTaskTemplate: null,
      confirmLoading: false,
      showEditMode: false,
      taskVisibility: false,
      isLoading: false,
      tasks: [],
      moduleName: 'serviceTaskTemplate',
      columns: [
        {
          displayName: 'Name',
          name: 'name',
          id: 1,
          fixed: true,
          resize: true,
          width: 200,
          clickable: true,
        },
        {
          displayName: 'Code',
          name: 'taskCode',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Work Type',
          name: 'workType',
          id: 3,
        },
        {
          displayName: 'Skills',
          name: 'skills',
          id: 4,
        },
      ],
      isEmpty,
    }
  },
  created() {
    this.fitToViewArea()
    this.init()
  },
  computed: {
    canShowActionButtons() {
      let { details } = this
      let { moduleName } = details || {}
      return moduleName === 'servicePlan'
    },
    servicePlanId() {
      let { details } = this
      let { moduleName, id } = details || {}
      return moduleName === 'servicePlan'
        ? id
        : getProperty(details, 'servicePlan.id')
    },
  },
  methods: {
    cancelDialog() {
      this.taskVisibility = false
      this.showEditMode = false
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
    openOverview(record) {
      this.taskDetailsVisibility = true
      this.recordId = record.id
    },
    async getTasksList() {
      this.isLoading = true
      let { servicePlanId } = this
      if (!isEmpty(servicePlanId)) {
        let params = {
          filters: JSON.stringify({
            servicePlan: {
              operatorId: 36,
              value: [String(servicePlanId)],
            },
          }),
        }
        let { list, error } = await API.fetchAll(this.moduleName, params, {
          force: true,
        })
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          this.tasks = this.getTasksArray(list)
        }
        this.serviceTaskTemplate = null
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
          }
        })
      }
      return []
    },
    async createTask(task) {
      this.confirmLoading = true
      let { servicePlanId } = this
      task['servicePlan'] = {
        id: servicePlanId,
      }
      task = this.getServicePlanTaskData(task)

      let { error } = await API.createRecord(this.moduleName, {
        data: task,
      })
      if (error) {
        let { message } = error || 'Error Occured'
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        this.taskVisibility = false
        ftoast.success('Task created Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })
        this.getTasksList()
      }
      this.confirmLoading = false
    },
    async deleteTask(task) {
      let { moduleName } = this
      let { row } = task || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { error } = await API.deleteRecord(moduleName, id)
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
    getServicePlanTaskData(serviceTaskTemplate) {
      let { relations } = serviceTaskTemplate || {}
      let {
        serviceOrderPlannedItems,
        serviceOrderPlannedTools,
        serviceOrderPlannedServices,
      } = relations || {}
      let serviceTaskTemplateData = {
        ...(serviceTaskTemplate || {}),
        relations: {
          servicePlanItems: serviceOrderPlannedItems,
          servicePlanTools: serviceOrderPlannedTools,
          servicePlanServices: serviceOrderPlannedServices,
        },
      }
      return serviceTaskTemplateData
    },
    async editTask(data) {
      let { moduleName } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { serviceTaskTemplate, error } = await API.fetchRecord(moduleName, {
          id,
        })
        if (error) {
          let { message } = error || 'Error Occured'
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          let { servicePlanItems, servicePlanTools, servicePlanServices } =
            serviceTaskTemplate || {}

          this.serviceTaskTemplate = {
            ...(serviceTaskTemplate || {}),
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
          delete this.serviceTaskTemplate['servicePlanItems']
          delete this.serviceTaskTemplate['servicePlanTools']
          delete this.serviceTaskTemplate['servicePlanServices']

          this.taskVisibility = true
          this.showEditMode = true
        }
      }
    },
    async updateServiceTask(serviceTaskTemplate) {
      this.confirmLoading = true
      let { moduleName } = this
      let { id } = serviceTaskTemplate
      let serviceTaskTemplateData =
        this.getServicePlanTaskData(serviceTaskTemplate)
      let params = {
        id,
        data: serviceTaskTemplateData,
      }
      let { error } = await API.updateRecord(moduleName, params)
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
