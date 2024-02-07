<template>
  <div>
    <NewAdvanceFilterWrapper
      :moduleName="moduleName"
      :searchParam="searchParam"
      :hideQuery="hideQuery"
      :filterList="filters"
      @applyFilters="applyFilters"
    ></NewAdvanceFilterWrapper>
  </div>
</template>

<script>
import { FIcon, FModal } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { NewAdvanceFilterWrapper } from '@facilio/criteria'
import 'ant-design-vue/lib/drawer/style/index.css'
import getProperty from 'dlv'

export default {
  name: 'AdvancedSearchWrapper',
  components: { FIcon, FModal, NewAdvanceFilterWrapper },
  props: ['moduleName', 'moduleDisplayName', 'filters', 'hideQuery', 'onSave'],
  computed: {
    searchParam() {
      let { $route } = this
      let { query } = $route || {}
      let { search } = query || {}
      if (!isEmpty(search)) {
        return search
      }
      return ''
    },
  },
  methods: {
    applyFilters(filters) {
      let { hideQuery } = this
      if (hideQuery) {
        this.onSave({ filters })
      } else {
        let currentRoute = this.$route
        let existingFilters = getProperty(currentRoute, 'query', null)
        let query = existingFilters ? { ...existingFilters } : {}

        query.search = JSON.stringify(filters)
        query.includeParentFilter = true
        delete query.page

        this.$router.replace({ query }).catch(() => {})
      }
    },
  },
}
</script>
