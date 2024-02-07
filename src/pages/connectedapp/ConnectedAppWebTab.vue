<template>
  <ConnectedApp
    class="h-full overflow-hidden"
    :widgetId="widgetid"
    :handlers="handlers"
  ></ConnectedApp>
</template>

<script>
import { ConnectedApp } from '@facilio/ui/connected-app'
export default {
  components: { ConnectedApp },
  props: ['widgetid'],
  data() {
    return {
      handlers: {},
    }
  },
}
</script>
