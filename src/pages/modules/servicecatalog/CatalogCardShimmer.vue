<template>
  <FContainer
    border="1px solid"
    padding="containerXxLarge"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
  >
    <FContainer marginBottom="containerXLarge">
      <FShimmer :height="30" :width="30"></FShimmer>
    </FContainer>
    <FContainer marginBottom="containerLarge">
      <FShimmer :height="20"></FShimmer>
    </FContainer>
    <FContainer>
      <FShimmer :height="40"></FShimmer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FShimmer } from '@facilio/design-system'

export default {
  components: {
    FContainer,
    FShimmer,
  },
}
</script>
