<template>
  <FModal
    :title="$t('profile.edit_profile', { ns: 'account' })"
    :visible="visiblity"
    saveText="update profile"
    size="M"
    @ok="handleOk"
    @cancel="handleCancel"
    padding="containerNone"
  >
    <FContainer height="430px">
      <FTabs
        v-model="tabVal"
        :tabsList="tabsList"
        appearance="link"
        :lazy="true"
        @change="changeHandler"
        size="medium"
        padding="containerXLarge containerXLarge containerNone containerXLarge"
      >
        <FTabPane activeKey="1">
          <FContainer
            padding="containerNone containerXLarge containerXLarge containerXLarge"
            height="100%"
            borderTop="1px solid"
            borderColor="borderNeutralBaseSubtler"
          >
            <FContainer
              display="flex"
              justifyContent="center"
              overflow="scroll"
              height="100%"
            >
              <FForm
                ref="generalInfoForm"
                :model="userDetails"
                position="top"
                :rules="rules"
                class="flex flex-col gap-y-4 p-6 w-3/4"
              >
                <FContainer width="50%">
                  <FFormItem
                    :label="
                      $t('profile.upload_profile_pic', 'Upload Profile pic', {
                        ns: 'account',
                      })
                    "
                    prop="photoFile"
                  >
                    <FAttachmentSmall v-model="avatar" :multiple="false" />
                  </FFormItem>
                </FContainer>
                <FFormItem
                  :label="
                    $t('profile.full_name', 'Full Name', { ns: 'account' })
                  "
                  prop="name"
                >
                  <FInput
                    :placeholder="
                      $t('profile.enter_name', 'Enter Name', { ns: 'account' })
                    "
                    v-model="userDetails.name"
                  />
                </FFormItem>

                <FFormItem
                  :label="
                    $t('profile.enter_email', 'Enter Email', { ns: 'account' })
                  "
                  prop="email"
                >
                  <FInput :disabled="true" v-model="userDetails.email" />
                </FFormItem>
                <FContainer display="flex" columnGap="containerXxLarge">
                  <FFormItem label="Mobile" prop="mobile">
                    <FInput
                      :placeholder="
                        $t('profile.enter_mobile', 'Enter Mobile', {
                          ns: 'account',
                        })
                      "
                      v-model="userDetails.mobile"
                    />
                  </FFormItem>
                  <FFormItem label="Phone" prop="phone">
                    <FInput
                      :placeholder="
                        $t('profile.enter_phone', 'Enter Phone', {
                          ns: 'account',
                        })
                      "
                      v-model="userDetails.phone"
                    />
                  </FFormItem>
                </FContainer>
                <!-- <FContainer width="50%">
                  <FFormItem label="Language" prop="language">
                    <FSelect
                      v-model="userDetails.language"
                      placeholder="Select language"
                      :filterable="true"
                      :options="languageList"
                    >
                    </FSelect>
                  </FFormItem>
                </FContainer> -->
              </FForm>
            </FContainer>
          </FContainer>
        </FTabPane>
        <FTabPane activeKey="2">
          <FContainer
            display="flex"
            justifyContent="center"
            alignItems="center"
            padding="containerNone containerXLarge containerXLarge containerXLarge"
            borderTop="1px solid"
            borderColor="borderNeutralBaseSubtler"
          >
            <FForm
              ref="addressForm"
              :model="userDetails"
              position="top"
              class="flex flex-col gap-y-4 p-6 w-3/4"
            >
              <FContainer display="flex" columnGap="containerXxLarge">
                <FFormItem
                  :label="$t('profile.country', 'Country', { ns: 'account' })"
                  prop="country"
                >
                  <FSelect
                    v-model="userDetails.country"
                    :placeholder="
                      $t('profile.select_country', 'Select Country', {
                        ns: 'account',
                      })
                    "
                    :filterable="true"
                    :options="countryList"
                  >
                  </FSelect>
                </FFormItem>
                <FFormItem
                  :label="
                    $t('profile.time_zone', 'Time zone', { ns: 'account' })
                  "
                  prop="timeZone"
                >
                  <FSelect
                    v-model="userDetails.timezone"
                    :placeholder="
                      $t('profile.select_timezone', 'Select Time zone', {
                        ns: 'account',
                      })
                    "
                    :filterable="true"
                    :options="timeZoneList"
                  >
                  </FSelect>
                </FFormItem>
              </FContainer>
              <FContainer display="flex" columnGap="containerXxLarge">
                <FFormItem
                  :label="$t('profile.pincode', 'Pincode', { ns: 'account' })"
                  prop="zip"
                >
                  <FInput
                    :placeholder="
                      $t('profile.enter_here', 'Enter here', {
                        ns: 'account',
                      })
                    "
                    v-model="userDetails.zip"
                  />
                </FFormItem>
                <FFormItem
                  :label="$t('profile.state', 'State', { ns: 'account' })"
                  prop="state"
                >
                  <FInput
                    :placeholder="
                      $t('profile.enter_state', 'Enter State', {
                        ns: 'account',
                      })
                    "
                    v-model="userDetails.state"
                  />
                </FFormItem>
              </FContainer>
              <FContainer display="flex" columnGap="containerXxLarge">
                <FFormItem
                  :label="$t('profile.city', 'City', { ns: 'account' })"
                  prop="city"
                >
                  <FInput
                    :placeholder="
                      $t('profile.enter_city', 'Enter City', {
                        ns: 'account',
                      })
                    "
                    v-model="userDetails.city"
                  />
                </FFormItem>
                <FFormItem
                  :label="$t('profile.street', 'Street', { ns: 'account' })"
                  prop="street"
                >
                  <FInput
                    :placeholder="
                      $t('profile.enter_here', 'Enter here', {
                        ns: 'account',
                      })
                    "
                    v-model="userDetails.street"
                  />
                </FFormItem>
              </FContainer>
            </FForm>
          </FContainer>
        </FTabPane>
        <FTabPane activeKey="3">
          <FContainer
            height="100%"
            padding="containerNone containerXLarge containerXLarge containerXLarge"
            borderTop="1px solid"
            borderColor="borderNeutralBaseSubtler"
          >
            <FContainer
              height="100%"
              width="100%"
              display="flex"
              justifyContent="center"
            >
              <FContainer
                v-if="visiblity && tabVal === '3'"
                width="70%"
                height="60%"
                paddingTop="sectionSmall"
              >
                <FRichtext
                  :uploadFile="uploadImages"
                  v-model="signatureContentText"
                />
              </FContainer>
            </FContainer>
          </FContainer>
        </FTabPane>
      </FTabs>
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
          {{
            $t('profile.update_profile', 'Update Profile', { ns: 'account' })
          }}
        </FButton>
      </FContainer>
    </template>
  </FModal>
