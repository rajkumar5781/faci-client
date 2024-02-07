<template>
  <FContainer padding="containerXxLarge">
    <FContainer marginRight="sectionLarge">
      <FShimmer :rounded="false" :height="40" :width="480"></FShimmer>
    </FContainer>
    <FContainer display="flex" marginTop="containerXxLarge">
      <FContainer marginRight="containerMedium">
        <FShimmer :rounded="false" :height="40" :width="160"></FShimmer>
      </FContainer>
      <FContainer marginRight="containerMedium">
        <FShimmer :rounded="false" :height="40" :width="157"></FShimmer>
      </FContainer>
      <FContainer>
        <FShimmer :rounded="false" :height="40" :width="157"></FShimmer>
      </FContainer>
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
