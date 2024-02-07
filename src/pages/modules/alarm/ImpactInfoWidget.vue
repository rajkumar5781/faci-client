<template>
  <FContainer padding="sectionSmall" display="flex" alignItems="center">
    <FText
      padding="containerXLarge containerNone"
      color="textMain"
      appearance="headingMed20"
      >{{ impactName }}</FText
    >
  </FContainer>
</template>
<script>
import { FContainer, FText } from '@facilio/design-system'
import getProperty from 'dlv'
export default {
  props: ['details'],
  components: {
    FText,
    FContainer,
  },
  computed: {
    impactName() {
      let { details: alarm } = this
      let { rule } = alarm || {}
      let { impact } = rule
      return getProperty(impact, 'name', '--')
    },
  },
}
</script>
