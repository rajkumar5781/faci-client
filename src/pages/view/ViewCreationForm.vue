<template>
  <MicroEmbed
    v-if="url"
    ref="view-creation"
    name="facilio-client"
    :url="url"
    @redirectToList="redirectToList"
    @onViewCancel="onViewCancel"
    @breadcrumbAction="breadcrumbAction"
    class="view-manager-full-screen"
  />
</template>
<script>
import MicroEmbed from '../../components/micro-embed/MicroEmbed.vue'
import { getApp, pageTypes, findRouteForModule } from '@facilio/router'

const env = import.meta.env

export default {
  props: ['moduleName', 'viewname'],
  components: { MicroEmbed },
  computed: {
    url() {
      let { viewname, $route } = this
      let { linkName } = getApp()
      let orgSubDomain = window.addOrgDomainInRootPath
        ? window.location.pathname.slice(1).split('/')[0]
        : null

      let {
        appId,
        viewCloneAppId,
        viewname: cloneViewName,
      } = $route?.query || {}

      let url = `legacy/${
        orgSubDomain ? `${orgSubDomain}/` : ''
      }${linkName}/iframe/modules/${this.moduleName}/viewform${
        viewname ? `/${viewname}` : ''
      }?appId=${appId}${
        viewCloneAppId ? `&viewCloneAppId=${viewCloneAppId}` : ''
      }${cloneViewName ? `&viewname=${cloneViewName}` : ''}`

      if (process.env.NODE_ENV === 'development') {
        return `${env.VITE_LEGACY_URL}/${url}`
      } else {
        return `/${url}`
      }
    },
  },
  methods: {
    redirectToList() {
      let { viewname } = this
      let { name } = findRouteForModule(this.moduleName, pageTypes.LIST) || {}

      if (name) {
        this.$router.replace({
          name,
          params: { viewname },
          query: {},
        })
      }
    },
    onViewCancel(data) {
      let { moduleName } = data
      let { name } =
        findRouteForModule(moduleName, pageTypes.VIEW_MANAGER) || {}

      name && this.$router.push({ name, params: { moduleName } })
    },
    breadcrumbAction(pageType) {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes[pageType]) || {}

      name && this.$router.push({ name, params: { moduleName } })
    },
  },
}
</script>
<style lang="scss" scoped>
.view-manager-full-screen {
  width: 100vw;
  position: absolute;
  left: 0;
  top: 0;
}
</style>
