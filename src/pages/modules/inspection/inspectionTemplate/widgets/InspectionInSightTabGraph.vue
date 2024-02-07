<template>
  <FContainer>
    <portal :to="actionPortal">
      <FContainer>
        <FTimelineFilter
          v-if="!isEmpty(dateObj)"
          @change="setDateObject"
        ></FTimelineFilter>
      </FContainer>
    </portal>
    <ModuleReport
      :reportConfig="report"
      :visualizationProps="visualizationProps"
    ></ModuleReport>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FTimelineFilter,
  FEmptyState,
  FSpinner,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { FPieChart } from '@facilio/charts'
import { eventBus } from '../../../../../components/page-builder/event-bus'
import ModuleReport from '../../../../../components/reports/module/ModuleReport.vue'

export default {
  components: {
    FContainer,
    FTimelineFilter,
    FEmptyState,
    FSpinner,
    FPieChart,
    ModuleReport,
  },
  props: ['widget', 'actionPortal', 'details'],
  data() {
    return {
      dateObj: {
        operatorId: 44,
      },
      isEmpty,
      visualizationProps: {
        chart: {
          chartType: 'donut',
        },
      },
      report: {
        report: {
          moduleName: 'inspectionResponse',
          dimensions: {
            // server config xfield
            fieldName: 'responseStatus',
            moduleName: 'qandaResponse',
            special: false,
            lookupModuleName: 'inspectionResponse',
          },
          measures: [
            // y field
            {
              fieldName: 'id',
              moduleName: 'inspectionResponse',
              aggr: 1,
              sortOrder: 2,
              limit: 15,
            },
          ],
          groupBy: null,
          baseLines: '',
          filters: null,
          drillDown: null,
          reportMode: 0,
          reportType: 0,
          timeFilter: {
            fieldName: 'createdTime',
            moduleName: 'inspectionResponse',
            dateOperator: 44,
            startTime: null,
            endTime: null,
          },
        },
      },
      timeFilter: {},
    }
  },
  methods: {
    setDateObject(value, dateFilter) {
      let { dateObj } = this
      if (!isEmpty(dateFilter)) {
        dateObj = dateFilter
      }
      dateObj.value = value
      this.dateObj = dateObj
      let timeFilter = {
        fieldName: 'createdTime',
        moduleName: 'inspectionResponse',
        dateOperator: 44,
        startTime: value[0],
        endTime: value[1],
      }
      this.timeFilter = { ...timeFilter }
      this.$set(this.report.report, 'timeFilter', timeFilter)
      eventBus.$emit('date-change-inspection', this.dateObj)
    },
  },
}
</script>
