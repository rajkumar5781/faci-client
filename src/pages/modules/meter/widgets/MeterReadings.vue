<template>
  <FContainer class="h-full">
    <FTabs v-model="activeTab" :tabsList="tabs">
      <FTabPane
        v-for="(tab, index) in tabs"
        :activeKey="tab.value"
        :key="tab.value"
      >
        <MeterReadingsList
          v-if="tab.isActive"
          :key="`${tab.name}${index}`"
          :type="tab.type"
          :url="tab.url"
          :isActive="tab.isActive"
          :meterId="details.id"
          :details="details"
          :portalName="widget.key + '-topbar'"
          :resize="resizeWidgetSize"
          :reset="resetWidgetSize"
          :moduleName="moduleName"
          :widget="widget"
        ></MeterReadingsList>
      </FTabPane>
    </FTabs>
    <FContainer
      position="absolute"
      right="15px"
      top="45px"
      display="flex"
      flex-direction="row"
      align-items="center"
    >
      <portal-target :name="widget.key + '-topbar'"></portal-target>
    </FContainer>
  </FContainer>
</template>
<script>
import MeterReadingsList from './MeterReadingsList.vue'
import { FContainer, FTabs, FTabPane } from '@facilio/design-system'
import getProperty from 'dlv'

export default {
  components: { MeterReadingsList, FContainer, FTabs, FTabPane },
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'sectionKey',
    'widget',
    'resizeWidget',
    'moduleName',
    'fitToViewArea',
  ],
  data() {
    return {
      activeTab: 'logged',
      defaultWidgetHeight: this.layoutParams.h,
    }
  },
  created() {
    this.getActiveTab()
    this.fitToViewArea()
  },
  computed: {
    tabs() {
      let { activeTab, details } = this
      let meterType = getProperty(details, 'meterTypeEnum', 'VIRTUAL')

      if (meterType === 'VIRTUAL') {
        return [
          {
            type: 'logged',
            name: 'logged',
            value: 'logged',
            label: this.$t('meter.readings.logged', { ns: 'energy' }),
            isActive: activeTab === 'logged',
          },
          {
            type: 'formula',
            name: 'formula',
            value: 'formula',
            label: this.$t('meter.readings.kpi', { ns: 'energy' }),
            isActive: activeTab === 'formula',
          },
        ]
      } else {
        return [
          {
            type: 'connected',
            name: 'connected',
            value: 'connected',
            label: this.$t('meter.readings.connected', { ns: 'energy' }),
            isActive: activeTab === 'connected',
          },
          {
            type: 'logged',
            name: 'logged',
            value: 'logged',
            label: this.$t('meter.readings.logged', { ns: 'energy' }),
            isActive: activeTab === 'logged',
          },
          {
            type: 'formula',
            name: 'formula',
            value: 'formula',
            label: this.$t('meter.readings.kpi', { ns: 'energy' }),
            isActive: activeTab === 'formula',
          },
          {
            type: 'available',
            name: 'available',
            value: 'available',
            label: this.$t('meter.readings.available', { ns: 'energy' }),
            isActive: activeTab === 'available',
          },
        ]
      }
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
    getActiveTab() {
      let { details } = this
      let meterType = getProperty(details, 'meterTypeEnum', 'VIRTUAL')
      if(meterType === 'PHYSICAL') {
        this.activeTab = 'connected'
      }
    },
  },
}
</script>
