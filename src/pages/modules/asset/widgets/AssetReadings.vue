<template>
  <FContainer height="100%">
    <FTabs v-model="activeTab" :tabsList="tabs">
      <FTabPane
        v-for="(tab, index) in tabs"
        :activeKey="tab.value"
        :key="tab.value"
      >
        <AssetReadingList
          v-if="tab.isActive"
          :key="`${tab.name}${index}`"
          :type="tab.type"
          :url="tab.url"
          :isActive="tab.isActive"
          :assetId="details.id"
          :details="details"
          :portalName="widget.key + '-topbar'"
          :resize="resizeWidgetSize"
          :reset="resetWidgetSize"
          :moduleName="moduleName"
          :widget="widget"
          :label="tab.label"
        ></AssetReadingList>
      </FTabPane>
    </FTabs>
    <div class="widget-topbar-actions">
      <portal-target :name="widget.key + '-topbar'"></portal-target>
    </div>
  </FContainer>
</template>
<script>
import AssetReadingList from './AssetReadingList.vue'
import { FContainer, FText, FTabs, FTabPane } from '@facilio/design-system'
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
      activeTab: 'connected',
      defaultWidgetHeight: this.layoutParams.h,
    }
  },
  components: { AssetReadingList, FContainer, FText, FTabs, FTabPane },
  computed: {
    tabs() {
      let activeTab = this.activeTab
      return [
        {
          type: 'connected',
          name: 'connected',
          value: 'connected',
          label: this.$t('asset.readings.connected', { ns: 'asset' }),
          isActive: activeTab === 'connected',
        },
        {
          type: 'logged',
          name: 'logged',
          value: 'logged',
          label: this.$t('asset.readings.logged', { ns: 'asset' }),
          isActive: activeTab === 'logged',
        },
        {
          type: 'formula',
          name: 'formula',
          value: 'formula',
          label: this.$t('asset.readings.kpis', { ns: 'asset' }),
          isActive: activeTab === 'formula',
        },
        {
          type: 'available',
          name: 'available',
          value: 'available',
          label: this.$t('asset.readings.available', { ns: 'asset' }),
          isActive: activeTab === 'available',
        },
      ]
    },
  },
  methods: {
    resizeWidgetSize() {
      return new Promise(resolve => {
        this.resizeWidget({ h: 3 })
        this.$nextTick(resolve)
      })
    },
    resetWidgetSize() {
      return new Promise(resolve => {
        this.resizeWidget({ h: this.defaultWidgetHeight })
        this.$nextTick(resolve)
      })
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
