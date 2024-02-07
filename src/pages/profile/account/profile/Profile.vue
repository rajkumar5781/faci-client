<template>
  <FContainer>
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <template v-else>
      <FContainer
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        height="100%"
      >
        <FContainer
          dispaly="flex"
          flexDirection="column"
          display="flex"
          alignItems="center"
          height="100%"
          width="100%"
        >
          <FContainer width="100%" display="flex" justifyContent="center">
            <div class="profile-banner">
              <FContainer class="profile-avatar cursor-pointer">
                <FAvatar
                  :userName="userName"
                  :avatarUrl="user.avatarUrl"
                  class="avatar-container"
                />
                <FContainer
                  height="44px"
                  width="100%"
                  backgroundColor="backgroundBlanket"
                  position="absolute"
                  bottom="0px"
                  class="edit-box"
                >
                  <FContainer display="flex" alignItems="center">
                    <FButton
                      appearance="secondary"
                      size="small"
                      class="edit-button"
                      @click="canShowAvatarDialog()"
                      >{{ $t('edit', { ns: 'account' }) }}</FButton
                    >
                  </FContainer>
                </FContainer>
              </FContainer>
            </div>
          </FContainer>
          <FContainer
            padding="containerXxLarge"
            width="83%"
            maxHeight="55%"
            overflow="scroll"
            borderBottom="1px solid"
            borderLeft="1px solid"
            borderRight="1px solid"
            borderColor="borderNeutralBaseSubtler"
            borderRadius="none none high high"
            class="profile-container"
          >
            <FContainer
              display="flex"
              justifyContent="flex-end"
              marginBottom="containerLarge"
            >
              <FButton
                appearance="primary"
                size="medium"
                iconGroup="edit"
                iconName="edit-line"
                iconPosition="prefix"
                @click="showEditProfileDialogue"
              >
                {{
                  $t('profile.edit_profile', 'Edit Profile', { ns: 'account' })
                }}
              </FButton>
            </FContainer>
            <FText appearance="headingMed20">{{ userName }}</FText>
            <FContainer
              display="flex"
              columnGap="containerXxLarge"
              padding="containerLarge containerNone"
            >
              <FContainer
                display="flex"
                columnGap="containerLarge"
                padding="containerMedium containerNone"
                width="30%"
              >
                <FIcon
                  display="flex"
                  alignItems="center"
                  group="communication"
                  name="mail"
                  size="12"
                  :pressable="false"
                ></FIcon>
                <FText
                  display="flex"
                  alignItems="center"
                  appearance="captionMed12"
                  :color="`${
                    email == '--' ? 'textCaption' : 'textDescription'
                  }`"
                >
                  {{ email }}
                </FText>
              </FContainer>
              <FContainer
                display="flex"
                columnGap="containerLarge"
                padding="containerMedium containerNone"
                width="30%"
              >
                <FIcon
                  display="flex"
                  alignItems="center"
                  group="default"
                  name="call"
                  size="12"
                  :pressable="false"
                ></FIcon>
                <FText
                  display="flex"
                  alignItems="center"
                  appearance="captionMed12"
                  :color="`${
                    phone == '--' ? 'textCaption' : 'textDescription'
                  }`"
                >
                  {{ phone }}
                </FText>
              </FContainer>
              <FContainer
                display="flex"
                columnGap="containerLarge"
                padding="containerMedium containerNone"
                width="30%"
              >
                <FIcon
                  display="flex"
                  alignItems="center"
                  group="default"
                  name="mobile"
                  size="12"
                  :pressable="false"
                ></FIcon>
                <FText
                  display="flex"
                  alignItems="center"
                  appearance="captionMed12"
                  :color="`${
                    mobile == '--' ? 'textCaption' : 'textDescription'
                  }`"
                >
                  {{ mobile }}
                </FText>
              </FContainer>
              <!-- <FContainer
              display="flex"
              columnGap="containerLarge"
              padding="containerMedium containerNone"
              width="30%"
            >
              <FIcon
                display="flex"
                alignItems="center"
                group="action"
                name="languages"
                size="12"
                :pressable="false"
              ></FIcon>
              <FText
                display="flex"
                alignItems="center"
                appearance="captionMed12"
                :color="`${
                  language == '--' ? 'textCaption' : 'textDescription'
                }`"
              >
                {{ language }}
              </FText>
            </FContainer> -->
            </FContainer>
            <FDivider width="100%" />
            <FContainer padding="containerXxLarge containerNone">
              <FText appearance="captionMed12" color="textMain">{{
                $t('profile.address_and_timezone', { ns: 'account' })
              }}</FText>
            </FContainer>
            <FContainer
              display="flex"
              columnGap="containerXxLarge"
              flexWrap="wrap"
            >
              <FContainer
                display="flex"
                flexDirection="column"
                gap="containerSmall"
                width="30%"
                marginBottom="containerXxLarge"
                v-for="(details, index) in contactDetails"
                :key="`${index}-details`"
              >
                <FText appearance="captionMed12">{{ details.label }}</FText>
                <FText
                  :color="`${
                    details.value ? 'textDescription' : 'textCaption'
                  }`"
                  >{{ details.value ? details.value : '--' }}</FText
                >
              </FContainer>
            </FContainer>
            <FDivider width="100%" />
            <FContainer padding="containerXxLarge containerNone">
              <FText appearance="captionMed12" color="textMain">{{
                $t('profile.signature', { ns: 'account' })
              }}</FText>
            </FContainer>
            <FContainer
              color="backgroundPrimaryPressed"
              hover-color="blue60"
              cursor="pointer"
              v-if="canShowAddSign"
              @click="canShowSignatureDialog()"
            >
              <FText appearance="bodyRegUl14">{{
                $t('profile.add_sign', 'Add Signature', { ns: 'account' })
              }}</FText>
            </FContainer>
            <div
              class="rich-text-container"
              v-html="sanitize(signatureContent)"
            ></div>
          </FContainer>
        </FContainer>
      </FContainer>
      <EditProfileDialog
        :user="user"
        :showEditProfile="showEditProfile"
        :signatureContent="signatureContent"
        @onClose="closeEditProfileDialogue()"
        @onSave="handleEditprofileDialogSave()"
      />
      <EditAvatarDialog
        :showAvatarDialog="showAvatarDialog"
        :avatarFile="user?.avatar"
        :user="user"
        @onClose="close"
      />
      <EditSignatureDialog
        :showSignatureDialog="showSignatureDialog"
        :signatureContent="signatureContent"
        @onClose="closeEditSignatureDialog"
        @onSave="handleSignatureSave"
      />
    </template>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FText,
  FAvatar,
  FIcon,
  FModal,
  FSpinner,
  FButton,
  FDivider,
} from '@facilio/design-system'
import EditAvatarDialog from './EditAvatarDialog.vue'
import EditSignatureDialog from './EditSignatureDialog.vue'
import ChangePasswordDialog from './ChangePasswordDialog.vue'
import EditProfileDialog from './EditProfileDialog.vue'
import Countries from '../../../../utils/countries'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { sanitize } from '@facilio/utils/sanitize'

export default {
  name: 'Profile',
  components: {
    FContainer,
    FText,
    FAvatar,
    FIcon,
    Contact: () => import('./Contact.vue'),
    FModal,
    FSpinner,
    FButton,
    FDivider,
    EditAvatarDialog,
    EditSignatureDialog,
    ChangePasswordDialog,
    EditProfileDialog,
  },
  data() {
    return {
      showAvatarDialog: false,
      showSignatureDialog: false,
      showChangePasswordDialog: false,
      user: {},
      loading: false,
      signatureContent: null,
      showEditProfile: false,
      countryList: Countries,
    }
  },
  title() {
    let title = this.$t('profile', 'Profile', { ns: 'account' })
    return title
  },
  created() {
    this.init()
  },
  computed: {
    userName() {
      let { user } = this || {}
      let { name } = user || {}
      return name
    },
    email() {
      let { user } = this || {}
      let { email } = user || {}
      return email
    },
    phone() {
      let { user } = this || {}
      let { phone } = user || {}
      phone = !isEmpty(phone) ? phone : '--'
      return phone
    },
    mobile() {
      let { user } = this || {}
      let { mobile } = user || {}
      mobile = !isEmpty(mobile) ? mobile : '--'
      return mobile
    },
    language() {
      let { user } = this || {}
      let { language } = user || {}
      language = !isEmpty(language) ? language : '--'
      return language
    },
    contactDetails() {
      let { user } = this || {}
      let { street, city, state, country, zip, timezone } = user || {}
      let countryName = null
      if (!isEmpty(country)) {
        countryName = this.countryList.find(
          countryName => countryName.value === country
        )
      }
      return [
        { label: 'Street', value: street },
        { label: 'City', value: city },
        { label: 'State', value: state },
        { label: 'Country', value: countryName?.label },
        { label: 'Zipcode', value: zip },
        { label: 'Timezone', value: timezone },
      ]
    },
    signatureContentText() {
      if (this.signatureContent) {
        return this.signatureContent
      } else {
        return 'Add Signature'
      }
    },
    canShowAddSign() {
      return isEmpty(this.signatureContent)
    },
  },
  methods: {
    async init() {
      this.loading = true
      this.sanitize = sanitize
      await this.getAccount()
      await this.getSign()
      this.loading = false
    },
    async getAccount() {
      this.loading = true
      let { data, error } = await API.get('/v2/fetchAccount')
      if (error) {
        console.warn('Unable to fetch account details')
        this.loginRequired = true
      } else {
        let { account } = data || {}
        if (!isEmpty(account)) {
          let { user } = account || {}
          this.user = user
        } else {
          this.loginRequired = true
        }
      }
      this.loading = false
    },
    async getSign() {
      let { error, data } = await API.get('/v2/application/users/getSignature')
      if (error) {
        console.warn('Unable to fetch signature')
      } else {
        this.signatureContent = getProperty(
          data,
          'signature.signatureContent',
          ''
        )
      }
    },
    showEditProfileDialogue() {
      this.showEditProfile = true
    },
    closeEditProfileDialogue() {
      this.showEditProfile = false
    },
    handleEditprofileDialogSave() {
      this.showEditProfile = false
      this.getAccount()
      this.getSign()
    },
    canShowAvatarDialog() {
      this.showAvatarDialog = true
    },
    canShowSignatureDialog() {
      this.showSignatureDialog = true
    },
    canShowChangePasswordDialog() {
      this.showChangePasswordDialog = true
    },
    close() {
      this.showAvatarDialog = false
    },
    closeChangePasswordDialog() {
      this.showChangePasswordDialog = false
    },
    closeEditSignatureDialog() {
      this.showSignatureDialog = false
      this.getSign()
    },
    handleSignatureSave() {
      this.showSignatureDialog = false
      this.getSign()
    },
    handleChangePasswordSave() {
      this.showChangePasswordDialog = false
      this.getAccount()
    },
  },
}
</script>
<style scoped>
.profile-banner {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='916' height='140' fill='none'%3E%3Cpath fill='url(%23a)' d='M916 0v140H0V0h916Z'/%3E%3Cg opacity='.75' style='mix-blend-mode:overlay'%3E%3Cmask id='b' width='916' height='140' x='0' y='0' maskUnits='userSpaceOnUse' style='mask-type:luminance'%3E%3Cpath fill='%23fff' d='M0 140h916V0H0v140Z'/%3E%3C/mask%3E%3Cg mask='url(%23b)'%3E%3Cpath fill='url(%23c)' d='M952.91 239.298H687.323c21.979-34.653 62.018-77.425 96.881-95.25 38.931-19.906 148.81-77.15 148.81-77.15V51.169c11.792-3.221 19.896-4.754 19.896-4.754v192.883Z'/%3E%3Cpath fill='url(%23d)' d='M784.204 144.048c-34.863 17.824-74.902 60.584-96.881 95.25-2.563 4.047-4.895 7.989-6.946 11.774-44.984-1.873-224.936 16.173-224.936 16.173s13.677-17.077 35.557-40.585c40.651-43.703 109.649-109.669 172.08-129.89 96.037-31.103 173.023-39.826 218.883-80.883 11.279-10.11 20.094-18.138 26.974-24.53 21.103-19.578 24.063-23.612 24.063-23.612v99.153s-109.88 57.244-148.811 77.15h.017Z'/%3E%3Cpath fill='url(%23e)' d='M908.951-8.655c-6.88 6.391-15.695 14.432-26.974 24.53-45.86 41.07-122.845 49.779-218.882 80.883-62.432 20.221-131.429 86.2-172.08 129.889-51.599 2.03-132.454 3.261-132.454 3.261s13.065-20.993 38.649-48.535C438.126 137.33 511.043 76.55 613.778 58.176 771.85 29.9 847.727-1.714 875.924-34.572a71.932 71.932 0 0 0 4.333-5.566c24.229-34.85 34.598-46.047 34.598-46.047l-5.904 77.504v.026Z'/%3E%3Cpath fill='url(%23f)' d='M613.778 58.189C511.026 76.563 438.109 137.343 397.21 181.386H246.961s3.109-6.011 9.245-15.86c26.94-43.244 112.36-160.653 251.165-170.79 29.355-2.147 55.221-3.588 78.259-4.78 110.69-5.722 155.971-5.683 208.96-49.975 64.019-53.525 81.318-63.478 81.318-63.478v88.937C847.71-1.7 771.833 29.914 613.761 58.19h.017Z'/%3E%3Cpath fill='url(%23g)' d='M585.613-10.056c-23.037 1.192-48.903 2.632-78.258 4.78C368.55 4.861 283.13 122.269 256.19 165.513h-66.997S236.559 8.723 370.22-25.811c36.665-9.469 67.145-13.11 93.755-14.197 25.452-1.047 47.366.25 67.774 1.009 12.304 3.064 18.87 6.731 18.87 6.731s-2.299-2.553-7.029-6.377c31.191.707 59.62-1.284 93.11-17.039 81.318-38.267 88.463 0 88.463 0S660.548-35.738 585.63-10.069l-.017.013Z'/%3E%3Cpath fill='url(%23h)' d='M214.416-1.177c-29.289 18.675-52.84 38.765-71.759 58.907C102.8 100.124 83.4 142.7 73.99 172.651l-66.698 8.735s-.711-8.447 4.564-25.328c6.351-20.352 21.4-52.975 56.875-97.87 64.879-82.126 194.654-99.544 194.654-99.544L214.416-1.164v-.013Z'/%3E%3Cpath fill='url(%23i)' d='M199.366 196.316s-1.091-10.386 8.071-30.803h-18.225S236.577 8.723 370.238-25.811c36.666-9.469 67.146-13.11 93.755-14.197 29.935-5.474 52.989-2.671 67.774 1.009 4.002.144 7.938.275 11.841.367-23.418-18.833-106.787-68.468-271.54 6.377a490.458 490.458 0 0 0-20.656 9.98c-13.231 6.77-25.535 13.83-36.963 21.111-29.289 18.676-52.84 38.765-71.759 58.907-39.857 42.393-59.257 84.97-68.667 114.921-7.822 24.922-8.732 41.096-8.732 41.096l134.092-17.418-.017-.026Z'/%3E%3Cpath fill='url(%23j)' d='m-54.677 109.474-20.64 8.015V-8.393l132.57-6.457C-5.458 28.04-37.94 74.467-54.676 109.474Z'/%3E%3Cpath fill='url(%23k)' d='M68.731 58.189c-35.474 44.894-50.508 77.517-56.875 97.869l-84.146 9.455s1.77-22.905 17.613-56.039C-37.94 74.467-5.459 28.041 57.253-14.85c2.63-1.794 5.276-3.588 8.022-5.369 129.775-84.615 198.11-21.15 198.11-21.15S133.61-23.952 68.731 58.175v.013Z'/%3E%3C/g%3E%3C/g%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' x2='1156.69' y1='131.73' y2='23.003' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23404FD4'/%3E%3Cstop offset='.416' stop-color='%234F3FD7'/%3E%3Cstop offset='1' stop-color='%237525FF'/%3E%3C/linearGradient%3E%3ClinearGradient id='c' x1='705.471' x2='900.666' y1='113.645' y2='239.114' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fff' stop-opacity='0'/%3E%3Cstop offset='.943' stop-color='%23fff'/%3E%3C/linearGradient%3E%3ClinearGradient id='d' x1='488.073' x2='807.236' y1='72.137' y2='309.709' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fff' stop-opacity='0'/%3E%3Cstop offset='.943' stop-color='%23fff'/%3E%3C/linearGradient%3E%3ClinearGradient id='e' x1='396.572' x2='741.521' y1='23.991' y2='307.39' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fff' stop-opacity='0'/%3E%3Cstop offset='.943' stop-color='%23fff'/%3E%3C/linearGradient%3E%3ClinearGradient id='f' x1='289.937' x2='628.858' y1='-17.229' y2='309.16' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fff' stop-opacity='0'/%3E%3Cstop offset='.943' stop-color='%23fff'/%3E%3C/linearGradient%3E%3ClinearGradient id='g' x1='225.816' x2='490.484' y1='10.336' y2='288.336' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fff' stop-opacity='0'/%3E%3Cstop offset='.943' stop-color='%23fff'/%3E%3C/linearGradient%3E%3ClinearGradient id='h' x1='24.761' x2='231.274' y1='36.281' y2='147.136' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fff' stop-opacity='0'/%3E%3Cstop offset='.943' stop-color='%23fff'/%3E%3C/linearGradient%3E%3ClinearGradient id='i' x1='97.974' x2='406.641' y1='27.436' y2='268.409' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fff' stop-opacity='0'/%3E%3Cstop offset='.943' stop-color='%23fff'/%3E%3C/linearGradient%3E%3ClinearGradient id='j' x1='-31.301' x2='101.619' y1='34.798' y2='-55.59' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fff' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23fff'/%3E%3C/linearGradient%3E%3ClinearGradient id='k' x1='-49.353' x2='188.582' y1='15.856' y2='178.154' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23fff' stop-opacity='0'/%3E%3Cstop offset='.943' stop-color='%23fff'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
  width: 83%;
  height: 140px;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 8px 8px 0px 0px;
}
.profile-avatar {
  position: relative;
  z-index: 99;
  bottom: -75px;
  right: -16px;
  width: 112px;
  overflow: hidden;
  border-radius: 50%;
}
.profile-avatar:hover .edit-box {
  display: flex;
}
.profile-avatar .edit-box {
  display: none;
}
.avatar-container {
  height: 112px;
  width: 112px;
}
.edit-button {
  position: absolute;
  left: 32%;
}
</style>
<style lang="scss">
.profile-container {
  .rich-text-container {
    p {
      margin: 0px;
    }
  }
}
.avatar-container {
  img {
    height: 115px;
    width: 115px;
  }
}
.avatar-container {
  span {
    font-size: 50px;
  }
}
.edit-button {
  button {
    background: var(--colors-backgroundCanvas);
  }
}
</style>
