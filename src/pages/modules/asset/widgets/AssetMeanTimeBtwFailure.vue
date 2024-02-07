<template>
  <FContainer
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
    gap="containerXLarge"
    height="100%"
    width="100%"
  >
    <FContainer>
      <portal
        :to="`action-${widget.id}-${widget.name}`"
        class="portal-alignment-ws action-ws"
      >
        <FTimelineFilter
          v-if="!isEmpty(dateObj)"
          @change="setDateObject"
        ></FTimelineFilter>
      </portal>
    </FContainer>
    <FContainer
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      padding="sectionSmall"
    >
      <FText
        width="276px"
        text-overflow="ellipsis"
        appearance="bodyReg14"
        color="textMain"
      >
        {{ $t('asset.MTBF', 'MTBF', { ns: 'asset' }) }}
      </FText>
      <FContainer
        display="flex"
        width="612px"
        justifyContent="space-between"
        alignItems="center"
      >
        <FContainer display="flex" alignItems="flex-end" gap="containerXLarge">
          <FContainer display="flex" alignItems="center">
            <FContainer
              display="flex"
              padding="containerXLarge containerNone"
              flexDirection="column"
              alignItems="flex-start"
              gap="containerMedium"
            >
              <FText
                text-overflow="ellipsis"
                appearance="headingMed20"
                color="textMain"
              >
                {{ stats.mtbf }}
              </FText>
              <FText
                text-overflow="ellipsis"
                appearance="captionReg12"
                color="textCaption"
                >{{
                  $t('asset.range.THIS_YEAR', 'This Year', { ns: 'asset' })
                }}</FText
              >
            </FContainer>
          </FContainer>

          <FContainer
            display="flex"
            padding="containerXLarge containerLarge"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            gap="containerMedium"
          >
            <FText
              text-overflow="ellipsis"
              appearance="bodyReg14"
              color="textMain"
            >
              {{ stats.mtbfTillLastMonth }}
            </FText>
            <FText
              text-overflow="ellipsis"
              appearance="captionReg12"
              color="textCaption"
              >Till last month
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <FDivider width="100%"></FDivider>
    <FContainer height="100%" width="100%">
      <ModuleReport
        :reportConfig="report"
        :visualizationProps="visualizationProps"
      ></ModuleReport>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTimelineFilter,
  FDivider,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { getFormattedDuration } from '../../../../utils/formatter'
import ModuleReport from '../../../../components/reports/module/ModuleReport.vue'
import { dset as setProperty } from 'dset'
import dlv from 'dlv'

export default {
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'activeTab',
    'widget',
    'resizeWidget',
    'eventBus',
    'moduleName',
  ],
  data() {
    return {
      metrics: {},
      dateObj: {
        operatorId: 44,
      },
      visualizationProps: {
        chart: {
          chartType: 'line',
        },
      },
      report: {
        report: {
          moduleName: 'assetbreakdown',
          dimensions: {
            // server config xfield
            fieldName: 'fromtime',
            moduleName: 'assetbreakdown',
            special: false,
            lookupModuleName: 'time',
          },
          measures: [
            // y field
            {
              fieldName: 'timeBetweenFailure',
              moduleName: 'assetbreakdown',
              aggr: 2,
              sortOrder: 2,
              limit: 15,
            },
          ],
          groupBy: null,
          filters: {
            globalCriteria: {
              conditions: null,
              pattern: '(1)',
            },
          },
          drillDown: null,
          reportMode: 0,
          reportType: 0,
          timeFilter: {
            fieldName: 'fromtime',
            moduleName: 'assetbreakdown',
            dateOperator: 44,
            startTime: null,
            endTime: null,
          },
        },
      },
    }
  },
  components: { FContainer, FText, FTimelineFilter, FDivider, ModuleReport },

  mounted() {
    this.loadData()
  },
  async created() {
    await this.init()
  },
  computed: {
    stats() {
      if (isEmpty(this.metrics)) {
        return {
          downtime: '00:00 Hrs',
          downtimeTillLastMonth: '00:00 Hrs',
          mtbf: '00:00 Hrs',
          mtbfTillLastMonth: '00:00 Hrs',
          mttr: '00:00 Hrs',
          mttrTillLastMonth: '00:00 Hrs',
        }
      } else {
        return Object.entries(this.metrics).reduce((result, [key, value]) => {
          result[key] = getFormattedDuration(value, 'seconds')
          return result
        }, {})
      }
    },
  },
  methods: {
    isEmpty,
    loadData() {
      let url = `v2/assets/downtimemetrics?assetId=${this.details.id}`
      API.get(url)
        .then(response => {
          if (!response.error) {
            this.metrics = !isEmpty(response.data.metrics)
              ? response.data.metrics
              : {}
          } else {
            // TODO handle errors
            this.metrics = {}
          }
        })
        .catch(() => {
          // TODO handle errors
          this.metrics = {}
        })
    },
    getTrendClasses(durationA, durationB) {
      if (
        isEmpty(durationA) ||
        isEmpty(durationB) ||
        (durationA === 0 && durationB === 0)
      )
        return 'hide-v'
      return durationA - durationB ? 'fill-green' : 'fill-red rotate-bottom'
    },
    setDateObject(value, dateFilter) {
      let { dateObj } = this
      if (!isEmpty(dateFilter)) {
        dateObj = dateFilter
      }
      dateObj.value = value
      this.dateObj = dateObj
      let timeFilter = {
        fieldName: 'fromtime',
        moduleName: 'assetbreakdown',
        dateOperator: 44,
        startTime: value[0],
        endTime: value[1],
      }
      this.report.report.timeFilter = { ...timeFilter }
    },
    async init() {
      let { moduleName, widget, details } = this
      let { id } = details || {}
      let { id: widgetId, widgetType, widgetWrapperType } = widget || {}
      this.loading = true
      let { data, error } = await API.get(
        `v2/customPage/widget/widgetDetail/${this.moduleName}/get`,
        {
          moduleName,
          id: widgetId,
          recordId: id,
          widgetType,
          widgetWrapperType,
          layoutType: 'WEB',
        }
      )
      if (error) {
        ftoast.critical(error?.message || 'Error Occurred')
      } else {
        let conditions = dlv(
          data,
          'widgetDetail.chartParams.criteria.conditions',
          null
        )
        setProperty(
          this,
          'report.report.filters.globalCriteria.conditions',
          conditions
        )
      }
    },
  },
}
</script>
