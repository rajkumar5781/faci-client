	<template>
  <FContainer class="full-page-container"
  height="100%"
  width="100%"
  display="flex">
  <FContainer
    v-if="utilityUrl"
    ref="utilityApiIframe"
    height="100%"
    width="100%"
    borderRadius="high"
    border="1px solid"
    borderColor="borderNeutralBaseSubtle"
    marginRight="containerLarge"
    tag="iframe"
    :src="utilityUrl"
    class="utility-api-site-container"
    id="utility-api-site"
  >
  <FModal
  :title="$t('utility.leave_page', { ns: 'energy' })"
  :visible="showConfirmation"
  @cancel="cancelLeave"
  @ok="leaveAnyway"
  :size="'S'"
  :saveText="$t('utility.leave_anyway', { ns: 'energy' })"
  height="auto"
  >
  <FContainer 
    padding="containerXLarge sectionSmall">
      <FText>{{ this.$t('utility.are_you_sure_you_want_to_leave_this_page', { ns: 'energy' }) }}</FText>
      </FContainer>
</FModal>
  </FContainer>
  </FContainer>
</template>
<script>
import { FContainer,FText,FButton,ftoast,FModal } from '@facilio/design-system'
import getProperty from 'dlv'
import { API } from '@facilio/api'
import {
  
  findRouteForModule,
  pageTypes,
} from '@facilio/router'

const utilityAuthUrlHash = {
  'http://localhost:9090': 'https://utilityapi.com/authorize/keerthana_facilio',
  'https://stage.facilio.in':
    'https://utilityapi.com/authorize/keerthana+stage_facilio',
  'https://stage2.facilio.in':
    'https://utilityapi.com/authorize/keerthana+stage2_facilio',
}

export default {
  name: 'AddUtilityApiAccount',
  beforeRouteLeave(to, from, next) {

    let fromName = getProperty(from, 'name', '')
    let toName = getProperty(to, 'name', '')
    let routeName = 'utility-utilityAccount-utilityIntegrationCustomer-create'

    if(!this.confirmationHandled && fromName === routeName && toName !== routeName){
      this.showConfirmation = true; 
      this.confirmationHandled = true;
    }
    else {
      this.showConfirmation = false; 
      next(); 
    }
    
  },
  components: { FContainer,FButton,FText,ftoast,FModal  },
  data() {
    return {
      showConfirmation: false,
      isLoading: false,
      confirmationHandled: false,
      moduleName:'utilityIntegrationCustomer'

    };
  },
  computed: {
    utilityUrl() {
      let { $route = {} } = this
      let { query = {} } = $route
      let secretState = getProperty(query, 'secretState', '')

      let { location = {} } = window
      let { protocol, host } = location || {}

      let domain = `${protocol}//${host}`

      let redirectUri = `${domain}/energy/utilityCustomer/authenticate`
      redirectUri = encodeURIComponent(redirectUri)

      let baseUtilityUrl = getProperty(
        utilityAuthUrlHash,
        domain,
        'https://utilityapi.com/authorize/facilio_data_request'
      )

      let url = `${baseUtilityUrl}?redirect_uri=${redirectUri}&state=${secretState}`

      return url
    },
  },
  methods: {
    async leaveAnyway() {
      this.isLoading = true;

      let { $route = {} } = this
      let { query = {} } = $route
      let secretState = getProperty(query, 'secretState', '')
  
        let { error, data } = await API.post(
        `v3/utilityIntegration/removeDummyAccount`,
        {
          secretState
        }
      )
        
        if (!error) {
          ftoast.success(this.$t('utility.successfully_left_the_page', { ns: 'energy' }));
          this.isLoading = false;
          this.showConfirmation = false;
          this.redirectToList();
        } else {
          ftoast.critical(this.$t('utility.error_occurred', { ns: 'energy' }));
          this.showConfirmation = false;
          this.isLoading = false;
          this.redirectToList();
        }

      
    },
    redirectToList() { 
      let { name } = findRouteForModule(this.moduleName, pageTypes.LIST) || {};
      if (name) {
        this.$router.push({ name,params: { viewname: 'all' }, });
      }
    },
    cancelLeave() {
      // Close the confirmation dialog
      this.showConfirmation = false;
      this.confirmationHandled = false;
    },
  },
}
</script>



