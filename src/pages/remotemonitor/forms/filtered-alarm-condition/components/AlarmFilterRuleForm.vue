<template>
  <FContainer>
    <ConnectedForm
      v-if="!loading"
      :renderDetails="renderDetails"
      @closeForm="goToAlarmFilterRuleList"
    >
      <template #save-action>
        <FButton @click="saveAlarmFilterRule" :disabled="saving">
          {{ `${$t('save')} & ${$t('actions.close')}` }}
        </FButton>
      </template>
      <template #ruleDetails-content>
        <RuleDetails
          ref="base-details-form"
          :isNew="isNew"
          :alarmFilterRule="alarmFilterRule"
        />
      </template>
      <template #controllerCriteria-content>
        <CriteriaForm
          moduleName="controller"
          :moduleDisplayName="$t('controller', { ns: 'remote_monitor' })"
          :criteriaObj="getProperty(alarmFilterRule, 'controllerCriteria', {})"
          @controllerCriteriaUpdate="setControllerCriteria"
        />
      </template>
      <template #siteCriteria-content>
        <CriteriaForm
          moduleName="site"
          :moduleDisplayName="$t('site', { ns: 'remote_monitor' })"
          :criteriaObj="getProperty(alarmFilterRule, 'siteCriteria', {})"
          @siteCriteriaUpdate="setSiteCriteria"
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
  </FContainer>
</template>
<script>
import { ConnectedForm } from '@facilio/ui/new-forms'
import RuleDetails from './RuleDetails.vue'
import CriteriaForm from '../../components/CriteriaForm.vue'
import { isEmpty } from '@facilio/utils/validation'
import { Lookup } from '@facilio/ui/new-forms'
import { pageTypes, findRouteForModule } from '@facilio/router'
import { API } from '@facilio/api'
import { FContainer, FButton, ftoast } from '@facilio/design-system'
import getProperty from 'dlv'

export default {
  props: ['id'],
  components: {
    FContainer,
    FButton,
    Lookup,
    ConnectedForm,
    CriteriaForm,
    RuleDetails,
  },
  data() {
    return {
      loading: false,
      saving: false,
      isNew: true,
      moduleName: 'alarmCorrelationRule',
      alarmFilterRule: {},
      renderDetails: {
        isForm: true,
        lazy: true,
        tabsList: [
          {
            label: this.$t('alarm_filter_rule.rule_details', {
              ns: 'remote_monitor',
            }),
            value: 'ruleDetails',
          },
          {
            label: this.$t('alarm_filter_rule.define_controller_criteria', {
              ns: 'remote_monitor',
            }),
            value: 'controllerCriteria',
          },
          {
            label: this.$t('alarm_filter_rule.define_site_criteria', {
              ns: 'remote_monitor',
            }),
            value: 'siteCriteria',
          },
        ],
        headerObject: {
          title: this.$t('alarm_filter_rule.new_alarm_correlation_rule', {
            ns: 'remote_monitor',
          }),
          description: this.$t(
            'alarm_filter_rule.alarm_filter_rule_description',
            {
              ns: 'remote_monitor',
            }
          ),
          gradient: 'violet',
        },
      },
    }
  },
  created() {
    this.init()
  },
  methods: {
    getProperty,
    async init() {
      this.loading = true
      let { id } = this
      if (!isEmpty(id)) {
        this.renderDetails.headerObject.title = this.$t(
          'alarm_filter_rule.edit_alarm_correlation_rule',
          { ns: 'remote_monitor' }
        )
        this.isNew = false
        await this.fetchAlarmFilterRule(id)
      }
      this.loading = false
    },
    setControllerCriteria(criteria) {
      this.alarmFilterRule.controllerCriteria = criteria
    },
    setSiteCriteria(criteria) {
      this.alarmFilterRule.siteCriteria = criteria
    },
    goToAlarmFilterRuleList() {
      let { name } = findRouteForModule(this.moduleName, pageTypes.LIST) || {}
      name && this.$router.push({ name }).catch(() => {})
    },
    async saveAlarmFilterRule() {
      this.saving = true
      let baseDetails = {}
      let ruleBaseDetailsFrom = getProperty(this, '$refs.base-details-form', {})
      if (!isEmpty(ruleBaseDetailsFrom)) {
        baseDetails = ruleBaseDetailsFrom.getSerializedData()
        let { invalid } = baseDetails
        if (invalid) {
          this.saving = false
          return
        }
      }
      let controllerCriteria = getProperty(
        this,
        'alarmFilterRule.controllerCriteria'
      )
      let alarmTypeId = getProperty(baseDetails, 'alarmType')
      let clientId = getProperty(baseDetails, 'client')
      let alarmFilterRule = {
        ...baseDetails,
        controllerCrtieria: controllerCriteria,
        alarmType: { id: alarmTypeId },
        client: { id: clientId },
        priority: 1,
      }
      let response
      if (!isEmpty(this.id)) {
        response = await API.updateRecord('alarmCorrelationRule', {
          id: this.id,
          data: alarmFilterRule,
        })
      } else {
        alarmFilterRule.status = true
        response = await API.createRecord('alarmCorrelationRule', {
          data: alarmFilterRule,
        })
      }
      let { error } = response
      if (isEmpty(error)) {
        let message = this.$t('alarm_filter_rule.save_success_message', {
          ns: 'remote_monitor',
        })
        ftoast.success(message)
      } else {
        let message =
          error?.message ||
          this.$t('alarm_filter_rule.save_fail_message', {
            ns: 'remote_monitor',
          })
        ftoast.critical(message)
        this.saving = false
        return
      }
      this.saving = false
      this.goToAlarmFilterRuleList()

      this.saving = false
    },
    async fetchAlarmFilterRule(id) {
      this.loading = true
      let { moduleName } = this
      let { alarmCorrelationRule, error } = await API.fetchRecord(moduleName, {
        id,
      })
      if (!isEmpty(error)) {
        ftoast.critical(
          error.message ||
            this.$t('alarm_filter_rule.alarm_correlation_rule_fetch_error', {
              ns: 'remote_monitor',
            })
        )
      } else {
        this.alarmFilterRule = alarmCorrelationRule
        // controllerCrtieria need to be removed after backend spelling fix
        let controllerCriteria = getProperty(
          alarmCorrelationRule,
          'controllerCrtieria',
          null
        )
        this.alarmFilterRule.controllerCriteria = controllerCriteria
      }
      this.loading = false
    },
  },
}
</script>
