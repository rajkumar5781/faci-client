<template>
  <FContainer display="flex" gap="sectionLarge" padding="containerXxLarge">
    <div>
      <div>
        <FShimmer :rounded="false" :height="20" :width="80" />
      </div>
      <FContainer marginTop="containerLarge">
        <FShimmer :rounded="false" :height="50" :width="130" />
      </FContainer>
    </div>
    <div>
      <div>
        <FShimmer :rounded="false" :height="50" :width="50" />
      </div>
    </div>
  </FContainer>
</template>
<script>
import { FShimmer, FContainer } from '@facilio/design-system'

export default {
  components: {
    FShimmer,
    FContainer,
  },
}
</script>
