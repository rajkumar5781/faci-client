<script lang="jsx">
import ModuleSummary from '/src/pages/summary/ModuleSummary.vue'
import StockItem from './widgets/StockItem.vue'
import IssueItems from '/src/pages/modules/inventory/Item/issuesAndReturns/IssueItems.vue'
import ReturnItems from '/src/pages/modules/inventory/Item/issuesAndReturns/ReturnItems.vue'
import AdjustItems from '/src/pages/modules/inventory/Item/issuesAndReturns/AdjustItems.vue'
import FetchViewsMixin from '/src/components/views/FetchViews.vue'
import { FTags } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'

export default {
  name: 'ItemSummary',
  extends: ModuleSummary,
  mixins: [FetchViewsMixin],

  data() {
    return {
      stockingFormVisibility: false,
      issueItemsVisibility: false,
      returnItemsVisibility: false,
      adjustItemsVisibility: false,
    }
  },
  computed: {
    systemBtnList() {
      let { record } = this
      let { itemType } = record || {}
      let { rotating = false } = itemType || {}
      if (!rotating) {
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
      }
      return []
    },
    tagProps() {
      let { record = {} } = this
      let { itemType } = record
      if (itemType?.rotating) {
        return {
          text: 'Rotating',
          appearance: 'simple',
        }
      }
      return {}
    },
    moreButtonList() {
      let { record = {} } = this
      let { itemType = {} } = record
      let { rotating = false } = itemType

      let moreBtns = [
        {
          name: this.$t('edit', {
            ns: 'inventory',
          }),
          name: 'Edit',
          identifier: 'edit',
          clickAction: this.editRecord,
        },

        {
          name: this.$t('inventory.item.go_to_item_Type', {
            ns: 'inventory',
          }),
          identifier: 'goToItemType',
          clickAction: this.redirectToItemTypeSummary,
        },
      ]
      if (!rotating) {
        moreBtns.push(
          ...[
            {
              name: this.$t('inventory.item.issue_items', {
                ns: 'inventory',
              }),
              identifier: 'issueItems',
              clickAction: this.showIssueItems,
            },
            {
              name: this.$t('inventory.item.return_items', {
                ns: 'inventory',
              }),
              identifier: 'returnItems',
              clickAction: this.showReturnItems,
            },
            {
              name: this.$t('inventory.item.adjust_balance', {
                ns: 'inventory',
              }),
              identifier: 'adjustItemBalance',
              clickAction: this.showAdjustItems,
            },
          ]
        )
      }
      return moreBtns
    },
  },
  methods: {
    showStockingForm() {
      this.stockingFormVisibility = true
    },
    closeStockingForm() {
      this.stockingFormVisibility = false
    },
    showIssueItems() {
      this.issueItemsVisibility = true
    },
    hideIssueItems() {
      this.issueItemsVisibility = false
    },
    showReturnItems() {
      this.returnItemsVisibility = true
    },
    hideReturnItems() {
      this.returnItemsVisibility = false
    },
    showAdjustItems() {
      this.adjustItemsVisibility = true
    },
    hideAdjustItems() {
      this.adjustItemsVisibility = false
    },
    async redirectToItemTypeSummary() {
      let { record = {} } = this
      let { itemType } = record
      if (isEmpty(itemType)) {
        return
      }
      let { id } = itemType

      let moduleName = 'itemTypes'
      let currentView = await this.fetchView(moduleName)

      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
        name &&
          this.$router.push({
            name,
            params: {
              viewname: currentView,
              id,
            },
          })
      }
    },
    defaultSpace() {
      let {
        record = {},
        stockingFormVisibility,
        moduleName,
        closeStockingForm,
        issueItemsVisibility,
        returnItemsVisibility,
        adjustItemsVisibility,
      } = this
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
      if (issueItemsVisibility) {
        return (
          <IssueItems
            visible={issueItemsVisibility}
            moduleName={moduleName}
            record={record}
            v-on:refresh={() => this.loadRecord(true)}
            v-on:closeDialog={this.hideIssueItems}
          ></IssueItems>
        )
      }
      if (returnItemsVisibility) {
        return (
          <ReturnItems
            visible={returnItemsVisibility}
            record={record}
            moduleName={moduleName}
            v-on:refresh={() => this.loadRecord(true)}
            v-on:closeDialog={this.hideReturnItems}
          ></ReturnItems>
        )
      }
      if (adjustItemsVisibility) {
        return (
          <AdjustItems
            visible={adjustItemsVisibility}
            item={record}
            v-on:refresh={() => this.loadRecord(true)}
            v-on:closeDialog={this.hideAdjustItems}
          ></AdjustItems>
        )
      }
    },
  },
}
</script>
