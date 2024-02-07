<template>
  <FModal
    :title="$t('inventory.storeroom.item_bulk_adjust', { ns: 'inventory' })"
    :visible="visible"
    :cancelText="this.$t('cancel')"
    :saveText="this.$t('save')"
    size="XL"
    :hideFooter="false"
    @ok="saveItemBulkAdjustForm"
    @cancel="cancelForm"
  >
    <FContainer
      v-if="loading"
      height="300px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else minHeight="300px">
      <FContainer
        display="flex"
        paddingTop="containerXxLarge"
        paddingLeft="containerXxLarge"
        paddingRight="containerXxLarge"
        width="100%"
        marginLeft="containerLarge"
      >
        <FContainer width="200px">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.item_type', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="200px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.bin', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="120px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.current_quantity', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="150px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.new_quantity', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="150px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.cost', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="150px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.remarks', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
      </FContainer>
      <FContainer v-for="(addItem, index) in formData" :key="index">
        <FContainer
          display="flex"
          paddingTop="containerXxLarge"
          paddingLeft="containerXxLarge"
          paddingRight="containerXxLarge"
          marginLeft="containerLarge"
        >
          <FContainer width="200px">
            <FSelect
              v-model="addItem.itemType.id"
              :options="filteredItemList(index)"
              @change="addItemFormData(formData, addItem.itemType.id, index)"
              filterable
              :placeholder="
                $t('inventory.storeroom.select_item', { ns: 'inventory' })
              "
              :clearable="false"
              size="medium"
            >
            </FSelect>
          </FContainer>
          <FContainer width="200px" marginLeft="containerXxLarge">
            <FSelect
              v-model="addItem.bin.id"
              :options="
                getBinListForItemType(addItem.itemType.id, addItem.bin.id)
              "
              filterable
              :placeholder="'Select Bin'"
              :clearable="false"
              size="medium"
              @change="changeBin(addItem)"
            >
            </FSelect>
          </FContainer>
          <FContainer
            width="120px"
            display="flex"
            alignItems="center"
            justifyContent="left"
            marginLeft="containerXxLarge"
          >
            <FText appearance="headingMed14" columnGap="4px">
              {{ binQuantity(addItem) }}
            </FText></FContainer
          >
          <FContainer width="150px" marginLeft="containerXxLarge">
            <FInput
              v-model="addItem.purchasedItems[0].quantity"
              type="number"
              appearance="default"
              :placeholder="$t('inventory.new_quantity', { ns: 'inventory' })"
              size="medium"
            />
          </FContainer>
          <FContainer
            width="150px"
            display="flex"
            alignItems="center"
            justifyContent="left"
            marginLeft="containerXxLarge"
          >
            <FInput
              v-model="addItem.purchasedItems[0].unitcost"
              type="number"
              :disabled="
                addItem.purchasedItems[0].quantity <= addItem.binQuantity
              "
              appearance="default"
              :placeholder="
                $t('inventory.storeroom.enter_price', { ns: 'inventory' })
              "
              size="medium"
            />
          </FContainer>
          <FContainer
            width="150px"
            display="flex"
            alignItems="center"
            justifyContent="left"
            marginLeft="containerXxLarge"
          >
            <FInput
              v-model="addItem.remarks"
              appearance="default"
              :placeholder="$t('inventory.remarks', { ns: 'inventory' })"
              size="medium"
            />
          </FContainer>

          <FContainer
            marginLeft="containerXxLarge"
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="60px"
          >
            <FButton
              v-if="formData.length > 1"
              iconGroup="action"
              iconName="delete"
              size="medium"
              appearance="tertiary"
              @click="removeItemFormDataEntry(formData, index)"
            ></FButton>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        paddingTop="containerXxLarge"
        paddingBottom="containerXLarge"
        paddingLeft="containerXLarge"
        paddingRight="containerXLarge"
        marginLeft="containerLarge"
      >
        <FButton
          iconGroup="sign-symbols"
          iconName="addition"
          size="medium"
          appearance="tertiary"
          @click="addItemFormDataEntry(formData)"
          iconPosition="prefix"
          color="backgroundPrimaryDefault"
        >
          <FText color="backgroundPrimaryDefault">
            {{ $t('inventory.service.add', { ns: 'inventory' }) }}
          </FText>
        </FButton>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { loadNonIndTrackedInventory } from '/src/pages/modules/inventory/utils/InventoryUtil.js'
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FIcon,
  FTable,
  FModal,
  ftoast,
  FButton,
  FSelect,
  FSpinner,
  FForm,
  FFormItem,
  FEmptyState,
  FPagination,
  FInput,
} from '@facilio/design-system'

