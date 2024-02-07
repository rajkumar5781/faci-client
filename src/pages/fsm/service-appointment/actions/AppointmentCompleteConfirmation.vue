<template>
  <FContainer>
    <FModal
      :title="
        getData(
          'title',
          $t('service_appointment.complete_last_task_confm_title', { ns: 'fsm' })
        )
      "
      :visible="true"
      :cancelText="$t('common.cancel', { ns: 'fsm' })"
      :saveText="$t('tasks.complete_task', { ns: 'fsm' })"
      size="S"
      type="warning"
      :hideFooter="false"
      :confirmLoading="loading"
      @ok="complete"
      @cancel="handleCancel"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap="containerXLarge"
        padding="containerXxLarge sectionSmall"
      >
        <FText appearance="bodyReg14" color="textDescription">
          {{ $t('service_appointment.complete_last_task_confm_msg', { ns: 'fsm' }) }}
        </FText>
        <FCheckbox v-model="completeAppointment">
          <FText appearance="bodyReg14" color="textMain">
            {{ $t('service_appointment.complete_appointment', { ns: 'fsm' }) }}
          </FText>
        </FCheckbox
        >
      </FContainer>
    </FModal>
  </FContainer>
</template>
<script>
import {
  FModal,
  FContainer,
  FText,
  FDivider,
  FTags,
  FButton,
  FCheckbox,
} from '@facilio/design-system'
import getProperty from 'dlv'
export default {
  props: ['errorData'],
  components: {
    FContainer,
    FModal,
    FText,
    FDivider,
    FTags,
    FButton,
    FCheckbox,
  },
  data() {
    return {
      completeAppointment:false,
      loading:false
    }
  },
  methods: {
    complete() {
      let { completeAppointment } = this
      if (completeAppointment) this.$emit('completeAppointment')
      else this.$emit('completeTask')
      this.completeAppointment = false
      this.handleCancel()
    },
    handleCancel() {
      this.$emit('cancel')
    },
    getData(property, defaultValue) {
      let { errorData } = this
      return getProperty(errorData, property, defaultValue)
    },
  },
}
</script>
