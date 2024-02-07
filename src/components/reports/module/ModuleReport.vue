<template>
  <MicroEmbed
    v-if="dashboardUrl"
    ref="dashboard"
    name="dashboard"
    :url="dashboardUrl"
    :handlers="handlers"
  />
</template>

<script>
import MicroEmbed from '../../micro-embed/MicroEmbed.vue'
import { compressToEncodedURIComponent } from 'lz-string'
import { getBaseURL } from '../../../utils/api/base-url'
import { getApp } from '@facilio/router'
import webtabStore from '../../../store/webtabs'
import { mapState } from 'pinia'
export default {
  components: {
    MicroEmbed,
  },
  props: ['reportConfig', 'visualizationProps'],
  data: () => ({
    dashboardUrl: null,
  }),
  computed: {
    ...mapState(webtabStore, ['selectedTab']),
    appId() {
      return getApp().id
    },

    reportConfigQuery() {
      let { reportConfig } = this
      return compressToEncodedURIComponent(JSON.stringify(reportConfig))
    },
    visualizationPropsQuery() {
      let { visualizationProps } = this
      return compressToEncodedURIComponent(JSON.stringify(visualizationProps))
    },
  },
  watch: {
    reportConfigQuery: {
      handler() {
        this.dashboardUrl = null
        this.setIframeUrl()
      },
      deep: true,
    },
  },

  mounted() {
    this.handlers = {
      getAppId: this.getAppId,
      baseUrl: this.baseUrl,
      fetchAccountDetails: this.accountDetails,
      hasViewPermission: this.hasViewPermission,
      hasCreatePermission: this.hasCreatePermission,
      hasDeletePermission: this.hasDeletePermission,
      hasDashboardEditPermission: this.hasDashboardEditPermission,
      hasSharePermission: this.hasSharePermission,
      parentDimension: this.parentDimension,
      getTabId: this.getTabId,
    }
    this.setIframeUrl()
  },

  methods: {
    parentDimension() {
      return { height: window.innerHeight, width: window.innerWidth }
    },
    hasViewPermission() {
      return false
    },
    hasCreatePermission() {
      return false
    },
    hasDeletePermission() {
      return false
    },
    hasDashboardEditPermission() {
      return false
    },
    hasSharePermission() {
      return false
    },
    setIframeUrl() {
      let { reportConfigQuery, visualizationPropsQuery } = this
      let url = ''
      let urlPath = this.$route.path
        .split('/')
        .filter(Boolean)
        .slice(3)
        .join('/')
      let path = 'dashboard/maintenance/analytics/module/livereport'

      if (window.location.origin.startsWith('http://localhost')) {
        url = `http://localhost:9091/${path}`
      } else {
        url = `${window.location.origin}/${path}`
      }
      this.dashboardUrl = `${url}?visualizationProps=${visualizationPropsQuery}&reportConfig=${reportConfigQuery}`
    },
    baseUrl() {
      return getBaseURL()
    },
    accountDetails() {
      return this.$account
    },
    getAppId() {
      return getApp().id
    },
    getTabId() {
      return this.selectedTab.id
    },
  },
}
</script>
