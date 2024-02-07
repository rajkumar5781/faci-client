<template>
  <div class="h-full">
    <FContainer
      display="flex"
      padding="containerXLarge"
      justifyContent="space-between"
    >
      <FContainer display="flex">
        <FButton
          appearance="secondary"
          size="small"
          borderColor="iconPrimaryHovered"
          @click="goToToday()"
        >
          <FText>{{ $t('employee.work_schedule.today', { ns: 'fsm' }) }}</FText>
        </FButton>
        <FContainer paddingTop="containerMedium">
          <FDivider height="24px" marginLeft="containerXLarge" />
        </FContainer>
        <FContainer display="flex">
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
          <FContainer paddingTop="containerMedium">
            <FText appearance="headingMed14">
              {{ currentDateRange.label }}
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer>
        <FSegmentedControl
          v-model="currentView"
          :tabsList="views"
          @change="changeView"
        />
      </FContainer>
    </FContainer>
    <FContainer height="90%">
      <FCalendar
        ref="cal"
        :timezone="timezone"
        :calendarView="currentView"
        :availableViews="availableViews"
        :calendarEvents="employeeAppointments"
        @viewChanged="viewChanged"
        @onEventClick="onEventClick"
      />
    </FContainer>
  </div>
</template>
<script>
import {
  FContainer,
  FCalendar,
  FButton,
  FDivider,
  FIcon,
  FText,
  FSegmentedControl,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import {
  formatCustomDate,
  formatDate,
  getTimeZone,
} from '../../../../utils/formatter'
const COLORS = {
  '#51049F': 'backgroundAccentBlueLight',
  '#C70566': 'borderSemanticGreenLight',
  '#0492AE': 'backgroundSemanticRedSubtle',
  '#F7BA02': 'backgroundAccentYellowLight',
  '#058545': 'backgroundNeutralGrey02Medium',
  '#D12806': 'borderAccentPurpleLight',
}

export default {
  data() {
    return {
      currentView: 'month',
      timezone: getTimeZone(),
      views: [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
      ],
      currentDateRange: {
        label: '',
        startDate: null,
        endDate: null,
      },
      isLoading: false,
      employeeAppointments: [],
    }
  },
  props: ['details', 'widget', 'fitToViewArea'],
  components: {
    FCalendar,
    FContainer,
    FDivider,
    FButton,
    FIcon,
    FText,
    FSegmentedControl,
  },
  created() {
    this.fitToViewArea()
  },
  computed: {
    availableViews() {
      return this.views.map(e => {
        return e.value
      })
    },
  },
  methods: {
    async fetchAppointments(startTime, endTime) {
      this.isLoading = true
      this.employeeAppointments = []

      let { details } = this
      let id = getProperty(details, 'id', null)
      let params = {
        peopleId: id,
        startTime,
        endTime,
      }
      let { data, error } = await API.get(`v3/employee/workschedule`, params)
      if (error) {
        console.warn(`serviceappointment calendar API failed or cancelled`)
      } else if (!isEmpty(data)) {
        let { serviceAppointment } = data
        let events = []
        ;(serviceAppointment || []).forEach(data => {
          let { scheduledStartTime, scheduledEndTime, name, status } =
            data || {}
          let { color, backgroundColor } = status || {}
          let startTime = formatCustomDate(
            scheduledStartTime,
            'YYYY-MM-D HH:MM'
          )
          let endTime = formatCustomDate(scheduledEndTime, 'YYYY-MM-D HH:MM')
          let displayStartTime = formatCustomDate(scheduledStartTime, 'HH:MM A')
          let displayEndTime = formatCustomDate(scheduledEndTime, 'HH:MM A')
          let bgColor = backgroundColor

          let eventData = {
            start: startTime,
            end: endTime,
            title: name,
            displayStartTime,
            displayEndTime,
            bgColor,
          }
          events.push(eventData)
        })
        this.employeeAppointments = events || []
      }
      this.isLoading = false
    },
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
      this.fetchAppointments(
        this.currentDateRange.startDate.getTime(),
        this.currentDateRange.endDate.getTime()
      )
    },
    onEventClick(event) {
      console.log(event)
    },
  },
}
</script>
