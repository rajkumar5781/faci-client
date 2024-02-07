export default {
  components: {
    groupInviteListWidget: () => import('./widgets/GroupInviteListWidget.vue'),
    visitorListWidget: () => import('./widgets/VisitorListWidget.vue'),
    totalInviteWidget: () => import('./widgets/TotalInviteListWidget.vue'),
    checkedInCountWidget: () => import('./widgets/TotalCheckedInWidget.vue'),
  },
}
