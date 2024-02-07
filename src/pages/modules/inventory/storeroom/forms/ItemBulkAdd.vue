<template>
  <FModal
    :title="$t('inventory.storeroom.item_bulk_add', { ns: 'inventory' })"
    :visible="visible"
    :cancelText="this.$t('cancel')"
    :saveText="this.$t('save')"
    size="L"
    :hideFooter="false"
    @ok="saveItemBulkAddForm"
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
    <FContainer v-else min-height="300px">
      <FContainer
        display="flex"
        paddingTop="containerXxLarge"
        paddingLeft="containerXxLarge"
        paddingRight="containerXxLarge"
        marginLeft="containerLarge"
      >
        <FContainer width="200px">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.item_type', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="200px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ 'Bin' }}
          </FText>
        </FContainer>
        <FContainer width="120px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.quantity', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="150px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.unit_price', { ns: 'inventory' }) }}
          </FText>
        </FContainer>
        <FContainer width="150px" marginLeft="containerXxLarge">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('inventory.cost', { ns: 'inventory' }) }}
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
              :options="itemTypesList"
              :placeholder="
                $t('inventory.storeroom.select_item', { ns: 'inventory' })
              "
              size="medium"
              :clearable="false"
              @change="addItemFormData(formData, addItem.itemType.id, index)"
            >
            </FSelect>
          </FContainer>
          <FContainer width="200px" marginLeft="containerXxLarge">
            <FSelect
              v-model="addItem.bin.id"
              :options="getBinListForItemType(addItem.itemType.id)"
              :allowCreate="true"
              :clearable="false"
              filterable
              @addOption="name => addNewBin(name, addItem)"
              :placeholder="'Select Bin'"
              size="medium"
            >
            </FSelect>
          </FContainer>
          <FContainer width="120px" marginLeft="containerXxLarge">
            <FInput
              v-model="addItem.purchasedItems[0].quantity"
              type="number"
              :placeholder="
                $t('inventory.storeroom.quantity', { ns: 'inventory' })
              "
              appearance="default"
              size="medium"
            />
          </FContainer>
          <FContainer width="150px" marginLeft="containerXxLarge">
            <FInput
              v-model="addItem.purchasedItems[0].unitcost"
              type="number"
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
            <FText appearance="headingMed14" columnGap="4px">
              {{
                addItem.purchasedItems[0].quantity > 0 &&
                addItem.purchasedItems[0].unitcost > 0
                  ? addItem.purchasedItems[0].quantity *
                    addItem.purchasedItems[0].unitcost
                  : '0'
              }}
            </FText>
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
import { loadNonIndTrackedInventory } from '/src/pages/modules/inventory/utils/InventoryUtil.js'
import { dset as setProperty } from 'dset'
import { Lookup } from '@facilio/ui/new-forms'
import cloneDeep from 'lodash/cloneDeep'
import getProperty from 'dlv'

