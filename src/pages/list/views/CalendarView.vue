<template>
  <FContainer display="flex" gap="containerLarge" flexGrow="1">
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
        <CalendarNavigation :recordCustomization="recordCustomization" />
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

      <FContainer v-else height="100%" display="flex" gap="4px">
        <Calendar
          ref="calendar"
          :calendarView="calendarView"
          :availableViews="['month']"
          :calendarEvents="calendarEvent"
          :viewDetails="viewDetailObj"
          :referenceDate="referenceDate"
          :account="$account"
          :outOfScopeCellClicked="outOfScope"
          class="calendar-wrapper"
          @OnCellClicked="onCellClicked"
          @OnViewMoreClick="onViewMore"
        >
          <template #eventPopup="{ event }">
            <FPopoverDetails
              :headerText="event.title"
              :key="`event - ${event.eventId}`"
              :recordId="getRecordId(event, true)"
              :canShowRedirect="true"
              @onClickRedirect="eventClick(event.eventId)"
            >
              <template #content>
                <FContainer
                  display="flex"
                  padding="containerLarge"
                  justifyContent="space-between"
                >
                  <FContainer
                    v-for="(fld, index) in getFields(event)"
                    :key="`${fld.value}-${fld.id}-${index}-field`"
                    display="flex"
                    flexDirection="column"
                  >
                    <FText appearance="bodyReg14" color="textMain">
                      {{ fld.name }}
                    </FText>
                    <FText appearance="captionMed12" color="textCaption">
                      {{ fld.value }}
                    </FText>
                  </FContainer>
                </FContainer>
              </template>
            </FPopoverDetails>
          </template>
        </Calendar>
      </FContainer>
    </FContainer>
    <SideBarList
      ref="sideBar"
      :sidebarHeading="selectedDate"
      :viewMoreList="modifiedViewMoreList"
      :viewMoreLoading="viewMoreLoading"
      :page.sync="page"
      :perPage="20"
      :count="recordCount"
      :getFields="getFields"
      :isCalendarView="true"
      @onSearchView="onCalendarSearch"
      @onEventClick="data => eventClick(data)"
    ></SideBarList>
  </FContainer>
</template>
<script>
import CalendarNavigation from './CalendarNavigation.vue'
import { Calendar } from '@facilio/ui/app'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import SideBarList from './SidebarList.vue'
import { CustomModuleData } from '../../../data/CustomModuleData'
import {
  FText,
  FContainer,
  FSpinner,
  FPopoverDetails,
  ftoast,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { formatDate, getTimeZone } from '../../../utils/formatter'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isoWeek)

const ViewType = {
  DAY: 1,
  WEEK: 2,
  MONTH: 3,
}

export const moduleByLocalId = [
  'workorder',
  'inspectionResponse',
  'purchaseorder',
  'purchaserequest',
  'facility',
  'facilitybooking',
]

