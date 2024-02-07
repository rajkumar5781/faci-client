<template lang="">
  <FEmptyState :title="message" :vertical="true" illustration="no-data">
  </FEmptyState>
</template>
<script>
import { FEmptyState } from '@facilio/design-system'
export default {
  props: ['widget'],
  components: { FEmptyState },
  computed: {
    message() {
      let { message } = this.widget || {}
      return message
    },
  },
}
</script>
