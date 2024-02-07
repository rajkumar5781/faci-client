<template>
  <FContainer
    v-if="loading"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <FSpinner :size="30" />
  </FContainer>
  <FContainer
    v-else
    padding="containerNone sectionSmall"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    width="100%"
  >
    <FContainer
      display="flex"
      flexDirection="row"
      paddingBottom="containerXxLarge"
    >
      <FContainer
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
        padding="containerLarge containerNone containerXLarge containerNone"
        display="flex"
        flexDirection="column"
        width="100%"
      >
        <FText
          color="textMain"
          appearance="headingMed20"
          flexDirection="column"
          paddingBottom="containerMedium"
          display="inherit"
          alignItems="center"
          width="100%"
        >
          {{ currentWeekWo }}
        </FText>
        <FText
          color="textMain"
          appearance="bodyReg14"
          flexDirection="column"
          display="inherit"
          alignItems="center"
          >{{
            $t('summary.this_week', 'This Week', {
              ns: 'rule',
            })
          }}</FText
        >
      </FContainer>
      <FContainer
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
        marginLeft="containerXxLarge"
        padding="containerLarge containerNone containerXLarge containerNone"
        display="flex"
        flexDirection="column"
        width="100%"
      >
        <FText
          color="textMain"
          appearance="headingMed20"
          flexDirection="column"
          paddingBottom="containerMedium"
          display="inherit"
          alignItems="center"
        >
          {{ currentMonthWo }}
        </FText>
        <FText
          color="textMain"
          appearance="bodyReg14"
          flexDirection="column"
          display="inherit"
          alignItems="center"
          >{{ $t('summary.this_month', 'This Month', { ns: 'rule' }) }}</FText
        >
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { getWorkFlowResult } from './util.js'
import { getFormattedDuration } from '../../../utils/formatter.js'
import { FContainer, FText, FSpinner } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  components: {
    FContainer,
    FText,
    FSpinner,
  },
  props: ['details', 'moduleName'],
  data() {
    return {
      loading: false,
      values: null,
      avgAcknowledgeTime: null,
      avgCompletionTime: null,
    }
  },
  mounted() {
    this.loadRuleWoDetails()
    if (!isEmpty(this.details) && !isEmpty(this.details.alarmRulewoSummary)) {
      this.avgCompletionTime = getFormattedDuration(
        this.details.alarmRulewoSummary.avgResolutionTimeInMins,
        'seconds'
      )
      this.avgAcknowledgeTime = getFormattedDuration(
        this.details.alarmRulewoSummary.avgResponseTimeInMins,
        'seconds'
      )
    }
  },
  computed: {
    ruleId() {
      let { details } = this
      let { moduleName } = details
      let ruleId = null
      if (moduleName === 'newreadingrules') {
        let { id } = details || {}
        ruleId = id
      } else {
        let { preRequsite: { id } = {} } = details || {}
        ruleId = id
      }
      return ruleId
    },
    currentWeekWo() {
      let { values } = this
      let { currentWeekWo } = values || {}
      return currentWeekWo ? currentWeekWo : 0
    },
    currentMonthWo() {
      let { values } = this
      let { currentMonthWo } = values || {}
      return currentMonthWo ? currentMonthWo : 0
    },
  },
  methods: {
    loadRuleWoDetails() {
      this.loading = true
      let workFlowId = null

      let { ruleId } = this
      getWorkFlowResult('readingRuleWorkorder', ruleId ? ruleId : null).then(
        d => {
          this.values = d
          this.avgCompletionTime = getFormattedDuration(
            d.previousMonthresolutionTime,
            'seconds'
          )
          this.avgAcknowledgeTime = getFormattedDuration(
            d.previousMonthresponseTime,
            'seconds'
          )
          this.loading = false
        }
      )
    },
  },
}
</script>
