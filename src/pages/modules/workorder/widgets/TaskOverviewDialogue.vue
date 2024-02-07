<template>
  <div>
    <FModal
      :visible.sync="showTaskOverview"
      size="M"
      @cancel="close"
      :hideFooter="false"
    >
      <template #header>
        <FContainer
          display="flex"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <FContainer>
            <FContainer display="flex" alignItems="center">
              <FText appearance="headingMed16" color="textMain">
                {{ newTask.subject }}
              </FText>
              <FContainer padding-left="5px" />
              <FTags
                v-if="canShowResource"
                padding-right="5px"
                appearance="simple"
                :disabled="false"
                :text="resourceName"
                ><template slot="prefix">
                  <FIcon
                    v-if="isMeterType"
                    group="webtabs"
                    name="meter"
                    size="12" />
                  <FIcon
                    v-else-if="newTask.resource.resourceType === 1"
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
            </FContainer>
          </FContainer> </FContainer
      ></template>
      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          justifyContent="flex-end"
        >
          <FButton @click="handleOk" appearance="primary"
            >{{newTask.statusNew === 1? "Mark as Complete" : "Reopen"}}
          </FButton>
        </FContainer>
      </template>
      <FContainer padding="containerLarge">
        <FTabs
          appearance="link"
          :tabsList="getTabList"
          v-model="val"
          @change="changesStatusBar()"
        >
          //Details tab
          <FTabPane activeKey="1" key="1">
            <FDivider width="100" />
            <FNotification v-if="showActionBar"
                description="Please ensure that all actions are filled out."
                intent="warning"
                menuType="alerts"
                rounded
                :hideCloseIcon="true"
              >
              </FNotification>
            <FContainer padding="containerXxLarge">
              <FRecordDetails
                :record="newTask"
                :fields="getGeneralFieldList"
                lablePosition="top"
                :layout="4"
                title="General Information"
              ></FRecordDetails>
              <!-- <FieldsGroup
                title="Task Details"
                :detailsLayout="detailsLayout"
                :details="newTask"
                :config="config"
                :insidePop="true"
              ></FieldsGroup> -->
              <FDivider  v-if="newTask.sfgScheduleId" width="100" />
              <FContainer
                paddingTop="containerXxLarge"
                display="flex"
                flexDirection="column"
                gap="containerXxLarge"
                v-if="newTask.sfgScheduleId"
              >
                <FTags appearance="simple" text="Actions" :disabled="false" />
                <FText>{{ selectedTask.actionContent || '---' }}</FText>
                <FDivider width="100" />
              </FContainer>
              <FContainer
                paddingTop="containerXxLarge"
                display="flex"
                flexDirection="column"
                gap="containerXxLarge"
                v-if="newTask.sfgScheduleId"
              >
                <FTags appearance="simple" text="Notes" :disabled="false" />
                <FText>{{ selectedTask.notes || '---' }}</FText>
                <FDivider width="100" />
              </FContainer>
            </FContainer>
          </FTabPane>
          //Attachments tab
          <FTabPane activeKey="2" key="2">
            <FDivider width="100" />
            <FNotification v-if="showErrorBar"
                description="Task completion requires data input prior to closure."
                intent="critical"
                menuType="alerts"
                rounded
                :hideCloseIcon="true"
              >
              </FNotification>
            <FContainer
              padding="containerXxLarge"
              gap="containerXLarge"
              display="flex"
              flex-direction="column"
            >
              <FText
                v-if="Number(task.inputType) != 1"
                appearance="headingMed14"
                color="textMain"
                >Input</FText
              >
              <!-- #options and  readings-->
              <FContainer
                display="flex"
                justify-content="left"
                align-items="center"
                v-if="Number(task.inputType) != 1"
              >
                <FContainer
                  v-if="Number(task.inputType) === 2"
                  display="flex"
                  justify-content="flex-end"
                >
                  <FContainer
                    gap="containerMedium"
                    display="flex"
                    v-if="isNumberField(task)"
                  >
                    <FInput
                      type="number"
                      @focus="checkAndShowTask(task)"
                      @change="checkForHoursAndMins(task)"
                      v-model="task.hours"
                      :disabled="canDisableField"
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
                      :disabled="canDisableField"
                      size="small"
                    >
                      <template #suffix>Minute</template>
                    </FInput>
                  </FContainer>
                  <FContainer v-else display="flex" gap="containerMedium">
                    <FContainer width="50%">
                      <FDatePicker
                        :placeholder="setDateToString()"
                        v-model="task.inputTime"
                        @change="updateReading(task)"
                        type="date-time"
                        :disabled="canDisableField"
                        :value="new Date(workorder.createdTime)"
                        size="small"
                      ></FDatePicker>
                    </FContainer>
                    <FContainer
                      display="flex"
                      align-items="center"
                      gap="containerMedium"
                    >
                      <FContainer
                        v-if="
                          task.readingField && isBooleanField(task.readingField)
                        "
                        padding-bottom="0px"
                      >
                        <FRadioGroup
                          v-model="task.inputValue"
                          @change="onReadingChange(task)"
                          :disabled="canDisableField"
                          alignment="horizontal"
                          :options="getOptions(task)"
                        >
                        </FRadioGroup>
                      </FContainer>
                      <FSelect
                        v-else-if="isReadingEnum(task)"
                        v-model="task.inputValue"
                        @change="onReadingChange(task)"
                        :disabled="canDisableField"
                        :options="fieldOptions(task)"
                        size="small"
                      >
                      </FSelect>
                      <FContainer width="50%" v-else>
                        <FInput
                          type="number"
                          @focus="checkAndShowTask(task)"
                          @change="onReadingChange(task)"
                          v-model="task.inputValue"
                          :disabled="canDisableField"
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
                              :disabled="canDisableField"
                              :clearable="false"
                              :options="
                                getReadingFieldUnits(task.readingField.metric)
                              "
                          /></template>
                        </FInput>
                      </FContainer>

                      <FContainer
                        v-if="
                          !isReadingFieldValidationEnabled &&
                          isReadingUnit(task)
                        "
                      >
                        {{ task.readingField.unit }}
                      </FContainer>
                    </FContainer>
                  </FContainer>
                </FContainer>
                <FContainer v-if="Number(task.inputType) === 3">
                  <FContainer>
                    <FInput
                      :disabled="canDisableField"
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
                </FContainer>
                <FContainer v-if="Number(task.inputType) === 4">
                  <FContainer>
                    <FInput
                      :disabled="canDisableField"
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
                </FContainer>
                <FContainer v-if="Number(task.inputType) === 5">
                  <FContainer>
                    <FSelect
                      @change="addTask(task)"
                      @focus="checkAndShowTask(task)"
                      v-model="task.inputValue"
                      :disabled="canDisableField"
                      :options="getOption(task.options)"
                      size="small"
                    >
                    </FSelect>
                  </FContainer>
                </FContainer>
              </FContainer>

              <FText appearance="headingMed14" color="textMain">Remarks</FText>
              <FTextArea
                v-model="newTask.remarks"
                :rows="rows"
                placeholder="Enter here"
                :readOnly="canDisableField"
              ></FTextArea>
            </FContainer>
          </FTabPane>
          //Input And remarks tab
          <FTabPane activeKey="3" key="3">
            <FDivider width="100" />
            <FContainer display="flex" justify-content="center">
              <FTabs
                class="task-attachment-tabs"
                v-model="activeTab"
                :tabsList="tabs"
              >
                <FTabPane
                  class="task-attachment-tabs-content"
                  v-for="tab in tabs"
                  :activeKey="tab.value"
                  :key="tab.value"
                >
                  <FImageUploader
                    v-if="activeTab === 'before'"
                    v-model="beforeTask"
                    title=""
                    description=""
                    :uploadFile="uploadBeforeTask"
                    :maxCount="maxCount"
                    :removeFile="removeFile"
                    @onFileDownload="downloadFile"
                    @onViewMoreClick="onMoreClick"
                    @onImageClick="imageClick"
                    emptyCardTitle="No image uploaded yet"
                    emptyCardDescription="Currently, there is no image uploaded."
                  />
                  <FImageUploader
                    v-if="activeTab === 'after'"
                    v-model="afterTask"
                    title=""
                    description=""
                    :uploadFile="uploadAfterTask"
                    :maxCount="maxCount"
                    :removeFile="removeFile"
                    @onFileDownload="downloadFile"
                    @onViewMoreClick="onMoreClick"
                    @onImageClick="imageClick"
                    emptyCardTitle="No image uploaded yet"
                    emptyCardDescription="Currently, there is no image uploaded."
                  />
                </FTabPane>
              </FTabs>
              <iframe
                v-if="downloadUrl"
                :src="downloadUrl"
                style="display: none"
              ></iframe>
              <div v-if="showPreview">
                <FFilePreview
                  :files="previewFileList"
                  :openPreview="showPreview"
                  :previewFile="preview"
                  @close="onclose"
                  @onFileDownload="downloadFile"
                />
              </div>
            </FContainer>
          </FTabPane>
        </FTabs>
        <TaskReadingsValidationModal 
          v-if="isReadingFieldValidationEnabled && readingFieldErrorToggle"
          :task.sync="task"
          :readingFieldErrorToggle="readingFieldErrorToggle"
          :readingFieldError="readingFieldError"
          :readingFieldSuggestionToggle="readingFieldSuggestionToggle"
          :readingFieldSuggestions="readingFieldSuggestions"
          :canExecuteTask="canExecuteTask"
          :readingData= "readingData"
          :consumptionData="consumptionData"
          @saveTask="saveTask"
          @updateData="updateData"
          @closeAlert="closeAlert"
      />
      </FContainer>
    </FModal>
  </div>
