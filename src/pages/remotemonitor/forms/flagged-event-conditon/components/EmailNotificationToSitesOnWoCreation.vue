<template>
  <FContainer
    display="flex"
    borderRadius="high"
    padding="sectionXSmall"
    backgroundColor="backgroundMidgroundSubtle"
  >
    <FContainer
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        rowGap="containerMedium"
      >
        <FContainer display="flex" alignItems="center" height="20px">
          <FText appearance="headingMed14" color="textMain">
            {{ $t('email_notification') }}
          </FText>
        </FContainer>
        <FText
          appearance="captionReg12"
          color="textCaption"
          verticalAlign="middle"
        >
          {{
            $t('flagged_event_rule.wo_create_notification_description', {
              ns: 'remote_monitor',
            })
          }}
        </FText>
      </FContainer>
      <FButton appearance="secondary" @click="showEmailActionDialog">
        {{ $t('actions.configure') }}
      </FButton>
    </FContainer>
    <EmailAction
      v-if="showEmailConfig"
      :title="
        $t('flagged_event_rule.email_to_sites_on_wo_creation', {
          ns: 'remote_monitor',
        })
      "
      moduleName="flaggedAlarm"
      :actionObj="siteMail"
      @onSave="setSiteMail"
      @onClose="closeEmailActionDialog"
    />
  </FContainer>
</template>
<script>
import { FContainer, FText, FButton } from '@facilio/design-system'
import EmailAction from '../../../components/email-action/EmailAction.vue'
import { isEmpty } from '@facilio/utils/validation'
export default {
  components: { FContainer, FText, FButton, EmailAction },
  props: ['isNew', 'flaggedEventRuleWoConfig'],
  data() {
    return {
      dataDeserialized: false,
      showEmailConfig: false,
      siteMail: {},
    }
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
      let { siteMail } = this
      if (!isEmpty(siteMail)) {
        return { siteMail: { actions: [siteMail] } }
      }
      return {}
    },
    deserializeData() {
      let { isNew } = this
      if (!isNew) {
        let { flaggedEventRuleWoConfig = {} } = this
        let { siteMail } = flaggedEventRuleWoConfig
        this.siteMail = siteMail
      }
      this.dataDeserialized = true
    },
    setSiteMail(mailObj) {
      this.siteMail = mailObj
      this.showEmailConfig = false
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
