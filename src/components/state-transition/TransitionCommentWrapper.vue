<template>
  <component
    :is="activeComponent"
    :record="record"
    :moduleName="moduleName"
    :transition="transition"
    @onSave="onSave"
    @onClose="onClose"
  ></component>
</template>
<script>
import TransitionComment from './TransitionComment.vue'
import SRTransitionComment from './SRTransitionComment.vue'
export default {
  props: ['record', 'moduleName', 'transition'],
  components: { TransitionComment, SRTransitionComment },
  computed: {
    activeComponent() {
      return this.moduleName === 'serviceRequest'
        ? 'SRTransitionComment'
        : 'TransitionComment'
    },
  },
  methods: {
    onSave(data) {
      this.$emit('onSave', data)
    },
    onClose() {
      this.$emit('onClose')
    },
  },
}
</script>
