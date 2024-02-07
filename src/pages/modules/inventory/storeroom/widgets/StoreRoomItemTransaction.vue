<script lang="jsx">
import InventoryRelatedListWidget from '../../components/InventoryRelatedListWidget.vue'
import { FDropdown } from '@facilio/design-system'
import LineItemsAddition from '/src/pages/modules/inventory/components/lineitems/LineItemsAddition.vue'
import IssueItems from '/src/pages/modules/inventory/Item/issuesAndReturns/IssueItems.vue'
import ReturnItems from '/src/pages/modules/inventory/Item/issuesAndReturns/ReturnItems.vue'

import { isEmpty } from '@facilio/utils/validation'
import { CustomModuleData } from '../../../../../data/CustomModuleData'
import InventoryMixin from '/src/pages/modules/inventory/utils/InventoryMixin.js'
import { formatDate } from '/src/utils/formatter.js'
import { API } from '@facilio/api'
import getProperty from 'dlv'

export default {
  mixins: [InventoryMixin],
  extends: InventoryRelatedListWidget,
  data() {
    return {
      availableItemsAdd: false,
      reservedItemsAdd: false,
      inventoryReservationId: null,
      issueItemsVisibility: false,
      returnItemsVisibility: false,
      actionButtonValue: null,
      recordsCount: null,
      isRotatingType: null,
      columns: [
        {
          displayName: 'Transaction time',
          name: 'transactionTime',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'Item',
          name: 'itemName',
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
    }
  },

  computed: {
    moduleName() {
      return 'itemTransactions'
    },
    emptyStateMsg() {
      return this.$t('inventory.storeroom.no_transactions_yet', {
        ns: 'inventory',
      })
    },
    canShowAdvancedSearch() {
      return false
    },
    canShowHeaderSlot() {
      return true
    },
    defaultFilter() {
      let { details } = this
      let { id } = details || {}
      if (!isEmpty(id)) {
        return {
          storeRoom: {
            operatorId: 9,
            value: [`${id}`],
          },
        }
      }
      return {}
    },
    additionalParams() {
      let { inventoryReservationId, actionButtonValue } = this || {}
      let { lookupModuleName } = actionButtonValue || {}
      if (
        !isEmpty(inventoryReservationId) &&
        lookupModuleName === 'inventoryReservation'
      ) {
        return {
          inventoryReservation: { id: inventoryReservationId },
        }
      }
      return {}
    },
    formConfig() {
      let { actionButtonValue, isRotatingType } = this || {}
      let { lookupModuleName } = actionButtonValue || {}
      console.log('lookupModuleName')
      console.log(lookupModuleName)
      return {
        formType: 'POP_UP_FORM',
        formTitle: {
          defaultForm: 'Issue To Workorder',
        },
        modifyFieldPropsHook: field => {
          let { name } = field || {}
          if (name === 'storeRoom') {
            return {
              ...field,
              isDisabled: true,
              required: true,
              value: getProperty(this.details, 'id'),
            }
          }
          // if (name === 'issueTo') {
          //   return {
          //     ...field,
          //     value: this.$getProperty(this.details, 'id'),
          //   }
          // }
          if (name === 'workorder') {
            console.log(lookupModuleName)
            return lookupModuleName === 'inventoryReservation'
              ? { ...field, required: true, isDisabled: true }
              : { ...field, required: true, isDisabled: false }
          }
          if (name === 'item') {
            return { ...field, isDisabled: true }
          }
          if (name === 'tool') {
            return { ...field, isDisabled: true }
          }
          if (name === 'quantity' && isRotatingType) {
            return { ...field, isDisabled: true }
          }
          if (name === 'asset') {
            return !isRotatingType
              ? { ...field, hideField: true }
              : { ...field, required: true }
          }
        },
      }
    },
    dropDownProps() {
      return {
        appearance: 'secondary',
        size: 'small',
      }
    },
    dropDownButtons() {
      return [
        {
          label: 'Issue Available Item',
          value: 'storeRoomIssueItems',
          lineItemBtn: true,
          action: this.lineItemsBtnClick,
        },
        {
          label: 'Issue Reserved Item',
          value: 'storeRoomIssueReservedItems',
          action: this.lineItemsBtnClick,
        },
        {
          label: 'Issue To Person',
          value: 'storeRoomIssueItemsToPerson',
          action: this.showIssueItems,
        },
        {
          label: 'Return Items',
          value: 'StoreRoomReturnItemsToPerson',
          action: this.showReturnItems,
        },
      ]
    },

    actionButtonList() {
      if (this.checkStoreRoomPermission()) {
        return [
          {
            label: 'Issue Available Item',
            identifier: 'storeRoomIssueItems',
            value: {
              lookupModuleName: 'item',
              lookupModuleDisplayName: 'Item',
              getRecordDetails: async payload => {
                let { id, moduleName } = payload || {}
                let { workorder } = this
                let workOrderId = getProperty(workorder, 'id')
                let queryParam = {
                  itemId: id,
                  workOrderId,
                }
                let { data, error } = await API.get(
                  '/v3/workOrderItem/storeRoom/getWorkorderItem',
                  queryParam
                )
                if (error) {
                  ftoast.error(error.message || this.$t('error_occured'))
                } else {
                  let { workorderItem } = data || {}
                  let { itemType } = workorderItem || {}
                  let { isRotating } = itemType || {}
                  this.isRotatingType = isRotating
                  return new CustomModuleData({
                    ...workorderItem,
                    moduleName,
                  })
                }
              },
              getRecordList: async listParams => {
                let { filters = {} } = listParams || {}
                let itemModuleName = 'item'
                let { siteId } = this
                let additionalfilters = {
                  ...filters,
                  storeRoom: {
                    operatorId: 36,
                    value: [`${this.details.id}`],
                  },
                }
                let params = {
                  siteId,
                  includeServingSite: true,
                  filters: JSON.stringify(additionalfilters),
                }
                let { list, error } = await API.fetchAll(itemModuleName, params)
                if (!error) {
                  let { length } = list
                  this.recordsCount = length
                  return list
                }
              },
              getRecordCount: () => {
                return this.recordsCount
              },
            },
          },
          {
            label: 'Issue Reserved Item',
            identifier: 'storeRoomIssueReservedItems',
            value: {
              lookupModuleName: 'inventoryReservation',
              lookupModuleDisplayName: 'Reserved Items',
              getRecordList: async listParams => {
                let { filters } = listParams || {}
                let additionalFilters = {
                  ...(filters || {}),
                  storeRoom: {
                    operatorId: 36,
                    value: [`${this.details.id}`],
                  },
                  reservationStatus: {
                    operatorId: 10,
                    value: [`${3}`],
                  },
                  itemType: {
                    operatorId: 2,
                  },
                }
                let params = {
                  filters: JSON.stringify(additionalFilters),
                }
                let { list, error } = await API.fetchAll(
                  'inventoryReservation',
                  params
                )
                if (!error) {
                  let { length } = list
                  this.recordsCount = length
                  return list
                }
              },
              getRecordCount: () => {
                return this.recordsCount
              },
              getRecordDetails: async payload => {
                let { id, moduleName } = payload || {}
                this.inventoryReservationId = !isEmpty(id) ? id : null
                let queryParam = {
                  reservationId: id,
                }
                let { data, error } = await API.get(
                  '/v3/workOrderItem/storeRoom/getWorkorderItemFromReservation',
                  queryParam
                )
                let { workorderItem } = data || {}
                let { itemType } = workorderItem || {}
                let { isRotating } = itemType || {}
                this.isRotatingType = isRotating
                if (!error) {
                  return new CustomModuleData({
                    ...workorderItem,
                    moduleName,
                  })
                }
              },
            },
          },
        ]
      }
      return []
    },
  },
  methods: {
    lineItemsBtnClick(btn) {
      let { value: identifier } = btn || {}
      let { actionButtonList = [] } = this
      let actionBtn = actionButtonList.find(
        btn => btn.identifier === identifier
      )
      let { value } = actionBtn || {}
      this.$refs['item-transaction-line-items'].handleClickActionBtn(value)
    },
    showIssueItems() {
      this.issueItemsVisibility = true
    },
    hideIssueItems() {
      this.issueItemsVisibility = false
    },
    showReturnItems() {
      this.returnItemsVisibility = true
    },
    hideReturnItems() {
      this.returnItemsVisibility = false
    },

    btnValue(value) {
      this.actionButtonValue = value
    },
    issuedRecordData(response) {
      let { error, workorderItem } = response || {}
      if (!error) {
        this.inventoryReservationId = null
        this.loadRecords()
      }
    },

    modifyRecordsAfterFetch(record) {
      let { getItemName, getDateTime } = this
      return {
        ...record,
        transactionTime: getDateTime(record),
        itemName: getItemName(record),
      }
    },
    issueAvailableItems() {
      this.availableItemsAdd = true
    },
    issueReservedItems() {
      this.reservedItemsAdd = true
    },

    getItemName(val) {
      let item = getProperty(val, 'item.primaryValue', '---')
      return item
    },
    getDateTime(val) {
      let value = val.sysCreatedTime
      return !value || value === -1 ? '' : formatDate(value)
    },
    headerButtons() {
      let {
        dropDownButtons,
        actionButtonList,
        dropDownProps,
        formConfig,
        additionalParams,
      } = this
      return (
        <LineItemsAddition
          ref="item-transaction-line-items"
          buttonList={actionButtonList}
          config={formConfig}
          additionalParams={additionalParams}
          currentModuleName="storeRoom"
          moduleName="workorderItem"
          moduleDisplayName="Item"
          v-on:clickedActionBtn={this.btnValue}
          v-on:saveForm={this.issuedRecordData}
          {...{
            scopedSlots: {
              ['buttons']: () => {
                return (
                  <FDropdown
                    buttonProps={dropDownProps}
                    options={dropDownButtons}
                    v-on:dropdown={btn => btn.action(btn)}
                    name="Issuance"
                  ></FDropdown>
                )
              },
            },
          }}
        ></LineItemsAddition>
      )
    },
    defaultSpace() {
      let { issueItemsVisibility, returnItemsVisibility, details } = this
      if (issueItemsVisibility) {
        return (
          <IssueItems
            moduleName="storeRoom"
            record={details}
            visible={issueItemsVisibility}
            v-on:refresh={() => this.loadRecords(true)}
            v-on:closeDialog={this.hideIssueItems}
          ></IssueItems>
        )
      }
      if (returnItemsVisibility) {
        return (
          <ReturnItems
            visible={returnItemsVisibility}
            moduleName="storeRoom"
            record={details}
            visible={returnItemsVisibility}
            v-on:refresh={() => this.loadRecord(true)}
            v-on:closeDialog={this.hideReturnItems}
          ></ReturnItems>
        )
      }
    },
  },
}
</script>
