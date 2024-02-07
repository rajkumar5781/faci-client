<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { ftoast } from '@facilio/design-system'
import getProperty from 'dlv'
import setProperty from 'dlv'
export default {
  extends: ModuleSummary,
  data() {
    return {
      returnLineItemVisibilty: false,
      pendingLineItems: null,
      receivedPoLineItems: null,
      addReceiptVisibilty: false,
      visible: false,
    }
  },
  computed: {
    mainFieldKey() {
      return 'requestSubject'
    },
    tagProps() {
      let { record = {} } = this
      if (record.isStateFlowEnabled() && record.currentModuleState()) {
        return {
          text: record.currentModuleState(),
          appearance: 'status',
          statusType: 'information',
        }
      } else {
        return {}
      }
    },
    systemBtnList() {
      return [
        {
          name: 'Stage Request',
          identifier: 'stageRequest',
          clickAction: this.stageRequest,
           appearance: 'primary',
        },
        {
          name: 'Ship Request',
          identifier: 'shipRequest',
          clickAction: this.shipRequest,
          appearance: 'primary',
        },
        {
          name: 'Complete Request',
          identifier: 'completeRequest',
          clickAction: this.completeRequest,
          appearance: 'primary',
        },
        {
          name: 'Go To Shipment',
          identifier: 'goToShipment',
          clickAction: this.goToShipment,
          appearance: 'primary',
        },
      ]
    },
  },
  methods: {
    getProperty,
    goToShipment() {
      this.summaryDropDownAction('go_to_shipment')
    },
    stageRequest() {
      this.summaryDropDownAction('stage_request')
    },
    shipRequest() {
      this.summaryDropDownAction('ship_request')
    },
    completeRequest() {
      this.summaryDropDownAction('complete_request')
    },
    async summaryDropDownAction(action) {
      let { moduleName, id, record } = this
      let successMsg
      if (
        ['stage_request', 'ship_request', 'complete_request'].includes(action)
      ) {
        if (action === 'stage_request') {
          record.isStaged = true
          successMsg = this.$t('tr.staged', { ns: 'procurement' })
        } else if (action === 'ship_request') {
          record.isShipped = true
        } else if (action === 'complete_request') {
          record.isCompleted = true
          successMsg = this.$t('tr.completed', { ns: 'procurement' })
        }
        let { error = {} } = await API.updateRecord(moduleName, {
          id,
          data: record,
        })
        if (error) {
          let { message } = error
          ftoast.critical(message)
        } else {
          if (!isEmpty(successMsg)) {
            ftoast.success(successMsg)
            this.loadSystemButtons(true)
            this.loadRecord(true)
          }
        }
        if (action === 'ship_request') {
          let shipmentRecord = {}
          setProperty(shipmentRecord, 'transferRequest', { id })
          setProperty(
            shipmentRecord,
            'expectedCompletionDate',
            record.expectedCompletionDate
          )
          setProperty(shipmentRecord, 'isCompleted', record.isCompleted)
          let { error = {} } = await API.createRecord(
            'transferrequestshipment',
            {
              data: shipmentRecord,
            }
          )
          if (error) {
            let { message } = error
            ftoast.critical(message)
          } else {
            let successMsg = this.$t('tr.shiped', { ns: 'procurement' })
            ftoast.success(successMsg)
            this.loadSystemButtons(true)
            this.loadRecord(true)
          }
        }
      }
      if (action === 'go_to_shipment') {
        let id = getProperty(this, 'record.shipmentId')
        let { name } =
          findRouteForModule('transferrequestshipment', pageTypes.OVERVIEW) ||
          {}
        name &&
          this.$router.push({
            name,
            params: {
              id,
              viewname: this.viewname,
              query: this.$route.query,
            },
          })
      }
    },
  },
}
</script>
