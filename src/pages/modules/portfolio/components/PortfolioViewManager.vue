<script>
import { findRouteForTab, getApp, pageTypes } from '@facilio/router'
import ViewManagerLayout from '../../../view/ViewManagerLayout.vue'
import { isEmpty } from '@facilio/utils/validation'
const env = import.meta.env

export default {
  extends: ViewManagerLayout,
  computed: {
    viewModuleName() {
      let { moduleName } = this
      return moduleName
    },
    url() {
      let { linkName } = getApp()
      let orgSubDomain = window.addOrgDomainInRootPath
        ? window.location.pathname.slice(1).split('/')[0]
        : null

      let url = `legacy/${
        orgSubDomain ? `${orgSubDomain}/` : ''
      }${linkName}/iframe/modules/${this.viewModuleName}/viewmanager`

      if (process.env.NODE_ENV === 'development') {
        return `${env.VITE_LEGACY_URL}/${url}`
      } else {
        return `/${url}`
      }
    },
  },
  methods: {
    goBackToList() {
      let { moduleName } = this
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_LIST) || {}
      name &&
        this.$router.push({
          name,
          params: {
            moduleName,
          },
        })
    },
    openViewCreation(routeObj) {
      if (!isEmpty(routeObj)) {
        let { name } = findRouteForTab(pageTypes.PORTFOLIO_VIEW_CREATION) || {}
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
