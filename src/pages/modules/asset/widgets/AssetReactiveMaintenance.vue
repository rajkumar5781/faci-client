<template>
  <FContainer height="100%">
    <FTabs v-model="activeTab" :tabsList="tabs">
      <FTabPane v-for="tab in tabs" :activeKey="tab.value" :key="tab.value">
        <AssetWorkorderList
          :moduleName="`workorder`"
          :tabType="tab.type"
          :details="details"
          :url="tab.url"
          :isActive="tab.isActive"
          :portalName="widget.key + '-topbar'"
          :goToSummary="goToSummary"
          :widget="widget"
          :resizeWidget="resizeWidget"
        ></AssetWorkorderList>
      </FTabPane>
    </FTabs>
    <div class="widget-topbar-actions">
      <portal-target :name="widget.key + '-topbar'"></portal-target>
    </div>
  </FContainer>
</template>

<script>
import AssetWorkorderList from './AssetWorkorderList.vue'
import { FContainer, FTabs, FTabPane, FButton } from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import dlv from 'dlv'
import getProperty from 'dlv'

export default {
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'sectionKey',
    'resizeWidget',
    'widget',
  ],
  data() {
    return {
      activeTab: 'open_wo',
    }
  },
  components: {
    AssetWorkorderList,
    FContainer,
    FTabs,
    FTabPane,
    FButton,
  },
  computed: {
    decommission() {
      return getProperty(this, 'details.decommission', false)
    },
    tabs() {
      return [
        {
          type: 'open',
          name: 'open_wo',
          value: 'open_wo',
          label: this.$t('asset.reactive.open', { ns: 'asset' }),
          url: this.openWoUrl,
          isActive: this.activeTab === 'open_wo',
        },
        {
          type: 'closed',
          name: 'closed_wo',
          value: 'closed_wo',
          label: this.$t('asset.reactive.closed', { ns: 'asset' }),
          url: this.closeWoUrl,
          isActive: this.activeTab === 'closed_wo',
        },
      ]
    },
    openWoUrl() {
      let filters = encodeURIComponent(
        JSON.stringify({
          resource: { operatorId: 36, value: [this.details.id + ''] },
        })
      )
      return `/v2/workorders/view/${this.moduleName}/unplanned?filters=${filters}&includeParentFilter=true`
    },
    closeWoUrl() {
      let filters = encodeURIComponent(
        JSON.stringify({
          resource: { operatorId: 36, value: [this.details.id + ''] },
          sourceType: { operatorId: 10, value: ['5'] },
        })
      )
      return `/v2/workorders/view/${this.moduleName}/closed?filters=${filters}&includeParentFilter=true`
    },
    moduleName() {
      return dlv(this, 'details.moduleName')
    },
  },
  methods: {
    goToSummary(wo) {
      let { name } = findRouteForModule('workorder', pageTypes.OVERVIEW) || {}

      if (name) {
        this.$router.push({
          name,
          params: { viewname: 'all', id: wo.id },
        })
      }
    },
  },
}
</script>
