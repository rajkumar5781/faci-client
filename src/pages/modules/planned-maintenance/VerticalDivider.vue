<template>
  <FContainer>
    <FDivider :width="width" :height="height" />
  </FContainer>
</template>

<script>
import { FContainer, FDivider } from '@facilio/design-system'
export default {
  components: {
    FContainer,
    FDivider,
  },
  props: {
    width: {
      type: String,
      default: '1px',
    },
    height: {
      type: String,
      default: '24px',
    },
  },
}
</script>

<style></style>
