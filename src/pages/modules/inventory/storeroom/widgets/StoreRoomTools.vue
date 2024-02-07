<script lang="jsx">
import { isEmpty } from '@facilio/utils/validation'
import { getFilteredToolTypeList } from '/src/pages/modules/inventory/utils/InventoryUtil.js'
import InventoryRelatedListWidget from '/src/pages/modules/inventory/components/InventoryRelatedListWidget.vue'
import ToolBulkAdd from '/src/pages/modules/inventory/tool/components/ToolBulkAdd.vue'
import StockTool from '/src/pages/modules/inventory/tool/components/StockTool.vue'
import { Lookup } from '@facilio/ui/new-forms'
import { formatDate } from '/src/utils/formatter.js'
import getProperty from 'dlv'

let columns = [
  {
    displayName: 'Tool',
    name: 'name',
    id: 1,
    fixed: true,
    clickable: true,
  },

  {
    displayName: 'Available Qty',
    name: 'quantity',
    id: 2,
    fixed: false,
    width: 180,
  },
  {
    displayName: 'Minimum Qty',
    name: 'quantity',
    id: 3,
    fixed: false,
    width: 180,
  },
  {
    displayName: 'Default Bin',
    name: 'defaultBinName',
    id: 4,
    fixed: false,
  },
  {
    displayName: 'Last Purchased Date',
    name: 'lastPurchasedDateFormated',
    id: 5,
    fixed: false,
  },
  {
    displayName: 'Last Purchased Price',
    name: 'lastPurchasedPrice',
    id: 6,
    fixed: false,
  },
]

export default {
  name: 'StoreRoomTools',
  extends: InventoryRelatedListWidget,
  components: {
    Lookup,
    StockTool,
    ToolBulkAdd,
  },
  data() {
    return {
      columns,
      selectedToolTypeId: null,
      selectedToolType: null,
      toolTypeFormChooser: false,
      toolBulkAddForm: false,
      newAddToolFormVisibility: false,
      toolTypeEditObj: null,
      toolTypes: [],
      storeRoom: {},
      toolBulkAddForm: false,
    }
  },
  created() {
    this.storeRoom = this.details
  },
  computed: {
    emptyStateMsg() {
      return this.$t('inventory.storeroom.storeroom_tools_empty', {
        ns: 'inventory',
      })
    },
    moduleName() {
      return 'tool'
    },

    canShowAdvancedSearch() {
      return false
    },
    currentStoreRoomId() {
      return parseInt(this.$route.params.id)
    },
    toolLookupData() {
      return {
        lookupModule: { name: 'toolTypes' },
        multiple: false,
      }
    },

    defaultFilter() {
      let { details } = this
      let { id } = details || {}
      if (!isEmpty(id)) {
        return {
          storeRoom: {
            operatorId: 9,
            value: [id + ''],
          },
        }
      }
      return {}
    },
    headerButtonsList() {
      let list = []

      if (this.$access.hasPermission('inventory:CREATE')) {
        list.push(
          {
            name: 'Bulk Add',
            iconGroup: 'files',
            iconName: 'paste',
            identifier: 'storeRoomBulkAddTools',

            clickAction: this.addBulkToolForm,
          },
          {
            name: 'Add',
            iconGroup: 'navigation',
            identifier: 'storeRoomAddTools',
            iconName: 'addition',
            clickAction: this.addToolForm,
          }
        )
      }
      return list
    },
  },
  methods: {
    modifyRecordsAfterFetch(record) {
      return {
        ...record,
        lastPurchasedDateFormated: this.getDateTime(record),
        name: this.getToolName(record),
        defaultBinName: this.getDefaultBinName(record),
      }
    },
    getDefaultBinName(val) {
      let item = getProperty(val, 'defaultBin.name', '---')
      return item
    },

    getToolName(val) {
      let tool = getProperty(val, 'toolType.name', '---')
      return tool
    },
    addBulkToolForm() {
      this.toolBulkAddForm = true
    },
    closeBulkAddForm() {
      this.toolBulkAddForm = false
    },
    changeToolTypeinForm(id) {
      let { selectedToolTypeId } = this
      if (selectedToolTypeId) {
        this.selectedToolType = this.toolTypes.find(
          it => it.id === selectedToolTypeId
        )
      }
    },
    addToolForm() {
      this.toolTypeFormChooser = true
      this.loadToolTypes()
    },
    async loadToolTypes() {
      this.toolTypes = await getFilteredToolTypeList()
    },
    closeStockingForm() {
      this.newAddToolFormVisibility = false
    },
    closeBulkAddForm() {
      this.toolBulkAddForm = false
    },
    selectToolTypeForForm() {
      this.toolTypeFormChooser = false
      this.newAddToolFormVisibility = true
      this.toolTypeEditObj = {
        toolType: {
          id: this.selectedToolType.id,
          isRotating: this.selectedToolType.isRotating,
        },
        storeRoom: { id: this.currentStoreRoomId },
      }
    },
    cancelForm() {
      this.resetForm = true
      this.storeRoomEditFormVisibility = false
      this.newAddToolFormVisibility = false
      this.toolTypeFormChooser = false
    },

    getDateTime(val) {
      let lastPurchasedDate = getProperty(val, 'lastPurchasedDate')
      if (isEmpty(lastPurchasedDate)) {
        return '---'
      }
      return formatDate(lastPurchasedDate)
    },
    defaultSpace() {
      return (
        <template>
          {this.toolTypeFormChooser && (
            <FModal
              title={this.$t('inventory.storeroom.select_tool_type', {
                ns: 'inventory',
              })}
              visible={this.toolTypeFormChooser}
              cancelText={this.$t('cancel')}
              saveText={this.$t('save')}
              size="S"
              hideFooter={false}
              v-on:ok={this.selectToolTypeForForm}
              v-on:cancel={this.cancelForm}
            >
              <FContainer
                paddingTop="containerXxLarge"
                paddingLeft="containerXxLarge"
                paddingRight="containerXxLarge"
                width="80%"
              >
                <Lookup
                  v-model={this.selectedToolTypeId}
                  field={this.toolLookupData}
                  v-on:recordSelected={this.changeToolTypeinForm}
                ></Lookup>
              </FContainer>
              <FContainer
                display="flex"
                paddingTop="containerXxLarge"
                paddingLeft="containerXxLarge"
                paddingRight="containerXxLarge"
                marginLeft="containerLarge"
              ></FContainer>
            </FModal>
          )}

          {this.newAddToolFormVisibility && this.selectedToolType && (
            <FContainer>
              <stock-tool
                visible={this.newAddToolFormVisibility}
                record={this.toolTypeEditObj}
                moduleName="storeRoom"
                v-on:closeDialog={() => this.closeStockingForm()}
              ></stock-tool>
            </FContainer>
          )}
          {this.toolBulkAddForm && (
            <FContainer>
              <tool-bulk-add
                visible={this.toolBulkAddForm}
                storeRoom={this.storeRoom}
                toolList={this.recordList}
                v-on:closeDialog={this.closeBulkAddForm}
                v-on:refresh={this.loadRecords}
              ></tool-bulk-add>
            </FContainer>
          )}
        </template>
      )
    },
  },
}
</script>
