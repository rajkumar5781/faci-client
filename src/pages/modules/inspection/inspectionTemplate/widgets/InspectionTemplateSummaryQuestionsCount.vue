<template>
  <FContainer
    display="flex"
    alignItems="center"
    height="100%"
    justifyContent="center"
    flexDirection="column"
    gap="containerLarge"
  >
    <FText appearance="captionMed12" color="textCaption">
      {{ $t('template.questions', { ns: 'inspection' }) }}
    </FText>
    <FText appearance="headingMed20" color="textDefault">
      {{ questionCount }}
    </FText>
  </FContainer>
</template>

<script>
import { FContainer, FText } from '@facilio/design-system'
import getProperty from 'dlv'

export default {
  components: { FContainer, FText },
  props: ['details'],
  computed: {
    questionCount() {
      let { details } = this
      let questions = getProperty(details, 'totalQuestions', 0)
      return questions
    },
  },
}
</script>
