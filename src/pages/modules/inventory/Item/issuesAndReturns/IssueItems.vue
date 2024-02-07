<template>
  <FModal
    :title="$t('inventory.item.issue_to_user', { ns: 'inventory' })"
    :visible="visible"
    :cancelText="this.$t('cancel')"
    :saveText="this.$t('save')"
    size="S"
    :hideFooter="false"
    @ok="saveIssueForm"
    @cancel="cancelForm"
  >
    <LiveFormLoader v-if="loading" :dialog="true" />
    <FContainer v-else class="issue-items">
      <FContainer v-if="isItemModule" padding="containerLarge">
        <ItemBadge :record="item"> </ItemBadge>
      </FContainer>
      <FForm position="top" :model="issueItem">
        <FContainer v-if="!isItemModule" padding="containerLarge">
          <FFormItem
            :label="$t('inventory.item.item', { ns: 'inventory' })"
            prop="itemId"
            :hideLabel="false"
            :required="true"
          >
            <Lookup
              :field.sync="itemField"
              v-model="issueItem.itemId"
              :hideLookupIcon="true"
              :isClearable="false"
              :placeholder="
                $t('inventory.storeroom.select_item', { ns: 'inventory' })
              "
            />
          </FFormItem>
        </FContainer>
        <FContainer padding="containerLarge">
          <FFormItem
            :label="$t('inventory.bin', { ns: 'inventory' })"
            prop="binId"
            :hideLabel="false"
            :required="true"
          >
            <FSelect
              v-model="issueItem.binId"
              :options="binOptions"
              :placeholder="
                $t('inventory.item.select_bin', { ns: 'inventory' })
              "
              @change="setBin(issueItem.binId)"
              :loading="itemLoading"
              :disabled="restrictBinSelection"
              size="medium"
            >
            </FSelect>
          </FFormItem>
        </FContainer>
        <FContainer padding="containerLarge" paddingBottom="containerNone">
          <FFormItem
            :label="$t('inventory.item.issue_quantity', { ns: 'inventory' })"
            prop="quantity"
            :hideLabel="false"
            :required="true"
          >
            <FInput
              :placeholder="
                $t('inventory.item.issue_quantity', { ns: 'inventory' })
              "
              :label="$t('inventory.item.issue_quantity', { ns: 'inventory' })"
              :min="1"
              :max="bin.quantity"
              type="number"
              v-model="issueItem.quantity"
              :required="true"
              :disabled="restrictQuantity"
            />
          </FFormItem>
        </FContainer>
        <FContainer display="flex" justifyContent="left" alignItems="center"
          ><FIcon
            group="action"
            name="info"
            color="iconNeutralLight"
            size="14"
          ></FIcon>
          <FText appearance="captionReg12" color="textCaption">
            {{ currentBalance }}
          </FText>
        </FContainer>
        <FContainer padding="containerLarge">
          <FFormItem
            :label="$t('inventory.item.issue_to', { ns: 'inventory' })"
            :hideLabel="false"
            prop="userid"
            :required="true"
          >
            <FSelect
              v-model="issueItem.userid"
              :options="users"
              :placeholder="
                $t('inventory.item.select_user', { ns: 'inventory' })
              "
              size="medium"
            >
            </FSelect>
          </FFormItem>
        </FContainer> </FForm
    ></FContainer>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import ItemBadge from '/src/pages/modules/inventory/components/ItemBadge.vue'
import { LiveFormLoader } from '@facilio/forms'
import { Lookup } from '@facilio/ui/new-forms'

