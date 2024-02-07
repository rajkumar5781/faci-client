<template>
  <FContainer display="flex" justifyContent="center" flexDirection="column">
    <portal :to="`action-${widget.id}-${widget.name}`" slim>
      <FTimelineFilter
        v-model="dateRange"
        :validateDate="validDate"
        dateType="week"
        :emitOnInitialLoad="true"
        @input="handleTimeFilterChange"
        @change="setInitialDateRange"
      />
    </portal>
    <FContainer
      v-if="loading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      ><FSpinner :size="30" padding="containerXxLarge"></FSpinner
    ></FContainer>
    <FContainer
      v-if="!isRecordsEmpty && !loading"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <FContainer padding="containerLarge containerXxLarge">
        <FText appearance="headingMed14"
          >{{
            `${preRequsiteName} : ${totalCount} ${$t(
              'summary.faults',
              'Faults',
              { ns: 'rule' }
            )}`
          }}
        </FText>
      </FContainer>
    </FContainer>
    <FTable
      v-if="!isRecordsEmpty && !loading"
      :columns="columns"
      :showSelectBar="false"
      :hideBorder="false"
      :rounded="false"
      :data="records"
      accordionType="prefix"
    >
      <template #[`cell.duration`]="{ row }">
        <FText>{{ getDuration(row.duration) }}</FText>
      </template>
      <template #[`cell.faultInsights`]="{ row }">
        <FBooleanChart
          :startTime="dateRange[0]"
          :endTime="dateRange[1]"
          :data="row.booleanChartData"
          height="24px"
          width="205px"
          :tooltip="true"
          tooltipPosition="bottom"
          :formatter="booleanChartFormatter"
        />
      </template>
    </FTable>
    <FContainer
      v-if="isRecordsEmpty && !loading"
      display="flex"
      align-items="center"
      justify-content="center"
    >
      <FContainer width="500px">
        <FEmptyState
          :title="
            $t('summary.no_rule_insights', 'No Data available', {
              ns: 'rule',
            })
          "
          :vertical="true"
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
  FTimelineFilter,
  FText,
  FTable,
  FEmptyState,
  FSpinner,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { getFormattedDuration, formatDate } from '../../../utils/formatter.js'
import { getOrgMoment } from './util.js'
import { isEmpty } from '@facilio/utils/validation'
import { FBooleanChart } from '@facilio/charts'
import { ftoast } from '@facilio/design-system'

export default {
  props: ['details', 'widget'],

  components: {
    FContainer,
    FTimelineFilter,
    FText,
    FTable,
    FEmptyState,
    FBooleanChart,
    FSpinner,
  },
  data() {
    return {
      dateRange: [],
      records: [],
      totalCount: null,
      totalDuration: null,
      resourceDetails: [],

      loading: false,
      columns: [
        { displayName: 'Name', name: 'assetName', id: 1 },
        {
          displayName: 'Faults',
          name: 'count',
          id: 2,
        },
        {
          displayName: 'Duration',
          name: 'duration',
          id: 3,
        },
        {
          displayName: 'Fault Insights',
          name: 'faultInsights',
          id: 4,
        },
      ],
      data: null,
    }
  },
  computed: {
    isRecordsEmpty() {
      let { records } = this
      return isEmpty(records)
    },
    ruleId() {
      let { details: { id } = {} } = this
      return id
    },
    preRequsiteName() {
      let { details } = this
      let { name } = details || {}
      return name
    },
  },
  methods: {
    booleanChartFormatter(params) {
      return formatDate(params.value[0]) + ' - ' + formatDate(params.value[1])
    },
    validDate(time) {
      let currentTime = getOrgMoment(Date.now()).valueOf()
      return time > currentTime
    },
    getDuration(duration) {
      return getFormattedDuration(duration)
    },
    setInitialDateRange(dateRange) {
      this.dateRange = dateRange
      this.loadAlarmInsights()
    },
    async handleTimeFilterChange() {
      await this.loadAlarmInsights()
    },
    async loadAlarmInsights() {
      this.loading = true
      let { ruleId, dateRange } = this
      let url = `v3/newreadingrules/getRuleInsights`
      let params = { ruleId, startTime: dateRange[0], endTime: dateRange[1] }
      let { error, data } = await API.post(url, params)
      if (error) {
        ftoast.critical('Error Occured')
      } else {
        let { result } = data || {}
        if (!isEmpty(result)) {
          this.records = Object.keys(result).map(resId => {
            return result[resId]
          })
          this.calculateTotals()
        }
      }
      this.loading = false
    },
    calculateTotals() {
      this.totalCount = this.records.reduce((acc, { count }) => {
        return acc + Number(count)
      }, 0)

      this.totalDuration = this.records.reduce((acc, { duration }) => {
        return acc + duration
      }, 0)
    },
  },
}
</script>

<style scoped></style>
