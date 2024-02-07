<template>
  <FContainer display="flex" alignItems="center" justifyContent="center">
    <portal :to="`action-${widget.id}-${widget.name}`">
      <FTimelineFilter
        v-model="datePickerValue"
        dateType="day"
        :timeZone="$account.timeZone"
        @change="changeDateFilter"
      ></FTimelineFilter>
    </portal>
    <FSpinner v-if="isLoading" :size="30" />
    <FTable
      v-else-if="isDataAvailable"
      :columns="columns"
      :data="records"
      :hideBorder="false"
      :showSelectBar="false"
      :rounded="false"
      accordionType="suffix"
      @accordionToggle="accordionToggle"
    >
      <template #[`cell.faultName`]="{ row }">
        <FContainer
          display="flex"
          width="157px"
          cursor="pointer"
          @click="redirectToFault(row)"
        >
          <FTooltip placement="topRight" :mouseEnterDelay="0.25">
            <FText slot="title" appearance="bodyReg14" color="backgroundCanvas">
              {{ getRcaFaultName(row) }}
            </FText>
            <FText overflow="hidden" textOverflow="ellipsis">{{
              getRcaFaultName(row)
            }}</FText>
          </FTooltip>
        </FContainer>
      </template>
      <template #[`cell.assetName`]="{ row }">
        <FText>{{ getAssetCatName(row) }}</FText>
      </template>
      <template #[`cell.duration`]="{ row }">
        <FText>{{ getAlarmDuration(row) }}</FText>
      </template>
      <template #accordion="{ row }">
        <FContainer
          ref="container"
          display="flex"
          justifyContent="center"
          alignItems="center"
          padding="sectionLarge containerXLarge"
          backgroundColor="backgroundMidgroundSubtle"
        >
          <FBooleanChart
            ref="chart"
            width="100vw"
            :additionalData="row"
            :data="row.booleanChartData"
            :startTime="datePickerValue[0]"
            :endTime="datePickerValue[1]"
            :tooltip="true"
            tooltipPosition="top"
            :formatter="booleanChartFormatter"
          ></FBooleanChart>
        </FContainer>
      </template>
    </FTable>
    <FContainer v-else>
      <FEmptyState
        :title="
          this.$t('rules.no_root_cause', 'No root cause found', {
            ns: 'alarm',
          })
        "
        :vertical="true"
        size="M"
        illustration="no-entries"
      />
    </FContainer>
    <portal :to="`footer-${widget.id}-${widget.name}`" slim>
      <FContainer padding="containerLarge">
        <FPagination
          v-if="recordCount > 0"
          :currentPage="currentPage"
          :pageSize="perPage"
          :total="recordCount"
          @update:currentPage="handleNextPage"
          :disabled="false"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTimelineFilter,
  FEmptyState,
  FPagination,
  FTable,
  FSpinner,
  FTooltip,
  ftoast,
  getTheme,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import NewAlarmMixin from './mixins/NewAlarmMixin'
