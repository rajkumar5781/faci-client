<template>
  <FModal
    :title="$t('inventory.item.return_items', { ns: 'inventory' })"
    :visible="visible"
    :cancelText="this.$t('cancel')"
    :saveText="this.$t('save')"
    size="L"
    :hideFooter="false"
    @ok="returnItem"
    @cancel="cancelForm"
    ><FContainer minHeight="300px" maxHeight="500px">
      <FContainer display="flex">
        <FContainer
          v-if="!isItemModule"
          padding="containerXLarge"
          paddingRight="containerNone"
        >
          <Lookup
            :field.sync="itemField"
            v-model="itemId"
            size="small"
            :hideLookupIcon="true"
            :isClearable="false"
            :placeholder="
              $t('inventory.storeroom.select_item', { ns: 'inventory' })
            "
          />
        </FContainer>
        <FContainer v-if="!isEmpty(issuedItems)" padding="containerXLarge">
          <FButton
            appearance="secondary"
            size="small"
            iconGroup="default"
            iconName="checked"
            iconPosition="prefix"
            @click="markAsFullyReturned(issuedItems)"
          >
            {{
              $t('inventory.item.mark_as_fully_returned', { ns: 'inventory' })
            }}
          </FButton>
        </FContainer>
      </FContainer>
      <FContainer
        v-if="loading"
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding="sectionLarge"
        ><FSpinner :size="30"
      /></FContainer>
      <FContainer
        v-else-if="isEmpty(issuedItems)"
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
      <FTable
        v-else
        ref="returnTable"
        :columns="column"
        :data.sync="issuedItems"
        :rounded="false"
        selectType="bulk"
        :hideBorder="false"
        :selectedList="selectedIssuedItems"
        @recordSelected="selectIssuedItemActions"
        :readOnly="false"
      >
        <template #[`cell.parentId`]="{ row }">
          <FText v-if="row.transactionType === 2">
            {{ `WO-#${row.parentId}` }}
          </FText>
          <template v-else-if="row.transactionType === 3">
            <FContainer
              v-if="row.resource.resourceType === 4"
              display="flex"
              alignItems="center"
            >
              <FAvatar
                size="S"
                :userName="getUserName(row.issuedTo)"
                :avatarUrl="row.issuedTo?.avatarUrl"
              ></FAvatar
              ><FText paddingLeft="containerMedium">{{
                getUserName(row.issuedTo)
              }}</FText>
            </FContainer>

            <FText v-else-if="row.resource.resourceType === 2">
              {{ `Asset-#${row.parentId}` }}
            </FText>

            <FText v-else-if="row.resource.resourceType === 1">
              {{ `Space-#${row.parentId}` }}
            </FText>
          </template>
        </template>
        <template #[`cell.bin`]="{ row, prop }">
          <FSelect
            v-model="row.bin.id"
            :options="binOptions"
            :placeholder="$t('inventory.item.select_bin', { ns: 'inventory' })"
            @change="updateVal(row, prop)"
            size="medium"
          >
          </FSelect>
        </template>
        <template #[`cell.updateQuantity`]="{ row, prop }">
          <FInput
            v-model="row.updateQuantity"
            :appearance="'default'"
            :min="1"
            :max="row.remainingQuantity"
            placeholder="Quantity"
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
import { formatDate } from '../../../../../utils/formatter'
import getProperty from 'dlv'
import { Lookup } from '@facilio/ui/new-forms'

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

const transactionStateEnum = {
  ISSUE: 2,
  RETURN: 3,
  ADJUSTMENT_INCREASE: 7,
  ADJUSTMENT_DECREASE: 8,
}

