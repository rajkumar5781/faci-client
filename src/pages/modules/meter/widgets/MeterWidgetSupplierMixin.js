export default {
  components: {
    monthlyConsumption: () => import('./MeterMonthlyConsumption.vue'),
    totalConsumption: () => import('./MeterTotalConsumption.vue'),
    peakDemand: () => import('./MeterPeakDemand.vue'),
    meterReadings: () => import('./MeterReadings.vue'),
  },
}
