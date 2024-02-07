<template>
  <FModal
    :title="$t('inventory.tool.stock_tool', { ns: 'inventory' })"
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
    <FForm v-else ref="stock-tool-form" :model="record" position="top">
      <FContainer class="stock-tool">
        <FContainer paddingTop="containerXxLarge" class="mR50">
          <FFormItem
            :label="$t('inventory.tool_type', { ns: 'inventory' })"
            prop="toolType"
            :hideLabel="false"
            id="tool-form-toolType"
            :required="true"
          >
            <Lookup
              disabled
              :field.sync="toolTypesLookupData"
              v-model="getTooltype"
            />
          </FFormItem>
        </FContainer>
        <FContainer display="flex" paddingTop="containerXxLarge" class="mR50">
          <FContainer>
            <FFormItem
              :label="$t('inventory.item.storeroom', { ns: 'inventory' })"
              :hideLabel="false"
              id="tool-form-storeRoom"
            >
              <Lookup
                v-if="moduleName === 'toolTypes'"
                v-model="storeRoomId"
                :field="storeRoomLookupData"
              ></Lookup>
              <Lookup
                v-else-if="['storeRoom', 'tool'].includes(moduleName)"
                disabled
                v-model="getStoreroom"
                :field="storeRoomLookupData"
              ></Lookup>
            </FFormItem>
          </FContainer>
          <FContainer v-if="!isRotating" marginLeft="containerXxLarge">
            <FFormItem
              :label="$t('inventory.item.bin', { ns: 'inventory' })"
              prop="bin"
              :hideLabel="false"
              id="tool-form-bin"
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

        <FContainer v-if="!isRotating" paddingTop="containerXxLarge">
          <FFormItem
            :label="$t('inventory.tool.purchased_tools', { ns: 'inventory' })"
            prop="purchasedTools"
            :hideLabel="false"
            id="tool-form-purchasedTools"
            :required="true"
          >
            <FContainer
              display="flex"
              paddingBottom="containerMedium"
              paddingTop="containerMedium"
              width="100%"
              v-if="!isEmpty(purchasedTools)"
            >
              <FContainer width="42%">
                <FText appearance="headingMed14" color="textMain">
                  {{ $t('inventory.item.quantity', { ns: 'inventory' }) }}
                </FText>
              </FContainer>
              <FContainer marginLeft="containerXxLarge" width="50%">
                <FText appearance="headingMed14" color="textMain">
                  {{
                    $t('inventory.tool.purchased_price', {
                      ns: 'inventory',
                    })
                  }}
                </FText>
              </FContainer>
            </FContainer>

            <FContainer
              v-for="(data, index) in purchasedTools"
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
                    v-model="data.unitPrice"
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
                    @click="removePurchasedTools(index)"
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
                @click="addPurchasedTools()"
                iconPosition="prefix"
                color="backgroundPrimaryDefault"
              >
                <FText color="backgroundPrimaryDefault">
                  {{ $t('inventory.tool.stock_tool', { ns: 'inventory' }) }}
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
  name: 'StockTool',
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
      data: {},
      purchasedTools: [
        {
          quantity: null,
          unitPrice: null,
        },
      ],
      storeRoomId: null,
      binId: null,
      toolId: null,
      toolsList: [],
      toolTypesLookupData: {
        lookupModule: { name: 'toolTypes' },
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
    if (['toolTypes', 'storeRoom'].includes(this.moduleName)) {
      await this.checkForExistingTool()
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
    getTooltype() {
      this.loadBinPickList()
    },
    storeId() {
      this.loadBinPickList()
    },
  },
  computed: {
    getTooltype() {
      if (['tool', 'storeRoom'].includes(this.moduleName)) {
        return getProperty(this, 'record.toolType.id')
      } else {
        return getProperty(this, 'record.id')
      }
    },
    tooltypeId() {
      return this.moduleName === 'toolTypes'
        ? getProperty(this, 'record.id')
        : getProperty(this, 'record.toolType.id')
    },
    getStoreroom() {
      return getProperty(this, 'record.storeRoom.id')
    },
    storeId() {
      let { storeRoomId, getStoreroom, moduleName } = this

      return moduleName === 'toolTypes' ? storeRoomId : getStoreroom
    },
    isRotating() {
      if (this.moduleName === 'toolTypes') {
        return getProperty(this, 'record.rotating', null)
      } else if (this.moduleName === 'storeRoom') {
        return getProperty(this, 'record.toolType.isRotating', null)
      } else {
        return false
      }
    },
  },
  methods: {
    isEmpty,
    addPurchasedTools() {
      let { purchasedTools } = this
      purchasedTools.push(cloneObject(Constants.PURCHASEDITEM_DEFAULTS))
    },
    removePurchasedTools(index) {
      let { purchasedTools } = this
      purchasedTools.splice(index, 1)
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
      let { getTooltype, storeId } = this
      let filters = {}
      if (this.moduleName === 'tool') {
        let recordId = getProperty(this, 'record.id')
        filters = {
          tool: { operatorId: 36, value: [`${recordId}`] },
        }
      } else if (!isEmpty(getTooltype) && !isEmpty(storeId)) {
        filters = {
          oneLevelLookup: {
            tool: [
              {
                operatorId: 35,
                criteriaValue: {
                  toolType: { operatorId: 36, value: [`${getTooltype}`] },
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
        purchasedTools,
        record,
        storeId,
        binId,
        newBinName,
        tooltypeId,
        isRotating,
      } = this

      let promise
      let bin = {
        id: binId,
      }
      if (isEmpty(binId) && !isEmpty(newBinName)) {
        bin = { ...bin, name: newBinName }
      }
      if (
        (getProperty(purchasedTools, '0.quantity') === null ||
          getProperty(purchasedTools, '0.unitPrice') === null) &&
        !isRotating
      ) {
        ftoast.critical('Please enter Purchased Tools')
      } else {
        purchasedTools = purchasedTools.filter(pTool => {
          let { quantity, unitPrice } = pTool
          return (
            quantity != null &&
            quantity > 0 &&
            unitPrice != null &&
            unitPrice >= 0
          )
        })
        purchasedTools = this.setBin(purchasedTools, bin)
        if (this.moduleName === 'tool') {
          record.purchasedTools = purchasedTools
          record = { ...record }

          promise = await API.updateRecord('tool', {
            id: recordId,
            data: record,
          })
        } else if (['toolTypes', 'storeRoom'].includes(this.moduleName)) {
          if (isEmpty(storeId)) {
            ftoast.critical('Please Select the Storeroom')
          } else {
            await this.checkForExistingTool()
            let status = this.isAlreadyPresentInStoreRoom
            if (status && isRotating) {
              ftoast.critical('Tool already present in storeroom')
              this.saving = false
              return
            }
            let { toolId } = this
            let toolRecord = {
              toolType: { id: tooltypeId },
              storeRoom: { id: storeId },
            }
            toolRecord = { ...toolRecord }
            if (!isRotating) {
              toolRecord['purchasedTools'] = purchasedTools
            }

            if (status) {
              promise = await API.updateRecord('tool', {
                id: toolId,
                data: toolRecord,
              })
            } else {
              toolRecord['costType'] = 1

              promise = await API.createRecord('tool', {
                data: toolRecord,
              })
            }
          }
        }
        if (!isEmpty(promise)) {
          let { error } = (await promise) || {}
          if (error) {
            ftoast.critical(
              error.message ||
                this.$t('inventory.tool.error_stock_tools', {
                  ns: 'inventory',
                })
            )
          } else {
            this.handleCancel()
            ftoast.success(
              this.$t('inventory.tool.tool_added_successfully', {
                ns: 'inventory',
              })
            )
            this.$emit('saved')
          }
        }
      }
      this.saving = false
    },
    setBin(purchasedTools, bin) {
      return purchasedTools.map(pTool => {
        return { ...pTool, bin }
      })
    },
    async checkForExistingTool() {
      let params = {
        filters: JSON.stringify({
          toolType: {
            operatorId: 36,
            value: [this.tooltypeId + ''],
          },
          storeRoom: {
            operatorId: 36,
            value: [this.storeId + ''],
          },
        }),
      }
      let { list, error } = await API.fetchAll('tool', params)
      if (error) {
        ftoast.critical(
          error || 'Error ocurred while checking the availability'
        )
        return false
      } else {
        if (list.length > 0) {
          this.toolId = list[0].id
          let defaultBin = list[0].defaultBin
          this.binId = defaultBin?.id

          this.isAlreadyPresentInStoreRoom = true
        }
        return list.length > 0
      }
    },
    handleCancel() {
      this.$emit('closeDialog')
      this.purchasedTools = [
        {
          quantity: null,
          unitPrice: null,
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
.stock-tool {
  padding: 20px 20px 30px 50px;
}
</style>
