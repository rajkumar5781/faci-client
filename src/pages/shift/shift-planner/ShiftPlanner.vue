<template>
  <FContainer width="100%" height="100%">
    <MicroEmbed
      v-if="iframeUrl"
      ref="dispatcher"
      name="dispatcher"
      :url="iframeUrl"
      :handlers="handlers"
      @loaded="sendAppId"
    />
  </FContainer>
</template>

<script>
import { getApp, findRouteForModule, pageTypes } from '@facilio/router'
import MicroEmbed from '../../../components/micro-embed/MicroEmbed.vue'
import { getBaseURL } from '../../../utils/api/base-url'
import { FContainer } from '@facilio/design-system'

export default {
  name: 'ShiftPlanner',
  components: {
    MicroEmbed,
    FContainer,
  },
  data() {
    return {
      handlers: {
        getAppId: this.getAppId,
        baseUrl: this.baseUrl,
        getAccount: this.getAccount,
        getRouteForModule: this.getRouteForModule,
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
      const path = 'dispatcher/shift-planner'
      const {
        location: { origin },
      } = window
      let url = `${origin}/${path}`

      if (origin.startsWith('http://localhost')) {
        url = `http://localhost:8081/${path}`
      }

      this.iframeUrl = url
    },
    baseUrl() {
      return getBaseURL()
    },
    sendAppId() {
      const { ['shift-planner']: shiftPlannerRef } = this.$refs
      shiftPlannerRef.sendEvent('appId', this.appId)
    },
    getAppId() {
      return getApp().id
    },
    getAccount() {
      return this.$account
    },
    getRouteForModule({ id, moduleName }) {
      const {
        $route: { query },
      } = this
      const { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      const path = { name, params: { viewname: 'all', id }, query }
      const url = this.$router.resolve(path).href
      window.open(url, '_blank')
    },
  },
}
</script>
