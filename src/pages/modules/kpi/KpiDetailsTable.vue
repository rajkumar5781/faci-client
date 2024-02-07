<template>
  <FContainer
    v-if="showComponent"
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
    borderRadius="high"
    border="1px solid"
    borderColor="borderNeutralGrey02Light"
    backgroundColor="backgroundMidgroundSubtle"
    marginTop="containerLarge"
    marginRight="sectionSmall"
    height="100%"
  >
    <FContainer
      height="15%"
      max-height="45px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderBottom="1px solid"
      borderColor="borderNeutralGrey02Light"
      padding="containerLarge containerXLarge"
    >
      <FText appearance="headingMed14">{{ tableHeader }}</FText>
      <AdvancedSearch
        v-if="showFilter"
        :filters="filters"
        :hideQuery="true"
        :moduleName="advSearchModuleName"
        :moduleDisplayName="advSearchModuleDispName"
        :onSave="onSearchSave"
      />
    </FContainer>

    <FContainer height="1px" flexGrow="1">
      <FContainer
        v-if="isLoading"
        height="100%"
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FSpinner :size="40" />
      </FContainer>
      <FTable
        v-else-if="showTable"
        :columns="columns"
        :hideBorder="true"
        :rounded="false"
        :data="records"
      >
        <template #[`cell.currentValue`]="{ row }">
          <FText>{{ getCurrentValue(row) }}</FText>
        </template>
        <template #[`cell.lastRecorded`]="{ row }">
          <FText>{{ getTimeFromNow(row) }}</FText>
        </template>
        <template #[`cell.goToAnalytics`]="{ row }">
          <FButton appearance="link" @click="analyse(row)">
            {{ $t('asset.readings.analyse', { ns: 'asset' }) }}
          </FButton>
        </template>
      </FTable>
      <FContainer
        v-else-if="showNoData"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="backgroundMidgroundSubtle"
        marginTop="containerLarge"
        marginRight="sectionSmall"
        height="100%"
      >
        <FEmptyState
          illustration="no-data"
          size="M"
          :title="getEmptyTitle"
        ></FEmptyState
      ></FContainer>
    </FContainer>
    <FContainer
      height="15%"
      max-height="45px"
      display="flex"
      justifyContent="flex-start"
      alignItems="center"
      padding="containerLarge containerXLarge"
      borderTop="1px solid"
      borderColor="borderNeutralBaseSubtler"
    >
      <FPagination
        v-if="showFilter && recordCount > perPage"
        :total="recordCount"
        :pageSize="perPage"
        :currentPage="page"
        :disabled="false"
        @update:currentPage="loadNextPage"
      />
    </FContainer>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import {
  FContainer,
  FTable,
  FText,
  FPagination,
  FSpinner,
  FEmptyState,
  FButton,
} from '@facilio/design-system'
import { fromNow } from '../../../utils/formatter'
import AdvancedSearch from '../../../components/search/AdvancedSearch.vue'
import { isEmpty } from '@facilio/utils/validation'
import {
  getFromTabInfo,
  RESOURCE_TYPE_MAP,
  RESOURCE_TYPE_MODULE_NAME_MAP,
} from './util'
import getProperty from 'dlv'
import { goToAnalytics } from '/src/pages/analytics/util.js'

