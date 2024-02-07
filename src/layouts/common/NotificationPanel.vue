<template>
  <FPopover
    trigger="clickToOpen"
    v-model="showPopover"
    placement="bottom-start"
    @show="onShowPopover"
    @hide="() => (showPopover = false)"
  >
    <FTooltip placement="bottom">
      <template slot="title"> {{ $t('notification.title') }} </template>
      <FContainer display="flex" position="relative">
        <FIcon
          group="alert"
          name="notification"
          size="16"
          :pressable="true"
          color="iconNeutralDefault"
          marginRight="containerLarge"
        />
        <FContainer
          v-if="unseenCount"
          position="absolute"
          left="15px"
          top="6px"
          cursor="pointer"
        >
          <FBadge shape="dot" dotColor="backgroundSemanticRedLight" />
        </FContainer>
      </FContainer>
    </FTooltip>
    <template #content>
      <FContainer
        width="440px"
        border="solid 1px"
        borderRadius="high"
        borderColor="borderNeutralBaseSubtle"
      >
        <FContainer
          display="flex"
          justifyContent="space-between"
          padding="containerXxLarge"
        >
          <FText appearance="headingMed14" color="textMain">{{
            $t('notification.title')
          }}</FText>
        </FContainer>
        <NotificationList
          v-if="showPopover"
          @hasNotificationData="hasNotificationData = true"
          @onClosePopover="showPopover = false"
        />
        <FContainer
          v-if="hasNotificationData"
          display="flex"
          justifyContent="center"
          padding="containerLarge"
          borderTop="1px solid"
          borderColor="borderNeutralBaseSubtle"
          cursor="pointer"
          @click="notificationRedirect"
        >
          <FText appearance="bodyReg14" color="backgroundPrimaryDefault">{{
            $t('notification.show_all')
          }}</FText>
        </FContainer>
      </FContainer>
    </template>
  </FPopover>
</template>

<script>
import NotificationList from '../../pages/profile/account/NotificationList.vue'
import { API } from '@facilio/api'
import { getApp } from '@facilio/router'
import { mapActions, mapState } from 'pinia'
import homeStore from '../../store/home'
import {
  FContainer,
  FText,
  FTooltip,
  FIcon,
  FPopover,
  FBadge,
} from '@facilio/design-system'

export default {
  components: {
    NotificationList,
    FContainer,
    FText,
    FTooltip,
    FIcon,
    FPopover,
    FBadge,
  },
  data() {
    return {
      showPopover: false,
      hasNotificationData: false,
    }
  },
  computed: {
    ...mapState(homeStore, { unseenCount: 'unseenCount' }),
  },
  methods: {
    ...mapActions(homeStore, ['fetchUnseenNotificationCount']),
    notificationRedirect() {
      let { linkName, orgSubDomain } = getApp() || {}
      this.$router.push({
        name: 'notification',
        params: { app: linkName, orgSubDomain },
      })
    },
    onShowPopover() {
      this.showPopover = true
      this.notificationSeenUpdate()
    },
    async notificationSeenUpdate() {
      await API.get('v3/usernotification/update/seen')
      await this.fetchUnseenNotificationCount()
    },
  },
}
</script>
