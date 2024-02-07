<template>
  <FContainer
    display="flex"
    flexDirection="column"
    rowGap="sectionSmall"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="sectionXSmall sectionSmall"
    class="flagged-event-closure-exception"
  >
    <FContainer
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <FContainer display="flex" alignItems="center">
        <FText appearance="headingMed14" color="textMain">
          {{
            $t('flagged_event_rule.flagged_alarm_closure_exception', {
              ns: 'remote_monitor',
            })
          }}
        </FText>
      </FContainer>
      <FSwitch v-model="flaggedEventClosureExceptionToggle" size="small" />
    </FContainer>
    <FContainer
      v-if="flaggedEventClosureExceptionToggle"
      display="flex"
      flexDirection="column"
      rowGap="containerXxLarge"
      borderRadius="high"
      backgroundColor="backgroundMidgroundSubtle"
      padding="sectionSmall"
    >
      <FText appearance="bodyReg14">
        {{
          $t('flagged_event_rule.flagged_alarm_closure_exception_description', {
            ns: 'remote_monitor',
          })
        }}
      </FText>
      <FForm
        ref="closure-exception-form"
        uniqueId="closure-exception-form"
        :model="flaggedEventClosureException"
        :rules="formRules"
        class="flex flex-col gap-y-4"
      >
        <FFormItem prop="closureRestriction">
          <FSelect
            v-model="flaggedEventClosureException.closureRestriction"
            :placeholder="`${$t('actions.select')} ${$t(
              'field_names.flagged_alarm_status',
              { ns: 'remote_monitor' }
            )}`"
            :options="closeRestrictionOptions"
          />
        </FFormItem>
        <FFormItem prop="warningMessage">
          <RichText
            v-if="canShowCloseWarningConfig"
            v-model="flaggedEventClosureException.warningMessage"
          />
        </FFormItem>
      </FForm>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FSwitch,
  FSelect,
  FForm,
  FFormItem,
} from '@facilio/design-system'
import { RichText } from '@facilio/ui/new-forms'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import dlv from 'dlv'

export default {
  components: {
    FContainer,
    FText,
    FSwitch,
    FSelect,
    RichText,
    FForm,
    FFormItem,
  },

  props: ['isNew', 'flaggedEventRuleClosureConfig', 'woStausOptions'],
  data() {
    return {
      loading: false,
      flaggedEventClosureException: {
        closureRestriction: null,
        warningMessage: null,
      },
      flaggedEventClosureExceptionToggle: false,
      closeRestrictionOptions: [],
      formRules: {
        closureRestriction: {
          required: true,
          trigger: 'change',
          message: this.$t(
            'flagged_event_rule.please_select_warn_or_restrict',
            { ns: 'remote_monitor' }
          ),
        },
      },
    }
  },
  computed: {
    canShowCloseWarningConfig() {
      let closureRestriction = dlv(
        this,
        'flaggedEventClosureException.closureRestriction',
        ''
      )
      return closureRestriction == 'WARN'
    },
  },
  watch: {
    flaggedEventClosureExceptionToggle(newVal) {
      if (!newVal) {
        this.flaggedEventClosureException = {
          closureRestriction: null,
          warningMessage: null,
        }
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.loading = true
      await this.setCloseRestrictionOptions()
      this.deserializeData()
      this.loading = false
    },
    getSerializedData() {
      let {
        flaggedEventClosureExceptionToggle,
        flaggedEventClosureException = {},
      } = this
      if (flaggedEventClosureExceptionToggle) {
        let closureExceptionForm = this.$refs['closure-exception-form']
        let idValidData = closureExceptionForm?.validate()
        if (!idValidData) {
          return { invalid: true }
        }
        let { closureRestriction, warningMessage } =
          flaggedEventClosureException
        if (!isEmpty(closureRestriction) || !isEmpty(warningMessage)) {
          return flaggedEventClosureException
        }
      }
      return { closureRestriction: null, flaggedEventCloseWarnMessage: null }
    },
    deserializeData() {
      let { isNew, flaggedEventRuleClosureConfig = {} } = this
      if (!isNew) {
        let { closureRestriction, warningMessage } =
          flaggedEventRuleClosureConfig
        this.flaggedEventClosureException = {
          closureRestriction,
          warningMessage,
        }
        if (!isEmpty(closureRestriction) || !isEmpty(warningMessage)) {
          this.flaggedEventClosureExceptionToggle = true
        }
      }
    },
    async setCloseRestrictionOptions() {
      let { data = {}, error } = await API.get(
        '/v3/flaggedAlarmProcess/closureRestrictionOptions'
      )
      if (isEmpty(error)) {
        let { closureRestrictionOptions } = data
        this.closeRestrictionOptions = closureRestrictionOptions
      }
    },
  },
}
</script>
<style lang="scss">
.flagged-event-closure-exception {
  .richtext-content {
    height: 200px !important;
    background-color: #fff;
  }
}
</style>