export default {
  props: ['url', 'currentTab', 'columns', 'listData', 'kpiType'],
  components: {
    FTable,
    FContainer,
    FText,
    AdvancedSearch,
    FPagination,
    FSpinner,
    FEmptyState,
    FButton,
  },
  data() {
    return {
      isLoading: false,
      page: 1,
      perPage: 20,
      records: [],
      recordCount: null,
      filters: null,
      created: false,
      resourceTypeMap: RESOURCE_TYPE_MAP,
      resourceTypeModuleNameMap: RESOURCE_TYPE_MODULE_NAME_MAP,
    }
  },
  computed: {
    showTable() {
      let { isRecordsEmpty = {}, isLoading = {} } = this
      return !isRecordsEmpty && !isLoading
    },
    showNoData() {
      let { isRecordsEmpty = {}, isLoading = {} } = this
      return isRecordsEmpty && !isLoading
    },
    showComponent() {
      let { currentTab, currentKpiType, kpiType } = this
      if (currentTab === 'kpi') {
        return currentKpiType === kpiType
      }
      return true
    },
    tableHeader() {
      let { currentTab = {}, listData = {}, kpiType = {} } = this
      let { currentRecordName = {} } = listData
      if (currentTab === 'kpi') {
        return currentRecordName
      } else if (kpiType === 'realtime') {
        return this.$t('summary.realtime_kpi', 'Real Time KPI', {
          ns: 'kpi',
        })
      }
      return this.$t('computed_kpi', 'Computed KPI', { ns: 'kpi' })
    },
    currentRecordId() {
      let { listData = {} } = this
      let { currentRecordId = {} } = listData
      return currentRecordId
    },
    currentRecordName() {
      let { listData = {} } = this
      let { currentRecordName = {} } = listData
      return currentRecordName
    },
    currentKpiType() {
      let { listData = {} } = this
      let { currentKpiType = {} } = listData
      return currentKpiType
    },
    resourceType() {
      let { listData = {} } = this
      let { resourceType = {} } = listData
      return resourceType
    },
    advSearchModuleName() {
      let { currentTab, resourceType, resourceTypeModuleNameMap } = this
      return currentTab === 'kpi'
        ? getProperty(
            resourceTypeModuleNameMap,
            isEmpty(resourceType) ? '0' : resourceType.toString()
          )
        : 'readingkpi'
    },
    advSearchModuleDispName() {
      let { currentTab, resourceType, resourceTypeMap } = this
      return currentTab === 'kpi'
        ? getProperty(
            resourceTypeMap,
            isEmpty(resourceType) ? '0' : resourceType.toString()
          )
        : 'Reading KPI'
    },

    isRecordsEmpty() {
      let { records } = this
      return isEmpty(records)
    },
    getEmptyTitle() {
      let { currentTab, resourceTypeMap, resourceType } = this
      if (currentTab === 'kpi') {
        let resourceName = getProperty(
          resourceTypeMap,
          isEmpty(resourceType) ? '0' : resourceType.toString()
        )
        return this.$t('no_resource_available', {
          ns: 'kpi',
          resourceName,
        })
      }
      return this.kpiType === 'realtime'
        ? this.$t('no_rt_kpis_available', 'No RealTime KPIs Available', {
            ns: 'kpi',
          })
        : this.$t('no_comp_kpis_available', 'No Computed KPIs Available', {
            ns: 'kpi',
          })
    },
    showFilter() {
      let { recordCount } = this
      return !isEmpty(recordCount) && recordCount !== 0
    },
  },
  watch: {
    currentRecordId: {
      handler(value) {
        if (!isEmpty(value) && value === 0) {
          this.recordCount = 0
          this.records = []
        } else if (!isEmpty(value) && value !== -1) {
          this.records = null
          this.recordCount = 0
          this.loadData()
        }
      },
    },
  },
  methods: {
    onSearchSave(obj) {
      let { filters = {} } = obj
      this.filters = filters
      this.loadData()
    },
    getTimeFromNow(row) {
      let { ttime = {} } = row
      return fromNow(ttime)
    },
    getCurrentValue(row) {
      let { value = {}, unitLabel = {} } = row
      return isEmpty(unitLabel)
        ? `${parseFloat(value).toFixed(2)}`
        : `${parseFloat(value).toFixed(2)} ${unitLabel}`
    },
    async loadData() {
      let { url, filters } = this
      let {
        currentTab,
        currentRecordId,
        page,
        perPage,
        currentKpiType,
        kpiType,
        advSearchModuleName,
      } = this

      if (currentTab === 'kpi' && currentKpiType !== kpiType) {
        return
      }
      let params = {
        groupBy: currentTab,
        recordId: currentRecordId,
        page,
        perPage,
        filters: JSON.stringify(filters),
        searchModuleName: advSearchModuleName,
      }
      this.isLoading = true
      if (currentRecordId <= 0) {
        this.isLoading = false
        return
      }
      let { data, error } = await API.get(url, params)
      if (isEmpty(error)) {
        let { result = {} } = data
        let { records = {}, recordCount = {} } = result
        this.records = records
        if (!isEmpty(recordCount)) this.recordCount = recordCount
      } else {
        let { message = {} } = error
        ftoast.critical(message || this.$t('error_occurred', { ns: 'kpi' }))
      }
      this.isLoading = false
    },
    async loadNextPage(page) {
      let { created } = this
      if (created) {
        this.page = page
        await this.loadData()
      } else this.created = true
    },
    analyse(row) {
      let { currentKpiType } = this
      let { resourceId, categoryId, parentModuleName, readingField } = row || {}

      if (currentKpiType !== 'realtime') {
        goToAnalytics(
          { field: readingField },
          {
            id: resourceId,
            categoryId,
            parentModuleName,
            moduleName: this.getModuleNameForAnalytics(),
          }
        )
      }
    },
    getModuleNameForAnalytics() {
      let { resourceTypeModuleNameMap, currentTab, resourceType } = this
      return currentTab === 'kpi'
        ? getProperty(
            resourceTypeModuleNameMap,
            isEmpty(resourceType) ? '0' : resourceType.toString()
          )
        : currentTab
    },
  },
}
</script>
