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
        >{{ getThisMonthConsumption }}</FText
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
        {{ $t('meter.last_month', { ns: 'energy' }) }}
      </FText>
      <FText
        color="textDescription"
        appearance="bodyReg14"
        marginLeft="containerXxLarge"
        marginTop="containerLarge"
        >{{ getLastMonthConsumption }}</FText
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
  FIcon,
  ftoast,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { loadMeterReadingFields } from './meter-util'

export default {
  props: ['details'],
  components: { FContainer, FSpinner, FText, FTags, FIcon },
  data() {
    return {
      isLoading: false,
      thisMonthConsumption: 0,
      lastMonthConsumption: 0,
      percentVal: 0,
      scale: 0,
      readingName: '',
      readingList: [],
    }
  },
  created() {
    this.loadMonthlyConsumption()
    this.getAllMeterReadings()
  },
  computed: {
    getThisMonthConsumption() {
      let thisMonthConsumption =
        getProperty(this, 'thisMonthConsumption', 'N/A') || 'N/A'
      return thisMonthConsumption == 'N/A'
        ? thisMonthConsumption
        : thisMonthConsumption + ' ' + this.getUnit
    },
    getLastMonthConsumption() {
      let lastMonthConsumption =
        getProperty(this, 'lastMonthConsumption', 'N/A') || 'N/A'
      return lastMonthConsumption == 'N/A'
        ? lastMonthConsumption
        : lastMonthConsumption + ' ' + this.getUnit
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
    getUnit() {
      let { readingName, readingList } = this
      let reading = readingList.find(reading => reading.name === readingName)
      return !isEmpty(reading) ? getProperty(reading, 'unit', '') : ''
    },
    getPercentage() {
      if (this.isDiff) {
        return this.percentVal.toFixed(0) + '%'
      }
    },
  },
  methods: {
    async loadMonthlyConsumption() {
      this.isLoading = true
      let meterId = getProperty(this, 'details.id')
      let utilityTypeModuleName = getProperty(this, 'details.utilityTypeModuleName')

      let params = {
        id: meterId,
        utilityTypeModuleName,
      }

      let { data, error } = await API.get(
        '/v3/meterConsumption/monthlyConsumption',
        params
      )
      if (data) {
        let thisMonthVal = getProperty(data, 'thisMonthConsumption', 'N/A')
        let lastMonthVal = getProperty(data, 'lastMonthConsumption', 'N/A')
        let percentVal = getProperty(data, 'percentDifference', 0)
        let scale = getProperty(data, 'scale', 0)
        let name = getProperty(data, 'readingName', '')
        this.thisMonthConsumption = thisMonthVal
        this.lastMonthConsumption = lastMonthVal
        this.percentVal = percentVal
        this.scale = scale
        this.readingName = name
      } else if (error) {
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
