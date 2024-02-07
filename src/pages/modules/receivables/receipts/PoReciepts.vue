<template>
  <FModal
    :title="title"
    :visible="visible"
    :cancelText="this.$t('cancel')"
    :saveText="this.$t('save')"
    size="L"
    :hideFooter="false"
    @ok="saveDialog"
    @cancel="closeDialog"
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
    <FContainer
      v-else-if="isEmpty(recordList)"
      height="300px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FEmptyState
        :title="emptyStateMessage"
        :vertical="true"
        illustration="no-data"
      >
      </FEmptyState>
    </FContainer>

    <FContainer minHeight="300px" maxHeight="500px" v-else>
      <FContainer padding="containerXLarge">
        <FButton
          appearance="secondary"
          size="small"
          iconGroup="default"
          iconName="checked"
          iconPosition="prefix"
          @click="markAsFullyReceivedOrReturned(recordList)"
        >
          {{ $t('inventory.item.mark_as_fully_returned', { ns: 'inventory' }) }}
        </FButton>
      </FContainer>
      <FTable
        ref="returnTable"
        :columns="column"
        :data.sync="recordList"
        :rounded="false"
        selectType="bulk"
        :hideBorder="false"
        :selectedList="selectedReciepts"
        @recordSelected="selectRecieptsActions"
        :readOnly="false"
      >
        <template #[`cell.receivedQuantity`]="{ row, prop }">
          <FInput
            v-model="row.receivedQuantity"
            :appearance="'default'"
            :min="1"
            placeholder="Quantity"
            :disabled="false"
            size="medium"
            type="number"
            :wrap="true"
            @change="updateVal(row, prop)"
          ></FInput>
        </template>
        <template #[`cell.returnQuantity`]="{ row, prop }">
          <FInput
            v-model="row.returnQuantity"
            :appearance="'default'"
            :min="1"
            placeholder="Quantity"
            :disabled="false"
            size="medium"
            type="number"
            :wrap="true"
            @change="updateVal(row, prop)"
          ></FInput>
        </template>
        <template #[`cell.remarksData`]="{ row, prop }">
          <FInput
            v-model="row.remarksData"
            :appearance="'default'"
            placeholder="Remarks"
            :disabled="false"
            size="medium"
            :wrap="true"
            @change="updateVal(row, prop)"
          ></FInput>
        </template>
      </FTable>
    </FContainer>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FModal,
  FEmptyState,
  FSpinner,
  FButton,
  FText,
  FAvatar,
  FSelect,
  FTable,
  ftoast,
  FInput,
} from '@facilio/design-system'

const inventoryTypes = {
  ITEM_TYPE: 1,
  TOOL_TYPE: 2,
  SERVICE: 3,
  DESCRIPTION: 4,
}

