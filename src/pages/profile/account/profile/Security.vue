<template>
  <FContainer display="flex" justifyContent="center" alignItems="flex-start">
    <FContainer width="84%">
      <FContainer display="flex" justifyContent="space-between">
        <FContainer
          width="80%"
          display="flex"
          flexDirection="column"
          rowGap="containerLarge"
        >
          <FText appearance="headingMed16">{{
            $t('security.security', 'Security', {
              ns: 'account',
            })
          }}</FText>
          <FText color="textCaption">{{
            $t('security.change_pwd_desc', { ns: 'account' })
          }}</FText>
        </FContainer>
        <fc-illustration name="password" size="S"></fc-illustration>
      </FContainer>
      <FContainer padding="sectionMedium containerNone">
        <FDivider width="100%" />
      </FContainer>
      <FContainer display="flex" flexDirection="column" gap="containerXxLarge">
        <FText appearance="headingMed20">{{
          $t('security.change_your_pwd', 'Security', { ns: 'account' })
        }}</FText>
        <FContainer
          border="1px solid"
          borderRadius="high"
          borderColor="borderNeutralBaseSubtler"
        >
          <FContainer padding="containerXxLarge">
            <FForm
              ref="passwordForm"
              :model="changepassword"
              position="top"
              :rules="rules"
              class="flex flex-col gap-y-4"
            >
              <FContainer width="30%">
                <FFormItem
                  :label="$t('security.current_pwd', { ns: 'account' })"
                  prop="oldPassword"
                >
                  <FInput
                    v-model="changepassword.oldPassword"
                    :placeholder="
                      $t('security.enter_your_pwd', { ns: 'account' })
                    "
                    :type="currentPasswordInputtype"
                    @slotClicked="toggleShowCurrentPassword()"
                  >
                    <template #clickable>
                      <fc-icon
                        v-if="!canShowCurrentPassword"
                        group="default"
                        name="eye-slashed"
                      ></fc-icon>
                      <fc-icon v-else group="default" name="eye-open"></fc-icon>
                    </template>
                  </FInput>
                </FFormItem>
              </FContainer>
              <FContainer width="30%">
                <FFormItem
                  :label="$t('security.new_pwd', { ns: 'account' })"
                  prop="newPassword"
                >
                  <FInput
                    v-model="changepassword.newPassword"
                    :placeholder="
                      $t('security.enter_your_pwd', { ns: 'account' })
                    "
                    :type="newPasswordInputType"
                    @slotClicked="toggleShowNewPassword()"
                  >
                    <template #clickable>
                      <fc-icon
                        v-if="!canShowNewPassword"
                        group="default"
                        name="eye-slashed"
                      ></fc-icon>
                      <fc-icon v-else group="default" name="eye-open"></fc-icon>
                    </template>
                  </FInput>
                </FFormItem>
              </FContainer>
              <FContainer width="30%">
                <FFormItem
                  :label="$t('security.confirm_pwd', { ns: 'account' })"
                  prop="confirmPassword"
                >
                  <FInput
                    v-model="changepassword.confirmPassword"
                    :placeholder="
                      $t('security.enter_your_pwd', { ns: 'account' })
                    "
                    :type="confirmPasswordInputType"
                    @slotClicked="toggleShowConfirmPassword()"
                  >
                    <template #clickable>
                      <fc-icon
                        v-if="!canShowConfirmPassword"
                        group="default"
                        name="eye-slashed"
                      ></fc-icon>
                      <fc-icon v-else group="default" name="eye-open"></fc-icon>
                    </template>
                  </FInput>
                </FFormItem>
              </FContainer>
            </FForm>
            <FContainer paddingTop="containerXxLarge">
              <FButton
                :loading="saving"
                appearance="primary"
                size="medium"
                @click="savePassword"
              >
                {{ $t('security.change_pwd', { ns: 'account' }) }}
              </FButton>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FText,
  FForm,
  FFormItem,
  FInput,
  FButton,
  FDivider,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'

export default {
  components: {
    FContainer,
    FText,
    FDivider,
    FForm,
    FFormItem,
    FInput,
    FButton,
  },
  data() {
    return {
      changepassword: {},
      canShowCurrentPassword: false,
      canShowOldPassword: false,
      canShowNewPassword: false,
      canShowConfirmPassword: false,
      currentPasswordInputtype: 'password',
      newPasswordInputType: 'password',
      confirmPasswordInputType: 'password',
      saving: false,
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
      rules: {
        oldPassword: {
          required: true,
          message: 'Current password is required',
          trigger: 'blur',
        },
        newPassword: {
          required: true,
          message: 'New password is required',
          trigger: 'blur',
        },
        confirmPassword: {
          required: true,
          message: 'Confirm your new password',
          trigger: 'blur',
        },
      },
    }
  },
  computed: {
    options() {
      return {
        manualClear: this.manualClear,
        menuType: this.menuType,
        timeout: this.timeout,
      }
    },
  },
  methods: {
    toggleShowCurrentPassword() {
      this.canShowCurrentPassword = !this.canShowCurrentPassword
      if (this.canShowCurrentPassword) {
        this.currentPasswordInputtype = 'text'
      } else {
        this.currentPasswordInputtype = 'password'
      }
    },
    toggleShowNewPassword() {
      this.canShowNewPassword = !this.canShowNewPassword
      if (this.canShowNewPassword) {
        this.newPasswordInputType = 'text'
      } else {
        this.newPasswordInputType = 'password'
      }
    },
    toggleShowConfirmPassword() {
      this.canShowConfirmPassword = !this.canShowConfirmPassword
      if (this.canShowConfirmPassword) {
        this.confirmPasswordInputType = 'text'
      } else {
        this.confirmPasswordInputType = 'password'
      }
    },
    async savePassword() {
      let {
        changepassword: { oldPassword, newPassword, confirmPassword },
      } = this
      let valid = this.$refs['passwordForm'].validate()
      if (!valid) return false
      let { options } = this
      if (newPassword !== confirmPassword) {
        ftoast.critical(
          this.$t('security.pwd_does_not_match', { ns: 'account' }),
          options
        )
        this.saving = false
        return
      }
      this.saving = true
      let { data, error } = await API.post('/integ/changepassword', {
        password: oldPassword,
        rawPassword: newPassword,
      })
      if (error) {
        ftoast.critical(
          this.$t('user_management.error_occurred', { ns: 'account' }),
          options
        )
      } else {
        let jsonResponse = data.jsonresponse
        let message = jsonResponse ? jsonResponse.messages : ''
        let status = jsonResponse ? jsonResponse.status : ''
        if (status === 'success') {
          ftoast.success(
            this.$t('security.pwd_changed_successfully', { ns: 'account' }),
            options
          )
        } else {
          ftoast.critical(message, options)
          this.saving = false
          return
        }
      }
      this.saving = false
    },
  },
}
</script>