import { isEmpty } from '@facilio/utils/validation'
import { FBooleanChart } from '@facilio/charts'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { css } from '@emotion/css'
import getProperty from 'dlv'
dayjs.extend(utc)
dayjs.extend(timezone)
export default {
  props: ['widget', 'details'],
  mixins: [NewAlarmMixin],
  components: {
    FContainer,
    FText,
    FTable,
    FTimelineFilter,
    FPagination,
    FEmptyState,
    FSpinner,
    FBooleanChart,
    FTooltip,
  },
  computed: {
    currentAlarmId() {
      let { details: { id } = {} } = this
      return id
    },
    isDataAvailable() {
      let { records } = this
      return !isEmpty(records)
    },
  },
  watch: {
    details: {
      handler(newVal) {
        let { lastOccurredTime } = newVal || {}
        if (!isEmpty(lastOccurredTime)) {
          this.loadRecords()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      columns: [
        {
          name: 'faultName',
          displayName: 'Fault',
          id: 1,
        },
        {
          name: 'assetName',
          displayName: 'Asset',
          id: 2,
        },
        {
          name: 'count',
          displayName: 'Occurrences',
          id: 3,
        },
        {
          name: 'duration',
          displayName: 'Duration',
          id: 4,
        },
        {
          name: 'score',
          displayName: 'Score',
          id: 5,
        },
      ],
      isLoading: false,
      records: [],
      booleanChartData: [],
      currentPage: 1,
      perPage: 9,
      recordCount: null,
      datePickerValue: [
        new Date(
          new Date(this.details.lastOccurredTime).toLocaleDateString('en-US', {
            timeZone: this.$account.timezone,
          }) + ' 00:00:00'
        ).getTime() -
          6 * 24 * 60 * 60 * 1000,
        new Date(
          new Date(this.details.lastOccurredTime).toLocaleDateString('en-US', {
            timeZone: this.$account.timezone,
          }) + ' 23:59:59:999'
        ).getTime(),
      ],
      resizeObserver: null,
      dsmThemes: null,
    }
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.resize)
    this.$nextTick(() => (this.dsmThemes = getTheme()))
  },
  beforeDestroy() {
    this.resizeObserver.disconnect()
  },
  methods: {
    debounce_resize: debounce(function () {
      if (this.$refs['chart']) {
        this.$refs['chart'].resizeChart()
      }
    }, 50),
    resize() {
      this.debounce_resize()
    },
    accordionToggle(row) {
      let { accordionToggle } = row || {}
      if (accordionToggle) {
        this.$nextTick(() => {
          if (this.$refs['container']) {
            let el = this.$refs['container'].$el
            this.resizeObserver.observe(el)
          }
        })
      } else {
        if (this.$refs['container']) {
          let el = this.$refs['container'].$el
          this.resizeObserver.unobserve(el)
        }
      }
    },
    async loadRecords() {
      this.isLoading = true
      try {
        let { currentPage, currentAlarmId, datePickerValue, perPage, filters } =
          this
        if (!isEmpty(currentAlarmId)) {
          let params = {
            page: currentPage,
            perPage,
            alarmId: currentAlarmId,
            filters: JSON.stringify(filters),
            dateOperator: 20,
            dateOperatorValue: datePickerValue.join(','),
          }

          let { data = {}, error } = await API.get(
            `/v3/newreadingalarm/fetchRcaReadings`,
            params
          )
          if (isEmpty(error)) {
            let { result } = data || {}
            let { records, recordCount } = result || {}
            this.records = records
            this.recordCount = recordCount
          } else {
            ftoast.critical(error.message)
          }
        }
      } catch (errorMsg) {
        ftoast.critical(errorMsg)
      }
      this.isLoading = false
    },
    formatDate(ttime) {
      return dayjs
        .tz(ttime, this.$account.timezone)
        .format('dddd, MMMM D, YYYY hh:mm A')
    },
    booleanChartFormatter(params) {
      let { data } = params || {}
      let { additionalData: record } = data || {}
      let { count } = record || {}
      return `
        <div
          style="
            min-width: 408px;
            min-height: 72px;
          "
          class="flex flex-col"
        >
          <div
            class="flex justify-between ${this.getContainerXxLargeSpacing()}"
          >
            <div
              class="${this.getHeadTextStyle()} ${this.getTextMainColor()}"
            >
              ${this.formatDate(params.value[0])}
            </div>
            <div style="display: flex">
              <div
                class="${this.getTextStyle()} ${this.getTextMainColor()} ${this.getContainerLargeSpacing()}"
              >
                ${count} Alarms
              </div>
              <fc-icon group="webtabs" name="raw_alarm"></fc-icon>
            </div>
          </div>
          <div class="flex justify-between">
            <div
              class="${this.getTextStyle()} whitespace-normal ${this.getTextMainColor()}"
              style="width: 283px;"
            >
              ${this.getRcaFaultName(record)}
            </div>
            <div
              class="${this.getTagStyle(record)} flex justify-end"
            >
              ${this.getAlarmSeverityName(record)}
            </div>
          </div>
        </div>
      `
    },
    getHeadTextStyle() {
      let { dsmThemes } = this || {}
      let headingMed14 = getProperty(
        dsmThemes,
        'styles.components.FText.appearance.headingMed14'
      )
      return css(headingMed14)
    },
    getTextStyle() {
      let { dsmThemes } = this || {}
      let bodyReg14 = getProperty(
        dsmThemes,
        'styles.components.FText.appearance.bodyReg14'
      )
      return css(bodyReg14)
    },
    getTextMainColor() {
      let { dsmThemes } = this || {}
      let textMain = getProperty(dsmThemes, 'styles.colors.textMain')
      return css({ color: textMain })
    },
    getContainerLargeSpacing() {
      let { dsmThemes } = this || {}
      let containerLarge = getProperty(
        dsmThemes,
        'styles.spacing.containerLarge'
      )
      return css({ paddingRight: containerLarge })
    },
    getContainerXxLargeSpacing() {
      let { dsmThemes } = this || {}
      let containerXxLarge = getProperty(
        dsmThemes,
        'styles.spacing.containerXxLarge'
      )
      return css({ paddingBottom: containerXxLarge })
    },
    getAlarmSeverityName(record) {
      return getProperty(record, 'rcaFault.severity.displayName', '---')
    },
    getTagStyle(record) {
      let { dsmThemes } = this || {}
      let FTags = getProperty(dsmThemes, 'styles.components.FTags')
      let { accentType, baseStyle } = FTags || {}
      let { baseStyle: accentTagBaseStyle } = accentType || {}

      let severityName = this.getAlarmSeverityName(record)
      let alarmAccentObj = getProperty(this.accentObject, `${severityName}`, {})
      let { accentColor, accentLevel } = alarmAccentObj || {}

      let tagsAccentObject = getProperty(accentType, `${accentLevel}`, {})
      let tagsAccentStyle = getProperty(tagsAccentObject, `${accentColor}`, {})
      return css({ ...baseStyle, ...accentTagBaseStyle, ...tagsAccentStyle })
    },
    handleNextPage(page) {
      this.currentPage = page
      this.loadRecords()
    },
    changeDateFilter() {
      this.loadRecords()
    },
    getAssetCatName(record) {
      let { rcaFault } = record || {}
      let { readingAlarmAssetCategory } = rcaFault || {}
      let { displayName } = readingAlarmAssetCategory || {}
      return displayName || '--'
    },
    getRcaFaultName(record) {
      let { rcaFault } = record || {}
      let { subject } = rcaFault || {}
      return subject || '--'
    },
    getAlarmDuration(record) {
      let { duration } = record || {}
      let alarmDuration = this.getDuration(duration / 1000, 'seconds')
      let data = ''
      for (let key in alarmDuration) {
        data = `${data} ${alarmDuration[key]} ${key}`
      }
      return data
    },
    redirectToFault(record) {
      let { rcaFault } = record || {}
      let { id } = rcaFault || {}
      this.redirectToOverview(id)
    },
    redirectToOverview(id) {
      let { name } =
        findRouteForModule('newreadingalarm', pageTypes.OVERVIEW) || {}
      if (name) this.$router.push({ name, params: { id } })
    },
  },
}
</script>
