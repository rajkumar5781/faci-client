<template>
  <FContainer display="flex" flexDirection="column" height="100%">
    <KpiDetailsTable
      url="/v3/readingKpi/fetchReadings"
      :columns="computedKpiColumns"
      :listData="listData"
      :currentTab="currentTab"
      kpiType="computed"
    />

    <KpiDetailsTable
      url="/v3/readingKpi/fetchDynamicKpiReadings"
      :columns="realTimeColumns"
      :listData="listData"
      :currentTab="currentTab"
      kpiType="realtime"
    />
  </FContainer>
</template>

<script>
import { FContainer, FTable, FText, FPagination } from '@facilio/design-system'
import AdvancedSearch from '../../../components/search/AdvancedSearch.vue'
import { isEmpty } from '@facilio/utils/validation'
import { RESOURCE_TYPE_MAP } from './util'
import KpiDetailsTable from './KpiDetailsTable.vue'
import getProperty from 'dlv'
export default {
  props: ['currentTab', 'listData'],
  components: {
    FTable,
    FContainer,
    FText,
    AdvancedSearch,
    FPagination,

    KpiDetailsTable,
  },
  data() {
    return {
      computedKpiColumns: null,
      realTimeColumns: null,
      resourceTypeMap: RESOURCE_TYPE_MAP,
    }
  },
  computed: {
    currentRecordId() {
      let { listData = {} } = this
      let { currentRecordId = {} } = listData
      return currentRecordId
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let { currentTab = {}, resourceTypeMap = {}, listData = {} } = this
      let { resourceType = {} } = listData
      let dispName =
        currentTab === 'kpi'
          ? getProperty(
              resourceTypeMap,
              isEmpty(resourceType) ? '0' : resourceType.toString()
            )
          : this.$t('kpi_c', 'KPI', { ns: 'kpi' })

      this.realTimeColumns = [
        {
          displayName: dispName,
          name: 'name',
          id: 1,
        },
        {
          displayName: this.$t('analytics', 'Analytics', { ns: 'kpi' }),
          name: 'goToAnalytics',
          id: 2,
        },
      ]

      this.computedKpiColumns = [
        {
          displayName: dispName,
          name: 'name',
          id: 1,
        },
        {
          displayName: this.$t('current_value', 'Current Value', { ns: 'kpi' }),
          name: 'currentValue',
          id: 2,
        },
        {
          displayName: this.$t('last_recorded', 'Last Recorded', { ns: 'kpi' }),
          name: 'lastRecorded',
          id: 3,
        },
        {
          displayName: this.$t('analytics', 'Analytics', { ns: 'kpi' }),
          name: 'goToAnalytics',
          id: 4,
        },
      ]
    },
  },
}
</script>
