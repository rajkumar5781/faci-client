<script>
import { API } from '@facilio/api'
import InventoryRelatedListWidget from '../../components/InventoryRelatedListWidget.vue'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate } from '/src/utils/formatter.js'
import getProperty from 'dlv'
export default {
  extends: InventoryRelatedListWidget,
  data() {
    return {
      columns: [
        {
          displayName: this.$t('name', {
            ns: 'inventory',
          }),
          name: 'name',
          id: 1,
          fixed: true,
        },
        {
          displayName: this.$t('description', {
            ns: 'inventory',
          }),
          name: 'description',
          id: 2,
          fixed: false,
        },
        {
          displayName: this.$t('inventory.status', {
            ns: 'inventory',
          }),
          name: 'status',
          id: 3,
          fixed: false,
        },
        {
          displayName: this.$t('inventory.total_cost', {
            ns: 'inventory',
          }),
          name: 'totalCost',
          id: 4,
          fixed: false,
        },
        {
          displayName: this.$t('inventory.purchased_date', {
            ns: 'inventory',
          }),
          name: 'purchasedDate',
          id: 5,
          fixed: false,
        },
      ],
      allRecordsList: [],
    }
  },

  computed: {
    moduleName() {
      return 'purchaseOrder'
    },
    canShowAdvancedSearch() {
      return false
    },
  },
  methods: {
    async loadRecords() {
      let { details = {} } = this
      let inventoryId, inventoryType
      if (details.moduleName === 'item') {
        inventoryId = getProperty(details, 'itemType.id')
        inventoryType = 1
      } else {
        inventoryId = getProperty(details, 'toolType.id')
        inventoryType = 2
      }

      this.loading = true
      let params = {
        inventoryId,
        inventoryType,
        storeRoomId: getProperty(details, 'storeRoom.id'),
        filterPO: true,
      }
      let { list = [], error } = await API.fetchAll('purchaseorder', params)
      this.allRecordsList = list.map(record => {
        return {
          ...record,
          purchasedDate: this.getDateTime(record),
          status: this.currentModuleState(record),
        }
      })
      this.totalCount = this.allRecordsList ? this.allRecordsList.length : 0
      this.getListForCurrentPage()
      this.loading = false
    },
    getListForCurrentPage() {
      this.loading = true
      let { page, perPage } = this
      let list = this.allRecordsList || []
      list = list.slice((page - 1) * perPage, page * perPage) || []
      this.recordList = list || []
      this.loading = false
    },
    currentChange(page) {
      this.currentPage = page
      this.getListForCurrentPage()
    },
    getDateTime(val) {
      let lastPurchasedDate = getProperty(val, 'orderedTime')
      if (isEmpty(lastPurchasedDate)) {
        return '---'
      }
      return formatDate(lastPurchasedDate)
    },
    currentModuleState(record) {
      return getProperty(record, 'moduleState.displayName', '---')
    },
  },
}
</script>
