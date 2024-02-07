<template>
  <FSegmentedControl
    v-model="isListView"
    :tabsList="tabsLists"
    @change="onChangeVisualType"
  />
</template>
<script>
import { FRadioGroup, FIcon, FSegmentedControl } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  props: ['currentView'],
  components: { FRadioGroup, FIcon, FSegmentedControl },
  data() {
    return {
      isListView: 'list',
      tabsLists: [
        { label: 'List', value: 'list' },
        { label: 'Calendar', value: 'calendar' },
      ],
    }
  },
  computed:{
    hasCalendar(){
      let { startTime } = this.$route?.query || {}

      return !isEmpty(startTime)
    },
  },
  watch: {
    hasCalendar: {
      handler(newVal){
        this.isListView = newVal ? 'calendar' : 'list'
      },
      immediate: true,
    },
    isListView: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('onSwitchVisualize', newVal === 'list')
        }
      },
      immediate: true,
    },
    
  },
  methods: {
    onChangeVisualType(val) {
      if (val === 'list') {
        let { query = {} } = this.$route || {}
        let { search, includeParentFilter } = query

        this.$router
          .replace({ query: { search, includeParentFilter } })
          .catch(() => {})
      }
    },
  },
}
</script>
