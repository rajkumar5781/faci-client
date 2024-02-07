<template>
  <FContainer>
    <FContainer
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <portal :to="`action-${widget.id}-${widget.name}`">
        <AdvancedSearch
          v-show="true"
          :key="`filter-itemTransactions`"
          moduleName="itemTransactions"
          moduleDisplayName="Item Transaction"
          :hideQuery="true"
          :onSave="setAppliedfilter"
        >
          <template #icon>
            <FIcon group="default" name="filter-outline" size="16"></FIcon>
          </template>
        </AdvancedSearch>
      </portal>
    </FContainer>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(itemTransactionsList)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :illustration="'add-item'"
        :title="$t('inventory.service.no_data_available', { ns: 'inventory' })"
        :vertical="true"
        :size="'M'"
      >
      </FEmptyState>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="space-between"
    >
      <FContainer overflow="scroll">
        <FTable
          :columns="column"
          :data="itemTransactionsList"
          :rounded="false"
          :hideBorder="false"
        />
      </FContainer>
    </FContainer>

    <portal :to="`footer-${widget.id}-${widget.name}`" v-if="!isEmpty(items)">
      <FContainer padding="containerLarge">
        <FPagination
          :pageSize="pageSize"
          :total="totalCount"
          :currentPage="currentPage"
          :disabled="disabled"
          @nextClick="currentChange"
          @prevClick="currentChange"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FIcon,
  FTable,
  FModal,
  FButton,
  FSelect,
  ftoast,
  FSpinner,
  FForm,
  FFormItem,
  FEmptyState,
  FPagination,
  FInput,
} from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'
import getProperty from 'dlv'
import { formatDate } from '../../../../../utils/formatter'
import AdvancedSearch from '../../../../../components/search/AdvancedSearch.vue'

export default {
  props: ['details', 'widget', 'fitMyContent'],
  components: {
    FText,
    FContainer,
    FIcon,
    FTable,
    FModal,
    FButton,
    FSelect,
    FSpinner,
    FForm,
    FFormItem,
    LookupWizard,
    FEmptyState,
    FPagination,
    FInput,
    ftoast,
    AdvancedSearch,
  },
  data() {
    return {
      isLoading: false,
      column: [
        {
          displayName: 'Transaction time',
          name: 'transactionTime',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'Storeroom name',
          name: 'storeroomName',
          id: 2,
          fixed: false,
        },
        {
          displayName: 'Type',
          name: 'transactionStateLabel',
          id: 3,
          fixed: false,
        },
        { displayName: 'Quantity', name: 'quantity', id: 4, fixed: false },
        { displayName: 'Remarks', name: 'remarks', id: 5, fixed: false },
      ],
      items: [],
      pageSize: 5,
      totalCount: 0,
      currentPage: 1,
      disabled: false,
      allItemStoreRoom: [],
      selectedItemid: null,
      appliedFilter: {},
    }
  },
  created() {
    this.loadItemTransactions()
  },
  computed: {
    moduleName() {
      let { details } = this
      let { moduleName } = details
      return moduleName
    },
  },
  methods: {
    isEmpty,
    async loadItemTransactions() {
      this.isLoading = true
      let { details, moduleName } = this
      let { id } = details || {}
      let params = {}
      if (moduleName === 'toolTypes' || moduleName === 'tool') {
        if (moduleName === 'toolTypes') {
          params = {
            filters: JSON.stringify({
              toolType: {
                operatorId: 5,
                value: [id + ''],
              },
              ...this.appliedFilter,
            }),
          }
        }
        if (moduleName === 'tool') {
          params = {
            filters: JSON.stringify({
              tool: {
                operatorId: 5,
                value: [id + ''],
              },
              ...this.appliedFilter,
            }),
          }
        }
        let { list, error } = await API.fetchAll('toolTransactions', params)
        if (error) {
          ftoast.critical(error || 'Error Occured')
        } else {
          let transactionList = list || []

          transactionList.forEach(list => {
            list.transactionTime = this.getDateTime(list)
            list.storeroomName = this.getStoreRoomName(list)
          })

          this.itemTransactionsList = transactionList

          this.isLoading = false
        }
      } else if (moduleName === 'itemTypes' || moduleName === 'item') {
        if (moduleName === 'itemTypes') {
          params = {
            filters: JSON.stringify({
              itemType: {
                operatorId: 5,
                value: [id + ''],
              },
              ...this.appliedFilter,
            }),
          }
        }
        if (moduleName === 'item') {
          params = {
            filters: JSON.stringify({
              item: {
                operatorId: 5,
                value: [id + ''],
              },
              ...this.appliedFilter,
            }),
          }
        }

        let { list, error } = await API.fetchAll('itemTransactions', params)
        if (error) {
          ftoast.critical(error || 'Error Occured')
        } else {
          let transactionList = list || []

          transactionList.forEach(list => {
            list.transactionTime = this.getDateTime(list)
            list.storeroomName = this.getStoreRoomName(list)
          })

          this.itemTransactionsList = transactionList

          this.isLoading = false
        }
      }
      this.appliedFilter = {}
    },
    currentChange(page) {
      this.currentPage = page
      this.loadItemTransactions()
      this.$nextTick(() => {
        this.fitMyContent()
      })
    },
    getDateTime(val) {
      let value = val?.sysCreatedTime
      return !value || value === -1 ? '' : formatDate(value)
    },
    getStoreRoomName(val) {
      let storeRoomName = getProperty(val, 'storeRoom.name', '---')
      return storeRoomName
    },
    setAppliedfilter({ filters }) {
      this.appliedFilter = filters || {}
      this.loadItemTransactions()
    },
  },
}
</script>
