<template>
  <FContainer display="flex" justifyContent="center" alignItems="center">
    <!-- days -->
    <FContainer display="inherit" v-if="hasDays">
      <FContainer display="inherit" flexDirection="column">
        <FContainer
          padding="containerMedium containerLarge"
          display="inherit"
          justifyContent="center"
        >
          <FText appearance="headingMed20" color="textMain">{{
            getFormattedString(days)
          }}</FText>
        </FContainer>
        <FContainer
          padding="containerMedium containerLarge"
          display="inherit"
          justifyContent="center"
        >
          <FText appearance="captionReg12" color="textCaption">{{
            dayLabel
          }}</FText>
        </FContainer>
      </FContainer>
      <FContainer display="inherit" paddingTop="containerMedium">
        <FText appearance="headingMed20" color="textMain">:</FText>
      </FContainer>
    </FContainer>
    <!-- hours -->
    <FContainer display="inherit">
      <FContainer display="inherit" flexDirection="column">
        <FContainer
          padding="containerMedium containerLarge"
          display="inherit"
          justifyContent="center"
        >
          <FText appearance="headingMed20" color="textMain">{{
            getFormattedString(hours)
          }}</FText>
        </FContainer>
        <FContainer
          padding="containerMedium containerLarge"
          display="inherit"
          justifyContent="center"
        >
          <FText appearance="captionReg12" color="textCaption">{{
            hourLabel
          }}</FText>
        </FContainer>
      </FContainer>
      <FContainer display="inherit" paddingTop="containerMedium">
        <FText appearance="headingMed20" color="textMain">:</FText>
      </FContainer>
    </FContainer>
    <!-- minutes -->
    <FContainer display="inherit">
      <FContainer display="inherit" flexDirection="column">
        <FContainer
          padding="containerMedium containerLarge"
          display="inherit"
          justifyContent="center"
        >
          <FText appearance="headingMed20" color="textMain">{{
            getFormattedString(mins)
          }}</FText>
        </FContainer>
        <FContainer
          padding="containerMedium containerLarge"
          display="inherit"
          justifyContent="center"
        >
          <FText appearance="captionReg12" color="textCaption">{{
            minuteLabel
          }}</FText>
        </FContainer>
      </FContainer>
      <FContainer
        display="inherit"
        paddingTop="containerMedium"
        v-if="!hasDays"
      >
        <FText appearance="headingMed20" color="textMain">:</FText>
      </FContainer>
    </FContainer>
    <!-- seconds -->
    <FContainer display="inherit" flexDirection="column" v-if="!hasDays">
      <FContainer
        padding="containerMedium containerLarge"
        display="inherit"
        justifyContent="center"
      >
        <FText appearance="headingMed20" color="textMain">{{
          getFormattedString(secs)
        }}</FText>
      </FContainer>
      <FContainer
        padding="containerMedium containerLarge"
        display="inherit"
        justifyContent="center"
      >
        <FText appearance="captionReg12" color="textCaption">{{
          $t('alarm.seconds', 'Seconds', {
            ns: 'alarm',
          })
        }}</FText>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText } from '@facilio/design-system'
export default {
  name: 'AlarmDuration',
  components: {
    FContainer,
    FText,
  },
  data() {
    return {
      days: '',
      hours: '',
      mins: '',
      secs: '',
      intervalObj: null,
    }
  },
  props: ['details'],
  computed: {
    createdTime() {
      let { details } = this
      let { prevOccurrence } = details || {}
      let { createdTime } = prevOccurrence || {}
      return createdTime
    },
    hasDays() {
      let { days } = this
      return days > 0
    },
    dayLabel() {
      let { days } = this
      const str = days < 2 ? 'Day' : 'Days'
      const key = days < 2 ? 'alarm.day' : 'alarm.days'

      return this.$t(key, str, {
        ns: 'alarm',
      })
    },
    hourLabel() {
      let { hours } = this
      const str = hours < 2 ? 'Hour' : 'Hours'
      const key = hours < 2 ? 'alarm.hour' : 'alarm.hours'

      return this.$t(key, str, {
        ns: 'alarm',
      })
    },
    minuteLabel() {
      let { mins } = this
      const str = mins < 2 ? 'Minute' : 'Minutes'
      const key = mins < 2 ? 'alarm.minute' : 'alarm.minutes'

      return this.$t(key, str, {
        ns: 'alarm',
      })
    },
  },
  watch: {
    createdTime: function () {
      this.initCounter()
    },
  },
  mounted() {
    this.initCounter()
  },
  methods: {
    getFormattedString(str) {
      return str < 10 ? str.toString().padStart(2, '0') : str
    },
    initCounter() {
      let dateObj = new Date(this.createdTime)
      let date
      let currentTime = Date.now()
      date = (currentTime - dateObj) / 1000
      if (date < 0 && date > -2) {
        date = 0
      }
      let d = Math.floor(date / (24 * 60 * 60))
      let h = Math.floor((date % (24 * 60 * 60)) / 3600)
      let m = Math.floor((date % 3600) / 60)
      let s = Math.floor((date % 3600) % 60)

      this.days = d >= 0 ? d : 0
      this.hours = h >= 0 ? h : 0
      this.mins = m >= 0 ? m : 0
      this.secs = s >= 0 ? s : 0
      this.startCounter()
    },
    startCounter() {
      if (this.intervalObj) {
        clearInterval(this.intervalObj)
        this.intervalObj = null
      }

      this.intervalObj = setInterval(() => {
        this.secs++
        if (this.secs >= 60) {
          this.secs = 0
          this.mins++
        }

        if (this.mins >= 60) {
          this.mins = 0
          this.hours++
        }

        if (this.hours >= 24) {
          this.hours = 0
          this.days++
        }
      }, 1000)
    },
  },
}
</script>
