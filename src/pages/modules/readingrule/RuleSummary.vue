<script lang="jsx">
import { dset as setProperty } from 'dset'
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { ftoast } from '@facilio/design-system'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import { FDropdown, FContainer, FButton } from '@facilio/design-system'
import RuleWorkOrderForm from './RuleWorkOrderForm.vue'
import { isEmpty } from '@facilio/utils/validation'
export default {
  extends: ModuleSummary,
  name: 'RuleSummary',
  components: { FDropdown, FContainer, FButton, RuleWorkOrderForm },
  data() {
    return {
      showwoform: false,
      rulewoDetails: {},
    }
  },

  computed: {
    tagProps() {
      let { record } = this
      return {
        text: this.getRuleStatusDisplayName(record),
        appearance: 'status',
        statusType: this.getRuleStatusValue(record),
      }
    },
    ruleId() {
      let { record } = this
      return getProperty(record, 'id', null)
    },
    alarm() {
      return this.record
    },
    occurrence() {
      let { alarm } = this
      let { prevOccurrence } = alarm || {}
      return prevOccurrence
    },
    isFaultToWoEdit() {
      let { rulewoDetails } = this
      return !isEmpty(rulewoDetails)
    },
    moreButtonList() {
      return [
        {
          name: 'Edit',
          identifier: 'editNewRules',
          clickAction: this.editRecord,
        },
        {
          name: 'Activate',
          identifier: 'activateRule',
          clickAction: this.updateStatus,
        },
        {
          name: 'Deactivate',
          identifier: 'deactivateRule',
          clickAction: this.updateStatus,
        },

        ...(this.isFaultToWoEdit
          ? [
              {
                name: this.$t(
                  'systemButtons.fault_to_wo_edit',
                  'Edit Fault To Workorder Form',
                  {
                    ns: 'rule',
                  }
                ),
                identifier: 'editFddToWO',
                clickAction: this.showForm,
              },
              ...(this.record.isFDDWo
                ? [
                    {
                      name: this.$t(
                        'systemButtons.fault_to_wo_disable',
                        'Disable Fault To Workorder',
                        {
                          ns: 'rule',
                        }
                      ),
                      identifier: 'disableFDDToWo',
                      clickAction: this.disableFaultWO,
                    },
                  ]
                : [
                    {
                      name: this.$t(
                        'systemButtons.fault_to_wo_enable',
                        'Enable Fault To Workorder',
                        {
                          ns: 'rule',
                        }
                      ),
                      identifier: 'enableFDDToWo',
                      clickAction: this.disableFaultWO,
                    },
                  ]),
            ]
          : [
              {
                name: this.$t(
                  'systemButtons.fault_to_wo_creation',
                  ' Fault To Workorder',
                  {
                    ns: 'rule',
                  }
                ),
                identifier: 'fddToWO',
                clickAction: this.showForm,
              },
            ]),
      ]
    },
  },
  methods: {
    showForm() {
      let { moduleName, ruleId } = this
      let params = {
        ruleId,
        viewname: this.viewname,
        moduleName: 'newreadingalarm',
        rulename: getProperty(this.record, 'name'),
        isEdit: this.isFaultToWoEdit,
        details: this.rulewoDetails,
      }
      if (isWebTabsEnabled()) {
        let { name } =
          findRouteForModule(moduleName, pageTypes.MODULE_CUSTOM) || {}
        name &&
          this.$router.push({
            name,
            params,
          })
      }
    },
    async updateStatus() {
      let { alarm } = this
      let { id, status } = alarm || {}

      console.log(status === 'No')
      let params = {
        data: { status: status === 'No' },
        moduleName: this.moduleName,
        id: id,
      }

      let { error, data = {} } = await API.updateRecord(this.moduleName, params)

      if (!isEmpty(error)) {
        ftoast.critical(
          this.$t('error_occurred_short_message', 'Error Occurred', {
            ns: 'common',
          })
        )
      } else {
        ftoast.success(
          this.$t('summary.status_success', 'Status updated successfully', {
            ns: 'rule',
          })
        )
        this.record.status = status === 'No' ? 'Yes' : 'No'
      }
    },
    async loadFaultToWo() {
      await this.loadRuleWoDetails()
      await this.isFaultToWo()
    },
    async loadRecord(force = false) {
      try {
        let { moduleName, id } = this
        this.isLoading = true
        let rule = await this.modelDataClass.fetch({ moduleName, id, force })
        let { alarmDetails: { message } = {} } = rule || {}
        rule['message'] = message
        this.record = rule
      } catch (error) {
        ftoast.critical(
          error?.message ||
            'Error Occurred while fetching record detail summary'
        )
      }
      await this.loadFaultToWo()
      this.isLoading = false
    },

    async loadRuleWoDetails() {
      let { ruleId } = this
      let params = { ruleId }
      let { error, data } = await API.get(
        'v3/newreadingrules/fetchRuleWo',
        params
      )
      if (error) {
        ftoast.error(
          this.$t('error_occurred_short_message', 'Error Occurred', {
            ns: 'common',
          })
        )
      } else if (data) {
        let { faultToWorkorder } = data || {}
        delete faultToWorkorder.ruleId
        this.rulewoDetails = faultToWorkorder
      }
    },
    async isFaultToWo() {
      let { rulewoDetails, record } = this || {}
      let faultToWo = false
      if (rulewoDetails) {
        let { closeWo, woCreation } = rulewoDetails || {}
        let { status: closeStatus } = closeWo || {}
        let { status: createStatus } = woCreation || {}
        if (!isEmpty(createStatus) && !isEmpty(closeStatus)) {
          faultToWo = createStatus && closeStatus
        }
      }
      setProperty(this.record, 'isFDDWo', faultToWo)
    },

    async disableFaultWO() {
      let { ruleId, record } = this
      let { isFDDWo } = record || {}
      let params = { ruleId }
      let { error } = await API.get(
        'v3/readingrule/actions/updatewfStatus',
        params
      )
      if (error) {
        ftoast.error(
          this.$t('error_occurred_short_message', 'Error Occurred', {
            ns: 'common',
          })
        )
      } else {
        if (isFDDWo) {
          ftoast.success(
            this.$t(
              'faultToWorkorder.fault_to_wo_success',
              'Fault To Workorder configuration is enabled',
              {
                ns: 'rule',
              }
            )
          )
        } else {
          ftoast.success(
            this.$t(
              'faultToWorkorder.fault_to_wo_disable',
              'Fault To Workorder configuration is disabled',
              {
                ns: 'rule',
              }
            )
          )
        }
        this.record.isFDDWo = !isFDDWo
      }
    },
    getRuleStatusDisplayName(record) {
      let { status } = record || {}
      return status ? 'Active' : 'Inactive'
    },
    getRuleStatusValue(record) {
      let { status } = record || {}
      return status ? 'success' : 'danger'
    },
  },
}
</script>
