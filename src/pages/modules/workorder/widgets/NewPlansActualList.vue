<template>
  <FContainer height="100%">
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner :size="25" />
    </FContainer>
    <FContainer height="100%" v-else-if="isEmpty(recordList)">
      <FDivider width="100%" />
      <FContainer height="100%" display="flex" justifyContent="center">
        <FContainer width="500px" height="100%">
          <FEmptyState
            :title="emptyStateText"
            vertical
            illustration="add-item"
            size="M"
            type="wide"
          >
            <template #buttons>
              <FButton
                appearance="secondary"
                size="small"
                @click="handleClickActionBtn(actionButtonList[0].value)"
                >Select Item</FButton
              >
            </template>
          </FEmptyState>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer v-else-if="!isEmpty(recordList)" overflow="hidden">
      <FDivider width="100%" />
      <FContainer
        padding="containerLarge"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <FText color="textMain" appearance="headingMed14">{{ heading }}</FText>
        <FContainer display="flex" gap="containerMedium" alignItems="center">
          <FContainer padding="containerLarge">
            <AdvancedSearch
              v-show="canShowFilter"
              :key="`filter-${moduleName}`"
              :moduleName="moduleName"
              :moduleDisplayName="moduleDisplayName"
              :hideQuery="true"
              :onSave="setAppliedfilter"
              :filterList="appliedFilter"
            >
              <template #icon>
                <InlineSvg
                  src="svgs/dsm-filter"
                  class="d-flex cursor-pointer"
                  iconClass="icon icon-sm"
                ></InlineSvg>
                <div
                  v-if="!isEmpty(appliedFilter)"
                  class="dot-active-pink"
                ></div>
              </template>
            </AdvancedSearch>
          </FContainer>

          <FContainer>
            <FButton
              justifyContent="space-around"
              appearance="secondary"
              size="medium"
              @click="handleClickActionBtn(actionButtonList[0].value)"
            >
              <FText color="textMain" appearance="headingMed14"
                >Select Item</FText
              >
            </FButton>
          </FContainer>
        </FContainer>
      </FContainer>

      <FContainer>
        <portal
          paddingTop="sectionLarge"
          class="portal-alignment-ws"
          ref="footer-portal"
          :to="`footer-${widget.id}-${widget.name}`"
        >
          <FContainer padding="containerMedium">
            <FPagination
              v-if="!isEmpty(recordList)"
              :total="recordCount"
              :pageCount="perPage"
              :pageSize="perPage"
              :currentPage.sync="page"
            ></FPagination>
          </FContainer>
        </portal>
        <CommonList
          ref="common-list"
          :viewDetail="viewDetail"
          :records="recordList"
          :hideBorder="true"
          :slotList="slotList"
          actionColumnWidth="220"
          @recordSelected="selectItems"
        >
          <template #[slotList[0].name]="{ record }">
            <div v-if="!record.isReserved">
              <FButton
                @click="reserveLineItem(record)"
                appearance="secondary"
                size="small"
              >
                <FText>Reserve</FText>
              </FButton>
            </div>
            <div v-if="!record.id || record.canShowEdit">
              <FButton
                appearance="tertiary"
                size="small"
                @click="openForm(record)"
              >
                <FIcon group="default" name="edit" size="16"></FIcon>
              </FButton>
            </div>
            <div v-if="!record.id || record.canShowDelete">
              <FButton
                @click="deleteRecord([record.id])"
                appearance="tertiary"
                size="small"
                ><FIcon group="action" name="delete" size="16"></FIcon
              ></FButton>
            </div>
            <div>
              <FButton
                @click="toggleSummaryDetailsDialog(record)"
                appearance="tertiary"
                size="small"
              >
                <FIcon group="action" name="info" size="16"></FIcon
              ></FButton>
            </div>
          </template>
          <template #[slotList[1].name]="{ record }">
            <FContainer v-if="record">
              <FIcon
                group="action"
                name="circle-tick"
                color="backgroundSemanticGreenDark"
              ></FIcon>
            </FContainer>
          </template>
        </CommonList>
      </FContainer>
    </FContainer>

    <FContainer v-if="!isEmpty(this.selectedListItemsIds)">
      <FBulkToolbar
        :recordCount="selectedListItemsIds.length"
        @close="unselectAll()"
      >
        <FButton @click="deleteLineItems()" appearance="secondary" size="small"
          >Delete</FButton
        >
      </FBulkToolbar></FContainer
    >

    <div v-if="canShowSummaryDetailsDialog">
      <SummaryFieldsWidget :details="currentRecord"></SummaryFieldsWidget>
    </div>
    <slot
      v-if="showPopUpFormDialog"
      name="popup-form"
      :record="currentRecord"
      :recordId="currentRecordId"
    >
      <PopupLineItemsForm
        :key="`popup-form-${moduleName}`"
        :config="formConfig"
        :moduleName="moduleName"
        :moduleDisplayName="moduleDisplayName"
        :dataId="currentRecordId"
        :dataObj="currentRecord"
        :recordConversionDetails="lineItemLookupDetails"
        :additionalParams="additionalParams"
        :selectedFormDetails="selectedFormDetails"
        :hideNotification="hideNotification"
        :hasPreviousDialog="!isEmpty(currentBtnDetails)"
        @openPrevious="openPreviousDialog"
        @onSave="refreshList"
        @onClose="closeForm"
      ></PopupLineItemsForm>
    </slot>
    <slot v-if="showWizard">
      <LineItemsWizard
        :config="currentBtnDetails"
        :selectedLookupModuleId="selectedLookupModuleId"
        :currentModuleName="currentModuleName"
        @onSave="handleSelectedLookup"
        @onCancel="closeWizard"
      ></LineItemsWizard>
    </slot>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FButton,
  FText,
  FBulkToolbar,
  FDivider,
  FEmptyState,
  FIcon,
  fDialog,
  FSpinner,
  ftoast,
  FPagination,
} from '@facilio/design-system'
import {
  isEmpty,
  isArray,
  isFunction,
  isNullOrUndefined,
  isObject,
} from '@facilio/utils/validation'
import { CustomModuleData } from '../../../../data/CustomModuleData'
import { API } from '@facilio/api'
import { getApp } from '@facilio/router'
import LineItemsWizard from '/src/pages/modules/inventory/components/lineitems/LineItemsWizard.vue'
import { getFieldOptions } from '../../../../utils/picklist'
import PopupLineItemsForm from '/src/pages/modules/inventory/components/lineitems/PopupLineItemsForm.vue'
import SummaryFieldsWidget from './PrimaryInfo.vue'
import AdvancedSearch from '../../../../components/search/AdvancedSearch.vue'
import { CommonList } from '@facilio/ui/new-app'
import $access from '../../../../utils/access/index'
import getProperty from 'dlv'
import { getUnRelatedModuleList } from '../../../../utils/relatedFieldUtil'
import module from '../../../../store/module'
import LineItemsAddition from '/src/pages/modules/inventory/components/lineitems/LineItemsAddition.vue'

