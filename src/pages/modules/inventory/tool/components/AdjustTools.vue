<template>
  <FModal
    :title="$t('inventory.tool.adjust_tools', { ns: 'inventory' })"
    :visible="visible"
    :cancelText="this.$t('cancel')"
    :saveText="this.$t('save')"
    size="L"
    :hideFooter="false"
    @ok="saveAdjustmentForm"
    @cancel="cancelForm"
  >
    <FContainer
      v-if="loading"
      height="300px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FSpinner :size="30"
    /></FContainer>
    <FContainer v-else minHeight="300px" maxHeight="500px">
      <FTable
        ref="returnTable"
        :columns="column"
        :data="formData"
        :rounded="false"
        :hideBorder="false"
        :readOnly="false"
      >
        <template #[`cell.quantity`]="{ row, prop }">
          <FInput
            v-model="row.quantity"
            :appearance="'default'"
            :placeholder="$t('inventory.quantity', { ns: 'inventory' })"
            :disabled="false"
            @change="updateVal(row, prop)"
            size="medium"
            :wrap="true"
          ></FInput>
        </template>
        <template #[`cell.price`]="{ row, prop }">
          <FInput
            v-model="row.price"
            :appearance="'default'"
            :placeholder="$t('inventory.price', { ns: 'inventory' })"
            :disabled="row.quantity <= row.currentQuantity"
            @change="updateVal(row, prop)"
            size="medium"
            :wrap="true"
          ></FInput>
        </template>
        <template #[`cell.remarks`]="{ row, prop }">
          <FInput
            v-model="row.remarks"
            :appearance="'default'"
            :placeholder="$t('inventory.remarks', { ns: 'inventory' })"
            @change="updateVal(row, prop)"
            size="medium"
            :wrap="true"
          ></FInput>
        </template>
      </FTable>
    </FContainer>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'

import getProperty from 'dlv'
import {
  FContainer,
  FModal,
  FButton,
  FText,
  FSpinner,
  FAvatar,
  FSelect,
  FTable,
  ftoast,
  FInput,
} from '@facilio/design-system'

const transactionTypeEnum = {
  STOCK: 1,
  MANUAL: 3,
}
const transactionStateEnum = {
  ISSUE: 2,
  RETURN: 3,
  ADJUSTMENT_INCREASE: 7,
  ADJUSTMENT_DECREASE: 8,
}

export default {
  props: ['visible', 'tool'],

  components: {
    FContainer,
    FButton,
    FAvatar,
    FSelect,
    FSpinner,
    FText,
    FTable,
    FModal,
    FInput,
  },
  async created() {
    this.loading = true
    await this.fetchBins()
    this.loadFormData()
    this.loading = false
  },

  data() {
    return {
      saving: false,
      loading: false,
      binList: [],
      formData: [],
      column: [
        {
          displayName: this.$t('inventory.bin_name', { ns: 'inventory' }),
          name: 'binName',
          id: 1,
          fixed: true,
        },
        {
          displayName: this.$t('inventory.current_quantity', {
            ns: 'inventory',
          }),
          name: 'currentQuantity',
          id: 2,
        },
        {
          displayName: this.$t('inventory.quantity', {
            ns: 'inventory',
          }),
          name: 'quantity',
          id: 3,
        },
        {
          displayName: this.$t('inventory.price', {
            ns: 'inventory',
          }),
          name: 'price',
          id: 4,
        },
        {
          displayName: this.$t('inventory.remarks', {
            ns: 'inventory',
          }),
          name: 'remarks',
          id: 5,
        },
      ],
    }
  },

  computed: {},
  methods: {
    cancelForm() {
      this.$emit('closeDialog')
    },
    savedForm() {
      this.cancelForm()
      this.$emit('refresh')
    },
    async fetchBins() {
      let { tool } = this
      if (isEmpty(tool?.id)) {
        return
      }
      let filters = {
        tool: {
          operatorId: 36,
          value: [`${tool.id}`],
        },
      }
      let params = {
        filters: JSON.stringify(filters),
        force: true,
      }

      let { list, error } = await API.fetchAll('bin', params)
      if (!error) {
        this.binList = list || []
      }
    },
    loadFormData() {
      let { binList = [] } = this
      this.formData = binList.map(bin => {
        return {
          binId: bin.id,
          binName: bin.name,
          currentQuantity: bin.quantity,
          quantity: null,
          price: null,
        }
      })
    },
    async toolTransaction(toolTransaction) {
      if (toolTransaction.length < 1) {
        ftoast.critical(
          this.$t('inventory.item.enter_adjustment_quantity', {
            ns: 'inventory',
          })
        )
      } else {
        let url = 'v3/modules/data/bulkCreate'
        let params = {
          data: {
            toolTransactions: toolTransaction,
          },
          moduleName: 'toolTransactions',
          params: { adjustQuantity: true },
        }
        let { error } = await API.post(url, params)
        if (error) {
          ftoast.critical(
            error.message ||
              this.$t('inventory.unable_to_update', {
                ns: 'inventory',
              })
          )
        } else {
          ftoast.success(
            this.$t('inventory.tool.tool_adjusted_successfully', {
              ns: 'inventory',
            })
          )
          this.savedForm()
        }
      }
    },
    updateVal(row, prop) {
      let { formData } = this
      if (!isArray(formData)) {
        return
      }
      let idx = formData.findIndex(it => it.binId === row.binId)
      if (isEmpty(idx)) {
        return
      }
      this.formData[idx][prop] = row[prop]
    },

    async saveAdjustmentForm() {
      let { formData = [] } = this
      let toolId = getProperty(this.tool, 'id', null)
      let toolTransactions = []
      try {
        formData.forEach(adjustTool => {
          let { quantity, currentQuantity, binId, remarks } = adjustTool
          if (isEmpty(quantity)) {
            return
          }
          if (isEmpty(remarks)) {
            throw new Error(
              this.$t('inventory.storeroom.remarks_mandatory', {
                ns: 'inventory',
              })
            )
          }
          let toolTransactionData = {
            tool: {
              id: toolId,
            },
            bin: {
              id: binId,
            },
            transactionType: transactionTypeEnum.STOCK,
            remarks,
          }
          if (quantity < currentQuantity) {
            toolTransactionData = {
              ...toolTransactionData,
              transactionState: transactionStateEnum.ADJUSTMENT_DECREASE,
              quantity: currentQuantity - quantity,
            }
          } else if (quantity > currentQuantity) {
            let { price } = adjustTool

            if (isEmpty(price)) {
              throw new Error(
                this.$t('inventory.enter_unit_price', {
                  ns: 'inventory',
                })
              )
            } else {
              let qua = 0

              if (currentQuantity >= 0) {
                qua = currentQuantity
              } else {
                qua = 0
              }
              quantity = quantity - qua

              toolTransactionData = {
                ...toolTransactionData,
                purchasedTool: {
                  unitPrice: price,
                  quantity,
                },
                transactionState: transactionStateEnum.ADJUSTMENT_INCREASE,
                quantity,
              }
            }
          } else {
            throw new Error(
              this.$t('inventory.unable_to_adjust_quantity', {
                ns: 'inventory',
              })
            )
          }
          toolTransactions.push(toolTransactionData)
        })
      } catch (error) {
        ftoast.critical(
          error.message ||
            this.$t('error_occured', {
              ns: 'inventory',
            })
        )
        return
      }

      this.toolTransaction(toolTransactions)
    },
  },
}
</script>
