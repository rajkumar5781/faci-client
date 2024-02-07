<template>
  <FContainer height="100%" width="100%">
    <FContainer
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      height="45px"
      padding="containerNone containerXLarge"
      border="1px solid"
      borderColor="borderNeutralGrey02Subtle"
      borderTopLeftRadius="medium"
      borderTopRightRadius="medium"
    >
      <FContainer
        display="flex"
        alignItems="center"
        padding="containerLarge containerXLarge"
      >
        <WeekPicker
          :resetPicker="resetPicker"
          @goToPreviousWeek="goToPreviousWeek"
          @goToCurrentWeek="goToCurrentWeek"
          @goToNextWeek="goToNextWeek"
        />
        <FDivider height="25px" marginRight="containerLarge" />
        <FButton appearance="secondary" size="small" @click="todayClicked">
          {{ $t('calendar.today', { ns: 'energy' }) }}
        </FButton>
        <FDivider height="25px" margin="containerNone containerLarge" />
        <FPopover placement="top" trigger="clickToOpen">
          <FContainer
            slot="content"
            height="380px"
            width="265px"
            borderRadius="medium"
            padding="containerXLarge"
          >
            <FText
              fontStyle="italic"
              textTransform="uppercase"
              appearance="headingMed14"
              >{{ $t('calendar.preferred_event', { ns: 'energy' }) }}</FText
            >
            <FContainer
              v-for="legend in calendarLegendOptions"
              :key="legend.color"
              :backgroundColor="legend.color"
              display="flex"
              alignItems="center"
              borderRadius="medium"
              margin="containerXLarge containerNone"
              padding="containerXLarge"
            >
              <FContainer
                height="20px"
                width="20px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                borderRadius="low"
                backgroundColor="backgroundMidgroundSubtle"
              >
                <FText appearance="headingMed14" color="textDefault">{{
                  `P${legend.priority}`
                }}</FText>
              </FContainer>
              <FContainer marginLeft="containerLarge">
                <FText appearance="headingMed14" color="textDefault">
                  {{ getProperty(legend, 'type', '') }}</FText
                >
              </FContainer>
            </FContainer>
          </FContainer>
          <FIcon
            group="map-travel"
            name="compass"
            size="20"
            color="iconPrimaryDefault"
          />
        </FPopover>
      </FContainer>
    </FContainer>
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer height="95%" width="100%" display="flex" flexDirection="column">
      <FCalendar
        ref="connected-calendar"
        :calendarEvents="calendarEvents"
        calendarView="week"
        :timezone="timeZone"
        :availableViews="['week']"
        :timeStep="3"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FButton,
  FCalendar,
  FPopover,
  FText,
  FDivider,
  ftoast,
  FSpinner,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import WeekPicker from './WeekPicker.vue'
import getProperty from 'dlv'
const calendarLegendOptions = [
  {
    priority: 1,
    type: 'Weekday',
    color: 'backgroundAccentBlueLight',
    borderColor: 'backgroundAccentBlueMedium',
  },
  {
    priority: 2,
    type: 'Seasonal',
    color: 'backgroundAccentYellowLight',
    borderColor: 'backgroundAccentYellowMedium',
  },
  {
    priority: 3,
    type: 'Month',
    color: 'backgroundAccentPinkLight',
    borderColor: 'backgroundAccentPinkMedium',
  },
  {
    priority: 4,
    type: 'Regular Maintenance',
    color: 'backgroundAccentVioletLight',
    borderColor: 'backgroundAccentVioletMedium',
  },
  {
    priority: 5,
    type: 'Holiday',
    color: 'backgroundAccentCyanLight',
    borderColor: 'backgroundAccentCyanMedium',
  },
  {
    priority: 6,
    type: 'One time event',
    color: 'backgroundNeutralGrey01Light',
    borderColor: 'backgroundNeutralGrey01Medium',
  },
]
export default {
  name: 'CalendarView',
  components: {
    FContainer,
    FButton,
    FCalendar,
    FPopover,
    FText,
    FDivider,
    WeekPicker,
    FSpinner,
    FIcon,
  },
  data: () => ({
    showCalendarLegend: false,
    calendarEvents: [],
    calendarLegendOptions,
    resetPicker: false,
    loading: false,
  }),
  computed: {
    calendarComponent() {
      let { $refs } = this
      return getProperty($refs, 'connected-calendar', {})
    },
    isTodaySelected() {
      let { calendarComponent } = this
      let { selectedDate, currentDay } = calendarComponent || {}

      return currentDay === selectedDate
    },
    timeZone() {
      return getProperty(this.$account, 'org.timezone', 'Etc/UTC')
    },
  },
  methods: {
    getProperty,
    todayClicked() {
      let { calendarComponent } = this
      this.resetPicker = true
      if (!isEmpty(calendarComponent)) {
        calendarComponent.gotoToday()
      }
    },
    goToPreviousWeek({ startDate, endDate }) {
      let { calendarComponent } = this
      if (!isEmpty(calendarComponent)) {
        calendarComponent.gotoPrevious()
      }
      this.loadEvents({ startDate, endDate })
    },
    goToCurrentWeek({ startDate, endDate }) {
      this.loadEvents({ startDate, endDate })
      this.resetPicker = false
    },
    goToNextWeek({ startDate, endDate }) {
      let { calendarComponent } = this
      if (!isEmpty(calendarComponent)) {
        calendarComponent.gotoNext()
      }
      this.loadEvents({ startDate, endDate })
    },
    toggleLegend(value) {
      this.showCalendarLegend = value
    },
    async loadEvents({ startDate, endDate }) {
      this.loading = true
      let params = {}
      if (!isEmpty(startDate) && !isEmpty(endDate)) {
        params = {
          ...params,
          calendarId: this.getProperty(this, '$attrs.id', null),
          startTime: startDate,
          endTime: endDate,
        }
      }

      let { error, data } = await API.get(
        'v3/calendar/getCalendarSlots',
        params,
        { force: true }
      )

      if (!error) {
        let list = this.getProperty(data, 'result', [])
        this.calendarEvents = list
        this.loading = false
      } else {
        ftoast.critical(error?.message || 'Error Occured')
      }
    },
  },
}
</script>
