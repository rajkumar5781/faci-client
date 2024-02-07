<template>
  <MicroEmbed
    v-if="dashboardUrl && !isEmpty(reportContext)"
    ref="report-preview"
    name="dashboard"
    :url="dashboardUrl"
    :context="reportContext"
    :handlers="handlers"
  />
</template>

<script>
import MicroEmbed from '/src/components/micro-embed/MicroEmbed.vue'
import { getBaseURL } from '../../../utils/api/base-url'
import webtabStore from '../../../store/webtabs'
import { mapState } from 'pinia'
import { isEmpty } from '@facilio/utils/validation'

export default {
  components: {
    MicroEmbed,
  },
  props: [
    'reportParams',
    'visualizationProps',
    'measureProps',
    'initTimeFilter',
    'hideReportType',
    'hideTimeLineFilter',
  ],
  data: () => ({
    dashboardUrl: null,
    reportContext: null,
    isEmpty,
  }),
  computed: {
    ...mapState(webtabStore, ['selectedTab']),
  },
  watch: {
    reportParams: {
      handler() {
        this.dashboardUrl = null
        this.setIframeUrl()
      },
      deep: true,
    },
    visualizationProps: {
      handler() {
        this.dashboardUrl = null
        this.setIframeUrl()
      },
      deep: true,
    },
    measureProps: {
      handler() {
        this.dashboardUrl = null
        this.setIframeUrl()
      },
      deep: true,
    },
    initTimeFilter: {
      handler() {
        console.log('timeline: ', this.initTimeFilter)
        if (this.$refs['report-preview']) {
          this.$refs['report-preview'].sendEvent(
            'timelineFilterChanged',
            this.initTimeFilter
          )
        }
      },
      deep: true,
    },
    hideReportType: {
      handler() {
        this.dashboardUrl = null
        this.setIframeUrl()
      },
      deep: true,
    },
    hideTimeLineFilter: {
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
      applicationDetails: this.applicationDetails,
      getTabId: this.getTabId,
      reportLoaded: this.reportLoaded,
    }
    this.setIframeUrl()
  },

  methods: {
    reportLoaded(val) {
      let { clientHeight, reportData } = val || {}
      let { data } = reportData || {}
      if (isEmpty(data)) clientHeight = 200
      this.$emit('setHeight', clientHeight)
    },
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
      let url
      let previewRoute = 'dashboard/maintenance/analytics/report/preview'
      let path = this.appendQuery(previewRoute)
      if (window.location.origin.startsWith('http://localhost')) {
        url = `http://localhost:8080/${path}`
      } else {
        url = `${window.location.origin}/${path}`
      }
      let {
        reportParams = {},
        visualizationProps = {},
        measureProps = [],
        initTimeFilter = {},
      } = this
      this.reportContext = {
        reportParams: reportParams,
        visualizationProps: visualizationProps,
        measureProps: measureProps,
        initTimeFilter: initTimeFilter,
      }
      this.dashboardUrl = url
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
    applicationDetails() {
      return getApp()
    },
    getTabId() {
      return this.selectedTab.id
    },
    appendQuery(path) {
      let { hideReportType = false, hideTimeLineFilter = false } = this
      return `${path}?hideReportType=${hideReportType}&hideTimeLineFilter=${hideTimeLineFilter}`
    },
  },
}
</script>
