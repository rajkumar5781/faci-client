<template>
  <FContainer ref="actual-tools">
    <portal :to="groupActionPortal">
      <FContainer class="wo-actuals-portal-alignment">
        <FDropdown
          :name="
            $t('inventory.inventory_request.inventory_request', {
              ns: 'inventory',
            })
          "
          @dropdown="inventoryRequestDropdownAction"
          :options="options()"
          :buttonProps="dropDownProps()"
        />
      </FContainer>
    </portal>
    <LineItemList
      v-bind="$attrs"
      ref="lineItemList"
      :config="listConfiguration"
      :moduleName="moduleName"
      :moduleDisplayName="moduleDisplayName"
      :widgetDetails="widgetDetails"
      :additionalParams="additionalParams"
      @onCreateOrUpdate="refreshData"
      @clickedActionBtn="btnValue"
      :widget="widget"
      viewName="all"
      currentModuleName="workorder"
      heading="List of Tools"
      selectText="Select Tool"
      emptyStateTitle="No Tools found."
    >
    </LineItemList>
  </FContainer>
</template>
<script>
import LineItemList from './WorkorderActualList.vue'
import WorkorderActualsCommon from './WorkorderActualsCommon.vue'
import { FContainer, FDropdown } from '@facilio/design-system'
export default {
  props: ['widget', 'details', 'resizeWidget', 'module', 'groupActionPortal'],
  extends: WorkorderActualsCommon,
  components: { LineItemList, FContainer, FDropdown },
  computed: {
    moduleDisplayName() {
      return 'Tools'
    },
    moduleName() {
      return 'workorderTools'
    },
    workorder() {
      let { details } = this || {}

      return details
    },
    widgetDetails() {
      let { widget, emptyStateBtnList } = this
      let { relatedList } = widget || {}
      let { summaryWidgetName } = relatedList || {}
      let emptyStateText = this.$t('inventory.workorder.no_tools_associated', {
        ns: 'inventory',
      })
      return {
        canHideTitle: true,
        perPage: 5,
        summaryWidgetName,
        emptyStateText,
        actionButtonList: emptyStateBtnList,
      }
    },
  },
  methods: {
    refreshData() {
      eventBus.$emit('reloadWorkorderActualsCost')
      this.autoResize()
    },
  },
}
</script>
