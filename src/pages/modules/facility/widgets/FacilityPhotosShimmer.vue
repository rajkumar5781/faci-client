<template>
  <FContainer display="flex">
    <FContainer
      v-for="index in loopedDivs"
      :key="index"
      marginRight="containerLarge"
    >
      <FShimmer :rounded="false" :height="100" :width="120" />
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
  data() {
    return {
      loopedDivs: [1, 2, 3],
    }
  },
}
</script>
