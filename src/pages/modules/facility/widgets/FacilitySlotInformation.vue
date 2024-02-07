<template>
  <FContainer padding="containerXxLarge">
    <FContainer display="flex" flexWrap="wrap" paddingBottom="containerLarge">
      <FContainer
        marginRight="containerXLarge"
        width="20%"
        marginBottom="containerXxLarge"
      >
        <FContainer paddingBottom="containerMedium">
          <FText
            color="backgroundNeutralInverseHovered"
            appearance="captionMed12"
          >
            {{
              $t('facility.slot_info.slot_duration', { ns: 'facilitybooking' })
            }}
          </FText>
        </FContainer>
        <FContainer>
          <FText color="backgroundNeutralInverse" appearance="bodyReg14">
            {{ getSlotduration }}</FText
          >
        </FContainer>
      </FContainer>
      <FContainer
        marginRight="containerXLarge"
        width="20%"
        marginBottom="containerXxLarge"
      >
        <FContainer paddingBottom="containerMedium">
          <FText
            color="backgroundNeutralInverseHovered"
            appearance="captionMed12"
          >
            {{
              $t('facility.slot_info.max_slot_booking_allowed', {
                ns: 'facilitybooking',
              })
            }}
          </FText>
        </FContainer>
        <div>
          <FText color="backgroundNeutralInverse" appearance="bodyReg14"
            >{{ getMaxSlotBookingAllowed }}
          </FText>
        </div>
      </FContainer>
      <FContainer
        marginRight="containerXLarge"
        width="20%"
        marginBottom="containerXxLarge"
      >
        <FContainer paddingBottom="containerMedium">
          <FText
            color="backgroundNeutralInverseHovered"
            appearance="captionMed12"
          >
            {{
              $t('facility.slot_info.parallel_booking', {
                ns: 'facilitybooking',
              })
            }}
          </FText>
        </FContainer>
        <div>
          <FText color="backgroundNeutralInverse" appearance="bodyReg14">
            {{ getMultiBookingAllowedPerSlot }}
          </FText>
        </div>
      </FContainer>
      <FContainer
        marginRight="containerXLarge"
        width="20%"
        marginBottom="containerXxLarge"
      >
        <FContainer paddingBottom="containerMedium">
          <FText
            color="backgroundNeutralInverseHovered"
            appearance="captionMed12"
          >
            {{
              $t('facility.slot_info.advance_booking_days', {
                ns: 'facilitybooking',
              })
            }}
          </FText>
        </FContainer>
        <div>
          <FText color="backgroundNeutralInverse" appearance="bodyReg14">
            {{ getBookingAdvancePeriods }}
          </FText>
        </div>
      </FContainer>
      <FContainer
        marginRight="containerXLarge"
        width="20%"
        marginBottom="containerXxLarge"
      >
        <FContainer paddingBottom="containerMedium">
          <FText
            color="backgroundNeutralInverseHovered"
            appearance="captionMed12"
          >
            {{
              $t('facility.slot_info.attendee_list', {
                ns: 'facilitybooking',
              })
            }}
          </FText>
        </FContainer>
        <div>
          <FText color="backgroundNeutralInverse" appearance="bodyReg14">
            {{ details.isAttendeeListNeeded ? 'Mandatory' : 'Not Mandatory' }}
          </FText>
        </div>
      </FContainer>
      <FContainer
        marginRight="containerXLarge"
        width="15%"
        marginBottom="containerXxLarge"
      >
        <FContainer paddingBottom="containerMedium">
          <FText
            color="backgroundNeutralInverseHovered"
            appearance="captionMed12"
          >
            {{
              $t('facility.slot_info.chargeable', {
                ns: 'facilitybooking',
              })
            }}
          </FText>
        </FContainer>
        <div>
          <FText color="backgroundNeutralInverse" appearance="bodyReg14">
            {{ getIsChargable }}
          </FText>
        </div>
      </FContainer>
    </FContainer>
    <FContainer paddingTop="containerLarge" paddingBottom="containerLarge">
      <FContainer
        v-if="isEmpty(details.weekDayAvailabilities)"
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FEmptyState
          illustration="no-data"
          :title="
            $t('facility.slot_info.no_slot_information_available', {
              ns: 'facilitybooking',
            })
          "
          size="M"
          :vertical="true"
        />
      </FContainer>
      <div v-else>
        <FTable
          :columns="column"
          :data="data"
          :hideBorder="false"
          :showSelectBar="false"
          rounded
          :readOnly="true"
        />
      </div>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FEmptyState,
  FDivider,
  FTable,
} from '@facilio/design-system'
import { getFormattedDuration } from '../../../../utils/formatter'

const DAYS = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

export default {
  props: ['widget', 'details', 'fitMyContent'],
  components: { FContainer, FText, FEmptyState, FDivider, FTable },
  created() {
    this.weekDayAvailabilities()
  },
  data() {
    return {
      column: [],
      data: [],
    }
  },
  computed: {
    getSlotduration() {
      let { details } = this
      let { slotDuration } = details || {}
      return !isEmpty(slotDuration)
        ? getFormattedDuration(slotDuration, 's')
        : '---'
    },
    getMaxSlotBookingAllowed() {
      let { details } = this
      let { maxSlotBookingAllowed } = details || {}
      return !isEmpty(maxSlotBookingAllowed) ? maxSlotBookingAllowed : '---'
    },
    getMultiBookingAllowedPerSlot() {
      let { details } = this
      let { isMultiBookingPerSlotAllowed } = details || {}

      return isMultiBookingPerSlotAllowed
        ? this.$t('facility.slot_info.allowed', { ns: 'facilitybooking' })
        : this.$t('facility.slot_info.not_allowed', { ns: 'facilitybooking' })
    },
    getBookingAdvancePeriods() {
      let { details } = this
      let { bookingAdvancePeriodInDays } = details || {}
      
      return !isEmpty(bookingAdvancePeriodInDays)
        ? this.$t('facility.slot_info.advance_booking_days_with_value', {
            day: bookingAdvancePeriodInDays,
            ns: 'facilitybooking',
          })
        : '---'
    },
    getIsChargable() {
      let { details } = this
      let { isChargeable } = details || {}
      return isChargeable
        ? this.$t('facility.slot_info.yes', {
            ns: 'facilitybooking',
          })
        : this.$t('facility.slot_info.no', {
            ns: 'facilitybooking',
          })
    },
  },
  methods: {
    isEmpty,
    getFormattedDuration,
    weekDayAvailabilities() {
      this.data = []
      let { details } = this
      let { isChargeable, weekDayAvailabilities = [] } = details || {}

      let column = [
        { displayName: 'Day', name: 'day', id: 1, fixed: true },
        {
          displayName: 'Time',
          name: 'time',
          id: 2,
          width: 350,
        },
      ]
      if (!isEmpty(details) && isChargeable) {
        let isChargeableColumn = {
          displayName: 'Slot Cost',
          name: 'cost',
          id: 3,
          width: 350,
        }
        column.push(isChargeableColumn)
      }

      let datas = weekDayAvailabilities.map(data => {
        let { dayOfWeek, startTime, endTime, cost = '0' } = data || {}
        let dataObj = {
          ...data,
          day: DAYS[dayOfWeek],
          time: `${startTime} - ${endTime}`,
          cost: isChargeable ? cost : null,
        }
        return dataObj
      })
      this.column = column
      this.data = datas
      this.$nextTick(() => {
        this.fitMyContent()
      })
    },
  },
}
</script>