import {
  FContainer,
  FModal,
  FForm,
  FFormItem,
  FSelect,
  ftoast,
  FText,
  FIcon,
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
const resourceTypeEnum = {
  USER: 4,
}

export default {
  props: ['visible', 'record', 'moduleName'],
  components: {
    FContainer,
    FModal,
    ItemBadge,
    FIcon,
    FForm,
    FFormItem,
    FText,
    Lookup,
    LiveFormLoader,
    FSelect,
    FInput,
  },

  data() {
    return {
      loading: false,
      itemLoading: false,
      issueItem: {
        quantity: null,
        userid: null,
        binId: null,
        itemId: null,
      },
      users: [],
      bin: {},
      bins: [],
      binOptions: [],
    }
  },
  async created() {
    let { isItemModule } = this
    this.loading = true
    if (isItemModule) {
      await this.loadItemRelData()
    }
    this.loading = false
  },
  watch: {
    item(val) {
      this.resetData()
      let { id } = val || {}
      if (!isEmpty(id)) {
        this.loadItemRelData()
      }
    },
  },
  computed: {
    isItemModule() {
      let { moduleName } = this
      return moduleName === 'item'
    },
    item() {
      let { isItemModule, record, issueItem } = this
      if (isItemModule) {
        return record || {}
      } else {
        let { itemId: id } = issueItem || {}
        return { id }
      }
    },
    restrictBinSelection() {
      let { item } = this
      let { id } = item || {}
      return isEmpty(id)
    },
    restrictQuantity() {
      let { bin } = this
      return isEmpty(bin)
    },
    currentBalance() {
      let { bin } = this
      let { quantity = 0 } = bin || {}
      return `${quantity} Current Balance`
    },
    itemField() {
      let { isItemModule } = this
      if (isItemModule) {
        return {}
      }
      let { record: storeRoom } = this
      let { id: storeRoomId } = storeRoom
      return {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'item',
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
    resetData() {
      this.issueItem.binId = null
      this.bin = {}
      this.bins = []
    },
    async loadItemRelData() {
      this.itemLoading = true
      await this.fetchBins()
      await this.fetchUsers()
      this.setDefaultBin()
      this.itemLoading = false
    },
    setBin(binId) {
      let { bins = [] } = this
      let bin = bins.find(bin => bin.id === binId)
      this.bin = bin
    },
    setDefaultBin() {
      let { item } = this
      let { defaultBin } = item || {}
      if (!isEmpty(defaultBin)) {
        let { id } = defaultBin
        this.issueItem.binId = id
        this.setBin(id)
      }
    },
    cancelForm() {
      this.$emit('closeDialog')
    },
    savedForm() {
      this.cancelForm()
      this.$emit('refresh')
    },
    async fetchUsers() {
      let { data, error } = await API.get('/users')
      if (!error) {
        let users = data.users || []
        this.users = users.map(user => {
          return { label: user.name, value: user.id }
        })
      }
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
        this.bins = bins
        this.binOptions = bins.map(bin => {
          return { label: bin.name, value: bin.id }
        })
      }
    },
    async itemTransaction(itemTransactionData) {
      let param = { issue: true }
      let { error } = await API.createRecord('itemTransactions', {
        data: itemTransactionData,
        params: param,
      })
      if (error) {
        ftoast.critical(error.message || 'Error Occured')
        this.saving = false
      } else {
        ftoast.success(
          this.$t('inventory.item.item_issued_successfully', {
            ns: 'inventory',
          })
        )
        this.savedForm()
      }
    },
    async saveIssueForm() {
      let { issueItem, item, bin } = this || {}
      let { userid, quantity } = issueItem || {}
      if (!userid) {
        ftoast.critical(
          this.$t('inventory.item.choose_user_error', {
            ns: 'inventory',
          })
        )
      } else if (userid) {
        if ([null, undefined, '0'].includes(quantity) || quantity < 0) {
          ftoast.critical(
            this.$t('inventory.storeroom.enter_quantity', {
              ns: 'inventory',
            })
          )
        } else {
          let itemTransactionData = {
            item: {
              id: item?.id,
            },
            parentId: userid,
            bin: bin,
            issuedTo: { ouid: userid },
            transactionType: transactionTypeEnum.MANUAL,
            transactionState: transactionStateEnum.ISSUE,
            quantity: quantity,
            resource: { resourceType: resourceTypeEnum.USER },
          }
          await this.itemTransaction(itemTransactionData)
        }
      }
    },
  },
}
</script>
<style>
.issue-items {
  padding: 8px 84px;
}
</style>
