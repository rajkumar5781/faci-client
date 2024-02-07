<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import {
  FContainer,
  FButton,
  FPopover,
  FMenuItem,
  ftoast,
  fDialog,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import getProperty from 'dlv'
export default {
  name: 'ServiceOrderSummary',
  components: {
    FContainer,
    FButton,
    FPopover,
    FMenuItem,
  },
  extends: ModuleSummary,
  data() {
    return {
      cancelSOBtnLoading: false,
      completeSOBtnLoading: false,
      closeSOBtnLoading: false,
      notesModuleName: 'serviceOrderNotes',
      attachmentsModuleName: 'serviceOrderAttachments',
    }
  },
  computed: {
    tagProps() {
      let { record } = this || {}
      if (record?.status) {
        return {
          appearance: 'status',
          text: record.status?.displayName || '',
          statusType: record.status?.color || '',
        }
      }
      return { appearance: 'status', text: '' }
    },
    systemBtnList() {
      let { completeSOBtnLoading, closeSOBtnLoading } = this
      return [
        {
          name: 'Complete',
          identifier: 'completeWork',
          clickAction: this.completeSO,
          loading: completeSOBtnLoading,
        },
        {
          name: 'Close',
          identifier: 'closeSO',
          clickAction: this.closeSO,
          loading: closeSOBtnLoading,
        },
      ]
    },
    moreButtonList() {
      return [
        {
          name: 'Cancel',
          identifier: 'cancelSO',
          clickAction: this.cancelSO,
        },
        {
          name: 'Edit',
          identifier: 'edit_summary',
          appearance: 'tertiary',
          clickAction: this.editRecord,
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
      let url = `v3/module/serviceOrder/${record?.id}/systemButton/${buttonIdentifier}`
      let { error, data } = await API.post(url, params)
      return { error, data }
    },
    async cancelSO(buttonObj, validate = true) {
      let { refreshData } = this || {}
      let { identifier = 'cancelSO' } = buttonObj || {}
      this.cancelSOBtnLoading = true
      let { error, data } = await this.invokeSystemButton(identifier, {
        validate,
      })
      this.cancelSOBtnLoading = false
      if (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        if (validate && data?.serviceOrderStatusActions) {
          let {
            message = this.$t('service_order.cancel_warning_desc', {
              ns: 'fsm',
            }),
            title = this.$t('service_order.cancel_warning_title', {
              ns: 'fsm',
            }),
          } = data.serviceOrderStatusActions
          let val = await fDialog.warning({
            title: title,
            description: message,
          })
          if (val) {
            await this.cancelSO(buttonObj, !val)
          }
        } else {
          if (data?.serviceOrderStatusActions) {
            let { message = '', title = '' } = data.serviceOrderStatusActions
            ftoast.success(message, {
              title: title,
              menuType: 'alerts',
              timeout: 3000,
            })
            refreshData()
          }
        }
      }
    },
    async completeSO(buttonObj, validate = true) {
      let { refreshData } = this || {}
      let { identifier = 'completeWork' } = buttonObj || {}
      this.completeSOBtnLoading = true
      let { error, data } = await this.invokeSystemButton(identifier, {
        validate,
      })
      this.completeSOBtnLoading = false
      if (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        if (validate && data?.serviceOrderStatusActions) {
          let {
            message = this.$t('service_order.complete_warning_desc', {
              ns: 'fsm',
            }),
            title = this.$t('service_order.complete_warning_title', {
              ns: 'fsm',
            }),
          } = data.serviceOrderStatusActions
          let val = await fDialog.warning({
            title: title,
            description: message,
          })
          if (val) {
            await this.completeSO(buttonObj, !val)
          }
        } else {
          if (data?.serviceOrderStatusActions) {
            let { message = '', title = '' } = data.serviceOrderStatusActions
            ftoast.success(message, {
              title: title,
              menuType: 'alerts',
              timeout: 3000,
            })
            refreshData()
          }
        }
      }
    },
    async closeSO(buttonObj) {
      let { refreshData } = this || {}
      let { identifier = 'closeSO' } = buttonObj || {}
      this.closeSOBtnLoading = true
      let { error, data } = await this.invokeSystemButton(identifier)
      this.closeSOBtnLoading = false
      if (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        if (data?.serviceOrderStatusActions) {
          let { message = '', title = '' } = data.serviceOrderStatusActions
          ftoast.success(message, {
            title: title,
            menuType: 'alerts',
            timeout: 3000,
          })
          refreshData()
        }
      }
    },
    refreshData() {
      this.loadRecord(true)
      this.loadSystemButtons()
    },
  },
}
</script>
