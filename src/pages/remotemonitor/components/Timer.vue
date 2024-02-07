<template>
  <FContainer height="100%" display="flex" alignItems="center">
    <FContainer
      display="flex"
      columnGap="containerMedium"
      alignItems="flex-start"
      justifyContent="center"
      width="100%"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        rowGap="containerMedium"
        width="20%"
      >
        <FText appearance="headingMed20" :color="colorOfDuration"
          >{{ days }}
        </FText>
        <FText appearance="captionReg12" color="textCaption">
          {{ $t('date_time.days') }}
        </FText>
      </FContainer>
      <FText appearance="headingMed20" :color="colorOfDuration">:</FText>
      <FContainer
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        rowGap="containerMedium"
        width="20%"
      >
        <FText appearance="headingMed20" :color="colorOfDuration"
          >{{ hours }}
        </FText>
        <FText appearance="captionReg12" color="textCaption">
          {{ $t('date_time.hours') }}
        </FText>
      </FContainer>
      <FText appearance="headingMed20" :color="colorOfDuration">:</FText>
      <FContainer
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        rowGap="containerMedium"
        width="20%"
      >
        <FText appearance="headingMed20" :color="colorOfDuration"
          >{{ minutes }}
        </FText>
        <FText appearance="captionReg12" color="textCaption">
          {{ $t('date_time.minutes') }}
        </FText>
      </FContainer>
      <FText appearance="headingMed20" :color="colorOfDuration">:</FText>
      <FContainer
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        rowGap="containerMedium"
        width="20%"
      >
        <FText appearance="headingMed20" :color="colorOfDuration"
          >{{ seconds }}
        </FText>
        <FText appearance="captionReg12" color="textCaption">
          {{ $t('date_time.seconds') }}
        </FText>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import { FContainer, FText } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'

const COLOR_MAP = {
  amberUrgencyTime: 'textSemanticOrange',
  redUrgencyTime: 'textSemanticRed',
}
export default {
  name: 'Timer',
  components: { FContainer, FText },
  props: ['deadline', 'appearance', 'amberUrgencyTime', 'redUrgencyTime'],
  data() {
    return {
      timeRemaining: 0,
      colorOfDuration: 'textDefault',
      speed: 1000,
      currentTime: {
        total: 0,
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
      },
    }
  },
  computed: {
    days() {
      let { isTimeBreachConfigured } = this
      return isTimeBreachConfigured
        ? getProperty(this, 'currentTime.days', '00')
        : '--'
    },
    hours() {
      let { isTimeBreachConfigured } = this
      return isTimeBreachConfigured
        ? getProperty(this, 'currentTime.hours', '00')
        : '--'
    },
    minutes() {
      let { isTimeBreachConfigured } = this
      return isTimeBreachConfigured
        ? getProperty(this, 'currentTime.minutes', '00')
        : '--'
    },
    seconds() {
      let { isTimeBreachConfigured } = this
      return isTimeBreachConfigured
        ? getProperty(this, 'currentTime.seconds', '00')
        : '--'
    },
    isTimeBreachConfigured() {
      let { deadline } = this
      return !isEmpty(deadline)
    },
  },
  watch: {
    timeRemaining(newVal) {
      let { amberUrgencyTime, redUrgencyTime, isTimeBreachConfigured } = this
      amberUrgencyTime = isEmpty(amberUrgencyTime) ? 0 : amberUrgencyTime
      redUrgencyTime = isEmpty(redUrgencyTime) ? 0 : redUrgencyTime
      if (isTimeBreachConfigured && newVal > 0) {
        if (newVal < redUrgencyTime) {
          this.colorOfDuration = COLOR_MAP['redUrgencyTime']
        } else if (newVal < amberUrgencyTime) {
          this.colorOfDuration = COLOR_MAP['amberUrgencyTime']
        }
      } else {
        this.colorOfDuration = 'textDefault'
      }
    },
  },
  mounted() {
    let { deadline } = this
    if (!isEmpty(deadline)) {
      this.timeRemaining = deadline
      setTimeout(this.countdown, 1)
    }
  },
  methods: {
    countdown() {
      this.timeRemaining -= 1000
      let { timeRemaining, isTimeBreachConfigured } = this
      let seconds = Math.floor((timeRemaining / 1000) % 60)
      let minutes = Math.floor((timeRemaining / (1000 * 60)) % 60)
      let hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24)
      let days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
      seconds = seconds >= 10 ? seconds : `0${seconds}`
      minutes = minutes >= 10 ? minutes : `0${minutes}`
      hours = hours >= 10 ? hours : `0${hours}`
      days = days >= 10 ? days : `0${days}`
      if (isTimeBreachConfigured && timeRemaining > 0) {
        this.currentTime = {
          total: timeRemaining,
          days: days,
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        }
        setTimeout(this.countdown, this.speed)
      } else {
        this.currentTime = null
      }
    },
  },
}
</script>
