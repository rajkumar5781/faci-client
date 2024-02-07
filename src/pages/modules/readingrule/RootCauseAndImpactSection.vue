<template>
  <FContainer
    display="flex"
    flexDirection="column"
    flex="1 0 0"
    paddingLeft="containerXxLarge"
  >
    <FText appearance="captionMed12">{{ title }}</FText>
    <FContainer paddingTop="containerMedium">
      <FTags
        appearance="status"
        :text="statusText"
        :statusType="statusType"
      ></FTags>
    </FContainer>
  </FContainer>
</template>

<script>
import { FContainer, FText, FTags } from '@facilio/design-system'

export default {
  components: {
    FContainer,
    FText,
    FTags,
  },
  props: ['title', 'statusText', 'statusType'],
}
</script>

<style scoped></style>
