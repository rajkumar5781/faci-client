<template>
  <FModal
    title="Change Password"
    size="S"
    type="default"
    :visible="visiblity"
    @cancel="handleCancel"
    padding="containerNone"
  >
    <FContainer padding="sectionMedium">
      <FForm
        ref="passwordForm"
        :model="changepassword"
        position="top"
        :rules="rules"
        class="flex flex-col gap-y-4"
      >
        <FFormItem label="Current password" prop="oldPassword">
          <FInput
            v-model="changepassword.oldPassword"
            placeholder="Enter Your Password"
            :type="oldPasswordInputType"
            @slotClicked="toggleShowOldPassword"
          >
            <template #clickable>
              <fc-icon
                v-if="!canShowOldPassword"
                group="default"
                name="eye-slashed"
              ></fc-icon>
              <fc-icon v-else group="default" name="eye-open"></fc-icon>
            </template>
          </FInput>
        </FFormItem>
        <FFormItem label="New password" prop="newPassword">
          <FInput
            v-model="changepassword.newPassword"
            placeholder="Enter Your Password"
            :type="newPasswordInputType"
            @slotClicked="toggleShowNewPassword"
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
        <FFormItem label="Confirm password" prop="confirmPassword">
          <FInput
            v-model="changepassword.confirmPassword"
            placeholder="Enter Your Password"
            :type="confirmPasswordInputType"
            @slotClicked="toggleShowConfirmPassword"
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
      </FForm>
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
        <FButton
          :loading="saving"
          appearance="primary"
          size="medium"
          @click="savePassword"
        >
          Change Password
        </FButton>
      </FContainer>
    </template>
  </FModal>
</template>
<script>
import {
  FModal,
  FButton,
  FForm,
  FFormItem,
  FContainer,
  FInput,
  FSelect,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'

export default {
  name: 'ChangePasswordDialog',
  props: ['showChangePasswordDialog'],
  components: {
    FModal,
    FForm,
    FFormItem,
    FInput,
    FSelect,
    FButton,
    FContainer,
  },
  data() {
    return {
      visiblity: this.showChangePasswordDialog,
      saving: false,
      changepassword: {},
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
      canShowOldPassword: false,
      canShowNewPassword: false,
      canShowConfirmPassword: false,
      oldPasswordInputType: 'password',
      newPasswordInputType: 'password',
      confirmPasswordInputType: 'password',
      successMsg: 'Your password has been changed successfully',
      errorMsg: 'Error occured',
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
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
    async savePassword() {
      let {
        changepassword: { oldPassword, newPassword, confirmPassword },
      } = this
      let valid = this.$refs['passwordForm'].validate()
      if (!valid) return false
      let { options } = this
      if (newPassword !== confirmPassword) {
        let message = 'Passwords does not match'
        ftoast.critical(message, options)
        this.saving = false
        return
      }
      this.saving = true
      let { data, error } = await API.post('/integ/changepassword', {
        password: oldPassword,
        rawPassword: newPassword,
      })
      if (error) {
        let { errorMsg } = this
        ftoast.critical(errorMsg, options)
      } else {
        let jsonResponse = data.jsonresponse
        let message = jsonResponse ? jsonResponse.messages : ''
        let status = jsonResponse ? jsonResponse.status : ''
        if (status === 'success') {
          let { successMsg } = this
          ftoast.success(successMsg, options)
        } else {
          ftoast.critical(message, options)
          this.saving = false
          return
        }
      }
      this.saving = false
      this.visiblity = false
      this.$emit('onSave')
    },
    handleCancel() {
      this.visiblity = false
      this.$emit('onClose')
    },
    toggleShowOldPassword() {
      this.canShowOldPassword = !this.canShowOldPassword
      if (this.canShowOldPassword) {
        this.oldPasswordInputType = 'text'
      } else {
        this.oldPasswordInputType = 'password'
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
  },
}
</script>
