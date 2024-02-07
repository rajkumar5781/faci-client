<template>
  <FContainer
    display="flex"
    flexDirection="column"
    borderRadius="high"
    border="1px solid"
    borderColor="borderNeutralGrey02Light"
    backgroundColor="backgroundMidgroundSubtle"
    paddingTop="containerXxLarge"
    marginTop="containerLarge"
    marginRight="containerXxLarge"
    height="100%"
    justifyContent="center"
  >
    <FContainer>
      <FContainer
        display="flex"
        justifyContent="center"
        flexDirection="column"
        borderBottom="1px solid"
        borderColor="borderNeutralBaseSubtler"
      >
        <FContainer
          v-show="showCategoryList"
          display="flex"
          paddingBottom="containerLarge"
          justifyContent="center"
          marginLeft="containerLarge"
          marginRight="containerLarge"
          v-if="currentTab !== 'kpi'"
        >
          <FContainer width="100%">
            <Lookup
              v-model="assetCategoryId"
              :hideLookupIcon="true"
              :isClearable="false"
              :field="getLookupFieldForFilter"
              size="medium"
              @input="loadNameList"
              @optionsLoadedOnce="init"
            />
          </FContainer>
        </FContainer>
        <FContainer
          v-else
          display="flex"
          paddingBottom="containerLarge"
          marginLeft="containerLarge"
          marginRight="containerLarge"
          alignItems="center"
        >
          <FContainer width="100%">
            <FSelect
              :options="resourceTypes"
              v-model="listData.resourceType"
              :placeholder="
                $t('select_resource_type', 'Select Resource Type', {
                  ns: 'kpi',
                })
              "
              :disabled="false"
              :clearable="false"
              filterable
              size="medium"
              @input="loadNameList"
            />
          </FContainer>
        </FContainer>
        <FContainer
          display="flex"
          paddingBottom="containerLarge"
          justifyContent="center"
          marginLeft="containerLarge"
          marginRight="containerLarge"
          v-if="currentTab === 'kpi'"
        >
          <FContainer width="100%">
            <FSelect
              :options="frequencies"
              v-model="listData.frequencies"
              :placeholder="
                $t('select_frequencies', 'Select Frequencies', {
                  ns: 'kpi',
                })
              "
              :clearable="true"
              :multiple="true"
              filterable
              size="medium"
              @input="loadNameList"
            />
          </FContainer>
        </FContainer>
        <FContainer
          display="flex"
          justifyContent="center"
          paddingBottom="containerLarge"
          marginLeft="containerLarge"
          marginRight="containerLarge"
        >
          <FContainer width="100%">
            <FInput
              :placeholder="searchPlaceholder"
              :disabled="false"
              v-model="searchText"
              appearance="default"
              size="medium"
              @input="quickSearch"
              wrap
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer
      paddingTop="containerXLarge"
      paddingBottom="containerLarge"
      paddingRight="containerXXLarge"
      overflow="scroll"
      flexGrow="1"
    >
      <FContainer
        v-if="isRecordsEmpty"
        display="flex"
        flexDirection="column"
        backgroundColor="backgroundMidgroundSubtle"
        height="100%"
      >
        <FEmptyState
          illustration="end-of-list"
          size="S"
          :title="getEmptyTitle"
          :vertical="true"
          type="narrow"
        ></FEmptyState>
      </FContainer>
      <FContainer
        @click="changeRecord(record)"
        v-for="record in records"
        :key="`record-${record.id}`"
        marginRight="containerXLarge"
        marginLeft="containerXLarge"
        marginTop="containerMedium"
        padding="containerLarge containerXLarge"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        minHeight="40px"
        :backgroundColor="recordBackGroundColor(record)"
        borderRadius="high"
      >
        <FTooltip placement="bottom" :mouseEnterDelay="0.25">
          <template #title>{{ getProperty(record, 'name') }}</template>
          <FText
            appearance="headingMed14"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            width="175px"
            cursor="pointer"
          >
            {{ getProperty(record, 'name') }}
          </FText>
        </FTooltip>
        <FContainer
          v-if="currentTab === 'kpi'"
          display="flex"
          justifyContent="center"
        >
          <FTags
            appearance="accent"
            :text="getKpiTypeName(record)"
            :accentColor="getAccentColor(record)"
            accentLevel="L2"
          />
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="containerLarge containerXLarge"
      borderTop="1px solid"
      borderColor="borderNeutralBaseSubtler"
      height="45px"
    >
      <FPagination
        v-if="showPagination"
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
import {
  FContainer,
  FPagination,
  FInput,
  FText,
  FSelect,
  FPopover,
  FButton,
  FEmptyState,
  FTags,
  FTooltip,
} from '@facilio/design-system'
import { Lookup } from '@facilio/ui/new-forms'
import debounce from 'lodash/debounce'
import { isEmpty } from '@facilio/utils/validation'
import {
  getFromTabInfo,
  RESOURCE_TYPES,
  RESOURCE_TYPE_MAP,
  KPI_TYPES,
} from './util'
import getProperty from 'dlv'

