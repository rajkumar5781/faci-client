<template>
  <div class="h-full">
    <FTabs
      v-model="val"
      :tabsList="tabsLists"
      class="relative"
      borderBottom="1px solid var(--colors-borderNeutralBaseSubtle)"
    >
      <FTabPane activeKey="all" key="all">
        <ServicePMs :widget="widget" :filters="allViewFilters"></ServicePMs>
      </FTabPane>
      <FTabPane activeKey="published" key="published">
        <ServicePMs
          :widget="widget"
          :filters="publishedViewFilters"
        ></ServicePMs>
      </FTabPane>
      <FTabPane activeKey="unpublished" key="unpublished">
        <ServicePMs
          :widget="widget"
          :filters="unPublishedViewFilters"
        ></ServicePMs>
      </FTabPane>
    </FTabs>
  </div>
</template>
<script>
import { FContainer, FTabs, FTabPane } from '@facilio/design-system'
import ServicePMs from './ServicePMs.vue'
export default {
  name: 'ServicePMList',
  props: ['details', 'widget'],
  components: {
    FContainer,
    FTabs,
    FTabPane,
    ServicePMs,
  },
  data() {
    return {
      val: 'all',
      tabsLists: [
        { label: 'All', value: 'all' },
        { label: 'Published', value: 'published' },
        { label: 'Unpublished', value: 'unpublished' },
      ],
    }
  },
  computed: {
    allViewFilters() {
      let { details } = this
      let { id } = details || {}
      let filters = {
        servicePMTemplate: {
          operatorId: 36,
          value: [id + ''],
        },
      }
      return filters
    },
    publishedViewFilters() {
      let { details } = this
      let { id } = details || {}
      let filters = {
        servicePMTemplate: {
          operatorId: 36,
          value: [id + ''],
        },
        isPublished: { operatorId: 15, value: ['true'] },
      }
      return filters
    },
    unPublishedViewFilters() {
      let { details } = this
      let { id } = details || {}
      let filters = {
        servicePMTemplate: {
          operatorId: 36,
          value: [id + ''],
        },
        isPublished: { operatorId: 15, value: ['false'] },
      }
      return filters
    },
  },
}
</script>
