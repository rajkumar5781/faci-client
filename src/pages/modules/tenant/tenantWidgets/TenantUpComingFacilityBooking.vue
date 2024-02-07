<template>
  <FContainer height="100%">
    <FContainer
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      v-if="isLoading"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FContainer height="100%" v-if="showEmptyState">
      <FEmptyState
          illustration="no-data"
          size="S"
          :description="
            $t(
              'there_is_no_upcoming_facility_booking',
              {ns:'tenant'}
            )
          "
          :vertical="true"
        ></FEmptyState>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      alignItems="center"
      padding="containerXxLarge"
      columnGap="containerXLarge"
      width="100%"
    >
      <FIcon
        group="time-date"
        name="date"
        :pressable="false"
        size="20"
        backgroundColor="backgroundAccentBlueSubtle"
        borderRadius="full"
        style="padding: 6px"
      ></FIcon>

      <FContainer
        display="flex"
        flexDirection="column"
        rowGap="containerMedium"
      >
        <FButton
          appearance="link"
          size="medium"
          cursor="pointer"
          @click="redirectToOverview('facilitybooking', upcomingBooking.id)"
        >
          <FText appearance="bodyReg14" color="backgroundPrimaryDefault">
            {{
              upcomingBooking.name ||
              $t('tenant.no_upcomming_booking', 'No upcomming booking', {
                ns: 'tenant',
              })
            }}
          </FText>
        </FButton>

        <FContainer display="flex">
          <FText
            v-if="!isEmpty(upcomingBooking.date)"
            appearance="bodyReg14"
            color="textCaption"
            marginRight="containerMedium"
            >{{ upcomingBooking.date }}
          </FText>
          <FText
            v-if="!isEmpty(upcomingBooking.slot)"
            appearance="bodyReg14"
            color="textCaption"
          >
            {{ upcomingBooking.slot }}
          </FText>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FIcon,
  FText,
  FButton,
  FAvatar,
  FSpinner,
  FTooltip,
  FEmptyState,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate } from '../../../../utils/formatter'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { getTimeZone } from '../../../../utils/formatter'
import minBy from 'lodash/minBy'
import getProperty from 'dlv'
import FetchViews from '../../../../components/views/FetchViews.vue'

dayjs.extend(timezone)
export default {
  components: {
    FContainer,
    FIcon,
    FText,
    FButton,
    FAvatar,
    FSpinner,
    FTooltip,
    FEmptyState,
  },
  mixins: [FetchViews],
  props: ['details'],
  data() {
    return {
      upcomingBooking: {},
      isLoading: false,
      isEmpty,
    }
  },
  async created() {
    this.isLoading = true
    await this.getBookingsTillTodayCount()
    this.isLoading = false
  },
  computed:{
    showEmptyState(){
        let id=getProperty(this.upcomingBooking, 'id',null)
        return isEmpty(id)
    }
  },
  methods: {
    getStartTime(val) {
      return dayjs().tz(getTimeZone()).startOf(val).valueOf()
    },
    getEndTime(val) {
      return dayjs().tz(getTimeZone()).endOf(val).valueOf()
    },
    async getBookingsTillTodayCount() {
      let { details } = this || {}
      let { id } = details || {}
      let filters = JSON.stringify({
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
      })
      let queryParams = {
        withCount: true,
        viewName: 'all',
        includeParentFilter: true,
        moduleName: 'facilitybooking',
        filters,
      }

      let { data, error } = await API.get('/v3/modules/data/list', queryParams)

      if (!error) {
        let { facilitybooking = [] } = data || {}
        await this.getBookingsInsightCount(facilitybooking)
      }
    },
    async getBookingsInsightCount(bookings) {
      let startOfDay = this.getStartTime('day')
      let upcomingBookingIds = bookings
        .filter(bk => bk.bookingDate >= startOfDay)
        .map(bk => `${bk.id}`)

      let upcomingBookingSlots = await this.getBookingSlots(upcomingBookingIds)

      let upcomingSlotIds = upcomingBookingSlots.flatMap(bkslot => {
        let { slot } = bkslot || {}
        if (slot.id) return `${slot?.id}`
        return []
      })

      let upcomingSlots = await this.getSlots(upcomingSlotIds)
      let nextComingSlot = minBy(upcomingSlots, 'slotStartTime')
      let nextComingSlotId = getProperty(nextComingSlot, 'id') || -1

      let upcomingBookingSlotObj = upcomingBookingSlots.find(
        bkSlot => bkSlot?.slot?.id == nextComingSlotId
      )
      let upcomingBookingId = getProperty(upcomingBookingSlotObj, 'booking.id')
      let upcomingBooking = await this.getBookingDetails(upcomingBookingId)

      let upcomingBookingName =
        getProperty(upcomingBooking, 'facility.name') || '---'
      let upcomingBookingDate = upcomingBooking
        ? formatDate(upcomingBooking?.bookingDate, true)
        : null

      let upcomingBookingSlot = null

      if (!isEmpty(upcomingBooking?.slotList)) {
        let { slotStartTime, slotEndTime } =
          getProperty(upcomingBooking, `slotList.0.slot`) || {}

        if (slotStartTime && slotEndTime) {
          let startTime = dayjs(slotStartTime)
          let endTime = dayjs(slotEndTime)

          upcomingBookingSlot =
            startTime.format('HH:mm') + ' - ' + endTime.format('HH:mm')
        }
      }

      this.upcomingBooking = {
        id: upcomingBookingId,
        name: upcomingBookingName,
        date: upcomingBookingDate,
        slot: upcomingBookingSlot,
      }
    },
    async getBookingSlots(bookingIds) {
      if (isEmpty(bookingIds)) return []

      let queryParams = {
        viewName: 'all',
        includeParentFilter: true,
        moduleName: 'bookingslot',
        filters: JSON.stringify({
          booking: { operatorId: 36, value: bookingIds },
        }),
      }
      let { data } = await API.get('/v3/modules/data/list', queryParams)
      return data?.bookingslot || []
    },
    async getSlots(slotIds) {
      if (isEmpty(slotIds)) return

      let queryParams = {
        viewName: 'all',
        includeParentFilter: true,
        moduleName: 'slot',
        filters: JSON.stringify({ id: { operatorId: 9, value: slotIds } }),
      }

      let { data } = await API.get('/v3/modules/data/list', queryParams)
      return data?.slot || []
    },
    async getBookingDetails(bookingId) {
      if (!bookingId) return

      let params = { id: bookingId, moduleName: 'facilitybooking' }
      let { data } = await API.get('/v3/modules/data/summary', params)

      return data?.facilitybooking || {}
    },
    async redirectToOverview(moduleName, id) {
      if (isEmpty(id)) return

      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}

      if (name) {
        let viewname = await this.fetchView(moduleName)
        this.$router.push({ name, params: { viewname, id } })
      }
    },
  },
}
</script>
