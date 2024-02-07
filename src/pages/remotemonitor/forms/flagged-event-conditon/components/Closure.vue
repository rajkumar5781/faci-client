<template>
  <FContainer
    height="calc(100% - 24px)"
    width="100%"
    display="flex"
    justifyContent="center"
    marginTop="sectionSmall"
  >
    <FContainer
      v-if="loading"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FSpinner :size="30"></FSpinner>
    </FContainer>
    <FContainer
      v-else
      height="100%"
      width="50%"
      overflow="scroll"
      display="flex"
      flexDirection="column"
      rowGap="sectionSmall"
    >
      <TelemetryCriteria
        ref="on-close-telemetry-criteria"
        :isNew="isNew"
        :fieldName="'onCloseTelemetryCriteria'"
        :flaggedEventRule="flaggedEventRuleClosureConfig"
      />
      <CloseEventOnStatusConfig
        ref="close-on-status-config"
        :isNew="isNew"
        :flaggedEventRuleClosureConfig="flaggedEventRuleClosureConfig"
        :woStausOptions="woStausOptions"
        :ticketModuleName="ticketModuleName"
      />
      <CloseWoOnFlaggedEventClose
        ref="close-wo-on-flagged-event-close"
        :isNew="isNew"
        :flaggedEventRuleClosureConfig="flaggedEventRuleClosureConfig"
        :woStausOptions="woStausOptions"
        :woCloseStausOptions="woCloseStausOptions"
        :ticketModuleName="ticketModuleName"
      />
      <FlaggedEventClosureException
        ref="flagged-event-closure-exception"
        :isNew="isNew"
        :flaggedEventRuleClosureConfig="flaggedEventRuleClosureConfig"
        :woStausOptions="woStausOptions"
      />
      <NotificationOnEventClose
        ref="close-event-notification"
        :isNew="isNew"
        :flaggedEventRuleClosureConfig="flaggedEventRuleClosureConfig"
      />
    </FContainer>
  </FContainer>
</template>

<script>
import { FContainer, FSpinner } from '@facilio/design-system'
import CloseEventOnStatusConfig from './CloseEventOnStatusConfig.vue'
import CloseWoOnFlaggedEventClose from './CloseWoOnFlaggedEventClose.vue'
import FlaggedEventClosureException from './FlaggedEventClosureException.vue'
import NotificationOnEventClose from './NotificationOnEventClose.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { API } from '@facilio/api'
import TelemetryCriteria from './TelemetryCriteria.vue'

const TICKET_MODULE_VS_CLOSE_TYPE_CODE = {
  workorder: '2',
  serviceOrder: '4',
}
export default {
  components: {
    FContainer,
    FSpinner,
    CloseEventOnStatusConfig,
    CloseWoOnFlaggedEventClose,
    FlaggedEventClosureException,
    NotificationOnEventClose,
    TelemetryCriteria
  },
  props: ['isNew', 'flaggedEventRule'],
  data() {
    return {
      flaggedEventRuleClosureConfig: {},
      woStausOptions: [],
      ticketModuleName: 'workorder',
      woCloseStausOptions: [],
      loading: false,
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.loading = true
      this.deserializeData()
      await this.setWoStatusOptions()
      this.loading = false
    },
    getSerializedData() {
      const formRefs = [
        'close-on-status-config',
        'close-wo-on-flagged-event-close',
        'flagged-event-closure-exception',
        'close-event-notification',
        'on-close-telemetry-criteria'
      ]
      let formData = {}
      let invalid = false
      for (const ref of formRefs) {
        const form = this.$refs[ref]
        const formDataResult = form.getSerializedData()
        const { invalid: currentDataInvalid = false } = formDataResult

        invalid = invalid || currentDataInvalid
        Object.assign(formData, formDataResult)
      }
      if (invalid) {
        return { invalid: true }
      }

      return { flaggedEventRuleClosureConfig: formData}
    },
    deserializeData() {
      let { isNew, flaggedEventRule = {} } = this
      let skipFieldName = getProperty(
        this,
        '$account.data.orgInfo.skipField_flaggedAlarm',
        ''
      )
      if (skipFieldName === 'workorder') {
        this.ticketModuleName = 'serviceOrder'
      }
      if (!isNew) {
        let { flaggedEventRuleClosureConfig = {}, ticketModuleName } =
          flaggedEventRule
        this.flaggedEventRuleClosureConfig = flaggedEventRuleClosureConfig
        if (!isEmpty(ticketModuleName)) {
          this.ticketModuleName = ticketModuleName
        }
      }
    },
    async setWoStatusOptions() {
      let { flaggedEventRule = {} } = this
      let { ticketModuleName, ticketModuleId } = flaggedEventRule
      let closeTypeCode = TICKET_MODULE_VS_CLOSE_TYPE_CODE[ticketModuleName]
      let parentFilter = {}
      let lookupFieldName = 'serviceOrderStatuses'
      if (ticketModuleName == 'workorder') {
        parentFilter = {
          parentModuleId: { operatorId: 9, value: [`${ticketModuleId}`] },
        }
        lookupFieldName = 'workorderStatuses'
      }

      let params = {}
      let filters = {
        ...parentFilter,
      }
      params = { ...params, filters: JSON.stringify(filters) }
      let woStausOptions = await this.loadTicketModuleStatusOptions(
        lookupFieldName,
        params
      )

      //temp handling for multi select options
      this.woStausOptions = woStausOptions.map(woStatus => {
        let { label, value } = woStatus
        return { label, value: `${value}` }
      })

      params = {}
      let filtersWithClosedStateCriteria = {
        ...parentFilter,
        typeCode: { operatorId: 9, value: [`${closeTypeCode}`] },
      }
      params = {
        ...params,
        filters: JSON.stringify(filtersWithClosedStateCriteria),
      }
      this.woCloseStausOptions = await this.loadTicketModuleStatusOptions(
        lookupFieldName,
        params
      )
    },
    async loadTicketModuleStatusOptions(lookupFieldName, params) {
      let { data, error } = await API.get(
        `/v3/flaggedAlarmProcess/statusOptions/${lookupFieldName}/flaggedEventClosureConfig`,
        params
      )
      if (isEmpty(error)) {
        let { pickList = [] } = data
        return pickList
      }
      return []
    },
  },
}
</script>
