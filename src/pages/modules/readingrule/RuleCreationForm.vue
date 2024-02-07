<template>
  <MicroEmbed
    v-if="url"
    ref="ruleCreation"
    name="facilio-client"
    :url="url"
    :handlers="handlers"
    @ruleEvents="handleEvents"
  />
</template>

<script>
import MicroEmbed from '../../../components/micro-embed/MicroEmbed.vue'
import { FContainer } from '@facilio/design-system'
import getProperty from 'dlv'
import { getApp } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
export default {
  props: ['moduleName', 'viewname'],
  components: { FContainer, MicroEmbed },
  data() {
    return {
      url: '',
      handlers: {},
    }
  },
  computed: {
    getCurrentApp() {
      let { linkName } = getApp() || {}
      return linkName
    },
    isEditForm() {
      let ruleId = getProperty(this.$route.params, 'id', null)
      return !isEmpty(ruleId)
    },
    getRuleId() {
      let ruleId = getProperty(this.$route.params, 'id', null)
      return ruleId
    },
    getCurrentAppId() {
      return getApp().id || {}
    },
  },
  mounted() {
    this.setRuleFormUrl()
    this.handlers = {
      getAppId: this.getCurrentAppId,
      baseUrl: this.baseUrl,
      fetchAccountDetails: this.accountDetails,
    }
  },
  methods: {
    baseUrl() {
      return getBaseURL()
    },
    accountDetails() {
      return Vue.prototype.$account
    },
    handleEvents(obj) {
      let { id } = obj || {}
      this.redirectToOverview(id)
    },
    redirectToOverview(ruleId) {
      let { moduleName, viewname } = this
      if (isEmpty(viewname)) {
        viewname = 'all'
      }
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      if (!isEmpty(name)) {
        this.$router.push({ name, params: { viewname, id: ruleId } })
      }
    },
    setRuleFormUrl() {
      let { location } = window || {}
      let protocol = getProperty(location, 'protocol', '')
      let host = getProperty(location, 'host', '')
      let { getCurrentApp } = this
      let orgSubDomain = window.addOrgDomainInRootPath
        ? window.location.pathname.slice(1).split('/')[0]
        : null

      let url = `${protocol}//${host}/legacy/${
        orgSubDomain ? `${orgSubDomain}/` : ''
      }${getCurrentApp}/${this.getPath()}`
      this.url = url
    },
    getPath() {
      let path = ''
      if (this.isEditForm) {
        path = `iframe/newrule/${this.getRuleId}/edit`
      } else {
        path = 'iframe/newrules/new'
      }
      return path
    },
  },
}
</script>
