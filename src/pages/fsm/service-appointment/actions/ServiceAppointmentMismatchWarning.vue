<template>
  <FContainer>
    <FModal
      :title="
        getErrorProperty(
          'title',
          $t(
            'service_appointment.dispatch_mismatch_title',
            'Dispatch Alert: Mismatched Assignment',
            { ns: 'fsm' }
          )
        )
      "
      :visible="true"
      :cancelText="$t('service_appointment.cancel', { ns: 'fsm' })"
      :saveText="$t('service_appointment.dispatch', { ns: 'fsm' })"
      size="S"
      :type="getErrorProperty('severity', 'warning')"
      :hideFooter="false"
      :confirmLoading="isDispatching"
      @ok="handleDispatch"
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
            getErrorProperty(
              'message',
              $t('service_appointment_message', { ns: 'fsm' })
            )
          }}
        </FText>
        <FContainer
          v-if="!isEmpty(getErrorProperty('additionalMessages', []))"
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerXLarge"
        >
          <FContainer
            display="flex"
            flexDirection="row"
            v-for="(addMessage, idx) in getErrorProperty(
              'additionalMessages',
              []
            )"
            :key="idx"
          >
            <FContainer
              height="4px"
              width="5px"
              margin="containerLarge"
              borderRadius="full"
              backgroundColor="backgroundNeutralInverse"
            ></FContainer>
            <FText appearance="bodyReg14" color="textDescription">
              {{ addMessage }}
            </FText>
          </FContainer>
        </FContainer>
        <FDivider
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap="containerNone"
          alignSelf="stretch"
          width="100%"
          margin="containerNone"
        />
        <FContainer
          display="flex"
          alignItems="stretch"
          alignContent="flex-start"
          gap="containerXLarge"
          alignSelf="stretch"
          flexDirection="column"
        >
          <FRow>
            <FCol :span="6">
              <FContainer
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="spaceBetween"
                gap="containerMedium"
              >
                <FText appearance="captionMed12" color="textMain">{{
                  $t('service_appointment.field_agent', { ns: 'fsm' })
                }}</FText>
                <FContainer display="flex" flexDirection="row">
                  <FContainer paddingRight="containerMedium">
                    <FAvatar
                      size="XS"
                      :avatarUrl="
                        getErrorProperty('fieldAgent.avatarUrl', null)
                      "
                      :userName="getErrorProperty('fieldAgent.name', 'Unknown')"
                      font-size="8px"
                    />
                  </FContainer>
                  <FText appearance="bodyReg14" color="textDescription">{{
                    getErrorProperty('fieldAgent.name', 'Unknown')
                  }}</FText>
                </FContainer>
              </FContainer>
            </FCol>
            <FCol :span="6">
              <FContainer
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="spaceBetween"
                gap="containerMedium"
              >
                <FText appearance="captionMed12" color="textMain">{{
                  $t('service_appointment.scheduled_start_time', { ns: 'fsm' })
                }}</FText>
                <FText appearance="bodyReg14" color="textDescription">{{
                  formatDate(getErrorProperty('scheduledStartTime', null))
                }}</FText>
              </FContainer>
            </FCol>
          </FRow>
          <FRow>
            <FCol :span="6">
              <FContainer
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                justifyContent="spaceBetween"
                gap="containerMedium"
              >
                <FText appearance="captionMed12" color="textMain">{{
                  $t('service_appointment.scheduled_end_time', { ns: 'fsm' })
                }}</FText>
                <FText appearance="bodyReg14" color="textDescription">{{
                  formatDate(getErrorProperty('scheduledEndTime', null))
                }}</FText>
              </FContainer>
            </FCol>
          </FRow>
        </FContainer>
      </FContainer>
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
  FText,
  FAvatar,
  FDivider,
} from '@facilio/design-system'
import { formatDate } from '../../../../utils/formatter'
import getProperty from 'dlv'
export default {
  props: ['dispatchWarningData'],
  components: { FContainer, FModal, FRow, FCol, FText, FAvatar, FDivider },
  data() {
    return {
      isDispatching: false,
    }
  },
  methods: {
    isEmpty,
    formatDate,
    getErrorProperty(property, defaultValue) {
      let { dispatchWarningData } = this
      return getProperty(dispatchWarningData, property, defaultValue)
    },
    handleDispatch() {
      this.isDispatching = true
      this.$emit('dispatch', this.getErrorProperty('formModel', null))
    },
    handleCancel() {
      this.$emit('cancel')
    },
  },
}
</script>

<style></style>
