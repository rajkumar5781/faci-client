<template>
  <FContainer
    border="1px solid"
    borderRadius="high"
    borderColor="borderNeutralBaseSubtler"
    padding="containerXLarge"
  >
    <FContainer
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
    >
      <FText
        color="textMain"
        appearance="captionMed12"
        class="flex justify-center items-center"
        >{{ $t('user_management.invite_details', { ns: 'account' }) }}</FText
      >
      <FContainer
        v-if="inviteStatus == 2"
        display="flex"
        flexDirection="row"
        class="gap-x-2"
      >
        <FButton appearance="secondary" size="small" @click="revokeAppAccess">{{
          $t('user_management.revoke_access', { ns: 'account' })
        }}</FButton>
        <FButton
          appearance="secondary"
          size="small"
          :loading="resetpasswordLoading"
          @click="resetPassword(userData)"
          >{{
            $t(
              'user_management.send_pwd_reset_link',
              'Send Password reset link',
              { ns: 'account' }
            )
          }}</FButton
        >
      </FContainer>
      <FContainer v-else>
        <FButton
          appearance="secondary"
          size="small"
          :loading="sendInviteloading"
          @click="reinvite(userData, appLinkName)"
          >{{
            inviteStatus == 4
              ? $t('user_management.send_invitation', 'Send Invitation', {
                  ns: 'account',
                })
              : $t('user_management.resend_invite', 'Resend Invite', {
                  ns: 'account',
                })
          }}</FButton
        >
      </FContainer>
    </FContainer>
    <FDivider
      width="100%"
      marginTop="containerLarge"
      marginBottom="containerLarge"
    />
    <FContainer
      display="flex"
      flexDirection="row"
      gap="containerLarge"
      alignItems="center"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        class="gap-y-1"
        width="23%"
      >
        <FText color="textMain" appearance="captionMed12">{{
          $t('user_management.invite_status', { ns: 'account' })
        }}</FText>
        <FTags
          v-if="inviteStatus == 2"
          appearance="status"
          text="Accepted"
          statusType="success"
        />
        <FTags
          v-if="inviteStatus == 1"
          appearance="status"
          text="Pending"
          statusType="warning"
        />
        <FTags
          v-if="inviteStatus == 3"
          appearance="status"
          text="Expired"
          statusType="danger"
        />
        <FTags
          v-if="inviteStatus == 4"
          appearance="status"
          text="Not Sent"
          statusType="neutral"
        />
      </FContainer>
      <FContainer
        display="flex"
        flexDirection="column"
        class="gap-y-1"
        width="23%"
      >
        <FContainer>
          <FText color="textMain" appearance="captionMed12">{{
            $t('user_management.invited_by', { ns: 'account' })
          }}</FText>
        </FContainer>
        <FContainer display="flex" flexDirection="row" class="gap-x-1">
          <FAvatar
            size="XS"
            :userName="invitedUserName"
            :avatarUrl="avatarUrl"
          />
          <FText appearance="bodyReg14">{{ invitedUserName }}</FText>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        flexDirection="column"
        class="gap-y-1"
        width="23%"
      >
        <FContainer>
          <FText color="textMain" appearance="captionMed12">{{
            $t('user_management.invited_time', { ns: 'account' })
          }}</FText>
        </FContainer>
        <FContainer display="flex" flexDirection="row" class="gap-x-1">
          <FText appearance="bodyReg14" :color="invitedTextColor">{{
            invitedTime
          }}</FText>
        </FContainer>
      </FContainer>
      <FContainer
        v-if="inviteStatus == 2 || inviteStatus == 4"
        display="flex"
        flexDirection="column"
        class="gap-y-1"
        width="23%"
      >
        <FContainer>
          <FText color="textMain" appearance="captionMed12">{{
            $t('user_management.last_login', { ns: 'account' })
          }}</FText>
        </FContainer>
        <FContainer display="flex" flexDirection="row" class="gap-x-1">
          <FText appearance="bodyReg14" :color="lastLoginTextColor">{{
            lastLoginTime
          }}</FText>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FButton,
  FText,
  FTags,
  FDivider,
  FAvatar,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate } from '../../utils/formatter'
import { API } from '@facilio/api'

export default {
  components: {
    FContainer,
    FButton,
    FText,
    FTags,
    FDivider,
    FAvatar,
  },

  props: ['userData', 'invitedBy', 'appLinkName', 'moduleName'],
  data() {
    return {
      defaultTime: '---',
      sendInviteloading: false,
      resetpasswordLoading: false,
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
    }
  },
  computed: {
    invitedUserName() {
      let { invitedBy } = this
      let { name } = invitedBy || {}
      return name
    },
    avatarUrl() {
      let { invitedBy } = this
      let { avatarUrl } = invitedBy || {}
      return avatarUrl
    },
    inviteStatus() {
      let { userData } = this
      let { inviteStatus } = userData || {}
      return inviteStatus
    },
    invitedTime() {
      let { userData } = this
      let { invitedTime } = userData || {}
      if (!isEmpty(invitedTime) && invitedTime > 0) {
        return formatDate(invitedTime)
        // return dayjs(invitedTime).format('YYYY-MM-DD HH:mm:ss')
      } else {
        return this.defaultTime
      }
    },
    lastLoginTime() {
      let { userData } = this
      let { lastLoginTime } = userData || {}
      if (!isEmpty(lastLoginTime) && lastLoginTime > 0) {
        return formatDate(lastLoginTime)
        // return dayjs(lastLoginTime).format('YYYY-MM-DD HH:mm:ss')
      } else {
        return this.defaultTime
      }
    },
    invitedTextColor() {
      let { userData } = this
      let { invitedTime } = userData || {}
      if (!isEmpty(invitedTime) && invitedTime > 0) {
        return 'textDescription'
      } else {
        return 'textCaption'
      }
    },
    lastLoginTextColor() {
      let { userData } = this
      let { lastLoginTime } = userData || {}
      if (!isEmpty(lastLoginTime) && lastLoginTime > 0) {
        return 'textDescription'
      } else {
        return 'textCaption'
      }
    },
    options() {
      return {
        manualClear: this.manualClear,
        menuType: this.menuType,
        timeout: this.timeout,
      }
    },
  },
  methods: {
    async reinvite(user, appLinkName) {
      this.sendInviteloading = true
      let { uid } = user || {}
      await API.post('/v2/application/users/invite', {
        user: { uid },
        appLinkName,
        moduleName: this.moduleName,
      }).then(({ error }) => {
        if (error) {
          let msg = error.message || this.$t('error')
          ftoast.critical(msg, this.options)
        } else {
          ftoast.success(
            this.$t('user_management.invitation_resend_success', {
              ns: 'account',
            }),
            this.options
          )
        }
      })
      this.sendInviteloading = false
      this.$emit('reloadUserData')
    },
    async resetPassword(user) {
      this.resetpasswordLoading = true
      let { uid } = user || {}
      let { error } = await API.post('/v2/application/users/resetpassword', {
        user: { uid },
        moduleName: this.moduleName,
      })
      if (error) {
        let msg = error.message || this.$t('error')
        ftoast.critical(msg, this.options)
      } else {
        ftoast.success(
          this.$t('user_management.pwd_reset_link', { ns: 'account' }),
          this.options
        )
      }
      this.resetpasswordLoading = false
    },
    revokeAppAccess() {
      this.$emit('revokeAccess')
    },
  },
}
</script>
