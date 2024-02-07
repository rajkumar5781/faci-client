<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { getStatusEnumMap } from '../Rfq/utils/purchaseUtils.js'
import PoReciepts from '/src/pages/modules/receivables/receipts/PoReciepts.vue'
import { ftoast } from '@facilio/design-system'
const STATUS_ENUM_MAP = {
  YET_TO_RECEIVE: 'default',
  PARTIALLY_RECEIVED: 'warning',
}
export default {
  extends: ModuleSummary,
  data() {
    return {
      returnLineItemVisibilty: false,
      pendingLineItems: null,
      receivedPoLineItems: null,
      addReceiptVisibilty: false,
    }
  },
  computed: {
    getHeader() {
      return getProperty(this, 'record.poId.name', '')
    },
    mainFieldKey() {
      return 'poId.name'
    },
    statusEnumMap() {
      let { metaInfo = {} } = this
      let { fields = [] } = metaInfo
      return getStatusEnumMap(fields, 'status')
    },
    tagProps() {
      let { record = {}, statusEnumMap } = this
      let { status, statusEnum } = record
      if (!isEmpty(status)) {
        return {
          text: getProperty(statusEnumMap, `${status}`),
          appearance: 'status',
          statusType: getProperty(STATUS_ENUM_MAP, statusEnum, 'success'),
        }
      } else {
        return {}
      }
    },
    canShowAddOrReturnLineItem() {
      let { record } = this
      const statusObj = { RECEIVED: 3 }

      let { status, poId } = record || {}
      let { completedTime } = poId || {}

      return status !== statusObj.RECEIVED && isEmpty(completedTime)
    },
    systemBtnList() {
      let { canShowAddOrReturnLineItem } = this
      if (!canShowAddOrReturnLineItem) {
        return []
      }
      return [
        {
          name: 'Add Receipt',
          identifier: 'addReceiptButton',
          clickAction: this.addReceiptsDialog,
          appearance: 'primary',
        },
        {
          name: 'Return',
          identifier: 'returnReceiptButton',
          clickAction: this.returnLineItemDialog,
          appearance: 'secondary',
        },
      ]
    },
  },
  methods: {
    getProperty,
    addReceiptsDialog() {
      let lineItems = getProperty(this.record, 'poId.lineItems', [])
      let filteredPendingLineItems = lineItems.filter(
        item =>
          isEmpty(item?.quantityReceived) ||
          item?.quantityReceived < item?.quantity
      )
      this.pendingLineItems = filteredPendingLineItems.map(item => ({
        ...item,
        receivedQuantity: null,
      }))
      this.addReceiptVisibilty = true
    },
    returnLineItemDialog() {
      this.returnLineItemVisibilty = true
      let lineItems = getProperty(this.record, 'poId.lineItems', [])
      let filteredReceivedLineItems = lineItems.filter(
        item => parseInt(item?.quantityReceived) > 0
      )
      this.receivedPoLineItems = filteredReceivedLineItems.map(item => ({
        ...item,
        returnQuantity: null,
      }))
    },
    saveAddReceipt() {
      this.addReceiptVisibilty = false
      this.loadRecord()
    },
    saveReturnReceipt() {
      this.returnLineItemVisibilty = false
      this.loadRecord()
    },

    defaultSpace() {
      let {
        addReceiptVisibilty,
        returnLineItemVisibilty,
        pendingLineItems,
        receivedPoLineItems,
        record,
      } = this
      if (addReceiptVisibilty) {
        return (
          <PoReciepts
            visible={addReceiptVisibilty}
            isAddReceipt={true}
            receipts={pendingLineItems}
            record={record}
            v-on:onSave={this.saveAddReceipt}
            v-on:onClose={() => (this.addReceiptVisibilty = false)}
          ></PoReciepts>
        )
      }
      if (returnLineItemVisibilty) {
        return (
          <PoReciepts
            visible={returnLineItemVisibilty}
            isAddReceipt={false}
            receipts={receivedPoLineItems}
            record={record}
            v-on:onSave={this.saveReturnReceipt}
            v-on:onClose={() => (this.returnLineItemVisibilty = false)}
          ></PoReciepts>
        )
      }
    },
  },
}
</script>
