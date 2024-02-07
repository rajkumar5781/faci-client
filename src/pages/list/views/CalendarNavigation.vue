<template>
  <FContainer
    display="flex"
    justifyContent="space-between"
    padding="containerLarge containerXLarge"
    alignItems="center"
    width="100%"
    borderBottom="solid 0.5px"
    borderColor="borderNeutralBaseSubtle"
  >
    <FContainer display="flex" flexDirection="row">
      <FSegmentedControl
        v-model="viewVal"
        :tabsList="tabsLists"
        @change="getView"
        style="width: fit-content"
      />
      <slot name="custom-actions-left"></slot>
    </FContainer>

    <FContainer display="flex" gap="containerXLarge" alignItems="center">
      <slot name="custom-actions-right"></slot>
      <FTimelineFilter
        v-model="val"
        :dateType="calendarView"
        :timeZone="timeZone"
        @change="onChangeDateObj"
      >
      </FTimelineFilter>
      <FDivider
        height="16px"
        margin="containerNone containerMedium"
        backgroundColor="borderNeutralBaseSubtle"
      />

      <FContainer display="flex">
        <FButton
          appearance="secondary"
          @click="changeQuery"
          size="small"
          borderRadius="medium"
          >{{ $t('calendar.today', { ns: 'energy' }) }}</FButton
        >
      </FContainer>
      <FDivider
        v-if="canShowUnScheduledView"
        height="16px"
        backgroundColor="borderNeutralBaseSubtle"
        margin="containerNone containerMedium"
      />
      <FButton
        v-if="canShowUnScheduledView"
        appearance="tertiary"
        @click="getUnscheduled"
        >{{ $t('view.unscheduled', { ns: 'view' }) }}</FButton
      >

      <FPopover
        v-if="canShowColorLegend"
        trigger="clickToOpen"
        placement="bottom-start"
        v-model="showColorLegend"
        @show="showColorLegend = true"
        @hide="showColorLegend = false"
      >
        <FIcon group="action" name="apps" size="14"></FIcon>
        <template #content>
          <ColorLegend
            v-if="showColorLegend"
            :recordCustomization="recordCustomization"
            :moduleName="moduleName"
            :metaInfo="metaInfo"
            @onClose="showColorLegend = false"
          ></ColorLegend>
        </template>
      </FPopover>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTimelineFilter,
  FButton,
  FDatePanel,
  FPopover,
  FSegmentedControl,
  FIcon,
  FDivider,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { getTimeZone } from '../../../utils/formatter'
import ColorLegend from './ColorLegend.vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isoWeek)

export default {
  props: [
    'recordCustomization',
    'moduleName',
    'metaInfo',
    'isTimeline',
    'hideColorLegend',
    'hideUnscheduleView',
  ],
  components: {
    FContainer,
    FText,
    FTimelineFilter,
    FButton,
    FDatePanel,
    FPopover,
    FSegmentedControl,
    FIcon,
    FDivider,
    ColorLegend,
  },
  data() {
    return {
      isEmpty,
      val: [],
      todayclicked: true,
      calendarView: '',
      viewVal: 'DAY',
      showColorLegend: false,
    }
  },
  created() {
    let { query } = this.$route
    let defaultValue = this.defaultView
    this.viewVal = query?.currentView || defaultValue
    this.calendarView =
      query?.currentView?.toLowerCase() || defaultValue?.toLowerCase()
    this.changeQuery(this.startTime)
  },
  computed: {
    defaultView() {
      return this.isTimeline ? 'DAY' : 'MONTH'
    },
    tabsLists() {
      if (this.isTimeline) {
        return [
          { label: 'Day', value: 'DAY' },
          { label: 'Week', value: 'WEEK' },
          { label: 'Month', value: 'MONTH' },
          { label: 'Year', value: 'YEAR' },
        ]
      } else {
        return [{ label: 'Month', value: 'MONTH' }]
      }
    },
    timeZone() {
      return getTimeZone()
    },
    referenceDate() {
      let { query = {} } = this.$route || {}
      let { refDate } = query
      return parseInt(refDate) || new Date()
    },
    startTime() {
      let { query = {} } = this.$route || {}
      let { startTime } = query

      return startTime ? parseInt(startTime) : null
    },
    currentView() {
      let { query = {} } = this.$route || {}
      let { currentView } = query
      let defaultView = this.isTimeline ? 'DAY' : 'MONTH'

      return currentView ? currentView : defaultView
    },
    canShowColorLegend() {
      let { isTimeline, hideColorLegend } = this
      return isTimeline && !hideColorLegend
    },
    canShowUnScheduledView() {
      let { isTimeline, hideUnscheduleView = false } = this
      return isTimeline && !hideUnscheduleView
    },
  },
  watch: {
    currentView(newVal) {
      this.viewVal = newVal
      this.getView(newVal)
    },
    calendarView() {
      let { query = {} } = this.$route || {}
      let { refDate } = query
      this.changeQuery(refDate)
    },
    referenceDate(newVal) {
      let start = dayjs
        .tz(newVal, this.timeZone)
        .startOf(this.calendarView)
        .valueOf()
      let end = dayjs
        .tz(newVal, this.timeZone)
        .endOf(this.calendarView)
        .valueOf()

      this.val = [start, end]
    },
  },
  methods: {
    getView(view) {
      if (view === 'DAY') this.calendarView = 'day'
      else if (view === 'WEEK') this.calendarView = 'week'
      else if (view === 'YEAR') this.calendarView = 'year'
      else this.calendarView = 'month'
    },
    onChangeDateObj(data) {
      let [startTime, endTime] = data || []

      startTime = dayjs.tz(startTime, this.timeZone).valueOf()
      endTime = dayjs.tz(endTime, this.timeZone).valueOf()

      this.setQuery(startTime, endTime, startTime)
    },
    setQuery(startTime, endTime, refDate) {
      let { query = {} } = this.$route || {}

      query = {
        ...query,
        currentView: this.calendarView?.toUpperCase(),
        startTime,
        endTime,
        refDate,
        onChange: true,
        today: this.todayclicked,
      }

      this.$router.replace({ query }).catch(() => {})
      this.todayclicked = false
    },
    changeQuery(date = '') {
      let { calendarView, timeZone } = this
      let todayDate = this.todayclicked
        ? dayjs().tz(this.timeZone).startOf('day').valueOf()
        : null
      let startTime = null
      let endTime = null

      startTime = dayjs().tz(timeZone).startOf(calendarView).valueOf()
      endTime = dayjs().tz(timeZone).endOf(calendarView).valueOf()

      this.setQuery(startTime, endTime, todayDate)
    },
    getUnscheduled() {
      this.$emit('onClickUnscheduledList')
    },
  },
}
</script>
<style></style>
