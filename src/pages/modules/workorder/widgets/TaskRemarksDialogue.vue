<template>
  <div>
    <FModal
      title="Remarks"
      :visible.sync="showRemarksDialogue"
      saveText="Save"
      size="S"
      @ok="handleOk"
      @cancel="close"
      :hideFooter="false"
    >
      <FContainer padding="containerXLarge sectionSmall">
        <FTextArea
          v-model="remarks"
          :rows="rows"
          placeholder="Enter the task remarks here"
          :readOnly="canDisableField"
        ></FTextArea>
      </FContainer>
    </FModal>
  </div>
</template>
<script>
import NewWOTasks from '../workorderHelper'
import { FModal, FTextArea, FContainer } from '@facilio/design-system'
export default {
  name: 'TaskRemarks',
  props: ['moduleName', 'details', 'showRemarksDialogue','canDisableField'],
  extends: NewWOTasks,
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
      remarks: null,
      taskBulkList: [],
      waitBoolean: true,
      rows: 5,
    }
  },
  created() {
    this.remarks = this.details?.remarks || null
  },
  components: {
    FModal,
    FTextArea,
    FContainer,
  },
  computed: {
    currModuleName() {
      return 'workorder'
    },
    widgetTitle() {
      return 'Tasks'
    },
  },
  methods: {
    close() {
      this.$emit('update:showRemarksDialogue', false)
    },
    handleOk() {
      let task = JSON.parse(JSON.stringify(this.details))
      task.remarks = this.remarks
      this.$emit('reloadTasks', task)
      this.close()
    },
  },
}
</script>
