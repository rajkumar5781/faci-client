<template>
  <MetricsWidget
    :details="details"
    :isMttc="false"
    :moduleName="moduleName"
    cardId="3"
  ></MetricsWidget>
</template>
<script>
import MetricsWidget from './AnomalyMeanMetricWidget.vue'
export default {
  components: { MetricsWidget },
  props: ['details', 'moduleName'],
}
</script>
