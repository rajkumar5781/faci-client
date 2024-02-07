<template>
  <FIcon :group="getGroup" :name="getIconName" size="25"></FIcon>
</template>

<script>
import { FIcon } from '@facilio/design-system'
export default {
  props: ['rating', 'isActive'],
  components: { FIcon },
  computed: {
    getGroup() {
      let { isActive } = this
      return isActive ? 'emoji-filled' : 'emoji'
    },
    getIconName() {
      let { rating } = this

      const emoji = {
        0: 'sad-level-1',
        1: 'sad-level-2',
        2: 'sad-level-3',
        3: 'sad-level-4',
        4: 'neutral',
        5: 'happy-level-1',
        6: 'happy-level-2',
        7: 'happy-level-3',
        8: 'happy-level-4',
        9: 'happy-level-5',
      }
      return emoji[rating]
    },
  },
}
</script>
