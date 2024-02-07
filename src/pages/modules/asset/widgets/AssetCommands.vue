<template>
  <FContainer height="100%">
    <FTabs v-model="activeTab" :tabsList="tabs">
      <FTabPane v-for="tab in tabs" :activeKey="tab.value" :key="tab.value">
        <AssetControllableReadingList
          v-if="activeTab === 'readings'"
          :key="tab.name"
          :isActive="tab.isActive"
          :assetId="details.id"
          :details="details"
          :portalName="widget.key + '-topbar'"
          :moduleName="moduleName"
          :widget="widget"
        ></AssetControllableReadingList>
        <AssetCommandLogs
          v-if="activeTab === 'logs'"
          :key="tab.name"
          :isActive="tab.isActive"
          :assetId="details.id"
          :details="details"
          :portalName="widget.key + '-topbar'"
          :moduleName="moduleName"
          :widget="widget"
        ></AssetCommandLogs>
      </FTabPane>
    </FTabs>
    <div class="widget-topbar-actions">
      <portal-target :name="widget.key + '-topbar'"></portal-target>
    </div>
  </FContainer>
</template>
<script>
import { FContainer, FTabs, FTabPane } from '@facilio/design-system'
import AssetControllableReadingList from './AssetControllableReadingList.vue'
import AssetCommandLogs from './AssetCommandLogs.vue'
export default {
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'sectionKey',
    'widget',
    'resizeWidget',
    'moduleName',
  ],
  data() {
    return {
      activeTab: 'readings',
      defaultWidgetHeight: this.layoutParams.h,
    }
  },
  components: {
    AssetControllableReadingList,
    AssetCommandLogs,
    FContainer,
    FTabs,
    FTabPane,
  },
  computed: {
    tabs() {
      let activeTab = this.activeTab

      return [
        {
          name: 'readings',
          value: 'readings',
          label: this.$t('asset.commands.readings', { ns: 'asset' }),
          isActive: activeTab === 'readings',
        },
        {
          name: 'logs',
          value: 'logs',
          label: this.$t('asset.commands.logs', { ns: 'asset' }),
          isActive: activeTab === 'logs',
        },
      ]
    },
  },
}
</script>
<style>
.widget-topbar-actions {
  position: absolute;
  right: 15px;
  top: 45px;
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
