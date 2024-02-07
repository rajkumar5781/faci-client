import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import dlv from 'dlv'
import { clone } from 'lodash'
import { defineStore } from 'pinia'
const metricunits = defineStore('metricunits', {
  state: () => ({
    metricWithUnits: [],
    metrics: [],
    isMetricLoading: false,
  }),

  getters: {
    getMetrics: state => () => {
      let options = []
      if (!isEmpty(state.metrics)) {
        state.metrics.forEach(metric => {
          let { name: label, metricId: value } = metric
          options.push({
            label,
            value,
          })
        })
      }
      return options
    },
    getMetricsUnit: state => metricId => {
      let options = []
      let selectedMetric = state.metrics.find(
        metric => metric.metricId === metricId
      )
      let { _name } = selectedMetric || {}
      let selectedMetricUnits = state.metricWithUnits[_name] || []
      if (!isEmpty(selectedMetricUnits)) {
        selectedMetricUnits.forEach(metric => {
          let { displayName, unitId: value, symbol } = metric
          let label = `${displayName} (${symbol})`
          options.push({
            label,
            value,
          })
        })
      }
      return options
    },
  },
  actions: {
    async loadMetricUnits(forceFetch) {
      let { metrics, metricWithUnits } = this
      let canLoadMetrics =
        forceFetch || (isEmpty(metrics) && isEmpty(metricWithUnits))
      if (canLoadMetrics) {
        this.isMetricLoading = true
        let url = `units/getDefaultMetricUnits`
        let { error, data } = await API.get(url)
        if (error) {
          let { message } = error || {}
          ftoast.critical(message || 'Error Occured')
        } else {
          let { metricWithUnits = [], metrics = [] } = data || {}
          this.metrics = metrics
          this.metricWithUnits = metricWithUnits
        }
        this.isMetricLoading = false
      }
    },
  },
})
export default metricunits
