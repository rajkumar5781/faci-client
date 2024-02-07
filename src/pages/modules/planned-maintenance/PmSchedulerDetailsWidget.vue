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
      overflow="hidden"
      :marginTop="hideTopMargin ? '' : 'containerLarge'"
      display="flex"
      flexDirection="column"
    >
      <FContainer display="flex" justifyContent="space-between">
        <CalendarNavigation
          :recordCustomization="recordCustomization"
          :metaInfo="metaInfo"
          :isTimeline="true"
          :hideColorLegend="true"
          :hideUnscheduleView="true"
          @onClickUnscheduledList="onClickUnschedule"
        >
          <template #custom-actions-left>
            <FContainer
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexGrow="1"
            >
              <FContainer
                marginLeft="containerLarge"
                marginRight="containerLarge"
              >
                <VerticalDivider width="1px" height="24px" />
              </FContainer>
            </FContainer>

            <FShimmer
              v-if="isFetchingPlannerDetail"
              :height="32"
              :width="108"
            />
            <FSegmentedControl
              v-else
              v-model="groupBy"
              :tabsList="groupByTabList"
              @change="onChangeGroupByType"
              style="width: fit-content"
            >
              <template v-slot:[`tab.staff`]="tab">
                <FTooltip placement="top">
                  <template slot="title">{{ tab.hoverMessage }}</template>
                  <div style="display: flex; align-items: center">
                    <span
                      style="line-height: 10px; padding-right: 4px"
                      v-html="renderIcon('user', 'users')"
                    />
                  </div>
                </FTooltip>
              </template>
              <template v-slot:[`tab.resources`]="tab">
                <FTooltip placement="top">
                  <template slot="title">{{ tab.hoverMessage }}</template>
                  <div style="display: flex; align-items: center">
                    <span
                      style="line-height: 10px; padding-right: 4px"
                      v-html="renderIcon(tab.iconGroupName, tab.iconName)"
                    />
                  </div>
                </FTooltip>
              </template>
            </FSegmentedControl>

            <FContainer
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexGrow="1"
            >
              <FContainer
                marginLeft="containerLarge"
                marginRight="containerLarge"
              >
                <VerticalDivider width="1px" height="24px" />
              </FContainer>
            </FContainer>

            <FShimmer v-if="isFetchingPlannerList" :height="32" :width="192" />
            <FSelect
              v-else-if="!isEmpty(plannerList) && plannerList.length > 0"
              v-model="activePlanner"
              :options="plannerSelectableList"
              width="80%"
              size="medium"
              :clearable="false"
              @change="onSelectedPlannerChanged()"
            >
            </FSelect>

            <FContainer
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexGrow="1"
            >
              <FContainer
                marginLeft="containerLarge"
                marginRight="containerLarge"
              >
                <VerticalDivider width="1px" height="24px" />
              </FContainer>
            </FContainer>

            <NewAdvanceFilterWrapper
              :moduleName="moduleName"
              moduleDisplayName="Work Order"
              :hideQuery="true"
              :filterList="filters"
              @applyFilters="setAppliedFilter"
            />
          </template>
        </CalendarNavigation>
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
          :timezone="timezone"
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
          :canEditRecord="canEditRecord"
          :updatePermission="$access.hasPermission(`${moduleName}:UPDATE`)"
          @updateGrpEvents="updateEventList"
          @viewChanged="onViewChange"
          @sideBarDetails="sideBarDetails"
          @openSummary="openSummary"
        >
          <template #group-by-actions>
            <FContainer display="flex" alignItems="center">
              <FInput
                v-if="showSearch"
                v-model="searchText"
                ref="mainFieldSearchInput"
                placeholder="search"
                appearance="default"
                size="medium"
                clearable
                :clearValue="onClearSearch"
                @change="initTimeLineView(true)"
              ></FInput>
              <FIcon
                v-if="!showSearch"
                group="action"
                name="search"
                size="14"
                @click="showSearch = true"
              ></FIcon>
              <FPagination
                :currentPage.sync="grpPage"
                :perPage="perPage"
              ></FPagination>
              <GroupBySort
                v-if="showGroupBySort"
                :sortObj="sortObj"
                :sortByField="viewDetails.groupByField"
                @onSortChange="sortObj => loadGroupingData(sortObj)"
              >
              </GroupBySort>
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
      :currentGrpId="currentGrpId"
      :page.sync="page"
      :perPage="20"
      :count="10"
      :showClose="true"
      :hideTopMargin="hideTopMargin"
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
          size="medium"
          @change="onUnscheduledList()"
        >
        </FSelect>
      </template>
    </SideBarList>
    <FModal
      v-if="openEventSummary"
      :append-to-body="true"
      :visible="true"
      size="S"
      :title="summaryData.name"
      @ok="onSaveTimelineViewRecord"
      @cancel="openEventSummary = false"
    >
      <FContainer
        padding="containerXLarge sectionLarge"
        gap="containerXLarge"
        display="flex"
        flexDirection="column"
      >
        <FText appearance="headingMed14" color="textMain">Details</FText>
        <FContainer>
          <FText appearance="bodyReg14">{{
            viewDetails.startDateField.displayName
          }}</FText>
          <FDatePicker
            v-model="summaryData.workStart"
            type="date-time"
            :timeZone="timezone"
            :timeFormat="{ is12Hour: true, interval: 15 }"
          />
        </FContainer>
        <FContainer>
          <FText>{{ viewDetails.endDateField.displayName }}</FText>
          <FDatePicker
            v-model="summaryData.workEnd"
            type="date-time"
            :timeZone="timezone"
            :timeFormat="{ is12Hour: true, interval: 15 }"
          />
        </FContainer>
        <FContainer>
          <FText>{{ viewDetails.groupByField.displayName }}</FText>
          <FSelect v-model="summaryData.grpId" :options="groupList" disabled />
        </FContainer>
      </FContainer>
    </FModal>
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
  FSegmentedControl,
  FShimmer,
  ftoast,
  FTooltip,
} from '@facilio/design-system'
import CalendarNavigation from '../../../pages/list/views/CalendarNavigation.vue'
import { API } from '@facilio/api'
import SideBarList from '../../../pages/list/views/SidebarList.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import GroupBySort from '../../../pages/list/views/GroupBySort.vue'
import { NewAdvanceFilterWrapper } from '@facilio/criteria'
import {
  getRelatedFieldName,
  getUnRelatedModuleSummary,
} from '../../../utils/relatedFieldUtil.js'
import VerticalDivider from './VerticalDivider.vue'
import { getResourceIconPlaceholder } from './creation/utils/pm-utils.js'

