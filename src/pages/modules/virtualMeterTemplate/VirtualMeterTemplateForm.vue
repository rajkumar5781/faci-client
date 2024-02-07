<template>
  <MicroEmbed
    v-if="formUrl"
    ref="virtual-meter-template-form"
    name="facilio-client"
    :url="formUrl"
    :handlers="handlers"
    @saveVMTemplate="saveVMTemplate"
    @cancel="handleCancel"
  />
</template>

<script>
import MicroEmbed from '../../../components/micro-embed/MicroEmbed.vue'
import { getBaseURL } from '../../../utils/api/base-url'
import getProperty from 'dlv'
import { getApp, findRouteForModule, pageTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import { ftoast } from '@facilio/design-system'

export default {
  name: 'NewVirtualMeterTemplate',
  components: { MicroEmbed },
  props: ['moduleName'],
  data: () => ({
    handlers: {},
  }),
  computed: {
    templateId() {
      return getProperty(this, '$route.params.id', null)
    },
    formUrl() {
      let { templateId } = this
      let { location } = window || {}
      let { linkName } = getApp() || {}
      let orgSubDomain = window.addOrgDomainInRootPath
        ? window.location.pathname.slice(1).split('/')[0]
        : null

      let protocol = getProperty(location, 'protocol', '')
      let host = getProperty(location, 'host', '')
      let formUrl = isEmpty(templateId)
        ? 'iframe/virtualMeterTemplate/create'
        : `iframe/virtualMeterTemplate/${templateId}/edit`
      let frameUrl = `${protocol}//${host}/legacy/${
        orgSubDomain ? `${orgSubDomain}/` : ''
      }${linkName}/${formUrl}`

      return frameUrl
    },
    moduleDisplayName() {
      return 'Virtual Meter Template'
    },
  },
  mounted() {
    this.handlers = {
      getAppId: this.getAppId,
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
    getAppId() {
      return getApp().id
    },
    saveVMTemplate(props) {
      let { moduleDisplayName } = this
      let { type, id, message } = props || {}

      if (type === 'error') {
        let errorMessage = !isEmpty(message)
          ? message
          : this.$t('error_occured')
        ftoast.critical(errorMessage)
      } else {
        ftoast.success(
          this.$t('controls.system_btn_action_success', {
            ns: 'energy',
            moduleName: moduleDisplayName,
            action: type,
          })
        )
        this.redirectToSummary(id)
      }
    },
    handleCancel() {
      this.$router.go(-1)
    },
    redirectToList() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.LIST)

      if (name) {
        this.$router.push({
          name,
          params: { viewname: 'all' },
        })
      }
    },
    redirectToSummary(id) {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW)

      if (name) {
        this.$router.push({
          name,
          params: { viewname: 'all', id },
        })
      }
    },
  },
}
</script>
