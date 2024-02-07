<template>
  <div class="h-full">
    <FTabs
      v-model="val"
      :tabsList="tabsLists"
      class="relative"
      borderBottom="1px solid var(--colors-borderNeutralBaseSubtle)"
    >
      <FTabPane activeKey="items" key="items">
        <ServicePlanItems
          :servicePlanId="servicePlanId"
          :canShowActionButtons="canShowActionButtons"
        ></ServicePlanItems>
      </FTabPane>
      <FTabPane activeKey="tools" key="tools">
        <ServicePlanTools
          :servicePlanId="servicePlanId"
          :canShowActionButtons="canShowActionButtons"
        >
        </ServicePlanTools>
      </FTabPane>
      <FTabPane activeKey="services" key="services">
        <ServicePlanServices
          :servicePlanId="servicePlanId"
          :canShowActionButtons="canShowActionButtons"
        >
        </ServicePlanServices>
      </FTabPane>
    </FTabs>
  </div>
</template>
<script>
import { FTabs, FTabPane, FContainer } from '@facilio/design-system'
import ServicePlanItems from './ServicePlanItems.vue'
import ServicePlanTools from './ServicePlanTools.vue'
import ServicePlanServices from './ServicePlanServices.vue'
import getProperty from 'dlv'

export default {
  props: ['details', 'fitToViewArea'],
  components: {
    FTabs,
    FTabPane,
    ServicePlanItems,
    ServicePlanTools,
    ServicePlanServices,
    FContainer,
  },
  data() {
    return {
      loading: false,
      val: 'items',
      tabsLists: [
        { label: 'Items', value: 'items' },
        { label: 'Tools', value: 'tools' },
        { label: 'Services', value: 'services' },
      ],
    }
  },
  created() {
    this.fitToViewArea()
  },
  computed: {
    servicePlanId() {
      let { details } = this
      let { moduleName, id } = details || {}
      return moduleName === 'servicePlan'
        ? id
        : getProperty(details, 'servicePlan.id')
    },
    canShowActionButtons() {
      let { details } = this
      let { moduleName } = details || {}
      return moduleName === 'servicePlan'
    },
  },
}
</script>
