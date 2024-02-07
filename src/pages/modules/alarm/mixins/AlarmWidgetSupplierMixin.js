export default {
  components: {
    occurrenceHistory: () => import('../OccurrenceHistory.vue'),
    locationDetails: () => import('../LocationDetails.vue'),
    mtbaCard: () => import('../AnomalyMTBAWidget.vue'),
    mttcCard: () => import('../AnomalyMTTCWidget.vue'),
    noOfOccurrences: () => import('../NoOfOccurrences.vue'),
    impactInfo: () => import('../ImpactInfoWidget.vue'),
    energyImpact: () => import('../EnergyImpactWidget.vue'),
    costImpact: () => import('../CostImpactWidget.vue'),
    alarmDuration: () => import('../AlarmDuration.vue'),
    alarmRca: () => import('../AlarmRCA.vue'),
    alarmReport: () => import('../AlarmReport.vue'),
  },
}