export default {
  props: ['itemList', 'storeRoom', 'visible'],
  name: 'ItemBulkAdjust',
  components: {
    FText,
    FContainer,
    FIcon,
    FTable,
    FModal,
    FButton,
    ftoast,
    FSelect,
    FSpinner,
    FForm,
    FFormItem,
    FEmptyState,
    FPagination,
    FInput,
  },
  data() {
    return {
      formData: [],
      saving: false,
      itemTypes: null,
      loading: true,
      metaFieldTypeMap: {},
    }
  },
  async created() {
    this.loading = true
    await this.loadBin()
    this.fillFormData()

    this.loading = false
  },

  computed: {
    items() {
      let { itemList = [] } = this
      return itemList.filter(
        i => i.itemType.isRotating === false || !i.itemType.isRotating
      )
    },
    selectedBinIds() {
      let { formData = [] } = this
      let selectedBinIds = []
      formData.forEach(item => {
        let { bin } = item || {}

        if (isEmpty(bin.id)) {
          return
        }
        selectedBinIds.push(bin.id)
      })
      return selectedBinIds
    },
  },
  methods: {
    binQuantity(item) {
      if (isEmpty(item?.binQuantity) || item.binQuantity <= 0) {
        return '---'
      }
      return item?.binQuantity
    },

    changeBin(addItem) {
      let binId = addItem.bin.id
      if (isEmpty(binId)) {
        return
      }
      addItem.binQuantity = this.getBinQuantity(binId)
    },
    getBinQuantity(binId) {
      let { binList = [] } = this
      let binQuantity = 0
      binList.forEach(bin => {
        let { id } = bin || {}
        if (!isEmpty(id)) {
          if (id === binId) {
            binQuantity = bin.quantity
          }
        }
      })
      return binQuantity
    },

    async loadBin() {
      let { storeRoom = {} } = this
      let { id } = storeRoom
      if (isEmpty(id)) {
        return
      }
      let filters = {}

      filters = {
        oneLevelLookup: {
          item: [
            {
              operatorId: 35,
              criteriaValue: {
                storeRoom: { operatorId: 36, value: [`${id}`] },
              },
            },
          ],
        },
      }

      let params = {
        filters: JSON.stringify(filters),
        force: true,
      }
      let { error, list = [] } = await API.fetchAll('bin', params)

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        this.binList = list
      }
    },
    getBinListForItemType(itemTypeId, currentBinId) {
      let itemBins = []
      let { binList = [] } = this
      binList.forEach(bin => {
        let { item = {}, id: binId } = bin
        if (currentBinId != binId && this.isBinSelected(binId)) {
          return
        }
        let { itemType = {} } = item
        let { id } = itemType
        if (isEmpty(id)) {
          return
        }
        if (itemTypeId === id) {
          itemBins.push({ label: bin.name, value: bin.id })
        }
      })

      return itemBins
    },
    isBinSelected(binId) {
      let { selectedBinIds = [] } = this
      return selectedBinIds.includes(binId)
    },

    filteredItemList(index) {
      let { items = [], formData = [] } = this

      let filteredItems = []
      items.forEach(item => {
        for (let i in formData) {
          if (!parseInt(i) === index) {
            formData[i].itemType.id === item.itemType.id
            return
          }
        }
        filteredItems.push({
          label: item.itemType.name,
          value: item.itemType.id,
          ...item,
        })
      })

      return filteredItems
    },
    cancelForm() {
      this.$emit('closeDialog')
    },
    async saveItemBulkAdjustForm() {
      this.saving = true
      let itemTransaction = []
      let filteredFormData = this.formData.filter(data => {
        let quantity = getProperty(data, 'purchasedItems.0.quantity')
        return !isEmpty(quantity)
      })
      if (filteredFormData.length > 0) {
        for (let adjitem in filteredFormData) {
          let obj = {}
          let item = {}
          let transactionType = 1
          let transactionState = null
          let quantity = getProperty(
            filteredFormData[adjitem],
            'purchasedItems.0.quantity',
            0
          )

          item['id'] = getProperty(filteredFormData[adjitem], 'id')
          if (isEmpty(item.id)) {
            ftoast.critical('Select item')
            this.saving = false
            break
          }
          let newQuantity = getProperty(
            filteredFormData[adjitem],
            'binQuantity',
            0
          )
          let remarks = getProperty(filteredFormData[adjitem], 'remarks')
          if (isEmpty(remarks)) {
            ftoast.critical(
              this.$t('inventory.storeroom.remarks_mandatory', {
                ns: 'inventory',
              })
            )
            this.saving = false
            break
          }
          let bin = getProperty(filteredFormData[adjitem], 'bin')
          if (isEmpty(bin?.id)) {
            ftoast.critical('Select Bin')
            this.saving = false
            break
          }

          if (quantity === null) {
            ftoast.critical('Enter the New Quantity')
            this.saving = false
            break
          }
          obj['remarks'] = remarks
          if (quantity > newQuantity) {
            let purchased_item = {}
            let unitCost = getProperty(
              filteredFormData[adjitem],
              'purchasedItems.0.unitcost',
              0
            )
            if (unitCost <= 0) {
              ftoast.critical(
                this.$t('inventory.enter_price_to_increase', {
                  ns: 'inventory',
                })
              )
              this.saving = false
              break
            }
            purchased_item['unitcost'] = unitCost

            purchased_item['quantity'] = quantity - newQuantity
            transactionState = 7
            obj['item'] = item
            obj['bin'] = bin
            obj['purchasedItem'] = purchased_item
            obj['transactionType'] = transactionType
            obj['transactionState'] = transactionState
            obj['quantity'] = quantity - newQuantity
            itemTransaction.push(obj)
          } else if (quantity < newQuantity) {
            transactionState = 8
            obj['item'] = item
            obj['bin'] = bin

            obj['transactionType'] = transactionType
            obj['transactionState'] = transactionState
            obj['quantity'] = newQuantity - quantity
            itemTransaction.push(obj)
          } else {
            ftoast.critical('Unable to Adjust with same Quantity')
            this.saving = false
            break
          }
        }
        if (this.saving) {
          let url = 'v3/modules/data/bulkCreate'
          let params = {
            data: {
              itemTransactions: itemTransaction,
            },
            moduleName: 'itemTransactions',
            params: {
              adjustQuantity: true,
            },
          }
          let { error } = await API.post(url, params)
          if (error) {
            ftoast.critical(
              error.message ||
                this.$t('inventory.unable_to_update', {
                  ns: 'inventory',
                })
            )
            this.saving = false
          } else {
            ftoast.success(
              this.$t('inventory.storeroom.item_adjusted_successfully', {
                ns: 'inventory',
              })
            )
            this.saving = false
            this.cancelForm()
            this.$emit('refresh')
          }
        }
      } else {
        ftoast.critical('Enter the New Quantity')
        this.saving = false
      }
    },
    removeItemFormDataEntry(list, index) {
      list.splice(index, 1)
    },
    addItemFormDataEntry(field) {
      field.push({
        itemType: { id: null },
        bin: { id: null },
        binQuantity: 0,
        id: null,
        purchasedItems: [{ quantity: null, unitcost: null }],
      })
    },
    addItemFormData(field, id, index) {
      let item = this.items.findIndex(element => element.itemType.id === id)
      let defaultBin = this.items[item].defaultBin
      let bin = { id: null }
      let binId = defaultBin?.id
      let binQuantity = 0
      if (!isEmpty(binId) && !this.isBinSelected(binId)) {
        bin = { id: binId }
        binQuantity = this.getBinQuantity(binId)
      }
      let obj = {
        itemType: { id: id },
        bin,
        binQuantity,
        id: this.items[item].id,
        purchasedItems: [{ quantity: null, unitcost: null }],
      }
      field.splice(index, 1, obj)
    },
    fillFormData() {
      if (this.items.length === 0) {
        let t = {
          itemType: { id: null },
          binQuantity: 0,
          id: null,
          bin: { id: null },
          purchasedItems: [{ quantity: null, unitcost: null }],
        }
        this.formData.push(t)
      }
      for (let i in this.items) {
        if (i === '10') {
          break
        } else {
          let defaultBin = this.items[i].defaultBin
          let bin = { id: null }
          let binId = defaultBin?.id
          let binQuantity = 0
          if (!isEmpty(binId) && !this.isBinSelected(bin)) {
            bin = { id: binId }
            binQuantity = this.getBinQuantity(binId)
          }
          let temp = {
            itemType: { id: this.items[i].itemType.id },
            bin,
            binQuantity,
            id: this.items[i].id,
            purchasedItems: [{ quantity: null, unitcost: null }],
          }
          this.formData.push(temp)
        }
      }
    },
  },
}
</script>
