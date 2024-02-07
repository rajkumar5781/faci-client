<template>
  <FModal
    :title="$t('inventory.item.adjust_items', { ns: 'inventory' })"
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
  props: ['visible', 'item'],

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
      let { item } = this
      if (isEmpty(item?.id)) {
        return
      }
      let filters = {
        item: {
          operatorId: 36,
          value: [`${item.id}`],
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
    async itemTransaction(itemTransaction) {
      if (itemTransaction.length < 1) {
        ftoast.critical(
          this.$t('inventory.item.enter_adjustment_quantity', {
            ns: 'inventory',
          })
        )
      } else {
        let url = 'v3/modules/data/bulkCreate'
        let params = {
          data: {
            itemTransactions: itemTransaction,
          },
          moduleName: 'itemTransactions',
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
            this.$t('inventory.item.item_adjusted_successfully', {
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
      let itemId = getProperty(this.item, 'id', null)
      let itemTransactions = []
      try {
        formData.forEach(adjustItem => {
          let { quantity, currentQuantity = 0, binId, remarks } = adjustItem
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
          let itemTransactionData = {
            item: {
              id: itemId,
            },
            bin: {
              id: binId,
            },
            transactionType: transactionTypeEnum.STOCK,
          }
          if (quantity < currentQuantity) {
            itemTransactionData = {
              ...itemTransactionData,
              transactionState: transactionStateEnum.ADJUSTMENT_DECREASE,
              quantity: currentQuantity - quantity,
              remarks,
            }
          } else if (quantity > currentQuantity) {
            let { price } = adjustItem

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

              itemTransactionData = {
                ...itemTransactionData,
                purchasedItem: {
                  unitcost: price,
                  quantity,
                },
                transactionState: transactionStateEnum.ADJUSTMENT_INCREASE,
                quantity,
                remarks,
              }
            }
          } else {
            throw new Error(
              this.$t('inventory.unable_to_adjust_quantity', {
                ns: 'inventory',
              })
            )
          }
          itemTransactions.push(itemTransactionData)
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

      this.itemTransaction(itemTransactions)
    },
  },
}
</script>
