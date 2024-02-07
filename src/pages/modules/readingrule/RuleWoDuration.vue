<template>
  <FContainer display="flex">
    <FContainer
      v-if="loading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else
      padding="containerNone sectionSmall"
      display="flex"
      flexDirection="column"
      width="100%"
    >
      <FContainer
        flexGrow="1"
        paddingTop="sectionSmall"
        paddingRight="sectionSmall"
        paddingBottom="sectionMedium"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <FContainer display="flex" flexDirection="row">
          <FContainer
            borderRadius="high"
            minWidth="145px"
            padding="containerLarge containerNone containerXLarge containerNone"
            display="flex"
            flexDirection="column"
          >
            <FText
              color="textMain"
              appearance="headingMed20"
              paddingBottom="containerMedium"
            >
              {{ avgAcknowledgeTime }}
            </FText>
            <FText color="textCaption" appearance="captionReg12">{{
              $t('create.average_resp_time', 'Average Response Time', {
                ns: 'rule',
              })
            }}</FText>
          </FContainer>
          <FContainer
            borderRadius="high"
            minWidth="145px"
            marginLeft="containerXxLarge"
            padding="containerLarge containerNone containerXLarge containerNone"
            display="flex"
            flexDirection="column"
          >
            <FText
              color="textMain"
              appearance="headingMed20"
              paddingBottom="containerMedium"
            >
              {{ avgCompletionTime }}
            </FText>
            <FText color="textCaption" appearance="captionReg12">{{
              $t('create.average_resolution_time', 'Average Resolution Time', {
                ns: 'rule',
              })
            }}</FText>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import { getWorkFlowResult } from './util.js'
import { getFormattedDuration } from '../../../utils/formatter.js'
import { isEmpty } from '@facilio/utils/validation'
import { FContainer, FText, FSpinner } from '@facilio/design-system'

export default {
  components: {
    FContainer,
    FText,
    FSpinner,
  },
  props: ['details', 'widget'],
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
    let { details } = this
    let { alarmRulewoSummary } = details || {}
    if (!isEmpty(alarmRulewoSummary)) {
      let { avgResolutionTimeInMins, avgResponseTimeInMins } =
        alarmRulewoSummary || {}
      this.avgCompletionTime = getFormattedDuration(
        avgResolutionTimeInMins,
        'seconds'
      )
      this.avgAcknowledgeTime = getFormattedDuration(
        avgResponseTimeInMins,
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

<style scoped></style>
