<template></template>
<script>
import FetchViewsMixin from '/src/components/views/FetchViews.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'

export default {
  mixins: [FetchViewsMixin],
  async created() {
    try {
      await this.redirectionHandler()
    } catch (err) {
      console.error('Problem redirecting to summary')
      this.pageNotFound()
    }
  },
  methods: {
    async redirectionHandler() {
      let { $route } = this
      let { params } = $route || {}
      let { moduleName, id } = params || {}
      if (isEmpty(moduleName) || isEmpty(id)) {
        throw new Error()
      }
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      let viewname = await this.fetchView(moduleName)
      if (isEmpty(name) || isEmpty(viewname)) {
        throw new Error()
      }
      this.$router.push({
        name,
        params: { viewname, id },
      })
    },
    pageNotFound() {
      this.$router.push({
        name: 'pagenotfound',
      })
    },
  },
}
</script>
