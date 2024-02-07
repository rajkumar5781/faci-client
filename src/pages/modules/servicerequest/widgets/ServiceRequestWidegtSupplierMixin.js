export default {
  components: {
    srDetailsWidget: () => import('./ServiceRequestDetails.vue'),
    srEmailThread: () => import('./ServiceRequestConversation.vue'),
    srSiteWidget: () => import('./ServiceRequestResourceCard.vue'),
  },
}