let moduleStore = module()

export default {
  extends: LineItemsAddition,
  props: ['viewName', 'widgetDetails', 'widget', 'heading'],

  components: {
    FContainer,
    FButton,
    FText,
    FDivider,
    FBulkToolbar,
    CommonList,
    PopupLineItemsForm,
    SummaryFieldsWidget,
    AdvancedSearch,
    LineItemsWizard,
    FEmptyState,
    FIcon,
    FSpinner,
    FPagination,
  },
  data() {
    return {
      recordList: [],
      recordCount: null,
      page: 1,
      isLoading: false,
      appliedFilter: {},
      viewDetail: {},
      viewLoading: false,
      searchText: null,
      selectedRecordCount: null,
      siteList: {},
      showPopUpFormDialog: false,
      summaryDetailsLoading: false,
      detailsLayoutProp: null,
      showColumnSettings: false,
      metaInfo: {},
      canShowSummaryDetailsDialog: false,
      showWizard: false,
      showBulkActionBar: false,
      selectedListItemsObj: [],
      selectedListItemsIds: [],
      isObject,
    }
  },
  async created() {
    await this.init()
  },
  computed: {
    slotList() {
      return [
        {
          name: 'action',
          isActionColumn: true,
          columnAttrs: {
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        },
        {
          name: 'reserved',
        },
      ]
    },
    showBulkBar() {
      this.showBulkActionBar = true
    },
    modelDataClass() {
      let { modelDataClass } = this.config || {}
      return modelDataClass || CustomModuleData
    },
    canHideHeader() {
      return !!this.config?.canHideHeader
    },
    title() {
      let { moduleDisplayName, moduleName, widgetDetails } = this
      let { title } = widgetDetails || {}

      return (
        title ||
        this.$t('common.header.list_of_module_display_name', {
          moduleDisplayName: moduleDisplayName || moduleName,
        })
      )
    },
    perPage() {
      return this.widgetDetails?.perPage || 10
    },
    canShowPagination() {
      let { recordCount, recordList, appliedFilter } = this
      return (
        !isEmpty(recordCount) || !isEmpty(recordList) || !isEmpty(appliedFilter)
      )
    },
    emptyStateText() {
      let { widgetDetails } = this
      return (
        widgetDetails?.emptyStateText ||
        this.$t('inventory.inventory.no_records_found', {
          ns: 'inventory',
        })
      )
    },
    actionButtonList() {
      let { actionButtonList } = this.widgetDetails || {}

      return (actionButtonList || []).map(btn => {
        let { value, label } = btn || {}
        let btnObj =
          !isObject(value) && value === 'default_add' && isEmpty(label)
            ? { value, label: this.addBtnName }
            : btn

        return btnObj
      })
    },
    currentFilter() {
      let { appliedFilter, config } = this
      let { filters } = config || {}
      return { ...(filters || {}), ...(appliedFilter || {}) }
    },
    // canShowSelection() {
    //   return this.selectedRecordCount && !isEmpty(this.selectedRecordCount)
    // },
    loading() {
      return this.isLoading || this.viewLoading
    },

    addBtnName() {
      let { moduleDisplayName, moduleName, config } = this
      let { addBtnText } = config || {}
      return addBtnText || `Add ${moduleDisplayName || moduleName}`
    },
    mainFieldObj() {
      let { fields } = this.viewDetail || {}
      let { field: mainField } =
        (fields || []).find(viewFld => viewFld?.field?.mainField) || {}
      return mainField || {}
    },
    canShowSearchAndFilter() {
      let { recordList, searchText, appliedFilter } = this

      return (
        !isEmpty(recordList) || !isEmpty(searchText) || !isEmpty(appliedFilter)
      )
    },
    canShowFilter() {
      return !this.config?.canHideFilter
    },
    canShowCustomButton() {
      return !!this.config?.canShowCustomButton
    },
    hideListSelect() {
      return this.disableActionableUIElements || !!this.config?.hideListSelect
    },
    checkSelection() {
      return this.config?.checkSelection
    },
    skipEditPermission() {
      let { skipModulePermission } = this.config || {}
      let { editPermission } = skipModulePermission || {}
      return !!editPermission
    },
    skipDeletePermission() {
      let { skipModulePermission } = this.config || {}
      let { deletePermission } = skipModulePermission || {}
      return !!deletePermission
    },
    canShowSummaryWidget() {
      let { summaryWidgetName } = this.widgetDetails || {}
      let { canHideSummaryWidget } = this.config || {}
      return !canHideSummaryWidget && summaryWidgetName
    },
    mainfieldAction() {
      let { mainfieldAction } = this.config || {}
      return isFunction(mainfieldAction) ? mainfieldAction : () => {}
    },
    isFilterEnabled() {
      let { page, searchText, appliedFilter } = this
      return page !== 1 || !isEmpty(searchText) || !isEmpty(appliedFilter)
    },
    tableListScopedSlots() {
      let { $scopedSlots } = this
      let otherSlots = [
        'bulk-actions',
        'header-additional-actions',
        'header-additional-action-right',
        'empty-state',
        'empty-state-btn',
        'additional-action-btns',
        'footer',
        'footer-btns',
        'popup-form',
        'lineitem-wizard',
        'default',
      ]

      return Object.entries($scopedSlots).reduce(
        (tableListScopedSlots, [slotName]) => {
          if (!otherSlots.includes(slotName)) {
            tableListScopedSlots[slotName] = $scopedSlots[slotName]
          }
          return tableListScopedSlots
        },
        {}
      )
    },
  },
  watch: {
    moduleName: {
      handler: 'init',
      immediate: true,
    },
    page() {
      this.loadRecords(true)
    },
    searchText() {
      this.refreshRecordList(true)
    },
  },
  methods: {
    showButton(record) {
      this.$emit('showButton', record)
    },
    isReserved(record) {
      this.$emit('showReserved', record)
    },
    reserveLineItem(record) {
      this.$emit('reserveItem', record)
    },
    init() {
      this.loadViewDetails()
      this.refreshRecordList()
      this.loadMetaInfo()
      this.loadSummaryDetailLayout()
    },

    async refreshRecordList(force = false) {
      await this.loadRecords(force)
      await this.loadRecordCount(force)
    },
    async loadRecords(force = false) {
      let { moduleName, viewName, page, currentFilter, searchText, perPage } =
        this
      let { getRecordList } = this.config || {}
      let { canShowEdit, canShowDelete } = this
      let recordList = []
      let parentModuleName = 'workorder'

      this.isLoading = true
      try {
        if (isFunction(getRecordList)) {
          recordList = await getRecordList({
            page,
            filters: currentFilter,
            search: searchText,
            force,
          })
        } else {
          let params = {
            moduleName,
            viewName,
            filters: JSON.stringify(currentFilter),
            page,
            perPage,
            force,
            search: searchText,
          }
          let { error, list, meta } = await getUnRelatedModuleList(
            parentModuleName,
            moduleName,
            params
          )
          if (error) {
            let { message } = error
            ftoast.critical(message || 'Error occurred')
            console.log('message', message)
          } else {
            recordList = list
          }
        }
        if (isArray(recordList)) {
          this.recordList = (recordList || []).map(record => {
            return {
              ...record,
              canShowEdit: canShowEdit(record),
              canShowDelete: canShowDelete(record),
            }
          })
          await this.loadSiteList()
        }
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Unable to fetch moduleList')
      }
      this.isLoading = false
    },
    async loadRecordCount(force = false) {
      let { moduleName, viewName, currentFilter, searchText } = this
      let { getRecordCount } = this.config || {}
      let recordCount = null

      try {
        if (isFunction(getRecordCount)) {
          recordCount = await getRecordCount({
            filters: currentFilter,
            search: searchText,
            force,
          })
        } else {
          let params = {
            moduleName,
            viewName,
            filters: currentFilter,
            force,
            search: searchText,
          }

          recordCount = await this.modelDataClass.fetchRecordsCount(params)
        }

        this.recordCount = recordCount
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Unable to fetch count')
      }
    },
    async loadViewDetails() {
      let { moduleName, viewName } = this
      let { getViewDetails } = this.config || {}
      let response = {}

      this.viewLoading = true
      try {
        if (isFunction(getViewDetails)) {
          response = await getViewDetails()
        } else {
          response = await API.get(`v2/views/${moduleName}/${viewName}`, {
            moduleName,
          })
        }
        let { error, data } = response || {}

        if (error) {
          throw error
        } else {
          this.viewDetail = data?.viewDetail || {}
        }
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Cannot fetch view details')
      }
      this.viewLoading = false
    },
    async loadSiteList() {
      let { recordList } = this
      let siteIds = (recordList || []).map(record => record.siteId)
      let defaultIds = [...new Set(siteIds)]
      let perPage = defaultIds.length

      if (perPage === 0) return

      let { error, options } = await getFieldOptions({
        field: { lookupModuleName: 'site', skipDeserialize: true },
        defaultIds,
        perPage,
      })

      if (!error) {
        this.siteList = options || {}
      }
    },
    async loadMetaInfo() {
      if (this.config?.canHideColumnConfig) return

      let { moduleName } = this
      let { data, error } = await API.get('/module/meta', { moduleName })

      if (!error) {
        this.metaInfo = data?.meta || {}
      }
    },
    toggleSummaryDetailsDialog(record = null) {
      this.currentRecord = record
      this.canShowSummaryDetailsDialog = !this.canShowSummaryDetailsDialog
    },
    async loadSummaryDetailLayout() {
      let { moduleName, widgetDetails } = this
      let { summaryWidgetName } = widgetDetails || {}

      if (isEmpty(summaryWidgetName)) return
      this.summaryDetailsLoading = true

      let appId = (getApp() || {}).id
      let params = { moduleName, appId, widgetName: summaryWidgetName }
      let { data, error } = await API.get(
        'v2/customPage/summaryFieldWidget',
        params
      )

      if (!error) {
        this.detailsLayoutProp = data
      }
      this.summaryDetailsLoading = false
    },

    async refreshView() {
      this.showColumnSettings = false
      await this.loadViewDetails()
    },
    setAppliedfilter(filters) {
      this.appliedFilter = filters || {}
      this.refreshRecordList(true)
    },
    handleSelection(selectedList) {
      this.$emit('handleSelection', selectedList)
      this.selectedRecordCount = (selectedList || []).length
    },

    closeForm() {
      this.currentRecordId = null
      this.currentRecord = null
      this.showPopUpFormDialog = false
      this.selectedLookupModuleId = null
      this.currentBtnDetails = {}
      this.clearSelection()
      this.$emit('selectedLookupModuleRecord', null)
    },

    canShowEdit(record) {
      let { moduleName, config, skipEditPermission } = this
      let { isRecordEditable, canHideEdit } = config || {}
      let hasPermission = !skipEditPermission
        ? this.$access.hasPermission(`${moduleName}:EDIT,UPDATE`)
        : true
      let canEdit = this.canEdit() || false
      let customcanShowEditCallBack = isFunction(isRecordEditable)
        ? isRecordEditable(record)
        : true
      let canShowRecordEdit =
        hasPermission && canEdit && customcanShowEditCallBack && !canHideEdit

      return canShowRecordEdit
    },
    canEdit() {
      return !this.isRecordLocked() && !this.isRequestedState()
    },

    isRecordLocked() {
      let { moduleState, moduleName } = this

      if (this.isStateFlowEnabled) {
        let hasState = getProperty(moduleState, 'id')
        return hasState && moduleStore.isStatusLocked(hasState, moduleName)
      }
      return false
    },

    isRequestedState() {
      let { approvalStatus } = this

      if (!isEmpty(approvalStatus)) {
        let statusObj = moduleStore.getApprovalStatus(approvalStatus.id)
        return getProperty(statusObj, 'requestedState', false)
      }
      return false
    },
    canShowDelete(record) {
      let { moduleName, config, skipDeletePermission } = this
      let { isRecordDeletable, canHideDelete } = config || {}
      let hasPermission = !skipDeletePermission
        ? this.$access.hasPermission(`${moduleName}:DELETE`)
        : true
      let customcanShowDeleteCallBack = isFunction(isRecordDeletable)
        ? isRecordDeletable(record)
        : true
      let canShowRecordDelete =
        hasPermission && customcanShowDeleteCallBack && !canHideDelete

      return canShowRecordDelete
    },
    async deleteRecord(idList) {
      let { moduleDisplayName, moduleName, config } = this
      let { deletePopupDetails } = config || {}
      let { title, message, rbDanger, rbLabel } = deletePopupDetails || {}
      let customTitle = !isNullOrUndefined(title)
        ? title
        : `${this.$t('custommodules.list.delete')} ${moduleDisplayName}`
      let customMessage = !isNullOrUndefined(message)
        ? message
        : `${this.$t(
            'custommodules.list.delete_confirmation'
          )} ${moduleDisplayName}?`
      let customBtnLabel = !isNullOrUndefined(rbLabel)
        ? rbLabel
        : this.$t('custommodules.list.delete')
      // let value = await this.$dialog.confirm({
      //   title: customTitle,
      //   message: customMessage,
      //   rbDanger: !isNullOrUndefined(rbDanger) ? rbDanger : true,
      //   rbLabel: customBtnLabel,
      // })
      let value = await fDialog.warning({
        title: customTitle,
        description: customMessage,
        saveText: 'Delete',
        cancelText: 'Cancel',
      })

      if (value) {
        this.isLoading = true

        try {
          await this.modelDataClass.delete(moduleName, idList)
          ftoast.success(
            `${moduleDisplayName} ${this.$t(
              'custommodules.list.delete_success'
            )}`
          )
          this.clearSelection()
          this.$emit('onDelete')
          await this.refreshRecordList(true)
        } catch (errorMsg) {
          ftoast.critical(errorMsg)
          this.isLoading = false
        }
      }
    },
    refreshList(response) {
      this.$emit('onCreateOrUpdate', response)

      let { error } = response || {}
      !error && this.refreshRecordList()
    },
    selectItems(selectedItem) {
      this.selectedListItemsObj = selectedItem
      this.selectedListItemsIds = selectedItem.map(value => value.id)
    },
    unselectAll() {
      let { $refs } = this || {}
      let element = $refs['common-list']
      if (!isEmpty(element)) {
        element.unselectAll()
        this.selectedListItemsObj = []
        this.selectedListItemsIds = []
      }
    },
    clearSelection() {
      this.selectedRecordCount = null
      this.$emit('handleSelection', [])
      let lineItemListRef = this.$refs?.lineItemTable
      let tableRef = lineItemListRef?.$refs[`common-list-${this.moduleName}`]

      tableRef?.clearSelection()
    },
    async deleteLineItems() {
      let { selectedListItemsObj } = this

      this.recordIds = []
      selectedListItemsObj.forEach(lineItem => {
        let id = getProperty(lineItem, 'id')
        this.recordIds.push(id)
      })
      let { error } = await API.deleteRecord(this.moduleName, this.recordIds)
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('common._common.error_occured'))
        return {}
      } else {
        let { moduleDisplayName } = this
        tftoast.success(
          `${moduleDisplayName} ${this.$t('custommodules.list.delete_success')}`
        )
        this.refreshRecordList(true)
        this.clearSelection()
      }
    },
  },
}
</script>
