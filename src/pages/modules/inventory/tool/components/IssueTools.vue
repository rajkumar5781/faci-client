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
      <FContainer v-if="isToolModule" padding="containerLarge">
        <ItemBadge :record="tool"> </ItemBadge>
      </FContainer>
      <FForm position="top" :model="issueTool">
        <FContainer v-if="!isToolModule" padding="containerLarge">
          <FFormItem
            :label="$t('inventory.tool.tool', { ns: 'inventory' })"
            prop="toolId"
            :hideLabel="false"
            :required="true"
          >
            <Lookup
              :field.sync="toolField"
              v-model="issueTool.toolId"
              :hideLookupIcon="true"
              :isClearable="false"
              :placeholder="
                $t('inventory.storeroom.select_tool', { ns: 'inventory' })
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
              v-model="issueTool.binId"
              :options="binOptions"
              :placeholder="
                $t('inventory.item.select_bin', { ns: 'inventory' })
              "
              @change="setBin(issueTool.binId)"
              :loading="toolLoading"
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
              v-model="issueTool.quantity"
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
              v-model="issueTool.userid"
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
import { Lookup } from '@facilio/ui/new-forms'
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
const userLookup = {
  isDataLoading: false,
  options: [],
  config: {},
  lookupModuleName: 'user',
  field: {
    lookupModule: {
      name: 'user',
      displayName: 'User',
    },
  },
  multiple: false,
  selectedTools: [],
}
export default {
  props: ['moduleName', 'visible', 'record'],
  components: {
    FContainer,
    FModal,
    ItemBadge,
    FIcon,
    FForm,
    FFormItem,
    FText,

    LiveFormLoader,
    FSelect,
    Lookup,
    FInput,
  },

  data() {
    return {
      loading: false,
      toolLoading: false,
      issueTool: {
        quantity: null,
        userid: null,
        binId: null,
        toolId: null,
      },
      users: [],
      bin: {},
      bins: [],
      binOptions: [],
      userLookup,
    }
  },
  async created() {
    let { isToolModule } = this
    this.loading = true
    if (isToolModule) {
      await this.loadToolRelData()
    }
    this.loading = false
  },
  watch: {
    tool(val) {
      this.resetData()
      let { id } = val || {}
      if (!isEmpty(id)) {
        this.loadToolRelData()
      }
    },
  },
  computed: {
    isToolModule() {
      let { moduleName } = this
      return moduleName === 'tool'
    },
    tool() {
      let { isToolModule, record, issueTool } = this
      if (isToolModule) {
        return record || {}
      } else {
        let { toolId: id } = issueTool || {}
        return { id }
      }
    },
    restrictBinSelection() {
      let { tool } = this
      let { id } = tool || {}
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
    toolField() {
      let { isToolModule } = this
      if (isToolModule) {
        return {}
      }
      let { record: storeRoom } = this
      let { id: storeRoomId } = storeRoom
      return {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'tool',
        field: {
          lookupModule: {
            name: 'tool',
            displayName: 'Tool',
          },
        },
        filters: {
          storeRoom: { operatorId: 36, value: [`${storeRoomId}`] },
          oneLevelLookup: {
            toolType: [
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
      this.issueTool.binId = null
      this.bin = {}
      this.bins = []
    },
    async loadToolRelData() {
      this.toolLoading = true
      await this.fetchBins()
      await this.fetchUsers()
      this.setDefaultBin()
      this.toolLoading = false
    },
    setBin(binId) {
      let { bins = [] } = this
      let bin = bins.find(bin => bin.id === binId)
      this.bin = bin
    },
    setDefaultBin() {
      let { tool } = this
      let { defaultBin } = tool || {}
      if (!isEmpty(defaultBin)) {
        let { id } = defaultBin
        this.issueTool.binId = id
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
        tool: {
          operatorId: 36,
          value: [`${this.tool.id}`],
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
    async toolTransaction(toolTransactionData) {
      let param = { issue: true }
      let { error } = await API.createRecord('toolTransactions', {
        data: toolTransactionData,
        params: param,
      })
      if (error) {
        ftoast.critical(error.message || 'Error Occured')
        this.saving = false
      } else {
        ftoast.success(
          this.$t('inventory.tool.tool_issued_successfully', {
            ns: 'inventory',
          })
        )
        this.savedForm()
      }
    },
    async saveIssueForm() {
      let { issueTool, tool, bin } = this || {}
      let { userid, quantity } = issueTool || {}
      if (!userid) {
        ftoast.critical(
          this.$t('inventory.item.choose_user_error', {
            ns: 'inventory',
          })
        )
      } else if (userid) {
        if (
          quantity === null ||
          quantity === undefined ||
          quantity === '0' ||
          quantity < 0
        ) {
          ftoast.critical(
            this.$t('inventory.storeroom.enter_quantity', {
              ns: 'inventory',
            })
          )
        } else {
          let toolTransactionData = {
            tool: {
              id: tool?.id,
            },
            parentId: userid,
            bin: bin,
            issuedTo: { ouid: userid },
            transactionType: transactionTypeEnum.MANUAL,
            transactionState: transactionStateEnum.ISSUE,
            quantity: quantity,
            resource: { resourceType: resourceTypeEnum.USER },
          }
          await this.toolTransaction(toolTransactionData)
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
