<template>
  <FContainer>
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
      currentModuleName="workorder"
      :moduleName="moduleName"
      :moduleDisplayName="moduleDisplayName"
      :widgetDetails="widgetDetails"
      :additionalParams="additionalParams"
      @onCreateOrUpdate="refreshData"
      @clickedActionBtn="btnValue"
      :widget="widget"
      heading="List of Items"
      viewName="all"
      selectText="Select Item"
    >
    </LineItemList>
  </FContainer>
</template>

<script>
import LineItemList from './WorkorderActualList.vue'
import WorkorderActualsCommon from './WorkorderActualsCommon.vue'
import { FContainer, FDropdown } from '@facilio/design-system'

export default {
  props: ['widget', 'details', 'module', 'groupActionPortal'],
  extends: WorkorderActualsCommon,
  components: { LineItemList, FContainer, FDropdown },
  computed: {
    moduleDisplayName() {
      return this.$t('workorder.Items', 'Items', { ns: 'workorder' })
    },
    moduleName() {
      return 'workorderItem'
    },

    workorder() {
      let { details } = this || {}

      return details
    },
    widgetDetails() {
      let { widget, emptyStateBtnList } = this
      let { relatedList } = widget || {}
      let { summaryWidgetName } = relatedList || {}
      let emptyStateText = this.$t('inventory.workorder.no_items_associated', {
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
}
</script>
<style lang="scss">
.wo-actuals-portal-alignment {
  display: flex;
  align-items: center;
  min-height: 30px;
  margin-right: 10px;
}
</style>
