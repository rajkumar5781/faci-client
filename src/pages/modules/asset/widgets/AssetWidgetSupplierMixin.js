export default {
  components: {
    assetlocation: () => import('./AssetLocation.vue'),
    operatingHours: () => import('./OperatingHours.vue'),
    plannedMaintenance: () => import('./AssetPlannedMaintenance.vue'),
    unPlannedMaintenance: () => import('./AssetReactiveMaintenance.vue'),
    workorderInsight: () => import('./AssetMaintenanceInsights.vue'),
    recentlyClosedPm: () => import('./AssetRecentClosedWorkorder.vue'),
    faultReport: () => import('./AssetFaultReport.vue'),
    faultInsight: () => import('./AssetFaultInsights.vue'),
    readings: () => import('./AssetReadings.vue'),
    commandsWidget: () => import('./AssetCommands.vue'),
    lastDownTime: () => import('./AssetPerfLastDowntime.vue'),
    overallDownTime: () => import('./AssetPerfOverallDowntime.vue'),
    downloadHistory: () => import('./AssetDowntimeHistory.vue'),
    assetCostDetails: () => import('./AssetCostInsights.vue'),
    maintenanceCostTrend: () => import('./AssetMaintenanceCostInsights.vue'),
    costBreakup: () => import('./AssetMaintenanceCostBreakup.vue'),
    depreciationSchedule: () => import('./AssetDepreciationSchedule.vue'),
    depreciationCostTrend: () => import('./AssetDepreciationCostTrend.vue'),
    safetyPlanHazards: () => import('../../portfolio/widgets/SafetyPlanHazards.vue'),
    safetyPlanPrecautions: () => import('../../portfolio/widgets/SafetyPlanPrecautions.vue'),
    avgRepairTime: () =>
      import('./AssetMeanTimeToRepair.vue'),
    failureRate: () => import('./AssetMeanTimeBtwFailure.vue')
  },
}
