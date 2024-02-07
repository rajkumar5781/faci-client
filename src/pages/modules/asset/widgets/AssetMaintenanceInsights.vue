<template>
  <FContainer
    display="flex"
    gap="containerXxLarge"
    padding="containerXxLarge"
    justifyContent="center"
    alignItems="center"
    height="100%"
  >
    <FContainer
      display="flex"
      padding="containerLarge containerNone"
      flexDirection="column"
      alignItems="center"
      gap="containerMedium"
      backgroundColor="backgroundMidgroundSubtle"
      borderRadius="high"
      width="50%"
      height="100%"
      justifyContent="center"
    >
      <FContainer textAlign="center">
        <FText appearance="bodyReg14" color="textMain">Open</FText>
      </FContainer>

      <FButton appearance="link" size="medium" @click="goToWoList('open')">
        <FText appearance="headingMed20"> {{ openWoCount || 0 }}</FText>
      </FButton>
    </FContainer>

    <FContainer
      display="flex"
      padding="containerLarge containerNone"
      flexDirection="column"
      alignItems="center"
      gap="containerMedium"
      backgroundColor="backgroundMidgroundSubtle"
      borderRadius="high"
      width="50%"
      height="100%"
      justifyContent="center"
    >
      <FContainer textAlign="center">
        <FText appearance="bodyReg14" color="textMain">Overdue</FText>
      </FContainer>

      <FButton appearance="link" size="medium" @click="goToWoList('overdue')">
        <FText appearance="headingMed20">{{ overdueWoCount || 0 }}</FText>
      </FButton>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FButton } from '@facilio/design-system'
import { API } from '@facilio/api'
import { findRouteForModule, pageTypes } from '@facilio/router'
import dlv from 'dlv'

export default {
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'activeTab',
    'widget',
    'resizeWidget',
  ],
  components: {
    FContainer,
    FText,
    FButton,
  },
  mounted() {
    this.loadCount()
    this.loadWoOnTimeCompletionDetails()
  },
  data() {
    return {
      openWoCount: null,
      overdueWoCount: null,
      onTimeValue: null,
    }
  },
  computed: {
    moduleName() {
      return dlv(this, 'details.moduleName')
    },
  },
  methods: {
    goToWoList(viewName) {
      if (
        (viewName == 'open' && this.openWoCount > 0) ||
        (viewName == 'overdue' && this.overdueWoCount > 0)
      ) {
        let filters = {
          resource: [{ operatorId: 36, value: [`${this.details.id}`] }],
        }
        let query = {
          search: JSON.stringify(filters),
          includeParentFilter: true,
        }

        let { name } = findRouteForModule('workorder', pageTypes.LIST) || {}

        if (name) {
          this.$router.push({
            name,
            params: { viewname: viewName },
            query,
          })
        }
      }
    },
    async loadCount() {
      let filters = encodeURIComponent(
        JSON.stringify({
          resource: { operatorId: 36, value: [this.details.id + ''] },
        })
      )
      let { moduleName } = this
      let countHash = {
        openWoCount: `/v2/workorders/view/${moduleName}/open?count=true&filters=${filters}&includeParentFilter=true`,
        overdueWoCount: `/v2/workorders/view/${moduleName}/overdue?count=true&filters=${filters}&includeParentFilter=true`,
      }
      for (let countName in countHash) {
        let { data } = await API.get(countHash[countName])
        this[countName] = data?.workorderscount | 0
      }
    },
    async loadWoOnTimeCompletionDetails() {
      let params = {
        workflow: {
          expressions: [
            {
              name: 'a',
              fieldName: 'dueDate',
              moduleName: 'workorder',
              aggregateString: 'count',
              criteria: {
                pattern: '(1 and 2)',
                conditions: {
                  1: {
                    fieldName: 'resource',
                    operatorId: 36,
                    sequence: '1',
                    value: this.details.id,
                  },
                  2: {
                    fieldName: 'actualWorkEnd',
                    operatorId: 18,
                    sequence: '2',
                    value: 'DUE_DATE',
                  },
                },
              },
            },
            {
              name: 'b',
              fieldName: 'id',
              moduleName: 'workorder',
              aggregateString: 'count',
              criteria: {
                pattern: '(1)',
                conditions: {
                  1: {
                    fieldName: 'resource',
                    operatorId: 36,
                    sequence: '1',
                    value: this.details.id,
                  },
                },
              },
            },
          ],
          resultEvaluator: '(a/b)*100',
        },
      }
      let { data } = await API.post('/v2/executeworkflow', params)
      this.onTimeValue = data?.workflowResult
    },
  },
}
</script>
