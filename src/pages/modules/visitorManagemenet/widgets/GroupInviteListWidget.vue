<template>
  <FContainer height="100%">
    <portal :to="actionPortal">
      <FContainer v-if="showMainSearch" display="flex" alignItems="center">
        <MainFieldSearch
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch>
        <FDivider height="24px" margin="containerNone containerXLarge" />
        <ColumnCustomization
          :moduleName="viewModuleName"
          :parentModuleName="moduleName"
          :viewName="viewName"
          :viewFields="viewFields"
        ></ColumnCustomization>
      </FContainer>
    </portal>
    <FContainer
      v-if="showLoading"
      display="flex"
      justify-content="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <CommonList
      v-else
      :viewDetail="viewDetail"
      :records="recordList"
      :hideBorder="true"
      selectType=""
      :getRoute="getRoute"
      :mainFieldAction="mainFieldAction"
    >
    </CommonList>
    <portal :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <FPagination
          :pageSize="this.perPage"
          :total="this.totalRecords"
          :currentPage="this.page"
          :disabled="false"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import getProperty from 'dlv'
import ColumnCustomization from '../../../list/views/ColumnCustomization.vue'
import { CommonList } from '@facilio/ui/new-app'
import MainFieldSearch from '../../../../components/page-builder/widgets/relatedList/MainFieldSearch.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { findRouteForModule, pageTypes } from '@facilio/router'
import {
  FContainer,
  FText,
  FSpinner,
  ftoast,
  FPagination,
  FIcon,
  FDivider,
  FButton,
} from '@facilio/design-system'

export default {
  props: ['details', 'widget', 'footerPortal', 'actionPortal'],
  components: {
    FContainer,
    FText,
    FSpinner,
    ftoast,
    FPagination,
    CommonList,
    FIcon,
    FDivider,
    FButton,
    ColumnCustomization,
    MainFieldSearch,
  },

  data() {
    return {
      recordList: [],
      isLoading: false,
      page: 1,
      viewDetail: {},
      perPage: 5,
      showLoading: false,
      totalRecords: 0,
      searchText: null,
      metaFields: [],
      isEmpty,
    }
  },
  created() {
    this.init()
  },
  computed: {
    moduleName() {
      return 'groupinvite'
    },
    relatedModuleName() {
      return 'invitevisitor'
    },
    viewFields() {
      return getProperty(this.viewDetail, 'fields', [])
    },
    routeName() {
      let { relatedModuleName } = this
      let { name = null } =
        findRouteForModule(relatedModuleName, pageTypes.OVERVIEW) || {}
      return name
    },
    mainFieldAction() {
      return this.routeName ? this.mainFieldRedirection : null
    },
    mainFieldObj() {
      let { metaFields } = this || {}
      let mainField =
        (metaFields || []).find(viewFld => viewFld?.mainField) || {}
      return mainField || {}
    },
    showMainSearch() {
      let { recordList, searchText } = this || {}
      return !isEmpty(recordList) || !isEmpty(searchText)
    },
    viewName() {
      let { widgetParams } = this.widget || {}
      let { viewName } = widgetParams || {}
      return viewName
    },
    viewModuleName() {
      let { widgetParams } = this.widget || {}
      let { viewModuleName } = widgetParams || {}
      return viewModuleName
    },
  },
  watch: {
    searchText() {
      this.loadRecords()
    },
  },
  methods: {
    async init() {
      this.showLoading = true
      let prom1 = this.loadMetaFields()
      let prom2 = this.loadView()
      let prom3 = this.loadRecords()
      Promise.all([prom1, prom2, prom3]).then(() => {
        this.showLoading = false
      })
    },
    async loadMetaFields() {
      let { data, error } = await API.get('/module/metafields', {
        moduleName: this.relatedModuleName,
      })
      if (error) {
        ftoast.critical(error?.message || this.$t('error_occurred'))
      } else {
        this.metaFields = getProperty(data, 'meta.fields', [])
      }
    },
    getRoute(moduleName) {
      return findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
    },
    async loadRecords() {
      this.showLoading = true
      let { details, page, perPage, searchText } = this
      let { id } = details || {}

      let filters = JSON.stringify({
        groupId: { operatorId: 36, value: [`${id}`] },
      })
      let params = {
        filters: filters,
        withCount: true,
        page,
        perPage,
        search: searchText,
      }
      let { data, error, meta } = await API.get(
        'v3/unrelated/groupinvite/fetchAll/invitevisitor',
        params,
        { force: true }
      )

      if (error) {
        ftoast.critical(error?.message || this.$t('error_occurred'))
      } else {
        let { invitevisitor } = data || {}
        this.recordList = invitevisitor || []
        if (!isEmpty(meta)) {
          this.totalRecords = getProperty(meta, 'pagination.totalCount', 0)
        }
      }
      this.showLoading = false
    },
    currentChange(page) {
      this.page = page
      this.loadRecords()
    },
    async loadView() {
      let { viewName, viewModuleName } = this
      let { error, data } = await API.get(
        `v2/views/${viewModuleName}/${viewName}`,
        { moduleName: viewModuleName }
      )

      if (error) {
        ftoast.critical(
          error?.message ||
            this.$t('cannot_fetch_view', 'Cannot fetch view details', {
              ns: 'visitor',
            })
        )
      } else this.viewDetail = data?.viewDetail || {}
    },
    mainFieldRedirection({ record, value }) {
      let { routeName, viewName } = this
      let { id = null } = record || {}

      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { viewName, id },
        }).href

        return {
          url: route,
          text: value,
          id,
          clickAction: (field, e) => this.mainFieldClickAction(id, e),
          ...value,
        }
      }
    },
    mainFieldClickAction(id, e) {
      this.redirectToOverview(id)
      e.preventDefault()
    },
    redirectToOverview(id) {
      let { relatedModuleName, viewName } = this

      let { name } =
        findRouteForModule(relatedModuleName, pageTypes.OVERVIEW) || {}
      let route = { name, params: { viewName, id } }

      this.$router.push(route)
    },
  },
}
</script>
