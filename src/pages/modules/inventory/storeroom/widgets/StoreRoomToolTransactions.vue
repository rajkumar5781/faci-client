<script lang="jsx">
import InventoryRelatedListWidget from '../../components/InventoryRelatedListWidget.vue'
import { FDropdown } from '@facilio/design-system'
import LineItemsAddition from '/src/pages/modules/inventory/components/lineitems/LineItemsAddition.vue'
import { isEmpty } from '@facilio/utils/validation'
import { CustomModuleData } from '../../../../../data/CustomModuleData'
import InventoryMixin from '/src/pages/modules/inventory/utils/InventoryMixin.js'
import { formatDate } from '/src/utils/formatter.js'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import IssueTools from '/src/pages/modules/inventory/tool/components/IssueTools.vue'
import ReturnTools from '/src/pages/modules/inventory/tool/components/ReturnTools.vue'

export default {
  mixins: [InventoryMixin],
  extends: InventoryRelatedListWidget,
  data() {
    return {
      availableToolsAdd: false,
      reservedToolsAdd: false,
      inventoryReservationId: null,
      actionButtonValue: null,
      recordsCount: null,
      isRotatingType: null,
      issueToolsVisibility: false,
      returnToolsVisibility: false,
      columns: [
        {
          displayName: 'Transaction time',
          name: 'transactionTime',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'Tool',
          name: 'toolName',
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
      return 'toolTransactions'
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
            value: [id + ''],
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
          if (name === 'workorder') {
            return lookupModuleName === 'inventoryReservation'
              ? { ...field, required: true, isDisabled: true }
              : { ...field, required: true }
          }

          if (
            ['item', 'tool'].includes(name) ||
            (name === 'quantity' && isRotatingType)
          ) {
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
          label: 'Issue Available Tool',
          value: 'storeRoomIssueTools',
          lineItemBtn: true,
          action: this.lineItemsBtnClick,
        },
        {
          label: 'Issue Reserved Tool',
          value: 'storeRoomIssueReservedTools',
          action: this.lineItemsBtnClick,
        },
        {
          label: 'Issue To Person',
          value: 'storeRoomIssueToolsToPerson',
          action: this.showIssueTools,
        },
        {
          label: 'Return Tools',
          value: 'StoreRoomReturnToolsToPerson',
          action: this.showReturnTools,
        },
      ]
    },
    actionButtonList() {
      if (this.checkStoreRoomPermission()) {
        return [
          {
            label: 'Issue Available Tools',
            identifier: 'storeRoomIssueTools',
            value: {
              lookupModuleName: 'tool',
              lookupModuleDisplayName: 'Tool',
              getRecordDetails: async payload => {
                let { id, moduleName } = payload || {}
                let { workorder } = this
                let workOrderId = getProperty(workorder, 'id')
                let queryParam = {
                  toolId: id,
                  workOrderId,
                }
                let { data, error } = await API.get(
                  '/v3/workorderTools/getWorkorderTool',
                  queryParam
                )

                if (!error) {
                  let { workorderTools } = data || {}
                  let { toolType } = workorderTools || {}
                  let { isRotating } = toolType || {}
                  this.isRotatingType = isRotating
                  return new CustomModuleData({
                    ...workorderTools,
                    moduleName,
                  })
                }
              },
              getRecordList: async listParams => {
                let { filters = {} } = listParams || {}
                let toolModuleName = 'tool'
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
                let { list, error } = await API.fetchAll(toolModuleName, params)
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
            label: 'Issue Reserved Tool',
            identifier: 'storeRoomIssueReservedTools',
            value: {
              lookupModuleName: 'inventoryReservation',
              viewname: 'all-tools',
              lookupModuleDisplayName: 'Reserved Tool',
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
                  toolType: {
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
                  '/v3/workorderTools/getWorkorderToolFromReservation',
                  queryParam
                )
                let { workorderTools } = data || {}
                let { toolType } = workorderTools || {}
                let { isRotating } = toolType || {}
                this.isRotatingType = isRotating
                if (!error) {
                  return new CustomModuleData({
                    ...workorderTools,
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
      this.$refs['tool-transaction-line-items'].handleClickActionBtn(value)
    },
    showIssueTools() {
      this.issueToolsVisibility = true
    },
    hideIssueTools() {
      this.issueToolsVisibility = false
    },
    showReturnTools() {
      this.returnToolsVisibility = true
    },
    hideReturnTools() {
      this.returnToolsVisibility = false
    },

    btnValue(value) {
      this.actionButtonValue = value
    },
    issuedRecordData(response) {
      let { error, workorderTool } = response || {}
      if (!error) {
        this.inventoryReservationId = null
        this.loadRecords()
      }
    },

    modifyRecordsAfterFetch(record) {
      let { getToolName, getDateTime } = this
      return {
        ...record,
        transactionTime: getDateTime(record),
        toolName: getToolName(record),
      }
    },
    issueAvailableTools() {
      this.availableToolsAdd = true
    },
    issueReservedTools() {
      this.reservedToolsAdd = true
    },

    getToolName(val) {
      let tool = getProperty(val, 'tool.primaryValue', '---')
      return tool
    },
    getDateTime(val) {
      let value = val.sysCreatedTime
      return !value || value === -1 ? '' : formatDate(value)
    },
    headerButtons() {
      let { dropDownButtons, dropDownProps, additionalParams, formConfig } =
        this
      return (
        <LineItemsAddition
          ref="tool-transaction-line-items"
          buttonList={dropDownButtons}
          config={formConfig}
          additionalParams={additionalParams}
          moduleName="workorderTools"
          currentModuleName="storeRoom"
          moduleDisplayName="Tool"
          v-on:clickedActionBtn={this.btnValue}
          saveForm={this.issuedRecordData}
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
      let { issueToolsVisibility, returnToolsVisibility, details } = this
      if (issueToolsVisibility) {
        return (
          <IssueTools
            moduleName="storeRoom"
            record={details}
            visible={issueToolsVisibility}
            v-on:refresh={() => this.loadRecords(true)}
            v-on:closeDialog={this.hideIssueTools}
          ></IssueTools>
        )
      }
      if (returnToolsVisibility) {
        return (
          <ReturnTools
            visible={returnToolsVisibility}
            moduleName="storeRoom"
            record={details}
            visible={returnToolsVisibility}
            v-on:refresh={() => this.loadRecord(true)}
            v-on:closeDialog={this.hideReturnTools}
          ></ReturnTools>
        )
      }
    },
  },
}
</script>
