<script>
import { findRouteForTab, pageTypes } from '@facilio/router'
import ViewCreationForm from '../../../view/ViewCreationForm.vue'
export default {
  extends: ViewCreationForm,
  computed: {
    viewModuleName() {
      let { moduleName } = this
      return moduleName
    },
  },
  methods: {
    redirectToList() {
      let { viewname, moduleName } = this
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_LIST) || {}

      if (name) {
        this.$router.replace({
          name,
          params: { viewname, moduleName },
          query: {},
        })
      }
    },
    onViewCancel(data) {
      let { moduleName } = data
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_VIEWS) || {}

      name && this.$router.push({ name, params: { moduleName } })
    },
    breadcrumbAction(pageType) {
      switch (pageType) {
        case pageTypes.VIEW_MANAGER:
          pageType = pageTypes.PORTFOLIO_VIEWS
          break
        case pageTypes.LIST:
          pageType = pageTypes.PORTFOLIO_LIST
          break
      }
      let { moduleName } = this
      let { name } = findRouteForTab(pageTypes[pageType]) || {}

      name && this.$router.push({ name, params: { moduleName } })
    },
  },
}
</script>
