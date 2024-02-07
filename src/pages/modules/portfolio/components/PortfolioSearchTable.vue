<template>
  <FContainer height="100%" width="100%">
    <FContainer
      padding="containerLarge containerNone"
      height="90%"
      width="100%"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        gap="containerLarge"
        width="100%"
      >
        <FContainer>
          <FText appearance="headingMed14" color="textMain">
            {{ getTitle }}
          </FText>
        </FContainer>
        <!-- table section -->
        <FContainer
          width="100%"
          border="solid 1px"
          borderRadius="high"
          borderColor="borderNeutralBaseSubtle"
          marginTop="containerLarge"
          overflow="hidden"
        >
          <FContainer
            padding="containerLarge containerXLarge"
            display="flex"
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            :borderBottom="list.length > 0 ? '1px solid' : ''"
            :borderColor="list.length > 0 ? 'borderNeutralBaseSubtle' : ''"
          >
            <div>
              <FText color="textMain" appearance="headingMed14">{{
                getRecordsFoundTitle
              }}</FText>
            </div>

            <div class="flex items-center">
              <FPagination
                :currentPage.sync="currPage"
                :total="count"
                :currentPageCount="2"
                :pageSize="perPage"
                :pageCount="getPageCount"
                :perPage="5"
              />
            </div>
          </FContainer>
          <FContainer overflow="hidden" width="100%">
            <FContainer
              width="100%"
              v-if="showLoading"
              height="calc(100vh - 85vh)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FSpinner :size="30" />
            </FContainer>
            <CommonList
              v-else
              ref="common-list"
              :viewDetail="viewDetail"
              :key="moduleName"
              :records="records"
              :hideBorder="true"
              style="overflow: scroll"
              :showSelectBar="false"
              :moduleName="moduleName"
              :orgDetails="$account.org"
              :mainFieldAction="mainFieldAction"
              :account="$account"
              :baseUrl="getBaseURL()"
              :selectType="null"
              :slotList="slotList"
            >
            </CommonList>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FTable,
  FButton,
  FContainer,
  FText,
  FPagination,
  FSpinner,
} from '@facilio/design-system'
import Pagination from '../../../list/Pagination.vue'
import CommonLayout from '../../../list/views/CommonLayout.vue'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, findRouteForTab, pageTypes } from '@facilio/router'
import { CommonList } from '@facilio/ui/new-app'
import { getBaseURL } from '../../../../utils/api/base-url'
import { API } from '@facilio/api'
export default {
  props: [
    'list',
    'searchText',
    'title',
    'count',
    'viewname',
    'moduleName',
    'viewDetail',
  ],
  components: {
    FTable,
    FButton,
    CommonLayout,
    FContainer,
    FText,
    FPagination,
    Pagination,
    FSpinner,
    CommonList,
  },
  data() {
    return {
      isEmpty,
      getBaseURL,
      currPage: 1,
      perPage: 5,
      records: [],
      loading: false,
      searchViewDetail: null,
    }
  },
  created() {
    this.init()
  },
  computed: {
    slotList() {
      return []
    },
    getRecordsFoundTitle() {
      let { count = 0 } = this || {}
      if (count == 1) {
        return `${count} record found`
      }
      return `${count} records found`
    },
    getTitle() {
      let { title } = this || {}
      if (this.count > 1) {
        return `${title}s`
      }
      return title
    },
    getPageCount() {
      let { count = 0, perPage } = this || {}
      if (count > 0) {
        return Math.ceil(count / perPage)
      }
      return null
    },
    routeName() {
      let { name = null } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      return name
    },
    mainFieldAction() {
      return this.routeName ? this.mainFieldRedirection : null
    },
    showLoading() {
      let { loading } = this
      return loading
    },
  },
  watch: {
    currPage(newVal, oldVal) {
      if (newVal != oldVal) {
        this.loadNext()
      }
    },
  },
  methods: {
    async init() {
      this.records = this.list
    },
    getRoute(moduleName) {
      return findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
    },
    async loadNext() {
      this.loading = true
      let { searchText, currPage, moduleName } = this || {}
      let { data, error } = await API.post('/v2/portfolio/search', {
        search: searchText,
        page: currPage,
        moduleName: moduleName,
      })
      let { basespaces = [] } = data || {}
      if (!isEmpty(basespaces)) {
        this.records = basespaces[`${moduleName}s`]
        this.loading = false
      } else {
        this.loading = false
      }
    },
    mainFieldRedirection({ record, value }) {
      let { routeName, viewname, moduleName } = this
      let { id } = record || {}

      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { moduleName, viewname, id },
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
      console.log('dddd, ', d, e)
      let { moduleName, viewname, $route } = this
      let { query } = $route
      let { routeName } = this || {}
      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { viewname, id },
        }).href
      }
    },
    goToSummary(cell) {
      let { name = null } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY)
      if (name) {
        this.$router.push({
          name,
          params: {
            moduleName: `${cell.spaceTypeEnum.toLowerCase()}`,
            viewname: 'all',
            id: cell.id,
          },
        })
      }
      console.log(cell)
    },

    getArea(area) {
      if (area == null || area <= 0) {
        return '---'
      } else {
        return `${area} sq.Ft`
      }
    },
  },
}
</script>
