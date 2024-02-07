<template>
 <Error40X
    errorCode="503"
    title="We’re under Scheduled Maintenance"
    :description="message"
  >
  <template #info>
      <FTags :text="formattedTimeRange" v-if="isTimePresent"/>
    </template>
  <template #action>
      <FButton v-if="canGoBack" @click="goBack">{{ buttonText }}</FButton>
    </template><
    </Error40X
  >
</template>
</template>
<script>
import Error40X from './Error40X.vue'
import getProperty from 'dlv'
import { FButton,FTags } from '@facilio/design-system'
import http from '../../utils/api/http.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { isEmpty } from '@facilio/utils/validation'
import { getTolgee } from '../../utils/tolgee'

const $t = getTolgee().t
dayjs.extend(utc)
dayjs.extend(timezone)
export default {
  data() {
    return {
      canGoBack: window.history.length > 1,
      message: null,
      startTime: null,
      endTime: null,
    }
  },
  components: { Error40X, FButton,FTags },
  created() {
    this.fetchDetails()
  },
  computed:{
    buttonText() {
      return $t('pages.go-back', {
        ns: 'error',
      })
    },
    formattedTimeRange() {
      let formattedStartTime = this.format(this.startTime);
      let formattedEndTime =   this.format(this.endTime);
      return `${formattedStartTime} --- ${formattedEndTime}`;
    },
    isTimePresent(){
      let {startTime,endTime} = this
      !isEmpty(startTime) && !isEmpty(endTime)
    }
  },
  methods: {
    goBack() {
      window.history.go(-1)
    },
    timezone() {
      let { account = {} } = this || {}
      let timezone
      if (!(account || {}).timezone) {
        let orgTimeZone = getProperty(account, 'org.timezone')
        timezone = orgTimeZone ? orgTimeZone : 'Etc/UTC'
      } else {
        let { timezone: accountTimeZone } = account || {}
        timezone = accountTimeZone ? accountTimeZone : 'Etc/UTC'
      }
      return timezone
    },
    account() {
      return this.$account
    },
    format(time) {
      let timezone = this.timezone()
      return dayjs.tz(time,timezone).format('MMM-DD-YYYY HH:MM')
    },
    fetchDetails() {
      http
        .get('/v2/fetchAccount')
        .then(() => {
          this.$router.replace({ path: '/maintenance' })
        })
        .catch(error => {
          if (error.response.status === 503) {
            let { message, startTime, endTime } = error.response.data
            this.message = message
            this.startTime = startTime
            this.endTime = endTime
          }
        })
    },
  },
}
</script>
