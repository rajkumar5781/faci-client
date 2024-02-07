<script lang="jsx">
import { isEmpty } from '@facilio/utils/validation'
import { getFilteredItemTypeList } from '/src/pages/modules/inventory/utils/InventoryUtil.js'
import { Lookup } from '@facilio/ui/new-forms'
import StockItem from '/src/pages/modules/inventory/Item/widgets/StockItem.vue'
import ItemBulkAdd from '/src/pages/modules/inventory/storeroom/forms/ItemBulkAdd.vue'
import ItemBulkAdjust from '/src/pages/modules/inventory/storeroom/forms/ItemBulkAdjust.vue'
import InventoryRelatedListWidget from '/src/pages/modules/inventory/components/InventoryRelatedListWidget.vue'
import { formatDate } from '/src/utils/formatter.js'
import getProperty from 'dlv'

let columns = [
  {
    displayName: 'Item',
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
    name: 'minimumQuantity',
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
  name: 'StoreRoomItems',
  extends: InventoryRelatedListWidget,
  components: {
    Lookup,
    StockItem,
    ItemBulkAdd,
    ItemBulkAdjust,
  },
  data() {
    return {
      selectedItemTypeId: null,
      selectedItemType: null,
      itemTypeFormChooser: false,
      itemBulkAddForm: false,
      itemBulkAdjust: false,
      newAddItemFormVisibility: false,
      itemTypeEditObj: null,
      itemTypes: [],
      storeRoom: {},
      columns,
    }
  },
  created() {
    this.storeRoom = this.details
  },
  computed: {
    moduleName() {
      return 'item'
    },
    emptyStateMsg() {
      return this.$t('inventory.storeroom.storeroom_items_empty', {
        ns: 'inventory',
      })
    },

    currentStoreRoomId() {
      return parseInt(this.$route.params.id)
    },
    canShowAdvancedSearch() {
      return false
    },
    itemLookupData() {
      return {
        lookupModule: { name: 'itemTypes' },
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
      if (this.$access.hasPermission('inventory:UPDATE,UPDATE_OWN')) {
        list.push({
          name: 'Bulk Adjust',
          iconGroup: 'edit',
          iconName: 'edit-line',
          identifier: 'storeRoomBulkAdjustItems',
          clickAction: this.adjustBulkItemForm,
        })
      }
      if (this.$access.hasPermission('inventory:CREATE')) {
        list.push(
          {
            name: 'Bulk Add',
            iconGroup: 'files',
            iconName: 'paste',
            identifier: 'storeRoomBulkAddItems',

            clickAction: this.addBulkItemForm,
          },
          {
            name: 'Add',
            iconGroup: 'navigation',
            identifier: 'storeRoomAddItems',
            iconName: 'addition',
            clickAction: this.addItemForm,
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
        name: this.getItemName(record),
        defaultBinName: this.getDefaultBinName(record),
      }
    },
    getDefaultBinName(val) {
      let item = getProperty(val, 'defaultBin.name', '---')
      return item
    },

    getItemName(val) {
      let item = getProperty(val, 'itemType.name', '---')
      return item
    },

    getDateTime(val) {
      let lastPurchasedDate = getProperty(val, 'lastPurchasedDate')
      if (isEmpty(lastPurchasedDate)) {
        return '---'
      }
      return formatDate(lastPurchasedDate)
    },
    adjustBulkItemForm() {
      this.itemBulkAdjust = true
    },

    addBulkItemForm() {
      this.itemBulkAddForm = true
    },
    changeItemTypeinForm(id) {
      let { selectedItemTypeId } = this
      if (selectedItemTypeId) {
        this.selectedItemType = this.itemTypes.find(
          it => it.id === selectedItemTypeId
        )
      }
    },

    addItemForm() {
      this.itemTypeFormChooser = true
      this.loadItemTypes()
    },
    async loadItemTypes() {
      this.itemTypes = await getFilteredItemTypeList()
    },
    closeStockingForm() {
      this.newAddItemFormVisibility = false
    },
    closeBulkAddForm() {
      this.itemBulkAddForm = false
    },
    closeBulkAdjustForm() {
      this.itemBulkAdjust = false
    },
    selectItemTypeForForm() {
      this.itemTypeFormChooser = false
      this.newAddItemFormVisibility = true
      this.itemTypeEditObj = {
        itemType: {
          id: this.selectedItemType.id,
          isRotating: this.selectedItemType.isRotating,
        },
        storeRoom: { id: this.currentStoreRoomId },
      }
    },
    cancelForm() {
      this.resetForm = true
      this.storeRoomEditFormVisibility = false
      this.newAddItemFormVisibility = false
      this.itemTypeFormChooser = false
    },

    defaultSpace() {
      return (
        <template>
          {this.itemTypeFormChooser && (
            <FModal
              title={this.$t('inventory.storeroom.select_item_type', {
                ns: 'inventory',
              })}
              visible={this.itemTypeFormChooser}
              cancelText={this.$t('cancel')}
              saveText={this.$t('save')}
              size="S"
              hideFooter={false}
              v-on:ok={this.selectItemTypeForForm}
              v-on:cancel={this.cancelForm}
            >
              <FContainer
                paddingTop="containerXxLarge"
                paddingLeft="containerXxLarge"
                paddingRight="containerXxLarge"
                width="80%"
              >
                <Lookup
                  v-model={this.selectedItemTypeId}
                  field={this.itemLookupData}
                  v-on:recordSelected={this.changeItemTypeinForm}
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

          {this.newAddItemFormVisibility && this.selectedItemType && (
            <FContainer>
              <stock-item
                visible={this.newAddItemFormVisibility}
                record={this.itemTypeEditObj}
                moduleName="storeRoom"
                v-on:closeDialog={() => this.closeStockingForm()}
              ></stock-item>
            </FContainer>
          )}
          {this.itemBulkAddForm && (
            <FContainer>
              <item-bulk-add
                visible={this.itemBulkAddForm}
                storeRoom={this.storeRoom}
                itemList={this.recordList}
                v-on:closeDialog={this.closeBulkAddForm}
                v-on:refresh={this.loadRecords}
              ></item-bulk-add>
            </FContainer>
          )}
          {this.itemBulkAdjust && (
            <FContainer>
              <item-bulk-adjust
                visible={this.itemBulkAdjust}
                storeRoom={this.storeRoom}
                itemList={this.recordList}
                v-on:closeDialog={this.closeBulkAdjustForm}
                v-on:refresh={this.loadRecords}
              ></item-bulk-adjust>
            </FContainer>
          )}
        </template>
      )
    },
  },
}
</script>
