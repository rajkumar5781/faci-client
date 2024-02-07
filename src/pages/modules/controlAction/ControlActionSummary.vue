<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { STATUS_MAP ,isSimulationExecutionType} from './widgets/controlsUtil'
import { ftoast } from '@facilio/design-system'
import { API } from '@facilio/api'

export default {
  extends: ModuleSummary,
  data() {
    return {
      STATUS_MAP,
      systemActionLoading: false,
    }
  },
  methods: {
    getProperty,
  },
  computed: {
    tagProps() {
      let { record } = this
      let { controlActionStatusEnum } = record || {}
      let tagDetail = STATUS_MAP.filter(
        status => status.enum === controlActionStatusEnum
      )
      if (!isEmpty(tagDetail)) {
        return getProperty(tagDetail, '0', null)
      } else {
        return {}
      }
    },
    showSimulationBanner(){
      return isSimulationExecutionType(getProperty(this , 'record.controlActionExecutionType', 1))
    },
    notificationDetails() {
      let {  showSimulationBanner } = this
      if (showSimulationBanner) {
        return {
          description: this.$t('controls.simulation_banner', { ns: 'energy' }),
          hideCloseIcon: true,
        }
      } 
      return {
        description: this.approvalText,
        hideCloseIcon: true,
      }
    },
    isApprovalEnabled() {
      let { showSimulationBanner } = this
      return showSimulationBanner
    },
    systemBtnList() {
      let { systemButtons = [] } = this
      systemButtons = systemButtons.filter(btn => (btn.identifier === 'publish' || btn.identifier === 'unPublish' || btn.identifier === 'cancelControlAction'))
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
    async systemButtonAction() {
      this.systemActionLoading = true
      let { id, systemBtnList, metaInfo } = this
      let { displayName } = metaInfo || {}
      let activeButton = systemBtnList[0] || {}
      let { identifier, name } = activeButton || {}
      let url = 'v3/ControlAction/unPublishV3ControlAction'
      if(identifier == 'publish'){
        url = 'v3/ControlAction/publishV3ControlAction'
      }
      if(identifier == 'cancelControlAction'){
        url = 'v3/ControlAction/cancelV3ControlAction'
      }
      let { error } = await API.post(url, { controlActionId: id })
      if (!error) {
        ftoast.success(
          this.$t('controls.system_btn_action_success', {
            ns: 'energy',
            moduleName: displayName,
            action: name,
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
