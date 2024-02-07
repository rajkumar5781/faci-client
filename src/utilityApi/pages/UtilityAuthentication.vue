<template>
  <FContainer
    height="100%"
    width="99%"
    marginRight="containerLarge"
    display="flex"
    justifyContent="center"
    alignItems="center"
  >
    <FSpinner :size="50" />
  </FContainer>
</template>
<script>
import { FContainer, FSpinner ,ftoast} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { findRouteForModule, pageTypes } from '@facilio/router'
import router from '../../router'

export default {
  name: 'UtilityAuthentication',
  components: {
    FContainer,
    FSpinner,
  },
  created() {
    this.checkCanCreate()
  },
  methods: {
    checkCanCreate() {
      let { $route = {} } = this
      let { query = {} } = $route
      let { referral, state } = query

      if (!isEmpty(referral) && !isEmpty(state)) {
        this.addUtilityCustomer(referral, state)
      }
    },
    async addUtilityCustomer(referral, state) {
      let url = 'v3/utilityIntegration/fetchUtilityCustomerAndMeter'
      let params = { referral, state }
      let moduleName = 'utilityIntegrationCustomer'
      let { error } = await API.post(url, params)

      if (!error) {
        let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}
        let params = { viewname: 'all' }
        let route = { name, params }
        let { href } = router.resolve(route) || {}

        if (!isEmpty(href)) {
          window.parent.location.href = href
        }
        ftoast.success(
          this.$t('utility.utility_account_has_been_successfully_associated', {
            ns: 'energy',
          })
        )
      } else {
        let { message } = error || {}
        ftoast.critical(message || this.$t('error_occured'))
      }
    },
  },
}
</script>
