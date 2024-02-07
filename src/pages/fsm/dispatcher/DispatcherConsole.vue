<template>
  <div class="w-full h-full">
    <MicroEmbed
      v-if="iframeUrl"
      ref="dispatcher"
      name="dispatcher"
      :url="iframeUrl"
      :handlers="handlers"
      @loaded="sendAppId"
      @routeChange="setRoute"
    />
  </div>
</template>

<script>
import MicroEmbed from '../../../components/micro-embed/MicroEmbed.vue'
import { getApp, findRouteForModule, pageTypes } from '@facilio/router'
import { getBaseURL } from '../../../utils/api/base-url'

export default {
  name: 'DispatcherConsole',
  components: {
    MicroEmbed,
  },
  data() {
    return {
      handlers: {
        getAppId: this.getAppId,
        baseUrl: this.baseUrl,
        getAccount: this.getAccount,
        getRouteForModule: this.getRouteForModule,
        getRouteForTimeOff: this.getRouteForTimeOff,
      },
      iframeUrl: '',
    }
  },
  mounted() {
    this.setIframeUrl()
  },

  computed: {
    appId() {
      return getApp().id
    },
  },
  methods: {
    setIframeUrl() {
      let url = ''
      let urlPath = this.$route.path
        .split('/')
        .filter(Boolean)
        .slice(3)
        .join('/')

      const path = urlPath || 'dispatcher'

      if (window.location.origin.startsWith('http://localhost')) {
        url = `http://localhost:8080/${path}`
      } else {
        url = `${window.location.origin}/${path}`
      }
      this.iframeUrl = url
    },
    baseUrl() {
      return getBaseURL()
    },
    sendAppId() {
      this.$refs['dispatcher'].sendEvent('appId', this.appId)
    },
    getAppId() {
      return getApp().id
    },
    setRoute(iframePath) {
      const { pathname } = window.location
      const appName = window.location.pathname
        .split('/')
        .filter(Boolean)
        .slice(0, 3)
        .join('/')

      const path = `/${appName}${iframePath}`
      if (pathname !== path) {
        this.$router.push({ path })
      }
    },
    getAccount() {
      return this.$account
    },
    getRouteForModule({ id, moduleName }) {
      const {
        $route: { query },
      } = this
      const { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      const path = { name, params: { viewname: 'all', id, moduleName }, query }
      const url = this.$router.resolve(path).href
      window.open(url, '_blank')
    },
    getRouteForTimeOff() {
      const { name } = findRouteForModule('timeOff', pageTypes.CREATE) || {}
      const url = this.$router.resolve({
        name,
        params: { moduleName: 'timeOff' },
      }).href
      window.open(url, '_blank')
    },
  },
}
</script>
