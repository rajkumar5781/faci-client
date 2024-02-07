<template>
  <FContainer>
    <portal :to="`header-${widget.id}-${widget.name}`">
      <FContainer
        display="flex"
        padding="containerLarge containerXLarge"
        justifyContent="space-between"
        width="100%"
        alignItems="center"
      >
        <FText appearance="headingMed14">
          {{ widget.displayName || widget.name }}
        </FText>
        <FTags
          :text="$t('tenant.last_30_days', { ns: 'tenant' })"
          padding="containerXLarge"
        />
      </FContainer>
    </portal>
    <FContainer
      v-if="isLoading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FSpinner :size="20" />
    </FContainer>

    <FContainer
      v-else
      display="flex"
      gap="containerXxLarge"
      padding="containerXxLarge"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FContainer
        display="flex"
        padding="containerLarge containerNone"
        flexDirection="column"
        alignItems="center"
        gap="containerMedium"
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
        width="50%"
        height="100%"
        justifyContent="center"
      >
        <FText
          appearance="bodyReg14"
          color="backgroundNeutralInverse"
          marginBottom="containerMedium"
        >
          {{ $t('tenant.till_yesterday', 'Till Yesterday', { ns: 'tenant' }) }}
        </FText>

        <FButton
          appearance="link"
          size="medium"
          @click="goToFacilityBookingList('tillYesterDay')"
        >
          <FText appearance="headingMed20" color="backgroundPrimaryDefault">
            {{ totalTillYesterdayBooking }}</FText
          >
        </FButton>
      </FContainer>
      <FContainer
        display="flex"
        padding="containerLarge containerNone"
        flexDirection="column"
        alignItems="center"
        gap="containerMedium"
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
        width="50%"
        height="100%"
        justifyContent="center"
      >
        <FText
          appearance="bodyReg14"
          color="backgroundNeutralInverse"
          marginBottom="containerMedium"
        >
          {{ $t('tenant.today', 'Today', { ns: 'tenant' }) }}
        </FText>

        <FButton
          appearance="link"
          size="medium"
          @click="goToFacilityBookingList('today')"
        >
          <FText appearance="headingMed20" color="backgroundPrimaryDefault">
            {{ totalTodayBooking }}</FText
          >
        </FButton>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import {
  FContainer,
  FText,
  FSpinner,
  FTags,
  FButton,
} from '@facilio/design-system'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { getTimeZone } from '../../../../utils/formatter'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'

dayjs.extend(timezone)

export default {
  props: ['details', 'widget'],
  components: { FContainer, FSpinner, FText, FTags, FButton },
  data() {
    return {
      totalTillYesterdayBooking: 0,
      totalTodayBooking: 0,
      mostBookedFacility: 0,
      isLoading: false,
      facilitybooking: [],
    }
  },
  async created() {
    this.isLoading = true
    await this.getBookingsTillTodayCount()
    this.isLoading = false
  },
  computed: {
    timeZone() {
      return getTimeZone()
    },
  },
  methods: {
    getStartTime(val) {
      return dayjs().tz(this.timeZone).startOf(val).valueOf()
    },
    getEndTime(val) {
      return dayjs().tz(this.timeZone).endOf(val).valueOf()
    },
    async getBookingsTillTodayCount() {
      let { details } = this || {}
      let { id } = details || {}

      let queryParams = {
        includeParentFilter: true,
        fetchOnlyViewGroupColumn: false,
        filters: JSON.stringify({
          tenant: {
            operatorId: 36,
            value: [`${id}`],
          },
          bookingDate: {
            operatorId: 20,
            value: [
              `${this.getStartTime('month')}`,
              `${this.getEndTime('month')}`,
            ],
          },
        }),
      }

      let { data, error } = await API.get(
        `/v3/modules/facilitybooking/view/all`,
        queryParams
      )
      if (!error) {
        let { facilitybooking = [] } = data || {}
        this.facilitybooking = facilitybooking
        this.getBookingsInsightCount()
      }
    },
    async getBookingsInsightCount() {
      if (isEmpty(this.facilitybooking)) {
        return
      }
      let startOfDay = this.getStartTime('day')
      let endOfDay = this.getEndTime('day')

      let totalTillYesterdayBooking = (this.facilitybooking || []).filter(
        booking => booking.bookingDate < startOfDay
      ).length
      let totalTodayBooking = (this.facilitybooking || []).filter(
        booking =>
          booking.bookingDate >= startOfDay && booking.bookingDate < endOfDay
      ).length

      this.totalTillYesterdayBooking = totalTillYesterdayBooking
      this.totalTodayBooking = totalTodayBooking
    },
    goToFacilityBookingList(insight) {
      let bookingId = this.getBookingId(insight)

      if (isEmpty(bookingId)) {
        return
      }
      let { details } = this || {}
      let { id } = details || {}

      let filters = {
        tenant: [{ operatorId: 36, value: [`${id}`] }],
        id: [{ operatorId: 36, value: bookingId }],
      }

      let query = {
        search: JSON.stringify(filters),
        includeParentFilter: true,
      }

      let { name } = findRouteForModule('facilitybooking', pageTypes.LIST) || {}

      if (name) {
        this.$router.push({
          name,
          params: { viewname: 'all' },
          query,
        })
      }
    },
    getBookingId(insight) {
      let bookingId = []
      if (isEmpty(this.facilitybooking)) {
        return bookingId
      }
      let startOfDay = this.getStartTime('day')
      let endOfDay = this.getEndTime('day')
      if (insight == 'today') {
        bookingId = this.facilitybooking.filter(
          booking =>
            booking.bookingDate >= startOfDay && booking.bookingDate < endOfDay
        )
      } else if ((insight = 'tillYesterDay')) {
        bookingId = this.facilitybooking.filter(
          booking => booking.bookingDate < startOfDay
        )
      }
      return bookingId.map(booking => {
        return `${booking.id}`
      })
    },
  },
}
</script>
