<template>
  <FContainer height="100%">
    <LineItemList
      v-bind="$attrs"
      ref="lineItemTable"
      currentModuleName="workorder"
      :config="listConfiguration"
      :moduleName="moduleName"
      :widgetDetails="widgetDetails"
      :widget="widget"
      :additionalParams="additionalParam"
      :moduleDisplayName="moduleDisplayName"
      viewName="all"
      @onDelete="reloadCost()"
      @onCreateOrUpdate="reloadCost()"
      @handleSelection="selectedRecords"
      @reserveItem="reserveLineItem"
      @showButton="showReserveButton"
      @showReserved="isReserved"
      @autoResizeWidget="autoResize"
      heading="List of Items"
    />
    <FModal
      title="Reservation Summary"
      :visible.sync="showReservationSummary"
      size="L"
      @cancel="closeReservationSummary()"
      :hideFooter="false"
    >
      <FTable :rounded="false" :columns="column" :data="reservingLineItems">
        <template #[`cell.item`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            inventoryName(row)
          }}</FText>
        </template>

        <template #[`cell.description`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            description(row)
          }}</FText>
        </template>

        <template #[`cell.storeroom`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            storeroomName(row)
          }}</FText>
        </template>

        <template #[`cell.availablequantity`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            availableQuantity(row)
          }}</FText>
        </template>

        <template #[`cell.quantity`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            row.quantity ? row.quantity : '--'
          }}</FText>
        </template>

        <template #[`cell.isreservable`]="{ row }">
          <FIcon
            v-if="errorMsg(row)"
            group="action"
            name="info"
            size="14"
          ></FIcon>
          <FIcon
            v-else-if="warningMsg(row)"
            group="action"
            name="info"
            size="14"
          ></FIcon>

          <FText color="textMain" appearance="bodyReg14">{{
            getErrorText(row)
          }}</FText>
        </template>
      </FTable>

      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          justifyContent="flex-end"
        >
          <FButton
            @click="reservePlannedItems()"
            :disabled="canShowReserveButton"
            appearance="primary"
          >
            Reserve
          </FButton>
        </FContainer>
      </template>
    </FModal>
  </FContainer>
