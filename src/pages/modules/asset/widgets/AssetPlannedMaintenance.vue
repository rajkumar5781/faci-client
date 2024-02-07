<template>
  <FContainer height="100%" display="flex" width="100%">
    <FTabs v-model="activeTab" :tabsList="tabs">
      <FTabPane v-for="tab in tabs" :activeKey="tab.value" :key="tab.value">
        <AssetWorkorderList
          :tabType="tab.type"
          :url="tab.url"
          :isActive="tab.isActive"
          :portalName="widget.key + '-topbar'"
          :goToSummary="goToSummary"
          :widget="widget"
          :resizeWidget="resizeWidget"
          title="No data available"
          description="Currently, there are no planned maintenance scheduled."
        ></AssetWorkorderList>
      </FTabPane>
    </FTabs>

    <div class="widget-topbar-actions">
      <portal-target :name="widget.key + '-topbar'"></portal-target>
    </div>

    <portal
      :to="`action-${widget.id}-${widget.name}`"
      class="portal-alignment-ws action-ws"
    >
      <!-- Enable this buttons once PPM v2 done -->
      <!--FContainer
        display="flex"
        gap="containerMedium"
        v-if="$access.hasPermission('planned:CREATE')"
      >
        <FButton appearance="secondary" size="small" @click="goToCalendar()">{{
          $t('asset.maintenance.show_calendar')
        }}</FButton>
        <FButton
          v-if="!decommission"
          appearance="secondary"
          size="small"
          @click="goToPmCreation()"
          >{{ $t('asset.maintenance.new_pm') }}</FButton
        >
      </FContainer-->
    </portal>
  </FContainer>
</template>

<script>
import getProperty from 'dlv'
import AssetWorkorderList from './AssetWorkorderList.vue'
import {
  FContainer,
  FDivider,
  FTabs,
  FTabPane,
  FButton,
} from '@facilio/design-system'

import { findRouteForModule, pageTypes } from '@facilio/router'

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
      activeTab: 'upcoming_pm',
    }
  },
  components: {
    AssetWorkorderList,
    FContainer,
    FDivider,
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
          type: 'upcoming',
          name: 'upcoming_pm',
          value: 'upcoming_pm',
          label: this.$t('asset.pm.upcoming', { ns: 'asset' }),
          url: this.upcomingPmUrl,
          isActive: this.activeTab === 'upcoming_pm',
        },
        {
          type: 'open',
          name: 'open_pm',
          value: 'open_pm',
          label: this.$t('asset.pm.open', { ns: 'asset' }),
          url: this.openPmUrl,
          isActive: this.activeTab === 'open_pm',
        },
        {
          type: 'closed',
          name: 'closed_pm',
          value: 'closed_pm',
          label: this.$t('asset.pm.closed', { ns: 'asset' }),
          url: this.closedPmUrl,
          isActive: this.activeTab === 'closed_pm',
        },
      ]
    },
    upcomingPmUrl() {
      let filters = encodeURIComponent(
        JSON.stringify({
          resource: { operatorId: 36, value: [this.details.id + ''] },
          sourceType: { operatorId: 9, value: ['5'] },
          createdTime: { operatorId: 73 },
        })
      )
      return `/v2/workorders/view/${this.moduleName}/all?filters=${filters}&fetchAllType=true&orderBy=createdTime&orderType=asc&overrideViewOrderBy=true`
    },
    openPmUrl() {
      let filters = encodeURIComponent(
        JSON.stringify({
          resource: { operatorId: 36, value: [this.details.id + ''] },
        })
      )
      return `/v2/workorders/view/${this.moduleName}/planned?filters=${filters}&includeParentFilter=true`
    },
    closedPmUrl() {
      let filters = encodeURIComponent(
        JSON.stringify({
          resource: { operatorId: 36, value: [this.details.id + ''] },
          sourceType: { operatorId: 9, value: ['5'] },
        })
      )
      return `/v2/workorders/view/${this.moduleName}/closed?filters=${filters}&includeParentFilter=true`
    },
    moduleName() {
      let { details } = this
      let { moduleName } = details || {}
      return moduleName
    },
  },
  methods: {
    goToPmCreation() {
      let { name } =
        findRouteForModule('preventivemaintenance', pageTypes.CREATE) || {}
      name && this.$router.push({ name })
    },
    goToSummary(wo) {
      let { name } = findRouteForModule('workorder', pageTypes.OVERVIEW) || {}
      if (name) {
        this.$router.push({
          name,
          params: { id: wo.id },
        })
      }
    },
  },
}
</script>
