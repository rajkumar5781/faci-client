<template>
  <FContainer display="flex" class="w-full h-full" flexDirection="column">
    <FContainer
      display="flex"
      padding="containerXLarge"
      justifyContent="space-between"
      border="1px solid"
      borderBottom="none"
      borderColor="borderNeutralBaseSubtler"
      borderRadius="high high none none"
    >
      <FContainer>
        <FSegmentedControl
          v-model="currentView"
          :tabsList="views"
          @change="changeView"
        />
      </FContainer>
      <FContainer display="flex">
        <FContainer display="flex">
          <FContainer paddingTop="containerMedium">
            <FText color="textMain" appearance="captionMed12">
              {{ currentDateRange.label }}
            </FText>
          </FContainer>
          <FContainer display="flex">
            <FContainer
              paddingLeft="containerXLarge"
              paddingRight="containerMedium"
            >
              <FIcon
                group="dsm"
                name="chevron-left"
                size="16"
                :pressable="true"
                @click="gotoPrevious"
              />
            </FContainer>
            <FContainer
              paddingLeft="containerXLarge"
              paddingRight="containerXLarge"
            >
              <FIcon
                group="dsm"
                name="chevron-right"
                size="16"
                :pressable="true"
                @click="gotoNext"
              />
            </FContainer>
          </FContainer>
        </FContainer>
        <FDivider height="100%" margin="containerNone containerXLarge" />
        <FContainer display="flex" alignItems="center">
          <FButton
            appearance="secondary"
            size="small"
            borderColor="iconPrimaryHovered"
            @click="goToToday"
          >
            <FText color="textMain" appearance="captionMed12">{{
              $t('employee.work_schedule.today', { ns: 'fsm' })
            }}</FText>
          </FButton>
        </FContainer>
      </FContainer>
    </FContainer>
    <FCalendar
      class="w-full"
      ref="cal"
      :calendarEvents="calendarEvents"
      :calendarView="currentView"
      :availableViews="availableViews"
      :timezone="timezone"
      :singleEventPerDay="true"
      @viewChanged="viewChanged"
    />
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FIcon,
  FButton,
  FSegmentedControl,
  FCalendar,
  FDivider,
} from '@facilio/design-system'
import { eventBus } from '../../components/page-builder/event-bus'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  formatCustomDate,
  formatDate,
  getTimeZone,
  getFormattedDuration,
} from '../../utils/formatter'
import dayjs from 'dayjs'
import {
  getDisplayNameForStatus,
  getBgForStatus,
  getIconForStatus,
} from './AttendanceMixin'

export default {
  name: 'AttendanceCalendar',
  mounted() {
    eventBus.$on('refresh-attendance', this.fetchAttendanceForSelectedEmployee)
  },
  beforeDestroy() {
    eventBus.$off('refresh-attendance')
  },
  created() {
    if (!isEmpty(this.selectedRecordId))
      this.fetchAttendanceForSelectedEmployee(this.selectedRecordId)
  },
  props: ['selectedRecordId'],
  data() {
    return {
      views: [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
      ],
      listLoading: false,
      shifts: [],
      attendance: [],
      currentDateRange: {
        label: '',
        startDate: null,
        endDate: null,
      },
      timezone: getTimeZone(),
      currentView: 'month',
    }
  },
  components: {
    FContainer,
    FText,
    FIcon,
    FButton,
    FSegmentedControl,
    FCalendar,
    FDivider,
  },
  computed: {
    availableViews() {
      return this.views.map(e => e.value)
    },
    calendarEvents() {
      return (this.attendance || []).reduce((events, attendance) => {
        let { status, day, workingHours } = attendance || {}
        let event = {
          title: getDisplayNameForStatus(status),
          start: formatDate(
            dayjs(day).tz(getTimeZone()).startOf('day').valueOf()
          ),
          end: formatDate(dayjs(day).tz(getTimeZone()).endOf('day').valueOf()),
          bgColor: getBgForStatus(status),
          workingHours: !isEmpty(workingHours)
            ? getFormattedDuration(workingHours)
            : null,
          icon : getIconForStatus(status),
          padding: 'containerMedium'
        }
        events.push(event)
        return events
      }, [])
    },
  },
  methods: {
    isEmpty,
    changeView() {
      this.$refs.cal.activeView = this.currentView
    },
    goToToday() {
      this.$refs.cal.gotoToday()
    },
    gotoPrevious() {
      this.$refs.cal.gotoPrevious()
    },
    gotoNext() {
      this.$refs.cal.gotoNext()
    },
    viewChanged(viewObj) {
      this.currentDateRange.startDate = viewObj.startDate
      this.currentDateRange.endDate = viewObj.endDate
      if (viewObj.view == 'day') {
        this.currentDateRange.label = formatDate(
          this.currentDateRange.startDate,
          true,
          false
        )
      } else if (viewObj.view == 'week') {
        this.currentDateRange.label =
          formatDate(this.currentDateRange.startDate, true, false) +
          ' - ' +
          formatDate(this.currentDateRange.endDate, true, false)
      } else if (viewObj.view == 'month') {
        this.currentDateRange.label = formatCustomDate(
          this.currentDateRange.startDate,
          'MMMM YYYY'
        )
      }
      if (!isEmpty(this.selectedRecordId))
        this.fetchAttendanceForSelectedEmployee(this.selectedRecordId)
    },
    async fetchAttendanceForSelectedEmployee(selectedRecordId = null) {
      this.shifts = []
      this.attendance = []
      let { currentDateRange = {} } = this
      let { startDate, endDate } = currentDateRange
      if (isEmpty(selectedRecordId) || startDate === null || endDate === null) {
        return
      }
      this.$emit('fetchTransitionButtons', selectedRecordId)
      this.listLoading = true
      let params = {
        peopleID: selectedRecordId,
        rangeFrom: startDate.getTime(),
        rangeTo: endDate.getTime(),
      }
      let { error, data = {} } = await API.get(`/v3/attendance/view`, params)
      if (error) {
        let { message = '', title = '' } = error || {}
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 5000,
        })
      } else {
        this.shifts = data.shifts
        this.attendance = data.attendance
      }
      this.listLoading = false
    },
  },
}
</script>
