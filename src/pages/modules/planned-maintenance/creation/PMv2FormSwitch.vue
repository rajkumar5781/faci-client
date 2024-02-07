<template>
  <FContainer :class="hasMultipleForms && 'form-switch-container'">
    <!-- <FContainer class="form-switch-text-container">
      <fc-icon
        v-if="isEdit"
        group="action"
        name="edit-form"
        class="mr-2"
      ></fc-icon>
      <fc-icon v-else group="action" name="add-form" class="mr-2"></fc-icon>
      <FText appearance="heading1" fontWeight="bolder">{{ title }}</FText>
    </FContainer> -->
    <FContainer>
      <FSelect
        v-model="modelValue"
        :options="formOptions"
        :clearable="false"
        :disabled="!hasMultipleForms"
      />
    </FContainer>
  </FContainer>
</template>

<script>
import { FSelect, FText } from '@facilio/design-system'
import { defineCustomElements as fcIcon } from '@facilio/icons/dist/loader'
fcIcon(window)
export default {
  name: 'PMv2FormSwitch',
  components: { FSelect, FText },
  props: {
    form: {
      type: Object,
      default: () => ({}),
    },
    formsList: {
      type: Array,
      default: () => [],
    },
    moduleDisplayName: {
      type: String,
      default: '',
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    modelValue: {
      get() {
        let { form } = this || {}
        return form.id
      },
      set(value) {
        this.$emit('switchForm', value)
      },
    },
    formOptions() {
      let { formsList } = this || {}
      return formsList.map(form => {
        return { label: form.displayName, value: form.id }
      })
    },
    hasMultipleForms() {
      let { formsList } = this || {}
      return ![0, 1].includes(formsList.length)
    },
    title() {
      let { moduleDisplayName } = this || {}
      return moduleDisplayName
    },
  },
}
</script>

<style scoped>
.form-switch-container {
  display: flex;
  align-items: center;
  padding: 0px;
  justify-content: end;
}
.form-switch-text-container {
  padding: 5px 20px 5px 0px;
  display: flex;
  align-items: center;
  border-right: solid 1px #1d384e;
}
</style>
<style lang="scss">
.form-switch-container {
  input {
    cursor: pointer;
  }
}
</style>
