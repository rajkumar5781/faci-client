<template>
    <FContainer padding="containerXxLarge">
        <FContainer display="flex">
            <FContainer marginRight="sectionLarge">
                <FShimmer :rounded="false" :height="40" :width="200"></FShimmer>
            </FContainer>
            <FContainer>
                <FShimmer :rounded="false" :height="40" :width="200"></FShimmer>
            </FContainer>
        </FContainer>
        <FContainer display="flex" marginTop="containerXxLarge">
            <FShimmer :rounded="false" :height="70" :width="450"></FShimmer>
        </FContainer>
        <FContainer marginTop="containerXxLarge">
            <FShimmer :rounded="false" :height="40" :width="200"></FShimmer>
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
