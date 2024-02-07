<script>
import { FContainer, FSpinner } from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import TenantPrimaryContactDetails from '../tenantWidgets/TenantPrimaryContactDetails.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'

export default {
  extends: TenantPrimaryContactDetails,
  name: 'TenantUnitTenant',
  components: { FContainer, TenantPrimaryContactDetails, FSpinner },
   computed: {
    tenantPrimaryName() {
      return getProperty(this.details, 'tenant.primaryContactName', '---')
    },
    tenantPrimaryPhone() {
      return getProperty(this.details, 'tenant.primaryContactPhone', '---')
    },
    tenantPrimaryEmail() {
      return getProperty(this.details, 'tenant.primaryContactEmail', '---')
    },
    showEmptyState() {
      let name = getProperty(this.details, 'tenant.primaryContactName', null)
      let phone = getProperty(this.details, 'tenant.primaryContactPhone', null)
      let email = getProperty(this.details, 'tenant.primaryContactEmail', null)
      return isEmpty(name) && isEmpty(phone) && isEmpty(email)
    },
    getTenantPrimaryContactId() {
      let peopleTenantContacts =
        getProperty(this.details, 'tenant.peopleTenantContacts',[])  
      let { id } =
        peopleTenantContacts.find(contact => contact.isPrimaryContact) || {}

      return id
    },
  },
  methods: {
    async redirectToOverview() {
      let { id } = this.details?.tenant || {}
      if (isEmpty(id)) return

      let { name } = findRouteForModule('tenant', pageTypes.OVERVIEW) || {}

      if (name) {
        let viewname = await this.fetchView(moduleName)
        let route = this.$router.resolve({
          name,
          params: { id, viewname },
        }).href
        window.open(route, '_blank')
      }
    },
  },
}
</script>
