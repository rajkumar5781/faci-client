<template>
  <FContainer class="refclass" ref="workOrderTasksWidget" overflow="scroll">
    <FContainer
      v-if="loading"
      class="w-full h-full flex items-center justify-center"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isTaskListEmpty"
      display="flex"
      justifyContent="center"
      class="h-full"
    >
      <FEmptyState
        title="No Tasks Added."
        description="It seems that there are no tasks currently added for this Work Order."
        vertical
        size="M"
        illustration="add-item"
      >
        <template #buttons>
          <FButton
            :disabled="!canShowAddTaskButton"
            appearance="primary"
            @click="openAddNewTask({})"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
          >
            Add Task
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>

    <FContainer v-else class="h-full">
      <portal to="page-builder-sticky-top">
        <FContainer display="flex" flexDirection="column" gap="sectionSmall">
        <FContainer
          backgroundColor="backgroundContainer"
          paddingRight="containerXxLarge"
        >
          <FContainer display="flex" justifyContent="space-between">
            <FContainer>
              <FTabs
                v-model="taskTab"
                appearance="button"
                :tabsList="tabsList"
                @change="getSortedTaskList()"
              />
            </FContainer>
            <FContainer>
              <FContainer
                display="flex"
                justify-content="right"
                align-items="center"
                height="100%"
              >
                <FDropdown
                  v-if="taskResources.length > 1 && taskResources.length <= 30"
                  :options="taskResource"
                  :split="false"
                  :loading="false"
                  :buttonProps="{ appearance: 'link' }"
                  contentWidth="200px"
                  @dropdown="onResourceSelected"
                >
                  <template>
                    <FTags
                      appearance="action"
                      actionType="dropdown"
                      statusType="default"
                      :text="assetFilter"
                      class="mx-3 selected-view"
                    />
                  </template>
                </FDropdown>
                <FContainer padding-right="8px" />
                <FContainer
                  v-if="taskResources.length > 1 && taskResources.length <= 30"
                >
                  <FDivider height="32px" />
                  <FContainer padding-right="8px" />
                </FContainer>
                <FButton
                  v-if="
                    !(taskChartData.currentValue === taskChartData.value) &&
                    !isClosedTab
                  "
                  appearance="primary"
                  size="medium"
                  iconGroup="action"
                  iconName="circle-tick"
                  iconPosition="prefix"
                  @click="closeAllTask()"
                >
                  {{
                    selectedTaskResource !== null
                      ? $t('Close Filtered Task')
                      : $t('Close All Tasks')
                  }}
                </FButton></FContainer
              ></FContainer
            >
          </FContainer>
        </FContainer>
      </FContainer>
      </portal>
      <FContainer
        display="flex"
        justifyContent="center"
        class="h-full"
        v-if="isEmpty(filteredTaskList)"
      >
        <FEmptyState
          title="No Tasks Added."
          description="It seems that there are no tasks currently added for this Work Order."
          vertical
          size="M"
          illustration="add-item"
        />
      </FContainer>
      <FContainer v-else v-for="(obj, index) in filteredTaskList" :key="index">
        <FContainer
          backgroundColor="backgroundMidgroundSubtle"
          padding="containerLarge containerXLarge"
        >
          <FContainer
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <FContainer>
              <FText appearance="headingMed14" color="textMain"
                >{{ sections[obj.sectionId]?.name }}
              </FText>
            </FContainer>
            <FContainer v-if="!isClosedTab">
              <FContainer display="flex" justifyContent="right">
                <FButtonGroup>
                  <template #buttons>
                    <FButton
                      appearance="secondary"
                      size="small"
                      iconGroup="action"
                      iconName="circle-tick"
                      iconPosition="prefix"
                      @click="closeAllTask(obj.sectionId)"
                    >
                      Close All
                    </FButton>

                    <FButton
                      appearance="secondary"
                      size="small"
                      iconGroup="navigation"
                      iconName="addition"
                      @click="openAddNewTask(obj)"
                      iconPosition="prefix"
                      :disabled="!showAddNewTask"
                    >
                      Add Task
                    </FButton>
                  </template>
                </FButtonGroup>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
        <FDivider width="100" />
        <FContainer
          v-for="(task, index1) in obj.taskList"
          :key="index1"
          class="wo-task-row"
          padding="containerLarge containerXLarge"
          display="flex"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="borderNeutralBaseSubtler"
          width="100%"
        >
          <FContainer width="30%" display="flex" alignItems="center">
            <FContainer
              cursor="pointer"
              :disabled="!isPrerequisiteCompleted || !canExecuteTask"
              @click="
                isPrerequisiteCompleted && canExecuteTask
                  ? changeTaskStatus(task)
                  : null
              "
            >
              <FTooltip placement="top">
                <template #title>{{
                  task.statusNewEnum === 'OPEN' ? 'Close' : 'Re-open'
                }}</template>
                <FIcon
                  class="wo-task-checkbox-unchecked"
                  v-if="task.statusNewEnum === 'OPEN'"
                  :disabled="!isPrerequisiteCompleted"
                  group="action"
                  name="circle-tick"
                  size="24"
                  :pressable="false"
                />
                <FIcon
                  v-else
                  class="wo-task-checkbox-checked"
                  style="color: var(--colors-backgroundSemanticGreenDark)"
                  :disabled="!isPrerequisiteCompleted"
                  group="action"
                  name="tick-circle-filled"
                  size="24"
                  :pressable="false"
                />
              </FTooltip>
            </FContainer>

            <FContainer
              class="width50 d-flex"
              padding-left="10px"
              position="relative"
              display="flex"
              @click="openTaskOverView(task)"
            >
              <FContainer class="flex flex-col" gap="containerMedium">
                <FContainer display="flex" alignItems="center">
                  <FTags
                    padding-right="5px"
                    appearance="simple"
                    :disabled="false"
                    :text="`#` + task.uniqueId"
                  /><FContainer padding-left="8px" />
                  <FTags
                    v-if="canShowResource(task)"
                    padding-right="5px"
                    appearance="simple"
                    :disabled="false"
                    :text="getResourceName(task)"
                    ><template slot="prefix">
                      <FIcon
                        v-if="isMeterType(task)"
                        group="webtabs"
                        name="meter"
                        size="12" />
                      <FIcon
                        v-else-if="task.resource.resourceType === 1"
                        group="default"
                        name="building"
                        size="12"
                        :pressable="false" />
                      <FIcon
                        v-else
                        group="webtabs"
                        name="asset"
                        size="12"
                        :pressable="false" /></template
                  ></FTags>
                  <FContainer v-if="task.sfgScheduleId" padding-left="8px" />
                  <FTags
                    v-if="task.sfgScheduleId"
                    padding-right="5px"
                    appearance="simple"
                    :disabled="false"
                    :text="`SFG-20`"
                  /><FContainer
                    v-if="task.taskCriticality"
                    padding-left="8px"
                  />
                  <FTags
                    v-if="task.taskCriticality"
                    padding-right="5px"
                    appearance="accent"
                    :accentColor="task.taskCriticalityColor"
                    :disabled="false"
                    :text="task.taskCriticalityName"
                    :accentLevel="task.taskCriticalitySeverity"
                  /><FContainer padding-left="8px" />
                </FContainer>
                <FContainer>
                  <FText class="cursor-pointer">{{ task.subject }}</FText>
                </FContainer>
              </FContainer>
              <FContainer
                v-if="
                  task.id === -1 ||
                  (canShowResource(task) && getResourceName(task))
                "
                class="pT5 inline-flex"
              ></FContainer>
            </FContainer>
          </FContainer>
          <FContainer
            width="70%"
            display="flex"
            justify-content="right"
            align-items="center"
          >
            <FContainer width="80%">
              <FContainer
                v-if="Number(task.inputType) === 2"
                display="flex"
                justify-content="flex-end"
              >
                <FContainer
                  gap="containerMedium"
                  display="flex"
                  v-if="isNumberField(task)"
                  width="50%"
                  alignItems="center"
                >
                  <FInput
                    type="number"
                    @focus="checkAndShowTask(task)"
                    @change="checkForHoursAndMins(task)"
                    v-model="task.hours"
                    :disabled="canDisableField(task)"
                    size="small"
                  >
                    <template #suffix>Hours</template>
                  </FInput>
                  <FInput
                    :ref="'fTaskMin' + task.id"
                    type="number"
                    @focus="checkAndShowTask(task)"
                    @change="checkForHoursAndMins(task)"
                    v-model="task.minutes"
                    :disabled="canDisableField(task)"
                    size="small"
                  >
                    <template #suffix>Minute</template>
                  </FInput>
                </FContainer>
                <FContainer
                  v-else
                  display="flex"
                  gap="containerMedium"
                  justify-content="flex-end"
                  alignItems="center"
                >
                  <FContainer>
                    <FDatePicker
                      :placeholder="setDateToString"
                      v-model="task.inputTime"
                      @change="updateReading(task)"
                      type="date-time"
                      :disabled="canDisableField(task)"
                      displayFormat="YYYY-MM-DD HH:mm A"
                      :value="dateValue"
                      :timeZone="timezone"
                      size="small"
                    ></FDatePicker>
                  </FContainer>
                  <FContainer display="flex" gap="containerMedium" width="50%">
                    <FContainer v-if="checkLastReading(task)">
                      <FIcon group="action" name="info" size="18px"></FIcon>
                    </FContainer>
                    <FContainer
                      v-if="
                        task.readingField && isBooleanField(task.readingField)
                      "
                      gap="containerLarge"
                      alignItems="center"
                      display="flex"
                    >
                      <FRadioGroup
                        class="radio-group"
                        v-model="task.inputValue"
                        @change="onReadingChange(task)"
                        :disabled="canDisableField(task)"
                        alignment="horizontal"
                        :options="getOptions(task)"
                      >
                      </FRadioGroup>
                    </FContainer>

                    <FSelect
                      v-else-if="isReadingEnum(task)"
                      v-model="task.inputValue"
                      @change="onReadingChange(task)"
                      :disabled="canDisableField(task)"
                      :options="fieldOptions(task)"
                      size="small"
                    >
                    </FSelect>
                    <FInput
                      v-else
                      type="number"
                      @focus="checkAndShowTask(task)"
                      @change="onChange(task)"
                      v-model="task.inputValue"
                      :disabled="canDisableField(task)"
                      size="small"
                    >
                      <template #clickable
                        ><FSelect
                          v-if="
                            isReadingFieldValidationEnabled &&
                            checkReadingField(task)
                          "
                          v-model="task.readingFieldUnit"
                          @change="onReadingChange(task)"
                          :disabled="canDisableField(task)"
                          :clearable="false"
                          size="small"
                          :options="
                            getReadingFieldUnits(task.readingField.metric)
                          "
                      /></template>
                    </FInput>

                    <FContainer
                      v-if="
                        !isReadingFieldValidationEnabled &&
                        task.readingField &&
                        task.readingField.unit
                      "
                    >
                      {{ task.readingField.unit }}
                    </FContainer>
                  </FContainer>
                </FContainer>
                <FContainer padding-left="12px" />
                <FDivider height="32px" />
                <FContainer padding-left="12px" />
              </FContainer>
              <FContainer
                v-if="Number(task.inputType) === 3"
                display="flex"
                justify-content="flex-end"
                alignItems="center"
              >
                <FContainer>
                  <FInput
                    :disabled="canDisableField(task)"
                    @change="addTask(task)"
                    v-model="task.inputValue"
                    appearance="default"
                    :placeholder="
                      $t('workorder.enter_text', 'Enter text', {
                        ns: 'workorder',
                      })
                    "
                    type="text"
                    size="small"
                  ></FInput>
                </FContainer>
                <FContainer padding-left="12px" />
                <FDivider height="32px" />
                <FContainer padding-left="12px" />
              </FContainer>
              <FContainer
                v-if="Number(task.inputType) === 4"
                display="flex"
                justify-content="flex-end"
                alignItems="center"
              >
                <FContainer>
                  <FInput
                    :disabled="canDisableField(task)"
                    @change="addTask(task)"
                    v-model="task.inputValue"
                    appearance="default"
                    :placeholder="
                      $t('workorder.enter_number', 'Enter number', {
                        ns: 'workorder',
                      })
                    "
                    type="number"
                    size="small"
                  ></FInput>
                </FContainer>
                <FContainer padding-left="12px" />
                <FDivider height="32px" />
                <FContainer padding-left="12px" />
              </FContainer>
              <FContainer
                display="flex"
                justify-content="flex-end"
                alignItems="center"
                v-if="Number(task.inputType) === 5"
              >
                <FContainer>
                  <FSelect
                    @change="addTask(task)"
                    @focus="checkAndShowTask(task)"
                    v-model="task.inputValue"
                    :disabled="canDisableField(task)"
                    :options="getOption(task.options)"
                    size="small"
                  >
                  </FSelect>
                </FContainer>
                <FContainer padding-left="12px" />
                <FDivider height="32px" />
                <FContainer padding-left="12px" />
              </FContainer>
            </FContainer>
            <FContainer width="20%">
              <FContainer display="flex" gap="containerLarge">
                <FContainer width="30%">
                  <FButton
                    appearance="tertiary"
                    size="small"
                    @click="openAddTaskAttachments(task)"
                    :disabled="canDisableButton"
                    iconGroup="text-edit"
                    iconName="image"
                    :iconButton="true"
                    iconPosition="prefix"
                  >
                    <span
                      class="pl-1"
                      v-if="task.noOfAttachments && task.noOfAttachments > 0"
                      >({{ task.noOfAttachments }})</span
                    >
                  </FButton>
                </FContainer>
                <FContainer width="20%" v-if="!task.remarks">
                  <FButton
                    appearance="tertiary"
                    size="small"
                    @click="openAddTaskRemark(task)"
                    :disabled="canDisableButton"
                    iconGroup="social"
                    iconName="comment"
                    :iconButton="true"
                    iconPosition="prefix"
                  >
                  </FButton>
                </FContainer>
                <FContainer width="20%" v-else>
                  <FButton
                    appearance="tertiary"
                    size="small"
                    @click="openAddTaskRemark(task)"
                    :disabled="canDisableButton"
                    iconGroup="communication"
                    iconName="comment-filled"
                    :iconButton="true"
                    iconPosition="prefix"
                  >
                  </FButton>
                </FContainer>
                <FContainer width="50%">
                  <FButton
                    appearance="secondary"
                    size="small"
                    @click="openTaskOverView(task)"
                  >
                    View More
                  </FButton>
                </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <AddTaskPage
      v-if="showAddTask"
      :selectedSection="selectedSection"
      :showAddTask.sync="showAddTask"
      :isPrerequisiteCompleted="isPrerequisiteCompleted"
      :workorder="workorder"
      @reload="reloadSummary()"
    >
    </AddTaskPage>
    <TaskRemarks
      v-if="showRemarksDialogue"
      :details="selectedTask"
      :showRemarksDialogue.sync="showRemarksDialogue"
      @reloadTasks="reloadTasks"
      :canDisableField="canDisableField(selectedTask)"
    >
    </TaskRemarks>
    <NewTaskAttachmentsPreview
      v-if="showAttachmentsDialogue"
      :details="selectedTask"
      :showAttachmentsDialogue="showAttachmentsDialogue"
      :isLockedState="isLockedState"
      :canExecuteTask="canExecuteTask"
      @closeAttachment="closeDialog"
      @reloadTasks="reloadTasks"
    >
    </NewTaskAttachmentsPreview>
    <TaskOverview
      v-if="showTaskOverview"
      :task.sync="selectedTask"
      :showTaskOverview.sync="showTaskOverview"
      :workorder="workorder"
      :isPrerequisiteCompleted="isPrerequisiteCompleted"
      :isLockedState="isLockedState"
      :canExecuteTask="canExecuteTask"
      :details="selectedTask"
      :canDisableField="canDisableField(selectedTask)"
      @checkForHoursAndMins="checkForHoursAndMins"
      @updateReading="updateReading"
      @fieldOptions="fieldOptions"
      :taskList="taskList"
      @reloadCloseTasks="reloadCloseTasks"
      :readingFieldErrorToggle="readingFieldErrorToggle"
    >
    </TaskOverview>
    <TaskReadingsValidationModal
      v-if="isReadingFieldValidationEnabled && readingFieldErrorToggle"
      :currentTaskObj="currentTaskObj"
      :task.sync="selectedTask"
      :readingFieldErrorToggle="readingFieldErrorToggle"
      :readingFieldError="readingFieldError"
      :readingFieldSuggestionToggle="readingFieldSuggestionToggle"
      :readingFieldSuggestions="readingFieldSuggestions"
      :canExecuteTask="canExecuteTask"
      :readingData="readingData"
      :consumptionData="consumptionData"
      @saveTask="saveTask"
      @updateData="updateData"
      @closeAlert="closeAlert"
    />
  </FContainer>
