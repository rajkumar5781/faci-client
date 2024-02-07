<template>
  <FContainer>
    <LineItemList
      v-bind="$attrs"
      ref="lineItemList"
      currentModuleName="workorder"
      :config="listConfiguration"
      :moduleName="moduleName"
      :widget="widget"
      :moduleDisplayName="moduleDisplayName"
      :widgetDetails="widgetDetails"
      :additionalParams="additionalParams"
      @onCreateOrUpdate="refreshData"
      @clickedActionBtn="btnValue"
      viewName="all"
      heading="List of Services"
      selectText="Select Service"
      emptyStateTitle="No Services found."
    >
    </LineItemList>
  </FContainer>
</template>
<script>
import LineItemList from './WorkorderActualList.vue'
import WorkorderActualsCommon from './WorkorderActualsCommon.vue'
import { FContainer } from '@facilio/design-system'

export default {
  props: ['widget', 'details', 'resizeWidget', 'module'],
  extends: WorkorderActualsCommon,
  components: { LineItemList, FContainer },
  computed: {
    moduleDisplayName() {
      return this.$t('workorder.Services', 'Services', { ns: 'workorder' })
    },
    moduleName() {
      return 'workorderService'
    },
    workorder() {
      let { details } = this || {}

      return details
    },
    widgetDetails() {
      let { widget, emptyStateBtnList } = this
      let { relatedList } = widget || {}
      let { summaryWidgetName } = relatedList || {}
      let emptyStateText = this.$t(
        'inventory.workorder.no_services_associated',
        {
          ns: 'inventory',
        }
      )
      return {
        canHideTitle: true,
        perPage: 5,
        summaryWidgetName,
        emptyStateText,
        actionButtonList: emptyStateBtnList,
      }
    },
  },
}
</script>
