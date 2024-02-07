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
    padding="sectionSmall"
    display="flex"
    flexDirection="row"
    alignItems="center"
    justifyContent="space-between"
  >
    <FContainer display="flex" flexDirection="row">
      <FContainer
        borderRadius="high"
        minWidth="145px"
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
        >
          {{ stats.thisMonthData }}
        </FText>
        <FText
          color="textCaption"
          appearance="captionReg12"
          flexDirection="column"
          display="inherit"
          >{{ $t('alarm.this_month', 'This month', { ns: 'alarm' }) }}</FText
        >
      </FContainer>
      <FContainer
        borderRadius="high"
        minWidth="145px"
        marginLeft="containerXxLarge"
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
        >
          {{ stats.lastMonthData }}
        </FText>
        <FText
          color="textCaption"
          appearance="captionReg12"
          flexDirection="column"
          display="inherit"
          >{{ $t('alarm.last_month', 'Last month', { ns: 'alarm' }) }}</FText
        >
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import NewAlarmMixin from './mixins/NewAlarmMixin'
import { FContainer, FText, FSpinner, FTags } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
export default {
  props: ['isMttc', 'details', 'moduleName', 'cardId'],
  mixins: [NewAlarmMixin],
  components: {
    FContainer,
    FText,
    FSpinner,
    FTags,
  },
  data() {
    return {
      metrics: {},
      loading: false,
    }
  },
  watch: {
    details: {
      handler(value, oldValue) {
        let { id } = value
        let { id: oldId = null } = oldValue || {}
        if (id !== oldId) this.loadData()
      },
      immediate: true,
    },
  },
  mounted() {
    this.loadData()
  },
  computed: {
    stats() {
      if (isEmpty(this.metrics)) {
        return {
          thisMonthData: '0 Hrs',
          lastMonthData: '0 Hrs',
        }
      }
      return Object.entries(this.metrics).reduce((result, [key, value]) => {
        let monthDuration = this.getDuration(value, 'seconds')
        result[key] = Object.keys(monthDuration)
          .map(duration => `${monthDuration[duration]} ${duration}`)
          .join(' : ')
        return result
      }, {})
    },
    getTrendClass() {
      let { metrics } = this
      let { lastMonthData, thisMonthData } = metrics || {}
      if (lastMonthData > thisMonthData) return 'danger'
      return 'success'
    },
    displayPercentage() {
      let { metrics } = this
      if (!isEmpty(metrics)) {
        let { lastMonthData, thisMonthData } = metrics || {}
        return lastMonthData === 0 ? false : thisMonthData === 0 ? false : true
      }
      return false
    },
    percent() {
      if (this.displayPercentage) {
        let { metrics } = this
        let { lastMonthData, thisMonthData } = metrics
        let percentage =
          (thisMonthData > lastMonthData
            ? parseFloat(thisMonthData) / parseFloat(lastMonthData)
            : parseFloat(lastMonthData) / parseFloat(thisMonthData)) *
            100 -
          100
        return Number.isInteger(percentage)
          ? percentage + '%'
          : percentage.toFixed(2) + '%'
      }
      return 0
    },
  },
  methods: {
    loadData() {
      if (this.details) {
        this.loading = true
        this.loadMeanMetrics()
          .then(response => {
            if (response) {
              if (this.isMttc) {
                this.metrics = {
                  thisMonthData: response.mttc,
                  lastMonthData: response.mttcLastMonth,
                }
              } else {
                this.metrics = {
                  thisMonthData: response.mtba,
                  lastMonthData: response.mtbaLastMonth,
                }
              }
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
