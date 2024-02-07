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
          'flagged_event_rule.on_flagged_alarm_creation',
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
        $t('flagged_event_rule.flagged_alarm_creation_email', {
          ns: 'remote_monitor',
        })
      "
      moduleName="flaggedAlarm"
      :actionObj="emailRule"
      @onSave="setEmailRule"
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
  props: ['isNew', 'flaggedEventRule'],
  data() {
    return { dataDeserialized: false, showEmailConfig: false, emailRule: {} }
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
      let { emailRule } = this
      return !isEmpty(emailRule)
    },
  },
  created() {
    this.init()
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
      let { emailRule } = this
      if (!isEmpty(emailRule)) {
        let { actionType, templateJson } = emailRule
        emailRule = { actionType, templateJson }
        emailRule = { actions: [emailRule] }
        return { emailRule }
      }
      return { emailRule: null }
    },
    deserializeData() {
      let { isNew, flaggedEventRule = {} } = this
      if (!isNew) {
        let { emailRule = {} } = flaggedEventRule
        let { actions = [] } = emailRule
        if (!isEmpty(actions)) {
          let emailNotification = actions[0] || {}
          emailNotification.templateJson = emailNotification?.template
          this.emailRule = emailNotification
          this.canShowConfig = true
        } else {
          this.emailRule = {}
        }
      }
      this.dataDeserialized = true
    },
    setEmailRule(mailData) {
      this.emailRule = mailData
      this.showEmailConfig = false
    },
    resetEmailRule() {
      this.emailRule = {}
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
