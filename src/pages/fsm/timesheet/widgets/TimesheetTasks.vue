<template>
  <FContainer height="100%">
    <FContainer
      v-if="isLoading"
      justifyContent="center"
      height="90%"
      display="flex"
      alignItems="center"
    >
      <FSpinner :size="40" :show="true" />
    </FContainer>
    <FContainer
      v-else-if="!isEmpty(tasks)"
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
        >
          <template #[`cell.id`]="{ row, prop }">#{{ row[prop] }}</template>
          <template #[`cell.status`]="{ row, prop }">
            <FTags
              v-if="row[prop] !== '---'"
              appearance="status"
              :text="statusDisplayName(row[prop])"
              :statusType="statusType(row[prop])"
            />
            <div v-else>{{ row[prop] }}</div>
          </template>
          <template #[`cell.workType`]="{ row, prop }"
            ><FTags
              v-if="row[prop] !== '---'"
              :text="row[prop]"
              statusType="default"
              appearance="simple"
            ></FTags>
            <div v-else>{{ row[prop] }}</div>
          </template>
          <template #[`cell.skills`]="{ row, prop }"
            ><MultiLookupTag
              v-if="!isEmpty(row[prop])"
              :values="row[prop]"
              :toShow="1"
            ></MultiLookupTag>
            <div v-else>---</div>
          </template>
          <template #[`cell.createdBy`]="{ row, prop }">
            <FContainer display="flex" flexDirection="row">
              <FContainer paddingRight="containerMedium">
                <FAvatar
                  size="S"
                  :userName="row[prop].name"
                  :avatarUrl="row[prop].avatarUrl"
                  font-size="8px"
                />
              </FContainer>
              <FContainer display="flex" alignSelf="center">
                <FText appearance="bodyReg14" color="textCaption">{{
                  row[prop].name
                }}</FText>
              </FContainer>
            </FContainer>
          </template>
          <template #[`cell.createdTime`]="{ row, prop }"
            ><FText appearance="bodyReg14" color="textCaption">{{
              formatDate(row[prop], false)
            }}</FText></template
          >
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
    <FContainer v-else display="flex" justifyContent="center" height="100%">
      <FEmptyState
        :illustration="'no-data'"
        :title="'Tasks'"
        :description="$t('tasks.no_tasks_available', { ns: 'fsm' })"
        :vertical="false"
        :size="'M'"
      >
      </FEmptyState>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FSpinner,
  FTable,
  ftoast,
  FEmptyState,
  FText,
  FTags,
  FPagination,
  FAvatar,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { MultiLookupTag } from '@facilio/ui/tasks'
import { formatDate } from '../../../../utils/formatter'
import getProperty from 'dlv'
export default {
  name: 'TimeSheetTasks',
  props: ['details', 'widget'],
  components: {
    FContainer,
    FTable,
    FSpinner,
    FEmptyState,
    FText,
    FTags,
    MultiLookupTag,
    FPagination,
    FAvatar,
  },
  data() {
    return {
      isLoading: false,
      pageSize: 10,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      tasks: [],
      columns: [
        { displayName: 'Code', name: 'code', id: 1, fixed: true, width: 100 },
        {
          displayName: 'Task Name',
          name: 'name',
          id: 2,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Status',
          name: 'status',
          id: 3,
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
          displayName: 'Created By',
          name: 'createdBy',
          id: 6,
        },
        {
          displayName: 'Created Time',
          name: 'createdTime',
          id: 7,
        },
      ],
    }
  },
  created() {
    this.getAllTimeSheetTasks()
  },
  computed: {},
  methods: {
    isEmpty,
    formatDate,
    async getAllTimeSheetTasks() {
      this.isLoading = true
      let { details, currentPage, pageSize } = this
      let { id } = details
      let params = {
        page: currentPage,
        perPage: pageSize,
        timeSheetId: id,
        withCount: true,
      }
      let { data, error } = await API.get(
        'v3/timeSheet/fetchTaskList',
        params
      )
      if (error) {
        let { message } = error
        ftoast.critical(message, {
          title: '',
          timeout: 1000,
        })
      } else {
        let { serviceTask,count } = data || {}
        this.tasks = this.getTasksArray(serviceTask)

        this.totalRecords = count
      }
      this.isLoading = false
    },
    getTasksArray(data) {
      if (!isEmpty(data)) {
        return data.map(task => {
          let { skills } = task || {}
          return {
            code: getProperty(task, 'taskCode', '---'),
            name: getProperty(task, 'name', '---'),
            status: !isEmpty(task.status) ? task.status : '---',
            workType: getProperty(task, 'workType.name', '---'),
            skills,
            createdBy: getProperty(task, 'sysCreatedBy', '---'),
            createdTime: getProperty(task, 'sysCreatedTime', '---'),
          }
        })
      }
      return []
    },
    statusDisplayName(status) {
      let { displayName } = status || {}
      return displayName
    },
    statusType(status) {
      let { statusType } = status || {}
      return statusType
    },
    currentChange(page) {
      this.currentPage = page
      this.getAllTimeSheetTasks()
    },
  },
}
</script>
