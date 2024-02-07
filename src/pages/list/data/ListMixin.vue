<script>
import isEqual from 'lodash/isEqual'
import debounce from 'lodash/debounce'
import { findRouteForModule, pageTypes, getApp } from '@facilio/router'
import {
  POSITION_TYPE,
  EXPORT_TYPE,
} from '../../../components/custom-button/CustomButtonUtil.js'
import { CustomModuleData } from '../../../data/CustomModuleData'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { mapState, mapActions } from 'pinia'
import viewStore from '../../../store/views'
import dlv from 'dlv'
import { fDialog, ftoast } from '@facilio/design-system'
import keyBy from 'lodash/keyBy'
import cloneDeep from 'lodash/cloneDeep'
import FetchViewsMixin from '../../../components/views/FetchViews.vue'
import { getFieldOptions } from '../../../utils/picklist'
import { getTimeZone } from '../../../utils/formatter'
const env = import.meta.env

const appCategoryHash = {
  PORTALS: 1,
  WORK_CENTERS: 2,
  FEATURE_GROUPING: 3,
  TOOLS: 4,
}

export default {
  name: 'CommonModuleList',
  mixins: [FetchViewsMixin],
  props: ['moduleName', 'viewname'],
  data() {
    return {
      searchText: '',
      canShowListView: true,
      showType: false,
      recordCount: null,
      currentPageCount: null,
      perPage: 50,
      sortObj: {},
      selectedListItemsIds: [],
      selectedListItemsObj: [],
      showColumnSettings: false,
      isLoading: true,
      records: [],
      POSITION: POSITION_TYPE,
      isEmpty,
      searchText: '',
      permittedSystemButtonList: [],
      bulkSystemButtons: [],
      systemBtnDisplayNames: {},
      listTopSystemBtns: [],
      sortableFields: [],
      sites: null,
      filterObj: {},
      filterableFields: [],
      customizableData: [],
      showQuickSearch: false,
      isFilterBiomesUnknown: false,
      showMask: false,
      bulkSysButtonLoading: false,
      modificationLoading: false,
      resizedData: {},
      updatedAlignment: {},
      alteredAlignObj: {},
      alteredWidthObj: {},
    }
  },
  computed: {
    ...mapState(viewStore, {
      viewDetail: 'currentViewDetail',
      isViewLoading: 'isLoading',
      isViewDetailLoading: 'detailLoading',
      metaInfo: 'metaInfo',
      metaLoading: 'metaLoading',
      groupViews: state => {
        let { groupViews } = state || {}
        return !isEmpty(groupViews) ? groupViews : []
      },
    }),
    fromCount() {
      return (this.page - 1) * this.perPage + 1
    },
    toCount() {
      let { page, perPage, currentPageCount, recordCount } = this
      return (page - 1) * perPage + currentPageCount < recordCount
        ? page * perPage
        : recordCount
    },
    customizationCountText() {
      let { customizableData = [] } = this
      let count = customizableData.length
      return count || 0
    },
    modificationChanges() {
      let { customizableData } = this

      return (customizableData || []).reduce((acc, item) => {
        let { displayName, name, customization } = item || {}
        let columnName = displayName || name

        let customizationObj = JSON.parse(customization)
        let { columnWidth, columnAlignment } = customizationObj || {}
        if (!isEmpty(columnWidth))
          acc.push(
            `${columnName} ${this.$t('custommodules.list.resize_width')}`
          )
        if (!isEmpty(columnAlignment))
          acc.push(
            `${columnName} ${this.$t('custommodules.list.update_alignment')}`
          )
        return acc
      }, [])
    },
    availableExportOptions() {
      return [
        {
          name: 'export',
          iconButton: true,
          isGrouped: true,
          iconGroup: 'action',
          iconName: 'export',
          options: [
            {
              name: 'Export as Excel',
              identifier: 'export_as_excel',
              type: EXPORT_TYPE['XL'],
              actualPosition: 4,
              positionType: 4,
              appearance: 'tertiary',
              iconGroup: 'text-edit',
              iconName: 'table',
              iconPosition: 'prefix',
            },
            {
              name: 'Export as CSV ',
              identifier: 'export_as_csv',
              actualPosition: 4,
              type: EXPORT_TYPE['CSV'],
              positionType: 4,
              appearance: 'tertiary',
              iconGroup: 'text-edit',
              iconName: 'table',
              iconPosition: 'prefix',
            },
          ],
        },
      ]
    },
    recordSystemButtonsConfig() {
      return [
        {
          name: '',
          positionType: 2,
          identifier: 'edit_list',
          iconName: 'edit-line',
          iconGroup: 'edit',
          iconButton: true,
          iconPosition: 'prefix',
          action: this.editModule,
          appearance: 'tertiary',
        },
        {
          name: '',
          identifier: 'delete_list',
          iconName: 'trash-can',
          iconGroup: 'default',
          iconButton: true,
          action: async record => await this.deleteRecords([record.id]),
          iconPosition: 'prefix',
          positionType: 2,
          appearance: 'tertiary',
        },
      ]
    },
    bulkSystemButtonsConfig() {
      return [
        {
          name: 'Delete',
          identifier: 'delete_bulk',
          action: this.deleteRecords,
          positionType: 3,
          appearance: 'secondary',
        },
      ]
    },
    tableTopSystemButtonConfig() {
      return []
    },
    totalTableTopSystemButtonConfig() {
      return [...this.availableExportOptions, this.tableTopSystemButtonConfig]
    },
    topBarSystemButtonsConfig() {
      return [
        {
          name: `New ${this.moduleDisplayName}`,
          identifier: 'create',
          buttonName: `New ${this.moduleDisplayName}`,
          positionType: 4,
          appearance: 'primary',
          action: this.redirectToFormCreation,
          maxWidth: '240px',
        },
      ]
    },
    availableSystemButtonListLookup() {
      let { availableSystemButtonList } = this
      return keyBy(availableSystemButtonList, 'identifier')
    },
    canHideSubHeader() {
      return isEmpty(this.records)
    },
    canShowCalendarHeader() {
      return !this.showListView && !this.showLoading && !isEmpty(this.viewname)
    },
    moduleDisplayName() {
      let { module: moduleObj } = this.metaInfo || {}
      let { displayName } = moduleObj || {}
      return displayName || this.moduleName
    },
    parentPath() {
      let { moduleName } = this
      return `/app/ca/modules/${moduleName}/`
    },
    viewLoading() {
      return this.isViewLoading || this.isViewDetailLoading
    },
    showLoading() {
      return this.isLoading || this.viewLoading
    },
    page() {
      let { $route } = this
      let {
        query: { page },
      } = $route || {}
      return page || 1
    },
    filters() {
      let { $route } = this
      let {
        query: { search },
      } = $route || {}

      return !isEmpty(search) ? JSON.parse(search) : null
    },
    canHideFilter() {
      let { $route, records } = this
      let {
        query: { search, page },
      } = $route || {}

      return isEmpty(records) && isEmpty(search) && isEmpty(page)
    },
    selectedRecordId() {
      let id = dlv(this.$route, 'params.id')
      return id ? parseInt(id) : -1
    },
    isSummaryOpen() {
      return !isEmpty(this.selectedRecordId)
    },
    showSideBarSummary() {
      let { appCategory } = getApp() || {}
      let { FEATURE_GROUPING, WORK_CENTERS } = appCategoryHash
      return [FEATURE_GROUPING, WORK_CENTERS].includes(appCategory)
    },
    currentViewDetail() {
      let { viewDetail, filters } = this
      if (filters) {
        return 'Filtered View'
      } else {
        return viewDetail.displayName
      }
    },
    emptyStateMsg() {
      let { moduleDisplayName } = this
      return {
        title: `No ${moduleDisplayName} available`,
        description: `There are currently no ${moduleDisplayName.toLowerCase()} available in this view.`,
      }
    },
    createBtnText() {
      let { moduleDisplayName } = this
      return `New ${moduleDisplayName}`
    },
    photoFieldName() {
      return 'photoId'
    },
    modelDataClass() {
      return CustomModuleData
    },
    mainFieldName() {
      let { fields } = this.metaInfo || {}
      let mainFieldObj = (fields || []).find(field => field.mainField)
      return mainFieldObj?.name || 'name'
    },
    isColumnCustomizable() {
      let { viewDetail } = this
      let { isEditable } = viewDetail || {}
      return isEditable
    },
    // will be uncommented after calendar configuration

    canShowVisualSwitch() {
      let {
        listView = false,
        calendarView = false,
        timelineView = false,
      } = this.viewDetail || {}
      return (
        !isEmpty(this.viewname) &&
        listView &&
        (calendarView || timelineView) &&
        this.showType
      )
    },
    showListView() {
      let { viewDetail, canShowVisualSwitch, canShowListView = true } = this
      let {
        listView = false,
        calendarView = false,
        timelineView = false,
        calendarViewContext,
      } = viewDetail || {}

      return (
        (canShowVisualSwitch && canShowListView) ||
        (!listView && !timelineView && !calendarView) ||
        (listView && !timelineView && !calendarView)
        // isEmpty(calendarViewContext)
      )
    },
    hasViewList() {
      return (this.groupViews || []).some(grp => !isEmpty(grp.views))
    },
    viewDetailFields() {
      let { viewDetail } = this || {}
      let { fields } = viewDetail || {}
      return fields
    },
    routeName() {
      let { moduleName } = this
      let { name = null } =
        findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      return name
    },
    mainFieldAction() {
      return this.routeName ? this.mainFieldRedirection : null
    },
    hasEditAccess() {
      let { editable = false } = this.viewDetail || {}
      return editable
    },
  },
  watch: {
    page() {
      let { isFilterBiomesUnknown, filterObj } = this
      if (isFilterBiomesUnknown) {
        this.isFilterBiomesUnknown = false
        return
      }
      let dontLoad = !isEmpty(filterObj)
      this.refreshRecordDetails(false, false, dontLoad)
    },
    filters(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.refreshRecordDetails()
      }
    },
    moduleName: {
      async handler(newVal, oldVal) {
        if (!isEmpty(newVal) && !isEqual(newVal, oldVal)) {
          this.resetData()
          await this.init()
          this.fetchTopSystemBtns()
        }
      },
      immediate: true,
    },
    viewname: {
      async handler(newVal, oldVal) {
        if (!isEmpty(newVal) && !isEqual(newVal, oldVal)) {
          await this.resetData()
          await this.getViewDetail()
          await this.refreshRecordDetails()
        }
      },
      immediate: true,
    },
    showListView() {
      this.refreshRecordDetails()
    },
    viewLoading(newVal) {
      if (!newVal && !this.hasViewList && isEmpty(this.viewname)) {
        this.isLoading = false
      }
    },
    viewDetailFields: {
      handler(newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          if (!this.isLoading) this.loadDebouncedRecords(false, true)
        }
      },
      deep: true,
    },
    searchText(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.loadDebouncedRecords()
      }
    },
  },
  methods: {
    ...mapActions(viewStore, ['loadModuleMeta', 'loadViewDetail']),
    async init() {
      let { moduleName, viewDetailFields } = this
      let prom1 = this.loadModuleMeta(moduleName)
      let prom2 = this.modelDataClass.loadSortableFields({
        moduleName,
        viewDetailFields,
      })
      let prom3 = this.modelDataClass.loadFilterableFields({
        moduleName,
      })
      Promise.all([prom3, prom2, prom1]).then(values => {
        let [prom3Val, prom2Val] = values || []
        this.filterableFields = prom3Val || []
        this.sortableFields = prom2Val || []
      })
    },
    getTimeZone() {
      return getTimeZone()
    },
    setFilters(data) {
      let oldVal = cloneDeep(this.filterObj)
      this.filterObj = cloneDeep(data)
      let dontLoad = !isEmpty(data) || this.showQuickSearch

      if (!isEqual(data, oldVal)) {
        this.filterObj = Object.entries(this.filterObj).reduce(
          (acc, [key, valueObj]) => {
            let { value } = valueObj || {}
            let stringVal = value.map(val => val + '')
            acc[key] = { value: stringVal }
            return acc
          },
          {}
        )
        if (this.page != 1) {
          this.isFilterBiomesUnknown = true
          this.$router
            .push({ query: { ...this.$route.query, page: 1 } })
            .catch({})
        }
        this.refreshRecordDetails(false, true, dontLoad)
      }
    },
    getSystemBtnDisplayName(button) {
      let { identifier, name } = button
      return this.systemBtnDisplayNames[identifier]
    },
    async fetchTopSystemBtns() {
      let systemBtns = await this.modelDataClass.loadSystemButtonsForRecord({
        moduleName: this.moduleName,
        position: POSITION_TYPE.LIST_TOP,
      })
      let [nameMap, systemBtnIdentifierList] = systemBtns.reduce(
        (acc, btn) => {
          let { identifier, name } = btn
          acc[0][identifier] = name
          acc[1].push(identifier)
          return acc
        },
        [{}, []]
      )
      this.systemBtnDisplayNames = { ...this.systemBtnDisplayNames, ...nameMap }
      let topBarConfig = (this.topBarSystemButtonsConfig || []).map(button => {
        return { ...button, actualPosition: 5 }
      })
      let systemBtnConfig = [
        ...topBarConfig,
        ...this.totalTableTopSystemButtonConfig,
      ]
      this.listTopSystemBtns = (systemBtnConfig || []).reduce((acc, btn) => {
        let { isGrouped, identifier } = btn || {}
        let buttonPresent = false
        let finBtn = cloneDeep(btn)
        if (isGrouped) {
          let { options } = btn
          let filteredOption = (options || []).filter(option => {
            let { identifier } = option || {}
            return systemBtnIdentifierList.includes(identifier)
          })
          finBtn.options = filteredOption
          !isEmpty(filteredOption) && (buttonPresent = true)
        } else {
          buttonPresent = systemBtnIdentifierList.includes(identifier)
        }
        buttonPresent && acc.push(finBtn)
        return acc
      }, [])

      this.listTopSystemBtns = this.listTopSystemBtns.reduce(
        (acc, button) => {
          let topPos = { TABLE_TOP: 4, TOP_BAR: 5 }
          let { name, actualPosition } = button
          let isExport = name === 'export'
          if (actualPosition === topPos['TOP_BAR']) acc['topBar'].push(button)
          else if (isExport) acc['exports'] = button
          else acc['tableTop'].push(button)
          return acc
        },
        { topBar: [], exports: [], tableTop: [] }
      )
    },
    resetModification() {
      this.customizableData = []
      this.alteredWidthObj = {}
      this.alteredAlignObj = {}
      this.updatedAlignment = {}
      this.resizedData = {}
    },
    onAlignmentUpdate(data) {
      let { finalAlignment, column } = data || {}
      let { id, name, displayName } = column || {}

      this.updatedAlignment[id] = finalAlignment

      let customizeData = {
        id,
        customization: JSON.stringify({ columnAlignment: finalAlignment }),
        name,
        displayName,
      }

      let updatedArray = (this.customizableData || []).filter(
        item =>
          item.id !== customizeData.id ||
          isEmpty(JSON.parse(item.customization)?.columnAlignment)
      )

      this.customizableData = [...updatedArray, customizeData]
    },
    onChangeColumnwidth(data) {
      let { finalWidth, column } = data || {}
      let { id, name, displayName } = column || {}

      this.resizedData[id] = finalWidth

      let customizeData = {
        id,
        customization: JSON.stringify({ columnWidth: finalWidth }),
        name,
        displayName,
      }

      let updatedArray = (this.customizableData || []).filter(
        item =>
          item.id !== customizeData.id ||
          isEmpty(JSON.parse(item.customization)?.columnWidth)
      )
      this.customizableData = [...updatedArray, customizeData]
    },
    async saveColumnModification() {
      let fields = this.customizableData
      let payload = {
        moduleName: this.moduleName,
        params: { fields },
      }
      this.modificationLoading = true
      try {
        await this.modelDataClass.updateListCustomization(payload)
        this.customizableData = []
        ftoast.success(this.$t('custommodules.list.changes_saved'))
      } catch (error) {
        this.showErrorToastMessage(error)
      }
      this.modificationLoading = false
    },
    mergeRecordsWithSysBtns(buttonsLookup) {
      this.records = (this.records || []).map(record => {
        let { id } = record
        return { ...record, systemButtons: buttonsLookup[id] }
      })
    },
    async getViewDetail() {
      let { viewname, moduleName } = this
      await this.loadViewDetail({
        viewName: viewname,
        moduleName: moduleName,
      })
    },
    async loadSiteList() {
      let { records } = this
      let siteIds = (records || [])
        .filter(rd => rd.siteId)
        .map(record => record.siteId)
      let defaultIds = [...new Set(siteIds)]
      let perPage = defaultIds.length

      if (perPage === 0) return

      let { error, options } = await getFieldOptions({
        field: {
          lookupModuleName: 'site',
          skipDeserialize: true,
          name: 'siteId',
        },
        defaultIds,
        perPage,
        parentModuleName: this.moduleName,
      })

      if (!error) {
        this.sites = options || {}
      }
    },
    mainFieldRedirection({ record, value }) {
      let { routeName, viewname, moduleName } = this
      let { id = null } = record || {}

      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { viewname, id, moduleName },
        }).href

        return {
          url: route,
          text: value,
          id,
          clickAction: (field, e) => this.mainFieldClickAction(record, e),
          ...value,
        }
      }
    },
    mainFieldClickAction(record, e) {
      this.redirectToOverview(record)
      e.preventDefault()
    },
    unselectAll() {
      let { $refs } = this || {}
      let element = $refs['common-list']
      if (!isEmpty(element)) {
        element.unselectAll()
      }
      this.selectedListItemsObj = []
      this.selectedListItemsIds = []
    },
    loadDebouncedRecords: debounce(async function (
      force = false,
      dontLoad = false
    ) {
      let { showQuickSearch } = this
      if (!showQuickSearch || !dontLoad) {
        this.isLoading = true
      }
      this.showMask = dontLoad
      this.alteredWidthObj = cloneDeep(this.resizedData)
      this.alteredAlignObj = cloneDeep(this.updatedAlignment)

      await this.loadRecords(force, dontLoad)
      if (!dontLoad) this.isLoading = false
      this.showMask = false
    }, 200),
    loadSortedList(sortedField) {
      this.sortObj = { ...(sortedField || {}) }
      this.loadDebouncedRecords(false, true)
    },
    async loadRecords(force = false) {
      let {
        moduleName,
        viewname,
        filters,
        page,
        perPage,
        sortObj,
        searchText,
        filterObj: quickFilter,
      } = this
      // await API.cancel({ uniqueKey: `${moduleName}_LIST` })
      // await API.cancel({ uniqueKey: `${moduleName}_CUSTOM_BUTTON` })

      try {
        let params = {
          moduleName,
          viewName: viewname,
          filters,
          page,
          perPage,
          force,
          search: searchText,
          quickFilter,
          ...sortObj,
        }

        this.records = await this.modelDataClass.fetchAll(params)
        if (isArray(this.records) && !isEmpty(this.records)) {
          this.currentPageCount = this.records.length
          this.isLoading = false
        } else {
          this.currentPageCount = 0
        }
        await this.loadSiteList()
      } catch (error) {
        this.showErrorToastMessage(
          error,
          this.$t('custommodules.list.list_error')
        )
      }
    },
    async deleteRecords(idList) {
      let { moduleDisplayName, moduleName } = this

      let value = await fDialog.danger({
        title: `Delete ${moduleDisplayName}`,
        description: `Are you sure you want to delete this ${moduleDisplayName}(s) ?`,
        saveText: 'Delete',
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
          this.selectedListItemsIds = []
          this.selectedListItemsObj = []
          await this.refreshRecordDetails(true)
        } catch (error) {
          this.showErrorToastMessage(
            error,
            this.$t('custommodules.list.delete_error')
          )
        }
        this.isLoading = false
      }
    },
    async loadCount(force = false) {
      let { moduleName, viewname, filters, filterObj: quickFilter } = this

      // API.cancel({ uniqueKey: `${moduleName}_LIST_COUNT` })
      this.recordCount = null
      try {
        this.recordCount = null
        let params = { moduleName, viewname, filters, force, quickFilter }
        if (!isEmpty(viewname))
          this.recordCount = await this.modelDataClass.fetchRecordsCount(params)
      } catch (error) {
        this.showErrorToastMessage(
          error,
          this.$t('custommodules.list.unable_to_fetch_count')
        )
        this.recordCount = null
      }
    },
    toShowColumnSettings() {
      if (this.isColumnCustomizable) this.showColumnSettings = true
    },
    refreshRecordDetails: debounce(async function (
      force = false,
      count = true,
      dontLoad = false
    ) {
      if (this.showListView) {
        if (count) this.loadCount(true)
        this.loadDebouncedRecords(force, dontLoad)
      }
    }, 100),
    async selectItems(selectedItems) {
      if (isEmpty(selectedItems)) this.unselectAll()

      this.bulkSysButtonLoading = true

      this.selectedListItemsObj = selectedItems || {}
      this.selectedListItemsIds = selectedItems.map(value => value.id)
      let bulkSysButtons =
        await this.modelDataClass.loadSystemButtonsForRecords({
          moduleName: this.moduleName,
          position: POSITION_TYPE.LIST_BULK,
          recordIds: this.selectedListItemsIds,
        })
      let { systemButtons } = bulkSysButtons
      let [nameMap, buttons] = Object.values(systemButtons || {}).reduce(
        (acc, btn) => {
          let { identifier, name } = btn
          acc[0][identifier] = name
          acc[1].push(identifier)
          return acc
        },
        [{}, []]
      )
      this.systemBtnDisplayNames = { ...this.systemBtnDisplayNames, ...nameMap }
      this.bulkSystemButtons = buttons
      this.bulkSysButtonLoading = false
    },
    hasPermission(action) {
      return this.$access(`${this.moduleName}:${action}`)
    },
    getViewManagerRoute() {
      // --------- have to handle
      //   let appId = (getApp() || {}).id
      //   let { moduleName, $route } = this
      //   let { query } = $route
      //   let route = findRouterForModuleInApp(moduleName, pageTypes.VIEW_MANAGER)
      //   if (route)
      //     this.$router.push({
      //       ...route,
      //       params: { moduleName },
      //       query: { ...query, appId },
      //     })
    },
    openList() {
      let { viewname, $route, moduleName } = this
      let { query } = $route

      let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}
      name &&
        this.$router.push({ name, params: { viewname, moduleName }, query })
    },
    async redirectToSummary(field) {
      let { moduleName, id } = field || {}
      let viewname = await this.fetchView(moduleName)
      let routerPath = null
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      if (name) {
        routerPath = this.$router.resolve({
          name,
          params: { viewname, id, moduleName },
        })
      }
      !!routerPath && window.open(routerPath?.href, '_blank')
    },
    getRoute(moduleName) {
      return findRouteForModule(moduleName, pageTypes.OVERVIEW)
    },
    redirectToOverview(record) {
      let id = record?.id || record
      let { moduleName, viewname, $route } = this
      let { query } = $route

      delete query.tabName //to remove preserved tabName from pageBuilder

      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      let route = { name, params: { viewname, id, moduleName }, query }

      this.$router.push(route)
    },
    editModule(row) {
      let { moduleName } = this
      let { id } = row
      let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}

      name && this.$router.push({ name, params: { id, moduleName } })
    },
    redirectToFormCreation() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.CREATE) || {}

      name && this.$router.push({ name, params: { moduleName } })
    },
    openViewCreation() {
      let { moduleName } = this
      let appId = (getApp() || {}).id

      let { name } =
        findRouteForModule(moduleName, pageTypes.VIEW_CREATION) || {}

      if (name) {
        this.$router.push({ name, query: { appId } })
      }
    },
    onCustomButtonSuccess() {
      this.loadDebouncedRecords(false)
      this.selectedListItemsIds = []
      this.selectedListItemsObj = []
    },
    resetData() {
      this.showType = false
      this.isLoading = true
      this.recordCount = null
      this.currentPageCount = null
      this.canShowListView = true
      this.records = null
      this.customizableData = []
      this.selectedListItemsIds = []
      this.selectedListItemsObj = []
      this.filterObj = {}
      this.sortObj = {}
      this.resetModification()
      this.$nextTick(() => {
        this.showType = true
      })
    },
    showErrorToastMessage(error, customMsg) {
      let message = error?.message || customMsg
      ftoast.critical(message)
    },
  },
}
</script>
