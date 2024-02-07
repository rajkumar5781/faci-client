<template>
  <FContainer
    v-if="loading"
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100%"
  >
    <FSpinner :size="25" />
  </FContainer>
  <FContainer
    v-else-if="isEmpty(list)"
    paddingTop="containerMedium"
    height="100%"
  >
    <FContainer height="100%" display="flex" justifyContent="center">
      <FContainer height="100%" display="flex" justifyContent="center">
        <FContainer
          display="flex"
          justifyContent="center"
          width="500px"
          height="100%"
        >
          <FEmptyState
            title="No Faults Available"
            vertical
            size="S"
            illustration="no-entries"
          />
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
  <FContainer v-else height="100%">
    <FTable :rounded="false" :columns="column" :data="list">
      <template #[`cell.duration`]="{ row }">
        <FText color="textMain" appearance="bodyReg14">
          {{ getFormattedDuration(row.duration) }}</FText
        >
      </template>
      <template #[`cell.faultinsight`]="{ row }">
        <!-- boolean chart -->
      </template>
    </FTable>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTable,
  FPagination,
  FEmptyState,
  FSpinner,
} from '@facilio/design-system'

import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { getFormattedDuration } from '../../../../utils/formatter'
import { findRouteForModule, pageTypes } from '@facilio/router'
const SPECIAL_MODULE = ['readingrule', 'newreadingrule']
import getProperty from 'dlv'
export default {
  props: [
    'details',
    'layoutParams',
    'resizeWidget',
    'moduleName',
    'hideTitleSection',
    'groupKey',
    'widget',
    'isRCA',
  ],
  components: {
    FContainer,
    FText,
    FTable,
    FPagination,
    FSpinner,
    FEmptyState,
  },
  async created() {},
  data() {
    return {
      column: [
        { displayName: 'Name', name: 'subject', id: 1, fixed: true },
        {
          displayName: 'Faults',
          name: 'count',
          id: 2,
          resize: true,
          width: 100,
        },
        {
          displayName: 'Duration',
          name: 'duration',
          id: 3,
          width: 150,
          clickable: true,
        },
        {
          displayName: 'Fault Insight',
          name: 'faultinsight',
          id: 4,
          width: 250,
          clickable: true,
        },
      ],
      list: [],
      totalCount: null,
      totalDuration: null,
      loading: false,
      showFullList: false,
      defaultListLength: 4,
      initialHeight: null,
      defaultWidgetHeight: this.layoutParams ? this.layoutParams.h : null,
      overAllChartData: {
        data: {},
      },
      chartDataLoadStatus: {
        overall: false,
      },
      chartData: {},
      chartOptions: {
        common: {
          mode: 1,
          buildingIds: [],
          type: 1,
        },
        hideAlarmTitle: true,
        general: {
          grid: {
            y: false,
            x: false,
          },
          point: {
            show: false,
          },
          labels: false,
          normalizeStack: false,
          dataOrder: null,
          hideZeroes: false,
        },
        settings: {
          chartMode: 'multi',
          alarm: true,
          chart: true,
          table: false,
          safelimit: false,
          enableAlarm: true,
          autoGroup: false,
          booleanAlarms: true,
        },
        tooltip: {
          grouped: false,
          sortOrder: 'none',
          showNullValues: false,
        },
        donut: {
          labelType: 'percentage',
          centerText: {
            primaryText: null,
            secondaryText: null,
          },
        },
        area: {
          above: false,
          linearGradient: true,
        },
        axis: {
          rotated: false,
          showy2axis: true,
          x: {
            show: false,
            label: {
              text: 'Timestamp',
              position: 'outer-center',
            },
            tick: {
              direction: 'auto',
            },
            range: {
              min: null,
              max: null,
            },
            datatype: 'date_time',
            time: {
              period: null,
              format: {
                period: 'minute',
                interval: 'minutes',
                format: 'MM-DD-YYYY HH:mm',
                d3Format: '%m-%d-%Y %H:%M',
                tooltip: 'LLL',
              },
            },
          },
          y: {
            show: false,
            label: {
              text: 'PRE FILTER ALARM',
              position: 'outer-middle',
              type: 'auto',
            },
            unit: null,
            scale: 'linear',
            range: {
              min: null,
              max: null,
            },
            ticks: {
              count: 5,
            },
            format: {
              decimals: 0,
            },
            padding: {
              bottom: 0,
            },
            datatype: null,
          },
          y2: {
            show: false,
            label: {
              text: null,
              position: 'outer-middle',
            },
            unit: null,
            scale: 'linear',
            range: {
              min: null,
              max: null,
            },
            ticks: {
              count: 5,
            },
            format: {
              decimals: 0,
            },
            padding: {
              bottom: 0,
            },
          },
        },
        legend: {
          show: true,
          position: 'top',
          width: 180,
        },
        widgetLegend: {
          show: false,
        },
        colorPalette: 'auto',
        style: {
          pie: {
            label: {
              show: true,
            },
          },
          donut: {
            width: null,
            label: {
              show: true,
            },
          },
          gauge: {
            width: null,
            label: {
              show: true,
            },
            min: 0,
            max: 100,
            unit: ' %',
          },
          line: {
            point: {
              show: true,
              radius: 5,
            },
            lineMode: 'default',
            stepType: 'step',
            stroke: {
              width: 1,
              opacity: 1,
              dashed: {
                length: 2,
                space: 2,
              },
            },
            connectNull: false,
          },
          area: {
            point: {
              show: true,
              radius: 5,
            },
            lineMode: 'default',
            stepType: 'step',
            fillOpacity: null,
            stroke: {
              width: 1,
              opacity: 1,
              dashed: {
                length: 2,
                space: 2,
              },
            },
            connectNull: false,
          },
          bar: {
            width: null,
          },
          scatter: {
            point: {
              radius: 5,
            },
          },
        },
        type: 'area',
        multichart: {},
        isSystemGroup: false,
        dataPoints: [
          {
            label: 'Status',
            children: [],
            type: 'group',
            chartType: '',
            groupKey: 1,
            unit: null,
            dataType: 'BOOLEAN',
          },
        ],
        safeLimit: [],
      },
      localDateFormat: [22, 25, 31, 30, 28, 27, 44, 45],
      configData: {
        height: 40,
        width: 100,
      },
      dateOperator: 31,
      dateValue: null,
      resourceDetails: [],
    }
  },
  computed: {
    isListEmpty() {
      let { list } = this
      return isEmpty(list)
    },
    filteredList() {
      if (this.showFullList) return this.list
      else return (this.list || []).slice(0, this.defaultListLength)
    },
    hasMoreItems() {
      return this.list && this.list.length
        ? this.defaultListLength < this.list.length
        : false
    },

    ruleId() {
      return this.preRequsiteId
    },
    preRequsiteId() {
      let { details } = this
      return getProperty(details, 'id', null)
    },
    preRequsiteName() {
      let { details } = this
      let { moduleName, alarmRule } = details || {}
      let name = ''
      if (moduleName === 'newreadingrules') {
        name = getProperty(details, 'name', null)
      } else {
        name = getProperty(alarmRule, 'preRequsite.name', null)
      }
      return name
    },
  },
  watch: {
    ruleId: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) this.loadAlarmInsights()
      },
      immediate: true,
    },
    preRequsiteId: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) this.loadAlarmInsights()
      },
      immediate: true,
    },
    filteredList() {
      this.$nextTick(() => this.initializeCharts())
    },
  },
  methods: {
    isEmpty,
    getFormattedDuration,
    toggleVisibileItems() {
      this.showFullList = !this.showFullList
    },

    async loadAlarmInsights() {
      this.loading = true
      let url = `/v2/alarms/insights`
      let ruleId = this.details.alarmRule ? this.preRequsiteId : this.ruleId

      if (this.moduleName === 'newreadingrules') {
        url += `?ruleId=${ruleId}`
      } else {
        url += `?assetId=${ruleId}`
      }

      url += `&dateOperator=${this.dateOperator}`
      if (this.isRCA) {
        url += `&isRca=${this.isRCA}`
      }
      let { data } = await API.get(url)
      this.list = data?.alarms || []
      this.list.forEach(alarm => {
        alarm.accessKey = SPECIAL_MODULE.includes(this.moduleName)
          ? alarm.resource.id
          : alarm.ruleId
      })
      this.calculateTotals()
      this.loading = false
      this.initialHeight = null
    },

    initializeCharts() {
      if (isEmpty(this.chartData['overall']))
        this.getChartData(
          this.ruleId ? (this.isRCA ? this.ruleId : null) : this.preRequsiteId,
          this.ruleId ? (this.isRCA ? null : this.ruleId) : null,
          this.ruleId ? null : this.preRequsiteId
        )
      if (this.isRCA) {
        let resourceIds = this.filteredList.map(d => d.resource.id)
        this.$util
          .loadResource(resourceIds)
          .then(
            resouece =>
              (this.resourceDetails = [...resouece, ...this.resourceDetails])
          )
      }

      this.filteredList.forEach(
        ({ ruleId, resource, accessKey, subRuleId, resourceId }) => {
          if (isEmpty(this.chartData[ruleId]))
            this.getChartData(
              ruleId ? ruleId : subRuleId,
              this.ruleId
                ? this.isRCA
                  ? resourceId
                  : this.ruleId
                : resource.id,
              accessKey
            )
        }
      )
    },

    calculateTotals() {
      this.totalCount = this.list.reduce((acc, { count }) => {
        return acc + Number(count)
      }, 0)

      this.totalDuration = this.list.reduce((acc, { duration }) => {
        return acc + duration
      }, 0)
    },

    loadSubject(alarm) {
      return this.resourceDetails.filter(d => d.id == alarm.resource.id)[0].name
    },

    async getChartData(ruleId = null, resourceId = null, accessKey = null) {
      let params = {
        paramsJson: {
          parentId: resourceId,
          dateOperator: this.dateOperator,
          dateValue: this.dateValue,
        },
        staticKey: 'resourceAlarmBar',
        fetchAlarmInfo: false,
      }

      if (ruleId) {
        params.paramsJson.ruleId = ruleId
      }

      if (this.isRCA) {
        params.isRca = true
      }
      let { error, data } = await API.post('dashboard/getCardData', params)
    },
    openSummary(details) {
      if (details) {
        if (
          this.$route.name === 'assetsummary' ||
          this.moduleName === 'asset'
        ) {
          let { name } =
            findRouteForModule('newreadingalarm', pageTypes.OVERVIEW) || {}
          name &&
            this.$router.push({
              name,
              params: { id: details.alarm.id, viewname: 'active' },
            })
        } else if (
          this.$route.name === 'ruleOverview' ||
          this.$route.name === 'newRulesSummary' ||
          this.moduleName === 'newreadingrules'
        ) {
          let { name } = findRouteForModule('asset', pageTypes.OVERVIEW) || {}
          name &&
            this.$router.push({
              name,
              params: { id: details.resource.id, viewname: 'all' },
            })
        }
      }
    },
    openAlarmSummary(details) {
      if (details && details.alarm) {
        let { name } =
          findRouteForModule('newreadingalarm', pageTypes.OVERVIEW) || {}
        name &&
          this.$router.push({
            name,
            params: { id: details.alarm.id, viewname: 'active' },
          })
      }
    },
  },
}
</script>
