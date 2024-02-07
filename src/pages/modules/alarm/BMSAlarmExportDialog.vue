<template>
  <FContainer>
    <FContainer
      display="flex"
      paddingBottom="containerXLarge"
      marginBottom="containerSmall"
    >
      <FCheckbox :disabled="true" :value="true" />
      <FText appearance="bodyReg14" color="textMain">{{
        $t('alarm.alarm_events', 'All Events', { ns: 'alarm' })
      }}</FText>
    </FContainer>
    <FCheckboxGroup v-model="modelValue" :options="options" />
  </FContainer>
</template>

<script>
import {
  FContainer,
  FCheckbox,
  FText,
  FCheckboxGroup,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
export default {
  components: {
    FContainer,
    FCheckbox,
    FText,
    FCheckboxGroup,
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    assetFields: Array,
  },
  computed: {
    options() {
      let { assetFields } = this
      let checkBoxOptions = []
      if (!isEmpty(assetFields)) {
        assetFields.forEach(field => {
          checkBoxOptions.push({ label: field.displayName, value: field.id })
        })
      }
      return checkBoxOptions
    },
    modelValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
        this.$emit('change', value)
      },
    },
  },
}
</script>