const frequencies = [
  { value: 1, label: '1 Min' },
  { value: 2, label: '2 Mins' },
  { value: 3, label: '3 Mins' },
  { value: 4, label: '4 Mins' },
  { value: 5, label: '5 Mins' },
  { value: 6, label: '10 Mins' },
  { value: 7, label: '15 Mins' },
  { value: 8, label: '20 Mins' },
  { value: 9, label: '30 Mins' },
  { value: 10, label: '1 Hr' },
  { value: 11, label: '2 Hr' },
  { value: 12, label: '3 Hr' },
  { value: 13, label: '4 Hr' },
  { value: 14, label: '8 Hr' },
  { value: 15, label: '12 Hr' },
  { value: 16, label: '1 Day' },
  { value: 17, label: 'Weekly ' },
  { value: 18, label: 'Monthly ' },
  { value: 19, label: 'Quarterly ' },
  { value: 20, label: 'Half Yearly' },
  { value: 21, label: 'Annually ' },
]

const assetCatLookupField = {
  isDataLoading: false,
  options: [],
  config: {},
  lookupModuleName: 'assetcategory',
  field: {
    lookupModule: {
      name: 'assetcategory',
      displayName: 'Asset Category',
    },
  },
  multiple: false,
  selectedItems: [],
}

const utilityTypeLookupField = {
  isDataLoading: false,
  options: [],
  config: {},
  lookupModuleName: 'utilityType',
  field: {
    lookupModule: {
      name: 'utilityType',
      displayName: 'Utility Type',
    },
  },
  multiple: false,
  selectedItems: [],
}

const siteLookupField = {
  isDataLoading: false,
  options: [],
  config: {},
  lookupModuleName: 'site',
  field: {
    lookupModule: {
      name: 'site',
      displayName: 'Site',
    },
  },
  multiple: false,
  selectedItems: [],
}

