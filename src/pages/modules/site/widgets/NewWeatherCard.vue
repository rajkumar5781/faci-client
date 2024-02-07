<template>
  <FContainer
    v-if="loading"
    height="100%"
    display="flex"
    align-items="center"
    justify-content="center"
  >
    <FSpinner :size="20"></FSpinner>
  </FContainer>
  <FContainer v-else height="100%">
    <FRow class="weather-card-png">
      <FContainer>
        <fc-image
          :name="getWeatherIconName"
          :height="96"
          :width="130"
        ></fc-image>
      </FContainer>
    </FRow>
    <FContainer
      v-if="isEmpty(currentWeatherData)"
      gap="containerXxLarge"
      display="flex"
      flex-direction="column"
    >
      <FContainer
        display="flex"
        justify-content="center"
        align-items="center"
        textAlign="center"
        flex-direction="column"
        gap="containerLarge"
        padding="containerNone containerLarge"
      >
        <FText appearance="headingMed20">
          {{
            $t(
              'portfolio.weather_card.no_data',
              'No Weather station associated',
              {
                ns: 'portfolio',
              }
            )
          }}
        </FText>
        <FText appearance="captionReg12">
          {{
            $t(
              'portfolio.weather_card.no_data_caption',
              'Associate a Weather station in the Relationships tab for precise weather insights.',
              {
                ns: 'portfolio',
              }
            )
          }}
        </FText>
        <FText appearance="captionReg12"> </FText>
      </FContainer>
    </FContainer>
    <FContainer v-else display="flex" flex-direction="column">
      <FRow style="justify-content: center">
        <FText appearance="headingMed20">
          <span style="font-size: 30px">
            {{ cardTemperature }}&ordm;{{ unit }}
          </span>
        </FText>
      </FRow>
      <FContainer
        display="flex"
        justify-content="center"
        align-items="center"
        flex-direction="column"
        gap="containerMedium"
      >
        <FText appearance="headingMed20">
          {{ 'Today' }}
          {{ getFormattedHour }}
        </FText>
        <FText appearance="captionReg14">
          {{ currentWeather.label }}
        </FText>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import {
  FContainer,
  FSpinner,
  FRow,
  FText,
  ftoast,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { formatCustomDate } from '../../../../utils/formatter'
const weatherData = {
  default: {
    label: 'Cloudy Day',
    iconLabel: 'cloudy-day',
  },
  1: {
    label: 'Clear Day',
    iconLabel: 'clear-day',
  },
  2: {
    label: 'Clear Night',
    iconLabel: 'clear-night',
  },
  3: { iconLabel: 'rain', label: 'Rain' },
  4: {
    label: 'Snow',
    iconLabel: 'snow',
  },
  5: {
    label: 'Sleet',
    iconLabel: 'sleet',
  },
  6: {
    label: 'Wind',
    iconLabel: 'wind',
  },
  7: {
    label: 'Fog',
    iconLabel: 'fog',
  },
  8: {
    label: 'Cloudy Day',
    iconLabel: 'cloudy-day',
  },
  9: {
    label: 'Partly Cloudy Day',
    iconLabel: 'partly-cloudy-day',
  },
  10: {
    label: 'Partly Cloudy Night',
    iconLabel: 'partly-cloudy-night',
  },
  11: {
    label: 'Hail',
    iconLabel: 'hail',
  },
  12: {
    label: 'Thunderstorm',
    iconLabel: 'thunderstorm',
  },
  13: {
    label: 'Tornado',
    iconLabel: 'tornado',
  },
}
export default {
  props: ['details'],
  components: {
    FContainer,
    FRow,
    FSpinner,
    FText,
    FIcon,
  },
  data() {
    return {
      isEmpty,
      cardResult: {},
      temperature: null,
      temperatureUnit: null,
      time: null,
      weatherCardData: {},
      currentWeatherData: {},
      stationAssociated: false,
      loading: false,
    }
  },
  created() {
    this.init()
  },
  computed: {
    unit() {
      return this.temperatureUnit || this.orgUnit
    },
    getWeatherIconName() {
      let { currentWeather } = this || {}
      let { iconLabel } = currentWeather || {}
      return iconLabel
    },
    getFormattedTime() {
      let { currentWeatherData = {} } = this
      let { time } = currentWeatherData || {}
      return formatCustomDate(time, 'dddd, DD MMMM YYYY')
    },
    getFormattedHour() {
      let { currentWeatherData = {} } = this
      let { time } = currentWeatherData || {}
      return formatCustomDate(time, 'h:mm a')
    },
    orgUnit() {
      let { orgUnitsList } = getProperty(this, '$account.appProps')
      if (orgUnitsList && orgUnitsList.length) {
        let tempObj = orgUnitsList.find(rt => rt.metricEnum === 'TEMPERATURE')
        return tempObj && tempObj.unit === 5 ? 'F' : 'C'
      }
      return 'C'
    },
    currentWeather() {
      let { currentWeatherData = {} } = this
      let { icon } = currentWeatherData || {}
      return weatherData[icon || 'default']
    },
    cardTemperature() {
      let { currentWeatherData } = this
      let { temperature } = currentWeatherData
      if (isNaN(temperature)) {
        return ''
      } else {
        return temperature
      }
    },
  },
  methods: {
    async init() {
      await this.setUnitForTemperature('newWeather')
      await this.loadWeatherData()
    },
    async setUnitForTemperature(moduleName) {
      try {
        let { data, error } = await API.get(`/module/site/${moduleName}/meta`, {
          moduleName,
        })
        if (!error) {
          if (!isEmpty(data)) {
            let { meta } = data || {}
            let { fields = [] } = meta || {}
            let fieldsMap = {}
            fields.forEach(field => {
              fieldsMap[field.name] = field
            })
            this.temperatureUnit = fieldsMap['temperature']?.unit
          }
        }
      } catch (e) {
        this.temperatureUnit = '\u00B0C'
      }
    },
    async loadWeatherData() {
      let { details = {}, temperatureUnit = '\u00B0C' } = this
      let { id: siteId } = details || {}
      let params = {
        siteId,
      }
      this.loading = true
      try {
        let { data, error } = await API.get(
          'v3/weather/site/currentdata',
          params
        )
        if (!isEmpty(error)) {
          this.currentWeatherData = {}
          if (error.code === -1) {
            this.stationAssociated = false
          }
        } else {
          this.currentWeatherData = {}
          if (!isEmpty(data)) {
            let {
              actualTtime: time,
              temperature,
              unit = temperatureUnit,
              icon = 'default',
              summary = '---',
            } = data || {}
            if (!isEmpty(temperature)) {
              temperature = Math.round(temperature)
              this.currentWeatherData = {
                time,
                temperature,
                unit,
                icon,
                summary,
              }
            }
          }
        }
      } catch (e) {
        this.currentWeatherData = {}
      }
      this.loading = false
    },
  },
}
</script>
<style>
.weather-card-png {
  background: linear-gradient(
    180deg,
    #cce2ff 0%,
    rgba(240, 246, 255, 0) 72.94%
  );
  height: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
