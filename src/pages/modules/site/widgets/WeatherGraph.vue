<template>
  <FContainer display="flex" height="100%" width="100%">
    <FContainer
      v-if="loading"
      display="flex"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="20"></FSpinner
    ></FContainer>
    <FContainer
      v-else-if="stationId == -1"
      display="flex"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <FEmptyState
        illustration="no-entries"
        size="M"
        :title="emptyStateTitle"
        :description="emptyStateDescription"
        type="narrow"
        :vertical="false"
      ></FEmptyState>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      height="100%"
      width="100%"
      paddingTop="containerMedium"
    >
      <FTabs :tabsList="tabs" v-model="activeTab" :key="activeTab">
        <FTabPane :key="activeTab">
          <FContainer
            display="flex"
            paddingTop="sectionSmall"
            height="100%"
            overflow="hidden"
            borderTop="solid 1px"
            borderColor="borderNeutralBaseSubtle"
            derTop
          >
            <WeatherReport
              :key="activeTab"
              class="weather-report"
              :reportParams="reportParams"
              :initTimeFilter="initTimeFilter"
              :visualizationProps="visualProps"
              :hideReportType="true"
              :hideTimeLineFilter="true"
              :measureProps="measures"
            ></WeatherReport>
          </FContainer>
        </FTabPane>
      </FTabs>
    </FContainer>
  </FContainer>
</template>
<script>
import ReportPreview from '../../../../components/reports/module/ReportPreview.vue'
import {
  FContainer,
  FTabs,
  FEmptyState,
  FTabPane,
  FSpinner,
} from '@facilio/design-system'
import { API } from '@facilio/api/dist/index.mjs'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import dayjs from 'dayjs'
import { getTimeZone } from '../../../../utils/formatter'
export default {
  components: {
    FContainer,
    FTabs,
    FEmptyState,
    FTabPane,
    FSpinner,
    WeatherReport: ReportPreview,
  },
  props: ['details', 'resizeWidget'],
  data() {
    return {
      timeFilter: null,
      isLoading: false,
      stationId: -1,
      isWeatherStationAssociated: false,
      weatherModule: {},
      weatherReadingFields: {},
      activeTab: 'temperature',
      tabs: [
        {
          name: 'temperature',
          value: 'temperature',
          label: 'Temperature',
        },
        {
          name: 'windSpeed',
          value: 'windSpeed',
          label: 'Wind',
        },
        {
          name: 'humidity',
          value: 'humidity',
          label: 'Humidity',
        },
      ],
      fieldNameMap: {
        temperature: 'Temperature',
        windSpeed: 'Wind',
        humidity: 'Humidity',
      },
    }
  },
  created() {
    this.getStationAndLoadMeta('newWeather')
  },
  computed: {
    loading() {
      let { isLoading } = this
      return isLoading
    },
    initTimeFilter() {
      let timeFilter = {
        dateOperator: -1,
      }
      let startTime = dayjs().tz(getTimeZone()).startOf('day').valueOf()
      let endTime = dayjs().tz(getTimeZone()).endOf('day').valueOf()
      timeFilter = { ...timeFilter, startTime, endTime }
      return timeFilter
    },
    reportParams() {
      let { activeTab, weatherReadingFields, fieldNameMap } = this
      let { [activeTab]: field } = weatherReadingFields
      let { fieldId = -1, unit } = field || {}
      let reportParams = {
        measures: [
          {
            aggr: 2,
            aliases: { actual: 'A' },
            criteriaId: 0,
            criteria: null,
            criteriaType: 1,
            criteriaTypeEnum: 'ALL',
            dataType: 3,
            data_aggr: 5,
            defaultSortPoint: false,
            displayName: `${fieldNameMap[activeTab]} (${unit})`,
            duplicateDataPoint: false,
            fieldId: fieldId,
            id: fieldId,
            limit: -1,
            moduleName: 'newWeather',
            name: activeTab,
            parentModuleName: 'newWeather',
            type: 1,
            unit,
          },
        ],
        dimensions: {
          dimension_type: 1,
          xAggr: 20,
        },
        sort: {
          orderByFunction: '2',
          limit: '10',
        },
        criteria: {},
        baseline: { baseLineId: 'none' },
      }
      return reportParams
    },
    emptyStateTitle() {
      return this.$t(
        'portfolio.weather_card.no_data',
        'No Weather station associated',
        {
          ns: 'portfolio',
        }
      )
    },
    emptyStateDescription() {
      return this.$t(
        'portfolio.weather_card.no_data_caption',
        'Associate a Weather station in the Relationships tab for precise weather insights.',
        {
          ns: 'portfolio',
        }
      )
    },
    visualProps() {
      let visualProps = {
        type: 'single',
        chart: {
          chartType: 'line',
          hideDot: true,
        },
        height: '290px',
        axis: {
          xAxis: {
            show: true,
            label: 'Time',
            grid: true,
          },
          y1Axis: {
            show: true,
            label: '',
            grid: true,
          },
          y2Axis: {
            show: true,
            label: '',
          },
        },
        legend: {
          enableLegend: false,
        },
      }
      return visualProps
    },
    measures() {
      let { activeTab, weatherReadingFields } = this
      let { [activeTab]: fieldId } = weatherReadingFields
      let measureProps = [
        {
          fieldId,
          yAxis: '1',
          color: '#418df9',
          alias: 'A',
        },
      ]
      return measureProps
    },
  },
  methods: {
    async getStationAndLoadMeta() {
      this.isLoading = true
      let siteId = getProperty(this, 'details.id')
      try {
        let { data, error } = await API.get('v3/weather/site/sitestationid', {
          siteId,
        })
        if (error) {
          this.stationId = -1
        } else {
          this.stationId = getProperty(data, 'stationId', -1)
        }
      } catch (e) {
        this.stationId = -1
      }
      if (!isEmpty(this.stationId)) {
        await this.loadModuleMeta('newWeather')
      } else {
        this.isWeatherStationAssociated = false
      }
      this.isLoading = false
    },
    async loadModuleMeta(moduleName) {
      let { data, error } = await API.get(`/module/site/${moduleName}/meta`, {
        moduleName,
      })
      if (error) {
        this.weatherModule = {}
        this.weatherReadingFields = {}
      } else {
        this.weatherModule = {}
        this.weatherReadingFields = {}
        if (!isEmpty(data)) {
          let { meta } = data || {}
          let { fields = [], module } = meta || {}
          let fieldsMap = {}
          fields.forEach(field => {
            fieldsMap[field.name] = field
          })
          this.weatherReadingFields = fieldsMap
          this.weatherModule = module
        }
      }
    },
  },
}
</script>
