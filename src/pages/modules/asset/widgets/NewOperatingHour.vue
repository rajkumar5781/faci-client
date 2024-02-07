<template>
  <FModal
    title="New operating hour"
    :visible="visibility"
    size="S"
    @ok="saveOperatingHour"
    @cancel="closeDialog"
    :hideFooter="false"
  >
    <FContainer
      display="flex"
      padding="containerXxLarge sectionLarge"
      marginLeft="sectionLarge"
      marginRight="sectionLarge"
      flexDirection="column"
      justifycontent="center"
      alignItems="flex-start"
      gap="sectionSmall"
    >
      <FContainer
        display="flex"
        width="351px"
        flexDirection="column"
        alignItems="flex-start"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerMedium"
          alignSelf="stretch"
        >
          <FText alignItems="center" color="textMain">Name</FText>
          <FContainer width="351px">
            <FInput
              v-model="name"
              placeholder="Enter here"
              appearance="default"
              size="medium"
              wrap
            />
          </FContainer>
        </FContainer>
      </FContainer>

      <FContainer
        display="flex"
        width="351px"
        flexDirection="column"
        alignItems="flex-start"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerMedium"
          alignSelf="stretch"
        >
          <FText alignItems="center" color="textMain"
            >Operating hour type</FText
          >
          <FContainer width="351px">
            <FSelect
              :options="[
                { label: '24 hours 7 days', value: 'DAYS_24_7' },
                { label: '24 hours 5 days', value: 'DAYS_24_5' },
                { label: 'Custom hours', value: 'CUSTOM' },
              ]"
              v-model="businessHourType"
              :value="null"
              placeholder="Select"
              :multiple="false"
              :disabled="false"
              allowCreate
              filterable
              :loading="false"
              :addOptionLoading="false"
              size="medium"
            />
          </FContainer>
        </FContainer>
      </FContainer>

      <FContainer
        display="flex"
        width="351px"
        flexDirection="column"
        alignItems="flex-start"
        v-if="businessHourType === 'CUSTOM'"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerMedium"
          alignSelf="stretch"
        >
          <FText alignItems="center" color="textMain">Custom hour type</FText>
          <FContainer width="351px">
            <FSelect
              :options="[
                {
                  label: 'Different Timing all day',
                  value: 'DIFFERENT_TIMING_ALLDAY',
                },
                { label: 'Same Timing all day', value: 'SAME_TIMING_ALLDAY' },
              ]"
              v-model="customHourType"
              :value="null"
              placeholder="Select"
              :multiple="false"
              :disabled="false"
              allowCreate
              filterable
              :loading="false"
              :addOptionLoading="false"
              size="medium"
            />
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        justifyContent="space-between"
        v-if="
          businessHourType === 'CUSTOM' &&
          customHourType === 'SAME_TIMING_ALLDAY'
        "
      >
        <FContainer
          display="flex"
          width="169px"
          flexDirection="column"
          alignItems="flex-start"
        >
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
            alignSelf="stretch"
          >
            <FContainer>
              <FText alignItems="center" color="textMain">From</FText>
            </FContainer>
            <FContainer>
              <FTimePicker
                v-model="start_time"
                placeholder="Select time"
                :is12Hour="false"
                :interval="30"
                :readOnly="false"
                :disabled="false"
              />
            </FContainer>
          </FContainer>
        </FContainer>

        <FContainer
          display="flex"
          width="168px"
          flexDirection="column"
          alignItems="flex-start"
          marginLeft="containerXxLarge"
        >
          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
            alignSelf="stretch"
          >
            <FContainer>
              <FText alignItems="center" color="textMain">To</FText>
            </FContainer>
            <FContainer>
              <FTimePicker
                v-model="end_time"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>

      <FContainer
        v-if="
          (businessHourType === 'CUSTOM' &&
            customHourType === 'SAME_TIMING_ALLDAY') ||
          businessHourType === 'DAYS_24_5'
        "
        display="flex"
        width="351px"
        flexDirection="column"
        alignItems="flex-start"
      >
        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerMedium"
          alignSelf="stretch"
        >
          <FText alignItems="center" color="textMain">Operating Hours</FText>
          <FContainer>
            <FCheckboxGroup
              alignment="horizontal"
              v-model="operatingDaysList"
              :options="[
                { label: 'Monday', value: 1 },
                { label: 'Tuesday', value: 2 },
                { label: 'Wednesday', value: 3 },
                { label: 'Thursday', value: 4 },
                { label: 'Friday', value: 5 },
                { label: 'Saturday', value: 6 },
                { label: 'Sunday', value: 7 },
              ]"
            ></FCheckboxGroup>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        v-if="
          businessHourType === 'CUSTOM' &&
          customHourType === 'DIFFERENT_TIMING_ALLDAY'
        "
      >
        <FText alignItems="center" color="textMain">Operating Days</FText>
        <FContainer display="flex" flexDirection="column" gap="containerLarge">
          <FContainer display="flex">
            <FContainer width="50%">
              <FCheckbox v-model="mon">Monday</FCheckbox>
            </FContainer>
            <FContainer display="flex" gap="containerLarge">
              <FTimePicker
                v-model="mon_starttime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
              <FTimePicker
                v-model="mon_endtime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
            </FContainer>
          </FContainer>
          <FContainer display="flex">
            <FContainer width="50%">
              <FCheckbox v-model="tues">Tuesday</FCheckbox>
            </FContainer>
            <FContainer display="flex" gap="containerLarge">
              <FTimePicker
                v-model="tue_starttime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
              <FTimePicker
                v-model="tue_endtime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
            </FContainer>
          </FContainer>
          <FContainer display="flex">
            <FContainer width="50%">
              <FCheckbox v-model="wed">Wednesday</FCheckbox>
            </FContainer>
            <FContainer display="flex" gap="containerLarge">
              <FTimePicker
                v-model="wed_starttime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
              <FTimePicker
                v-model="wed_endtime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
            </FContainer>
          </FContainer>

          <FContainer display="flex">
            <FContainer width="50%">
              <FCheckbox v-model="thurs">Thursday</FCheckbox>
            </FContainer>
            <FContainer display="flex" gap="containerLarge">
              <FTimePicker
                v-model="thu_starttime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
              <FTimePicker
                v-model="thu_endtime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
            </FContainer>
          </FContainer>

          <FContainer display="flex">
            <FContainer width="50%">
              <FCheckbox v-model="fri">Friday</FCheckbox>
            </FContainer>
            <FContainer display="flex" gap="containerLarge">
              <FTimePicker
                v-model="fri_starttime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
              <FTimePicker
                v-model="fri_endtime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
            </FContainer>
          </FContainer>

          <FContainer display="flex">
            <FContainer width="50%">
              <FCheckbox v-model="sat">Saturday</FCheckbox>
            </FContainer>
            <FContainer display="flex" gap="containerLarge">
              <FTimePicker
                v-model="sat_starttime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
              <FTimePicker
                v-model="sat_endtime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
            </FContainer>
          </FContainer>

          <FContainer display="flex">
            <FContainer width="50%">
              <FCheckbox v-model="sun">Sunday</FCheckbox>
            </FContainer>
            <FContainer display="flex" gap="containerLarge">
              <FTimePicker
                v-model="sun_starttime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
              <FTimePicker
                v-model="sun_endtime"
                placeholder="Select time"
                :is12Hour="false"
                :showSeconds="false"
              />
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import {
  FContainer,
  FButton,
  FText,
  FModal,
  FInput,
  ftoast,
  FSelect,
  FCheckboxGroup,
  FCheckbox,
  FTimePicker,
} from '@facilio/design-system'
import { API } from '@facilio/api'

