<template>
  <MicroEmbed
    v-if="url"
    ref="view-manager"
    name="facilio-client"
    :url="url"
    :context="context"
    @goBackToList="goBackToList"
    @updateAppId="updateAppId"
    @openViewCreation="openViewCreation"
    class="view-manager-full-screen"
  />
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import MicroEmbed from '../../components/micro-embed/MicroEmbed.vue'
import { pageTypes, getApp, findRouteForModule } from '@facilio/router'

const env = import.meta.env

export default {
  props: ['moduleName'],
  components: { MicroEmbed },
  computed: {
    url() {
      let { linkName } = getApp()
      let orgSubDomain = window.addOrgDomainInRootPath
        ? window.location.pathname.slice(1).split('/')[0]
        : null

      let url = `legacy/${
        orgSubDomain ? `${orgSubDomain}/` : ''
      }${linkName}/iframe/modules/${this.moduleName}/viewmanager`

      if (process.env.NODE_ENV === 'development') {
        return `${env.VITE_LEGACY_URL}/${url}`
      } else {
        return `/${url}`
      }
    },
    context() {
      let { id } = getApp()
      return { appId: id }
    },
  },
  methods: {
    goBackToList() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}
      name && this.$router.push({ name })
    },
    updateAppId(appId) {
      this.$router.push({ query: { appId } })
    },
    openViewCreation(routeObj) {
      if (!isEmpty(routeObj)) {
        let { name } =
          findRouteForModule(this.moduleName, pageTypes.VIEW_CREATION) || {}
        let appId = routeObj?.query?.appId || (getApp() || {}).id

        this.$router.push({
          name,
          params: routeObj.params,
          query: { ...(routeObj.query || {}), appId },
        })
      }
    },
  },
}
</script>
<style lang="scss">
.view-manager-full-screen {
  width: 100vw;
  position: absolute;
  left: 0;
  top: 0;
}
</style>
