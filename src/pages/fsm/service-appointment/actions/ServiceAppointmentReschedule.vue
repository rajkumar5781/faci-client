<template>
  <FContainer>
    <FModal
      :title="$t('service_appointment.reschedule', { ns: 'fsm' })"
      :visible="true"
      :cancelText="$t('service_appointment.cancel', { ns: 'fsm' })"
      :saveText="$t('service_appointment.reschedule', { ns: 'fsm' })"
      size="S"
      :hideFooter="false"
      :confirmLoading="isRescheduling"
      @ok="handleReschedule"
      @cancel="handleCancel"
    >
      <FForm ref="reschedule-form" :model="formModel" :rules="rules">
        <FContainer padding="containerXxLarge" width="100%">
          <FRow>
            <FCol :span="6">
              <FContainer paddingBottom="containerXxLarge" width="100%">
                <FFormItem
                  label="Scheduled Start Time"
                  prop="scheduledStartTime"
                  :hideLabel="false"
                  id="dsm-form-scheduledStartTime"
                  :required="true"
                >
                  <DatePicker
                    type="date-time"
                    v-model="formModel.scheduledStartTime"
                    :account="$account"
                  />
                </FFormItem>
              </FContainer>
            </FCol>
            <FCol :span="6">
              <FContainer paddingBottom="containerXxLarge" width="100%">
                <FFormItem
                  label="Scheduled End Time"
                  prop="scheduledEndTime"
                  :hideLabel="false"
                  id="dsm-form-scheduledEndTime"
                  :required="true"
                >
                  <DatePicker
                    type="date-time"
                    v-model="formModel.scheduledEndTime"
                    :account="$account"
                  />
                </FFormItem>
              </FContainer>
            </FCol>
          </FRow>
        </FContainer>
      </FForm>
    </FModal>
  </FContainer>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FModal,
  FRow,
  FCol,
  FForm,
  FFormItem,
} from '@facilio/design-system'
import { DatePicker } from '@facilio/ui/new-forms'
export default {
  props: ['record'],
  components: {
    FContainer,
    FModal,
    FRow,
    FCol,
    FForm,
    FFormItem,
    DatePicker,
  },
  data() {
    return {
      isRescheduling: false,
      formModel: {
        scheduledStartTime: null,
        scheduledEndTime: null,
      },
      rules: {
        scheduledStartTime: [
          {
            required: true,
            message: this.$t(
              'service_appointment.please_select_scheduled_start',
              { ns: 'fsm' }
            ),
            trigger: 'change',
          },
        ],
        scheduledEndTime: [
          {
            required: true,
            message: this.$t(
              'service_appointment.please_select_scheduled_end',
              { ns: 'fsm' }
            ),
            trigger: 'change',
          },
        ],
      },
    }
  },
  mounted() {
    let { scheduledStartTime, scheduledEndTime } = this.record
    if (!isEmpty(scheduledStartTime)) {
      this.$set(this.formModel, 'scheduledStartTime', scheduledStartTime)
    }
    if (!isEmpty(scheduledEndTime)) {
      this.$set(this.formModel, 'scheduledEndTime', scheduledEndTime)
    }
  },
  methods: {
    handleReschedule() {
      let isValid = this.$refs['reschedule-form'].validate()
      if (isValid) {
        this.isRescheduling = true
        this.$emit('reschedule', this.formModel)
      }
    },
    handleCancel() {
      this.$emit('cancel')
    },
  },
}
</script>

<style></style>
