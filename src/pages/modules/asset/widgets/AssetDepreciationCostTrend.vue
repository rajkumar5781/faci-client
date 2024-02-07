<template>
  <FContainer
    display="flex"
    alignItems="center"
    justifyContent="center"
    height="100%"
  >
    <FContainer height="100%" display="flex" justifyContent="center">
      <FContainer
        display="flex"
        justifyContent="center"
        width="500px"
        height="100%"
      >
        <FEmptyState
          :title="$t('asset.no_data_for_graph','No data Available for graph.',{ns:'asset'})"
          vertical
          size="S"
          illustration="no-entries"
        />
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTimelineFilter,
  FButton,
  FEmptyState,
} from '@facilio/design-system'
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
  components: { FContainer, FText, FTimelineFilter, FButton, FEmptyState },
  data() {
    return {
      dateObj: {},
      options: {
        axis: {
          y: {
            label: {
              text: 'BOOK VALUE',
            },
          },
          x: {
            label: {
              text: 'TIME',
            },
          },
        },
        isDepreciationCostTrend: true,
        customizeC3: {
          data: {
            colors: {
              'Current Price': '#ec6363',
              'Depreciated Amount': '#ecb163',
            },
            names: {
              'Current Price': 'Current Price',
              'Depreciated Amount': 'DDB',
              OBV: 'Opening Book Value',
            },
            order: 'asc',
          },
        },
        // general: {
        //   hideZeroes: true,
        // },
        legend: {
          show: false,
        },
      },
      showLegends: false,
    }
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
  },
}
</script>
