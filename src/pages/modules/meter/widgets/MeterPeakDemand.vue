<template>
  <FContainer class="h-full">
    <portal :to="`title-${widget.id}-${widget.name}`">
      <FText margin="containerXLarge" appearance="headingMed14">{{
        getTitle
      }}</FText>
    </portal>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      class="h-full"
    >
      <FSpinner :show="isLoading" :size="30" />
    </FContainer>
    <FContainer v-else>
      <FContainer paddingBottom="containerLarge" marginTop="containerXxLarge">
      <FText marginLeft="containerXxLarge" color="textMain" appearance="headingMed16">{{
        getThisYearPeakDemand
      }}</FText>
      <FContainer
        float="right"
        tag="span"
        v-if="isDiff"
        marginRight="containerMedium"
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
    <FContainer paddingBottom="containerLarge">
      <FText v-if="isThisPeakAvailable" marginLeft="containerXxLarge" color="textDescription" appearance="captionMed12">{{
        constructThisYearPeakTimeMessage
      }}</FText>
    </FContainer>
    <FContainer v-if="isPreviousPeakAvailable" marginTop="containerXLarge">
      <FText marginLeft="containerXxLarge" paddingRight="containerXLarge" color="textMain" appearance="bodyReg14">
        {{ lastYearPeakDemandVal }}
      </FText>
      <FText v-if="isLastPeakAvailable" color="textDescription" appearance="captionMed12">{{
        constructLastYearPeakTimeMessage
      }}</FText>
    </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { FContainer, FSpinner, FText, ftoast, FIcon } from '@facilio/design-system'
import getProperty from 'dlv'
import { loadMeterReadingFields } from './meter-util'

export default {
  props: ['details', 'widget'],
  components: { FContainer, FSpinner, FText, FIcon },
  data() {
    return {
      isLoading: false,
      thisYearPeakDemand: 0,
      thisYearPeakTime: '',
      lastYearPeakDemand: 0,
      lastYearPeakTime: '',
      percentVal: 0,
      scale: 0,
      readingName: '',
      widgetName: '',
      readingList: [],
    }
  },
  created() {
    this.loadPeakDemand()
    this.getAllMeterReadings()
  },
  computed: {
    getThisYearPeakDemand() {
      let { getUnit } = this
      let thisYearPeakDemand = getProperty(this, 'thisYearPeakDemand', 'N/A') || 'N/A'
      return thisYearPeakDemand == 'N/A' ? thisYearPeakDemand : `${thisYearPeakDemand} ${getUnit}`
    },
    lastYearPeakDemandVal() {
      let { getUnit } = this
      let lastYearPeakDemand = getProperty(this, 'lastYearPeakDemand', 'N/A') || 'N/A'
      return lastYearPeakDemand == 'N/A' ? lastYearPeakDemand : `${lastYearPeakDemand} ${getUnit}`
    },
    isReadingAdded() {
      let { peakTime } = this
      return !isEmpty(peakTime)
    },
    getUnit() {
      let { readingName, readingList } = this
      let reading = readingList.find(reading => reading.name === readingName)
      return !isEmpty(reading) ? getProperty(reading, 'unit', '') : ''
    },
    getTitle() {
      let { widgetName } = this
      return !isEmpty(widgetName) ? widgetName : ''
    },
    constructThisYearPeakTimeMessage() {
      let { thisYearPeakTime } = this
      let message = `at ${thisYearPeakTime}`
      return message
    },
    constructLastYearPeakTimeMessage() {
      let { lastYearPeakTime } = this
      let message = `at ${lastYearPeakTime}`
      return message
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
      if(this.isDiff) {
        return this.percentVal.toFixed(0) + '%'
      }
    },
    isThisPeakAvailable() {
      let { thisYearPeakTime } = this
      return !isEmpty(thisYearPeakTime)
    },
    isLastPeakAvailable() {
      let { lastYearPeakTime } = this
      return !isEmpty(lastYearPeakTime)
    },
    isPreviousPeakAvailable() {
      let { lastYearPeakDemandVal } = this
      return lastYearPeakDemandVal !== 'N/A'
    },
  },
  methods: {
    async loadPeakDemand() {
      this.isLoading = true
      let meterId = getProperty(this, 'details.id')
      let utilityTypeModuleName = getProperty(this, 'details.utilityTypeModuleName')

      let params = {
        id: meterId,
        utilityTypeModuleName,
      }

      let { data, error } = await API.get(
        '/v3/meterConsumption/peak',
        params
      )
      if (data) {
        let thisYearPeakVal = getProperty(data, 'peakDemand', 'N/A')
        let lastYearPeakVal = getProperty(data, 'lastYearPeakDemand', 'N/A')
        let thisYearPeakTime = getProperty(data, 'peakTime', null)
        let lastYearPeakTime = getProperty(data, 'lastYearPeakTime', null)
        let percentVal = getProperty(data, 'percentDifference', 0)
        let scale = getProperty(data, 'scale', 0)
        let name = getProperty(data, 'readingName', '')
        let title = getProperty(data, 'widgetName', '')
        this.thisYearPeakDemand = thisYearPeakVal
        this.lastYearPeakDemand = lastYearPeakVal
        this.thisYearPeakTime = thisYearPeakTime
        this.lastYearPeakTime = lastYearPeakTime
        this.percentVal = percentVal
        this.scale = scale
        this.readingName = name
        this.widgetName = title
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
