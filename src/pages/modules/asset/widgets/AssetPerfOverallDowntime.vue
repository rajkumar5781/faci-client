<template>
  <FContainer
    display="flex"
    padding="sectionSmall"
    flexDirection="column"
    alignItems="flex-start"
    gap="containerXLarge"
  >
    <FContainer display="flex" flexDirection="column" alignItems="flex-start">
      <FText
        width="276px"
        text-overflow="ellipsis"
        appearance="headingMed16"
        color="textMain"
        >Total Reported -{{ totalCount > 0 ? totalCount : '0' }}</FText
      >
      <FContainer
        display="flex"
        width="612px"
        justifyContent="space-between"
        alignItems="center"
      >
        <FContainer display="flex" alignItems="flex-end" gap="containerXLarge">
          <FContainer display="flex" alignItems="center">
            <FContainer
              display="flex"
              padding="containerXLarge containerNone"
              flexDirection="column"
              alignItems="flex-start"
              gap="containerMedium"
            >
              <FText
                text-overflow="ellipsis"
                appearance="headingMed20"
                color="textMain"
              >
                {{ currentMonthDuration || '00:00 Hrs' }}
              </FText>
              <FText
                text-overflow="ellipsis"
                appearance="captionReg12"
                color="textCaption"
                >{{
                  $t('asset.performance.downtime_year_period', {
                    ns: 'asset',
                  })
                }}</FText
              >
            </FContainer>
          </FContainer>

          <FContainer
            v-if="lastMonthDuration"
            display="flex"
            padding="containerXLarge containerLarge"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            gap="containerMedium"
          >
            <FText
              text-overflow="ellipsis"
              appearance="bodyReg14"
              color="textMain"
            >
              {{ lastMonthDuration }}
            </FText>
            <FText
              text-overflow="ellipsis"
              appearance="captionReg12"
              color="textCaption"
              >Till last month</FText
            >
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import { FContainer, FText, FButton, FAvatar } from '@facilio/design-system'
import { getFormattedDuration } from '../../../../utils/formatter'
import getProperty from 'dlv'
import { API } from '@facilio/api'
export default {
  props: [
    'details',
    'layoutParams',
    'resizeWidget',
    'hideTitleSection',
    'groupKey',
    'activeTab',
    'widget',
  ],
  components: { FContainer, FText, FButton, FAvatar },
  data() {
    return {
      totalCount: null,
      currentMonthDuration: null,
      lastMonthDuration: null,
      showAssetBreakdown: false,
      breakdownDetails: {},
    }
  },
  computed: {
    decommission() {
      return getProperty(this, 'details.decommission', false)
    },
  },
  created() {
    this.resetBreakdownDetails()
  },
  mounted() {
    this.loadCount()
    this.loadDurationTillLastMonth()
    this.loadTotalDurationForCurrentYear()
  },
  methods: {
    resetBreakdownDetails() {
      this.breakdownDetails = {
        condition: '',
        assetid: this.details.id,
        sourceId: this.details.id,
        sourceType: 3,
      }
    },
    async executeWorkflow(params) {
      let { data } = await API.post('/v2/executeworkflow', params)
      return data?.workflowResult || null
    },

    loadCount() {
      let params = {
        workflow: {
          expressions: [
            {
              name: 'Number Of Downtimes',
              fieldName: 'duration',
              moduleName: 'assetbreakdown',
              aggregateString: 'count',
              criteria: {
                pattern: '(1 and 2)',
                conditions: {
                  1: {
                    fieldName: 'asset',
                    operatorId: 36,
                    sequence: '1',
                    value: this.details.id,
                  },
                  2: {
                    fieldName: 'fromTime',
                    operatorId: 44,
                    sequence: '2',
                  },
                },
              },
            },
          ],
        },
      }
      this.executeWorkflow(params)
        .then(result => {
          this.totalCount = !isEmpty(result) && result !== 0 ? result : null
        })
        .catch(() => (this.totalCount = null))
    },

    loadDurationTillLastMonth() {
      let params = {
        workflow: {
          expressions: [
            {
              name: 'Duration Till Last Month',
              fieldName: 'duration',
              moduleName: 'assetbreakdown',
              aggregateString: 'sum',
              criteria: {
                pattern: '(1 and 2)',
                conditions: {
                  1: {
                    fieldName: 'asset',
                    operatorId: 36,
                    sequence: '1',
                    value: this.details.id,
                  },
                  2: {
                    fieldName: 'fromTime',
                    operatorId: 80,
                    sequence: '2',
                  },
                },
              },
            },
          ],
        },
      }
      this.executeWorkflow(params)
        .then(result => {
          this.lastMonthDuration = !isEmpty(result)
            ? getFormattedDuration(result, 'seconds')
            : null
        })
        .catch(() => (this.lastMonthDuration = null))
    },

    loadTotalDurationForCurrentYear() {
      let params = {
        workflow: {
          expressions: [
            {
              name: 'Total Duration For Current Year',
              fieldName: 'duration',
              moduleName: 'assetbreakdown',
              aggregateString: 'sum',
              criteria: {
                pattern: '(1 and 2)',
                conditions: {
                  1: {
                    fieldName: 'asset',
                    operatorId: 36,
                    sequence: '1',
                    value: this.details.id,
                  },
                  2: {
                    fieldName: 'fromTime',
                    operatorId: 44,
                    sequence: '2',
                  },
                },
              },
            },
          ],
        },
      }
      this.executeWorkflow(params)
        .then(result => {
          this.currentMonthDuration = !isEmpty(result)
            ? getFormattedDuration(result, 'seconds')
            : null
        })
        .catch(() => (this.currentMonthDuration = null))
    },

    updateBreakdownStats() {
      //   this.eventBus.$emit('asset-downtime-reported')
      this.loadCount()
      this.loadDurationTillLastMonth()
      this.loadTotalDurationForCurrentYear()
    },
  },
}
</script>