</template>
<script>
import workorderMixin from '../workorderHelper'
import TaskAttachmentPreview from './NewTaskAttachmentsPreview.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import {
  FModal,
  FTextArea,
  FContainer,
  FButton,
  FRecordDetails,
  FTags,
  FTabPane,
  FTabs,
  FDivider,
  FText,
  FIcon,
  FEmptyState,
  FImageUploader,
  FInput,
  FSelect,
  FRadioGroup,
  FNotification,
  FDatePicker,
  FFilePreview,
  ftoast,
  fDialog
} from '@facilio/design-system'
import { FieldsGroup } from '@facilio/ui/new-app'
import getProperty from 'dlv'
import module from '../../../../store/module'
import { isBooleanField, isEnumField } from '@facilio/utils/field'
import FilePreview from '../../../../components/page-builder/widgets/fieldSummary/FilePreview.vue'
import TaskReadingsValidationModal from './TaskReadingsValidationModal.vue'


let moduleStore = module()

export default {
  name: 'TaskOverview',
  mixins: [workorderMixin],
  props: [
    'moduleName',
    'task',
    'showTaskOverview',
    'workorder',
    'isPrerequisiteCompleted',
    'isLockedState',
    'canExecuteTask',
    'details',
    'taskList',
    'readingFieldErrorToggle',
    'canDisableField'
  ],
  data() {
    return {
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
      column: [
        {
          displayName: 'Description',
          name: 'description',
          type: 'text',
          span: 4,
        },
        { displayName: 'Name', name: 'subject', type: 'text', span: 1 },
        // { displayName: 'Status', name: 'status', type: 'status' },
        // { displayName: 'Link', name: 'link', type: 'link' },
        // { displayName: 'Tags', name: 'tags', type: 'tag' },
        // { displayName: 'IconText', name: 'first_name', type: 'iconText' },
        // { displayName: 'Popover', name: 'popover', type: 'popover' },
      ],
      generalFieldList: [
        {
          displayName: 'Description',
          name: 'description',
          type: 'text',
          span: 4,
        },
        {
          displayName: 'Frequency',
          name: 'taskFrequencyName',
          span: 1,
          type: 'text',
        },
        {
          displayName: 'SkillSet',
          name: 'skillSetName',
          span: 1,
          type: 'text',
        },
        {
          displayName: 'Criticality',
          name: 'taskCriticalityName',
          span: 1,
          type: 'text',
        },
      ],
      remarks: null,
      taskBulkList: [],
      waitBoolean: true,
      rows: 5,
      val: '1',
      detailsLayout: [],
      config: {},
      tabs: [
        {
          label: 'Before',
          value: 'before',
        },
        {
          label: 'After',
          value: 'after',
        },
      ],
      activeTab: 'before',
      beforeTask: [],
      afterTask: [],
      maxCount: 6,
      downloadUrl: null,
      loading: false,
      metricWithUnits: {},
      previewFileList: [],
      showPreview: false,
      preview: {},
      showActionBar:false,
      showErrorBar:false,
      readingFieldError: null,
      readingFieldSuggestionToggle: false,
      readingFieldSuggestions: [],
      readingData: 6,
      consumptionData: '',
      tabList: [
        { label: 'Task Details', value: '1' },
        { label: 'Input and Remarks', value: '2' },
        { label: 'Attachments', value: '3' },
      ],
    }
  },
  created() {
    this.remarks = this.newTask?.remarks || null
  },
  components: {
    FModal,
    FIcon,
    FTextArea,
    FContainer,
    FButton,
    FRecordDetails,
    FTags,
    FTabPane,
    FTabs,
    FEmptyState,
    TaskAttachmentPreview,
    FDivider,
    FText,
    FieldsGroup,
    FImageUploader,
    FInput,
    FSelect,
    FRadioGroup,
    FDatePicker,
    FilePreview,
    FFilePreview,
    FNotification,
    TaskReadingsValidationModal
  },
  computed: {
    currModuleName() {
      return 'workorder'
    },
    widgetTitle() {
      return 'Tasks'
    },
    newTask() {
      // get() {
      return this.task
      // },
      // set(task) {
      //   this.$emit('update:task', task)
      // },
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
    checkReadingField() {
      return task => {
        return (
          !isEmpty(task.readingField) &&
          task.readingField.metric > 0 &&
          task.readingFieldUnit > 0
        )
      }
    },
    isReadingUnit() {
      return task => {
        return !isEmpty(task.readingField) && !isEmpty(task.readingField.unit)
      }
    },
    canShowResource() {
      let { newTask = {} } = this
      let { resource, meter } = newTask
      return !isEmpty(resource) || !isEmpty(meter)
    },
    resourceName() {
      let { newTask = {} } = this
      let { resource, meter } = newTask
      resource = !isEmpty(resource) ? resource : meter

      return getProperty(resource, 'name', '---')
    },
    isMeterType() {
      let { newTask = {} } = this
      let { meter } = newTask
      return !isEmpty(meter)
    },
    getGeneralFieldList() {
      let { newTask = {} } = this
      if (isEmpty(newTask.sfgScheduleId)) {
        this.generalFieldList = this.generalFieldList.filter(
          item => item.name !== 'skillSetName'
        )
      }
      return this.generalFieldList
    },
    getTabList() {
      let { newTask = {} } = this
      this.tabList.forEach(item => {
        if (Number(item.value) === 2 && Number(newTask.inputType) === 1) {
          item.label = 'Remarks'
        }
      })
      return this.tabList
    },
  },
  async mounted() {
    this.loadAttachments()
    await this.loadReadingFieldUnits()
  },
  methods: {
    isBooleanField,
    isEnumField,
    close() {
      this.$emit('update:showTaskOverview', false)
    },
    handleOk() {
      if (this.val == '1') {
        this.showActionBar = true
      } else if (this.val == '2') {
        let task = JSON.parse(JSON.stringify(this.task))
        let { preRequestStatus = -1 } = this.workorder || {}
        if (preRequestStatus !== 1 || preRequestStatus !== 4) {
          let isOpen = task.status.type === 'OPEN'
          if (isOpen && task.inputType !== 1 && !task.inputValue) {
            this.showErrorBar = true
          } else {
            this.updateTask()
          }
        } else {
          this.updateTask()
        }
      }
    },
    updateTask() {
      let task = JSON.parse(JSON.stringify(this.task))
      task.remarks = this.remarks
      if (this.isPrerequisiteCompleted && this.canExecuteTask) {
        this.changeTaskStatus(task)
      }
      this.$emit('reloadCloseTasks')
      // this.$emit('update:task', this.newTask)
      this.close()
    },
    isTaskClosed(task) {
      let type = getProperty(task, 'status.type', '')
      return type !== 'OPEN'
    },

    async removeFile(attachment) {
      this.loading = true
      let { parentModule: parentModuleName } = this || {}
      let recordId = this.details.id
      let module = 'taskattachments'

      let obj = {
        attachmentId: [attachment.id],
        module: module,
        parentModuleName,
        recordId,
      }

      let promptValue = await fDialog.warning({
        title: 'Delete Attachment',
        description: 'Are you sure you want to delete this attachment',
        saveText: 'Delete',
        cancelText: 'Cancel',
      })
      if (promptValue) {
        let { error } = await API.post('/v2/attachments/delete', obj)
        if (!isEmpty(error)) {
          ftoast.critical(error.message || this.$t('error_occurred'))
        } else {
          ftoast.success('Attachment deleted successfully!')
          this.loadAttachments()
        }
      }
      this.loading = false
    },
    downloadFile(attachment) {
      if (attachment.downloadUrl) {
        this.downloadUrl = attachment.downloadUrl
      }
    },
    async uploadBeforeTask(files) {
      return await this.filesChange(files, 1)
    },
    async uploadAfterTask(files) {
      return await this.filesChange(files, 2)
    },
    async filesChange(files, attType) {
      this.loading = true
      let fileList = Array.from(files)
      if (!fileList.length) return

      const formData = new FormData()
      formData.append('module', 'taskattachments')
      formData.append('recordId', this.details.id)
      formData.append('attachmentType', attType)
      fileList.forEach(file => {
        const fileObject = file.originFileObj || file

        if (fileObject instanceof File) {
          formData.append('attachment', fileObject, fileObject.name)
        }
      })
      let { data, error } = await API.post('/attachment/add', formData)

      if (!isEmpty(error)) {
        let { message } = error || 'Error Occured'
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        let { attachments } = data
        let attachmentsList = attachments.map(attachment => {
          return {
            ...attachment,
            url: attachment.previewUrl,
          }
        })
        await this.loadAttachments()
        return attachmentsList
      }
    },
    onMoreClick(val) {
      this.previewFileList = []
      let photos = this.beforeTask
      this.previewFileList = photos
      this.preview = photos[0]
      this.showPreview = true
    },
    imageClick(val) {
      this.previewFileList = []
      this.previewFileList.push(val)
      this.preview = val
      this.showPreview = true
    },
    onclose() {
      this.showPreview = false
    },

    async loadAttachments() {
      this.loading = true
      let { parentModule: parentModuleName } = this || {}
      let recordId = this.details.id
      let module = 'taskattachments'

      let url = `/attachment`

      let param = {
        module,
        recordId,
      }
      if (!isEmpty(parentModuleName)) {
        param = { ...param, parentModuleName }
      }

      let { data, error } = await API.get(url, param)
      if (!isEmpty(error)) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        let { attachments } = data || {}
        let beforeData = attachments.filter(item => item.type === 1)

        this.beforeTask = beforeData.map(photo => {
          photo.uid = photo.fileId
          photo.lastModifiedTime = photo.sysModifiedTime
          photo.lastModifiedDate = ''
          photo.name = photo.fileName
          photo.size = 0
          photo.type = photo.contentType
          photo.url = photo.previewUrl
          photo.originFileObj = '[object File]'
          return photo
        })
        let afterData = attachments.filter(item => item.type === 2)
        this.afterTask = afterData.map(photo => {
          photo.uid = photo.fileId
          photo.lastModifiedTime = photo.sysModifiedTime
          photo.lastModifiedDate = ''
          photo.name = photo.fileName
          photo.size = 0
          photo.type = photo.contentType
          photo.url = photo.previewUrl
          photo.originFileObj = '[object File]'
          return photo
        })
        this.maxCount = attachments.length
      }
      this.loading = false
    },
    checkForHoursAndMins(task) {
      this.$emit('checkForHoursAndMins', task)
    },
    getOption(option) {
      return option
        .filter(item => item !== null)
        .map((item, index) => ({
          label: item,
          value: item,
        }))
    },
    setDateToString() {
      return String(new Date(this.workorder.createdTime))
    },
    updateReading(task) {
      this.$emit('updateReading', task)
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
    fieldOptions(task) {
      this.$emit('fieldOptions', task)
    },
    isReadingFieldValidationEnabled() {
      return this.$access.isLicenseEnabled('READING_FIELD_UNITS_VALIDATION')
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
    changesStatusBar(){
       this.showActionBar=false
       this.showErrorBar=false
    },
    saveTask(task){
      this.waitBoolean=true
      this.readingFieldErrorToggle = false
      this.readingFieldError = null
      this.onReadingChange(task)
    },
    updateData(newData){
     this.consumptionData=newData.consumptionData
     this.readingData=newData.readingData
    },
    closeAlert(){
      this.readingFieldErrorToggle = false
      this.readingFieldError = null
    },
  },
}
</script>
<style>
.task-attachment-tabs > div {
  padding: var(--spacing-containerSmall) var(--spacing-containerSmall);
  border-bottom: 1px solid var(--colors-borderNeutralBaseSubtle);
}
.fc-task-remarks-dia {
  padding: 24px 16px;
}
</style>
