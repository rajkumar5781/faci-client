<template>
  <FContainer
    display="flex"
    alignItems="center"
    height="100%"
    justifyContent="center"
    flexDirection="column"
    gap="containerLarge"
  >
    <FText appearance="captionMed12" color="textCaption">{{
      triggerText
    }}</FText>
    <FTooltip placement="bottom">
      <template slot="title">
        {{ lastTriggerdTime }}
      </template>
      <FText appearance="headingMed20" color="textDefault">{{
        lastTriggeredOn
      }}</FText>
    </FTooltip>
  </FContainer>
</template>

<script>
import { FContainer, FText, FTooltip } from '@facilio/design-system'
import getProperty from 'dlv'
import { fromNow, formatDate } from '../../../../../utils/formatter'

export default {
  components: { FContainer, FText, FTooltip },
  props: ['details'],
  data() {
    return {
      triggerText: null,
    }
  },
  computed: {
    lastTriggerdTime() {
      let lastTriggeredMillis = getProperty(this, 'details.lastTriggeredTime')
      let lastTriggeredTime = ''
      if (lastTriggeredMillis) {
        lastTriggeredTime = formatDate(lastTriggeredMillis)
      }
      return lastTriggeredTime
    },
    lastTriggeredOn() {
      let lastTriggered = getProperty(this, 'details.lastTriggeredTime')
      let triggeredTime = fromNow(lastTriggered)
      if (lastTriggered) {
        this.triggerText = `${this.$t('template.last_triggered', {
          ns: 'inspection',
        })}`
        return triggeredTime
      } else {
        this.triggerText = `${this.$t('template.not_triggered', {
          ns: 'inspection',
        })}`
        return null
      }
    },
  },
}
</script>
