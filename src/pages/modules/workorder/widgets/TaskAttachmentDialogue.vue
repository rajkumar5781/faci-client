<template>
  <div>
    <FModal
      title="Attachments"
      :visible="true"
      saveText="Save Changes"
      size="S"
      @ok="handleOk"
      @cancel="close"
      :hideFooter="false"
    >
      <FTabs
        appearance="link"
        :tabsList="[
          { label: 'Before', value: '1' },
          { label: 'After', value: '2' },
        ]"
        v-model="val"
      >
        <FTabPane activeKey="1" key="1">
          <FDivider width="100" />
          <FContainer class="p10" display="flex" justify-content="center">
            <task-attachment-preview
              module="taskattachments"
              :isLockedState="isLockedState || !canExecuteTask"
              :isTaskClosed="isTaskClosed(details)"
              :record="details"
              @taskattachmentactivity="loadactivitie()"
              :key="details.id"
              :type="1"
            ></task-attachment-preview
          ></FContainer>
        </FTabPane>
        <FTabPane activeKey="2" key="1">
          <FDivider width="100" />
          <FContainer class="p10" display="flex" justify-content="center">
            <task-attachment-preview
              module="taskattachments"
              :isLockedState="isLockedState || !canExecuteTask"
              :isTaskClosed="isTaskClosed(details)"
              :record="details"
              @taskattachmentactivity="loadactivitie()"
              :key="details.id"
              :type="2"
            ></task-attachment-preview
          ></FContainer>
        </FTabPane>
      </FTabs>
    </FModal>
  </div>
</template>
<script>
import workorderMixin from '../workorderHelper'
import getProperty from 'dlv'
import {
  FSpinner,
  FTable,
  FContainer,
  FRow,
  FCol,
  FDivider,
  FIcon,
  FButton,
  FModal,
  FText,
  FTabs,
  FTabPane,
  FRecordDetails,
} from '@facilio/design-system'
import TaskAttachmentPreview from './NewTaskAttachmentsPreview.vue'
export default {
  name: 'Tasks',
  mixins: [workorderMixin],
  props: [
    'moduleName',
    'details',
    'showAttachmentsDialogue',
    'isLockedState',
    'canExecuteTask',
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
      val: '1',
    }
  },
  components: {
    TaskAttachmentPreview,
    FSpinner,
    FTable,
    FContainer,
    FRow,
    FCol,
    FDivider,
    FIcon,
    FButton,
    FModal,
    FText,
    FTabs,
    FTabPane,
    FRecordDetails,
  },
  computed: {
    currModuleName() {
      return 'workorder'
    },
    widgetTitle() {
      return 'Tasks'
    },
    workorder() {
      return this.details
    },
  },
  methods: {
    close() {
      this.$emit('update:showAttachmentsDialogue', false)
    },
    handleOk() {
      this.$emit('update:showAttachmentsDialogue', false)
    },
    isTaskClosed(task) {
      let type = getProperty(task, 'status.type', '')
      return type !== 'OPEN'
    },
  },
}
</script>
