<template>
  <FModal
    title="Contact"
    size="S"
    type="default"
    :visible="visiblity"
    @cancel="handleCancel"
    padding="containerNone"
  >
    <FContainer padding="sectionMedium">
      <FForm
        ref="profileForm"
        :model="contactDetails"
        position="top"
        :rules="rules"
        class="flex flex-col gap-y-4"
        :validateForm="true"
      >
        <FFormItem label="First name" prop="name">
          <FInput v-model="contactDetails.name" />
        </FFormItem>
        <FFormItem label="E-mail" prop="email">
          <FInput :disabled="true" v-model="contactDetails.email" />
        </FFormItem>
        <FFormItem label="Time zone" prop="timezone">
          <FSelect
            v-model="contactDetails.timezone"
            placeholder="Select a timezone"
            :options="timeZoneList"
          >
          </FSelect>
        </FFormItem>
        <FFormItem label="Language" prop="language">
          <FSelect
            v-model="contactDetails.language"
            placeholder="Select language"
            :options="languageList"
          >
          </FSelect>
        </FFormItem>
        <FFormItem label="Phone" prop="phone">
          <FInput v-model="contactDetails.phone" />
        </FFormItem>
        <FFormItem label="Mobile" prop="mobile">
          <FInput v-model="contactDetails.mobile" />
        </FFormItem>
        <FFormItem label="Street" prop="street">
          <FInput v-model="contactDetails.street" />
        </FFormItem>
        <FFormItem label="City" prop="city">
          <FInput v-model="contactDetails.city" />
        </FFormItem>
        <FFormItem label="State" prop="state">
          <FInput v-model="contactDetails.state" />
        </FFormItem>
        <FFormItem label="Zipcode" prop="zip">
          <FInput v-model="contactDetails.zip" />
        </FFormItem>
        <FFormItem label="Country" prop="country">
          <FInput v-model="contactDetails.country" />
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
          @click="saveProfile"
        >
          Save Changes
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
import { isValidPhoneNumber } from '../../../../utils/helpers'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import timezones from '../../../../utils/data/timezones'
import Constants from '../../../../utils/constants'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'EditContactDialog',
  props: ['user', 'showDialog'],
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
      visiblity: this.showDialog,
      contactDetails: {},
      notificationSettings: [],
      timeZoneList: timezones,
      languageList: Constants.languages,
      successMsg: 'Your profile has been successfully updated.',
      errorMsg: 'Error occurred',
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
      saving: false,
      rules: {
        mobile: {
          trigger: 'blur',
          validator: mobile => {
            if (!isEmpty(mobile) && !isValidPhoneNumber(mobile)) {
              return {
                errorMessage: 'Please enter valid mobile number',
                invalid: true,
              }
            }
          },
        },
        phone: {
          trigger: 'blur',
          validator: phone => {
            let isValid = isEmpty(phone) || phone == '+'
            if (!isValid && !isValidPhoneNumber(phone)) {
              return {
                errorMessage: 'Please enter valid mobile number',
                invalid: true,
              }
            }
          },
        },
      },
    }
  },
  created() {
    let { user } = this
    this.contactDetails = cloneDeep(user)
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
    async saveProfile() {
      let { notificationSettings } = this
      let valid = this.$refs['profileForm'].validate()
      if (!valid) return false
      this.saving = true
      let { contactDetails } = this || {}
      let { error } = await API.post('/account/update', {
        user: contactDetails,
        peopleNotificationSettingsList: notificationSettings,
      })
      if (error) {
        let { options, errorMsg } = this || {}
        ftoast.critical(errorMsg, options)
      } else {
        let { successMsg, options } = this
        ftoast.success(successMsg, options)
      }
      this.saving = false
      this.visiblity = false
      this.$emit('onSave')
    },
    handleCancel() {
      this.visiblity = false
      this.$emit('onClose')
    },
  },
}
</script>
