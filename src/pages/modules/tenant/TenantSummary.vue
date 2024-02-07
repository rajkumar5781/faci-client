<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { pageTypes, findRouteForModule } from '@facilio/router'

export default {
  name: 'TenantSummary',
  extends: ModuleSummary,
  computed: {
    moreButtonList() {
      return [
        {
          name: 'Edit',
          identifier: 'edit',
          clickAction: this.editRecord,
        },
        {
          name: 'Create Work order',
          identifier: 'createWorkorder',
          clickAction: this.createWo,
        },
        {
          name: 'Add Tenant Contact',
          identifier: 'addTenantContact',
          clickAction: this.addTenantContact,
        },
      ]
    },
  },
  methods: {
    createWo() {
      let { id, siteId } = this.record || {}
      let { name } = findRouteForModule('workorder', pageTypes.CREATE) || {}

      if (name) {
        let formDetails = JSON.stringify({ tenant: id, siteId })
        this.$router.push({ name, query: { formDetails } })
      }
    },
    addTenantContact() {
      let { name } = findRouteForModule('tenantcontact', pageTypes.CREATE) || {}
      let formDetails = JSON.stringify({ tenant: this.id })

      if (name) this.$router.push({ name, query: { formDetails } })
    },
  },
}
</script>
