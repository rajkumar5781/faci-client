<template>
  <FContainer>
    <FTable
      :columns="columns"
      :data="details.readings"
      hideBorder
      :showSelect="false"
    >
      <template #[`cell.readingId`]="{ row }">
        <FText color="textMain" appearance="bodyReg14">{{
          getReadingId(row)
        }}</FText>
      </template>
      <template #[`cell.name`]="{ row }">
        <FTooltip>
          <template slot="title">{{ getReadingName(row) }}</template>
          <FText color="textMain" appearance="bodyReg14">{{
            getReadingName(row)
          }}</FText>
        </FTooltip>
      </template>
      <template #[`cell.type`]="{ row }">
        <FText color="textMain" appearance="bodyReg14">{{
          getReadingDataType(row)
        }}</FText>
      </template>
      <template #[`cell.interval`]="{ row }">
        <FText color="textMain" appearance="bodyReg14">{{
          getInterval(row)
        }}</FText>
      </template>
      <template #[`cell.unit`]="{ row }">
        <FText color="textMain" appearance="bodyReg14">{{
          getUnit(row)
        }}</FText>
      </template>
      <template #[`cell.status`]="{ row }">
        <FSwitch v-model="row.status" @change="changeStatus(row)" :disabled="!isReadingStatusChangeAllowed"/>
      </template>
    </FTable>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import {
  FTable,
  FContainer,
  FSwitch,
  FText,
  FTooltip,
  ftoast,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { loadMeterReadingFields } from '../../meter/widgets/meter-util'
import Constants from '../../../../utils/constants'

const getFreqInterval = freq => {
  const frequencies = {
    1: '1 Min',
    2: '2 Mins',
    3: '3 Mins',
    4: '4 Mins',
    5: '5 Mins',
    6: '10 Mins',
    7: '15 Mins',
    8: '20 Mins',
    9: '30 Mins',
    10: '1 Hr',
    11: '2 Hr',
    12: '3 Hr',
    13: '4 Hr',
    14: '8 Hr',
    15: '12 Hr',
    16: '1 Day',
  }
  return getProperty(frequencies, `${freq}`, '---')
}

export default {
  props: ['details', 'widget'],
  components: {
    FTable,
    FContainer,
    FSwitch,
    FText,
    FTooltip,
  },
  data() {
    return {
      isLoading: false,
      status: true,
      readingList: [],
    }
  },
  async created() {
    await this.getAllMeterReadings()
  },
  computed: {
    columns() {
      return [
        {
          displayName: this.$t('id', { ns: 'energy' }),
          name: 'readingId',
          id: 1,
        },
        {
          displayName: this.$t('reading_name', { ns: 'energy' }),
          name: 'name',
          id: 2,
        },
        { displayName: this.$t('type', { ns: 'energy' }), name: 'type', id: 3 },
        {
          displayName: this.$t('interval', { ns: 'energy' }),
          name: 'interval',
          id: 4,
        },
        { displayName: this.$t('unit', { ns: 'energy' }), name: 'unit', id: 5 },
        {
          displayName: this.$t('status', { ns: 'energy' }),
          name: 'status',
          id: 6,
          type: 'status',
        },
      ]
    },
    isReadingStatusChangeAllowed() {
      let { details } = this
      let vmTemplateStatusEnum = getProperty(details, 'vmTemplateStatusEnum')
      return vmTemplateStatusEnum !== 'UN_PUBLISHED'
    },
  },
  methods: {
    getReadingId(reading) {
      let id = getProperty(reading, 'readingFieldId', '---')
      return `#${id}`
    },
    getReadingName(reading) {
      let { readingList = [] } = this
      let readingId = getProperty(reading, 'readingFieldId')
      let readngData =
        readingList.find(readings => readings.id === readingId) || {}

      return getProperty(readngData, 'displayName', '---')
    },
    async changeStatus(reading) {
      let recordId = getProperty(reading, 'id')
      let response = {}
      if (!isEmpty(recordId)) {
        response = await API.updateRecord('virtualMeterTemplateReading', {
          id: recordId,
          data: reading,
        })
        let { error } = response || {}
        if (!error) {
          ftoast.success(
            this.$t('meter.vmTemplate.reading_status_updated', { ns: 'energy' })
          )
        } else {
          ftoast.critical(error?.message || this.$t('error_occurred'))
        }
      }
    },
    getInterval(reading) {
      let frequency = getProperty(reading, 'frequency')
      return getFreqInterval(frequency)
    },
    getReadingDataType(reading) {
      let { readingList } = this
      let id = getProperty(reading, 'readingFieldId')
      let readingData = readingList.find(readings => readings.id === id) || {}
      let counterField = getProperty(readingData, 'counterField', null)
      let dataType = getProperty(readingData, 'dataType', null)

      return counterField ? 'Counter' : Constants.DATATYPE[dataType]
    },
    getUnit(reading) {
      let { readingList } = this
      let id = getProperty(reading, 'readingFieldId')
      let readingData = readingList.find(readings => readings.id === id) || {}
      let unit = getProperty(readingData, 'unit', '---')

      return unit
    },
    async getAllMeterReadings() {
      let { details } = this
      let { moduleName } = details || {}
      let utilityTypeId = getProperty(details, 'utilityType.id')
      let readings = await loadMeterReadingFields(
        null,
        utilityTypeId,
        false,
        null,
        true,
        moduleName
      )
      this.readingList = readings || []
    },
  },
}
</script>
