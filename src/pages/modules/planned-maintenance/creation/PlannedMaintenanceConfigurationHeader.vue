<template>
  <FContainer
    display="flex"
    flexDirection="row"
    alignItems="center"
    justify-content="space-between"
  >
    <FContainer display="flex" flexDirection="column">
      <FText :appearance="headingAppearance" :color="headingColor">
        {{ heading }}
      </FText>
      <FText
        :appearance="descriptionAppearance"
        :color="descriptionColor"
        marginTop="containerMedium"
      >
        {{ description }}
      </FText>
    </FContainer>
    <slot name="actions"></slot>
  </FContainer>
</template>
<script>
import { FContainer, FText } from '@facilio/design-system'

export default {
  components: {
    FContainer,
    FText,
  },
  props: {
    heading: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    headingAppearance: {
      type: String,
      default: 'headingMed16',
    },
    descriptionAppearance: {
      type: String,
      default: 'bodyReg14',
    },
    headingColor: {
      type: String,
      default: 'textMain',
    },
    descriptionColor: {
      type: String,
      default: 'textCaption',
    },
  },
}
</script>
