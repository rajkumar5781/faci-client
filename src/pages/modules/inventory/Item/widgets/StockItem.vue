<template>
  <FModal
    :title="$t('inventory.item.stock_item', { ns: 'inventory' })"
    :visible="visible"
    :cancelText="this.$t('cancel')"
    :saveText="this.$t('save')"
    size="S"
    :hideFooter="false"
    :confirmLoading="saving"
    @ok="saveRecord"
    @cancel="handleCancel"
  >
    <LiveFormLoader v-if="loading" :dialog="true" />
    <FForm v-else ref="stock-item-form" :model="record" position="top">
      <FContainer class="stock-item">
        <FContainer paddingTop="containerXxLarge" class="mR50">
          <FFormItem
            :label="$t('inventory.item._item_types', { ns: 'inventory' })"
            prop="itemType"
            :hideLabel="false"
            id="item-form-itemType"
            :required="true"
          >
            <Lookup
              disabled
              :field.sync="itemTypesLookupData"
              v-model="getItemtype"
            />
          </FFormItem>
        </FContainer>
        <FContainer display="flex" paddingTop="containerXxLarge" class="mR50">
          <FContainer :width="storeRoomPickerWidth">
            <FFormItem
              :label="$t('inventory.item.storeroom', { ns: 'inventory' })"
              :hideLabel="false"
              id="item-form-storeRoom"
            >
              <Lookup
                v-if="moduleName === 'itemTypes'"
                v-model="storeRoomId"
                :field="storeRoomLookupData"
              ></Lookup>
              <Lookup
                v-else-if="['storeRoom', 'item'].includes(moduleName)"
                disabled
                v-model="getStoreroom"
                :field="storeRoomLookupData"
              ></Lookup>
            </FFormItem>
          </FContainer>
          <FContainer
            width="50%"
            marginLeft="containerXxLarge"
            v-if="!isRotating"
          >
            <FFormItem
              :label="$t('inventory.item.bin', { ns: 'inventory' })"
              prop="bin"
              :hideLabel="false"
              id="item-form-bin"
            >
              <FSelect
                v-model="binId"
                :options="binList"
                :allowCreate="true"
                :clearable="false"
                filterable
                size="large"
                :placeholder="
                  $t('inventory.item.select_bin', { ns: 'inventory' })
                "
                @addOption="addNewBin"
              >
              </FSelect>
            </FFormItem>
          </FContainer>
        </FContainer>
        <FContainer
          v-if="isRotating"
          paddingTop="containerXxLarge"
          class="mR50"
        >
          <FFormItem
            :label="$t('inventory.item.issuance_cost', { ns: 'inventory' })"
            prop="issuanceCost"
            :hideLabel="false"
            id="item-form-issuanceCost"
          >
            <FInput
              v-model="issuanceCost"
              appearance="default"
              :placeholder="
                $t('inventory.item.issuance_cost', { ns: 'inventory' })
              "
              size="medium"
            />
          </FFormItem>
        </FContainer>
        <FContainer v-else paddingTop="containerXxLarge">
          <FFormItem
            :label="$t('inventory.item.purchased_items', { ns: 'inventory' })"
            prop="purchasedItems"
            :hideLabel="false"
            id="item-form-purchasedItems"
            :required="true"
          >
            <FContainer
              display="flex"
              paddingBottom="containerMedium"
              paddingTop="containerMedium"
              width="100%"
              v-if="!isEmpty(purchasedItems)"
            >
              <FContainer width="42%">
                <FText appearance="headingMed14" color="textMain">
                  {{ $t('inventory.item.quantity', { ns: 'inventory' }) }}
                </FText>
              </FContainer>
              <FContainer marginLeft="containerXxLarge" width="50%">
                <FText appearance="headingMed14" color="textMain">
                  {{
                    $t('inventory.item.unit_price', {
                      ns: 'inventory',
                    })
                  }}
                </FText>
              </FContainer>
            </FContainer>

            <FContainer
              v-for="(data, index) in purchasedItems"
              :key="index"
              paddingBottom="containerXLarge"
            >
              <FContainer display="flex">
                <FContainer width="45%">
                  <FInput
                    v-model="data.quantity"
                    type="number"
                    appearance="default"
                    placeholder="Enter Quantity"
                    size="medium"
                  />
                </FContainer>
                <FContainer marginLeft="containerXxLarge" width="45%">
                  <FInput
                    v-model="data.unitcost"
                    type="number"
                    appearance="default"
                    placeholder="Enter Price"
                    size="medium"
                  />
                </FContainer>
                <FContainer
                  marginLeft="containerXxLarge"
                  width="10%"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <FButton
                    iconGroup="action"
                    iconName="delete"
                    size="medium"
                    appearance="tertiary"
                    @click="removePurchasedItems(index)"
                  ></FButton>
                </FContainer>
              </FContainer>
            </FContainer>
            <FContainer paddingTop="containerXxLarge">
              <FButton
                iconGroup="sign-symbols"
                iconName="addition"
                size="medium"
                appearance="tertiary"
                @click="addPurchasedItems()"
                iconPosition="prefix"
                color="backgroundPrimaryDefault"
              >
                <FText color="backgroundPrimaryDefault">
                  {{ $t('inventory.item.stock_item', { ns: 'inventory' }) }}
                </FText>
              </FButton>
            </FContainer>
          </FFormItem>
        </FContainer>
      </FContainer>
    </FForm>
  </FModal>
