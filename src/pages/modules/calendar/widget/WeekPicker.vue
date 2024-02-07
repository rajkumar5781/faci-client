<template>
  <FContainer display="flex" cursor="pointer" alignItems="center">
    <FContainer padding="containerMedium containerLarge">
      <FText marginLeft="containerSmall" marginRight="containerSmall">{{
        weekInfo
      }}</FText>
    </FContainer>
    <FContainer padding="containerNone containerXLarge">
      <FIcon
        group="navigation"
        name="accordion-left"
        size="16"
        :pressable="true"
        @click="prevWeek"
      ></FIcon>
    </FContainer>
    <FContainer>
      <FIcon
        group="navigation"
        name="accordion-right"
        size="16"
        :pressable="true"
        @click="nextWeek"
      ></FIcon>
    </FContainer>
  </FContainer>
</template>

<script>
import dayjs from 'dayjs'
import { FContainer, FText, FIcon } from '@facilio/design-system'
import { formatCustomDate } from '../../../../utils/formatter.js'
export default {
  name: 'WeekPicker',
  data() {
    return {
      startDate: null,
      endDate: null,
    }
  },
  props: ['resetPicker'],
  components: {
    FContainer,
    FText,
    FIcon,
  },
  computed: {
    weekInfo() {
      let { startDate, endDate } = this
      let startDateMonth = formatCustomDate(startDate, 'MMM DD')
      let endDateMonth = formatCustomDate(endDate, 'MMM DD')
      let startYear = formatCustomDate(startDate, 'YYYY')
      let endYear = formatCustomDate(endDate, 'YYYY')
      return startYear === endYear
        ? `${startDateMonth} - ${endDateMonth} , ${startYear}`
        : `${startDateMonth} ${startYear} - ${endDateMonth} ${endYear}`
    },
  },
  watch: {
    resetPicker: {
      async handler(newVal) {
        if (newVal) {
          this.setCurrentWeek()
        }
      },
      immediate: true,
    },
  },
  methods: {
    setCurrentWeek() {
      const now = new Date()
      const firstDayOfWeek = new Date()
      const lastDayOfWeek = new Date()
      const dayOfWeek = now.getDay()
      const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday Calculation

      firstDayOfWeek.setDate(now.getDate() - daysUntilMonday)
      lastDayOfWeek.setDate((now.getDate() + (6 - now.getDay() + 7) % 7)+1)
      firstDayOfWeek.setHours(0, 0, 0, 0)
      lastDayOfWeek.setHours(23, 59, 59, 999)

      this.startDate = firstDayOfWeek.getTime()
      this.endDate = lastDayOfWeek.getTime()

      this.$emit('goToCurrentWeek', {
        startDate: this.startDate,
        endDate: this.endDate,
      })
    },
    prevWeek() {
      const prevStartDate = new Date(this.startDate)
      const prevEndDate = new Date(this.endDate)

      prevStartDate.setDate(prevStartDate.getDate() - 7)
      prevEndDate.setDate(prevEndDate.getDate() - 7)
      prevStartDate.setHours(0, 0, 0, 0)
      prevEndDate.setHours(23, 59, 59, 999)

      this.startDate = prevStartDate.getTime()
      this.endDate = prevEndDate.getTime()
      this.$emit('goToPreviousWeek', {
        startDate: this.startDate,
        endDate: this.endDate,
      })
    },

    nextWeek() {
      const nextStartDate = new Date(this.startDate)
      const nextEndDate = new Date(this.endDate)

      nextStartDate.setDate(nextStartDate.getDate() + 7)
      nextEndDate.setDate(nextEndDate.getDate() + 7)
      nextStartDate.setHours(0, 0, 0, 0)
      nextEndDate.setHours(23, 59, 59, 999)

      this.startDate = nextStartDate.getTime()
      this.endDate = nextEndDate.getTime()
      this.$emit('goToNextWeek', {
        startDate: this.startDate,
        endDate: this.endDate,
      })
    },
  },
  mounted() {
    this.setCurrentWeek()
  },
}
</script>
