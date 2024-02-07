export default {
  components: {
    timedetails: () => import('./WorkordeTimeDetail.vue'),
    responsibility: () => import('./WorkorderResponsibility.vue'),
    resource: () => import('./WorkorderResorce.vue'),
    costDetails: () => import('./WorkorderCost.vue'),
    multiResource: () => import('./WorkorderMultiresource.vue'),
    tasks: () => import('./NewWoTasks.vue'),
    plans: () => import('./NewWorkorderInventoryPlan.vue'),
    workorderitems: () => import('./NewWorkorderActualsItems.vue'),
    workordertools: () => import('./NewWorkorderActualsTools.vue'),
    workorderservice: () => import('./NewWorkorderActualsServices.vue'),
    workorderlabour: () => import('./NewWorkOrderActualsLabour.vue'),
    failurereports: () => import('./WorkorderFailureReport.vue'),
    failureHierarchy: () => import('./ReportHierarchy.vue'),
    relatedRecords: () => import('./DependentWorkorder.vue'),
    jobplanDetails: () => import('./pmdetails.vue'),
    workorderSafetyPlan: () => import('./WorkordersafetyPlan.vue'),
    workorderHazardPrecautions: () =>
      import('../../portfolio/widgets/SafetyPlanPrecautions.vue'),
    workorderFinancial: () => import('./WorkOrderFinancials.vue'),
  },
}
