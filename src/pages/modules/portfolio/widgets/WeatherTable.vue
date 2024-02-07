<template>
  <FContainer height="100%">
    <FContainer v-if="loading">
      <FSpinner :size="20" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(weatherDataTimeList)"
      height="100%"
      display="flex"
    >
      <FEmptyState
        illustration="no-entries"
        size="M"
        :title="emptyStateTitle"
        :description="emptyStateDescription"
        :vertical="false"
        type="narrow"
      ></FEmptyState>
    </FContainer>
    <FContainer v-else height="100%" overflow="auto">
      <FTable
        :columns="columns"
        :data="weatherDataTimeList"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.time`]="{ row }">
          <FText appearance="bodyReg14" color="textMain">{{
            getFormatedTime(row)
          }}</FText>
        </template>
        <template #[`cell.type`]="{ row, prop }">
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FIcon
              size="16"
              group="weather"
              :name="getCurrentWeatherData(row, 'icon')"
            ></FIcon>
            <FText appearance="bodyReg14" color="textMain">{{
              getCurrentWeatherData(row, 'summary')
            }}</FText>
          </FContainer>
        </template>
        <template #[`cell.temp`]="{ row, prop }">
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FIcon
              size="16"
              group="weather"
              name="temperature"
              :pressable="false"
            ></FIcon>
            <FText appearance="bodyReg14" color="textMain">{{
              getCurrentWeatherData(row, 'temperature')
            }}</FText>
          </FContainer>
        </template>
        <template #[`cell.wind`]="{ row }">
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FIcon
              size="16"
              group="weather"
              name="wind"
              :pressable="false"
            ></FIcon>
            <FText appearance="bodyReg14" color="textMain">
              {{ getCurrentWeatherData(row, 'windSpeed') }}</FText
            >
          </FContainer>
        </template>
        <template #[`cell.dew`]="{ row }">
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FIcon
              size="16"
              group="weather"
              name="dew-point"
              :pressable="false"
            ></FIcon>
            <FText appearance="bodyReg14" color="textMain">{{
              getCurrentWeatherData(row, 'dewPoint')
            }}</FText>
          </FContainer>
        </template>
        <template #[`cell.uv`]="{ row }">
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FIcon
              size="16"
              group="weather"
              name="uv-index"
              :pressable="false"
            ></FIcon>
            <FText appearance="bodyReg14" color="textMain">
              {{ getCurrentWeatherData(row, 'uvIndex') }}</FText
            >
          </FContainer>
        </template>
        <template #[`cell.visibility`]="{ row }">
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FIcon
              size="16"
              group="default"
              name="eye-open"
              :pressable="false"
            ></FIcon>
            <FText appearance="bodyReg14" color="textMain">
              {{ getCurrentWeatherData(row, 'visibility') }}</FText
            >
          </FContainer>
        </template>
        <template #[`cell.pressure`]="{ row }">
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FIcon size="16" group="default" name="pressure"></FIcon>
            <FText appearance="bodyReg14" color="textMain">
              {{ getCurrentWeatherData(row, 'pressure') }}</FText
            >
          </FContainer>
        </template>
        <template #[`cell.humidity`]="{ row }">
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FIcon size="16" group="default" name="humidity"></FIcon>
            <FText appearance="bodyReg14" color="textMain">
              {{ getCurrentWeatherData(row, 'humidity') }}</FText
            >
          </FContainer>
        </template>
      </FTable>
    </FContainer>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { getOrgMoment } from '../../../modules/readingrule/util'
import {
  ftoast,
  FContainer,
  FSpinner,
  FEmptyState,
  FTable,
  FRow,
  FText,
  FCol,
  FIcon,
} from '@facilio/design-system'
import { formatCustomDate } from '../../../../utils/formatter'
export default {
  props: ['details'],
  components: {
    ftoast,
    FContainer,
    FSpinner,
    FEmptyState,
    FIcon,
    FTable,
    FText,
    FRow,
    FCol,
  },
  data() {
    return {
      WEATHER_ICONS: {
        default: 'cloudy-day',
        1: 'clear-day',
        2: 'clear-night',
        3: 'rain',
        4: 'snow',
        5: 'sleet',
        6: 'wind',
        7: 'fog',
        8: 'cloudy-day',
        9: 'partly-cloudy-day',
        10: 'partly-cloudy-night',
        11: 'hail',
        12: 'thunderstorm',
        13: 'tornado',
      },
      isEmpty,
      columns: [
        {
          displayName: 'Time',
          name: 'time',
          fixed: true,
        },
        {
          displayName: 'Type',
          name: 'type',
        },
        {
          displayName: 'Temperature',
          name: 'temp',
        },
        {
          displayName: 'Dew Point',
          name: 'dew',
        },
        {
          displayName: 'Wind Speed',
          name: 'wind',
        },
        {
          displayName: 'Visibility',
          name: 'visibility',
        },
        {
          displayName: 'UV Index',
          name: 'uv',
        },
        {
          displayName: 'Pressure',
          name: 'pressure',
        },
        {
          name: 'humidity',
          displayName: 'Humidity',
        },
      ],
      isLoading: false,
      stationId: -1,
      weatherData: {},
      weatherReadingFields: {},
      weatherModule: {},
      weatherDataTimeList: [],
    }
  },
  computed: {
    loading() {
      let { isLoading } = this
      return isLoading
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
  },
  async created() {
    await this.getStationAndLoadData()
  },
  methods: {
    async getStationAndLoadData() {
      this.isLoading = true
      let siteId = getProperty(this, 'details.id', -1)
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
        await this.loadWeatherData()
      }
      this.isLoading = false
    },
    async loadModuleMeta(moduleName) {
      try {
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
      } catch (e) {
        this.weatherModule = {}
        this.weatherReadingFields = {}
      }
    },

    async loadWeatherData() {
      let { weatherReadingFields = {}, stationId } = this
      let startTime = getOrgMoment().valueOf()
      let endTime = getOrgMoment().valueOf() + 12 * 60 * 60 * 1000
      let fetchFields = [
        'temperature',
        'dewPoint',
        'windSpeed',
        'visibility',
        'uvIndex',
        'pressure',
        'humidity',
        'precipitationProbability',
        'icon',
        'summary',
      ]
      if (!isEmpty(weatherReadingFields)) {
        let fields = []
        fetchFields.forEach(fetchField => {
          let {
            displayName: name,
            dataType,
            fieldId,
            name: actual,
          } = weatherReadingFields[fetchField]
          if (fetchField === 'icon') dataType = 2
          let aggr = fetchField === 'summary' ? 4 : 2
          let field = {
            parentId: [stationId],
            name,
            yAxis: { dataType, fieldId, aggr },
            aliases: { actual },
            type: 1,
            duplicateDataPoint: false,
          }
          fields.push(field)
        })
        fields = JSON.stringify(fields)
        let params = {
          mode: 1,
          startTime,
          endTime,
          fields,
          xAggr: 20,
          showSafeLimit: true,
          analyticsType: 6,
          newFormat: true,
        }
        let { error, data } = await API.get('v2/report/readingReport', params)
        if (error) {
          ftoast.critical(
            error?.message ||
              this.$t('portfolio.api.error', 'Error Occured', {
                ns: 'portfolio',
              })
          )
        } else {
          if (!isEmpty(data)) {
            let { weatherData = {}, weatherDataTimeList = [] } = this
            let dataList = getProperty(data, 'reportData.data', [])
            dataList.forEach(dataPoint => {
              if (!isEmpty(dataPoint?.X)) {
                weatherDataTimeList.push(dataPoint.X)
                weatherData[dataPoint.X] = dataPoint
              }
            })
          }
        }
      }
    },
    getCurrentWeatherData(time, key) {
      let { WEATHER_ICONS } = this
      let { unit = '' } = this.weatherReadingFields[key] || {}
      unit = isEmpty(unit) ? '' : unit
      let { weatherData = {} } = this
      let { [time]: currentWeatherGroup = {} } = weatherData
      if (!isEmpty(currentWeatherGroup[key])) {
        if (key === 'icon') {
          let IconKey = currentWeatherGroup[key] || 'default'
          IconKey = Math.floor(IconKey)
          return WEATHER_ICONS[IconKey]
        }
        return `${currentWeatherGroup[key]} ${unit}`
      }
      return key === 'icon' ? WEATHER_ICONS['default'] : '---'
    },
    getFormatedTime(timeStamp) {
      return formatCustomDate(timeStamp, 'h:mm a')
    },
  },
}
</script>