export default {
  props: ['currentTab', 'listData'],
  components: {
    FContainer,
    Lookup,
    FPagination,
    FInput,
    FText,
    FSelect,
    FButton,
    FPopover,
    FEmptyState,
    FTags,
    FTooltip,
  },
  watch: {
    currentTab() {
      this.changeGroupBy()
    },
  },
  data() {
    return {
      noData: false,
      page: 1,
      perPage: 20,
      recordCount: null,
      assetCategoryId: null,
      searchText: null,
      records: [],
      assetCatLookupField: assetCatLookupField,
      utilityTypeLookupField: utilityTypeLookupField,
      siteLookupField: siteLookupField,
      resourceTypes: RESOURCE_TYPES,
      frequencies: frequencies,
      resourceTypeMap: RESOURCE_TYPE_MAP,
    }
  },
  computed: {
    quickSearch() {
      return debounce(this.loadNameList, 500)
    },
    searchPlaceholder() {
      let { currentTab } = this
      let name = getFromTabInfo(currentTab, 'name')
      return this.$t('search_placeholder', { ns: 'kpi', name })
    },
    isRecordsEmpty() {
      let { records } = this
      return isEmpty(records)
    },
    getEmptyTitle() {
      let { currentTab = '' } = this
      if (currentTab === 'kpi') {
        return this.$t('no_kpis_available', { ns: 'kpi' })
      }
      let resourceName = getFromTabInfo(currentTab, 'moduleDisplayName')
      return this.$t('no_resource_available', {
        ns: 'kpi',
        resourceName,
      })
    },
    getLookupFieldForFilter() {
      let {
        currentTab,
        assetCatLookupField,
        utilityTypeLookupField,
        siteLookupField,
      } = this
      switch (currentTab) {
        case 'asset':
          return assetCatLookupField
        case 'meter':
          return utilityTypeLookupField
        case 'site':
          return siteLookupField
      }
      return assetCatLookupField
    },
    showCategoryList() {
      let { currentTab } = this
      return currentTab !== 'site'
    },
    showPagination() {
      let { perPage, recordCount } = this
      return !isEmpty(recordCount) && recordCount !== 0 && recordCount > perPage
    },
  },
  created() {
    let { currentTab } = this
    if (currentTab === 'kpi') {
      this.init()
    }
  },
  methods: {
    getProperty,
    init() {
      this.setCategoryId()
      this.loadNameList()
    },
    changeRecord(record) {
      let { id, name, kpiType } = record || {}

      this.setCurrentRecord(record)
      this.$emit('changeRecord', {
        currentRecordId: id,
        currentRecordName: name,
        currentKpiType:
          kpiType === KPI_TYPES['realtime'] ? 'realtime' : 'computed',
      })
    },
    getKpiTypeName(record) {
      let { kpiType = 1 } = record
      return kpiType === KPI_TYPES['realtime']
        ? this.$t('realtime', { ns: 'kpi' })
        : this.$t('computed', { ns: 'kpi' })
    },
    getAccentColor(record) {
      let { kpiType = 1 } = record
      return kpiType === KPI_TYPES['realtime'] ? 'yellow' : 'violet'
    },

    recordBackGroundColor(record) {
      let { listData: { currentRecordId } = {} } = this
      let { id } = record || {}
      return currentRecordId === id
        ? 'backgroundMidgroundDark'
        : 'backgroundMidgroundSubtle'
    },
    setCurrentRecord(record) {
      let { id, name, kpiType } = record || {}
      let updatedRecord = {
        currentRecordId: id,
        currentRecordName: name,
        currentKpiType: kpiType,
      }

      this.listData = { ...this.listData, ...updatedRecord }
    },
    changeGroupBy() {
      this.listData.frequencies = null
      this.searchText = null
      this.page = 1
      this.loadNameList()
    },
    async loadNameList() {
      let { currentTab, page, perPage, searchText, listData, assetCategoryId } =
        this

      if (currentTab !== 'kpi' && isEmpty(assetCategoryId)) {
        return
      }

      let moduleName = getFromTabInfo(currentTab, 'moduleName')
      let url = 'v3/readingKpi/fetchNamesForAnalytics'
      let { frequencies, resourceType } = listData || {}

      let params = {
        page,
        perPage,
        searchText,
        frequencies,
        assetCategoryId,
        resourceType,
        moduleName,
      }
      this.isLoading = true
      let { data, error } = await API.get(url, params)
      if (isEmpty(error)) {
        let { result = {} } = data
        let { records = [], recordCount = {} } = result
        this.records = records
        if (!isEmpty(recordCount)) this.recordCount = recordCount
        if (!isEmpty(records)) {
          this.setCurrentRecord(records[0])
          this.noData = false
        } else {
          this.noData = true
          this.setCurrentRecord({ id: 0, name: null, kpiType: null })
        }
        this.$emit('changeRecord', this.serializeListData())
      }
      this.isLoading = false
    },
    setCategoryId() {
      let { getLookupFieldForFilter = {} } = this
      let { options = [] } = getLookupFieldForFilter
      this.assetCategoryId = getProperty(options[0], 'value', -1)
    },
    serializeListData() {
      let { listData } = this
      let { currentKpiType } = listData || {}
      return {
        ...listData,
        currentKpiType: currentKpiType === 3 ? 'realtime' : 'computed',
      }
    },
    async loadNextPage(page) {
      this.page = page
      await this.loadNameList()
    },
  },
}
</script>
