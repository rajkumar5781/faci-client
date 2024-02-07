<template>
  <FContainer display="flex" justifyContent="center" alignItems="flex-start">
    <FContainer width="84%">
      <FContainer display="flex" justifyContent="space-between">
        <FContainer
          display="flex"
          flexDirection="column"
          rowGap="containerLarge"
          width="80%"
        >
          <FText appearance="headingMed16">{{
            $t(
              'notifications.notification_you_receive',
              'Notifications you receive',
              {
                ns: 'account',
              }
            )
          }}</FText>
          <FText color="textCaption">{{
            $t('notifications.notification_desc', { ns: 'account' })
          }}</FText>
        </FContainer>
        <fc-illustration name="notification" size="S"></fc-illustration>
      </FContainer>
      <FContainer padding="sectionMedium containerNone">
        <FDivider width="100%" />
      </FContainer>
      <FContainer display="flex" flexDirection="column" gap="containerXxLarge">
        <FText appearance="headingMed20">{{
          $t('notifications.notification', 'Notifications', { ns: 'account' })
        }}</FText>
        <FContainer
          border="1px solid"
          borderRadius="high"
          borderColor="borderNeutralBaseSubtler"
        >
          <FContainer display="flex" justifyContent="flex-end">
            <portal-target name="pagination"></portal-target>
          </FContainer>
          <NotificationList :showInTab="true" />
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import NotificationList from './NotificationList.vue'
import { FContainer, FText, FDivider } from '@facilio/design-system'

export default {
  components: { NotificationList, FContainer, FText, FDivider },
}
</script>
