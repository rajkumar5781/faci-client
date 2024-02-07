<template>
  <FContainer>
    <FModal
      :title="title"
      :visible="true"
      :saveText="saveText"
      size="L"
      :hideFooter="false"
      @ok="updateSelectedRecord"
      @cancel="cancel"
      padding="containerNone"
    >
      <FContainer>
        <FContainer
          v-if="showLoading"
          height="510px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          padding="sectionLarge"
        >
          <FSpinner :size="30" />
        </FContainer>
        <FContainer
          v-if="isEmpty(recordList)"
          height="510px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FEmptyState
            :title="
              $t('inventory.no_data_available', {
                ns: 'inventory',
              })
            "
            vertical
            size="M"
            illustration="add-item"
          ></FEmptyState>
        </FContainer>
        <FContainer v-else minHeight="510px">
          <FContainer
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            padding="containerXLarge sectionSmall"
          >
            <FText
              v-if="!showLoading && !isEmpty(recordList)"
              color="textMain"
              appearance="headingMed14"
              >{{ `${displayCount} of ${recordCount} Records` }}</FText
            >
            <FContainer display="flex">
              <FPagination
                :currentPage="page"
                :total="recordCount"
                :perPage="perPage"
                @nextClick="currentChange"
                @prevClick="currentChange"
                @currentChange="currentChange"
              ></FPagination>

              <AdvancedSearch
                :key="`filter-${wizardModuleName}`"
                :moduleName="wizardModuleName"
                :moduleDisplayName="wizardModuleDisplayName"
                :hideQuery="true"
                :filterList="appliedFilter"
                :onSave="setAppliedfilter"
              ></AdvancedSearch>
            </FContainer>
          </FContainer>
          <CommonList
            :viewDetail="viewDetail"
            :records="recordList"
            :moduleName="wizardModuleName"
            :slotList="slotList"
            :hideListSelect="true"
            :selectType="selectType"
            @recordSelected="tableRowClick"
          >
          </CommonList>
        </FContainer>
      </FContainer>
    </FModal>
  </FContainer>
</template>

<script>
import AdvancedSearch from '../../../../../components/search/AdvancedSearch.vue'
import { CustomModuleData } from '../../../../../data/CustomModuleData'
import { getUnRelatedModuleList } from '/src/utils/relatedFieldUtil.js'
import {
  FContainer,
  FModal,
  FEmptyState,
  ftoast,
  FText,
  FPagination,
  FSpinner,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty, isArray, isFunction } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { CommonList } from '@facilio/ui/new-app'

