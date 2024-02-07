<template>
  <FContainer display="flex" flexDirection="column">
    <FText appearance="headingMed14" color="textMain">{{ formHeading }}</FText>
    <FText
      appearance="captionReg12"
      color="textCaption"
      marginTop="containerMedium"
      >{{ formDescription }}</FText
    >
  </FContainer>
</template>

<script>
import { FContainer, FText } from '@facilio/design-system'

export default {
  props: {
    formHeading: {
      type: String,
      default: '',
      required: true,
    },
    formDescription: {
      type: String,
      default: '',
      required: true,
    },
  },
  components: {
    FContainer,
    FText,
  },
}
</script>
