<template>
  <FSelect
    v-model="modelValue"
    :disabled="disabled"
    :options="options"
    :multiple="false"
    :placeholder="placeholder"
    @change="onScopeChange"
  >
  </FSelect>
</template>

<script>
import { FSelect } from '@facilio/design-system'

export default {
  components: {
    FSelect,
  },
  props: ['value', 'options', 'disabled', 'placeholder'],
  computed: {
    modelValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
  },
  methods: {
    onScopeChange(value) {
      // let value = this || {}
      this.$emit('onScopeChange', value)
    },
  },
}
</script>

<style></style>
