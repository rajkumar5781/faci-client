<template>
  <FContainer :height="showLoading ? 'fit-content' : '100%'">
    <portal :to="actionPortal">
      <FContainer display="flex" alignItems="center">
        <MainFieldSearch
          v-if="!isEmpty(recordList) || !isEmpty(searchText)"
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch>
        <template v-if="!isEmpty(recordList)">
          <FDivider height="24px" style="margin: 0px 12px" />
          <ColumnCustomization
            :moduleName="moduleName"
            :parentModuleName="currentModuleName"
            :viewName="viewname"
            :viewFields="viewFields"
            @refreshRelatedList="reloadData"
          ></ColumnCustomization>
        </template>
      </FContainer>
    </portal>
    <FContainer
      v-if="showLoading"
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FContainer v-else-if="isEmpty(recordList)" height="100%" display="flex">
      <FEmptyState
        :title="emptyStateText"
        illustration="no-entries"
        :vertical="true"
        size="S"
        class="grow"
      ></FEmptyState>
    </FContainer>
    <CommonList
      v-else-if="!isEmpty(recordList)"
      :viewDetail="viewDetail"
      :records="recordList"
      :slotList="[]"
      :hideBorder="true"
      :orgDetails="orgDetails"
      :getRoute="getRoute"
      selectType=""
      :mainFieldAction="mainFieldAction"
      @redirectToSummary="redirectToSummary"
    >
    </CommonList>
    <portal v-if="recordCount > 0 || !isEmpty(recordList)" :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <FPagination
          :key="`pagination-${moduleName}`"
          :total="recordCount"
          :currentPage.sync="page"
          :currentPageCount="(recordList || []).length"
          :pageCount="perPage"
          :pageSize="perPage"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import { CommonList } from '@facilio/ui/new-app'
import {
  FText,
  FContainer,
  FSpinner,
  FIcon,
  FDivider,
  FEmptyState,
  ftoast,
  FPagination,
} from '@facilio/design-system'
import Pagination from '../../../../pages/list/Pagination.vue'
import ColumnCustomization from '../../../../pages/list/views/ColumnCustomization.vue'
import { API } from '@facilio/api'
import { RelatedListData } from './RelatedListData'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
import MainFieldSearch from './MainFieldSearch.vue'
import dlv from 'dlv'
import { getTimeFormat } from '../../../../utils/formatter'
import FetchViews from '../../../../../src/components/views/FetchViews.vue'

export default {
  mixins: [FetchViews],
  props: ['widget', 'details', 'footerPortal', 'actionPortal', 'fitMyContent'],
  components: {
    CommonList,
    Pagination,
    ColumnCustomization,
    MainFieldSearch,
    FText,
    FSpinner,
    FPagination,
    FContainer,
    FIcon,
    FDivider,
    FEmptyState,
  },
  data() {
    return {
      showColumnSettings: false,
      recordList: [],
      recordCount: null,
      page: 1,
      isLoading: false,
      viewDetail: {},
      viewLoading: false,
      searchText: null,
      metaInfo: {},
      isEmpty,
    }
  },
  created() {
    this.init()
  },
  computed: {
    currentModuleName() {
      return this.$attrs.moduleName || ''
    },
    account() {
      return this.$account
    },
    modelDataClass() {
      return RelatedListData
    },
    relatedListObj() {
      return dlv(this.widget, 'relatedList') || {}
    },
    relatedFieldName() {
      return dlv(this.relatedListObj, 'field.name')
    },
    moduleName() {
      return dlv(this.relatedListObj, 'module.name') || ''
    },
    perPage() {
      return 5
    },
    moduleDisplayName() {
      return dlv(this.relatedListObj, 'module.displayName') || ''
    },
    viewname() {
      return 'hidden-all'
    },
    viewFields() {
      return this.viewDetail?.fields || []
    },
    title() {
      let { moduleDisplayName, relatedListObj } = this
      let { relatedListDisplayName } = relatedListObj?.field || {}

      return relatedListDisplayName || moduleDisplayName
    },
    mainFieldObj() {
      let { fields } = this.viewDetail || {}
      let { field: mainField } =
        (fields || []).find(viewFld => viewFld?.field?.mainField) || {}
      return mainField || {}
    },
    emptyStateText() {
      let { moduleDisplayName } = this
      return `No ${moduleDisplayName} Associated`
    },
    showLoading() {
      return this.isLoading || this.viewLoading
    },
    recordId() {
      let { id } = this.details
      return id
    },
    orgDetails() {
      let { account } = this
      let timeformat = getTimeFormat()
      let timezone = dlv(account, 'org.timezone', 'Etc/UTC')
      let dateformat = dlv(account, 'org.dateFormat') || 'DD-MMM-YYYY'
      return {
        dateformat: dateformat,
        timezone: timezone,
        timeformat: timeformat,
      }
    },
    routeName() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      return name || null
    },
    mainFieldAction() {
      return this.routeName ? this.redirectToOverview : null
    },
  },
  watch: {
    page() {
      this.loadRecords(true)
    },
    searchText() {
      this.loadRecords(true)
    },
  },
  methods: {
    init() {
      let prom1 = this.loadViewDetails()
      let prom2 = this.loadMetaInfo()
      let prom3 = this.loadRecords()
      Promise.all([prom1, prom2, prom3]).then(() => {
        this.$nextTick(() => {
          this.fitMyContent()
        })
      })
    },
    async loadRecords(force = false) {
      let {
        moduleName,
        viewname,
        perPage,
        recordId,
        relatedFieldName,
        $attrs,
        page,
        searchText,
      } = this
      let { moduleName: currentModuleName } = $attrs
      let params = {
        moduleName,
        viewName: viewname,
        perPage,
        recordId,
        relatedFieldName,
        currentModuleName,
        page,
        search: searchText,
        force,
      }

      this.isLoading = true
      try {
        let recordList = await this.modelDataClass.fetchAll(params)
        if (isArray(recordList)) this.recordList = recordList || []

        this.recordCount = this.modelDataClass.recordListCount
      } catch (error) {
        ftoast.critical(error.message || 'Unable to fetch moduleList')
      }
      this.isLoading = false
    },
    async loadViewDetails() {
      this.viewLoading = true
      try {
        let { moduleName, viewname, currentModuleName } = this
        let { error, data } = await API.get(
          `v2/views/${currentModuleName}/${moduleName}/${viewname}`
        )

        if (error) throw error
        else this.viewDetail = data?.viewDetail || {}
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Cannot fetch view details')
      }
      this.viewLoading = false
    },
    async loadMetaInfo() {
      if (this.config?.canHideColumnConfig) return

      let { moduleName } = this
      let { data, error } = await API.get('/module/meta', { moduleName })

      if (!error) {
        this.metaInfo = data?.meta || {}
      }
    },
    getRoute(moduleName) {
      return findRouteForModule(moduleName, pageTypes.OVERVIEW)
    },
    reloadData() {
      this.init()
    },
    redirectToOverview({ record, value }) {
      let { routeName, moduleName } = this
      let { id } = record || {}

      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { viewname: 'all', id, moduleName },
          moduleName,
        }).href

        return { url: route, target: '_blank', text: value, clickAction: false }
      }
    },
    async redirectToSummary(field) {
      let { moduleName, id } = field || {}
      let viewname = await this.fetchView(moduleName)
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}

      if (name) {
        this.$router.push({ name, params: { viewname, id, moduleName } })
      }
    },
  },
}
</script>