</template>
<script>
import Constants from '/src/utils/constants.js'
import { API } from '@facilio/api'
import { getFieldOptions } from '/src/utils/picklist.js'
import { isEmpty } from '@facilio/utils/validation'
import { cloneObject } from '../../../../../utils/helpers'

import {
  FContainer,
  FText,
  FIcon,
  FTable,
  FModal,
  FButton,
  ftoast,
  FSelect,
  FForm,
  FFormItem,
  FEmptyState,
  FPagination,
  FInput,
} from '@facilio/design-system'
import { LiveFormLoader } from '@facilio/forms'

import getProperty from 'dlv'
import { Lookup } from '@facilio/ui/new-forms'

export default {
  name: 'StockItem',
  props: ['visible', 'record', 'moduleName'],
  components: {
    FText,
    FContainer,
    FIcon,
    FTable,
    FModal,
    FButton,
    FSelect,
    LiveFormLoader,
    FForm,
    FFormItem,
    FEmptyState,
    FPagination,
    Lookup,
    FInput,
  },
  data() {
    return {
      saving: false,
      storerooms: {},
      loading: false,
      issuanceCost: null,
      data: {},
      purchasedItems: [
        {
          quantity: null,
          unitcost: null,
        },
      ],
      storeRoomId: null,
      binId: null,
      itemId: null,
      itemsList: [],
      itemTypesLookupData: {
        lookupModule: { name: 'itemTypes' },
        multiple: false,
      },
      storeRoomLookupData: {
        lookupModule: { name: 'storeRoom' },
        multiple: false,
      },
      binList: [],
      newBinName: '',
      defaultBin: {},
      isAlreadyPresentInStoreRoom: false,
    }
  },
  async created() {
    this.loading = true
    if (['itemTypes', 'storeRoom'].includes(this.moduleName)) {
      await this.checkForExistingItem()
    } else {
      let { record = {} } = this
      let { defaultBin = {} } = record
      this.binId = defaultBin.id
    }
    this.loadStoreRoomPickList()
    this.loadBinPickList()
    this.loading = false
  },
  watch: {
    getItemtype() {
      this.loadBinPickList()
    },
    storeId() {
      this.loadBinPickList()
    },
  },
  computed: {
    getItemtype() {
      if (['item', 'storeRoom'].includes(this.moduleName)) {
        return getProperty(this, 'record.itemType.id')
      } else {
        return getProperty(this, 'record.id')
      }
    },
    storeRoomPickerWidth() {
      let { isRotating = false } = this
      return isRotating ? '100%' : '50%'
    },
    itemtypeId() {
      return this.moduleName === 'itemTypes'
        ? getProperty(this, 'record.id')
        : getProperty(this, 'record.itemType.id')
    },
    getStoreroom() {
      return getProperty(this, 'record.storeRoom.id')
    },
    storeId() {
      let { storeRoomId, getStoreroom, moduleName } = this

      return moduleName === 'itemTypes' ? storeRoomId : getStoreroom
    },
    isRotating() {
      if (this.moduleName === 'itemTypes') {
        return getProperty(this, 'record.rotating', null)
      } else {
        return getProperty(this, 'record.itemType.isRotating', null)
      }
    },
  },
  methods: {
    isEmpty,
    addPurchasedItems() {
      let { purchasedItems } = this
      purchasedItems.push(cloneObject(Constants.PURCHASEDITEM_DEFAULTS))
    },
    removePurchasedItems(index) {
      let { purchasedItems } = this
      purchasedItems.splice(index, 1)
    },
    addNewBin(binName) {
      if (isEmpty(binName)) {
        return
      }
      this.clearPreviouslyAddedBin()
      this.newBinName = binName
      let { binList } = this
      let newOption = {
        label: binName,
        value: -1,
      }
      this.binList = [newOption, ...binList]
      this.binId = -1
    },
    clearPreviouslyAddedBin() {
      let { binList = [] } = this
      this.binList = binList.filter(bin => bin.value !== -1)
      this.newBinName = ''
    },

    async loadStoreRoomPickList() {
      this.storerooms = {}
      let { error, options } = await getFieldOptions({
        field: { lookupModuleName: 'storeRoom' },
      })

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        this.storerooms = options
      }
    },
    async loadBinPickList() {
      let { getItemtype, storeId } = this
      let filters = {}
      if (this.moduleName === 'item') {
        let recordId = getProperty(this, 'record.id')
        filters = {
          item: { operatorId: 36, value: [`${recordId}`] },
        }
      } else if (!isEmpty(getItemtype) && !isEmpty(storeId)) {
        filters = {
          oneLevelLookup: {
            item: [
              {
                operatorId: 35,
                criteriaValue: {
                  itemType: { operatorId: 36, value: [`${getItemtype}`] },
                },
              },
              {
                operatorId: 35,
                criteriaValue: {
                  storeRoom: { operatorId: 36, value: [`${storeId}`] },
                },
              },
            ],
          },
        }
      }
      if (isEmpty(filters)) {
        return
      }

      let { error, options } = await getFieldOptions({
        field: {
          lookupModuleName: 'bin',
          filters,
        },
      })

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        this.binList = options
      }
    },

    async saveRecord() {
      this.saving = true
      let recordId = getProperty(this, 'record.id')
      let {
        purchasedItems,
        record,
        storeId,
        binId,
        newBinName,
        itemtypeId,
        isRotating,
        issuanceCost,
      } = this

      let { currencyCode, exchangeRate } = record || {}
      if (!isEmpty(purchasedItems)) {
        let lastPurchasedLineItem = purchasedItems[purchasedItems.length - 1]
        currencyCode = lastPurchasedLineItem.currencyCode
        exchangeRate = lastPurchasedLineItem.exchangeRate
      }

      let promise
      let bin = {
        id: binId,
      }
      if (isEmpty(binId) && !isEmpty(newBinName)) {
        bin = { ...bin, name: newBinName }
      }
      if (
        (purchasedItems[0].quantity === null ||
          purchasedItems[0].unitcost === null) &&
        !isRotating
      ) {
        ftoast.critical('Please enter Purchased Items')
      } else {
        purchasedItems = purchasedItems.filter(pTool => {
          let { quantity, unitcost } = pTool
          return (
            quantity != null &&
            quantity > 0 &&
            unitcost != null &&
            unitcost >= 0
          )
        })
        purchasedItems = this.setBin(purchasedItems, bin)
        if (this.moduleName === 'item') {
          if (!isRotating) {
            record.purchasedItems = purchasedItems
          }
          record = { ...record, currencyCode, exchangeRate }

          promise = await API.updateRecord('item', {
            id: recordId,
            data: record,
          })
        } else if (['itemTypes', 'storeRoom'].includes(this.moduleName)) {
          if (isEmpty(storeId)) {
            ftoast.critical('Please Select the Storeroom')
          } else {
            await this.checkForExistingItem()
            let status = this.isAlreadyPresentInStoreRoom
            if (status && isRotating) {
              ftoast.critical('Item already present in storeroom')
              this.saving = false
              return
            }
            let { itemId } = this
            let itemRecord = {
              itemType: { id: itemtypeId },
              storeRoom: { id: storeId },
            }
            itemRecord = { ...itemRecord, currencyCode, exchangeRate }
            if (!isRotating) {
              itemRecord['purchasedItems'] = purchasedItems
            }
            if (!isEmpty(issuanceCost) && isRotating) {
              itemRecord['issuanceCost'] = issuanceCost
            }
            if (status) {
              promise = await API.updateRecord('item', {
                id: itemId,
                data: itemRecord,
              })
            } else {
              itemRecord['costType'] = 1

              promise = await API.createRecord('item', {
                data: itemRecord,
              })
            }
          }
        }
        if (!isEmpty(promise)) {
          let { error } = (await promise) || {}
          if (error) {
            ftoast.critical(
              error.message ||
                this.$t('inventory.item.error_stock_items', {
                  ns: 'inventory',
                })
            )
          } else {
            this.handleCancel()
            ftoast.success(
              this.$t('inventory.item.item_added_successfully', {
                ns: 'inventory',
              })
            )
            this.$emit('saved')
          }
        }
      }
      this.saving = false
    },
    setBin(purchasedItems, bin) {
      return purchasedItems.map(pItem => {
        return { ...pItem, bin }
      })
    },
    async checkForExistingItem() {
      let params = {
        filters: JSON.stringify({
          itemType: {
            operatorId: 36,
            value: [this.itemtypeId + ''],
          },
          storeRoom: {
            operatorId: 36,
            value: [this.storeId + ''],
          },
        }),
      }
      let { list, error } = await API.fetchAll('item', params)
      if (error) {
        ftoast.critical(
          error || 'Error ocurred while checking the availability'
        )
        return false
      } else {
        if (list.length > 0) {
          this.itemId = list[0].id
          let defaultBin = list[0].defaultBin
          this.binId = defaultBin?.id

          this.isAlreadyPresentInStoreRoom = true
        }
        return list.length > 0
      }
    },
    handleCancel() {
      this.$emit('closeDialog')
      this.purchasedItems = [
        {
          quantity: null,
          unitcost: null,
        },
      ]
      this.storeRoomId = null
    },
  },
}
</script>
<style lang="scss" scoped>
.mR50 {
  margin-right: 60px;
}
.stock-item {
  padding: 20px 20px 30px 50px;
}
</style>