import { isEmpty } from '@facilio/utils/validation'
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
  name: 'ItemBulkAdd',
  props: ['itemList', 'storeRoom', 'visible'],
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
    Lookup,
  },
  data() {
    return {
      itemTypesList: [],
      binList: [],
      formData: [],
      loading: true,
      negativeIndex: -1,
      itemId: null,
      metaFieldTypeMap: {},
    }
  },
  async created() {
    this.loading = true
    await this.loadBinPickList()
    await this.loadNonRotatingItemTypes()
    this.loading = false
  },

  computed: {
    items() {
      return this.itemList.filter(
        i => i.itemType.isRotating === false || !i.itemType.isRotating
      )
    },
  },
  methods: {
    isEmpty,
    async loadNonRotatingItemTypes() {
      let itemTypes = await loadNonIndTrackedInventory('itemTypes')
      if (!isEmpty(itemTypes)) {
        this.itemTypesList = itemTypes.map(item => ({
          value: item.id,
          label: item.name,
        }))

        this.fillFormData()
      }
    },
    addNewBin(binName, addItem) {
      let itemTypeId = addItem.itemType.id
      let { negativeIndex } = this
      if (isEmpty(binName)) {
        return
      }
      let { binList } = this
      let newOption = {
        name: binName,
        item: {
          itemType: {
            id: itemTypeId,
          },
        },
        id: negativeIndex,
      }
      setProperty(addItem, 'bin.id', negativeIndex)
      setProperty(this, 'binList', [newOption, ...binList])
      this.negativeIndex = negativeIndex - 1
    },
    isSelected(id, index) {
      for (let i in this.formData) {
        if (this.formData[i].itemType.id === id) {
          if (parseInt(i) === index) {
            return false
          }
          return true
        }
      }
      return false
    },
    cancelForm() {
      this.$emit('closeDialog')
    },
    async loadBinPickList() {
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
    getBinListForItemType(itemTypeId) {
      let itemBins = []
      let { binList = [] } = this
      binList.forEach(bin => {
        let { item = {} } = bin
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

    async saveItemBulkAddForm() {
      let updateItems = []
      let createItems = []
      let { formData = [] } = this
      let itemList = cloneDeep(formData)
      for (let idx in itemList) {
        let data = itemList[idx]
        let quantity = getProperty(data, `purchasedItems.0.quantity`)
        let unitcost = getProperty(data, `purchasedItems.0.unitcost`)

        if (
          data.purchasedItems[0].hasOwnProperty('quantity') &&
          quantity === null &&
          data.purchasedItems[0].hasOwnProperty('unitcost') &&
          unitcost === null
        ) {
          continue
        }
        if (isEmpty(quantity)) {
          ftoast.critical(
            this.$t('inventory.storeroom.please_enter_quantity', {
              ns: 'inventory',
            })
          )
          return
        }
        if (isEmpty(unitcost)) {
          ftoast.critical(
            this.$t('inventory.storeroom.please_enter_unitprice', {
              ns: 'inventory',
            })
          )
          return
        }
        let storeroomId = getProperty(this, 'storeRoom.id')
        let itemTypeId = getProperty(data, `itemType.id`)

        let itemTypeObj = getProperty(data, `itemType`)
        if (itemTypeObj && itemTypeId) {
          data['storeRoom'] = { id: storeroomId }
          let status = await this.isAlreadyPresentInStore(
            itemTypeId,
            storeroomId
          )
          let binId = getProperty(data, `bin.id`)

          if (binId != null) {
            let bin = this.getBinForId(binId) || {}
            data.purchasedItems[0]['bin'] = bin
          }

          if (status) {
            let existingItemIndex = this.itemAlreadyPresent(updateItems, data)
            if (existingItemIndex >= 0) {
              let { purchasedItems } = updateItems[existingItemIndex]
              purchasedItems.push(getProperty(data, 'purchasedItems.0'))
              updateItems[existingItemIndex].purchasedItems = purchasedItems
            } else {
              data['id'] = this.itemId
              updateItems.push(data)
            }
          } else {
            let existingItemIndex = this.itemAlreadyPresent(createItems, data)
            if (existingItemIndex >= 0) {
              let { purchasedItems } = createItems[existingItemIndex]
              purchasedItems.push(getProperty(data, 'purchasedItems.0'))
              createItems[existingItemIndex].purchasedItems = purchasedItems
            } else {
              data['costType'] = 1
              createItems.push(data)
            }
          }
        }
      }

      if (createItems.length === 0 && updateItems.length === 0) {
        ftoast.critical('Kindly enter Items to add')
        return
      }
      let promise
      if (createItems.length > 0) {
        let url = 'v3/modules/data/bulkCreate'
        let params = {
          data: {
            item: createItems,
          },
          moduleName: 'item',
        }
        promise = await API.post(url, params)
      }
      if (updateItems.length > 0) {
        let url = 'v3/modules/data/bulkpatch'
        let params = {
          data: {
            item: updateItems,
          },
          moduleName: 'item',
        }
        promise = await API.post(url, params)
      }
      let { error } = (await promise) || {}
      if (error) {
        ftoast.critical(error.message || 'Error Occurred while stocking items')
      } else {
        ftoast.success(`Added successfully`)
        this.cancelForm()
        this.$emit('refresh')
      }
    },
    itemAlreadyPresent(itemList, item) {
      let itemTypeId = getProperty(item, `itemType.id`)
      let index = itemList.findIndex(it => {
        let currentItemTypeId = getProperty(it, `itemType.id`)
        return itemTypeId === currentItemTypeId && itemTypeId != null
      })
      return index
    },
    getBinForId(id) {
      let { binList = [] } = this
      return binList.find(bin => bin.id === id)
    },
    async isAlreadyPresentInStore(itemTypeId, storeId) {
      let params = {
        filters: JSON.stringify({
          itemType: {
            operatorId: 36,
            value: [itemTypeId + ''],
          },
          storeRoom: {
            operatorId: 36,
            value: [storeId + ''],
          },
        }),
      }
      let { list, error } = await API.fetchAll('item', params)
      if (error) {
        ftoast.critical(
          error.message || 'Error ocurred while checking the availability'
        )
        return false
      } else {
        if (list.length > 0) {
          this.itemId = list[0].id
        }
        return list.length > 0
      }
    },
    removeItemFormDataEntry(list, index) {
      list.splice(index, 1)
    },
    addItemFormData(field, id, index) {
      let item = this.items.findIndex(element => element.itemType.id === id)
      let { defaultBin = {} } = this.items[item] || {}
      let binId = defaultBin?.id
      let currentRecord = field[index]
      currentRecord.bin = { id: binId }
    },
    addItemFormDataEntry(field) {
      field.push({
        itemType: { id: null },
        bin: { id: null },
        purchasedItems: [{ quantity: null, unitcost: null }],
      })
    },
    fillFormData() {
      if (this.items.length === 0) {
        let t = {
          itemType: { id: null },
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
          let bin = !isEmpty(defaultBin) ? defaultBin : { id: null }
          let temp = {
            itemType: { id: this.items[i].itemType.id },
            bin,
            purchasedItems: [{ quantity: null, unitcost: null }],
          }
          this.formData.push(temp)
        }
      }
    },
  },
}
</script>
