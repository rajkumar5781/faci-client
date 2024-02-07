<template>
  <div class="h-full">
    <FTabs
      v-model="val"
      :tabsList="tabsLists"
      class="relative"
      borderBottom="1px solid var(--colors-borderNeutralBaseSubtle)"
    >
      <FTabPane activeKey="all" key="all">
        <AllServiceOrders
          :details="details"
          :widget="widget"
        ></AllServiceOrders>
      </FTabPane>
      <FTabPane activeKey="upcoming" key="upcoming">
        <PreGeneratedServiceOrders
          :details="details"
          :widget="widget"
        ></PreGeneratedServiceOrders>
      </FTabPane>
      <FTabPane activeKey="new" key="new">
        <NewServiceOrders
          :details="details"
          :widget="widget"
        ></NewServiceOrders>
      </FTabPane>
    </FTabs>
  </div>
</template>
<script>
import { FContainer, FTabs, FTabPane } from '@facilio/design-system'
import AllServiceOrders from './AllServiceOrders.vue'
import NewServiceOrders from './NewServiceOrders.vue'
import PreGeneratedServiceOrders from './PreGeneratedServiceOrders.vue'
export default {
  name: 'ServiceOrders',
  props: ['details', 'widget'],
  components: {
    FContainer,
    FTabs,
    FTabPane,
    AllServiceOrders,
    NewServiceOrders,
    PreGeneratedServiceOrders,
  },
  data() {
    return {
      val: 'all',
      tabsLists: [
        { label: 'All', value: 'all' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'New', value: 'new' },
      ],
    }
  },
}
</script>
