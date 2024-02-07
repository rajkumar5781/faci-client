<template>
  <FContainer height="inherit">
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="inherit"
    >
      <FSpinner :size="30"></FSpinner>
    </FContainer>
    <FContainer
      v-else-if="!isDataAvailable"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="inherit"
    >
      <FContainer width="500px">
        <FEmptyState
          :title="emptyStateText"
          :vertical="true"
          size="M"
          illustration="no-entries"
        />
      </FContainer>
    </FContainer>
    <FTable
      v-else
      :columns="fields"
      :data="list"
      :hideBorder="false"
      :showSelectBar="false"
      :rounded="false"
    >
      <template
        v-for="(field, index) in fields"
        #[`cell.${field.name}`]="{ row }"
      >
        <FContainer :key="field.name + index">
          <FText v-if="field.displayType === 'ID'">{{
            '#' + row[field.name]
          }}</FText>
          <FText v-else-if="field.displayType === 'DATE_TIME'">
            {{
              row[field.name] > 0 ? getDateFomattedTz(row[field.name]) : '--'
            }}
          </FText>
          <FText v-else-if="field.displayType === 'DURATION'">
            {{ row[field.name] > 0 ? getAlarmDuration(row) : '--' }}
          </FText>
          <FText v-else-if="field.displayType === 'IMPACT'">
            {{ getImpact(row, field.name) }}
          </FText>
          <FText v-else-if="field.displayType === 'USER_AVATAR'">
            <FAvatar
              v-if="row.acknowledged"
              size="S"
              userStatus="nil"
              :userName="row[field.name]"
            />
            <FText v-else>{{
              $t('alarm.unacknowledged', 'Unacknowledged', { ns: 'alarm' })
            }}</FText>
          </FText>
          <FContainer v-else-if="field.displayType === 'PREVIOUS_SEVERITY'">
            <FContainer v-if="row.previousSeverity">
              <FTags
                appearance="accent"
                :text="getPreviousOccurrenceDisplayName(row)"
                :accentColor="getAccentColor(row, field.name)"
                :accentLevel="getAccentLevel(row, field.name)"
              />
            </FContainer>
            <FContainer v-else>
              <FTags
                appearance="accent"
                :text="getAlarmDisplayName(row)"
                :accentColor="getAccentColor(row)"
                :accentLevel="getAccentLevel(row)"
              />
            </FContainer>
          </FContainer>
          <FText v-else>
            {{ row[field.name] }}
          </FText>
        </FContainer>
      </template>
    </FTable>
  </FContainer>
</template>
<script>
import NewAlarmMixin from './mixins/NewAlarmMixin'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { formatDate } from '../../../utils/formatter'
import {
  FTable,
  FContainer,
  FSpinner,
  FText,
  FTags,
  FEmptyState,
  FAvatar,
} from '@facilio/design-system'

export default {
  mixins: [NewAlarmMixin],
  components: {
    FTable,
    FContainer,
    FSpinner,
    FText,
    FTags,
    FEmptyState,
    FAvatar,
  },
  props: ['loading', 'name', 'details', 'list', 'fields'],
  computed: {
    emptyStateText() {
      if (this.name === 'occurrences')
        return this.$t('alarm.no_occurrences', 'No occurrences found', {
          ns: 'alarm',
        })
      return this.$t('alarm.no_events', 'No events found', {
        ns: 'alarm',
      })
    },
    isDataAvailable() {
      let { list } = this
      return !isEmpty(list)
    },
  },
  methods: {
    getPreviousOccurrenceColor(alarm) {
      let { previousSeverity } = alarm || {}
      return getProperty(previousSeverity, 'color')
    },
    getPreviousOccurrenceDisplayName(alarm) {
      let { previousSeverity } = alarm || {}
      return getProperty(previousSeverity, 'displayName', '---')
    },
    getDateFomattedTz(date) {
      return formatDate(date)
    },
    getAlarmDuration(occurrence) {
      let data = ''
      let duration = this.getDuration(
        (occurrence.clearedTime - occurrence.createdTime) / 1000,
        'seconds'
      )
      for (let key in duration) {
        data = `${data} ${duration[key]} ${key}`
      }
      return data
    },
    getImpact(occurrence, name) {
      let impact = getProperty(occurrence, name, 0)
      return occurrence[name] > 0 ? impact.toFixed(2) : '--'
    },
  },
}
</script>
