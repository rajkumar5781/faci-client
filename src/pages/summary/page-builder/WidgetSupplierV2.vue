<template>
  <FContainer>
    <components :is="widgetName" v-bind="$attrs" :widget="widget"></components>
    <FCard v-if="!widgetName" style="height: 100%">
      <FContainer
        height="100%"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding="containerXLarge"
      >
        <FEmptyState
          :title="
            $t('summary.widgets.widget_not_available', 'Widget not available')
          "
          size="M"
          illustration="no-data"
          type="wide"
        ></FEmptyState>
      </FContainer>
    </FCard>
  </FContainer>
</template>
<script>
import { FContainer, FText, FCard, FEmptyState } from '@facilio/design-system'

export default {
  props: ['widget'],
  components: {
    summaryFieldsWidget: () => import('./widgets/summaryFieldsWidgetV2.vue'),
    FContainer,
    FText,
    FCard,
    FEmptyState,
  },
  computed: {
    widgetName() {
      let components = Object.keys(this.$options.components)
      if (this.$options.mixins) {
        this.$options.mixins.forEach(mn => {
          components = components.concat(Object.keys(mn.components))
        })
      }
      let { widgetTypeObj } = this.widget
      let { name } = widgetTypeObj || {}
      let compAvail = components.includes(name)
      return compAvail ? name : null
    },
  },
}
</script>
