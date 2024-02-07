export default {
  components: {
    pmPlannerTriggerDetailsWidget: () =>
      import('./PmPlannerTriggerDetailsWidget.vue'),
    pmResourcePlannerDetailsWidget: () =>
      import('./PmResourcePlannerDetailsWidget.vue'),
    pmSchedulerDetailsWidget: () => import('../PmSchedulerDetailsWidget.vue'),
  },
}