export default {
  props: ['visible', 'record', 'moduleName'],
  async created() {
    let { isItemModule } = this
    if (isItemModule) {
      this.init()
    }
  },

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
    Lookup,
  },

  data() {
    return {
      loading: false,
      itemId: null,
      issuedItems: [],
      selectedIssuedItems: [],
      emptyStateMessage: this.$t('inventory.item.return_item_empty', {
        ns: 'inventory',
      }),
      column: [
        {
          displayName: this.$t('inventory.item.storeroom_name', {
            ns: 'inventory',
          }),
          name: 'storeRoomName',
          id: 1,
          fixed: true,
        },
        {
          displayName: this.$t('inventory.quantity', {
            ns: 'inventory',
          }),
          name: 'remainingQuantity',
          id: 2,
        },
        {
          displayName: this.$t('inventory.item.issue_time', {
            ns: 'inventory',
          }),
          name: 'issuedTime',
          id: 3,
        },
        {
          displayName: this.$t('inventory.item.issued_to', {
            ns: 'inventory',
          }),
          name: 'parentId',
          id: 4,
        },
        {
          displayName: this.$t('inventory.bin', {
            ns: 'inventory',
          }),
          name: 'bin',
          id: 5,
        },
        {
          displayName: this.$t('inventory.item.return_quantity', {
            ns: 'inventory',
          }),
          name: 'updateQuantity',
          id: 6,
        },
      ],
      binOptions: [],
    }
  },
  watch: {
    item(val) {
      this.resetData()
      let { id } = val || {}
      if (!isEmpty(id)) {
        this.init()
      }
    },
  },
  computed: {
    isItemModule() {
      let { moduleName } = this
      return moduleName === 'item'
    },
    item() {
      let { isItemModule, record, itemId } = this
      if (isItemModule) {
        return record
      }
      return { id: itemId }
    },
    itemField() {
      let { isItemModule } = this
      if (isItemModule) {
        return {}
      }
      let { record: storeRoom } = this
      let { id: storeRoomId } = storeRoom || {}
      return {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'item',
        placeHolderText: 'Select Item',
        field: {
          lookupModule: {
            name: 'item',
            displayName: 'Item',
          },
        },
        filters: {
          storeRoom: { operatorId: 36, value: [`${storeRoomId}`] },
          oneLevelLookup: {
            itemType: [
              {
                operatorId: 35,
                criteriaValue: {
                  isRotating: { operatorId: 15, value: [`false`] },
                },
              },
            ],
          },
        },
        additionalParams: {
          orderBy: 'name',
          orderType: 'asc',
        },
      }
    },
  },
  methods: {
    isEmpty,
    async init() {
      this.loading = true
      await this.loadIssuedItem()
      await this.fetchBins()
      this.loading = false
    },
    resetData() {
      this.issuedItems = []
      this.selectedIssuedItems = []
    },
    updateVal(row, prop) {
      let idx = this.issuedItems.findIndex(
        transaction => transaction.id === row.id
      )
      this.issuedItems[idx][prop] = row[prop]
    },
    cancelForm() {
      this.$emit('closeDialog')
    },
    getUserName(user = {}) {
      let { name } = user
      return !isEmpty(name) ? name : '...'
    },
    savedForm() {
      this.cancelForm()
      this.$emit('refresh')
    },

    getDateTimeIssuedTime(val) {
      let value = val?.sysModifiedTime
      return !value || value === -1 ? '' : formatDate(value, true)
    },
    async fetchBins() {
      let filters = {
        item: {
          operatorId: 36,
          value: [`${this.item.id}`],
        },
      }
      let params = {
        filters: JSON.stringify(filters),
        force: true,
      }

      let { list, error } = await API.fetchAll('bin', params)
      if (!error) {
        let bins = list || []
        this.binOptions = bins.map(bin => {
          return { label: bin.name, value: bin.id }
        })
      }
    },
    async loadIssuedItem() {
      let { moduleName } = this
      let filters = {
        item: {
          operatorId: 36,
          value: [this.item.id + ''],
        },
      }
      let { data = {}, error } = await API.get(
        `/v2/itemTransactions/view/${moduleName}/showItemTransactionListForReturn?showItemsForReturn=true&filters=` +
          encodeURIComponent(JSON.stringify(filters))
      )
      if (error) {
        ftoast.critical(error.message || 'error occured')
      } else {
        let { itemTransactions = [] } = data
        let { item = {} } = this
        let { storeRoom = {} } = item
        this.issuedItems = itemTransactions.map(transaction => {
          let storeRoomName = getProperty(storeRoom, 'name', '---')
          return {
            ...transaction,
            updateQuantity: null,
            issuedTime: this.getDateTimeIssuedTime(transaction),
            storeRoomName,
          }
        })
      }
    },
    isValid(val) {
      if (val !== null && val !== '' && val !== undefined && val > 0) {
        return true
      }
    },
    async returnItem() {
      let itemTransaction = []

      for (let i in this.issuedItems) {
        if (
          this.isValid(this.issuedItems[i].updateQuantity) &&
          this.issuedItems[i].updateQuantity >
            this.issuedItems[i].remainingQuantity
        ) {
          ftoast.critical(
            this.$t('inventory.item.return_quantity_greater_than_issued', {
              ns: 'inventory',
            })
          )

          return
        }
        if (
          this.isValid(this.issuedItems[i].updateQuantity) &&
          !isNaN(this.issuedItems[i].updateQuantity)
        ) {
          let iTemp = {
            item: {
              id: this.issuedItems[i].item.id,
            },
            bin: this.issuedItems[i].bin,
            parentTransactionId: this.issuedItems[i].id,
            parentId: this.issuedItems[i].parentId,
            transactionType: this.issuedItems[i].transactionType,
            transactionState: transactionStateEnum.RETURN,
            quantity: parseInt(this.issuedItems[i].updateQuantity),
          }
          itemTransaction.push(iTemp)
        }
      }
      await this.returnItemCall(itemTransaction)
    },
    async returnItemCall(itemTransaction) {
      if (itemTransaction.length < 1) {
        ftoast.critical(
          this.$t('inventory.item.please_enter_return_quantity', {
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
          params: {
            return: true,
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
        } else {
          ftoast.success(
            this.$t('inventory.item_returned_successfully', {
              ns: 'inventory',
            })
          )

          this.loadIssuedItem()
          this.savedForm()
        }
      }
    },
    selectIssuedItemActions(val) {
      this.selectedIssuedItems = val
    },
    markAsFullyReturned(val) {
      val.forEach(element => {
        this.selectedIssuedItems.forEach(obj => {
          if (element.id === obj.id) {
            element.updateQuantity = element.remainingQuantity
          }
        })
      })
    },
  },
}
</script>
