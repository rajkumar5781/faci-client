<template>
  <FContainer class="task-view">
    <FContainer v-if="sectionLoading" display="flex" justifyContent="center">
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else
      backgroundColor="backgroundMidgroundMedium"
      border-bottom="1px solid"
      borderColor="backgroundMidgroundDark"
    >
      <FRow class="section-area">
        <FCol :span="10">
          <FContainer class="mL5">{{ sectionName }}</FContainer>
        </FCol>
        <FCol :span="2" class="view-details">
          <FContainer display="flex" justifyContent="end" paddingRight="5px">
            <FButton
              appearance="link"
              size="medium"
              @click="setActiveSection()"
            >
              {{ 'View Details' }}
            </FButton>
          </FContainer>
        </FCol>
      </FRow>
    </FContainer>
    <FContainer class="task-area" v-if="sectionData">
      <FContainer v-if="isLoading" display="flex" justifyContent="center">
        <FSpinner :size="30" />
      </FContainer>
      <FContainer v-else class="task-view-area">
        <FTable
          :columns="column"
          :data="selectedSectionTasks"
          :hideBorder="true"
          :showSelectBar="false"
          headerColor="backgroundMidgroundSubtle"
        >
          <template #[`cell.id`]="data">
            <FText appearance="bodyRegSt14" color="textMain">
              {{ '#' + data.row.sequence }}
            </FText>
          </template>
          <template #[`cell.subject`]="data">
            <FText appearance="bodyRegSt14" color="textMain">
              {{ data.row.subject }}
            </FText>
          </template>

          <template #[`cell.criticality`]="data">
            <FTags
              v-if="data.row.taskCriticality"
              appearance="accent"
              :text="criticalityMap[data.row.taskCriticality].displayName"
              :disabled="false"
              :accentColor="criticalityMap[data.row.taskCriticality].statusType"
              :accentLevel="
                criticalityMap[data.row.taskCriticality].accentLevel
              "
            />
            <FText v-else appearance="bodyReg14" color="textCaption">{{
              '---'
            }}</FText>
          </template>
          <template #[`cell.details`]="data">
            <FContainer style="display: flex">
              <FButton
                appearance="link"
                size="medium"
                @click="setActiveSectionOrTask(data.row, data.index)"
              >
                {{ 'View Details' }}
              </FButton>
            </FContainer>
          </template>
        </FTable>
        <FDivider width="100" />
      </FContainer>
    </FContainer>
    <JobPlanSettingsDialog
      v-if="showSettingDialog"
      :showSettingDialog.sync="showSettingDialog"
      :isSection="isSection"
      :selectedSectionInfo="selectedSectionInfo"
      :selectedTask="selectedTask"
    />
    <JPSectionDialogue
      v-if="showSectionDialog"
      :showSectionDialog.sync="showSectionDialog"
      :selectedTask="selectedSectionInfo"
      :isSection="true"
    />
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import JobPlanSettingsDialog from './JobPlanSettingsDialog.vue'
import JPSectionDialogue from './JPSectionDialogue.vue'
import { API } from '@facilio/api'
import { getRelatedFieldName } from '../../../../utils/relatedFieldUtil'
import {
  FTable,
  FText,
  FDivider,
  FTags,
  FRow,
  FCol,
  FButton,
  FContainer,
  FSpinner,
} from '@facilio/design-system'

