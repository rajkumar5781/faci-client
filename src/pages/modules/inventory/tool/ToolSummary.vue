<script lang="jsx">
import ModuleSummary from '/src/pages/summary/ModuleSummary.vue'
import StockTool from './components/StockTool.vue'
import IssueTools from '/src/pages/modules/inventory/tool/components/IssueTools.vue'
import ReturnTools from '/src/pages/modules/inventory/tool/components/ReturnTools.vue'
import AdjustTools from '/src/pages/modules/inventory/tool/components/AdjustTools.vue'
import FetchViewsMixin from '/src/components/views/FetchViews.vue'
import { FTags } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'

export default {
  name: 'ToolSummary',
  extends: ModuleSummary,
  mixins: [FetchViewsMixin],

  data() {
    return {
      stockingFormVisibility: false,
      issueToolsVisibility: false,
      returnToolsVisibility: false,
      adjustToolsVisibility: false,
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
            identifier: 'toolStockButton',
            clickAction: this.showStockingForm,
            appearance: 'primary',
          },
        ]
      }
      return []
    },

    tagProps() {
      let { record = {} } = this
      let { toolType } = record
      if (toolType?.rotating) {
        return {
          text: 'Rotating',
          appearance: 'simple',
        }
      }
      return {}
    },
    moreButtonList() {
      let { record = {} } = this
      let { toolType = {} } = record
      let { rotating = false } = toolType

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
          name: this.$t('inventory.tool.go_to_tool_Type', {
            ns: 'inventory',
          }),
          identifier: 'goToToolType',
          clickAction: this.redirectToToolTypeSummary,
        },
      ]
      if (!rotating) {
        moreBtns.push(
          ...[
            {
              name: this.$t('inventory.tool.issue_tools', {
                ns: 'inventory',
              }),
              identifier: 'issueTools',
              clickAction: this.showIssueTools,
            },
            {
              name: this.$t('inventory.tool.return_tools', {
                ns: 'inventory',
              }),
              identifier: 'returnTools',
              clickAction: this.showReturnTools,
            },
            {
              name: this.$t('inventory.item.adjust_balance', {
                ns: 'inventory',
              }),
              identifier: 'adjustToolBalance',
              clickAction: this.showAdjustTools,
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
    showIssueTools() {
      this.issueToolsVisibility = true
    },
    hideIssueTools() {
      this.issueToolsVisibility = false
    },
    showReturnTools() {
      this.returnToolsVisibility = true
    },
    hideReturnTools() {
      this.returnToolsVisibility = false
    },
    showAdjustTools() {
      this.adjustToolsVisibility = true
    },
    hideAdjustTools() {
      this.adjustToolsVisibility = false
    },
    async redirectToToolTypeSummary() {
      let { record = {} } = this
      let { toolType } = record
      if (isEmpty(toolType)) {
        return
      }
      let { id } = toolType

      let moduleName = 'toolTypes'
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
        moduleName,
        stockingFormVisibility,
        issueToolsVisibility,
        returnToolsVisibility,
        adjustToolsVisibility,
      } = this
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
      if (issueToolsVisibility) {
        return (
          <IssueTools
            visible={issueToolsVisibility}
            moduleName={moduleName}
            record={record}
            v-on:refresh={() => this.loadRecord(true)}
            v-on:closeDialog={this.hideIssueTools}
          ></IssueTools>
        )
      }
      if (returnToolsVisibility) {
        return (
          <ReturnTools
            visible={returnToolsVisibility}
            record={record}
            moduleName={moduleName}
            v-on:refresh={() => this.loadRecord(true)}
            v-on:closeDialog={this.hideReturnTools}
          ></ReturnTools>
        )
      }
      if (adjustToolsVisibility) {
        return (
          <AdjustTools
            visible={adjustToolsVisibility}
            tool={record}
            v-on:refresh={() => this.loadRecord(true)}
            v-on:closeDialog={this.hideAdjustTools}
          ></AdjustTools>
        )
      }
    },
  },
}
</script>
