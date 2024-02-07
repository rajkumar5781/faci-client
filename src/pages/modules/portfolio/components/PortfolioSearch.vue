<template>
  <FContainer height="100%">
    <FModal
      title=""
      :visible="true"
      :confirmLoading="false"
      size="XL"
      :hideFooter="true"
      :hideHeader="true"
      :append-to-body="true"
      padding="containerNone"
      @cancel="closeDialog"
      ref="modal"
      class="hide-header"
    >
      <FContainer
        margin="containerNone sectionSmall containerNone sectionSmall"
        height="calc(100vh - 220px)"
        display="flex"
        width="96%"
        flexDirection="column"
      >
        <FContainer>
          <FInput
            v-model="searchQuery"
            placeholder="Search for Sites, Buildings, Floors, or Spaces..."
            ref="portfolioSearch"
            size="large"
            :clearable="true"
            :clearValue="clearSearch"
            @enterPress="inputClick"
          >
            <template #prefix>
              <FIcon
                group="action"
                name="search"
                size="12"
                :pressable="false"
              />
            </template>
          </FInput>
        </FContainer>
        <FContainer
          v-if="searching"
          display="flex"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          <FSpinner :size="30"></FSpinner>
        </FContainer>
        <FContainer
          v-else-if="!loading"
          display="flex"
          :justifyContent="canShowTable ? `` : `center`"
          alignItems="center"
          height="90%"
          width="100%"
          paddingTop="12px"
          overflow="auto"
        >
          <FContainer
            display="flex"
            flexDirection="column"
            width="100%"
            v-if="showNewSearchContext"
          >
            <FEmptyState
              title="Begin exploring"
              description="Explore your entire portfolio with a single search. Find sites, buildings, floors, and spaces quickly."
              vertical
              size="M"
              illustration="no-result"
              type="narrow"
            />
          </FContainer>
          <FContainer
            padding="containerXLarge containerLarge"
            height="100%"
            width="100%"
            v-else-if="canShowTable"
          >
            <FText
              color="textMain"
              appearance="captionReg12"
              v-if="totalCount > 0"
            >
              {{ getResultsCount }}</FText
            >
            <FContainer v-for="(space, idx) of searchOrder" :key="idx">
              <FContainer
                padding="containerXLarge containerNone"
                v-if="!isEmpty(baseSpaces[space])"
              >
                <PortfolioSearchTable
                  :key="space + searchQuery"
                  :list="baseSpaces[space]"
                  :title="getTableTitle(space, count)"
                  :count="getCount(space)"
                  :moduleName="space.slice(0, -1)"
                  viewname="all"
                  :viewDetail="viewDetailsMap[space.slice(0, -1)]"
                  :searchText="searchQuery"
                />
              </FContainer>
            </FContainer>
          </FContainer>
          <FContainer display="flex" flexDirection="column" v-else>
            <FEmptyState
              title="No results found"
              :description="`Oops! We couldn't find any matching results for your query. Please try again with different keywords or check your spelling`"
              vertical
              size="M"
              illustration="no-result"
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FModal>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import {
  FContainer,
  FIcon,
  FInput,
  FModal,
  FSpinner,
  FEmptyState,
  FText,
} from '@facilio/design-system'
import debounce from 'lodash/debounce'
import { isEmpty } from '@facilio/utils/validation'
import PortfolioSearchTable from './PortfolioSearchTable.vue'
import ModuleList from '../../../list/ModuleList.vue'
export default {
  components: {
    FContainer,
    FText,
    FInput,
    FIcon,
    FModal,
    FSpinner,
    FEmptyState,
    PortfolioSearchTable,
    ModuleList,
  },
  data() {
    return {
      isEmpty,
      searchQuery: '',
      loading: false,
      siteList: [],
      buildingList: [],
      spaceList: [],
      floorList: [],
      showTable: false,
      totalCount: 0,
      count: 0,
      newSearch: true,
      baseSpaces: {},
      viewDetailsMap: {},
      enterPressed: false,
      searchOrder: ['sites', 'buildings', 'floors', 'spaces'],
    }
  },
  watch: {
    searchQuery(newVal) {
      if (isEmpty(newVal)) {
        this.newSearch = true
        this.emptyList()
      }
    },
  },
  computed: {
    showNewSearchContext() {
      let { searchQuery, newSearch } = this
      if (searchQuery == '') {
        return true
      }
      return newSearch
    },
    searching() {
      let { loading = true } = this || {}
      return loading
    },
    canShowTable() {
      let { showTable, searchQuery } = this || {}
      return searchQuery == '' ? false : showTable
    },
    getResultsCount() {
      let { totalCount } = this || {}
      if (totalCount == 1) {
        return `${this.totalCount} record found`
      }
      return `${this.totalCount} records found`
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.portfolioSearch) {
        let input = this.$refs.portfolioSearch.$el.children[1]
        if (input) {
          input.focus()
        }
      }
    })
  },
  methods: {
    clearSearch() {
      this.searchQuery = ''
      this.emptyList()
    },
    inputClick() {
      this.enterPressed = true
      this.newSearch = false
      this.emptyList()
      this.searchName()
    },
    getTableTitle(value) {
      let firstLetter = `${value.slice(0, 1).toUpperCase()}`
      let remainingLetters = `${value.slice(1)}`
      let title = `${firstLetter}${remainingLetters.slice(0, -1)}`
      return title
    },
    getCount(value) {
      let { count } = this || {}
      let key = this.getTableTitle(value)
      if (!isEmpty(count)) {
        return count[key]
      }
    },
    async loadSearchView(moduleName) {
      if (!this.viewDetailsMap[moduleName]) {
        this.viewDetailsMap[moduleName] = await this.getViewDetail(
          moduleName,
          'all'
        )
      }
    },
    async getViewDetail(moduleName, viewName) {
      let url = `/v2/views/${viewName}`
      let params = {
        moduleName,
      }

      let { data } = await API.get(url, params)
      return data.viewDetail
    },
    searchRecords: debounce(function () {
      this.searchName()
    }, 400),
    async searchName() {
      this.loading = true
      let { data, error } = await API.post('/v2/portfolio/search', {
        search: this.searchQuery,
        page: 1,
        moduleName: 'portfolio',
      })
      let { basespaces = {} } = data || {}
      if (!isEmpty(basespaces)) {
        for (let key in basespaces) {
          if (key == 'sites') {
            await this.loadSearchView('site')
          } else if (key == 'buildings') {
            await this.loadSearchView('building')
          } else if (key == 'floors') {
            await this.loadSearchView('floor')
          } else if (key == 'spaces') {
            await this.loadSearchView('space')
          }
        }
        this.baseSpaces = basespaces
        let { count = {} } = data || {}
        this.loadCount(count)
        this.loading = false
        this.showTable = true
      } else {
        this.loading = false
        this.showTable = false
      }
    },
    emptyList() {
      this.baseSpaces = {}
      this.emptyCount()
    },
    loadCount(countObj) {
      let values = Object.values(countObj)
      this.totalCount = 0
      this.count = countObj
      for (let count of values) {
        this.totalCount += count
      }
    },
    emptyCount() {
      this.totalCount = 0
      this.count = {}
    },
    closeDialog() {
      this.$emit('show')
    },
  },
}
</script>
