<script>
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { formatDate } from '/src/utils/formatter.js'
import InventoryRelatedListWidget from '../../components/InventoryRelatedListWidget.vue'
let columns = [
  {
    displayName: 'Purchased Quantity',
    name: 'quantity',
    id: 1,
    fixed: true,
  },
  {
    displayName: 'Current balance',
    name: 'currentQuantity',
    id: 2,
    fixed: false,
  },
  {
    displayName: 'Unit Price',
    name: 'unitPrice',
    id: 3,
    fixed: false,
  },
  {
    displayName: 'Purchased Date',
    name: 'purchasedDate',
    id: 4,
    fixed: false,
  },
]
export default {
  extends: InventoryRelatedListWidget,
  data() {
    return {
      columns,
    }
  },

  computed: {
    moduleName() {
      return 'purchasedTool'
    },

    defaultFilter() {
      let toolId = this.details?.id
      if (!isEmpty(toolId)) {
        return {
          tool: {
            operatorId: 36,
            value: [toolId + ''],
          },
        }
      }
      return {}
    },
  },
  methods: {
    modifyRecordsAfterFetch(record) {
      return { ...record, purchasedDate: this.getDateTime(record) }
    },
    getDateTime(val) {
      let lastPurchasedDate = getProperty(val, 'costDate')
      if (isEmpty(lastPurchasedDate)) {
        return '---'
      }
      return formatDate(lastPurchasedDate)
    },
  },
}
</script>
