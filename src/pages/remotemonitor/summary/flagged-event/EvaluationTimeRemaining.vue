<template>
  <Timer
    :deadline="actionRemainingTime"
    :amberUrgencyTime="amberUrgencyTime"
    :redUrgencyTime="redUrgencyTime"
  ></Timer>
</template>
<script>
import Timer from '../../components/Timer.vue'
import dlv from 'dlv'
export default {
  props: ['details', 'moduleName'],
  components: { Timer },
  computed: {
    actionRemainingTime() {
      let { details = {} } = this
      let { actionRemainingTime } = details
      return actionRemainingTime
    },
    redUrgencyTime() {
      let redUrgencyTime = dlv(
        this,
        'details.currentBureauActionDetail.redUrgencyTime',
        null
      )
      return redUrgencyTime
    },
    amberUrgencyTime() {
      let amberUrgencyTime = dlv(
        this,
        'details.currentBureauActionDetail.amberUrgencyTime',
        null
      )
      return amberUrgencyTime
    },
  },
}
</script>
