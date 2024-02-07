<template>
  <FContainer
    v-if="loading"
    display="flex"
    alignItems="center"
    justifyContent="center"
    position="absolute"
    top="0"
    left="0"
    backgroundColor="backgroundCanvas"
    height="100%"
    width="100%"
  >
    <FSpinner :size="40" />
  </FContainer>
  <ConnectedForm
    v-else
    class="flagged-event-rule-form"
    :renderDetails="renderDetails"
    @closeForm="goToFlaggedEventRuleList"
    @tabChange="handleTabChange"
  >
    <template #save-action>
      <FButton @click="saveFlaggedEventCondition" :disabled="saving">
        {{ `${$t('save')} & ${$t('actions.close')}` }}
      </FButton>
    </template>
    <template #1-content>
      <RuleDetails
        ref="flagged-event-rule-basic-details"
        :isNew="isNew"
        :flaggedEventRule="flaggedEventRule"
      />
    </template>
    <template #2-content>
      <CriteriaForm
        ref="site-criteria"
        moduleName="site"
        moduleDisplayName="Site"
        :criteriaObj="flaggedEventRule.siteCriteria"
        @siteCriteriaUpdate="setSiteCriteria"
      />
    </template>
    <template #3-content>
      <CriteriaForm
        ref="controller-criteria"
        moduleName="controller"
        moduleDisplayName="Controller"
        :criteriaObj="flaggedEventRule.controllerCriteria"
        @controllerCriteriaUpdate="setControllerCriteria"
      />
    </template>
    <template #4-content>
      <FContainer
        height="calc(100% - 24px)"
        width="100%"
        display="flex"
        justifyContent="center"
        marginTop="sectionSmall"
      >
        <FContainer
          height="max-content"
          display="flex"
          flexDirection="column"
          width="50%"
        >
          <TelemetryCriteria
            ref="on-create-telemetry-criteria"
            :isNew="isNew"
            :fieldName="'onCreateTelemetryCriteria'"
            :flaggedEventRule="flaggedEventRule"
          />
        </FContainer>
      </FContainer>
    </template>
    <template v-if="selectedTab === '5'" #5-content>
      <FContainer
        v-if="!scriptTabLoading"
        height="calc(100% - 30px)"
        width="100%"
        display="flex"
        justifyContent="center"
        marginTop="sectionSmall"
      >
        <FContainer
          height="100%"
          width="60%"
          overflow="scroll"
          display="flex"
          border="1px solid"
          borderColor="borderNeutralBaseSubtler"
          borderRadius="high"
          padding="sectionXSmall sectionSmall"
          paddingLeft="containerNone"
        >
          <ScriptEditor
            v-model="flaggedEventRule.workflowContext.workflowV2String"
            scriptClass="script-editor-container"
          />
        </FContainer>
      </FContainer>
    </template>
    <template #6-content>
      <Actions
        ref="flagged-event-rule-action"
        :flaggedEventRule="flaggedEventRule"
        :isNew="isNew"
      />
    </template>
    <template #7-content>
      <Closure
        ref="flagged-event-closure-tab"
        :isNew="isNew"
        :flaggedEventRule="flaggedEventRule"
      />
    </template>
    <template #8-content>
      <ControlAction
        ref="flagged-event-control-action-tab"
        :isNew="isNew"
        :flaggedEventRule="flaggedEventRule"
      />
    </template>
    <template #header-image>
      <FContainer
        display="flex"
        justifyContent="flex-end"
        marginRight="sectionLarge"
        marginTop="containerXLarge"
      >
        <fc-image width="400" name="monitoring-scenes" class="flex" />
      </FContainer>
    </template>
  </ConnectedForm>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { pageTypes, findRouteForModule } from '@facilio/router'
