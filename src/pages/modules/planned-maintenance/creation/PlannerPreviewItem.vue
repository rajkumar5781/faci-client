<template>
  <FContainer
    padding="containerXxLarge"
    backgroundColor="backgroundMidgroundSubtle"
    borderRadius="high"
    display="flex"
    flexDirection="column"
  >
    <FText appearance="headingMed14" color="textMain">{{ planner.name }}</FText>
    <FContainer marginTop="sectionSmall">
      <FRecordDetails
        :record="plannerPreviewData"
        :fields="fieldList"
        :layout="4"
      />
      <FContainer v-if="!isEmpty(triggerSeasonsList)" marginTop="sectionSmall">
        <FText appearance="headingMed14" color="textMain">
          {{ $t('pm.season_details', { ns: 'maintenance' }) }}
        </FText>
        <FContainer marginTop="containerXxLarge">
          <FRecordDetails
            :record="seasonDetail"
            :fields="triggerSeasonsFieldsList"
            :layout="4"
          />
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FRecordDetails } from '@facilio/design-system'
import Constants from './utils/constant'
import { getResourcePlaceholder } from './utils/pm-utils.js'
import { isEmpty } from '@facilio/utils/validation'
import dayjs from 'dayjs'
import cloneDeep from 'lodash/cloneDeep'
import { FIELDS_SEASON_SCHEDULE_HASH } from '../util/pm-utils'

export default {
  name: 'PlannerPreviewItem',
  components: {
    FContainer,
    FText,
    FRecordDetails,
  },
  props: {
    planner: {
      type: Object,
      required: true,
    },
    pmRecord: {
      type: Object,
      required: true,
    },
  },
  data() {
    return { seasonDetail: {}, isEmpty }
  },
  computed: {
    /* Properties required for Planner detail  */
    frequencyTypeName() {
      let { planner } = this
      let { trigger } = planner || {}
      if (isEmpty(trigger)) {
        return '---'
      }

      let { scheduleInfo } = trigger || {}
      if (isEmpty(scheduleInfo)) {
        let { schedule } = trigger || {}
        scheduleInfo = JSON.parse(schedule)
      }
      let { frequencyType } = scheduleInfo || {}
      if (!isEmpty(frequencyType)) {
        let frequencyValue = Constants.FACILIO_SCHEDULE_FREQUENCY[frequencyType]
        return !isEmpty(frequencyValue) ? frequencyValue : 'frequencyType'
      }
      return '---'
    },
    resourceCountHeading() {
      let { resourcePlaceholder } = this || {}
      return `No of ${resourcePlaceholder}`
    },
    resourceCount() {
      let { planner } = this
      let { resourceCount = 0 } = planner || {}
      return resourceCount
    },
    executionStartDate() {
      let { planner } = this
      let { trigger } = planner || {}
      if (isEmpty(trigger)) {
        return '---'
      }
      let { startTime } = trigger || {}
      if (isEmpty(startTime)) {
        return '---'
      }
      return dayjs(Number(startTime)).format('DD-MMM-YYYY')
    },
    executionEndDate() {
      let { planner } = this
      let { trigger } = planner || {}
      if (isEmpty(trigger)) {
        return '---'
      }
      let { endTime } = trigger || {}
      if (isEmpty(endTime)) {
        return '---'
      }
      return dayjs(Number(endTime)).format('DD-MMM-YYYY')
    },
    resourcePlaceholder() {
      let { pmRecord } = this || {}
      return getResourcePlaceholder(pmRecord, true, false)
    },
    plannerPreviewData() {
      let {
        frequencyTypeName,
        resourceCount,
        executionStartDate,
        executionEndDate,
      } = this
      let data = {
        frequencyTypeName,
        resourceCount,
        startTime: executionStartDate,
        endTime: executionEndDate,
      }
      return data
    },
    fieldList() {
      let { resourceCountHeading } = this
      let fieldsList = [
        { displayName: 'Frequency', name: 'frequencyTypeName', span: 1 },
        { displayName: resourceCountHeading, name: 'resourceCount', span: 1 },
        {
          displayName: 'Execution Start Date',
          name: 'startTime',
          type: 'date',
          span: 1,
        },
        {
          displayName: 'Execution End Date',
          name: 'endTime',
          type: 'date',
          span: 1,
        },
      ]
      return fieldsList
    },
    triggerDetail() {
      let { planner } = this
      let { trigger } = planner || {}
      return trigger
    },
    triggerSeasonsList() {
      let { triggerDetail } = this
      let { scheduleInfo } = triggerDetail || {}
      let { seasons = [] } = scheduleInfo || {}
      return seasons
    },
    triggerSeasonsFieldsList() {
      // Need to fetch this from API
      let fieldsList = [
        { displayName: 'Season Name', name: 'seasonName', span: 1 },
        { displayName: 'Season Start', name: 'seasonStart', span: 1 },
        { displayName: 'Season End', name: 'seasonEnd', span: 1 },
      ]
      let { triggerSeasonsList } = this

      if (isEmpty(triggerSeasonsList)) {
        return []
      }
      let seasonFieldsList = []
      let i = 1

      triggerSeasonsList.forEach(season => {
        let details = {}

        fieldsList.forEach(field => {
          let fieldsCopy = cloneDeep(field)
          let val = FIELDS_SEASON_SCHEDULE_HASH[`${fieldsCopy.name}`].getValue({
            season,
          })
          if (fieldsCopy.name === 'seasonEnd') {
            fieldsCopy.span = 2
          }
          fieldsCopy.name = fieldsCopy.name + '_' + i
          details[`${fieldsCopy.name}`] = val
          seasonFieldsList.push(fieldsCopy)
        })
        this.seasonDetail = {
          ...this.seasonDetail,
          ...details,
        }
        i++
      })
      return seasonFieldsList
    },
  },
  methods: {},
}
</script>
