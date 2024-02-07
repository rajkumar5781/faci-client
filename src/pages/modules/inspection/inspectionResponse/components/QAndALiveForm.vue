<template>
  <FContainer class="live-form-wrapper" backgroundColor="backgroundContainer">
    <MicroEmbed
      v-if="url"
      ref="qAndALiveForm"
      name="facilio-client"
      :url="url"
      :handlers="handlers"
      @ruleEvents="handleEvents"
    />
  </FContainer>
</template>

<script>
import { FContainer } from '@facilio/design-system'
import MicroEmbed from '../../../../../components/micro-embed/MicroEmbed.vue'
import getProperty from 'dlv'
import { getApp } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
export default {
  components: { MicroEmbed, FContainer },
  data() {
    return {
      url: '',
      handlers: {},
    }
  },
  props: ['moduleName'],
  computed: {
    getCurrentApp() {
      return getApp().linkName || 'maintenance'
    },
    getResponseId() {
      let responseId = getProperty(this.$route.params, 'id', null)
      return responseId
    },
    getCurrentAppId() {
      return getApp().id || {}
    },
    getName() {},
  },
  mounted() {
    this.setIFrameUrl()
    this.handlers = {
      getAppId: this.getCurrentAppId,
      baseUrl: this.baseUrl,
      fetchAccountDetails: this.accountDetails,
    }
  },
  methods: {
    baseUrl() {
      return getBaseURL()
    },
    accountDetails() {
      return Vue.prototype.$account
    },
    handleEvents(obj) {
      let { id, moduleName, viewname } = obj
      this.redirectToOverview(id, moduleName, viewname)
    },
    redirectToOverview(id, moduleName, viewname) {
      if (isEmpty(viewname)) {
        viewname = 'all'
      }
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      if (!isEmpty(name)) {
        this.$router.push({ name, params: { viewname, id } })
      }
    },
    setIFrameUrl() {
      let url = ''
      if (window.location.origin.startsWith('http://localhost')) {
        url = `http://localhost:9091/legacy/${
          getApp().linkName
        }/iframe/${this.getPath()}`
      } else {
        url = `${window.location.origin}/legacy/${
          getApp().linkName
        }/iframe/${this.getPath()}`
      }
      this.url = url
    },
    getPath() {
      return `${this.moduleName}/${this.getResponseId}/liveForm`
    },
  },
}
</script>

<style lang="scss" scoped>
.live-form-wrapper {
  z-index: 100000;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