import { ConnectedForm } from '@facilio/ui/new-forms'
import RuleDetails from './RuleDetails.vue'
import CriteriaForm from '../../components/CriteriaForm.vue'
import Actions from './Actions.vue'
import Closure from './Closure.vue'
import ControlAction from './ControlAction.vue'
import TelemetryCriteria from './TelemetryCriteria.vue'
import { FButton, FContainer, ftoast, FSpinner } from '@facilio/design-system'
import getProperty from 'dlv'
import { ScriptEditor } from '@facilio/ui/setup'
export default {
  components: {
    ConnectedForm,
    RuleDetails,
    CriteriaForm,
    Actions,
    Closure,
    FButton,
    FContainer,
    FSpinner,
    ScriptEditor,
    ControlAction,
    TelemetryCriteria,
  },
  props: ['id'],
  data() {
    return {
      scriptTabLoading: false,
      selectedTab: '1',
      loading: false,
      showEditor: true,
      saving: false,
      moduleName: 'flaggedAlarmProcess',
      flaggedEventRule: {
        workflowContext: { workflowV2String: null },
        siteCriteria: null,
        controllerCriteria: null,
        fieldMapping: [],
        flaggedEventRuleBureauEvaluationContexts: [],
      },
      functionReturnType: 'Boolean',
      renderDetails: {
        isForm: true,
        saving: false,
        lazy: true,
        tabsList: [
          {
            label: this.$t('alarm_filter_rule.rule_details', {
              ns: 'remote_monitor',
            }),
            value: '1',
          },
          {
            label: this.$t('alarm_filter_rule.define_site_criteria', {
              ns: 'remote_monitor',
            }),
            value: '2',
          },
          {
            label: this.$t('alarm_filter_rule.define_controller_criteria', {
              ns: 'remote_monitor',
            }),
            value: '3',
          },
          {
            label: this.$t('alarm_filter_rule.define_telemetry_criteria', {
              ns: 'remote_monitor',
            }),
            value: '4',
          },
          {
            label: this.$t('flagged_event_rule.define_script_criteria', {
              ns: 'remote_monitor',
            }),
            value: '5',
          },
          {
            label: this.$t('flagged_event_rule.actions', {
              ns: 'remote_monitor',
            }),
            value: '6',
          },
          {
            label: this.$t('flagged_event_rule.closure', {
              ns: 'remote_monitor',
            }),
            value: '7',
          },
          {
            label: this.$t('flagged_event_rule.control_action', {
              ns: 'remote_monitor',
            }),
            value: '8',
          },
        ],
        headerObject: {
          title: this.$t('flagged_event_rule.new_flagged_alarm_process', {
            ns: 'remote_monitor',
          }),
          description: this.$t(
            'flagged_event_rule.flagged_alarm_process_description',
            { ns: 'remote_monitor' }
          ),
          gradient: 'violet',
        },
      },
    }
  },
  computed: {
    isNew() {
      let { id } = this
      return isEmpty(id)
    },
    createWorkorder() {
      let createWorkorder = getProperty(
        this,
        'flaggedEventRule.createWorkorder',
        false
      )
      return createWorkorder
    },
  },
  watch: {
    createWorkorder(newVal) {
      if (!newVal) {
        this.flaggedEventRule.incorporateWoAndActivities = newVal
        this.flaggedEventRule.refrainConclusionWoGeneration = newVal
        this.flaggedEventRule.sendMailOnTimeOut = newVal
      }
    },
    selectedTab(newVal) {
      if (newVal == '4') {
        this.scriptTabLoading = true
        this.$nextTick(() => {
          this.scriptTabLoading = false
        }, 1000)
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    isEmpty,
    handleTabChange(selectedTab) {
      this.selectedTab = selectedTab
    },
    async init() {
      this.loading = true
      let { isNew } = this
      if (!isNew) {
        this.renderDetails.headerObject.title = this.$t(
          'flagged_event_rule.edit_flagged_alarm_process',
          { ns: 'remote_monitor' }
        )
        await this.loadFlaggedEventRule()
      } else {
        await this.loadTicketModule()
      }
      this.loading = false
    },
    goToFlaggedEventRuleList() {
      let { name } = findRouteForModule(this.moduleName, pageTypes.LIST) || {}
      name && this.$router.push({ name }).catch(() => {})
    },
    setSiteCriteria(criteria) {
      this.flaggedEventRule.siteCriteria = criteria
    },
    setControllerCriteria(criteria) {
      this.flaggedEventRule.controllerCriteria = criteria
    },
    addFieldForMapping() {
      let fieldMapping = getProperty(this, 'flaggedEventRule.fieldMapping', [])
      let length = fieldMapping.length
      fieldMapping = [
        ...fieldMapping,
        {
          index: length,
          leftFieldId: null,
          rightFieldId: null,
          parentId: null,
          valueText: null,
        },
      ]
      this.$set(this.flaggedEventRule, 'fieldMapping', fieldMapping)
    },
    removeFieldFromMapping(mappingField) {
      let { index } = mappingField
      let fieldMapping = getProperty(this, 'flaggedEventRule.fieldMapping', [])
      fieldMapping.splice(index, 1)
      this.flaggedEventRule.fieldMapping = (fieldMapping || []).map(
        (fieldMap, index) => {
          return { ...fieldMap, index }
        }
      )
    },
    async loadFlaggedEventRule() {
      this.loading = true
      let { moduleName, id } = this
      let { flaggedAlarmProcess, error } = await API.fetchRecord(
        moduleName,
        {
          id,
        },
        { force: true }
      )
      if (!isEmpty(error)) {
        let message =
          error?.message ||
          this.$t('flagged_even_rule.fetch_error', { ns: 'remote_monitor' })
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 1000,
        })
      } else {
        this.flaggedEventRule = flaggedAlarmProcess
      }
      this.deSerializeData()
      this.loading = false
    },
    async loadTicketModule() {
      let { data = {}, error } = await API.get(
        '/v3/flaggedAlarmProcess/getTicketModuleForCreate'
      )
      if (isEmpty(error)) {
        let { flaggedEventRule } = this
        let { ticketModule = {} } = data
        let { name, moduleId } = ticketModule
        this.flaggedEventRule = {
          ...flaggedEventRule,
          ticketModuleName: name,
          ticketModuleId: moduleId,
        }
      }
    },
    async saveFlaggedEventCondition() {
      this.saving = true
      let { invalid } = this.serializeData() || {}
      if (invalid) {
        this.saving = false
        return
      }
      let { id, flaggedEventRule } = this
      let response
      if (!isEmpty(id)) {
        response = await API.updateRecord('flaggedAlarmProcess', {
          id: this.id,
          data: flaggedEventRule,
        })
      } else {
        response = await API.createRecord('flaggedAlarmProcess', {
          data: flaggedEventRule,
        })
      }
      let { error } = response
      if (isEmpty(error)) {
        let message = this.$t('flagged_event_rule.save_success_message', {
          ns: 'remote_monitor',
        })
        ftoast.success(message)
      } else {
        let message =
          error?.message ||
          this.$t('flagged_event_rule.save_fail_message', {
            ns: 'remote_monitor',
          })
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 1000,
        })
        this.saving = false
        let workflowContext = this.deSerializeWorkflowContext()
        this.flaggedEventRule.workflowContext = workflowContext
        return
      }
      this.saving = false
      this.goToFlaggedEventRuleList()
    },
    serializeData() {
      let workflowContext = this.getSerializedWorkflowContext()

      let { flaggedEventRule = {} } = this
      const formRefs = [
        'flagged-event-rule-basic-details',
        'flagged-event-rule-action',
        'flagged-event-closure-tab',
        'on-create-telemetry-criteria',
        'flagged-event-control-action-tab',
      ]
      let formData = formRefs.map(ref => {
        const form = getProperty(this, `$refs.${ref}`, {})
        let data = {}
        if (!isEmpty(form)) {
          data = form.getSerializedData()
        }
        const { invalid } = data || {}
        if (invalid) {
          return { invalid: true }
        }
        return data
      })

      let invalid = formData.some(data => data.invalid)
      if (invalid) {
        return { invalid: true }
      }

      formData = formData.reduce((result, data) => ({ ...result, ...data }), {})

      this.flaggedEventRule = {
        ...flaggedEventRule,
        ...formData,
        workflowContext,
      }
    },
    deSerializeData() {
      let clientId = getProperty(this, 'flaggedEventRule.client.id', null)
      let workflowContext = this.deSerializeWorkflowContext()

      this.flaggedEventRule.client = clientId
      this.flaggedEventRule.workflowContext = workflowContext
    },
    getSerializedWorkflowContext() {
      let { functionReturnType } = this
      let moduleName = 'alarm'
      let workflowContext = getProperty(
        this,
        'flaggedEventRule.workflowContext',

        {}
      )
      let workflowV2String = getProperty(
        this,
        'flaggedEventRule.workflowContext.workflowV2String',

        null
      )
      if (isEmpty(workflowV2String)) {
        return null
      } else {
        workflowV2String = `${functionReturnType} scriptFunc(Map ${moduleName}) {\n${workflowV2String}\n}`
        return {
          ...workflowContext,
          workflowV2String,
          isV2Script: true,
        }
      }
    },
    deSerializeWorkflowContext() {
      let { functionReturnType } = this
      let moduleName = 'alarm'

      let workflowContext = getProperty(
        this,
        'flaggedEventRule.workflowContext',
        {}
      )
      let workflowV2String = getProperty(
        this,
        'flaggedEventRule.workflowContext.workflowV2String',
        ''
      )
      workflowV2String = workflowV2String
        .replace(`${functionReturnType} scriptFunc(Map ${moduleName}) {\n`, '')
        .replace(new RegExp('\n}' + '$'), '')
      workflowContext = {
        ...workflowContext,
        workflowV2String,
      }
      return workflowContext
    },
  },
}
</script>
<style lang="scss">
.flagged-event-rule-form {
  .selected-tab {
    height: calc(100% - 40px);
    padding-bottom: 10px;
  }
}
</style>
<style lang="scss" scoped>
.script-editor-container {
  width: 100%;
  height: 100%;
}
</style>
