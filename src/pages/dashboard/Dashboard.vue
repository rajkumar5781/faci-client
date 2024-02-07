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
  findRouteForTab,
  pageTypes,
  tabTypes,
} from '@facilio/router'
import { ftoast } from '@facilio/design-system'
import { getBaseURL } from '../../utils/api/base-url'
import { mapActions, mapState } from 'pinia'
import webtabStore from '../../store/webtabs'
import Vue from 'vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
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
      getTabRoute: this.getTabRoute,
      fetchAccountDetails: this.accountDetails,
      hasViewPermission: this.hasViewPermission,
      hasCreatePermission: this.hasCreatePermission,
      hasDeletePermission: this.hasDeletePermission,
      hasDashboardEditPermission: this.hasDashboardEditPermission,
      hasSharePermission: this.hasSharePermission,
      parentDimension: this.parentDimension,
      applicationDetails: this.applicationDetails,
      getTabId: this.getTabId,
    }
    this.setIframeUrl()
  },
  watch: {
    '$route.path': {
      handler(newValue) {
        let urlPath = newValue.split('/').filter(Boolean).slice(3).join('/')
        if (isEmpty(urlPath)) {
          this.$refs['dashboard'].sendEvent(
            'reloadDashboard',
            this.dashboardUrl
          )
        }
      },
    },
  },
  methods: {
    ...mapActions(webtabStore, ['tabHasPermission']),
    async setIframeUrl() {
      let url = ''
      let slice = window.addOrgDomainInRootPath ? 4 : 3
      let urlPath = this.$route.path
        .split('/')
        .filter(Boolean)
        .slice(slice)
        .join('/')
      let path = 'dashboard/maintenance/'
      if (window.addOrgDomainInRootPath) {
        path = window.location.href.split(/\//)[3] + '/dashboard/maintenance/'
      }
      let createPermission = this.hasCreatePermission()
      // default view not configured in tab or default view is configured in tab but its a refresh state
      if (
        (isEmpty(this.selectedTab.configJSON) && createPermission) ||
        (!isEmpty(this.selectedTab.configJSON) && !isEmpty(urlPath))
      ) {
        path += urlPath || 'list'
      } else if (!isEmpty(this.selectedTab.configJSON) || !createPermission) {
        // default view is configured
        let linkName = await this.getDashboardLinkName()
        path += `dashboard/${linkName}`
      }

      if (window.location.origin.startsWith('http://localhost')) {
        url = `http://localhost:8080/${path}`
      } else {
        url = `${window.location.origin}/${path}`
      }
      this.dashboardUrl = url
    },
    getTabId() {
      return this.selectedTab.id
    },

    baseUrl() {
      return getBaseURL()
    },
    accountDetails() {
      return Vue.prototype.$account
    },
    async getDashboardLinkName() {
      let { appId } = this
      let params = {
        appId: appId,
        withSharing: true,
        withEmptyFolders: false,
        newFlow: true,
      }
      let { data, error } = await API.get('v3/dashboard/list', params)
      if (!error && !isEmpty(data.dashboardFolders)) {
        return data.dashboardFolders[0].dashboards[0].linkName
      } else if (error) {
        ftoast.critical(error.message || 'Error occured')
      }
    },

    applicationDetails() {
      return getApp()
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
    getTabRoute() {
      let { path } = findRouteForTab(tabTypes.ANALYTICS)
      return path
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
    setRoute(path) {
      let iframePath = path.split(/\/dashboard\/maintenance\//)[1]

      let parentPath = window.location.pathname
      let slice = window.addOrgDomainInRootPath ? 5 : 4
      let parentPathArr = parentPath.split('/').slice(0, slice)
      let updatedPath = parentPathArr.join('/') + '/' + iframePath
      if (parentPath !== updatedPath) {
        this.$router.push({ path: updatedPath })
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
  },
}
</script>

<style lang="scss" scoped></style>
