<template>
  <FTabs v-model="activeTab" :tabsList="tabs">
    <FTabPane v-for="tab in tabs" :activeKey="tab.value" :key="tab.value">
      <WorkOrderPlannedItems
        v-if="activeTab == 'workOrderPlannedItems'"
        v-bind="$attrs"
        :workOrderId="details.id"
        :widget="widget"
        :disableActionableUIElements="disableActionableUIElements"
      >
      </WorkOrderPlannedItems>
      <WorkOrderPlannedTools
        v-bind="$attrs"
        v-if="activeTab == 'workOrderPlannedTools'"
        :workOrderId="details.id"
        :widget="widget"
        :disableActionableUIElements="disableActionableUIElements"
      >
      </WorkOrderPlannedTools>
      <WorkOrderPlannedServices
        v-bind="$attrs"
        v-if="activeTab == 'workOrderPlannedServices'"
        :workOrderId="details.id"
        :widget="widget"
        :disableActionableUIElements="disableActionableUIElements"
      />
      <WorkOrderPlannedLabours
        v-if="activeTab == 'workOrderPlannedLabours'"
        v-bind="$attrs"
        :workOrderId="details.id"
        :resizeWidget="resizeWidget"
        :widget="widget"
        :disableActionableUIElements="disableActionableUIElements"
      >
      </WorkOrderPlannedLabours>
    </FTabPane>
  </FTabs>
</template>
<script>
import { FContainer, FTabs, FTabPane } from '@facilio/design-system'

import WorkOrderPlannedItems from './NewWorkorderPlannesItems.vue'
import WorkOrderPlannedTools from './NewWorkorderPlannedTools.vue'
import WorkOrderPlannedServices from './NewWorkorderPlannedServices.vue'
import WorkOrderPlannedLabours from './NewWorkorderPlannedLabor.vue'
export default {
  props: ['details', 'widget'],
  components: {
    WorkOrderPlannedLabours,
    WorkOrderPlannedItems,
    WorkOrderPlannedTools,
    WorkOrderPlannedServices,
    FContainer,
    FTabs,
    FTabPane,
  },
  data() {
    return {
      activeTab: 'workOrderPlannedItems',
    }
  },
  computed: {
    workOrderSettings() {
      let { details } = this
      let { workOrderSettings = {} } = details || {}
      return workOrderSettings
    },
    disableActionableUIElements() {
      let { workOrderSettings } = this
      let { inventoryPlaning } = workOrderSettings || {}
      let { allowed: canDoActionsOnPlans = true } = inventoryPlaning || {}
      return !canDoActionsOnPlans
    },
    tabs() {
      let activeTab = this.activeTab
      return [
        {
          name: 'workOrderPlannedItems',
          value: 'workOrderPlannedItems',
          label: 'Items',
          isActive: activeTab === 'workOrderPlannedItems',
        },
        {
          name: 'workOrderPlannedTools',
          value: 'workOrderPlannedTools',
          label: 'Tools',
          isActive: activeTab === 'workOrderPlannedTools',
        },
        {
          name: 'workOrderPlannedServices',
          value: 'workOrderPlannedServices',
          label: 'Services',
          isActive: activeTab === 'workOrderPlannedServices',
        },
        {
          name: 'workOrderPlannedLabours',
          value: 'workOrderPlannedLabours',
          label: 'Labors',
          isActive: activeTab === 'workOrderPlannedLabours',
        },
      ]
    },
  },
}
</script>
