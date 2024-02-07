<template>
  <div class="h-full">
    <FTabs
      v-model="val"
      :tabsList="tabsLists"
      class="relative"
      borderBottom="1px solid var(--colors-borderNeutralBaseSubtle)"
    >
      <FTabPane activeKey="items" key="items">
        <PlannedItemsList
          :parentModule="moduleName"
          :serviceOrderId="serviceOrderId"
          :serviceAppointmentId="serviceAppointmentId"
          :recordId="recordId"
        ></PlannedItemsList>
      </FTabPane>
      <FTabPane activeKey="tools" key="tools">
        <PlannedToolsList
          :parentModule="moduleName"
          :serviceOrderId="serviceOrderId"
          :serviceAppointmentId="serviceAppointmentId"
          :recordId="recordId"
        >
        </PlannedToolsList>
      </FTabPane>
      <FTabPane activeKey="services" key="services">
        <PlannedServicesList
          :parentModule="moduleName"
          :serviceOrderId="serviceOrderId"
          :serviceAppointmentId="serviceAppointmentId"
          :recordId="recordId"
        >
        </PlannedServicesList>
      </FTabPane>
    </FTabs>
  </div>
</template>
<script>
import { FTabs, FTabPane, FContainer } from '@facilio/design-system'
import PlannedItemsList from './PlannedItemsList.vue'
import PlannedToolsList from './PlannedToolsList.vue'
import PlannedServicesList from './PlannedServicesList.vue'
export default {
  props: ['details', 'fitToViewArea'],
  components: {
    FTabs,
    FTabPane,
    PlannedItemsList,
    PlannedToolsList,
    PlannedServicesList,
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
    moduleName() {
      let { details } = this
      let { moduleName } = details || {}
      return moduleName
    },
    recordId() {
      let { details } = this
      let { id } = details || {}
      return id
    },
    serviceOrder() {
      let { details } = this
      let { serviceOrder } = details || {}
      let { id } = serviceOrder || {}
      return id
    },
    serviceOrderId() {
      let { moduleName, recordId, serviceOrder } = this
      return moduleName === 'serviceOrder' ? recordId : serviceOrder
    },
    serviceAppointmentId() {
      let { moduleName, recordId } = this
      return moduleName === 'serviceAppointment' ? recordId : null
    },
  },
}
</script>
