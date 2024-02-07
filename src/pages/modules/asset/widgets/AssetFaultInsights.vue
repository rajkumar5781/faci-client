<template>
  <FContainer
    display="flex"
    padding="containerXxLarge"
    flexDirection="column"
    alignItems="flex-start"
    gap="containerXxLarge"
  >
    <FContainer
      display="flex"
      width="100%"
      padding="containerXxLarge"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap="containerMedium"
      borderRadius="high"
      backgroundColor="backgroundMidgroundSubtle"
    >
      <FText appearance="captionReg12" color="textMain">Faults</FText>
      <FButton appearance="link" size="medium" @click="goToView('fdd')">
        <FText appearance="headingMed20"> {{ activeAlarmCount || 0 }}</FText>
      </FButton>
    </FContainer>

    <FContainer
      display="flex"
      width="100%"
      padding="containerXxLarge"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap="containerMedium"
      borderRadius="high"
      backgroundColor="backgroundMidgroundSubtle"
    >
      <FText appearance="captionReg12" color="textMain">BMS Alarms</FText>
      <FButton appearance="link" size="medium" @click="goToView('bms')">
        <FText appearance="headingMed20">{{ activeBmsAlarmCount || 0 }}</FText>
      </FButton>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FButton } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { API } from '@facilio/api'
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
    this.loadAlarmRuleDatails()
    this.loadBmsAlarmCount()
  },
  data() {
    return {
      activeAlarmCount: null,
      alarm: null,
      alarmDuration: null,
      activeBmsAlarmCount: null,
    }
  },
  methods: {
    goToView(type) {
      let filters = {
        resource: [{ operatorId: 36, value: [`${this.details.id}`] }],
      }
      let query = {
        includeParentFilter: true,
        search: JSON.stringify(filters),
      }

      let moduleName = this.$access.isLicenseEnabled('NEW_ALARMS')
        ? 'newreadingalarm'
        : 'alarm'
      let viewname = 'active'
      if (type === 'bms') {
        moduleName = 'bmsalarm'
        viewname = 'bmsActive'
      }
      let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}
      if (name) {
        this.$router.push({
          name,
          params: { viewname, moduleName },
          query,
        })
      }
    },
    async loadCount() {
      let filters = encodeURIComponent(
        JSON.stringify({
          resource: { operatorId: 36, value: [this.details.id + ''] },
        })
      )
      let url = ''
      if (this.$access.isLicenseEnabled('NEW_ALARMS')) {
        url = `/v2/readingalarms/view/active?fetchCount=true&filters=${filters}&includeParentFilter=true`
      } else {
        url = `/v2/alarms/view/active?isCount=true&filters=${filters}&includeParentFilter=true`
      }
      let { data } = await API.get(url)
      this.activeAlarmCount = data?.count
    },
    loadBmsAlarmCount() {
      let queryParam = {
        viewName: 'bmsActive',
        includeParentFilter: true,
        moduleName: 'bmsalarm',
      }
      queryParam.filters = JSON.stringify({
        resource: { operatorId: 36, value: [this.details.id + ''] },
      })
      let url = ''
      url = `/v3/modules/data/count`
      API.get(url, queryParam).then(response => {
        let { error, data } = response || {}
        if (isEmpty(error)) {
          let { count } = data || {}
          this.activeBmsAlarmCount = count
        }
      })
    },
    async loadAlarmRuleDatails() {
      let workFlowId
      if (this.$access.isLicenseEnabled('NEW_ALARMS')) {
        workFlowId = 5
      } else {
        workFlowId = 6
      }
      let url = 'v2/workflow/getDefaultWorkflowResult'
      let params = {
        defaultWorkflowId: workFlowId,
        paramList: [this.details.id],
      }
      let { data } = await API.post(url, params)
      this.alarmDuration = data?.durationInSeconds
      this.loading = false
    },
    async loadCommonAlarmDetails() {
      let params = {
        workflow: {
          expressions: [
            {
              name: 'commonAlarmDetails',
              fieldName: 'subject',
              moduleName: 'alarm',
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
              groupBy: 'entityId',
              orderByFieldName: 'count(*)',
              sortBy: 'desc',
              limit: 1,
            },
          ],
        },
      }

      let { data } = API.post('/v2/executeworkflow', params)
      this.alarm = !isEmpty(data?.workflowResult)
        ? data?.workflowResult[0]
        : null
    },
    loadCommonAlarmDuration() {
      let params = {
        workflow: {
          expressions: [
            {
              name: 'a',
              fieldName: 'clearedTime',
              moduleName: 'alarm',
              aggregateString: 'sum',
              criteria: {
                pattern: '(1 and 2 and 3)',
                conditions: {
                  1: {
                    fieldName: 'resource',
                    operatorId: 36,
                    sequence: '1',
                    value: this.details.id,
                  },
                  2: {
                    fieldName: 'clearedTime',
                    operatorId: 2,
                    sequence: '2',
                  },
                  3: {
                    fieldName: 'createdTime',
                    operatorId: 28,
                    sequence: '3',
                  },
                },
              },
            },
            {
              name: 'b',
              fieldName: 'createdTime',
              moduleName: 'alarm',
              aggregateString: 'sum',
              criteria: {
                pattern: '(1 and 2 and 3)',
                conditions: {
                  1: {
                    fieldName: 'resource',
                    operatorId: 36,
                    sequence: '1',
                    value: this.details.id,
                  },
                  2: {
                    fieldName: 'clearedTime',
                    operatorId: 2,
                    sequence: '2',
                  },
                  3: {
                    fieldName: 'createdTime',
                    operatorId: 28,
                    sequence: '3',
                  },
                },
              },
            },
          ],
          resultEvaluator: '(a-b)/1000',
        },
      }

      let { data } = API.post('/v2/executeworkflow', params)
      this.alarmDuration = !isEmpty(data?.workflowResult)
        ? data?.workflowResult[0]
        : null
    },
  },
}
</script>