export default {
  props: [
    'viewDetail',
    'record',
    'moduleName',
    'viewname',
    'filters',
    'metaInfo',
  ],
  components: {
    FContainer,
    FSpinner,
    FText,
    CalendarNavigation,
    FPopoverDetails,
    SideBarList,
    Calendar,
  },
  data() {
    return {
      isEmpty,
      selectedDate: null,
      viewMoreData: null,
      currentMonthData: null,
      isLoading: true,
      viewMoreLoading: false,
      outOfScope: false,
      searchText: null,
      recordCount: null,
      page: 1,
      calendarEvent: {},
      filteredList: [],
      viewMoreTimeEvent: {},
      canShowInPopOver: false,
      viewVal: '3',
      tabsLists: [
        { label: 'Day', value: '1' },
        { label: 'Week', value: '2' },
        { label: 'Month', value: '3' },
      ],
    }
  },
  created() {
    this.getCurrentDate()
  },
  computed: {
    timeZone() {
      return getTimeZone()
    },
    modelDataClass() {
      return CustomModuleData
    },
    mainFieldObj() {
      let { fields = [] } = this.metaInfo || {}
      let mainFieldObj = fields.find(field => field.mainField)
      return mainFieldObj
    },
    recordCustomization() {
      let { recordCustomization = {} } = this.viewDetails || {}
      return recordCustomization
    },
    viewDetailObj() {
      let viewDetailObj = this.viewDetail
      if (isEmpty(this.viewDetail?.fields)) {
        viewDetailObj = {
          ...this.viewDetail,
          fields: [
            {
              name: this.mainFieldObj?.name,
              displayName: this.mainFieldObj?.displayName,
              field: this.mainFieldObj,
            },
          ],
        }
      }
      return viewDetailObj
    },
    onChangeCal() {
      return getProperty(this.$route, 'query.onChange', false)
    },
    preservedTimeLimit() {
      let { query = {} } = this.$route || {}
      let { startTime, endTime = null } = query

      return {
        startTime: startTime ? parseInt(startTime) : null,
        endTime: endTime ? parseInt(endTime) : null,
      }
    },
    isToday() {
      let { query = {} } = this.$route || {}
      let { today = null } = query

      return JSON.parse(today)
    },
    referenceDate() {
      let { refDate } = this.$route?.query || {}
      let { startTime } = this.preservedTimeLimit || {}

      return parseInt(refDate) || startTime
    },
    calendarContext() {
      let { calendarViewContext = {} } = this.viewDetail || {}
      let { startDateField, endDateField } = calendarViewContext

      return { startDateField, endDateField }
    },
    mainField() {
      let { name } = this.mainFieldObj || {}
      return name
    },
    scrollDisabled() {
      return this.isLoading || this.viewMoreLoading
    },
    webTabRouteName() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}

      return name || null
    },
    calendarView() {
      let { query = {} } = this.$route || {}
      let { currentView = null } = query
      return currentView?.toLowerCase()
    },
    modifiedViewMoreList() {
      let { mainField, viewMoreData = [] } = this
      return (viewMoreData || []).map(list => {
        let id = this.getRecordId(list.data)
        let moduleState = getProperty(list, 'data.moduleState.name') || ''
        let displayName = getProperty(list, `data.${mainField}`)
        let data = getProperty(list, 'data') || {}
        let eventId = getProperty(list, 'data.id') || ''

        return { id, moduleState, displayName, data, eventId }
      })
    },
  },
  watch: {
    preservedTimeLimit: {
      handler(oldVal, newVal) {
        if (!isEqual(oldVal, newVal)) {
          this.isLoading = true
          this.fetchEvents()
          if (this.onChangeCal) this.getCurrentDate()
        }
      },
      immediate: true,
    },
    referenceDate: {
      handler(newVal) {
        if (newVal) {
          let startTime = dayjs
            .tz(newVal, this.timeZone)
            .startOf(this.calendarView)
            .valueOf()
          let endTime = dayjs
            .tz(newVal, this.timeZone)
            .endOf(this.calendarView)
            .valueOf()
          let { query } = this.$route || {}

          query = { ...query, startTime, endTime, refDate: newVal }
          this.$router.push({ query }).catch(() => {})
        }
      },
    },
    isToday: {
      handler(newVal) {
        if (newVal) {
          let endDate = dayjs
            .tz(this.referenceDate, this.timeZone)
            .endOf('day')
            .valueOf()

          this.onViewMore({ startDate: this.referenceDate, endDate })
        }
      },
    },
    filters(newVal, oldVal) {
      if (!isEqual(oldVal, newVal)) this.fetchEvents()
    },
    page(newVal, oldVal) {
      if (!isEqual(oldVal, newVal))
        this.onViewMore(this.viewMoreTimeEvent, this.searchText)
    },
  },
  methods: {
    onCellClicked(data) {
      this.canShowInPopOver = true
      this.$refs['sideBar'].clearSearch()
      this.page = 1
      this.onViewMore(data)
    },
    constructPayload(startTime, endTime) {
      let calendarViewRequest = {
        startTime,
        endTime,
        maxResultPerCell: 3,
        dateAggregateOperator: 12,
        calendarViewType: ViewType.MONTH,
      }

      let params = {
        calendarViewRequest: JSON.stringify(calendarViewRequest),
        page: 1,
        perPage: 20,
        filters: !isEmpty(this.filters) ? JSON.stringify(this.filters) : null,
      }
      return params
    },
    getFields(event) {
      let { eventsKey = {} } = event || {}
      let { startDateField, endDateField } = this.calendarContext || {}

      let data = []

      if (!isEmpty(startDateField)) {
        let eventStart =
          getProperty(event, `${startDateField?.name}`) ||
          getProperty(eventsKey, `${startDateField?.name}`)
        let actualStart = formatDate(eventStart) || '---'

        data.push({
          name: startDateField?.displayName,
          value: actualStart,
          id: event.localId || event.eventId,
        })
      }
      if (!isEmpty(endDateField)) {
        let eventEnd =
          getProperty(event, `${endDateField?.name}`) ||
          getProperty(eventsKey, `${endDateField?.name}`)
        let actualEnd = formatDate(eventEnd) || '---'

        data.push({
          name: endDateField?.displayName,
          value: actualEnd,
          id: event.localId || event.eventId,
        })
      }

      return data
    },
    getRecordId(data, popoverEvent = false) {
      let { localId, id, eventId } = data || {}
      let defaultId = popoverEvent ? eventId : id
      return moduleByLocalId.includes(this.moduleName)
        ? localId || defaultId
        : defaultId
    },
    getCurrentDate() {
      let dateToCheck = dayjs(this.referenceDate).format('MM YY')
      let isCurrentMonth =
        dayjs().tz(this.timeZone).format('MM YY') === dateToCheck

      const startOfMonth =
        isCurrentMonth && this.calendarView === 'month'
          ? dayjs()
          : dayjs(this.referenceDate)

      const startDate = startOfMonth.clone().startOf('day').valueOf()

      if (isNaN(startDate)) return

      this.onViewMore({ startDate })
    },
    getCurrentTimeStamp() {
      let { startTime, endTime } = this.preservedTimeLimit || {}

      const startOfMonth = dayjs.tz(startTime, this.timeZone)
      const endOfMonth = dayjs.tz(endTime, this.timeZone)
      const startOfWeek = startOfMonth
        .clone()
        .isoWeekday(1) //since start of week in our calendar is monday
        .startOf('isoWeek')
        .valueOf()

      const endOfWeek = endOfMonth
        .clone()
        .isoWeekday(1)
        .endOf('isoWeek')
        .valueOf()

      return { startTime: startOfWeek, endTime: endOfWeek }
    },
    onCalendarSearch(calendarSearchData) {
      this.searchText = calendarSearchData
      this.onViewMore(this.viewMoreTimeEvent, calendarSearchData)
    },
    fetchEvents: debounce(async function () {
      let { startTime, endTime } = this.getCurrentTimeStamp()

      if (isNaN(startTime) || isEmpty(this.viewname)) return

      this.isLoading = true

      let payload = await this.constructPayload(startTime, endTime)

      try {
        let params = {
          moduleName: this.moduleName,
          viewname: this.viewname,
          payload,
        }
        let { data = {} } =
          await this.modelDataClass.fetchCalendarRecords(params)
        this.calendarEvent = data
      } catch (error) {
        this.showErrorToastMessage(
          error,
          this.$t('custommodules.list.list_error')
        )
      }

      this.isLoading = false
    }, 10),
    showErrorToastMessage(error, customMsg) {
      let message = error?.message || customMsg
      ftoast.critical(message)
    },
    eventClick(id) {
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
    async onViewMore(event, search) {
      let { startDate } = event
      let { outOfScope } = this
      let { query } = this.$route || {}

      this.viewMoreLoading = true

      startDate = dayjs
        .tz(startDate || this.referenceDate, this.timeZone)
        .valueOf()
      let endDate = dayjs.tz(startDate, this.timeZone).endOf('day').valueOf()

      query = { ...query, today: null, onChange: null, refDate: startDate }

      if (this.onChangeCal) outOfScope = false
      else outOfScope = true

      this.$router.replace({ query }).catch(() => {})
      this.outOfScope = outOfScope
      this.viewMoreTimeEvent = event
      this.selectedDate = dayjs(startDate).format('D dddd')

      let calendarViewRequest = {
        startTime: parseInt(startDate),
        endTime: parseInt(endDate),
      }

      let param = {
        calendarViewRequest: JSON.stringify(calendarViewRequest),
        page: this.page,
        perPage: 20,
        filters: !isEmpty(this.filters) ? JSON.stringify(this.filters) : null,
        search: !isEmpty(search) ? search : null,
      }

      try {
        let params = {
          moduleName: this.moduleName,
          viewname: this.viewname,
          payload: param,
        }
        let { data } =
          await this.modelDataClass.fetchCalendarSideBarList(params)

        this.viewMoreData = data || []

        this.recordCount = data ? data?.length : 0
      } catch (error) {
        this.showErrorToastMessage(
          error,
          this.$t('custommodules.list.list_error')
        )
      }

      if (isEmpty(search) && !isEmpty(this.$refs['toggle-search']))
        await this.$refs['toggle-search'].clearSearch()

      this.viewMoreLoading = false
    },
  },
}
</script>
<style>
.calendar-wrapper {
  height: 100%;
  flex-grow: 1;
  background-color: #fff;
  border-bottom-left-radius: 5px;
  box-shadow: 0 3px 7px 0 rgb(233 233 226 / 50%);
}
.cv-horiz-line {
  width: 6px;
  background-color: #cce8ff;
  border-radius: 3px;
}
</style>