export default {
  name: 'JobPlanTasks',
  data() {
    return {
      selectedSectionTasks: [],
      taskPage: 1,
      taskPerPage: 10,
      taskTotalCount: null,
      isSection: false,
      selectedSectionInfo: null,
      selectedTask: null,
      showSettingDialog: false,
      showSectionDialog: false,
      isLoading: false,
      column: [
        { displayName: 'Task Id', name: 'id', id: 1, fixed: true, width: 100 },
        {
          displayName: 'Name',
          name: 'subject',
          id: 2,
          width: 250,
        },
        {
          displayName: 'Criticality',
          name: 'criticality',
          id: 3,
          width: 250,
        },
        {
          displayName: '',
          name: 'details',
          id: 4,
          width: 250,
          clickable: true,
        },
      ],
      criticalityMap: {
        1: {
          displayName: 'Statutory',
          statusType: 'red',
          accentLevel: 'L1',
        },
        2: {
          displayName: 'Mandatory',
          statusType: 'pink',
          accentLevel: 'L2',
        },
        3: {
          displayName: 'Optimal',
          statusType: 'orange',
          accentLevel: 'L3',
        },
        4: {
          displayName: 'Discretionary',
          statusType: 'green',
          accentLevel: 'L3',
        },
      },
    }
  },
  props: ['sectionData', 'jobPlanId', 'sectionLoading'],
  components: {
    JobPlanSettingsDialog,
    JPSectionDialogue,
    FTable,
    FText,
    FDivider,
    FTags,
    FRow,
    FCol,
    FButton,
    FContainer,
    FSpinner,
  },
  watch: {
    taskPage: {
      async handler(newVal) {
        if (!isEmpty(newVal)) {
          this.getSectionTasks()
        }
      },
      immediate: true,
    },
    sectionData: {
      async handler(newVal) {
        if (!isEmpty(newVal)) {
          this.getSectionTasks()
        }
      },
      immediate: true,
    },
    showSettingDialog: {
      async handler(newVal) {
        if (!newVal) {
          this.isSection = false
          this.selectedSectionInfo = null
        }
      },
      immediate: true,
    },
  },
  created() {
    this.getSectionTasks()
  },
  computed: {
    sectionName() {
      let { sectionData } = this
      let { name } = sectionData || {}
      if (!isEmpty(name)) {
        name = name.replace('JP-', '')
        return name
      }
      return ''
    },
    jobPlanSectionId() {
      let { sectionData } = this
      let { id } = sectionData || {}
      return id
    },
  },
  methods: {
    getTaskSubject(task) {
      let { subject } = task
      if (!isEmpty(subject)) subject = subject.replace('JP-', '')

      return subject
    },
    setActiveSectionOrTask(task, taskIndex) {
      let { sectionData, selectedSectionTasks } = this

      this.isSection = isEmpty(taskIndex)
      if (!isEmpty(selectedSectionTasks) && !this.isSection) {
        this.selectedTask = task
        this.selectedSectionInfo = selectedSectionTasks[taskIndex]
      } else {
        this.selectedTask = task
        this.selectedSectionInfo = sectionData
      }
      this.showSettingDialog = true
    },
    setActiveSection() {
      let { sectionData } = this

      this.selectedSectionInfo = sectionData
      this.showSectionDialog = true
    },
    setPage(page) {
      this.taskPage = page
    },
    async getSectionTasks() {
      this.isLoading = true
      let { taskPerPage, taskPage, jobPlanSectionId } = this
      let params = {
        page: taskPage,
        perPage: taskPerPage,
        jobplansection: jobPlanSectionId,
        withCount: true,
      }
      let relatedFieldName = getRelatedFieldName(
        'jobplansection',
        'jobplantask'
      )
      let relatedConfig = {
        moduleName: 'jobplansection',
        id: jobPlanSectionId,
        relatedModuleName: 'jobplantask',
        relatedFieldName,
      }
      let { error, list, meta } = await API.fetchAllRelatedList(
        relatedConfig,
        params
      )

      if (!isEmpty(error)) {
        let { message } = error || {}
        this.$message.error(message || 'Error Occured')
      } else {
        let { pagination } = meta || {}
        let { totalCount = null } = pagination || {}

        this.$set(this, 'selectedSectionTasks', list)
        this.$set(this, 'taskTotalCount', totalCount)
      }
      this.isLoading = false
    },
  },
}
</script>
<style scoped lang="scss">
.task-view {
  background-color: #fff;
  .section-area {
    height: 40px;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    font-weight: 500;
    font-size: 16px;
    color: #324056;
  }

  .section-name {
    font-weight: 500;
    font-size: 16px;
  }
  .task-area {
    display: flex;
    flex-direction: column;
  }
  .task-id {
    color: #38b2c2;
  }
  .pR65 {
    padding-right: 65px;
  }
  .view-details {
  }
  .task-details {
    margin-top: 10px;
    height: 40px;
    background-color: #f3f1fc;
    display: flex;
    font-weight: 500;
  }
  .task-row {
    cursor: pointer;
    min-height: 55px;
    border-bottom: 0.7px solid #d8d8d8;
    justify-content: space-between;
  }
  .task-info {
    height: inherit;
    .task-context {
      max-width: 100%;
      word-break: break-word;
      .task-desc {
        color: #848484;
        font-weight: 300;
        max-width: 95%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .task-scope {
    height: inherit;
    right: 0px;
  }
  .task-view-area {
    max-height: 650px;
    overflow-y: scroll;
  }

  .task-pagination {
    border-top: 0.7px solid #d8d8d8;
  }
}
.jp-empty-white {
  width: 100%;
  height: 100px;
  display: flex;
  background: #ffffff;
  flex-direction: column;
  padding: 20px;
}
</style>
