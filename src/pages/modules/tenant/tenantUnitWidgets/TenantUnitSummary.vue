<script lang="jsx">
import ModuleSummary from '../../../summary/ModuleSummary.vue'
import { pageTypes, findRouteForModule } from '@facilio/router'

export default {
  name: 'TenantUnitSummary',
  extends: ModuleSummary,
  computed: {
    moreButtonList() {
      return [
        {
          name: 'EDIT',
          identifier: 'edit',
          clickAction: this.editRecord,
        },
        {
          name: 'Create Work order',
          identifier: 'createWorkorder',
          clickAction: this.createWo,
        },
      ]
    },
  },
  methods: {
    createWo() {
      let { id, siteId } = this.record || {}
      let { name } = findRouteForModule('workorder', pageTypes.CREATE) || {}

      if (name) {
        let formDetails = JSON.stringify({ resource: id, siteId })
        this.$router.push({ name, query: { formDetails } })
      }
    },
  },
}
</script>
