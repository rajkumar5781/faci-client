<template>
  <FContainer>
    <FModal
      :title="$t('time_sheet.stop_timesheet_confirmation_title', { ns: 'fsm' })"
      :visible="true"
      :cancelText="$t('time_sheet.cancel', { ns: 'fsm' })"
      :saveText="$t('time_sheet.complete', { ns: 'fsm' })"
      size="S"
      type="warning"
      :hideFooter="false"
      :confirmLoading="loading"
      @ok="stopTimeSheet('completed')"
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
          {{
            $t('time_sheet.stop_timesheet_confirmation_msg', { ns: 'fsm' })
          }}
        </FText>
      </FContainer>
      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          justifyContent="flex-end"
        >
          <FButton appearance="secondary" @click="stopTimeSheet('onHold')">
            {{ $t('time_sheet.on_hold', { ns: 'fsm' }) }}
          </FButton>
          <FContainer marginLeft="containerLarge" />
          <FButton @click="stopTimeSheet('completed')" :loading="loading">
            {{ $t('time_sheet.complete', { ns: 'fsm' }) }}
          </FButton>
        </FContainer>
      </template>
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
} from '@facilio/design-system'
export default {
  props: ['record', 'loading', 'data','btnObj'],
  components: {
    FContainer,
    FModal,
    FText,
    FDivider,
    FTags,
    FButton,
  },
  methods: {
    stopTimeSheet(action) {
      let {btnObj} = this
      this.$emit('stopTimeSheet', btnObj,action,false)
      this.handleCancel()
    },
    handleCancel() {
      this.$emit('cancel')
    },
  },
}
</script>