export default {
  props: ['config', 'selectedLookupModuleId', 'currentModuleName'],
  components: {
    AdvancedSearch,
    CommonList,
    FContainer,
    FText,
    FModal,
    FPagination,
    FSpinner,
    FEmptyState,
  },
  data() {
    return {
      appliedFilter: {},
      recordList: [],
      recordCount: null,
      page: 1,
      currentPageCount: 0,
      isListLoading: false,
      viewDetail: {},
      viewLoading: false,
      selectedRecordId: null,
      showColumnSettings: false,
      selectedRecords: null,
      hideFooter: true,
      isEmpty,
    }
  },
  created() {
    this.loadViewDetails()
    this.refreshRecordList()

    if (!isEmpty(this.selectedLookupModuleId))
      this.selectedRecordId = this.selectedLookupModuleId
  },
  computed: {
    displayCount() {
      let { currentPageCount, perPage, page } = this
      return (page - 1) * perPage + currentPageCount
    },
    title() {
      let { wizardModuleDisplayName, wizardModuleName } = this
      return `Select ${wizardModuleDisplayName || wizardModuleName}`
    },
    saveText() {
      let { config } = this
      let { saveText = 'Next' } = config || {}
      return saveText
    },
    wizardModuleName() {
      return this.config?.lookupModuleName
    },
    wizardModuleDisplayName() {
      return this.config?.lookupModuleDisplayName
    },
    perPage() {
      return this.config?.perPage || 8
    },
    selectType() {
      let { config } = this
      let { selectType = 'single' } = config || {}
      return selectType
    },
    slotList() {
      return [
        {
          name: 'selection',
          isHardcodedColumn: true,
          columnAttrs: {
            width: 60,
            fixed: 'left',
          },
        },
      ]
    },
    modelDataClass() {
      return CustomModuleData
    },
    showLoading() {
      return this.viewLoading || this.isListLoading
    },
    canShowPagination() {
      let { recordCount, recordList, appliedFilter } = this
      return (
        !isEmpty(recordCount) || !isEmpty(recordList) || !isEmpty(appliedFilter)
      )
    },
    canShowColumnConfig() {
      return !!this.config?.canShowColumnConfig
    },
    viewname() {
      return this.config?.viewname || 'hidden-all'
    },
  },
  methods: {
    currentChange(page) {
      this.page = page
      this.loadRecords()
    },
    async refreshRecordList(force = false) {
      await this.loadRecords(force)
      await this.loadRecordCount(force)
    },

    async loadViewDetails() {
      let { wizardModuleName: moduleName, viewname } = this
      let { getViewDetails } = this.config || {}
      let response = {}

      this.viewLoading = true
      try {
        if (isFunction(getViewDetails)) {
          response = await getViewDetails()
        } else {
          response = await API.get(`v2/views/${moduleName}/${viewname}`, {
            moduleName,
          })
        }
        let { error, data } = response || {}

        if (error) {
          throw error
        } else {
          this.viewDetail = data?.viewDetail || {}
        }
      } catch (errorMsg) {
        ftoast.critical(
          errorMsg ||
            this.$t('approvals.cannot_fetch_view_details', {
              ns: 'approvals',
            })
        )
      }
      this.viewLoading = false
    },

    async loadRecords(force = false) {
      let {
        wizardModuleName: unRelatedModuleName,
        currentModuleName: moduleName,
        viewname,
        page,
        perPage,
        appliedFilter = {},
        searchText,
      } = this
      let {
        getRecordList,
        additionalParams = {},
        additionalFilters = {},
      } = this.config || {}
      let recordList = []
      let filters = { ...appliedFilter, ...additionalFilters }
      this.isListLoading = true
      try {
        if (isFunction(getRecordList)) {
          recordList = await getRecordList({
            page,
            filters,
            search: searchText || null,
            force,
          })
          this.recordList = recordList
        } else {
          let params = {
            viewName: viewname,
            filters: JSON.stringify(filters),
            page,
            perPage,
            force,
            withCount: true,
            search: searchText || null,
            ...additionalParams,
          }

          let { error, list, meta } = await getUnRelatedModuleList(
            moduleName,
            unRelatedModuleName,
            params
          )
          if (error) {
            throw error
          }
          this.recordList = isArray(list) ? list : []
          this.recordCount = getProperty(meta, 'pagination.totalCount', null)
        }

        this.currentPageCount = this.recordList.length
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Unable to fetch moduleList')
      }
      this.isListLoading = false
    },

    async loadRecordCount(force = false) {
      let { appliedFilter = {}, searchText } = this
      let { getRecordCount, additionalFilters = {} } = this.config || {}
      if (!isFunction(getRecordCount)) {
        return
      }
      let recordCount = null
      let filters = { ...appliedFilter, ...additionalFilters }
      try {
        recordCount = await getRecordCount({
          filters,
          search: searchText,
          force,
        })
        this.recordCount = recordCount
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Unable to fetch count')
      }
    },

    setAppliedfilter({ filters }) {
      this.appliedFilter = filters || {}
      this.page = 1
      this.refreshRecordList(true)
    },
    async refreshView() {
      this.showColumnSettings = false
      await this.loadViewDetails()
    },
    tableRowClick(selectedItems) {
      if (this.selectType == 'single') {
        let { id } = selectedItems || {}
        this.selectedRecordId = id
      } else {
        this.selectedRecords = selectedItems
      }
    },
    async updateSelectedRecord() {
      let { recordList, selectedRecordId, selectedRecords, selectType } = this

      if (selectType == 'single') {
        let record = recordList.find(record => record.id === selectedRecordId)
        this.$emit('onSave', record)
      } else {
        this.$emit('onSave', selectedRecords)
      }
      this.$emit('onClose')
    },
    cancel() {
      this.$emit('onCancel')
    },
  },
}
</script>