export default {
  props: ['visible', 'isAddReceipt', 'receipts', 'record'],

  components: {
    FContainer,
    FButton,
    FAvatar,
    FSelect,
    FSpinner,
    FText,
    FTable,
    FModal,
    FEmptyState,
    FInput,
  },
  created() {
    this.loading = true
    let { receipts = {}, quantityDue, getModuleAndDataKey } = this
    this.recordList = receipts.map(record => {
      return {
        ...record,
        quantityDue: quantityDue(record),
        lineItem: getModuleAndDataKey(record)?.data?.name || '---',
      }
    })
    this.loading = false
  },

  data() {
    return {
      recordList: [],
      selectedReciepts: [],
    }
  },
  computed: {
    title() {
      let { isAddReceipt } = this
      return isAddReceipt ? 'Add Receipt' : 'Return Receipt'
    },
    onMarking() {
      let { isAddReceipt } = this
      return isAddReceipt ? 'Mark as fully received' : 'Mark as fully returned'
    },
    emptyStateMessage() {
      let { isAddReceipt } = this
      return isAddReceipt ? 'No Items to Add' : 'No Items to Return'
    },
    column() {
      let { isAddReceipt } = this
      let quantityColumn = isAddReceipt
        ? [
            {
              displayName: 'Quanity Due',
              name: 'quantityDue',
              id: 3,
            },
            {
              displayName: 'Receiving Quanity',
              name: 'receivedQuantity',
              id: 4,
            },
          ]
        : [
            {
              displayName: 'Received Quantity',
              name: 'quantityReceived',
              id: 3,
            },
            {
              displayName: 'Return Quanity',
              name: 'returnQuantity',
              id: 4,
            },
          ]
      return [
        {
          displayName: 'Line Item',
          name: 'lineItem',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'Ordered Quanity',
          name: 'quantity',
          id: 2,
        },
        ...quantityColumn,
        {
          displayName: 'Remarks',
          name: 'remarksData',
          id: 5,
        },
      ]
    },
  },
  methods: {
    isEmpty,
    updateVal(row, prop) {
      let { recordList } = this
      let idx = recordList.findIndex(reciept => reciept.id === row.id)
      if (isEmpty(idx)) {
        return
      }
      this.recordList[idx][prop] = row[prop]
    },
    markAsFullyReceivedOrReturned(val) {
      val.forEach(element => {
        this.selectedReciepts.forEach(obj => {
          if (element.id === obj.id) {
            if (this.isAddReceipt)
              element.receivedQuantity = this.quantityDue(element)
            else element.returnQuantity = element.quantityReceived
          }
        })
      })
    },
    closeDialog() {
      this.$emit('onClose')
    },
    async saveDialog() {
      let { isAddReceipt } = this
      if (isAddReceipt) {
        await this.receiveLineItem()
      } else {
        await this.returnLineItem()
      }
    },
    selectRecieptsActions(val) {
      this.selectedReciepts = val
    },
    async receiveLineItem() {
      let promise
      let receipts = []
      let { recordList, record } = this

      let isQuantityExceeds = recordList.some(item => {
        let { receivedQuantity, quantity, quantityReceived } = item || {}
        let remainingQuantity = quantity - quantityReceived
        return !isEmpty(receivedQuantity)
          ? receivedQuantity > remainingQuantity
          : false
      })
      if (isQuantityExceeds) {
        ftoast.critical('Receiving Quantity is Greater than Pending Quantity')
      } else {
        receipts = recordList
          .filter(
            item =>
              !isEmpty(item?.receivedQuantity) &&
              parseInt(item?.receivedQuantity) !== 0
          )
          .map(item => {
            let { receivedQuantity, id, remarksData } = item || {}

            let { id: receivableId } = record || {}

            return {
              receivableId,
              lineItem: { id },
              quantity: parseInt(receivedQuantity),
              status: 1,
              remarks: remarksData,
            }
          })
      }
      if (!isEmpty(receipts)) {
        let url = 'v3/modules/data/bulkCreate'
        let params = {
          data: {
            receipts: receipts,
          },
          moduleName: 'receipts',
        }
        promise = await API.post(url, params)
        let { error } = (await promise) || {}
        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          ftoast.success('Line Items Received Successfully')
          this.$emit('onSave')
        }
      }
    },
    async returnLineItem() {
      let promise
      let receipts = []
      let { recordList, record } = this
      let isQuantityExceeds = recordList.some(item => {
        let { returnQuantity, quantityReceived } = item || {}
        return returnQuantity > quantityReceived ? true : false
      })
      if (isQuantityExceeds) {
        ftoast.critical('Returning Quantity is Greater than Received Quantity')
      } else {
        receipts = recordList
          .filter(
            item =>
              !isEmpty(item?.returnQuantity) && parseInt(item?.returnQuantity)
          )
          .map(item => {
            let { returnQuantity, id, remarksData } = item || {}
            let { id: receivableId } = record || {}
            return {
              receivableId,
              lineItem: { id },
              quantity: parseInt(returnQuantity),
              status: 2,
              remarks: remarksData,
            }
          })
      }
      if (!isEmpty(receipts)) {
        let url = 'v3/modules/data/bulkCreate'
        let params = {
          data: {
            receipts: receipts,
          },
          moduleName: 'receipts',
        }
        promise = await API.post(url, params)
        let { error } = (await promise) || {}
        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          ftoast.success('Line Items Returned Successfully')
          this.$emit('onSave')
        }
      }
    },
    getModuleAndDataKey(recordData) {
      let { inventoryType } = recordData || {}

      let { ITEM_TYPE, TOOL_TYPE, SERVICE, DESCRIPTION } = inventoryTypes || {}

      let moduleAndDataKeyVsInventoryType = {
        [ITEM_TYPE]: { module: 'item', data: recordData.itemType },
        [TOOL_TYPE]: { module: 'tool', data: recordData.toolType },
        [DESCRIPTION]: { module: 'others', data: recordData.description },
        [SERVICE]: { module: 'service', data: recordData.service },
      }

      return moduleAndDataKeyVsInventoryType[inventoryType] || {}
    },
    quantityDue(val) {
      if (isEmpty(val.quantityReceived)) {
        return val.quantity
      } else {
        return val.quantity - val.quantityReceived
      }
    },
  },
}
</script>
