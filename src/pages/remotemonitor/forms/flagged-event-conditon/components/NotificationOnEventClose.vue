<template>
  <FContainer
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
    alignItems="center"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    padding="containerXxLarge sectionSmall"
  >
    <FText appearance="headingMed14">
      {{
        `${$t('email_notification')} ${$t(
          'flagged_event_rule.on_flagged_alarm_close',
          { ns: 'remote_monitor' }
        )}`
      }}
    </FText>
    <FContainer display="flex" columnGap="containerLarge">
      <FButton appearance="secondary" @click="showEmailActionDialog">
        {{ configureButtonText }}
      </FButton>
      <FIcon
        v-if="canShowEmailRuleDelete"
        group="action"
        name="delete"
        size="16"
        :pressable="true"
        color="textCaption"
        @click="resetEmailRule"
      />
    </FContainer>

    <EmailAction
      v-if="showEmailConfig"
      :title="
        $t('flagged_event_rule.flagged_alarm_close_email', {
          ns: 'remote_monitor',
        })
      "
      moduleName="flaggedAlarm"
      :actionObj="closeEmailRule"
      @onSave="setcloseEmailRule"
      @onClose="closeEmailActionDialog"
    />
  </FContainer>
</template>
<script>
import { FContainer, FText, FButton, FIcon } from '@facilio/design-system'
import EmailAction from '../../../components/email-action/EmailAction.vue'
import { isEmpty } from '@facilio/utils/validation'
export default {
  components: { FContainer, FText, FButton, FIcon, EmailAction },
  props: ['isNew', 'flaggedEventRuleClosureConfig'],
  data() {
    return {
      dataDeserialized: false,
      showEmailConfig: false,
      closeEmailRule: {},
    }
  },
  created() {
    this.init()
  },
  computed: {
    configureButtonText() {
      let { canShowEmailRuleDelete } = this
      let configureButtonText = canShowEmailRuleDelete
        ? this.$t('actions.edit_configuration')
        : this.$t('actions.configure')
      return configureButtonText
    },
    canShowEmailRuleDelete() {
      let { closeEmailRule } = this
      return !isEmpty(closeEmailRule)
    },
  },
  methods: {
    init() {
      this.deserializeData()
    },
    getSerializedData() {
      let { dataDeserialized } = this
      if (!dataDeserialized) {
        this.deserializeData()
      }
      let { closeEmailRule = {} } = this
      if (!isEmpty(closeEmailRule)) {
        let { actionType, templateJson } = closeEmailRule
        closeEmailRule = { actionType, templateJson }
        closeEmailRule = { actions: [closeEmailRule] }
        return { closeEmailRule }
      }
      return { closeEmailRule: null }
    },
    deserializeData() {
      let { isNew, flaggedEventRuleClosureConfig = {} } = this
      if (!isNew) {
        let { closeEmailRule = {} } = flaggedEventRuleClosureConfig
        let { actions = [] } = closeEmailRule
        if (!isEmpty(actions)) {
          let emailNotification = actions[0] || {}
          emailNotification.templateJson = emailNotification?.template
          this.closeEmailRule = emailNotification
          this.canShowConfig = true
        } else {
          this.closeEmailRule = {}
        }
      }
      this.dataDeserialized = true
    },
    setcloseEmailRule(mailData) {
      this.closeEmailRule = mailData
      this.showEmailConfig = false
    },
    resetEmailRule() {
      this.closeEmailRule = {}
    },
    showEmailActionDialog() {
      this.showEmailConfig = true
    },
    closeEmailActionDialog() {
      this.showEmailConfig = false
    },
  },
}
</script>
