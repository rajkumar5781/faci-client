export default {
  components: {
    rootCauseAndImpact: () => import('./RuleRootCauseAndImpact.vue'),
    ruleAssetsAlarm: () => import('./AssetsAndAlarmDetails.vue'),
    ruleAlarmInsight: () => import('./RuleAlarmInsight.vue'),
    ruleAssociatedWo: () => import('./RuleAssociatedWorkOrders.vue'),
    ruleWoDuration: () => import('./RuleWoDuration.vue'),
    rootCauses: () => import('./RuleRootCausesTable.vue'),
    ruleLogs: () => import('./RuleHistoryLogs.vue'),
    ruleInsight: () => import('./RuleInsight.vue'),
  },
}
