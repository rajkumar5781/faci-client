<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import dlv from 'dlv'

export default {
  methods: {
    async fetchView(moduleName) {
      try {
        let params = { moduleName, groupType: 1, viewType: 1 }
        let { data, error } = await API.get(
          `/v2/views/${moduleName}/viewList`,
          params
        )
        if (!error) {
          let { groupViews } = data || {}
          return this.getFirstView(groupViews)
        }
      } catch (error) {
        return 'all'
      }
    },

    getFirstView(groupViews) {
      let { views } =
        (groupViews || []).find(group => !isEmpty(group.views)) || {}
      let { name } = dlv(views, '0', {})

      return name || 'all'
    },
  },
}
</script>