</template>
<script>
import {
  FButton,
  FTable,
  FText,
  FIcon,
  FModal,
  FContainer,
  ftoast,
} from '@facilio/design-system'
import LineItemList from './NewPlansActualList.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import WorkOrderPlans from './WorkOrderPlans.vue'
import { CustomModuleData } from '../../../../data/CustomModuleData'
import getProperty from 'dlv'
import { findTab, tabTypes } from '@facilio/router'
import webtabs from '../../../../store/webtabs'
const webtabsStore = webtabs()
export default {
  name: 'Plans',
  extends: WorkOrderPlans,
  props: [
    'workOrderId',
    'widget',
    'disableActionableUIElements',
    'resizeWidget',
    'calculateDimensions',
    'layoutParams',
  ],
  data() {
    return {
      recordIds: [],
      recordsCount: null,
      reservingLineItems: [],
      showReservationSummary: false,
      selectedLineItems: [],
      reservableLineItems: [],
      slotList: [
        {
          name: 'additional-action-reservation',
          isActionColumn: true,
          columnAttrs: {
            width: 130,
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        },
      ],
      column: [
        { displayName: 'Item', name: 'item', id: 1, fixed: true },
        {
          displayName: 'Description',
          name: 'description',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Storeroom',
          name: 'storeroom',
          id: 3,
          width: 100,
          clickable: true,
        },
        {
          displayName: 'Available Quantity',
          name: 'availablequantity',
          id: 4,
          type: 'status',
          width: 150,
        },
        {
          displayName: 'Quantity',
          name: 'quantity',
          id: 5,
          type: 'status',
          width: 100,
        },
        {
          displayName: '',
          name: 'isreservable',
          id: 6,
          type: 'status',
          width: 150,
        },
      ],
    }
  },
  components: {
    LineItemList,
    FButton,
    FTable,
    FText,
    FIcon,
    FModal,
    FContainer,
  },
  computed: {
    moduleName() {
      return 'workOrderPlannedItems'
    },
    moduleDisplayName() {
      return this.$t('workorder.Items', 'Items', { ns: 'workorder' })
    },
    getReservationQuantityMsg() {
      let { reservableLineItems, reservingLineItems } = this
      let msg = `${reservableLineItems.length} of ${reservingLineItems.length} items reservable`
      return msg
    },
    listConfiguration() {
      let { formConfig, tableSlotList, filters, disableActionableUIElements } =
        this
      return {
        filters,
        skipModulePermission: {
          editPermission: true,
          deletePermission: true,
        },
        ...(formConfig || {}),
        tableSlotList: tableSlotList || [],
        isRecordEditable: record => {
          return !getProperty(record, 'isReserved')
        },
        isRecordDeletable: record => {
          return !getProperty(record, 'isReserved')
        },
        checkSelection: record => {
          return !getProperty(record, 'isReserved')
        },
        disableActionableUIElements: disableActionableUIElements,
      }
    },
    formConfig() {
      return {
        formType: 'POP_UP_FORM',
        modifyFieldPropsHook: field => {
          let { name } = field || {}
          if (name === 'itemType') {
            return { ...field, isDisabled: true }
          }
        },
      }
    },
    widgetDetails() {
      let { widget, emptyStateBtnList } = this
      let { widgetParams } = widget || {}
      let { summaryWidgetName } = widgetParams || {}
      let emptyStateText = this.$t('inventory.workorder.no_items_associated', {
        ns: 'inventory',
      })

      return {
        canHideTitle: true,
        perPage: 5,
        summaryWidgetName,
        emptyStateText,
        actionButtonList: emptyStateBtnList,
      }
    },
    emptyStateBtnList() {
      return [
        {
          label: this.$t('common.inventory.select_item'),
          value: {
            lookupModuleName: 'itemTypes',
            lookupModuleDisplayName: this.$t(
              'common.inventory._item_types',
              'Item Types',
              { ns: 'workorder' }
            ),
            getRecordDetails: async payload => {
              let { id, moduleName } = payload || {}
              let workOrderPlannedItem = {
                itemType: {
                  id: id,
                },
              }
              return new CustomModuleData({
                ...workOrderPlannedItem,
                moduleName,
              })
            },
          },
        },
      ]
    },
    canShowReserveButton() {
      let { reservableLineItems } = this
      return isEmpty(reservableLineItems)
    },
    additionalParam() {
      return {
        workOrder: {
          id: this.workOrderId,
        },
      }
    },
  },
  methods: {
    getNonRotatingItemTypes(itemTypes) {
      let nonRotatingItemTypes = (itemTypes || {}).filter(itemType => {
        let { rotating } = itemType || {}
        return !rotating
      })
      return nonRotatingItemTypes
    },
    inventoryName(val) {
      return getProperty(val, 'itemType.name', '---')
    },
    storeroomName(val) {
      return getProperty(val, 'storeRoom.name', '---')
    },
    availableQuantity(val) {
      return getProperty(val, 'availableQuantity', '---')
    },
    description(val) {
      return getProperty(val, 'description', '---')
    },
    showReserveButton(record) {
      return (
        !getProperty(record, 'isReserved') && this.checkStoreRoomPermission()
      )
    },
    isReserved(record) {
      return getProperty(record, 'isReserved')
    },
    getErrorText(reservingLineItem) {
      return getProperty(reservingLineItem, 'errorType', '')
    },
    closeReservationSummary() {
      this.showReservationSummary = false
    },
    async reservePlannedItems() {
      let { reservableLineItems } = this
      let plannedItems = (reservableLineItems || []).map(lineItem => ({
        id: getProperty(lineItem, 'id'),
      }))
      let url = `v3/modules/bulkPatch/workOrderPlannedItems`
      let params = {
        data: {
          workOrderPlannedItems: plannedItems,
        },
        moduleName: 'workOrderPlannedItems',
        params: {
          reserve: true,
        },
      }
      if (!isEmpty(plannedItems)) {
        let { error } = await API.post(url, params)
        if (error) {
          ftoast.critical(
            error.message || this.$t('common._common.error_occured')
          )
        } else {
          ftoast.success(this.$t('common._common.reserve_success'))
          this.showReservationSummary = false
          this.$refs['lineItemTable']?.refreshRecordList(true)
          this.$refs['lineItemTable']?.clearSelection()
        }
      }
    },

    async reserveLineItem(record) {
      this.recordIds = []
      this.recordIds.push(record.id)
      let queryParam = {
        recordIds: this.recordIds,
      }
      let { data, error } = await API.get(
        '/v3/workOrderPlannedItems/reserve',
        queryParam
      )
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('common._common.error_occured'))
        return {}
      } else {
        this.reservingLineItems = getProperty(data, 'workOrderPlannedItems')
        this.setReservableLineItems(this.reservingLineItems)
        this.showReservationSummary = true
      }
    },
    errorMsg(lineItem) {
      return getProperty(lineItem, 'errorType') === 'Non-reservable'
    },
    warningMsg(lineItem) {
      return getProperty(lineItem, 'errorType') === 'Reservable'
    },
    async reserveMultipleLineItems() {
      let { selectedLineItems } = this
      this.recordIds = []
      for (let lineItem of selectedLineItems) {
        let id = getProperty(lineItem, 'id')
        this.recordIds.push(id)
      }
      let queryParam = {
        recordIds: this.recordIds,
      }
      let { data, error } = await API.get(
        '/v3/workOrderPlannedItems/reserve',
        queryParam
      )
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('common._common.error_occured'))
        return {}
      } else {
        this.reservingLineItems = getProperty(data, 'workOrderPlannedItems')
        this.setReservableLineItems(this.reservingLineItems)
        this.showReservationSummary = true
      }
    },
    setReservableLineItems(reservingLineItems) {
      this.reservableLineItems = (reservingLineItems || []).filter(lineItem => {
        let errorType = getProperty(lineItem, 'errorType')
        return errorType !== 'Non-reservable'
      })
    },
    checkStoreRoomPermission() {
      let targetModuleName = 'storeRoom'
      let canCreate = false
      let canUpdate = false
      let { tabId } = findTab(tabTypes.MODULE, {
        moduleName: targetModuleName,
      })
      if (!isEmpty(tabId)) {
        let webTabObj = webtabsStore.getTabByTabId(tabId)
        canCreate = webtabsStore.tabHasPermission('CREATE', webTabObj)
        canUpdate = webtabsStore.tabHasPermission('UPDATE', webTabObj)
      }
      return canCreate && canUpdate
    },
    autoResize(record) {
      if (!isEmpty(record)) {
        let params = { h: 6 }
        setTimeout(() => {
          this.resizeWidget(params)
        })
      } else {
        let params = { h: 5 }
        setTimeout(() => {
          this.resizeWidget(params)
        })
      }
    },
  },
}
</script>
