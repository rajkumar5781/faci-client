<template>
  <FContainer
    display="flex"
    alignItems="center"
    justifyContent="center"
    height="100%"
  >
    <portal
      :to="`action-${widget.id}-${widget.name}`"
      class="portal-alignment-ws action-ws"
    >
      <FTimelineFilter
        :operatorId="44"
        @change="(val, timeLineObj) => changeDateFilter(val, timeLineObj)"
        ><FButton appearance="tertiary">{{
          dateObj != '' ? dateObj.label : ''
        }}</FButton></FTimelineFilter
      >
    </portal>
     <FContainer height="100%" display="flex" justifyContent="center">
        <FContainer
          display="flex"
          justifyContent="center"
          width="500px"
          height="100%"
        >
          <FEmptyState
           :title="$t('asset.no_data_for_graph', 'No data Available for graph.', { ns: 'asset' })"
            vertical
            size="S"
            illustration="no-entries"
          />
        </FContainer>
      </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FTimelineFilter,FEmptyState } from '@facilio/design-system'
import getProperty from 'dlv'
export default {
  props: [
    'details',
    'layoutParams',
    'resizeWidget',
    'hideTitleSection',
    'groupKey',
    'activeTab',
    'widget',
  ],
  components: { FContainer, FText, FTimelineFilter , FEmptyState },
  data() {
    return {
      showLegends: false,
      dateObj: {},
    }
  },
  computed: {
    options() {
      let { yLabel, xLabel, isChartTypeLine } = this
      let options = {
        axis: {
          y: {
            label: {
              text: yLabel,
            },
          },
          x: {
            label: {
              text: xLabel,
            },
          },
        },
        customizeC3: {
          data: {
            colors: {
              Unplanned: '#ec6363',
              Planned: '#ecb163',
            },
            names: {
              Unplanned: 'Unplanned Maintenance',
              Planned: 'Planned Maintenance',
            },
          },
          // line: { zerobased: true }
        },
        general: {
          hideZeroes: !isChartTypeLine,
        },
        legend: {
          show: false,
        },
      }
      return options
    },
    chartParams() {
      return getProperty(this, 'widget.widgetParams.chartParams', {})
    },
    isChartTypeLine() {
      let { chartParams } = this
      let { chartType } = chartParams || {}
      return chartType === 'line'
    },
    xLabel() {
      let { chartParams } = this
      return getProperty(chartParams, 'xField.displayName', '')
    },
    yLabel() {
      let { chartParams } = this
      return getProperty(chartParams, 'yField.displayName', '')
    },
  },
  methods: {
    onReportLoaded(report, result) {
      if (
        report &&
        report.data &&
        Object.keys(report.data).filter(key => key !== 'x').length
      ) {
        this.showLegends = true
      } else {
        this.showLegends = false
      }
    },
    changeDateFilter(value, dateFilter) {
      let { dateObj } = this
      dateObj = dateFilter
      dateObj.value = value
      this.dateObj = dateObj
    },
  },
}
</script>
