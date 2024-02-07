<template>
  <FContainer
    display="flex"
    justifyContent="space-between"
    padding="containerXLarge"
    backgroundColor="backgroundNeutralGrey02Subtle"
    height="100%"
    borderBottomLeftRadius="high"
    borderBottomRightRadius="high"
  >
    <FContainer display="flex">
      <FContainer display="flex" alignItems="center">
        <FIcon
          group="alert"
          name="circle-warning-filled"
          :pressable="false"
          size="24"
          color="backgroundPrimaryDefault"
        ></FIcon>
        <FContainer paddingLeft="containerLarge">
          <FText appearance="bodyReg14" color="backgroundNeutralInverse">
            {{ $t('facility.booking.booking_date', { ns: 'facilitybooking' }) }}
          </FText>
          <FText appearance="bodyReg14" color="backgroundNeutralInverse">
            {{ getBookingDate }}
          </FText>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        alignItems="center"
        paddingLeft="containerMedium"
        paddingRight="containerMedium"
      >
        <FText appearance="bodyReg14" color="backgroundNeutralInverse">
          <FDivider height="100%"></FDivider>
        </FText>
      </FContainer>
      <FContainer display="flex" alignItems="center">
        <FText appearance="bodyReg14" color="backgroundNeutralInverse">
          {{ $t('facility.booking.attendees', { ns: 'facilitybooking' }) }}
        </FText>
        <FText appearance="bodyReg14" color="backgroundNeutralInverse">
          {{ getAttendees }}
        </FText>
      </FContainer>
    </FContainer>
    <FContainer display="flex" alignItems="center">
      {{ getBookingAmount }}
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FIcon, FDivider } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate, getCurrency } from '../../../../utils/formatter'
export default {
  props: ['widget', 'details'],
  components: {
    FContainer,
    FText,
    FIcon,
    FDivider,
  },
  computed: {
    getBookingDate() {
      let { details } = this
      let { bookingDate } = details || {}
      return !isEmpty(bookingDate) ? formatDate(bookingDate, true) : '---'
    },
    getAttendees() {
      let { details } = this
      let { noOfAttendees } = details || {}
      return (
        `${noOfAttendees} ${
          noOfAttendees > 1
            ? this.$t('facility.booking.members', { ns: 'facilitybooking' })
            : ''
        }` || '---'
      )
    },
    getBookingAmount() {
      let { details } = this
      let { bookingAmount = ' 0.00' } = details || {}
      let currency = getCurrency()
      let defaultamount = currency + ' 0.00'
      let amount = currency + ' ' + bookingAmount
      return amount || defaultamount
    },
  },
}
</script>
