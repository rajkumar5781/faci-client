<template>
  <FContainer height="100%">
    <portal :to="actionPortal">
      <FIcon
        v-if="!isEmpty(recordList)"
        display="flex"
        alignItems="center"
        group="action"
        name="add-column"
        size="18"
        color="textDefault"
        @click="showColumnSettings = true"
      ></FIcon>
    </portal>
    <FContainer
      v-if="showLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(recordList)"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FEmptyState
        :title="emptyStateText"
        illustration="no-entries"
        size="S"
        :vertical="true"
      ></FEmptyState>
    </FContainer>
    <CommonList
      v-else
      :viewDetail="viewDetail"
      :records="recordList"
      :hideBorder="true"
      selectType=""
      :getRoute="getRoute"
      :hideIdColumn="true"
    >
    </CommonList>
    <ColumnCustomization
      :visible.sync="showColumnSettings"
      :moduleName="viewModuleName"
      :parentModuleName="moduleName"
      :viewName="viewname"
    ></ColumnCustomization>
    <portal :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <FPagination
          :pageSize="perPage"
          :total="totalRecords"
          :currentPage="page"
          :disabled="false"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import ColumnCustomization from '../../../list/views/ColumnCustomization.vue'
import { CommonList } from '@facilio/ui/new-app'
import MainFieldSearch from '../../../../components/page-builder/widgets/relatedList/MainFieldSearch.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { findRouteForModule, pageTypes } from '@facilio/router'
import {
  FContainer,
  FText,
  FSpinner,
  ftoast,
  FPagination,
  FIcon,
  FEmptyState,
} from '@facilio/design-system'

export default {
  props: ['details', 'widget', 'footerPortal', 'actionPortal'],
  components: {
    FContainer,
    FText,
    FSpinner,
    ftoast,
    FPagination,
    FIcon,
    CommonList,
    FEmptyState,
    ColumnCustomization,
    MainFieldSearch,
  },
  data() {
    return {
      recordList: [],
      isLoading: false,
      page: 1,
      perPage: 5,
      showLoading: false,
      totalRecords: 0,
      viewDetail: {},
      showColumnSettings: false,
      moduleName: 'visitor',
      emptyStateText: this.$t(
        'visitor_module.empty_state',
        'No Visits Available',
        { ns: 'visitor' }
      ),
      isEmpty,
    }
  },
  created() {
    this.init()
  },
  computed: {
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
  methods: {
    init() {
      this.showLoading = true
      let prom1 = this.loadView()
      let prom2 = this.loadRecords()
      Promise.all([prom1, prom2]).then(() => {
        this.showLoading = false
      })
    },
    getRoute(moduleName) {
      return findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
    },
    async loadRecords() {
      this.showLoading = true
      let { details, page, perPage } = this
      let { id } = details || {}
      let filters = JSON.stringify({
        visitor: { operatorId: 36, value: [`${id}`] },
      })
      let params = {
        filters: filters,
        withCount: true,
        page,
        perPage,
      }

      let { data, error, meta } = await API.get(
        'v3/unrelated/visitor/fetchAll/visitorlog',
        params,
        { force: true }
      )

      if (error) {
        ftoast.critical(error?.message || this.$t('error_occurred'))
      } else {
        this.recordList = getProperty(data, 'visitorlog', [])
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

      let { error, data } = await API.get(`v2/views/${viewName}`, {
        moduleName: viewModuleName,
      })

      if (error) {
        ftoast.critical(
          error?.message ||
            this.$t('cannot_fetch_view', 'Cannot fetch view details', {
              ns: 'visitor',
            })
        )
      } else this.viewDetail = data?.viewDetail || {}
    },
  },
}
</script>
