<template>
  <FContainer>
    <FContainer
      v-if="isEmpty(triggers)"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :title="emptyStateText()"
        :vertical="true"
        illustration="no-entries"
      ></FEmptyState>
    </FContainer>
    <FContainer v-else class="!h-fit">
      <FTable
        @hook:updated="callResize"
        :columns="column"
        :data="triggers"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.id`]="{ row }">
          <FText appearance="bodyReg14">{{ `${'#' + row.id}` }}</FText>
        </template>
        <template #[`cell.type`]="{ row }">
          <FText appearance="bodyReg14">{{ getType(row) }}</FText>
        </template>
        <template #[`cell.frequencyType`]="{ row }">
          <FText appearance="bodyReg14">{{ getFrequencyType(row) }} </FText>
        </template>
        <template #[`cell.sysCreatedTime`]="{ row }">
          <FText appearance="bodyReg14">{{ getCreatedTime(row) }} </FText>
        </template>
      </FTable>
    </FContainer>
  </FContainer>
</template>

<script>
import { FContainer, FText, FEmptyState, FTable } from '@facilio/design-system'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import debounce from 'lodash/debounce'
import { fromNow } from '../../../../../utils/formatter'

export default {
  components: {
    FContainer,
    FText,
    FEmptyState,
    FTable,
  },
  props: ['details', 'fitMyContent'],
  data() {
    return {
      type: {
        1: `${this.$t('template.schedule', {
          ns: 'inspection',
        })}`,
        2: `${this.$t('template.manual', {
          ns: 'inspection',
        })}`,
      },
      isEmpty,
      column: [
        {
          displayName: 'Id',
          name: 'id',
          id: 1,
          resize: true,
          width: 80,
        },
        {
          displayName: 'Name',
          name: 'name',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Type',
          name: 'type',
          id: 3,
          width: 250,
        },
        {
          displayName: 'Frequency Type',
          name: 'frequencyType',
          id: 4,
          width: 270,
        },
        {
          displayName: 'Created Time',
          name: 'sysCreatedTime',
          id: 5,
        },
      ],
    }
  },
  computed: {
    triggers() {
      let { details = {} } = this
      let { triggers = [] } = details
      triggers = triggers.filter(trigger => trigger.type == 1)
      return triggers
    },
    totalPages() {
      let { triggers } = this
      if (!isEmpty(triggers)) {
        return triggers.length()
      }
    },
  },
  methods: {
    callResize: debounce(function () {
      this.fitMyContent()
    }, 100),
    getCreatedTime(row) {
      let { sysCreatedTime } = row
      return fromNow(sysCreatedTime)
    },
    getFrequencyType(value) {
      let frequencyType = getProperty(
        value,
        'schedule.scheduleInfo.frequencyTypeEnum'
      )
      let resultString = frequencyType.replace(/_/g, ' ')
      return resultString || '---'
    },
    getType(value) {
      let { type } = value || {}
      return this.type[type]
    },
    emptyStateText() {
      return `${this.$t('template.no_triggers', {
        ns: 'inspection',
      })}`
    },
  },
}
</script>
