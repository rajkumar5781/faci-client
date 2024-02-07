<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import {
  FContainer,
  FButton,
  FPopover,
  FMenuItem,
  ftoast,
} from '@facilio/design-system'

import { API } from '@facilio/api'
import getProperty from 'dlv'
export default {
  name: 'UtilityDisputeSummary',
  components: {
    FContainer,
    FButton,
    FPopover,
    FMenuItem,
  },
  extends: ModuleSummary,
  data() {
    return {
      resolveDisputeBtnLoading: false,
    }
  },

  computed: {
    mainFieldKey() {
      return 'subject'
    },
    utilityDisputeId() {
      let utilityDisputeId = getProperty(this, 'record.id', -1)
      return utilityDisputeId
    },
    canShowResolve() {
      let { availableSystemButtons = {} } = this
      return availableSystemButtons.includes('resolveDispute')
    },

    tagProps() {
      let { record = {} } = this
      let { moduleState = {} } = record
      let { status = {} } = moduleState
      let displayName = getProperty(moduleState, 'displayName')
      let type = ''
      if (displayName === 'Under Dispute') {
        type = 'warning'
      } else {
        type = 'success'
      }
      if (status) {
        return {
          appearance: 'status',
          text: displayName || '',
          statusType: type,
        }
      }
      return { appearance: 'status', text: '' }
    },
    systemBtnList() {
      let { resolveDisputeBtnLoading } = this
      return [
        {
          name: this.$t('utility.resolve_dispute', { ns: 'energy' }),
          identifier: 'resolveDispute',
          clickAction: this.resolveDispute,
          loading: resolveDisputeBtnLoading,
        },
      ]
    },
  },
  methods: {
    async invokeSystemButton(buttonIdentifier, params = {}) {
      let { record } = this || {}
      let url = `v3/module/utilityDispute/${record.id}/systemButton/${buttonIdentifier}`
      let { error, data } = await API.post(url, params)
      return { error, data }
    },
    async resolveDispute(buttonObj) {
      let params = {}
      this.resolveDisputeBtnLoading = true
      let { error, data } = await this.invokeSystemButton(
        'resolveDispute',
        params
      )
      this.resolveDisputeBtnLoading = false
      buttonObj.onActionComplete()
      if (error) {
        ftoast.critical(this.$t('utility.error_occured', { ns: 'energy' }))
      } else {
        let { utilityDisputeStatus } = data || {}
        if (utilityDisputeStatus) {
          let { message = '' } = utilityDisputeStatus || {}
          ftoast.success(message)
          this.loadSystemButtons(true)
          this.refreshData()
        }
      }
    },

    refreshData() {
      this.loadRecord(true)
    },
  },
}
</script>