const dateOperator = {
  1: 19,
  2: 12,
  3: 12,
  4: 11,
}

export default {
  props: ['metaInfo'], // TODO: need to support this inline
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
    FSegmentedControl,
    VerticalDivider,
    FShimmer,
    NewAdvanceFilterWrapper,
    FTooltip,
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
      mainFieldName: 'subject',
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

      plannerList: [],
      groupByTabList: [],
      activePlanner: {},
      activePlannerContext: null,
      viewDetails: null,
      groupBy: null,
      isFetchingPlannerDetail: false,
      isFetchingPlannerList: false,
      hideTopMargin: true,
      filters: null,
    }
  },

  created() {
    this.init()
  },

  watch: {
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
    moduleName() {
      return 'workorder'
    },
    pmId() {
      let { $route } = this
      let { params } = $route
      let { id } = params || {}
      return id
    },
    viewName() {
      let { viewDetails } = this
      let { name } = viewDetails || {}
      return name
    },
    plannerSelectableList() {
      let { plannerList } = this
      let selectList = []
      plannerList.forEach(planner => {
        selectList.push({ label: planner.name, value: planner.id })
      })
      return selectList
    },
    sideBarOptionList() {
      let obj = {
        label: 'All',
        value: '',
      }
      return [obj, ...(this.groupList || [])]
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
    showGroupBySort() {
      let { showSearch, viewDetails } = this
      return !showSearch && !isEmpty(viewDetails)
    },
    timezone() {
      let { account = {} } = this || {}
      let timezone
      if (!(account || {}).timezone) {
        let orgTimeZone = getProperty(account, 'org.timezone')
        timezone = orgTimeZone ? orgTimeZone : 'Etc/UTC'
      } else {
        let { timezone: accountTimeZone } = account || {}
        timezone = accountTimeZone ? accountTimeZone : 'Etc/UTC'
      }
      return timezone
    },
    account() {
      return this.$account
    },
    pmDetails() {
      let { details } = this.$attrs || {}
      return details
    },
  },

  methods: {
    onClearSearch() {
      this.searchText = ''
      this.showSearch = false
      this.initTimeLineView()
    },
    canEditRecord() {
      return true
    },
    onChangeGroupByType(view) {
      this.initTimeLineView()
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

    async loadPlanners(force = false) {
      this.isFetchingPlannerList = true
      let { pmId: id } = this
      let relatedFieldName = getRelatedFieldName(
        'plannedmaintenance',
        'pmPlanner'
      )
      let relatedConfig = {
        moduleName: 'plannedmaintenance',
        id,
        relatedModuleName: 'pmPlanner',
        relatedFieldName,
      }
      let { error, list } = await API.fetchAllRelatedList(
        relatedConfig,
        {},
        {
          force,
        }
      )

      if (!isEmpty(error)) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        this.$set(this, 'plannerList', list)
        if (!isEmpty(list)) {
          let initialPlanner = list[0] || {}
          let { id: initialPlannerId = null } = initialPlanner || {}

          this.$set(this, 'activePlanner', initialPlannerId)
          await this.fetchPlannerContext()
        }
      }
      this.isFetchingPlannerList = false
    },

    async fetchPlannerContext() {
      this.isFetchingPlannerDetail = true
      this.groupByTabList = []
      let { activePlanner } = this
      let { pmPlanner } = await getUnRelatedModuleSummary(
        'plannedmaintenance',
        'pmPlanner',
        activePlanner
      )
      let { resourceTimelineView, staffTimelineView } = pmPlanner || {}
      let { displayName: assetViewDisplayName, name: assetViewName } =
        resourceTimelineView || {}
      let { displayName: staffViewDisplayName, name: staffViewName } =
        staffTimelineView || {}

      if (!isEmpty(assetViewName) && !isEmpty(staffViewName)) {
        let { pmDetails } = this
        let resourceIcon = this.findIcon(pmDetails)
        let staffIcon = {
          iconGroupName: 'users',
          iconName: 'user',
          hoverMessage: 'Staff',
        }

        assetViewName = 'resources'
        staffViewName = 'staff'

        this.groupByTabList.push(
          {
            label: assetViewDisplayName,
            value: assetViewName,
            ...resourceIcon,
          },
          { label: staffViewDisplayName, value: staffViewName, ...staffIcon }
        )

        // check to maintain the previously selected groupBy
        if (!isEmpty(this.groupBy) && this.groupBy.includes('staff')) {
          this.groupBy = staffViewName
        } else {
          this.groupBy = assetViewName
        }
      }
      this.$set(this, 'activePlannerContext', pmPlanner)
      this.isFetchingPlannerDetail = false
    },

    findIcon(pmDetails) {
      let iconPlaceHolder = getResourceIconPlaceholder(pmDetails) || {}
      return iconPlaceHolder
    },

    loadCurrentView() {
      this.loading = true
      let { groupBy, activePlannerContext } = this
      let { resourceTimelineView = {}, staffTimelineView = {} } =
        activePlannerContext || {}
      if (!isEmpty(groupBy)) {
        if (groupBy.includes('staff')) {
          this.viewDetails = staffTimelineView
        } else {
          this.viewDetails = resourceTimelineView
        }
      } else {
        this.viewDetails = null
      }
      this.loading = false
    },

    async init(bool = false) {
      if (bool) this.grpPage = 1
      await this.loadPlanners()
      this.initTimeLineView()
    },

    async initTimeLineView(bool = false) {
      if (bool) this.grpPage = 1
      await this.loadCurrentView()
      await this.loadGroupingData()
      await this.loadSchedulerData()
    },

    async onSelectedPlannerChanged() {
      await this.fetchPlannerContext()
      this.initTimeLineView()
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
      let { moduleName, preservedTimeLimit, filters, viewName } = this
      let { startTime, endTime } = preservedTimeLimit || {}
      let groupIds = grpIds.map(l => parseInt(l)).filter(l => l > 0)
      let getUnGrouped = grpIds.some(l => parseInt(l) === -1)
      let params = {
        timelineRequest: {
          viewName: viewName,
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
        viewName: viewName,
        ...payload,
      }
      let { error, data } = await this.updateSchedulerEvent(params)

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
        ftoast.success(
          this.$t('pm.updated_successfully', { ns: 'maintenance' })
        )
      }
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
      let url = '/v3/timelineGroupData/fetch/plannedmaintenance'
      let sortContent = this.sortObj || { orderBy: name, orderType: 'asc' }
      let params = {
        page: grpPage,
        perPage,
        timelineModuleName: this.moduleName,
        timelineViewName,
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
        let unGroupList = { value: -1, label: `No ${displayName}` }
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
      let { viewDetails } = this
      let { name: viewName } = viewDetails
      this.currentGrpId = grpId
      let payload = {
        startTime,
        endTime,
        dateAggregateOperator: dateOperator[this.currentViewHash],
        viewName,
      }
      let params = this.getParams(payload)
      let url = 'v3/modules/data/timeline/plannedmaintenance/list'
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
      let { moduleName, preservedTimeLimit, filters, viewName, page } = this
      if (isEmpty(viewName)) {
        this.scheduleLoading = false
        return
      }
      let { startTime, endTime } = preservedTimeLimit || {}
      let viewGroupIds = (this.groupList || [])
        .map(l => parseInt(l.value))
        .filter(l => l > 0)
      let params = {
        timelineRequest: {
          viewName: viewName,
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
      let url = 'v3/modules/data/timeline/plannedmaintenance/get'
      let { error, data } = await API.post(url, params)

      if (error) {
        return { error }
      } else {
        this.schedulerData = data?.timelineData || {}
      }
      this.scheduleLoading = false
    },

    getParams(payload = {}) {
      let { moduleName, filters, viewName, page, currentGrpId } = this

      let getUnGrouped = currentGrpId === -1

      return {
        timelineRequest: {
          moduleName,
          viewName: viewName,
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
      let url = 'v3/modules/data/timeline/plannedmaintenance/unscheduled'
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
          draggable,
        }
      })
    },

    async onSaveTimelineViewRecord() {
      let { summaryData } = this
      let {
        moduleName,
        currentViewHash,
        filters,
        viewName,
        maxResultPerCell,
        timeStamp,
      } = this

      let { value = [] } = timeStamp
      let startTime = value[0],
        endTime = value[1]

      let { workStart, workEnd, grpId, id } = summaryData || {}
      let grpIds = [grpId]
      let groupIds = grpIds.map(l => parseInt(l)).filter(l => l > 0)
      let getUnGrouped = grpIds.some(l => parseInt(l) === -1)
      let payload = {
        id,
        scheduledStart: workStart,
        estimatedEnd: workEnd,
      }

      let params = {
        timelineRequest: {
          viewName,
          startTime,
          endTime,
          moduleName,
          dateAggregateOperator: dateOperator[currentViewHash],
          maxResultPerCell,
          groupIds,
          getUnGrouped,
          filters,
        },
        id,
        moduleName,
        viewName,
        data: payload,
      }
      let { error, data } = await API.patch(
        'v3/modules/data/timeline/plannedmaintenance/update',
        params
      )
      if (error) {
        ftoast.critical(error.message || 'Error Occurred')
      } else {
        ftoast.success(
          this.$t('pm.updated_successfully', { ns: 'maintenance' })
        )
        this.openEventSummary = false
        this.loadSchedulerData()
      }
    },

    async updateSchedulerEvent(params) {
      let url = 'v3/modules/data/timeline/plannedmaintenance/update'
      let { error, data } = await API.post(url, params)

      if (error) {
        return { error }
      } else {
        return { data: data?.timelineData || {} }
      }
    },

    setAppliedFilter(filters) {
      this.filters = filters
      this.loadSchedulerData()
    },
    renderIcon(groupName, iconName) {
      return `<fc-icon size="16" group="${groupName}" name="${iconName}"></fc-icon>`
    },
  },
}
</script>
<style></style>