</template>
<script>
import workorderMixin from '../workorderHelper'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { getFieldOptions } from '../../../../utils/picklist'
import { API } from '@facilio/api'
import { dset as setProperty } from 'dset'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { getApp } from '@facilio/router'
import AddTaskPage from './AddTaskDialogue.vue'
import NewTaskAttachmentsPreview from './NewTaskAttachmentsPreview.vue'
import TaskRemarks from './TaskRemarksDialogue.vue'
import module from '../../../../store/module'
import TaskOverview from './TaskOverviewDialogue.vue'
import TaskReadingsValidationModal from './TaskReadingsValidationModal.vue'
import {
  formatCustomDate,
  getDateInOrgTimezone,
} from '../../../../utils/formatter'
import {
  FEmptyState,
  FTooltip,
  FSpinner,
  FTable,
  FContainer,
  FRow,
  FCol,
  FDivider,
  FIcon,
  FButton,
  FText,
  FTags,
  FButtonGroup,
  FTabs,
  FTabPane,
  FDropdown,
  FInput,
  FSegmentedControl,
  FSelect,
  FRadioGroup,
  FDatePicker,
  FNotification
} from '@facilio/design-system'
import moment from 'moment-timezone'
import { isBooleanField, isEnumField } from '@facilio/utils/field'
import { getOrgMoment } from '../../../modules/readingrule/util'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import dlv from 'dlv'

