<script>
import { API } from '@facilio/api'
import { eventBus } from '../../../../components/page-builder/event-bus'
import getProperty from 'dlv'
export default {
  name: 'WorkOrderPlans',
  computed: {
    additionalParams() {
      return {
        workOrder: {
          id: this.workOrderId,
        },
      }
    },
    filters() {
      return {
        workOrder: {
          operatorId: 36,
          value: [this.workOrderId + ''],
        },
      }
    },
    getLabel() {
      let { moduleName } = this
      if (moduleName === 'workOrderPlannedItems') {
        return this.$t('common.inventory.select_item')
      } else if (moduleName === 'workOrderPlannedTools') {
        return this.$t('common.inventory.select_tool')
      } else if (moduleName === 'workOrderPlannedServices') {
        return this.$t('common.inventory.select_service')
      }
      return ''
    },
  },
  methods: {
    reloadCost() {
      eventBus.$emit('loadCost')
    },
    selectedRecords(selectedList) {
      this.selectedLineItems = selectedList
    },

    async deleteLineItems() {
      let { selectedLineItems } = this

      this.recordIds = []
      selectedLineItems.forEach(lineItem => {
        let id = getProperty(lineItem, 'id')
        this.recordIds.push(id)
      })
      let { error } = await API.deleteRecord(this.moduleName, this.recordIds)
      if (error) {
        let { message } = error
        this.$message.error(message || this.$t('common._common.error_occured'))
        return {}
      } else {
        let { moduleDisplayName } = this
        this.$message.success(
          `${moduleDisplayName} ${this.$t('custommodules.list.delete_success')}`
        )
        this.$refs['lineItemTable']?.refreshRecordList(true)
        this.$refs['lineItemTable']?.clearSelection()
      }
    },
  },
}
</script>
