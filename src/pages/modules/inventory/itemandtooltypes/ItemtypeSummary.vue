<script lang="jsx">
import ModuleSummary from '../../../summary/ModuleSummary.vue'
import StockItem from '/src/pages/modules/inventory/Item/widgets/StockItem.vue'
export default {
  name: 'ItemTypeSummary',
  extends: ModuleSummary,
  data() {
    return { stockingFormVisibility: false }
  },
  computed: {
    moduleDisplayName() {
      return 'Item Type'
    },
    systemBtnList() {
      return [
        {
          name: this.$t('inventory.stock', {
            ns: 'inventory',
          }),
          identifier: 'itemStockButton',
          clickAction: this.showStockingForm,
          appearance: 'primary',
        },
      ]
    },
    moreButtonList() {
      return [
        {
          identifier: 'edit',
          name: 'Edit',
          clickAction: this.editRecord,
        },
      ]
    },
    tagProps() {
      let { record = {} } = this

      if (record?.rotating) {
        return {
          text: 'Rotating',
          appearance: 'simple',
        }
      }
      return {}
    },
  },
  methods: {
    showStockingForm() {
      this.stockingFormVisibility = true
    },
    closeStockingForm() {
      this.stockingFormVisibility = false
    },
    defaultSpace() {
      let { record = {}, stockingFormVisibility, moduleName } = this
      if (stockingFormVisibility) {
        return (
          <StockItem
            visible={stockingFormVisibility}
            moduleName={moduleName}
            record={record}
            v-on:saved={() => this.loadRecord(true)}
            v-on:closeDialog={this.closeStockingForm}
          ></StockItem>
        )
      }
    },
  },
}
</script>