const METRIC_HASH = {
  DURATION: 5,
}
let moduleStore = module()
export default {
  name: 'WorkOrderTasks',
  mixins: [workorderMixin],
  components: {
    NewTaskAttachmentsPreview,
    TaskRemarks,
    TaskOverview,
    FEmptyState,
    FTooltip,
    FSpinner,
    FTable,
    FButtonGroup,
    FContainer,
    FRow,
    FCol,
    FDivider,
    FIcon,
    FButton,
    FText,
    FTabs,
    AddTaskPage,
    FTags,
    FTabPane,
    FDropdown,
    FInput,
    FSegmentedControl,
    FSelect,
    FRadioGroup,
    FDatePicker,
    TaskReadingsValidationModal,
    FNotification
  },
  props: [
    'resizeWidget',
    'widget',
    'calculateDimensions',
    'reloadSummary',
    'headerPortal',
  ],
  data() {
    return {
      isEmpty,
      sectionId: null,
      woDescriptiontranslate: false,
      taskErrorMap: {},
      invokeRelatedListWidget: false,
      woWidget: {
        relatedList: {
          module: {},
        },
      },
      rules: {
        taskSubject: [
          {
            required: true,
            message: 'Please enter Task Subject',
            trigger: 'blur',
          },
        ],
      },
      permitWidget: {
        relatedList: {
          module: {},
          field: { name: 'ticket' },
        },
      },
      showPermitListWidget: false,
      nextExecutionTime: null,
      onFocus: false,
      photoUploadUrl: null,
      photoUploadData: {},
      showAssetBreakdown: false,
      assetBDSourceDetails: {
        condition: null,
        assetid: null,
        sourceId: null,
        sourceType: null,
      },
      tasks: [],
      module_name: 'workorder',
      activeName: 'first',
      dialogVisible: false,
      showSiteEdit: true,
      validationRules: {},
      errorMap: {},
      errorQue: {},
      errorMessage: {},
      taskBulkList: [],
      fields: [],
      noOfUpdatedTAsk: 0,
      testVar: null,
      customFieldUpdate: false,
      visibility: false,
      quickSearchQuery: '',
      loading: true,
      summoryview: true,
      fieldvisibility: false,
      showWorkDurationDialog: false,
      workDurationCallBack: null,
      radio2: '',
      selectedFieldUpdate: null,
      selectedFieldValue: null,
      summaryWindow: 'true',
      subSection: 'summarypage',
      sequencedData: false,
      summarySection: 'details',
      taskReadingFields: [],
      editFormVisibilty: false,
      duedate: '',
      value1: '',
      subheaderMenu: [
        {
          label: this.$t('common.events.today'),
          path: { path: '/app/fa/events/today' },
        },
        {
          label: this.$t('common.events.yesterday'),
          path: { path: '/app/fa/events/yesterday' },
        },
        {
          label: this.$t('common.events.this_week'),
          path: { path: '/app/fa/events/thisweek' },
        },
        {
          label: this.$t('common.events.last_week'),
          path: { path: '/app/fa/events/lastweek' },
        },
        {
          label: this.$t('common.events.all_events'),
          path: { path: '/app/fa/events/all' },
        },
      ],
      comments: [],
      taskList: {},
      preRequestList: {},
      newTaskList: [],
      sections: {},
      preRequestSections: {},
      newComment: {
        parentModuleLinkName: 'ticketnotes',
        parentId: this.$route.params.id,
        body: null,
        notifyRequester: false,
      },
      commentFocus: true,
      showAddTask: false,
      showAttachmentsDialogue: false,
      showRemarksDialogue: false,
      selectedTask: {
        inputValidationRuleId: -1,
        inputValidation: null,
        safeLimitRuleId: -1,
        minSafeLimit: null,
        maxSafeLimit: null,
        options: [],
        taskType: -1,
        enableInput: false,
        inputType: 1,
        attachmentRequired: false,
        subject: '',
        selectedResourceName: '',
        inputValues: [],
      },
      selectedSection: {},
      taskTab: '1',
      taskTabList: [],
      sortedTaskList: [],
      showAddPreRequest: false,
      selectedPreRequest: {
        inputValidationRuleId: -1,
        inputValidation: null,
        safeLimitRuleId: -1,
        minSafeLimit: null,
        maxSafeLimit: null,
        options: [],
        taskType: -1,
        enableInput: false,
        inputType: 1,
        attachmentRequired: false,
        subject: '',
        selectedResourceName: '',
        inputValues: [],
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 3600 * 1000 * 24
        },
      },
      waitBoolean: true,
      downloadSummary: false,
      workOrderTotalCost: null,
      workOrderSubTotal: null,
      taskChartData: null,
      workOrderStates: [],
      activeWoStateData: null,
      selectedTaskResource: null,
      showTaskResourceFilter: false,
      metricWithUnits: {},
      readingFieldUnits: [],
      skipValidation: false,
      readingFieldErrorToggle: false,
      readingFieldError: null,
      currentValue: null,
      previousValue: null,
      readingFieldSuggestionToggle: false,
      readingFieldSuggestions: [],
      averageValue: [],
      suggestedUnits: [],
      currentTaskObj: null,
      addTaskRemarksDialog: false,
      showMandatoryInputsDialog: false,
      addAttachmentRequiredDialog: false,
      showTaskOverview: false,
      openTaskOptions: false,
      hazardWidget: {
        relatedList: {
          module: {},
          field: { name: 'workorder' },
        },
      },
      showHazardListWidget: false,
      currentTaskformData: {},
      readingData: 6,
      consumptionData: '',
      isUserAddingTask: false,
      isTaskFilling: false,
      optionsArray: [],
      assetFilter:'Select Asset/Space',
      workOrderSettings:{},
    }
  },
  async created() {
    await this.loadFeatureSettingsForWorkorder()

  },
  async mounted() {
    this.loading = true
    this.init()
    let taskPromise = this.loadTasks(this.workorder)
    await this.loadReadingFieldUnits()
    Promise.all([taskPromise]).then(resp => {
      let { workorder } = this
      let { pm } = workorder || {}
      let { id: pmId } = pm || {}

      if (!isEmpty(pm) && !isEmpty(pmId)) {
        this.getNextWorkOrderTime().then(resp => {
          if (!resp.data.result) {
            return
          }
          this.nextExecutionTime = resp.data.result.nextExecutionTime

          if (this.taskList) {
            let keys = Object.keys(this.taskList)
            for (let i = 0; i < keys.length; i++) {
              let tasks = this.taskList[keys[i]]
              for (let k = 0; k < tasks.length; k++) {
                if (
                  this.workorder.pm &&
                  (!this.taskList[keys[i]][k].inputTime ||
                    this.taskList[keys[i]][k].inputTime === -1)
                ) {
                  let nextExec = this.nextExecutionTime
                  if (nextExec && nextExec > 0) {
                    let currentTime = new Date().valueOf()
                    if (
                      !(
                        currentTime >= this.workorder.createdTime &&
                        currentTime < nextExec
                      )
                    ) {
                      this.taskList[keys[i]][k].inputTime =
                        this.convertTimeAsIfFromDatePicker(
                          this.workorder.createdTime
                        )
                    }
                  }
                }
              }
            }
          }
          this.isTaskFilling = false
        })
      } else {
        this.isTaskFilling = false
      }
    })

    this.loadTaskProgress()
    setTimeout(() => {
      this.autoResize()
      console.log('Function executed after 1 second delay')
    }, 1000)
  },
  computed: {
    dateValue() {
      return this.workorder.createdTime
    },
    timezone() {
      let { $account: account } = this
      let timezone = dlv(account, 'org.timezone', 'Etc/UTC')
      return timezone
    },
    TaskList() {
      let obj = []
      if (!isEmpty(this.sortedTaskList)) {
        this.sortedTaskList.forEach(section => {
          let tasks = section.taskList
          tasks?.forEach(task => {
            obj.push(task)
          })
        })
        return obj
      }
      return []
    },
    openTaskList() {
      let obj = []
      if (!isEmpty(this.sortedTaskList)) {
        this.sortedTaskList.forEach(section => {
          let tasks = section.taskList
          tasks?.forEach(task => {
            if (task.statusNewEnum === 'OPEN') {
              obj.push(task)
            }
          })
        })
        console.log('OpenList-', obj)
        return obj
      } else {
        return []
      }
    },
    closedTaskList() {
      let obj = []
      if (!isEmpty(this.sortedTaskList)) {
        this.sortedTaskList.forEach(section => {
          let tasks = section.taskList
          tasks?.forEach(task => {
            if (task.statusNewEnum === 'CLOSED') {
              obj.push(task)
            }
          })
        })
        console.log('closedList-', obj)
        return obj
      } else {
        return []
      }
    },
    openTask() {
      if (!isEmpty(this.sortedTaskList)) {
        let openItems = []
        this.sortedTaskList.forEach(section => {
          const filteredOpenTasks = section?.taskList?.filter(
            task => task.statusNewEnum === 'OPEN'
          )
          if (!isEmpty(filteredOpenTasks) && filteredOpenTasks.length > 0) {
            openItems.push({ ...section, taskList: filteredOpenTasks })
          }
        })
        let openlist = openItems.filter(section => section.taskList.length > 0)
        return openlist
      } else {
        return []
      }
    },
    closedTask() {
      if (!isEmpty(this.sortedTaskList)) {
        let closeItems = []
        this.sortedTaskList.forEach(section => {
          const filteredOpenTasks = section?.taskList?.filter(
            task => task.statusNewEnum === 'CLOSED'
          )
          if (!isEmpty(filteredOpenTasks) && filteredOpenTasks.length > 0) {
            closeItems.push({ ...section, taskList: filteredOpenTasks })
          }
        })
        let closelist = closeItems.filter(
          section => section.taskList.length > 0
        )
        return closelist
      } else {
        return []
      }
    },
    tabsList() {
      return [
        {
          label: `Open (${this.openTaskList.length})`,
          value: '1',
        },
        {
          label: `Closed (${this.closedTaskList.length})`,
          value: '2',
        },
        { label: `All (${this.TaskList.length})`, value: '3' },
      ]
    },
    filteredTaskList() {
      if (this.taskTab === '3') {
        return this.sortedTaskList
      } else if (this.taskTab === '1') {
        return this.openTask
      } else if (this.taskTab === '2') {
        return this.closedTask
      }
    },
    mandatoryInputsTitle() {
      if (this.addAttachmentRequiredDialog && this.addTaskRemarksDialog) {
        return 'Attach Photo and Add Remarks'
      }

      if (this.addAttachmentRequiredDialog) {
        return 'Attach Photo'
      }

      if (this.addTaskRemarksDialog) {
        return 'Add Remarks'
      }

      return ''
    },
    isWorkOrderFeatureSettingsLicenseEnabled() {
      let { $access } = this
      let { isLicenseEnabled } = $access || {}
      return isLicenseEnabled('WORK_ORDER_FEATURE_SETTINGS')
    },
    isWorkPermitLicenseEnabled() {
      let { $access } = this
      let { isLicenseEnabled } = $access || {}

      return isLicenseEnabled('WORK_PERMIT')
    },
    readingPickerOptions() {
      if (
        !this.workorder.pm ||
        !this.nextExecutionTime ||
        this.nextExecutionTime <= 0
      ) {
        return {
          disabledDate(time) {
            return false
          },
        }
      }

      let startTime = getDateInOrgTimezone(this.workorder.createdTime).valueOf()
      let endTime = getDateInOrgTimezone(this.nextExecutionTime).valueOf()

      return {
        disabledDate(time) {
          let res = !(
            (time.getTime() >= startTime && time.getTime() < endTime) ||
            (time.getTime() + 86400000 >= startTime && time.getTime() < endTime)
          )
          if (res === false) {
            console.log('time ' + time)
          }
          return res
        },
      }
    },
    tickettype() {
      return this.getTicketTypePickList()
    },
    isPrerequisiteCompleted() {
      return (
        !this.workorder.prerequisiteEnabled ||
        !this.workorder.allowNegativePreRequisite ||
        this.workorder.allowNegativePreRequisite === -1 ||
        !this.workorder.preRequestStatus ||
        this.workorder.preRequestStatus === -1 ||
        (this.workorder.preRequestStatus &&
          this.workorder.allowNegativePreRequisite === 2 &&
          (this.workorder.preRequestStatus === 2 ||
            this.workorder.preRequestStatus === 3)) ||
        (this.workorder.allowNegativePreRequisite === 3 &&
          this.workorder.preRequestStatus === 3)
      )
    },
    enablePrerequisiteApprove() {
      return (
        this.workorder.prerequisiteEnabled &&
        this.workorder.allowNegativePreRequisite &&
        this.workorder.allowNegativePreRequisite === 3 &&
        this.workorder.prerequisiteApprover &&
        !this.workorder.preRequisiteApproved &&
        this.workorder.preRequestStatus === 2
      )
    },
    isTenantEnabled() {
      return this.$access.isLicenseEnabled('TENANTS')
    },
    isReadingFieldValidationEnabled() {
      return this.$access.isLicenseEnabled('READING_FIELD_UNITS_VALIDATION')
    },
    canEdit() {
      let hasState = getProperty(this.workorder, 'moduleState.id', null)
      let moduleStateId = getProperty(this.workorder, 'moduleState.id', -1)
      let isLocked = moduleStore.isStatusLocked(moduleStateId, 'workorder')
      let { isRequestedState } = this
      return hasState && !isLocked && !isRequestedState
    },
    openWorkorderId() {
      let id = this.$attrs.id || this.$route.params.id
      if (id) {
        return parseInt(id)
      }
      return -1
    },
    allTaskStatus() {
      let status = null
      let closedCount = 0
      let taskCount = 0
      if (!isEmpty(this.sortedTaskList)) {
        this.sortedTaskList.forEach(section => {
          let tasks = section.taskList
          tasks.forEach(task => {
            taskCount = taskCount + 1
            let isOpen = task.type === 'OPEN'
            let hasInputValue = task.inputValue

            if (isOpen && task.inputType !== 1 && !hasInputValue) {
              if (status === null) {
                status = false
              }
              status = status && false
            } else {
              if (status === null) {
                status = true
              }
              status = status && true

              if (!isOpen) {
                closedCount = closedCount + 1
              }
            }
          })
        })
      }
      if (closedCount === taskCount) {
        status = false
      }
      return status
    },
    openStatusId() {
      let id = moduleStore.getTicketStatusByLabel('Submitted', 'workorder').id
      if (id) {
        return parseInt(id)
      }
      return id
    },
    closedStatusId() {
      let id = moduleStore.getTicketStatusByLabel('Closed', 'workorder').id
      if (id) {
        return parseInt(id)
      }
      return id
    },
    resolvedStatusId() {
      let id = moduleStore.getTicketStatusByLabel('Resolved', 'workorder').id
      if (id) {
        return parseInt(id)
      }
      return id
    },
    workorder() {
      let { details } = this.$attrs
      let { record = {} } = details || {}
      if (!isEmpty(record)) {
        return record
      } else if (!isEmpty(details)) {
        return details
      }
      return {}
    },
    workorderSourceTypeNotPlanned() {
      let { workorder } = this
      let { sourceType } = workorder || {}

      return !isEmpty(sourceType) && sourceType !== 5
    },
    emptyStateMsg() {
      let { workorderSourceTypeNotPlanned } = this
      return workorderSourceTypeNotPlanned
        ? // ? this.$t('maintenance._workorder.task_body_text')
          ''
        : this.$t('maintenance._workorder.no_task_body_text')
    },

    ticketStatusValue() {
      if (this.workorder && this.workorder.status && this.workorder.status.id) {
        return (
          moduleStore.getTicketStatus(this.workorder.status.id, 'workorder') ||
          ''
        )
      }
      return ''
    },
    inventory() {
      return this.$store.state.inventory.inventory
    },
    stockedTools() {
      return this.$store.state.stockedtool.stockedTools
    },
    taskResources() {
      let obj = {}
      if (this.taskList) {
        for (let idx in this.taskList) {
          for (let task of this.taskList[idx]) {
            if (this.isMeterType(task)) {
              let meterId = getProperty(task, 'meter.id', '')
              obj[meterId] = getProperty(task, 'meter', {})
            } else if (task.resource && task.resource.id > 0) {
              obj[task.resource.id] = task.resource
            }
          }
        }
      }
      return Object.values(obj)
    },
    taskResource() {
      let obj = []
      let resourceSet = new Set()
      let meterSet = new Set()
      let tempResource = {
        label: 'All',
        value: -1,
        resource: {},
      }
      obj.push(tempResource)
      if (this.taskList) {
        for (let idx in this.taskList) {
          for (let task of this.taskList[idx]) {
            if (this.isMeterType(task)) {
              let meter = {
                label: getProperty(task, 'meter.name', ''),
                value: getProperty(task, 'meter.id', null),
                resource: getProperty(task, 'meter', {}),
                type: 'meter',
              }
              if (!meterSet.has(meter?.value)) {
                obj.push(meter)
                meterSet.add(meter?.value)
              }
            } else if (task.resource && task.resource.id > 0) {
              let resource = {
                label: task.resource.name,
                value: task.resource.id,
                resource: task.resource,
                type: 'resource',
              }

              if (!resourceSet.has(resource.value)) {
                obj.push(resource)
                resourceSet.add(resource.value)
              }
            }
          }
        }
      }
      return obj
    },
    filter() {
      let filter = {}
      let { workorder } = this
      if (workorder && workorder.siteId && workorder.siteId > 0) {
        filter.site = Number(workorder.siteId)
      }
      return filter
    },
    allowEdit() {
      return false
    },
    isApprovalEnabled() {
      let { workorder = {} } = this
      let { approvalFlowId, approvalStatus } = workorder || {}
      return !isEmpty(approvalFlowId) && !isEmpty(approvalStatus)
    },
    isRequestedState() {
      let { workorder } = this
      let { approvalStatus } = workorder || {}

      if (isEmpty(approvalStatus)) {
        return false
      } else {
        let statusObj = this.getApprovalStatus(approvalStatus.id)
        return getProperty(statusObj, 'requestedState', false)
      }
    },
    canDisable() {
      return this.isApprovalEnabled && !this.isRequestedState
    },
    currentView() {
      let viewName =
        this.$attrs.viewname || this.$route.params.viewname || 'all'

      return viewName
    },
    isDisabled() {
      return !this.consumptionData
    },
    canShowReportDownTime() {
      let { workorder, isNotPortal } = this
      let { resource } = workorder || {}
      let { resourceType, id } = resource || {}

      return isNotPortal && resourceType === 2 && id !== -1
    },
    selectedResourceName: function () {
      return JSON.parse(JSON.stringify(this.selectedTask))
    },
    setDateToString() {
      return String(new Date(this.workorder.createdTime))
    },
    isLockedState() {
      let { workorder } = this
      let { moduleState } = workorder || {}
      return getProperty(moduleState, 'recordLocked', false)
    },
    taskActionPermission() {
      let { linkName } = getApp() || {}
      if (linkName === 'client') {
        // disabling side bar for clinet portal only
        return false
      }
      return true
    },
    hasAddTaskPermission() {
      return (
        this.$access.hasPermission('workorder:ADD_UPDATE_DELETE_TASK') ||
        this.$access.hasPermission('workorder:UPDATE_TASK')
      )
    },
    hasExecuteTaskPermission() {
      // hasUpdateTaskPermission changed to hasExecuteTaskPermission
      let { linkName } = getApp() || {}
      if (linkName === 'newapp') {
        return true
      } else {
        return this.$access.hasPermission('workorder:UPDATE_WORKORDER_TASK')
      }
    },
    //TODO: WORK_ORDER_FEATURE_SETTINGS license check
    canExecuteTask() {
      // -- can be removed later --
      let { isWorkOrderFeatureSettingsLicenseEnabled } = this
      if (!isWorkOrderFeatureSettingsLicenseEnabled) {
        let { hasExecuteTaskPermission } = this
        return hasExecuteTaskPermission
      }
      // -- can be removed later --

      let { workOrderSettings } = this
      let { executeTask } = workOrderSettings || {}
      let { allowed = false } = executeTask || {}
      return allowed
    },
    //TODO: WORK_ORDER_FEATURE_SETTINGS license check
    canAddTask() {
      // -- can be removed later --
      let { isWorkOrderFeatureSettingsLicenseEnabled } = this
      if (!isWorkOrderFeatureSettingsLicenseEnabled) {
        return true
      }
      // -- can be removed later --

      let { workOrderSettings } = this
      let { manageTask } = workOrderSettings || {}
      let { allowed = false } = manageTask || {}
      return allowed
    },
    isUpdateTaskAllowed() {
      let { hasExecuteTaskPermission } = this
      return hasExecuteTaskPermission ? '' : 'pointer-events-none'
    },
    isUpdateAllowed() {
      let { hasExecuteTaskPermission } = this
      return hasExecuteTaskPermission ? '' : 'cursor-not-allowed'
    },
    addTaskCheckBasedOnWorkOrderFeatureSetting() {
      let {
        hasAddTaskPermission,
        canAddTask,
        isWorkOrderFeatureSettingsLicenseEnabled,
      } = this
      let addTaskCheck = false
      if (!isWorkOrderFeatureSettingsLicenseEnabled) {
        addTaskCheck = hasAddTaskPermission
      } else {
        // TODO: after this license is removed entirely keep this part
        addTaskCheck = canAddTask
      }
      return addTaskCheck
    },
    showAddNewTask() {
      let {
        workorder,
        canEdit,
        taskList,
        resolvedStatusId,
        isUserAddingTask,
        addTaskCheckBasedOnWorkOrderFeatureSetting,
      } = this
      let { sourceType, moduleState } = workorder || {}
      let { id } = moduleState || {}
      return (
        // can add the workorder planning setting check here (and) and move if to :disabled check
        !isEmpty(sourceType) &&
        !isEmpty(taskList) &&
        sourceType !== 5 &&
        canEdit &&
        id !== resolvedStatusId &&
        !isUserAddingTask &&
        addTaskCheckBasedOnWorkOrderFeatureSetting
      )
    },
    isTaskListEmpty() {
      let { taskList } = this
      return isEmpty(taskList)
    },
    canShowAddTaskButton() {
      let {
        workorderSourceTypeNotPlanned,
        addTaskCheckBasedOnWorkOrderFeatureSetting,
      } = this
      // can add the workorder planning setting check here (and) and move if to :disabled check
      return (
        workorderSourceTypeNotPlanned &&
        addTaskCheckBasedOnWorkOrderFeatureSetting
      )
    },
    addTaskButtonMessage() {
      let { showAddNewTask } = this
      if (showAddNewTask) {
        return 'Add Task'
      } else {
        // -- can be removed later --
        let { isWorkOrderFeatureSettingsLicenseEnabled } = this
        if (!isWorkOrderFeatureSettingsLicenseEnabled) {
          return 'You cannot add new Task!'
        }
        // -- can be removed later --
        let { workOrderSettings } = this
        let { manageTask } = workOrderSettings || {}
        let { reason } = manageTask || {}
        if (!isEmpty(reason)) {
          return reason
        }
      }
      return ''
    },
    isNumberField() {
      return task => {
        if (!isEmpty(task.readingField)) {
          return (
            (task.readingField.dataTypeEnum === 'NUMBER' ||
              task.readingField.dataTypeEnum === 'DECIMAL') &&
            task.readingField.metric === 5
          )
        }
      }
    },
    checkLastReading() {
      return task => {
        return !isEmpty(task.lastReading) && Number(task.lastReading) !== -1
      }
    },
    checkReadingField() {
      return task => {
        return (
          !isEmpty(task.readingField) &&
          task.readingField.metric > 0 &&
          task.readingFieldUnit > 0
        )
      }
    },
    canDisableButton() {
      let { isPrerequisiteCompleted, canExecuteTask } = this
      return !canExecuteTask || !isPrerequisiteCompleted
    },
    isClosedTab() {
      return Number(this.taskTab) === 2
    },
  },
  methods: {
    isBooleanField,
    isEnumField,
    async onResourceSelected(obj) {
      this.selectedResourceType = getProperty(obj, 'type', null)
      this.selectedTaskResource = obj.value
      if(this.selectedTaskResource > -1){
        this.assetFilter = obj.label
      }
      else{
        this.assetFilter = 'Select Asset/Space'

      }
      await this.getSortedTaskList()
      this.autoResize()
    },
    onTaskOptionSelected(task) {},
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
        this.taskTabList = [
          { label: 'All(' + this.taskChartData.value + ')', value: '1' },
          {
            label: 'Open(' + this.taskChartData.open + ')',
            value: '2',
          },
          {
            label: 'Closed(' + this.taskChartData.currentValue + ')',
            value: '3',
          },
        ]
      }
    },
    autoResize() {
      this.$nextTick(() => {
        let params = {}
        let { widget } = this
        let defaultWidgetHeight = widget?.height || 24
        let container = this.$refs['workOrderTasksWidget']

        if (!container) return

        let height = container.scrollHeight || container.$el.scrollHeight
        let width = container.scrollWidth || container.$el.scrollWidth

        let dimensions = this.calculateDimensions({ height, width })

        if (isEmpty(dimensions)) return
        let { h } = dimensions || {}
        if (h <= defaultWidgetHeight) {
          params = { h }
          this.needsShowMore = false
        } else {
          params = { height, width }
          let { defaultWidgetHeight = 24 } = this
          this.needsShowMore = h > defaultWidgetHeight ? true : false
          this.defaultWidgetHeight = defaultWidgetHeight
        }
        this.resizeWidget(params)
      })
    },
    autoResizeWithHeight(height) {
      this.$nextTick(() => {
        let params = {}
        let { widget } = this
        let width = container.scrollWidth || container.$el.scrollWidth

        let dimensions = this.calculateDimensions({ height, width })

        if (isEmpty(dimensions)) return
        let { h } = dimensions || {}
        if (h <= defaultWidgetHeight) {
          params = { h }
          this.needsShowMore = false
        } else {
          params = { height, width }
          let { defaultWidgetHeight = 24 } = this
          this.needsShowMore = h > defaultWidgetHeight ? true : false
          this.defaultWidgetHeight = defaultWidgetHeight
        }
        this.resizeWidget(params)
      })
    },
    convertTimeAsIfFromDatePicker(dateInMillis) {
      return getDateInOrgTimezone(dateInMillis)
    },
    reloadCloseTasks() {
      this.reloadSummary()
    },

    reloadTasks(task) {
      this.addTask(task)
      this.reloadSummary()
    },
    async init() {
      let { isWorkPermitLicenseEnabled } = this
      this.woWidget.relatedList.module = (this.moduleMeta || {}).module
      if (isWorkPermitLicenseEnabled) {
        API.get('module/meta?moduleName=workPermit').then(response => {
          if (response.status === 200) {
            setProperty(
              this,
              'permitWidget.relatedList.module',
              getProperty(response, 'data.meta.module', null)
            )
            this.showPermitListWidget = true
          }
        })
      }
      this.loadSafetyPlanWidgets()
      this.invokeRelatedListWidget = true
      this.loading = false
    },
    loadSafetyPlanWidgets() {
      if (this.$access.isLicenseEnabled('SAFETY_PLAN')) {
        API.get('module/meta?moduleName=workorderHazard').then(response => {
          if (response.status === 200) {
            setProperty(
              this,
              'hazardWidget.relatedList.module',
              getProperty(response, 'data.meta.module', null)
            )
            setProperty(
              this,
              'hazardWidget.relatedList.module.displayName',
              'Hazards'
            )
            this.showHazardListWidget = true
          }
        })
      }
    },

    preRequisiteApprove() {
      this.updateWorkOrder([this.openWorkorderId], {
        preRequisiteApproved: true,
        preRequestStatus: 3,
      })
    },
    async loadReadingFieldUnits() {
      let { data, error } = await API.get('v2/getReadingFieldUnits')
      if (!error) {
        if (data) {
          this.metricWithUnits = data.readingFieldUnits.MetricsWithUnits
        }
      }
    },
    getReadingFieldUnits(readingFieldMetricId) {
      if (!isEmpty(this.metricWithUnits)) {
        let currentMetricId = Object.keys(this.metricWithUnits).find(
          metricUnitKey => metricUnitKey == readingFieldMetricId
        )
        let readingFieldUnits = this.metricWithUnits[currentMetricId]
        let readingsUnits = readingFieldUnits.map(units => {
          return {
            label: units.symbol,
            value: units.unitId,
          }
        })
        return readingsUnits
      }
    },
    redirectToSpecialModule(field, data) {
      if (isEmpty(field) || isEmpty(data)) return

      let { name: fieldName, lookupModule = {} } = field

      if (isEmpty(lookupModule)) return

      let { name } = lookupModule

      let { name: routeName } =
        findRouteForModule(name, pageTypes.OVERVIEW) || {}

      if (routeName) {
        let { id } = name === 'vendors' ? data[name] : data[fieldName]

        this.$router.push({
          routeName,
          params: {
            viewname: 'all',
            id,
          },
        })
      }
    },
    updateUrl(transition) {
      if (!isEmpty(transition)) {
        let stateObj = moduleStore.getTicketStatus(
          transition.toStateId,
          'workorder'
        )

        if (getProperty(stateObj, 'type') === 'CLOSED') {
          return '/v2/workorders/close'
        } else return '/v2/workorders/update'
      }
    },
    transitionFilter(transition) {
      let stateObj = moduleStore.getTicketStatus(
        transition.toStateId,
        'workorder'
      )
      let isDisallowedState =
        stateObj.type === 'CLOSED' && !hasWorkOrderClosePermission
      return !isDisallowedState
    },
    getSelectedTaskReadingFieldProperty(property) {
      return getProperty(this.selectedTask, `readingField.${property}`, '')
    },
    fieldOptions(task) {
      let { readingField } = task || {}
      let options = []
      if (!isEmpty(readingField)) {
        let { enumMap } = readingField
        options = Object.entries(enumMap || {}).map(([key, value]) => {
          return { value: key, label: value }
        })
      }
      return options
    },

    canDisableField(field) {
      let type = getProperty(field, 'status.type', '')
      let { isPrerequisiteCompleted, canExecuteTask } = this
      return !canExecuteTask || !isPrerequisiteCompleted || type !== 'OPEN'
    },
    canDisableCloseTask(allTaskStatus) {
      let { isPrerequisiteCompleted, canExecuteTask } = this
      return !canExecuteTask || !isPrerequisiteCompleted || !allTaskStatus
    },
    isTaskClosed(task) {
      let type = getProperty(task, 'status.type', '')
      return type !== 'OPEN'
    },
    canDisableAttachment(task) {
      let {
        isLockedState,
        isPrerequisiteCompleted,
        moduleMeta,
        canExecuteTask,
      } = this
      let type = getProperty(task, 'status.type', '')
      let hideGallery = getProperty(
        moduleMeta,
        'moduleSetting.hideGallery',
        false
      )
      return (
        type !== 'OPEN' ||
        !isPrerequisiteCompleted ||
        isLockedState ||
        hideGallery ||
        !canExecuteTask
      )
    },
    getButtonName(task) {
      return this.isTaskClosed(task)
        ? this.$t('maintenance._workorder.reopen_task')
        : this.$t('maintenance._workorder.complete_task')
    },
    openAddNewTask(selectedSection) {
      this.selectedSection = selectedSection
      this.showAddTask = true
    },
    openAddTaskAttachments(selectedTask) {
      this.selectedTask = selectedTask
      this.showAttachmentsDialogue = true
    },
    openAddTaskRemark(selectedTask) {
      this.selectedTask = selectedTask
      this.showRemarksDialogue = true
    },
    openTaskOverView(selectedTask) {
      this.selectedTask = selectedTask
      this.showTaskOverview = true
    },
    closeDialog() {
      this.showAttachmentsDialogue = false
    },
    getOption(option) {
      return option
        .filter(item => item !== null)
        .map((item, index) => ({
          label: item,
          value: item,
        }))
      // console.log('options---', opt)
    },
    checkForHoursAndMins(task) {
      this.$nextTick(() => {
        if (
          this.$refs['fTaskMin' + task.id] &&
          this.$refs['fTaskMin' + task.id][0] &&
          document.activeElement ===
            this.$refs['fTaskMin' + task.id][0].$el.querySelector(
              '.el-input input.el-input__inner'
            )
        ) {
        } else {
          if (task && (task.hours || task.minutes)) {
            let duration = dayjs.duration({
              hours: task.hours || 0,
              minutes: task.minutes || 0,
              seconds: 0,
            })
            let seconds = duration.as('seconds')
            task.inputValue = seconds
            let { readingField } = task || {}
            let { metric } = readingField || {}
            if (!isEmpty(metric)) {
              if (metric == METRIC_HASH['DURATION']) {
                task.readingFieldUnit = 20
              }
            }
          }
          this.onReadingChange(task)
        }
      })
    },
    getOptions(task) {
      return [
        {
          label: task.readingField.trueVal ? task.readingField.trueVal : 'True',
          value: 1,
        },
        {
          label: task.readingField.falseVal
            ? task.readingField.falseVal
            : 'False',
          value: 0,
        },
      ]
    },
    isReadingEnum(task) {
      let { readingField } = task || {}
      return readingField && isEnumField(readingField)
    },
    updateReading(selectedTask) {
      if (
        selectedTask.inputTime &&
        this.nextExecutionTime &&
        this.nextExecutionTime > 0
      ) {
        let startTime = this.workorder.createdTime
        let endTime = this.nextExecutionTime

        if (
          !(
            selectedTask.inputTime.valueOf() >= startTime &&
            selectedTask.inputTime.valueOf() < endTime
          )
        ) {
          let s = getOrgMoment(startTime).format('D MMM, h:mm a')
          let e = getOrgMoment(endTime).format('D MMM, h:mm a')
          ftoast.critical(
            this.$t('maintenance._workorder.task_input_time_invalid', [s, e])
          )
          return
        }
      }
      this.onReadingChange(selectedTask)
    },
    canShowResource(task = {}) {
      let { resource, meter } = task
      return !isEmpty(resource) || !isEmpty(meter)
    },
    getResourceName(task = {}) {
      let { meter, resource } = task
      resource = !isEmpty(resource) ? resource : meter

      return getProperty(resource, 'name', '---')
    },
    isMeterType(task = {}) {
      let { meter } = task
      return !isEmpty(meter)
    },
    saveTask(task) {
      this.waitBoolean = true
      this.readingFieldErrorToggle = false
      this.readingFieldError = null
      this.onReadingChange(task)
    },
    updateData(newData) {
      this.consumptionData = newData.consumptionData
      this.readingData = newData.readingData
    },
    closeAlert() {
      this.readingFieldErrorToggle = false
      this.readingFieldError = null
    },
    onChange(task) {
      this.selectedTask = task
      this.onReadingChange(task)
    },
    isEmptyTask(taskobj) {
      return isEmpty(taskobj.taskList)
    },
    async loadFeatureSettingsForWorkorder(){
      let route = 'v3/workorders/features/' + this.workorder.id
      let {data}=  await API.get(route)
      if(!isEmpty(data)){
        this.workOrderSettings=data.workOrderSettings
      }
    }
  },
  watch: {
    workorder: function () {
      let title =
        '[#' + this.workorder.serialNumber + '] ' + this.workorder.subject
      this.setTitle(title)
      if (this.workorder.priority) {
        this.workorder.priority = this.getTicketPriority(
          this.workorder.priority.id
        )
      }
      if (!this.workorder.data) {
        this.workorder.data = {}
      }
      this.setDueDate(this.workorder.dueDate)
      this.updateTaskChartData()
    },
    openWorkorderId: function () {
      this.fetchWo(true)
    },
    filteredComments(list) {
      if (isEmpty(list)) this.commentFocus = true
    },
    moduleMeta(newVal, oldVal) {
      if (newVal && oldVal !== newVal) {
        this.init()
      }
    },
    isActive(isActive) {
      if (!isActive && this.canShowAllComments) this.showAllComments()
    },
    selectedResourceName: function (newVal, oldVal) {
      let { id } = this.selectedTask || -1
      if (id === -1 && newVal && oldVal) {
        if (newVal.resource && oldVal.resource) {
          let newName = getProperty(newVal, 'resource.name')
          let oldName = getProperty(oldVal, 'resource.name')
          if (newName && oldName && newName != oldName) {
            this.selectedTask.readingFieldId = ''
            this.selectedTask.inputType = 1
            this.selectedTask.enableInput = false
            this.selectedTask.options = []
          }
        }
      }
    },
  },
  filters: {
    getUser: function (id, users) {
      let userObj = users.find(user => user.id === id)
      if (userObj) {
        return userObj
      } else {
        return {
          name: 'System',
        }
      }
    },
    options: function (jsonobj, type) {
      let array = []
      if (type === 'category' || type === 'priority') {
        for (let jsonkey in jsonobj) {
          let val = jsonobj[jsonkey]
          array.push({ label: val, value: parseInt(jsonkey) })
        }
      } else if (type === 'user' || type === 'space') {
        for (let key in jsonobj) {
          array.push({ label: jsonobj[key].name, value: jsonobj[key].id })
        }
      }
      return array
    },
  },
}
</script>
<style>
.wo-task-row:hover {
  z-index: 8;
  position: relative;
  box-shadow: var(--elevation-lightLow02);
}
.wo-task-checkbox-unchecked:hover {
  color: var(--colors-backgroundSemanticGreenDark);
}
.wo-task-checkbox-checked:hover {
  color: var(--colors-iconNeutralMain);
}

.radio-group .f-radio {
  padding-bottom: 0px !important;
}
</style>
