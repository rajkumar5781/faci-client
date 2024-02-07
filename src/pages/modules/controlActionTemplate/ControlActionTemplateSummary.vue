<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { CONTROL_ACTION_TEMPLATE_STATUS_MAP } from '../controlAction/widgets/controlsUtil.js'
import { ftoast } from '@facilio/design-system'
import { API } from '@facilio/api'
import CreateActionModal from './components/CreateActionModal.vue'
export default {
  extends: ModuleSummary,
  data() {
    return {
      CONTROL_ACTION_TEMPLATE_STATUS_MAP,
      systemActionLoading: false,
      showCreateActionPopup: false,
    }
  },
  components: { CreateActionModal },
  methods: {
    getProperty,
  },
  computed: {
    tagProps() {
      let { record } = this
      let { controlActionTemplateStatusEnum } = record || {}
      let tagDetail = CONTROL_ACTION_TEMPLATE_STATUS_MAP.filter(
        status => status.enum === controlActionTemplateStatusEnum
      )
      if (!isEmpty(tagDetail)) {
        return getProperty(tagDetail, '0', null)
      } else {
        return {}
      }
    },
    systemBtnList() {
      let { systemButtons = [] } = this
      systemButtons = systemButtons.filter(
        btn =>
          btn.identifier === 'publish' ||
          btn.identifier === 'unPublish' ||
          btn.identifier === 'createAction'
      )
      let buttons = systemButtons.map(sysBtn => {
        let { name, identifier } = sysBtn || {}
        return {
          name,
          identifier,
          loading: this.systemActionLoading,
          clickAction: this.systemButtonAction,
        }
      })

      return buttons
    },
  },
  methods: {
    defaultSpace() {
      return (
        <CreateActionModal
          showCreateActionModal={this.showCreateActionPopup}
          record={this.record}
          vOn:updateVisibility={this.updateVisibility}
          vOn:savedRecord={this.updateRecord}
        />
      )
    },
    updateVisibility(value) {
      this.showCreateActionPopup = value
    },

    systemButtonAction(activeButton) {
      let { identifier } = activeButton || {}
      if (identifier === 'createAction') {
        this.systemActionLoading = true
        this.showCreateActionPopup = true
        this.loadSystemButtons(true)
        this.loadRecord(true)
        this.systemActionLoading = false
      } else {
        this.processApi(activeButton)
      }
    },
    updateRecord() {
      this.systemButtonUpdateAction(activeButton)
      this.showCreateActionPopup = false
    },
    systemButtonUpdateAction(activeButton) {
      this.systemActionLoading = true
      let { identifier } = activeButton
      if (identifier === 'publish') {
        return 'v3/ControlActionTemplate/activate'
      }
      if (identifier === 'unPublish') {
        return 'v3/ControlActionTemplate/inActivate'
      }
    },
    async processApi(activeButton) {
      let { id, metaInfo = {} } = this
      let { displayName } = metaInfo
      let { identifier } = activeButton || {}
      let url = this.systemButtonUpdateAction(activeButton)
      let { error } = await API.post(url, { controlActionTemplateId: id })
      if (!error) {
        ftoast.success(
          this.$t('controls.system_btn_action_success', {
            ns: 'energy',
            moduleName: displayName,
            action: identifier,
          })
        )
        this.loadSystemButtons(true)
        this.loadRecord(true)
      } else {
        ftoast.critical(error?.message || this.$t('error_occured'))
      }
      this.systemActionLoading = false
    },
  },
}
</script>
