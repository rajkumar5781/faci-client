<template>
  <FModal
    :title="
      $t('invite_code_form.title', 'Enter Invite Code', {
        ns: 'visitor',
      })
    "
    :visible="isVisible"
    size="S"
    :hideFooter="true"
    @cancel="closeForm"
  >
    <FContainer
      v-if="loading"
      display="flex"
      flex-direction="column"
      alignItems="center"
      justifyContent="center"
      height="200px"
      gap="sectionXSmall"
    >
      <FSpinner :show="loading" size="80"></FSpinner>
      <FText> {{ verifyingCode }}</FText>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flex-direction="column"
      alignItems="center"
      justifyContent="center"
      height="200px"
      gap="sectionXSmall"
    >
      <FText> {{ enterCode }} </FText>
      <OtpInput
        inputClasses="otp-input-box"
        :numInputs="4"
        separator=" "
        :shouldAutoFocus="true"
        :is-input-num="true"
        @on-complete="submitOtp"
      ></OtpInput>
    </FContainer>
  </FModal>
</template>
<script>
import OtpInput from '@bachdgvn/vue-otp-input'
import { API } from '@facilio/api'
import {
  FContainer,
  FText,
  FSpinner,
  FModal,
  ftoast,
} from '@facilio/design-system'
import getProperty from 'dlv'

export default {
  components: { OtpInput, FContainer, FText, FSpinner, FModal, ftoast },
  data() {
    return {
      loading: false,
      isVisible: true,
      moduleName: 'invitevisitor',
    }
  },
  computed: {
    verifyingCode() {
      return this.$t(
        'invite_code_form.code_verification',
        'Verifying the invite code',
        { ns: 'visitor' }
      )
    },
    enterCode() {
      return this.$t(
        'invite_code_form.enter_invite_code',
        'Enter the Invite Code sent with your visit invitation.',
        { ns: 'visitor' }
      )
    },
  },
  methods: {
    async submitOtp(otp) {
      this.loading = true

      let params = {
        passCode: otp,
        moduleName: this.moduleName,
      }

      let { error, data } = await API.get('v3/modules/data/summary', params)
      if (error) {
        ftoast.critical(
          error?.message || this.$t('error_occurred', 'Error occured')
        )
        this.closeForm()
      } else {
        let params = {
          invitevisitorId: getProperty(data.invitevisitor, 'id') || null,
          visitorTypeId:
            getProperty(data.invitevisitor, 'visitorType.id') || null,
        }
        this.$emit('openVisitsForm', params)
      }
    },
    closeForm() {
      this.isVisible = false
      this.$emit('onClose')
    },
  },
}
</script>
<style lang="scss">
input.otp-input-box {
  width: 70px;
  height: 60px;
  padding: 5px;
  margin: 0 10px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  &.error {
    border: 1px solid;
    border-color: var(--colors-borderSemanticRedMedium) !important;
  }
  &:active,
  &:focus {
    border: 1px solid;
    border-color: var(--colors-borderPrimaryFocused) !important;
  }
}
</style>
