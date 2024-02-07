<template>
  <FContainer>
    <FTabs
      v-model="currentTab"
      :tabsList="tabsList"
      appearance="button"
      @change="setResourceType"
    >
      <FTabPane v-for="tabName in tabNames" :activeKey="tabName" :key="tabName">
        <FContainer display="flex" width="100%" height="calc(100vh - 100px)">
          <FContainer height="97%" width="100%" flex="1 0 0">
            <KpiOrResourceNameList
              :currentTab="currentTab"
              :listData="wrapperData"
              @changeRecord="setProperties"
            />
          </FContainer>
          <FContainer height="98%" width="100%" flex="3 0 0">
            <KpiOrResourceReadingDetails
              :listData="wrapperData"
              :currentTab="currentTab"
            />
          </FContainer>
        </FContainer>
      </FTabPane>
    </FTabs>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FSpinner,
  FTable,
  FText,
  FPagination,
  FEmptyState,
  FTabs,
  FTabPane,
} from '@facilio/design-system'
import KpiOrResourceNameList from './KpiOrResourceNameList.vue'
import KpiOrResourceReadingDetails from './KpiOrResourceReadingDetails.vue'
import { isEmpty } from '@facilio/utils/validation'
import { RESOURCE_TYPE_MODULE_NAME_MAP } from './util'
import { dset as setProperty } from 'dset'
export default {
  components: {
    FText,
    FSpinner,
    FPagination,
    FContainer,
    FEmptyState,
    FTable,
    FTabs,
    FTabPane,
    KpiOrResourceNameList,
    KpiOrResourceReadingDetails,
  },

  data() {
    return {
      wrapperData: {
        groupBy: 'kpi',
        frequencies: [],
        currentRecordId: -1,
        currentRecordName: null,
        resourceType: 1,
      },
      tabNames: ['kpi', 'asset', 'meter', 'site'],
      tabsList: [
        { label: this.$t('kpi_c', { ns: 'kpi' }), value: 'kpi' },
        { label: this.$t('asset', { ns: 'kpi' }), value: 'asset' },
        { label: this.$t('meter', { ns: 'kpi' }), value: 'meter' },
        { label: this.$t('site', { ns: 'kpi' }), value: 'site' },
      ],
      currentTab: 'kpi',
    }
  },
  methods: {
    async setProperties(value) {
      this.wrapperData = { ...this.wrapperData, ...value }
    },
    setResourceType() {
      let { currentTab, wrapperData } = this
      let { resourceType } = wrapperData || {}
      if (!isEmpty(resourceType)) {
        let resourceTypeMap = RESOURCE_TYPE_MODULE_NAME_MAP
        setProperty(
          'wrapperData.resourceType',
          Object.keys(resourceTypeMap).find(
            key => resourceTypeMap[key] === currentTab
          ),
          1
        )
      }
    },
  },
}
</script>
