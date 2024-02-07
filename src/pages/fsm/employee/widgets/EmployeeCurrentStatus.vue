<template>
  <div class="h-full">
    <FContainer v-if="isLoading">
      <FContainer padding="containerXxLarge" display="flex">
        <FContainer paddingRight="containerXLarge"
          ><FShimmer :rounded="false" :height="30" :width="30"
        /></FContainer>
        <FContainer
          ><FShimmer :rounded="false" :height="50" :width="600"
        /></FContainer>
      </FContainer>
      <FContainer
        paddingTop="containerXxLarge"
        paddingBottom="containerXxLarge"
      >
        <FDivider width="100%"
      /></FContainer>
      <FContainer padding="containerXxLarge" display="flex">
        <FContainer paddingRight="containerXLarge"
          ><FShimmer :rounded="false" :height="30" :width="30"
        /></FContainer>
        <FContainer
          ><FShimmer :rounded="false" :height="50" :width="600"
        /></FContainer>
      </FContainer>
    </FContainer>
    <FContainer v-else padding="containerXxLarge">
      <FContainer display="flex">
        <FContainer
          borderRadius="full"
          backgroundColor="backgroundAccentBlueSubtle"
          marginRight="containerXLarge"
          height="35px"
          weight="32px"
          padding="containerLarge"
        >
          <FIcon
            group="time-date"
            name="date-tick"
            size="20"
            :pressable="false"
          />
        </FContainer>
        <FContainer>
          <FContainer
            ><FText
              color="backgroundNeutralGrey01Dark"
              appearance="headingMed14"
              >{{ $t('employee.current_status.shift', { ns: 'fsm' }) }}</FText
            ></FContainer
          >
          <FContainer
            ><FText
              color="backgroundNeutralInverseHovered"
              appearance="headingMed20"
              >{{ getShiftName }}</FText
            ></FContainer
          >
          <FContainer
            ><FText
              color="backgroundNeutralGrey01Dark"
              appearance="captionReg12"
              >{{ getShiftTime }}</FText
            ></FContainer
          >
        </FContainer>
      </FContainer>
      <FContainer paddingTop="containerXxLarge" paddingBottom="containerXxLarge"
        ><FDivider width="100%"
      /></FContainer>
      <FContainer display="flex">
        <FContainer
          borderRadius="full"
          backgroundColor="backgroundSemanticGreenSubtle"
          marginRight="containerXLarge"
          height="35px"
          weight="32px"
          padding="containerLarge"
        >
          <FIcon group="action" name="check-in" size="20" :pressable="false" />
        </FContainer>
        <FContainer>
          <FContainer
            ><FText
              color="backgroundNeutralGrey01Dark"
              appearance="headingMed14"
              >{{
                $t('employee.current_status.attendance', { ns: 'fsm' })
              }}</FText
            ></FContainer
          >
          <FContainer
            ><FText
              color="backgroundNeutralInverseHovered"
              appearance="headingMed20"
              >{{ getAttendanceName }}</FText
            ></FContainer
          >
          <FContainer
            ><FText
              color="backgroundNeutralGrey01Dark"
              appearance="captionReg12"
              >{{ getAttendanceTime }}</FText
            ></FContainer
          >
        </FContainer>
      </FContainer>
    </FContainer>
  </div>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { formatDate, getTimeFormat } from '../../../../utils/formatter'
import dayjs from 'dayjs'

import {
  FContainer,
  FText,
  FIcon,
  FDivider,
  FShimmer,
  ftoast,
} from '@facilio/design-system'

export default {
  props: ['details', 'widget', 'moduleName'],
  components: {
    FContainer,
    FText,
    FIcon,
    FDivider,
    FShimmer,
  },
  data() {
    return {
      isLoading: false,
      shiftDetails: {},
      attendanceDetails: {},
      attendanceTime: '---',
    }
  },
  created() {
    this.getCurrentStatusDetails()
  },
  computed: {
    getShiftName() {
      return getProperty(this.shiftDetails, 'name', '---')
    },
    getAttendanceName() {
      let returnStr = 'Checked Out '
      let checkInTime = getProperty(this.attendanceDetails, 'checkInTime', -1)
      let checkOutTime = getProperty(this.attendanceDetails, 'checkOutTime', -1)
      if (checkOutTime > 0) {
        returnStr += formatDate(checkOutTime, false, true)
      } else if (checkInTime > 0) {
        returnStr = 'Checked In '
        returnStr += formatDate(checkInTime, false, true)
      }
      return returnStr
    },
    getAttendanceTime() {
      let returnStr = ''
      let checkInTime = getProperty(this.attendanceDetails, 'checkInTime', -1)
      let checkOutTime = getProperty(this.attendanceDetails, 'checkOutTime', -1)
      if (checkOutTime > 0) {
        returnStr = formatDate(checkOutTime, true, false)
      } else if (checkInTime > 0) {
        returnStr = formatDate(checkInTime, true, false)
      }
      return returnStr
    },
    getShiftTime() {
      let startTime = getProperty(this.shiftDetails, 'startTime', -1)
      let endTime = getProperty(this.shiftDetails, 'endTime', -1)
      if (startTime > 0 && endTime > 0) {
        return `${this.getFormattedTime(startTime)} to ${this.getFormattedTime(
          endTime
        )}`
      }
      return ''
    },
  },
  methods: {
    isEmpty,
    getFormattedTime(value) {
      let format = getTimeFormat()
      let startOfDay = dayjs().startOf('day')
      return dayjs(startOfDay + value).format(format)
    },
    async getCurrentStatusDetails() {
      this.isLoading = true
      let { details, moduleName } = this
      let { id } = details || {}
      let params = { id }

      let { error, data } = await API.get(
        `/v3/${moduleName}/people/shiftDetailsForCurrentDay`,
        params
      )
      if (error) {
        let { message } = error
        ftoast.error(message, {
          title: '',
          timeout: 1000,
        })
      } else {
        let { shift, attendance } = data || {}
        this.attendanceDetails = attendance || {}

        if (!isEmpty(shift)) {
          this.shiftDetails = shift || {}
        }
      }
      this.isLoading = false
    },
  },
}
</script>