export default {
  props: ['businessHour', 'isNew', 'visibility', 'resourceid', 'details'],
  components: {
    FContainer,
    FButton,
    ftoast,
    FText,
    FModal,
    FInput,
    FSelect,
    FCheckboxGroup,
    FTimePicker,
    FCheckbox,
  },
  data() {
    return {
      name: '',
      businessHourType: '',
      customHourType: '',
      start_time: 0,
      end_time: 0,
      same_starttime: 0,
      same_endtime: 0,
      mon_starttime: 0,
      mon_endtime: 0,
      tue_starttime: 0,
      tue_endtime: 0,
      wed_starttime: 0,
      wed_endtime: 0,
      thu_starttime: 0,
      thu_endtime: 0,
      fri_starttime: 0,
      fri_endtime: 0,
      sat_starttime: 0,
      sat_endtime: 0,
      sun_starttime: 0,
      sun_endtime: 0,
      mon: true,
      tues: true,
      wed: true,
      thurs: true,
      fri: true,
      sat: false,
      sun: false,
      operatingDaysList: [],
      singleDaybusinessHoursList: [],
      error: false,
      operatingHourValueSaving: false,
    }
  },
  mounted() {
    this.initOperatingHour()
  },
  methods: {
    setOperatingDaysList() {
      this.operatingDaysList = []
      if (this.mon) this.operatingDaysList.push('1')
      if (this.tues) this.operatingDaysList.push('2')
      if (this.wed) this.operatingDaysList.push('3')
      if (this.thurs) this.operatingDaysList.push('4')
      if (this.fri) this.operatingDaysList.push('5')
      if (this.sat) this.operatingDaysList.push('6')
      if (this.sun) this.operatingDaysList.push('7')
    },
    initOperatingHour() {
      if (this.isNew) {
        this.name = ''
        this.businessHourType = 'DAYS_24_7'
        this.customHourType = 'SAME_TIMING_ALLDAY'
        this.same_starttime = ''
        this.same_endtime = ''
        this.mon_starttime = 0
        this.mon_endtime = 0
        this.tue_starttime = 0
        this.tue_endtime = 0
        this.wed_starttime = 0
        this.wed_endtime = 0
        this.thu_starttime = 0
        this.thu_endtime = 0
        this.fri_starttime = 0
        this.fri_endtime = 0
        this.sat_starttime = 0
        this.sat_endtime = 0
        this.sun_starttime = 0
        this.sun_endtime = 0
        this.operatingDaysList = ['1', '2', '3', '4', '5']
        this.singleDaybusinessHoursList = []
      } else {
        this.name = this.businessHour.value.name
        this.businessHourType = this.businessHour.value.businessHourTypeVal
        this.customHourType = this.businessHour.value.customHourTypeVal
        if (this.customHourType === null) {
          this.customHourType = 'SAME_TIMING_ALLDAY'
        }
        this.singleDaybusinessHoursList =
          this.businessHour.value.singleDaybusinessHoursList
        if (this.businessHourType === 'DAYS_24_7') {
          this.operatingDaysList = ['1', '2', '3', '4', '5']
        }
        for (let i in this.singleDaybusinessHoursList) {
          this.singleDaybusinessHoursList[i].dayOfWeek =
            this.singleDaybusinessHoursList[i].dayOfWeek.toString()
          this.operatingDaysList.push(
            this.singleDaybusinessHoursList[i].dayOfWeek
          )
          if (this.singleDaybusinessHoursList[i].dayOfWeek === '1') {
            this.mon_starttime = this.singleDaybusinessHoursList[i].startTime
            this.mon_endtime = this.singleDaybusinessHoursList[i].endTime
          } else if (this.singleDaybusinessHoursList[i].dayOfWeek === '2') {
            this.tue_starttime = this.singleDaybusinessHoursList[i].startTime
            this.tue_endtime = this.singleDaybusinessHoursList[i].endTime
          } else if (this.singleDaybusinessHoursList[i].dayOfWeek === '3') {
            this.wed_starttime = this.singleDaybusinessHoursList[i].startTime
            this.wed_endtime = this.singleDaybusinessHoursList[i].endTime
          } else if (this.singleDaybusinessHoursList[i].dayOfWeek === '4') {
            this.thu_starttime = this.singleDaybusinessHoursList[i].startTime
            this.thu_endtime = this.singleDaybusinessHoursList[i].endTime
          } else if (this.singleDaybusinessHoursList[i].dayOfWeek === '5') {
            this.fri_starttime = this.singleDaybusinessHoursList[i].startTime
            this.fri_endtime = this.singleDaybusinessHoursList[i].endTime
          } else if (this.singleDaybusinessHoursList[i].dayOfWeek === '6') {
            this.sat_starttime = this.singleDaybusinessHoursList[i].startTime
            this.sat_endtime = this.singleDaybusinessHoursList[i].endTime
          } else if (this.singleDaybusinessHoursList[i].dayOfWeek === '7') {
            this.sun_starttime = this.singleDaybusinessHoursList[i].startTime
            this.sun_endtime = this.singleDaybusinessHoursList[i].endTime
          }
        }
        if (
          this.businessHourType === 'CUSTOM' &&
          this.customHourType === 'SAME_TIMING_ALLDAY' &&
          this.singleDaybusinessHoursList.length > 0
        ) {
          this.same_starttime = this.singleDaybusinessHoursList[0].startTime
          this.same_endtime = this.singleDaybusinessHoursList[0].endTime
        }
      }
    },
    validation() {
      this.error = false
      if (this.name === null || this.name === '') {
        ftoast.critical(
          this.$t('aaset.oph.validation.name', 'Please enter name', {
            ns: 'asset',
          })
        )
        this.error = true
        return false
      } else if (
        this.businessHourType === 'DAYS_24_5' &&
        this.operatingDaysList.length != 5
      ) {
        ftoast.critical(
          this.$t(
            'aaset.oph.validation.count',
            'please specify 5 operating days',
            {
              ns: 'asset',
            }
          )
        )
        this.error = true
        return false
      } else if (
        this.businessHourType === 'CUSTOM' &&
        this.customHourType === 'SAME_TIMING_ALLDAY' &&
        (this.start_time === null ||
          this.start_time === '' ||
          this.end_time === null ||
          this.end_time === '')
      ) {
        ftoast.critical(
          this.$t(
            'aaset.oph.validation.same_time',
            'Please provide a valid time range',
            {
              ns: 'asset',
            }
          )
        )
        this.error = true
        return false
      } else if (
        this.businessHourType === 'CUSTOM' &&
        this.customHourType === 'DIFFERENT_TIMING_ALLDAY' &&
        ((this.operatingDaysList.indexOf('1') > -1 &&
          (this.mon_starttime === null ||
            this.mon_starttime === '' ||
            this.mon_endtime === null ||
            this.mon_endtime === '')) ||
          (this.operatingDaysList.indexOf('2') > -1 &&
            (this.tue_starttime === null ||
              this.tue_starttime === '' ||
              this.tue_endtime === null ||
              this.tue_endtime === '')) ||
          (this.operatingDaysList.indexOf('3') > -1 &&
            (this.wed_starttime === null ||
              this.wed_starttime === '' ||
              this.wed_endtime === null ||
              this.wed_endtime === '')) ||
          (this.operatingDaysList.indexOf('4') > -1 &&
            (this.thu_starttime === null ||
              this.thu_starttime === '' ||
              this.thu_endtime === null ||
              this.thu_endtime === '')) ||
          (this.operatingDaysList.indexOf('5') > -1 &&
            (this.fri_starttime === null ||
              this.fri_starttime === '' ||
              this.fri_endtime === null ||
              this.fri_endtime === '')) ||
          (this.operatingDaysList.indexOf('6') > -1 &&
            (this.sat_starttime === null ||
              this.sat_starttime === '' ||
              this.sat_endtime === null ||
              this.sat_endtime === '')) ||
          (this.operatingDaysList.indexOf('7') > -1 &&
            (this.sun_starttime === null ||
              this.sun_starttime === '' ||
              this.sun_endtime === null ||
              this.sun_endtime === '')))
      ) {
        ftoast.critical(
          this.$t(
            'aaset.oph.validation.diff_time',
            'Please provide a valid time range for each chosen operating day',
            {
              ns: 'asset',
            }
          )
        )
        this.error = true
        return false
      } else {
        this.error = false
      }
    },
    addOperatingHour() {
      this.validation()
      if (this.error) {
        return
      }
      this.preparingDatasToSave()
      let resourceid = this.details.id
      let businessHour = {
        name: this.name,
        businessHourType: this.businessHourType,
        customHourType: this.customHourType,
        singleDaybusinessHoursList: this.singleDaybusinessHoursList,
      }
      API.post('/v2/businesshours/add', { businessHour, resourceid })
        .then(response => {
          businessHour.businessHourTypeVal = businessHour.businessHourType
          businessHour.customHourTypeVal = businessHour.customHourType
          businessHour.id = response.data.result.businessHour.id
          if (resourceid !== undefined) {
            this.$emit('businessHourChange', businessHour)
          } else {
            this.$emit('add', businessHour)
          }
          this.$emit('update:visibility', false)
        })
        .catch(() => {
          this.$emit('update:visibility', false)
        })
    },
    editOperatingHour() {
      this.validation()
      if (this.error) {
        return
      }
      this.preparingDatasToSave()
      let businessHour = Object.assign({}, this.businessHour.value)
      businessHour.name = this.name
      businessHour.businessHourType = this.businessHourType
      businessHour.customHourType = this.customHourType
      businessHour.businessHourTypeVal = businessHour.businessHourType
      businessHour.customHourTypeVal = businessHour.customHourType
      businessHour.singleDaybusinessHoursList = this.singleDaybusinessHoursList
      API.post('/v2/businesshours/edit', { businessHour })
        .then(() => {
          this.$emit('edit', businessHour)
          this.$emit('update:visibility', false)
        })
        .catch(() => {
          this.$emit('update:visibility', false)
        })
    },
    saveOperatingHour() {
      if (
        this.businessHourType === 'CUSTOM' &&
        this.customHourType === 'DIFFERENT_TIMING_ALLDAY'
      ) {
        this.setOperatingDaysList()
      }

      if (this.isNew) {
        this.addOperatingHour()
      } else {
        this.editOperatingHour()
      }
    },
    closeDialog() {
      this.$emit('close')
      this.$emit('update:visibility', false)
    },
    clearDifferentTimingValues() {
      this.mon_starttime = null
      this.mon_endtime = null
      this.tue_starttime = null
      this.tue_endtime = null
      this.wed_starttime = null
      this.wed_endtime = null
      this.thu_starttime = null
      this.thu_endtime = null
      this.fri_starttime = null
      this.fri_endtime = null
      this.sat_starttime = null
      this.sat_endtime = null
      this.sun_starttime = null
      this.sun_endtime = null
    },
    convertMillisecondsToTime(milliseconds) {
      const date = new Date(milliseconds)
      const hours = date.getUTCHours().toString().padStart(2, '0')
      const minutes = date.getUTCMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    preparingDatasToSave() {
      if (this.businessHourType === 'DAYS_24_7') {
        this.customHourType = null
        this.same_starttime = null
        this.same_endtime = null
        this.operatingDaysList = null
        this.clearDifferentTimingValues()
        this.singleDaybusinessHoursList = null
      } else if (this.businessHourType === 'DAYS_24_5') {
        this.customHourType = null
        this.same_starttime = null
        this.same_endtime = null
        this.clearDifferentTimingValues()
        this.singleDaybusinessHoursList = []
        for (let i in this.operatingDaysList) {
          let singleDayBusinessHour = {
            dayOfWeek: '',
            startTime: '',
            endTime: '',
          }
          singleDayBusinessHour.dayOfWeek = this.operatingDaysList[i]
          this.singleDaybusinessHoursList.push(singleDayBusinessHour)
        }
      } else if (this.businessHourType === 'CUSTOM') {
        if (this.customHourType === 'SAME_TIMING_ALLDAY') {
          this.same_starttime = this.convertMillisecondsToTime(this.start_time)
          this.same_endtime = this.convertMillisecondsToTime(this.end_time)
          this.mon_starttime = this.same_starttime
          this.mon_endtime = this.same_endtime
          this.tue_starttime = this.same_starttime
          this.tue_endtime = this.same_endtime
          this.wed_starttime = this.same_starttime
          this.wed_endtime = this.same_endtime
          this.thu_starttime = this.same_starttime
          this.thu_endtime = this.same_endtime
          this.fri_starttime = this.same_starttime
          this.fri_endtime = this.same_endtime
          this.sat_starttime = this.same_starttime
          this.sat_endtime = this.same_endtime
          this.sun_starttime = this.same_starttime
          this.sun_endtime = this.same_endtime
        } else {
          this.same_starttime = null
          this.same_endtime = null
          this.mon_starttime = this.convertMillisecondsToTime(
            this.mon_starttime
          )
          this.mon_endtime = this.convertMillisecondsToTime(this.mon_endtime)
          this.tue_starttime = this.convertMillisecondsToTime(
            this.tue_starttime
          )
          this.tue_endtime = this.convertMillisecondsToTime(this.tue_endtime)
          this.wed_starttime = this.convertMillisecondsToTime(
            this.wed_starttime
          )
          this.wed_endtime = this.convertMillisecondsToTime(this.wed_endtime)
          this.thu_starttime = this.convertMillisecondsToTime(
            this.thu_starttime
          )
          this.thu_endtime = this.convertMillisecondsToTime(this.thu_endtime)
          this.fri_starttime = this.convertMillisecondsToTime(
            this.fri_starttime
          )
          this.fri_endtime = this.convertMillisecondsToTime(this.fri_endtime)
          this.sat_starttime = this.convertMillisecondsToTime(
            this.sat_starttime
          )
          this.sat_endtime = this.convertMillisecondsToTime(this.sat_endtime)
          this.sun_starttime = this.convertMillisecondsToTime(
            this.sun_starttime
          )
          this.sun_endtime = this.convertMillisecondsToTime(this.sun_endtime)
        }
        this.singleDaybusinessHoursList = []
        for (let j in this.operatingDaysList) {
          let singleDayBusinessHours = {
            dayOfWeek: '',
            startTime: '',
            endTime: '',
          }
          singleDayBusinessHours.dayOfWeek = this.operatingDaysList[j]
          singleDayBusinessHours.startTime = this.getTimeByDayOfWeek(
            'start',
            singleDayBusinessHours.dayOfWeek
          )
          singleDayBusinessHours.endTime = this.getTimeByDayOfWeek(
            'end',
            singleDayBusinessHours.dayOfWeek
          )
          this.singleDaybusinessHoursList.push(singleDayBusinessHours)
        }
      }
    },
    getTimeByDayOfWeek(type, dayofweek) {
      if (type === 'start') {
        if (dayofweek === '1') {
          return this.mon_starttime
        } else if (dayofweek === '2') {
          return this.tue_starttime
        } else if (dayofweek === '3') {
          return this.wed_starttime
        } else if (dayofweek === '4') {
          return this.thu_starttime
        } else if (dayofweek === '5') {
          return this.fri_starttime
        } else if (dayofweek === '6') {
          return this.sat_starttime
        } else if (dayofweek === '7') {
          return this.sun_starttime
        }
      } else if (type === 'end') {
        if (dayofweek === '1') {
          return this.mon_endtime
        } else if (dayofweek === '2') {
          return this.tue_endtime
        } else if (dayofweek === '3') {
          return this.wed_endtime
        } else if (dayofweek === '4') {
          return this.thu_endtime
        } else if (dayofweek === '5') {
          return this.fri_endtime
        } else if (dayofweek === '6') {
          return this.sat_endtime
        } else if (dayofweek === '7') {
          return this.sun_endtime
        }
      }
    },
  },
}
</script>
