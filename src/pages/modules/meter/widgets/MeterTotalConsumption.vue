<template>
  <FContainer
    v-if="isLoading"
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100%"
  >
    <FSpinner :show="isLoading" :size="30" />
  </FContainer>
  <FContainer v-else>
    <FContainer paddingBottom="containerXxLarge" marginTop="containerXxLarge">
      <FText
        marginLeft="containerXxLarge"
        color="textMain"
        appearance="headingMed16"
        >{{ getThisYearConsumption }}</FText
      >
      <FContainer
        tag="span"
        v-if="isDiff"
        marginLeft="containerXLarge"
        paddingLeft="containerMedium"
        paddingRight="containerMedium"
        paddingBottom="containerSmall"
        borderRadius="medium"
        :backgroundColor="backgroundColor"
      >
        <FIcon
          v-if="scale"
          group="navigation"
          name="up-triangle-filled"
          size="12"
          color="borderSemanticRedLight"
        ></FIcon>
        <FIcon
          v-else
          group="navigation"
          name="down-triangle-filled"
          size="12"
          color="borderSemanticGreenMedium"
        ></FIcon>
        <FText appearance="captionReg12">
          {{ getPercentage }}
        </FText></FContainer
      >
    </FContainer>
    <FContainer
      marginTop="containerXLarge"
      display="flex"
      flexDirection="column"
    >
      <FText
        marginLeft="containerXxLarge"
        paddingRight="containerXLarge"
        color="textMain"
        appearance="captionMed12"
      >
        {{ $t('meter.last_year', { ns: 'energy' }) }}
      </FText>
      <FText
        color="textDescription"
        appearance="bodyReg14"
        marginLeft="containerXxLarge"
        marginTop="containerLarge"
        >{{ getLastYearConsumption }}</FText
      >
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import {
  FContainer,
  FSpinner,
  FText,
  FTags,
  ftoast,
  FIcon,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { loadMeterReadingFields } from './meter-util'

export default {
  props: ['details'],
  components: { FContainer, FSpinner, FText, FTags, FIcon },
  data() {
    return {
      isLoading: false,
      thisYearConsumption: 0,
      lastYearConsumption: 0,
      percentVal: 0,
      scale: 0,
      readingName: '',
      readingList: [],
    }
  },
  created() {
    this.loadTotalConsumption()
    this.getAllMeterReadings()
  },
  computed: {
    getThisYearConsumption() {
      let thisYearConsumption =
        getProperty(this, 'thisYearConsumption', 'N/A') || 'N/A'
      return thisYearConsumption == 'N/A'
        ? thisYearConsumption
        : thisYearConsumption + ' ' + this.getUnit
    },
    getUnit() {
      let { readingName, readingList } = this
      let reading = (readingList || []).find(
        reading => reading.name === readingName
      )
      return !isEmpty(reading) ? getProperty(reading, 'unit', '') : ''
    },
    getLastYearConsumption() {
      let lastYearConsumption =
        getProperty(this, 'lastYearConsumption', 'N/A') || 'N/A'
      return lastYearConsumption == 'N/A'
        ? lastYearConsumption
        : lastYearConsumption + ' ' + this.getUnit
    },
    backgroundColor() {
      let { scale } = this
      return scale
        ? 'backgroundSemanticRedSubtle'
        : 'backgroundSemanticGreenLight'
    },
    isDiff() {
      let { percentVal } = this
      return !isEmpty(percentVal) && percentVal != 0
    },
    getPercentage() {
      if (this.isDiff) {
        return this.percentVal.toFixed(0) + '%'
      }
    },
  },
  methods: {
    async loadTotalConsumption() {
      this.isLoading = true
      let meterId = getProperty(this, 'details.id')
      let utilityTypeModuleName = getProperty(this, 'details.utilityTypeModuleName')

      let params = {
        id: meterId,
        utilityTypeModuleName,
      }

      let { data, error } = await API.get(
        '/v3/meterConsumption/yearlyConsumption',
        params
      )
      if (data) {
        let thisYearVal = getProperty(data, 'totalConsumption', 'N/A')
        let lastYearVal = getProperty(data, 'lastYearConsumption', 'N/A')
        let percentVal = getProperty(data, 'percentDifference', 0)
        let scale = getProperty(data, 'scale', 0)
        let name = getProperty(data, 'readingName', '')
        this.thisYearConsumption = thisYearVal
        this.lastYearConsumption = lastYearVal
        this.percentVal = percentVal
        this.scale = scale
        this.readingName = name
      } else {
        ftoast.critical(error?.message || this.$t('error_occurred'))
      }
      this.isLoading = false
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
