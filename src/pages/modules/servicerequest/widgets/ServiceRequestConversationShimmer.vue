<template>
  <FContainer padding="containerXLarge">
    <div v-for="index in loopedDivs" :key="index">
      <FContainer
        display="flex"
        marginTop="containerXxLarge"
        marginBottom="containerXxLarge"
      >
        <div>
          <FShimmer :width="40" :height="40" :rounded="true"></FShimmer>
        </div>
        <FContainer paddingLeft="containerXLarge">
          <FShimmer :width="750" :height="150"></FShimmer>
        </FContainer>
      </FContainer>
    </div>
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
