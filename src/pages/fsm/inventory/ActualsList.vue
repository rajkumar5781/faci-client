<template>
  <FTabs
    v-model="val"
    :tabsList="tabsLists"
    class="relative"
    borderBottom="1px solid var(--colors-borderNeutralBaseSubtle)"
  >
    <FTabPane activeKey="items" key="items">
      <ItemsList
        :parentModule="moduleName"
        :serviceOrderId="serviceOrderId"
        :serviceAppointmentId="serviceAppointmentId"
        :recordId="recordId"
      ></ItemsList>
    </FTabPane>
    <FTabPane activeKey="tools" key="tools">
      <ToolsList
        :parentModule="moduleName"
        :serviceOrderId="serviceOrderId"
        :serviceAppointmentId="serviceAppointmentId"
        :recordId="recordId"
      >
      </ToolsList>
    </FTabPane>
    <FTabPane activeKey="services" key="services">
      <ServicesList
        :parentModule="moduleName"
        :serviceOrderId="serviceOrderId"
        :serviceAppointmentId="serviceAppointmentId"
        :recordId="recordId"
      >
      </ServicesList>
    </FTabPane>
  </FTabs>
</template>
<script>
import { FTabs, FTabPane } from '@facilio/design-system'
import ItemsList from './ItemsList.vue'
import ToolsList from './ToolsList.vue'
import ServicesList from './ServicesList.vue'
export default {
  props: ['details', 'fitToViewArea'],
  components: {
    FTabs,
    FTabPane,
    ItemsList,
    ToolsList,
    ServicesList,
  },
  data() {
    return {
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
