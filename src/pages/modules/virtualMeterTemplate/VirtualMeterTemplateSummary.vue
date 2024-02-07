<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import ResourceListDialog from './ResourceListDialog.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

const STATUS = [
  {
    text: 'UnPublished',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'red',
    enum: 'UN_PUBLISHED',
  },
  {
    text: 'Published',
    appearance: 'accent',
    accentLevel: 'L2',
    accentColor: 'green',
    enum: 'PUBLISHED',
  },
]
export default {
  extends: ModuleSummary,
  name: 'VirtualMeterTemplateSummary',
  data: () => ({
    systemActionLoading: false,
    canShowGenerateWizard: false,
  }),
  computed: {
    tagProps() {
      let { record = {} } = this
      let { vmTemplateStatusEnum } = record
      let tagDetail = STATUS.find(
        status => status.enum === vmTemplateStatusEnum
      )

      return !isEmpty(tagDetail) ? tagDetail : {}
    },
    systemBtnList() {
      let { systemButtons = [] } = this
      systemButtons = systemButtons.filter(
        btn => btn.identifier !== 'edit_summary'
      )
      let buttons = (systemButtons || []).map(sysBtn => {
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
        this.canShowGenerateWizard && (
          <ResourceListDialog
            canShowGenerateWizard={this.canShowGenerateWizard}
            record={this.record}
            moduleName={this.moduleName}
            vOn:saveDialog={this.saveVMDialog}
            vOn:closeDialog={() => {
              this.canShowGenerateWizard = false
            }}
          ></ResourceListDialog>
        )
      )
    },
    async systemButtonAction() {
      this.systemActionLoading = true
      let { id, systemBtnList } = this
      let activeButton = systemBtnList[0] || {}
      let { identifier } = activeButton || {}
      if (identifier === 'virtualMeterTemplatePublish') {
        await this.publishVMTemplate(id)
      } else if (identifier === 'generateVirtualMeter') {
        this.canShowGenerateWizard = true
      }

      this.systemActionLoading = false
    },
    async publishVMTemplate(id) {
      this.systemActionLoading = true
      let { error } = await API.post('v3/virtualMeterTemplate/publish', {
        vmTemplateId: id,
      })

      if (!error) {
        ftoast.success(
          this.$t('meter.system_btn_action_success', {
            ns: 'energy',
            moduleName: 'Virtual Meter Template',
            action: 'Publish',
          })
        )
        this.refreshData()
      } else {
        ftoast.critical(error?.message || this.$t('error_occured'))
      }
      this.systemActionLoading = false
    },
    saveVMDialog() {
      this.canShowGenerateWizard = false
      this.refreshData()
    },
  },
}
</script>
