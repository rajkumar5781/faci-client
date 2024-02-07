<template>
  <FContainer
    height="calc(100% - 24px)"
    width="100%"
    display="flex"
    justifyContent="center"
    marginTop="sectionSmall"
  >
    <FContainer
      height="100%"
      width="50%"
      overflow="scroll"
      display="flex"
      flexDirection="column"
      rowGap="sectionSmall"
    >
      <NotificationOnEventCreation
        ref="event-creation-notification"
        :isNew="isNew"
        :flaggedEventRule="flaggedEventRule"
      />
      <WoCreateConfig
        ref="wo-create-config"
        :flaggedEventRule="flaggedEventRule"
        :isNew="isNew"
      />
      <BureauEvaluation
        ref="bureau-evaluation"
        :flaggedEventRule="flaggedEventRule"
        :isNew="isNew"
      />
      <FlaggedEventRuleAttachment
        ref="flagged-event-rule-attachment"
        :isNew="isNew"
        :flaggedEventRule="flaggedEventRule"
      />
      <DeferredEmailNotification
        ref="deferred-email-notification"
        :isNew="isNew"
        :flaggedEventRule="flaggedEventRule"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer } from '@facilio/design-system'
import NotificationOnEventCreation from './NotificationOnEventCreation.vue'
import WoCreateConfig from './WoCreateConfig.vue'
import BureauEvaluation from './BureauEvaluation.vue'
import FlaggedEventRuleAttachment from './FlaggedEventRuleAttachment.vue'
import DeferredEmailNotification from './DeferredEmailNotification.vue'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
export default {
  components: {
    FContainer,
    NotificationOnEventCreation,
    WoCreateConfig,
    BureauEvaluation,
    FlaggedEventRuleAttachment,
    DeferredEmailNotification,
  },
  props: ['flaggedEventRule', 'isNew'],
  data() {
    return {
      dataDeserialized: false,
    }
  },
  methods: {
    getSerializedData() {
      const formRefs = [
        'event-creation-notification',
        'wo-create-config',
        'bureau-evaluation',
        'flagged-event-rule-attachment',
        'deferred-email-notification',
      ]

      const formData = formRefs.map(ref => {
        const form = getProperty(this, `$refs.${ref}`, {})
        let data = {}
        if (!isEmpty(form)) {
          data = form.getSerializedData()
        }
        const { invalid } = data
        if (invalid) {
          return { invalid: true }
        }
        return data
      })
      let invalid = formData.some(data => data.invalid)
      if (invalid) {
        return { invalid: true }
      }

      return formData.reduce((result, data) => ({ ...result, ...data }), {})
    },
    deserializeData() {},
  },
}
</script>
