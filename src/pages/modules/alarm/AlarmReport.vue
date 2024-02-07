<template>
  <FContainer display="flex" flexDirection="column">
    <FContainer
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      padding="containerXxLarge containerNone"
    >
      <portal :to="`action-${widget.id}-${widget.name}`">
        <FTimelineFilter
          v-model="datePickerValue"
          :dateType="dateType"
          :timeZone="$account.timezone"
        ></FTimelineFilter>
      </portal>
      <FSpinner v-if="isLoading" :size="30" />
      <ReportPreview
        v-else
        :reportParams="reportParams"
        :initTimeFilter="initTimeFilter"
        :visualizationProps="visualizationProps"
        :hideReportType="true"
        :hideTimeLineFilter="true"
        :measureProps="measureProps"
        :style="getChartStyles"
        @setHeight="setHeight"
      ></ReportPreview>
    </FContainer>
    <FContainer
      v-if="hasPossibleCauses || hasRecommendation"
      paddingTop="containerXxLarge"
      ref="cause-and-recommendation"
    >
      <FDivider width="100%" />
      <FContainer padding="containerXxLarge">
        <FContainer v-if="hasPossibleCauses">
          <FText appearance="captionMed12">{{
            $t('alarm.possible_causes', 'POSSIBLE CAUSES', {
              ns: 'alarm',
            })
          }}</FText>
          <FContainer paddingLeft="containerLarge">
            <FContainer
              paddingTop="containerLarge"
              v-for="(possibleCause, index) in possibleCauses"
              :key="index"
            >
              <li>
                <FText appearance="captionReg12">{{ possibleCause }}</FText>
              </li>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer
          v-if="hasRecommendation"
          :paddingTop="hasPossibleCauses ? 'containerXxLarge' : 'containerNone'"
          :marginTop="hasPossibleCauses ? 'containerMedium' : 'containerNone'"
        >
          <FText appearance="captionMed12">{{
            $t('alarm.recommendation', 'RECOMMENDATIONS', {
              ns: 'alarm',
            })
          }}</FText>
          <FContainer paddingLeft="containerLarge">
            <FContainer
              paddingTop="containerLarge"
              v-for="(recommend, index) in recommendation"
              :key="index"
            >
              <li>
                <FText appearance="captionReg12">{{ recommend }}</FText>
              </li>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import ReportPreview from '../../../components/reports/module/ReportPreview.vue'
import { API } from '@facilio/api'
import cloneDeep from 'lodash/cloneDeep'
import { isEmpty, isArray } from '@facilio/utils/validation'
import {
  FContainer,
  FSpinner,
  FTimelineFilter,
  FDivider,
  FText,
  ftoast,
} from '@facilio/design-system'
import { dset } from 'dset'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import NewAlarmMixin from './mixins/NewAlarmMixin'
dayjs.extend(timezone)

const colorHexArray = [
  '#3D8BFA',
  '#5B1D6F',
  '#34C0CE',
  '#3C229D',
  '#49B83F',
  '#AB185A',
  '#E2BC00',
  '#0047AB',
  '#B61919',
  '#8D7500',
  '#F5519B',
  '#0F6F06',
  '#7D63DC',
  '#007991',
  '#A160B7',
  '#870000',
]

