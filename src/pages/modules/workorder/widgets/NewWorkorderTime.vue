<template>
  <FContainer v-if="workorder">
    <template v-if="!workorder.loadTimer || loading">
      <FShimmer :rounded="rounded" />
    </template>

    <template v-else-if="workorder.workorder.moduleState && ticketStatus">
      <timer :time="time" twoDigits="true"></timer>
    </template>

    <template
      v-else-if="
        !(
          workorder.workorder.moduleState && workorder.workorder.moduleState.id
        ) && workorder.workorder.status.status === 'Work in Progress'
      "
    >
      <timer :time="time"></timer>
    </template>
    <template v-else-if="time">
      <static-timer
        v-if="actualWorkDurationField"
        :time="time"
        :static="true"
        twoDigits="true"
        :duration="duration"
      ></static-timer>
    </template>
  </FContainer>
</template>
<script>
// import Timer from '@/Timer'
import Timer from './NewTimer.vue'
import { FContainer, FShimmer } from '@facilio/design-system'
import { getTimeZone, getDurationInSecs } from '../../../../utils/formatter'
import getProperty from 'dlv'
import module from '../../../../store/module'
const moduleStore = module()

import { mapState, mapActions } from 'pinia'
export default {
  props: ['actualWorkDurationField', 'loading', 'details'],
  components: {
    Timer: Timer,
    StaticTimer: Timer,
    FContainer,
    FShimmer,
  },
  watch: {
    workorder: {
      handler() {},
      deep: true,
    },
  },
  created() {
    moduleStore.loadTicketStatus('workorder' || '')
  },
  computed: {
    time() {
      if (this.workorder.loadTimer) {
        let time =
          this.workorder.workorder.actualWorkStart >
          this.workorder.workorder.resumedWorkStart
            ? this.workorder.workorder.actualWorkStart
            : this.workorder.workorder.resumedWorkStart
        let duration = this.workorder.workorder.actualWorkDuration
        time = time > -1 ? time : Date.now()
        duration = (duration > -1 ? duration : 0) * 1000
        return time - duration
      } else {
        return Date.now()
      }
    },
    duration() {
      let { actualWorkDurationField } = this
      if (this.workorder.loadTimer) {
        let duration = this.workorder.workorder.actualWorkDuration
        duration = duration > -1 ? duration : 0
        return getDurationInSecs(duration, actualWorkDurationField?.unit || 's')
      } else {
        return 0
      }
    },
    workorder() {
      return this.details
    },
    ticketStatus() {
      let statusObj = moduleStore.getTicketStatus(
        this.details.workorder.moduleState.id,
        'workorder'
      )
      return getProperty(statusObj, 'timerEnabled', false)
    },
  },
}
</script>
