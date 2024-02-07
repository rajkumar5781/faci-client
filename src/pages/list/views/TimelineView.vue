<template>
  <FContainer
    display="flex"
    gap="containerLarge"
    flexGrow="1"
    overflow="hidden"
  >
    <FContainer
      width="100%"
      border="solid 1px"
      borderRadius="high"
      borderColor="borderNeutralBaseSubtle"
      marginTop="containerLarge"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <FContainer display="flex" justifyContent="space-between">
        <CalendarNavigation
          :recordCustomization="recordCustomization"
          :metaInfo="metaInfo"
          :isTimeline="true"
          @onClickUnscheduledList="onClickUnschedule"
        />
      </FContainer>

      <FContainer
        v-if="isLoading"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexGrow="1"
      >
        <FSpinner :size="30" />
      </FContainer>

      <FContainer
        v-show="!isLoading"
        height="calc(100% - 50px)"
        display="flex"
        gap="4px"
      >
        <FTimelineView
          :timezone="timeZone"
          :mainFieldName="mainFieldName"
          :viewDetails="viewDetails"
          :timeStamp="timeStamp"
          :groupList="groupList"
          :schedulerData="schedulerData"
          :preservedTimeLimit="preservedTimeLimit"
          :grpByPerPage="grpByPerPage"
          :currentView="currentViewHash"
          :page="grpPage"
          :sideBarRecordList="unscheduledList"
          :metaInfo="metaInfo"
          :updatePermission="$access.hasPermission(`${moduleName}:UPDATE`)"
          @updateGrpEvents="updateEventList"
          @viewChanged="onViewChange"
          @sideBarDetails="sideBarDetails"
          @openSummary="openSummary"
        >
          <template #group-by-actions>
            <FContainer display="flex" alignItems="center">
              <FInput
                v-show="showSearch"
                v-model="searchText"
                ref="mainFieldSearchInput"
                placeholder="search"
                appearance="default"
                size="small"
                clearable
                :clearValue="onClearSearch"
                @change="onSearchGroupName"
                @blur="hideGroupSearch"
              ></FInput>
              <FIcon
                v-if="!showSearch"
                group="action"
                name="search"
                size="14"
                @click="onShowSearchBox"
              ></FIcon>
              <GroupBySort
                v-if="!showSearch"
                :sortObj="sortObj"
                :sortByField="viewDetails.groupByField"
                @onSortChange="loadGroupingData"
              >
              </GroupBySort>
              <FPagination
                :currentPage.sync="grpPage"
                :perPage="perPage"
                :disableNext="hideNextpage"
                :withoutCount="true"
                type="simple"
              ></FPagination>
            </FContainer>
          </template>
        </FTimelineView>
      </FContainer>
    </FContainer>
    <SideBarList
      v-if="canShowInPopOver"
      :sidebarHeading="sideBarHeading"
      :viewMoreList="unscheduledList"
      :viewMoreLoading="viewMoreLoading"
      :viewDetails="viewDetails"
      :additionalFields="additionalFields"
      :currentGrpId="currentGrpId"
      :page.sync="page"
      :perPage="20"
      :count="10"
      :showClose="true"
      :moduleName="moduleName"
      :viewname="viewname"
      @onEventClick="redirectToSummary"
      @onEventUpdate="updateEvent"
      @onClose="canShowInPopOver = false"
    >
      <template #action>
        <FText
          v-if="!isUnscheduledList"
          appearance="bodyReg14"
          padding="containerLarge"
          >{{ groupName }}</FText
        >
        <FSelect
          v-if="isUnscheduledList"
          v-model="currentGrpId"
          :options="sideBarOptionList"
          width="80%"
          size="small"
          @change="onUnscheduledList()"
        >
        </FSelect>
      </template>
    </SideBarList>
    <PopupSummary
      v-if="openEventSummary"
      :data="summaryData"
      :viewDetails="viewDetails"
      :viewname="viewname"
      :moduleName="moduleName"
      :additionalFields="additionalFields"
      @onRedirect="redirectToSummary"
      @save="updateEvent"
      @cancel="openEventSummary = false"
    >
    </PopupSummary>
  </FContainer>
</template>
<script>
import {
  FTimelineView,
  FContainer,
  FSelect,
  FText,
  FIcon,
  FInput,
  FSpinner,
  FModal,
  FPagination,
  FDatePicker,
  ftoast,
} from '@facilio/design-system'
import CalendarNavigation from './CalendarNavigation.vue'
import { API } from '@facilio/api'
import SideBarList from './SidebarList.vue'
import { isEmpty } from '@facilio/utils/validation'
import GroupBySort from './GroupBySort.vue'
import { CustomModuleData } from '../../../data/CustomModuleData'
import PopupSummary from './PopupSummary.vue'
import { getTimeZone } from '../../../utils/formatter'
import { findRouteForModule, pageTypes } from '@facilio/router'