export default {
  components: {
    FSpinner,
    FContainer,
    FTimelineFilter,
    FText,
    FDivider,
    ReportPreview,
  },
  props: ['widget', 'details', 'fitMyContent', 'resizeWidget'],
  mixins: [NewAlarmMixin],
  data() {
    return {
      isLoading: true,
      datePickerValue: [
        dayjs
          .tz(this.details.lastOccurredTime, this.$account.timezone)
          .startOf('day')
          .valueOf(),
        dayjs
          .tz(this.details.lastOccurredTime, this.$account.timezone)
          .endOf('day')
          .valueOf(),
      ],
      dateType: 'day',
      reportParams: {},
      measureProps: [],
      visualizationProps: {},
      chartHeight: null,
    }
  },
  created() {
    this.init()
  },
  mounted() {
    this.fitMyContent()
  },
  computed: {
    initTimeFilter() {
      let { datePickerValue, dateType } = this
      return {
        startTime: datePickerValue[0],
        endTime: datePickerValue[1],
        label: dateType,
        dateOperator: 0,
      }
    },
    getChartStyles() {
      let { chartHeight } = this
      return `height: ${chartHeight ? `${chartHeight}px` : '100%'}`
    },
    possibleCauses() {
      let { details } = this
      let { prevOccurrence } = details || {}
      let { possibleCauses } = prevOccurrence || {}
      if (!isEmpty(possibleCauses)) {
        return JSON.parse(possibleCauses)
      }
      return []
    },
    recommendation() {
      let { details } = this
      let { prevOccurrence } = details || {}
      let { recommendation } = prevOccurrence || {}
      if (!isEmpty(recommendation)) {
        return JSON.parse(recommendation)
      }
      return []
    },
    hasPossibleCauses() {
      let { possibleCauses } = this
      return !isEmpty(possibleCauses)
    },
    hasRecommendation() {
      let { recommendation } = this
      return !isEmpty(recommendation)
    },
  },
  methods: {
    async init() {
      await this.loadReportParams()
    },
    async loadReportParams() {
      this.isLoading = true
      let { details } = this
      let { rule, resource } = details || {}
      let { id: readingRuleId } = rule || {}
      let { id: resourceId } = resource || {}
      let { data = {}, error } = await API.get(
        '/v3/analytics/newreadingalarm',
        {
          resourceId,
          readingRuleId,
        }
      )
      if (isEmpty(error)) {
        let dimensions = { dimension_type: '1', xAggr: '0' }
        let { measures } = data
        measures = measures.map((measure, index) => {
          let { categoryId, dataType } = measure || {}
          if (index === 0) {
            measure.displayName = 'Fault Status'
            measure.color = '#ff6700ff'
          }
          let chartType = 'line'
          if (dataType === 4) chartType = 'boolean'
          return {
            ...measure,
            option: 'box1',
            yAxis: '1',
            chartType,
            category: categoryId,
            hideDot: chartType == 'line',
          }
        })
        dset(this, 'reportParams', {
          measures,
          dimensions,
          baseline: { adjustType: 'none', baseLineId: 'none' },
        })
        this.getVisualizationProps()
        this.getMeasureProps()
      } else {
        ftoast.critical(error.message)
      }
      this.isLoading = false
    },
    setHeight(height) {
      if (!isEmpty(height)) {
        let modifiedHeight = height
        this.chartHeight = height
        let textContainer = this.$refs['cause-and-recommendation']
        let textContHeight = 0
        if (!isEmpty(textContainer)) {
          textContHeight = textContainer.$el?.clientHeight
        }
        let widgetHeight = modifiedHeight + textContHeight + 40
        this.resizeWidget({ height: modifiedHeight + textContHeight + 40 })
      }
    },
    getRandomColor() {
      let randomIndex = Math.floor(Math.random() * colorHexArray.length)
      return colorHexArray[randomIndex]
    },
    getMeasureProps() {
      let { reportParams, getRandomColor } = this
      let measureProps = []
      let { measures } = reportParams || {}
      measures.forEach(measure => {
        let { fieldId, aliases, color } = measure
        let { actual } = aliases
        measureProps.push({
          fieldId,
          yAxis: '1',
          color: color ? color : getRandomColor(),
          alias: actual,
          comparisonYAxis: '1',
          comparisonColor: getRandomColor(),
          increaseCheck: 'positive',
          label: '',
        })
      })
      dset(this, 'measureProps', measureProps)
    },
    getVisualizationProps() {
      let { reportParams, getChartType } = this
      let { measures } = reportParams || {}
      let clonedMeasures = cloneDeep(measures)
      let groups = [],
        id = 0,
        groupNo = 1,
        axis = {
          xAxis: { show: true, label: '', grid: true },
          y1Axis: { show: true, label: '', grid: true },
          y2Axis: { show: true, label: '' },
        }
      if (!isEmpty(clonedMeasures) && isArray(clonedMeasures)) {
        let alarmBarMeasure = clonedMeasures.shift()
        groups.push({
          name: `Group ${groupNo++}`,
          id: id++,
          measures: [{ ...alarmBarMeasure, chartType: 'boolean' }],
          axis,
          isBooleanGrp: true,
          height: '80px',
        })
        let nonBooleanMeasures = []
        clonedMeasures.forEach(measure => {
          let { dataType } = measure || {}
          if ([4, 8, 12].includes(parseInt(dataType))) {
            groups.push({
              name: `Group ${groupNo++}`,
              id: id++,
              measures: [{ ...measure, chartType: getChartType(dataType) }],
              height: '80px',
              axis: {
                ...axis,
                y1Axis: {
                  show: true,
                  label: '',
                  grid: false,
                  axisLabel: { show: false },
                },
              },
              isBooleanGrp: true,
            })
          } else {
            nonBooleanMeasures.push({ ...measure, chartType: 'line' })
          }
        })
        groups.push({
          name: `Group ${groupNo++}`,
          id: id++,
          chart: { chartType: 'line', hideDot: true },
          measures: nonBooleanMeasures,
          axis,
          isBooleanGrp: false,
          height: '200px',
        })
      }
      dset(this, 'visualizationProps', {
        type: 'multi',
        chart: { chartType: 'bar' },
        axis,
        legend: { enableLegend: true },
        groups,
      })
    },
    getChartType(dataType) {
      switch (dataType) {
        case 4:
          return 'boolean'
        case 8:
        case 12:
          return 'stack-bar'
        default:
          return 'line'
      }
    },
  },
}
</script>
