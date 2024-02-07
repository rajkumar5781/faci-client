<script>
import getProperty from 'dlv'
import InventoryRelatedListWidget from '/src/pages/modules/inventory/components/InventoryRelatedListWidget.vue'
let columns = [
  {
    displayName: 'Name',
    name: 'name',
    id: 1,
    clickable: true,
  },
  { displayName: 'Area', name: 'area', id: 2 },
  { displayName: 'Managed By', name: 'managedBy', id: 3 },
]
export default {
  name: 'ServingSites',
  extends: InventoryRelatedListWidget,
  data() {
    return {
      allRecordsList: [],
      columns,
    }
  },
  computed: {
    canShowAdvancedSearch() {
      return false
    },
    emptyStateMsg() {
      return this.$t('inventory.serving_sites_empty_msg')
    },
  },
  methods: {
    loadRecords() {
      let servingsites = getProperty(this.details, 'servingsites', [])
      let list = servingsites.map(site => {
        let managedBy = getProperty(site, 'managedBy.name', '---')
        let name = getProperty(site, 'name', '---')
        let area = getProperty(site, 'area', '---')
        let id = getProperty(site, 'id', '---')
        let record = { name, area, managedBy, id }
        return record
      })
      this.allRecordsList = list
      this.totalCount = this.allRecordsList ? this.allRecordsList.length : 0
      this.getListForCurrentPage()
    },

    getListForCurrentPage() {
      let { page, perPage } = this
      let list = this.allRecordsList || []
      list = list.slice((page - 1) * perPage, page * perPage) || []
      this.recordList = list || []
    },
    currentChange(page) {
      this.currentPage = page
      this.getListForCurrentPage()
    },
  },
}
</script>
