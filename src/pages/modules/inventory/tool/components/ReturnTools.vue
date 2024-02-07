<template>
  <FModal
    :title="$t('inventory.tool.return_tools', { ns: 'inventory' })"
    :visible="visible"
    :cancelText="this.$t('cancel')"
    :saveText="this.$t('save')"
    size="L"
    :hideFooter="false"
    @ok="returnTool"
    @cancel="cancelForm"
    ><FContainer minHeight="300px" maxHeight="500px">
      <FContainer display="flex">
        <FContainer
          v-if="!isToolModule"
          padding="containerXLarge"
          paddingRight="containerNone"
        >
          <Lookup
            :field.sync="toolField"
            v-model="toolId"
            size="small"
            :hideLookupIcon="true"
            :isClearable="false"
            :placeholder="
              $t('inventory.storeroom.select_tool', { ns: 'inventory' })
            "
          />
        </FContainer>
        <FContainer v-if="!isEmpty(issuedTools)" padding="containerXLarge">
          <FButton
            appearance="secondary"
            size="small"
            iconGroup="default"
            iconName="checked"
            iconPosition="prefix"
            @click="markAsFullyReturned(issuedTools)"
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
        v-else-if="isEmpty(issuedTools)"
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
        :data.sync="issuedTools"
        :rounded="false"
        selectType="bulk"
        :hideBorder="false"
        :selectedList="selectedIssuedTools"
        @recordSelected="selectIssuedToolActions"
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
import { Lookup } from '@facilio/ui/new-forms'

const transactionStateEnum = {
  ISSUE: 2,
  RETURN: 3,
  ADJUSTMENT_INCREASE: 7,
  ADJUSTMENT_DECREASE: 8,
}

export default {
  props: ['visible', 'record', 'moduleName'],
  async created() {
    let { isToolModule } = this
    if (isToolModule) {
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
      toolId: null,
      issuedTools: [],
      selectedIssuedTools: [],
      emptyStateMessage: this.$t('inventory.tool.return_tool_empty', {
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
    tool(val) {
      this.resetData()
      let { id } = val || {}
      if (!isEmpty(id)) {
        this.init()
      }
    },
  },
  computed: {
    isToolModule() {
      let { moduleName } = this
      return moduleName === 'tool'
    },
    tool() {
      let { isToolModule, record, toolId } = this
      if (isToolModule) {
        return record
      }
      return { id: toolId }
    },
    toolField() {
      let { isToolModule } = this
      if (isToolModule) {
        return {}
      }
      let { record: storeRoom } = this
      let { id: storeRoomId } = storeRoom || {}
      return {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'tool',
        placeHolderText: 'Select Tool',
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
    isEmpty,
    async init() {
      this.loading = true
      await this.loadIssuedTool()
      await this.fetchBins()
      this.loading = false
    },
    resetData() {
      this.issuedTools = []
      this.selectedIssuedTools = []
    },
    updateVal(row, prop) {
      let idx = this.issuedTools.findIndex(
        transaction => transaction.id === row.id
      )
      this.issuedTools[idx][prop] = row[prop]
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
        this.binOptions = bins.map(bin => {
          return { label: bin.name, value: bin.id }
        })
      }
    },
    async loadIssuedTool() {
      let { moduleName } = this
      let filters = {
        tool: {
          operatorId: 36,
          value: [this.tool.id + ''],
        },
      }
      let { data = {}, error } = await API.get(
        `/v2/toolTransactions/view/${moduleName}/showToolTransactionListForReturn?showToolsForReturn=true&filters=` +
          encodeURIComponent(JSON.stringify(filters))
      )
      if (error) {
        ftoast.critical(error.message || 'error occured')
      } else {
        let { toolTransactions = [] } = data
        let { tool = {} } = this
        let { storeRoom = {} } = tool
        this.issuedTools = toolTransactions.map(transaction => {
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
    async returnTool() {
      let toolTransaction = []

      for (let i in this.issuedTools) {
        if (
          this.isValid(this.issuedTools[i].updateQuantity) &&
          this.issuedTools[i].updateQuantity >
            this.issuedTools[i].remainingQuantity
        ) {
          ftoast.critical(
            this.$t('inventory.item.return_quantity_greater_than_issued', {
              ns: 'inventory',
            })
          )

          return
        }
        if (
          this.isValid(this.issuedTools[i].updateQuantity) &&
          !isNaN(this.issuedTools[i].updateQuantity)
        ) {
          let iTemp = {
            tool: {
              id: this.issuedTools[i].tool.id,
            },
            bin: this.issuedTools[i].bin,
            parentTransactionId: this.issuedTools[i].id,
            parentId: this.issuedTools[i].parentId,
            transactionType: this.issuedTools[i].transactionType,
            transactionState: transactionStateEnum.RETURN,
            quantity: parseInt(this.issuedTools[i].updateQuantity),
          }
          toolTransaction.push(iTemp)
        }
      }

      await this.returnToolCall(toolTransaction)
    },
    async returnToolCall(toolTransaction) {
      if (toolTransaction.length < 1) {
        ftoast.critical(
          this.$t('inventory.item.please_enter_return_quantity', {
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
            this.$t('inventory.tool_returned_successfully', {
              ns: 'inventory',
            })
          )

          this.loadIssuedTool()
          this.savedForm()
        }
      }
    },
    selectIssuedToolActions(val) {
      this.selectedIssuedTools = val
    },
    markAsFullyReturned(val) {
      val.forEach(element => {
        this.selectedIssuedTools.forEach(obj => {
          if (element.id === obj.id) {
            element.updateQuantity = element.remainingQuantity
          }
        })
      })
    },
  },
}
</script>
