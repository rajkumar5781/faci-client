<template>
  <MicroEmbed
    v-if="dashboardUrl"
    ref="dashboard"
    name="dashboard"
    :url="dashboardUrl"
    :handlers="handlers"
    @loaded="sendAppId"
    @routeChange="setRoute"
  />
</template>

<script>
import MicroEmbed from '../../components/micro-embed/MicroEmbed.vue'
import {
  getApp,
  findRouteForModule,
  findRouteForReport,
  pageTypes,
  findRouteForTab,
  tabTypes,
} from '@facilio/router'
import { getBaseURL } from '../../utils/api/base-url'
import { mapActions, mapState } from 'pinia'
import constants from '../../utils/constants'
import webtabStore from '../../store/webtabs'
import Vue from 'vue'

export default {
  components: { MicroEmbed },
  computed: {
    ...mapState(webtabStore, ['selectedTab']),
    appId() {
      return getApp().id
    },
  },
  data() {
    return {
      handlers: {},
      overlay: false,
      fullscreen: false,
      dashboardUrl: '',
    }
  },
  mounted() {
    this.handlers = {
      getAppId: this.getAppId,
      baseUrl: this.baseUrl,
      getModuleRoute: this.getModuleRoute,
      getReportRoute: this.getReportRoute,
      fetchAccountDetails: this.accountDetails,
      hasViewPermission: this.hasViewPermission,
      hasCreatePermission: this.hasCreatePermission,
      hasDeletePermission: this.hasDeletePermission,
      hasDashboardEditPermission: this.hasDashboardEditPermission,
      hasSharePermission: this.hasSharePermission,
      parentDimension: this.parentDimension,
      applicationDetails: this.applicationDetails,
      getTabId: this.getTabId,
      getTabRoute: this.getTabRoute,
    }
    this.setIframeUrl()
  },
  methods: {
    ...mapActions(webtabStore, ['tabHasPermission']),
    setIframeUrl() {
      let { ANALYTICS_PATH = {} } = constants
      let { basePath, listPath } = ANALYTICS_PATH
      let slice = window.addOrgDomainInRootPath ? 5 : 4
      if (window.addOrgDomainInRootPath) {
        basePath = window.location.href.split(/\//)[3] + '/' + basePath
      }
      let url = ''
      let urlPath = this.$route.fullPath
        .split('/')
        .filter(Boolean)
        .slice(slice)
        .join('/')
      let path = basePath
      path += urlPath || listPath
      if (window.location.origin.startsWith('http://localhost')) {
        url = `http://localhost:8080/${path}`
      } else {
        url = `${window.location.origin}/${path}`
      }

      this.dashboardUrl = url
    },
    setRoute(path) {
      let iframePath = path.split(/\/dashboard\/maintenance\/analytics\//)[1]
      let parentPath = window.location.pathname
      let slice = window.addOrgDomainInRootPath ? 6 : 5
      let parentPathArr = parentPath.split('/').slice(0, slice)
      let updatedPath = parentPathArr.join('/') + '/' + iframePath
      if (parentPath !== updatedPath) {
        this.$router.push({ path: updatedPath })
      }
    },
    baseUrl() {
      return getBaseURL()
    },
    accountDetails() {
      return Vue.prototype.$account
    },

    sendAppId() {
      this.$refs['dashboard'].sendEvent('appId', this.appId)
    },
    getAppId() {
      return getApp().id
    },
    getModuleRoute(moduleObj) {
      let { moduleName } = moduleObj
      return findRouteForModule(moduleName, pageTypes.LIST)
    },
    applicationDetails() {
      return getApp()
    },
    getReportRoute(data) {
      let { moduleType, moduleName } = data
      if (moduleName) {
        return findRouteForReport(moduleType, pageTypes.REPORT_VIEW, {
          moduleName: moduleName,
        })
      } else {
        return findRouteForReport(moduleType, pageTypes.REPORT_VIEW)
      }
    },
    hasViewPermission() {
      let { currentTab, tabHasPermission } = this
      return tabHasPermission('VIEW', currentTab)
    },
    hasCreatePermission() {
      let { currentTab, tabHasPermission } = this
      return tabHasPermission('CREATE', currentTab)
    },
    hasDeletePermission() {
      let { currentTab, tabHasPermission } = this
      return tabHasPermission('DELETE', currentTab)
    },
    hasDashboardEditPermission() {
      let { currentTab, tabHasPermission } = this
      return tabHasPermission('EDIT', currentTab)
    },
    hasSharePermission() {
      let { currentTab, tabHasPermission } = this
      return tabHasPermission('SHARE', currentTab)
    },
    parentDimension() {
      return { height: window.innerHeight, width: window.innerWidth }
    },
    getTabId() {
      return this.selectedTab.id
    },
    getTabRoute() {
      let { path } = findRouteForTab(tabTypes.ANALYTICS)
      return path
    },
  },
}
</script>

<style lang="scss" scoped></style>
