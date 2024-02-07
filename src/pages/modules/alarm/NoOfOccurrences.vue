<template>
  <FContainer
    v-if="loading"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <FSpinner :size="30" />
  </FContainer>
  <FContainer
    v-else
    padding="containerNone sectionSmall"
    display="flex"
    flexDirection="row"
    alignItems="center"
    justifyContent="space-between"
  >
    <FContainer display="flex" flexDirection="row">
      <FContainer
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
        width="137px"
        padding="containerLarge containerNone containerXLarge containerNone"
        display="flex"
        flexDirection="column"
      >
        <FText
          color="textMain"
          appearance="headingMed20"
          flexDirection="column"
          paddingBottom="containerMedium"
          display="inherit"
          alignItems="center"
        >
          {{ metrics.thisMonthData }}
        </FText>
        <FText
          color="textMain"
          appearance="bodyReg14"
          flexDirection="column"
          display="inherit"
          alignItems="center"
          >{{ $t('alarm.this_month', 'This month', { ns: 'alarm' }) }}</FText
        >
      </FContainer>
      <FContainer
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
        marginLeft="containerXxLarge"
        width="137px"
        padding="containerLarge containerNone containerXLarge containerNone"
        display="flex"
        flexDirection="column"
      >
        <FText
          color="textMain"
          appearance="headingMed20"
          flexDirection="column"
          paddingBottom="containerMedium"
          display="inherit"
          alignItems="center"
        >
          {{ metrics.lastMonthData }}
        </FText>
        <FText
          color="textMain"
          appearance="bodyReg14"
          flexDirection="column"
          display="inherit"
          alignItems="center"
          >{{ $t('alarm.last_month', 'Last month', { ns: 'alarm' }) }}</FText
        >
      </FContainer>
    </FContainer>
    <FContainer
      tag="span"
      v-if="displayPercentage"
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
        {{ percent }}
      </FText>
    </FContainer>
  </FContainer>
</template>
<script>
import NewAlarmMixin from './mixins/NewAlarmMixin'
import {
  FContainer,
  FText,
  FTags,
  FSpinner,
  FIcon,
} from '@facilio/design-system'
export default {
  mixins: [NewAlarmMixin],
  components: {
    FContainer,
    FText,
    FTags,
    FSpinner,
    FIcon,
  },
  props: ['details', 'moduleName'],
  data() {
    return {
      cardId: '1',
      loading: false,
      metrics: { lastMonthData: 0, thisMonthData: 0 },
    }
  },
  computed: {
    displayPercentage() {
      let { metrics } = this
      let { lastMonthData, thisMonthData } = metrics || {}
      return lastMonthData === 0 ? false : thisMonthData === 0 ? false : true
    },
    scale() {
      let { metrics } = this
      let { lastMonthData, thisMonthData } = metrics || {}
      return lastMonthData < thisMonthData
    },
    backgroundColor() {
      let { scale } = this
      return scale
        ? 'backgroundSemanticRedSubtle'
        : 'backgroundSemanticGreenLight'
    },
    percent() {
      if (!this.displayPercentage) return '0 %'
      else {
        let { metrics } = this
        let { lastMonthData, thisMonthData } = metrics || {}
        let percentage = 0
        if (thisMonthData !== 0) {
          percentage =
            (Math.abs(thisMonthData - lastMonthData) / lastMonthData) * 100
        }
        return Number.isInteger(percentage)
          ? percentage + '%'
          : percentage.toFixed(2) + '%'
      }
    },
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      if (this.details) {
        this.loading = true
        this.loadMeanMetrics()
          .then(response => {
            if (response) {
              let { noOfOcc, noOfOccLastMonth } = response || {}
              this.metrics.thisMonthData = noOfOcc
              this.metrics.lastMonthData = noOfOccLastMonth
            }
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
  },
}
</script>
