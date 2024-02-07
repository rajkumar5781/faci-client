<script lang="jsx">
import ModuleSummary from '../../../summary/ModuleSummary.vue'
import StockTool from '/src/pages/modules/inventory/tool/components/StockTool.vue'

export default {
  name: 'ToolTypeSummary',
  extends: ModuleSummary,
  data() {
    return { stockingFormVisibility: false }
  },
  computed: {
    moduleDisplayName() {
      return 'Tool Type'
    },
    systemBtnList() {
      return [
        {
          name: this.$t('inventory.stock', {
            ns: 'inventory',
          }),
          identifier: 'toolStockButton',
          clickAction: this.showStockingForm,
          appearance: 'primary',
        },
      ]
    },
    moreButtonList() {
      return [
        {
          name: 'Edit',
          identifier: 'edit',
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
          <StockTool
            visible={stockingFormVisibility}
            moduleName={moduleName}
            record={record}
            v-on:saved={() => this.loadRecord(true)}
            v-on:closeDialog={this.closeStockingForm}
          ></StockTool>
        )
      }
    },
  },
}
</script>
