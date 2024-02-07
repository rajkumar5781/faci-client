<template>
  <FContainer style="height: 100%">
    <FContainer
      v-if="loading"
      display="flex"
      justify-content="center"
      align-items="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FSidebar
      v-else
      :sidebarWidth="250"
      bgColor="backgroundContainer"
      defaultOpen
    >
      <template #title
        ><FText>{{ `Site Hierarchy` }}</FText>
      </template>
      <template #sidebar>
        <FContainer height="100%" overflow="hidden" display="flex">
          <PortfolioSideBar
            :renderKey="key"
            @redirect="changeSummary"
            :site="site"
            :dataObj="dataObj"
          ></PortfolioSideBar>
        </FContainer>
      </template>
      <template #content>
        <BaseSpaceOverview
          :unit="site.unit"
          @refresh="refreshTree"
        ></BaseSpaceOverview>
      </template>
    </FSidebar>
  </FContainer>
</template>
<script>
import {
  FSidebar,
  FSpinner,
  FContainer,
  ftoast,
  FText,
} from '@facilio/design-system'
import BaseSpaceOverview from './BaseSpaceOverview.vue'
import PortfolioSideBar from '../components/PortfolioSideBar.vue'
import { API } from '@facilio/api'
import { pageTypes, findRouteForTab } from '@facilio/router'

export default {
  components: {
    FSidebar,
    FContainer,
    PortfolioSideBar,
    FSpinner,
    FText,
    BaseSpaceOverview,
  },

  async created() {
    await this.fetchSiteDetails()
  },
  data() {
    return {
      toggleText: 'Site Hierarchy',
      isLoading: false,
      site: null,
      key: 'tree-data',
      dataObj: null,
    }
  },
  computed: {
    moduleName() {
      let { $route: { params: { moduleName = {} } = {} } = {} } = this || {}
      return moduleName
    },
    id() {
      let { $route: { params: { id = {} } = {} } = {} } = this || {}
      return id
    },
    loading() {
      let { isLoading } = this || {}
      return isLoading
    },
    summaryRoute() {
      let { name = null } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      return name
    },
  },
  methods: {
    async fetchSiteDetails() {
      this.isLoading = true
      let { id } = this
      let { data, error } = await API.get('/v2/site/siteInfo', {
        id: id,
      })
      if (error) {
        let { message = 'Error Occured' } = error
        ftoast.critical(message)
        this.isLoading = false
      } else {
        let { site } = data || {}
        this.site = site
        this.isLoading = false
      }
    },
    changeSummary(id, moduleName) {
      let { summaryRoute } = this || {}
      if (summaryRoute) {
        this.$router.push({
          name: summaryRoute,
          params: {
            moduleName: moduleName.toLowerCase(),
            id: id,
          },
        })
      }
    },
    refreshTree(data) {
      this.key = `${this.key}-${data.id}`
      this.dataObj = data
    },
  },
}
</script>