</template>

<script>
import {
  FContainer,
  FText,
  FModal,
  FSpinner,
  FButton,
  FTabs,
  FTabPane,
  FForm,
  FFormItem,
  FInput,
  FSelect,
  FRichtext,
  FAttachmentSmall,
  FDivider,
  ftoast,
} from '@facilio/design-system'
import timezones from '../../../../utils/data/timezones'
import Constants from '../../../../utils/constants'
import Countries from '../../../../utils/countries'
import cloneDeep from 'lodash/cloneDeep'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { isValidPhoneNumber } from '../../../../utils/helpers'
import getProperty from 'dlv'
import { constructBaseURL } from '../../../../utils/api/base-url'

const customToolOrder = [
  'undo',
  'redo',
  'fontfamily',
  'fontsize',
  'textalign',
  'bold',
  'italic',
  'underline',
]

export default {
  name: 'EditProfileDialog',
  props: ['user', 'showEditProfile', 'signatureContent', 'avatarFile'],
  components: {
    FContainer,
    FText,
    FModal,
    FSpinner,
    FButton,
    FTabs,
    FTabPane,
    FForm,
    FFormItem,
    FInput,
    FSelect,
    FRichtext,
    FAttachmentSmall,
    FDivider,
  },
  data() {
    return {
      saving: false,
      visiblity: this.showEditProfile,
      tabVal: '1',
      tabsList: [
        {
          label: this.$t('profile.general_info', 'General Information', {
            ns: 'account',
          }),
          value: '1',
        },
        {
          label: this.$t('profile.address_and_timezone', 'Address / Timezone', {
            ns: 'account',
          }),
          value: '2',
        },
        {
          label: this.$t('profile.signature', 'Signature', { ns: 'account' }),
          value: '3',
        },
      ],
      firstName: '',
      lastName: '',
      userDetails: {},
      timeZoneList: timezones,
      languageList: Constants.languages,
      countryList: Countries,
      signatureContentText: '',
      customToolOrder,
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
      errorMsg: 'Error occurred',
      userId: -1,
      avatar: this.avatarFile,
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
    this.userId = user?.uid
    this.userDetails = cloneDeep(user)
  },
  watch: {
    showEditProfile(newVal, oldVal) {
      if (newVal != oldVal) this.visiblity = this.showEditProfile
    },
    signatureContent: {
      handler(newVal) {
        this.signatureContentText = newVal
      },
      immediate: true,
    },
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
    handleOk() {},
    handleCancel() {
      this.$emit('onClose')
    },
    changeHandler() {},
    async addSign() {
      let { signatureContentText, options } = this || {}
      let { error } = await API.post(
        '/v2/application/users/addOrUpdateSignature',
        {
          signatureContent: signatureContentText,
        }
      )
      if (error) {
        let { errorMsg } = this
        ftoast.critical(errorMsg, options)
      } else {
        ftoast.success(
          this.$t('profile.profile_update_success_msg', { ns: 'account' }),
          options
        )
      }
    },
    async deleteSign() {
      let { error, data } = await API.get(
        '/v2/application/users/deleteSignature'
      )
      let { options } = this
      if (error) {
        let { errorMsg } = this
        ftoast.critical(errorMsg, options)
        this.saving = false
        this.visiblity = false
        return
      } else {
        let signatureDelete = getProperty(data, 'signatureDelete', '')
        if (signatureDelete == 'success') {
          this.signatureContentText = ''
          ftoast.success(
            this.$t('profile.profile_update_success_msg', { ns: 'account' }),
            options
          )
        }
      }
    },
    async saveProfile() {
      console.log(this.$refs)
      let valid = this.$refs['generalInfoForm'].validate()
      if (!valid) return false
      this.saving = true
      console.log(this.image)
      let {
        userDetails,
        signatureContent,
        signatureContentText,
        avatar,
        avatarFile,
        options,
        errorMsg,
      } = this || {}

      let { error } = await API.post('/account/update', {
        user: userDetails,
      })
      if (error) {
        ftoast.critical(errorMsg, options)
      } else {
        if (!isEmpty(avatar)) {
          await this.uploadImage(avatar)
        } else if (!isEmpty(avatarFile) && isEmpty(avatar)) {
          await this.removeAvatar()
        }
        if (!isEmpty(signatureContentText)) {
          await this.addSign()
        } else if (
          !isEmpty(signatureContent) &&
          isEmpty(signatureContentText)
        ) {
          await this.deleteSign()
        } else {
          ftoast.success(
            this.$t('profile.profile_update_success_msg', { ns: 'account' }),
            options
          )
        }
      }
      this.saving = false
      this.visiblity = false
      this.$emit('onSave')
    },
    async uploadImage(file) {
      this.saving = true
      let fileList = Array.from(file)
      let payload = new FormData()
      payload.append('user.avatar', fileList[0])
      payload.append('userId', this.userId)

      let { error, data } = await API.post(
        '/settings/users/avatar/upload',
        payload
      )
      if (error) {
        let { options, errorMsg } = this || {}
        ftoast.critical(errorMsg, options)
        return
      } else {
        this.user.avatarUrl = data.avatarUrl
      }
      this.saving = false
    },
    async removeAvatar() {
      this.saving = true
      let { error } = await API.post('/settings/users/avatar/delete', {
        userId: this.userId,
      })
      if (error) {
        let { options, errorMsg } = this || {}
        ftoast.critical(errorMsg, options)
        return
      } else {
        this.user.avatarUrl = null
      }
      this.saving = false
    },
    async uploadImages(file = {}) {
      const formData = new FormData()
      formData.append('file', file, file.name)
      formData.append('fileName', file.name)
      formData.append('fileContentType', file.name)
      let url = '/v2/publicFile/addPublicFile'
      let { error, data } = await API.post(url, formData)
      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        let { publicFileUrl } = data || {}
        let baseurl = constructBaseURL(null, null, true)
        let fileUrl = `${baseurl}${publicFileUrl}`
        return fileUrl
      }
    },
  },
}
</script>