const dateOperator = {
  1: 19,
  2: 12,
  3: 12,
  4: 11,
}

export default {
  props: [
    'moduleName',
    'viewname',
    'filters',
    'metaInfo',
    'timelineViewDetail',
  ],
  components: {
    FTimelineView,
    FContainer,
    FSelect,
    FIcon,
    FText,
    FInput,
    FSpinner,
    FModal,
    FPagination,
    FDatePicker,
    CalendarNavigation,
    SideBarList,
    GroupBySort,
    PopupSummary,
  },
  data() {
    return {
      isEmpty,
      scheduleLoading: false,
      loading: false,
      unscheduledList: [],
      viewMoreLoading: false,
      canShowInPopOver: false,
      isUnscheduledList: false,
      showSearch: false,
      searchText: '',
      sideBarHeading: '',
      groupName: '',
      grpId: '',
      page: 1,
      grpPage: 1,
      perPage: 10,
      sortObj: null,
      openEventSummary: false,
      currentGrpId: -1,
      summaryData: {},
      schedulerData: {},
      groupList: [],
      grpByPerPage: 10,
      currentView: {
        options: ['Day', 'Week', 'Month', 'Year'],
        control: { type: 'radio' },
        defaultValue: 1,
      },
    }
  },
  created() {
    if (!isEmpty(this.viewname)) this.init()
  },
  watch: {
    filters() {
      this.loadSchedulerData()
    },
    preservedTimeLimit(newVal, oldVal) {
      if (newVal !== oldVal) this.loadSchedulerData()
    },
    page() {
      if (
        this.sideBarHeading === this.$t('view.unschedule_list', { ns: 'view' })
      )
        this.onUnscheduledList()
      else this.loadSchedulerDataList({ grpId: this.currentGrpId })
    },
    grpPage() {
      this.init()
    },
    currentViewHash(newVal) {
      if (this.grpPage !== 1) {
        this.grpPage = 1
      }
    },
  },
  computed: {
    viewDetails() {
      let { timelineScheduledViewContext, isLocked } =
        this.timelineViewDetail || {}
      return { ...timelineScheduledViewContext, isLocked }
    },
    timeZone() {
      return getTimeZone()
    },
    sideBarOptionList() {
      let obj = {
        label: 'All',
        value: '',
      }
      return [obj, ...(this.groupList || [])]
    },
    hideNextpage() {
      return (this.groupList || []).length < this.perPage
    },
    currentViewHash() {
      let { query = {} } = this.$route || {}
      let { currentView = null } = query

      let viewHash = {
        YEAR: 4,
        MONTH: 3,
        WEEK: 2,
        DAY: 1,
      }
      return viewHash[currentView] || 3
    },
    popupFields() {
      let { configJson } = this.viewDetails || {}
      configJson = (configJson && JSON.parse(configJson)) || {}

      let { 'popup-fields': popupFields } = configJson || {}
      popupFields = (popupFields || []).map(fldId => parseInt(fldId))

      return popupFields
    },
    additionalFields() {
      if (!isEmpty(this.popupFields)) {
        let { fields } = this.metaInfo || {}
        return fields.filter(data => this.popupFields.includes(data?.id))
      }
      return []
    },
    preservedTimeLimit() {
      let { query = {} } = this.$route || {}
      let { startTime, endTime = null } = query

      return {
        startTime: startTime ? parseInt(startTime) : null,
        endTime: endTime ? parseInt(endTime) : null,
      }
    },
    timeStamp() {
      let { query = {} } = this.$route || {}
      let { startTime, endTime = null } = query

      startTime = startTime ? parseInt(startTime) : null
      endTime = endTime ? parseInt(endTime) : null

      return {
        value: [startTime, endTime],
      }
    },
    mainFieldObj() {
      let { fields = [] } = this.metaInfo || {}
      let mainFieldObj = fields.find(field => field.mainField)
      return mainFieldObj
    },
    mainFieldName() {
      return this.mainFieldObj?.name
    },
    recordCustomization() {
      let { recordCustomization = {} } = this.viewDetails || {}
      return recordCustomization
    },
    currentTimelineView() {
      let { query = {} } = this.$route || {}
      let { currentView = null } = query
      return currentView?.toLowerCase()
    },
    isLoading() {
      return this.scheduleLoading || this.loading
    },
    webTabRouteName() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}

      return name || null
    },
  },
  methods: {
    onShowSearchBox() {
      this.showSearch = true
      this.$nextTick(() => {
        let inputBox =
          this.$refs['mainFieldSearchInput']?.$refs['f-input-field']
        if (inputBox) inputBox.focus()
      })
    },
    hideGroupSearch() {
      if (isEmpty(this.searchText)) {
        this.showSearch = false
      }
    },
    onClearSearch() {
      this.searchText = ''
      this.showSearch = false
      this.onSearchGroupName()
    },
    onSearchGroupName() {
      this.init(true)
    },
    canEditRecord() {
      return true
    },
    onViewChange(data) {
      let { view = 'YEAR', startTime } = data
      let { query = {} } = this.$route || {}
      let { currentView } = query

      if (!isEmpty(currentView)) {
        query = { ...query, currentView: view, refDate: startTime }
        this.$router.replace({ query }).catch(() => {})
      }
    },
    async init(bool) {
      if (bool) this.grpPage = 1
      await this.loadGroupingData()
    },
    redirectToSummary(id) {
      let { viewname, moduleName } = this
      let query = this.$route.query || null

      if (!isEmpty(this.webTabRouteName)) {
        let { href } = this.$router.resolve({
          name: this.webTabRouteName,
          params: { viewname, id, moduleName },
          query,
        })
        window.open(href, '_blank')
      }
    },
    openSummary(data, grpObj) {
      let { id: grpId, name: grpName } = grpObj
      this.summaryData = { ...data, grpId, grpName }
      this.openEventSummary = true
    },
    sideBarDetails(data) {
      let { groupName, title } = data
      this.sideBarHeading = title || ''
      this.groupName = groupName || ''

      this.loadSchedulerDataList(data)
    },
    dragOver(event) {
      event.preventDefault()
    },
    dragStart(event, item) {
      event.dataTransfer.setData('application/json', JSON.stringify(item))
    },
    drop(event) {
      event.preventDefault()
      const serializedData = event.dataTransfer.getData('application/json')

      // Parse the data
      const droppedData = JSON.parse(serializedData)
    },
    onClickUnschedule() {
      this.currentGrpId = -1
      this.onUnscheduledList()
    },
    async updateEventList(grpIds, payload) {
      let { moduleName, preservedTimeLimit, filters, viewname } = this
      let { startTime, endTime } = preservedTimeLimit || {}
      let groupIds = grpIds.map(l => parseInt(l)).filter(l => l > 0)
      let getUnGrouped = grpIds.some(l => parseInt(l) === -1)
      let params = {
        timelineRequest: {
          viewName: viewname,
          startTime,
          endTime,
          moduleName,
          dateAggregateOperator: dateOperator[this.currentViewHash],
          maxResultPerCell: 3,
          groupIds,
          getUnGrouped,
          filters,
        },
        moduleName,
        viewName: viewname,
        ...payload,
      }
      let { error, data } = await CustomModuleData.updateSchedulerEvent(
        params,
        moduleName
      )

      if (error) {
        ftoast.critical(
          error.message || this.$t('fetch_grp_error', { ns: 'view' })
        )
        this.schedulerData = { ...this.schedulerData }
      } else {
        grpIds.forEach(grpId => {
          let grpIdHasValue = Object.keys(data)
          if (!grpIdHasValue.includes(grpId)) {
            delete this.schedulerData[grpId]
          }
        })

        this.schedulerData = { ...this.schedulerData, ...data }
      }
    },
    updateEvent(data) {
      let { startDateField, endDateField, groupByField } = this.viewDetails
      let { name: grpByKey } = groupByField || {}
      let { name: startTimeKey } = startDateField || {}
      let { name: endTimeKey } = endDateField || {}

      let { workStart, actualWorkEnd, grpId, id } = data
      let currentGrpId = !isEmpty(grpId[1]) ? { id: grpId[1] } : null
      let params = {
        id,
        data: {
          id,
          [startTimeKey]: workStart,
          ...(endTimeKey && { [endTimeKey]: actualWorkEnd }),
          [grpByKey]: currentGrpId,
        },
      }

      this.updateEventList(grpId, params)
      this.openEventSummary = false
    },
    async loadGroupingData(sortObj, searchInvoke = false) {
      if (sortObj) {
        this.sortObj = sortObj
        this.grpPage = 1
      }
      sortObj && (this.sortObj = sortObj)
      this.loading = true
      let { grpPage, searchText, viewDetails, perPage } = this
      let { groupByField, name: timelineViewName } = viewDetails || {}
      let { displayName, name } = groupByField || {}
      let url = `/v3/timelineScheduledViewGroupData/${this.moduleName}/fetch`
      let sortContent = this.sortObj || { orderBy: name, orderType: 'asc' }
      let params = {
        page: grpPage,
        perPage,
        timelineModuleName: this.moduleName,
        timelineViewName: this.viewname,
        viewName: 'hidden-all',
        ...sortContent,
      }
      if (!isEmpty(searchText)) {
        if (isEmpty(sortObj)) {
          this.page = 1
          params.page = this.grpPage
          params.search = searchText
        } else {
          params.search = this.currentSearchText
        }
      } else {
        this.currentSearchText = searchText
      }
      let { error, data } = await API.get(url, params)
      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        let { pickList } = data || {}
        this.setGrpData(pickList || [], displayName)
      }
      this.loading = false
    },
    setGrpData(groupingListArr, displayName) {
      let { value, label } = this.pinnedGrpObj || {}
      let isPinnedGrpPresent = groupingListArr.find(
        item => item.value === value
      )
      let getUnGrouped = this.grpPage === 1
      if (getUnGrouped) {
        let unGroupIndex = groupingListArr.findIndex(item => item.value === -1)
        let unGroupList = {
          value: -1,
          label: `${this.$t('custommodules.list.no')} ${displayName}`,
        }
        if (unGroupIndex !== -1)
          groupingListArr.splice(unGroupIndex, 1, unGroupList)
        else groupingListArr.unshift(unGroupList)
      }
      if (value > 0 && !isPinnedGrpPresent) {
        groupingListArr.unshift({ value, label })
      }
      this.groupList = groupingListArr
    },
    async loadSchedulerDataList(prop) {
      this.canShowInPopOver = true
      this.viewMoreLoading = true
      this.isUnscheduledList = false
      let { startTime, endTime, grpId } = prop || {}
      this.currentGrpId = grpId
      let payload = {
        startTime,
        endTime,
        dateAggregateOperator: dateOperator[this.currentViewHash],
      }
      let params = this.getParams(payload)
      let url = `v3/modules/data/timelineScheduledView/${this.moduleName}/list`
      let { error, data } = await API.post(url, params)

      if (error) {
        return { error }
      } else {
        let { [this.moduleName]: list } = data || {}
        this.unscheduledList = this.deserializeData(list)
      }
      this.viewMoreLoading = false
    },
    async loadSchedulerData() {
      this.scheduleLoading = true
      let { moduleName, preservedTimeLimit, filters, viewname, page } = this
      let { startTime, endTime } = preservedTimeLimit || {}
      let viewGroupIds = (this.groupList || [])
        .map(l => parseInt(l.value))
        .filter(l => l > 0)
      let params = {
        timelineRequest: {
          viewName: viewname,
          startTime,
          endTime,
          moduleName,
          dateAggregateOperator: dateOperator[this.currentViewHash],
          maxResultPerCell: 3,
          groupIds: viewGroupIds,
          getUnGrouped: page === 1,
          filters,
        },
      }
      let url = `v3/modules/data/timelineScheduledView/${this.moduleName}/get`
      let { error, data } = await API.post(url, params)

      if (error) {
        return { error }
      } else {
        this.schedulerData = data?.timelineData || {}
      }
      this.scheduleLoading = false
    },
    getParams(payload = {}) {
      let { moduleName, filters, viewname, page, currentGrpId } = this

      let getUnGrouped = currentGrpId === -1

      return {
        timelineRequest: {
          moduleName,
          viewName: viewname,
          groupIds: getUnGrouped || !currentGrpId ? [] : [currentGrpId],
          getUnGrouped,
          filters,
          ...payload,
        },
        page,
        perPage: 20,
      }
    },
    async onUnscheduledList() {
      this.viewMoreLoading =
        this.isUnscheduledList =
        this.canShowInPopOver =
          true
      this.sideBarHeading = this.$t('view.unschedule_list', { ns: 'view' })
      let params = this.getParams()
      let url = `v3/modules/data/timelineScheduledView/${this.moduleName}/unscheduled`
      let { error, data } = await API.post(url, params)

      if (error) {
        console.log(error)
      } else {
        let { [this.moduleName]: list } = data || {}

        this.unscheduledList = this.deserializeData(list)
      }
      this.viewMoreLoading = false
    },
    deserializeData(viewMoreData) {
      let { mainFieldName = [], viewDetails } = this
      let {
        startDateField,
        endDateField,
        allowGroupAssignment,
        allowPastAssignment,
        allowReAssignment,
        allowRescheduling,
      } = viewDetails || {}
      let { name: startTimeKey } = startDateField || {}
      let { name: endTimeKey } = endDateField || {}

      return viewMoreData.map(list => {
        let eventColor =
          JSON.parse(list?.customization || '{}')?.eventColor || null
        let id = list?.data?.id
        let moduleState = list?.data?.moduleState
        let displayName = list.data[mainFieldName]
        let data = list.data
        let workStart = list.data[startTimeKey]
        let workEnd = list.data[endTimeKey]
        let actualWorkEnd = list.data[endTimeKey]
        let draggable =
          allowRescheduling ||
          allowReAssignment ||
          allowGroupAssignment ||
          !allowPastAssignment

        return {
          id,
          moduleState,
          displayName,
          data,
          eventColor,
          workStart,
          workEnd,
          actualWorkEnd,
          draggable,
          grpId: this.currentGrpId,
        }
      })
    },
  },
}
</script>
<style></style>
