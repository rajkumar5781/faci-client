<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'

export default {
  extends: ModuleSummary,
  name: 'ServicePMSummary',
  data() {
    return {
      publishButtonLoading: false,
    }
  },
  computed: {
    tagProps() {
      let { record } = this || {}
      let { isPublished = false } = record || {}
      let publishStatus = isPublished ? 'Published' : 'Unpublished'
      return {
        appearance: 'status',
        text: publishStatus,
        statusType: 'default',
      }
    },
    systemBtnList() {
      let { publishButtonLoading } = this
      return [
        {
          name: 'Publish',
          identifier: 'publish',
          clickAction: this.publishPm,
          loading: publishButtonLoading,
        },
      ]
    },
  },
  methods: {
    actionBar() {
      return
    },
    defaultSpace() {
      return
    },
    async invokeSystemButton(buttonIdentifier, params = {}) {
      let { record } = this || {}
      let url = `v3/module/servicePlannedMaintenance/${record?.id}/systemButton/${buttonIdentifier}`
      let { error, data } = await API.post(url, params)
      return { error, data }
    },
    async publishPm(buttonObj) {
      let { refreshData } = this || {}
      let { identifier = 'publish' } = buttonObj || {}
      this.publishButtonLoading = true
      let { error, data } = await this.invokeSystemButton(identifier)
      this.publishButtonLoading = false
      if (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        let { servicePMStatusActions } = data || {}
        let {
          message = this.$t('service_pm.publish_success_msg', {
            ns: 'fsm',
          }),
        } = servicePMStatusActions || {}
        ftoast.success(message, {
          menuType: 'alerts',
          timeout: 5000,
        })
        refreshData()
      }
    },
    refreshData() {
      this.loadRecord(true)
      this.loadSystemButtons(true)
    },
  },
}
</script>
