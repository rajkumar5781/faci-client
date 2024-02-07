<template>
  <MetricsWidget
    :details="details"
    :isMttc="true"
    :moduleName="moduleName"
    cardId="2"
  ></MetricsWidget>
</template>
<script>
import MetricsWidget from './AnomalyMeanMetricWidget.vue'
export default {
  components: { MetricsWidget },
  props: ['details', 'moduleName'],
}
</script>
