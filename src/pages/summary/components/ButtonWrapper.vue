<template>
  <FTooltip placement="top" :mouseEnterDelay="1">
    <template #title v-if="isTooltipEnabled">{{ name }}</template>
    <FButton
      v-if="!isDropdown"
      :loading="loading"
      :appearance="appearance"
      :iconGroup="iconGroup"
      :iconName="iconName"
      :iconButton="iconButton"
      :iconPosition="iconPosition"
      :disabled="disabled"
      :split="split"
      v-on="$listeners"
    >
      <FText
        ref="btn-text"
        appearance="headingMed14"
        white-space="nowrap"
        overflow="hidden"
        text-overflow="ellipsis"
        :max-width="maxWidth"
        >{{ isDropdown || !iconButton ? name : '' }}</FText
      >
    </FButton>
    <FMenuItem
      v-else
      :style="{ cursor: disabled ? 'not-allowed' : '' }"
      v-on="disabled ? {} : $listeners"
    >
      <FContainer
        height="100%"
        display="flex"
        alignItem="center"
        gap="containerLarge"
      >
        <FIcon
          v-if="iconName"
          size="16"
          :group="iconGroup"
          :name="iconName"
          :pressable="false"
        ></FIcon>
        <FText
          ref="btn-text"
          white-space="nowrap"
          overflow="hidden"
          text-overflow="ellipsis"
          max-width="112px"
          appearance="bodyReg14"
          >{{ name }}</FText
        >
      </FContainer>
    </FMenuItem>
  </FTooltip>
</template>
<script>
import {
  FButton,
  FTooltip,
  FText,
  FContainer,
  FIcon,
  FMenuItem,
} from '@facilio/design-system'
import { isFunction } from '@facilio/utils/validation'
export default {
  props: [
    'iconGroup',
    'appearance',
    'iconName',
    'iconButton',
    'iconPosition',
    'loading',
    'disabled',
    'split',
    'name',
    'width',
    'isDropdown',
    'maxWidth',
  ],
  components: { FButton, FTooltip, FText, FContainer, FIcon, FMenuItem },
  data() {
    return {
      isTooltipEnabled: false,
      isFunction,
    }
  },
  mounted() {
    let content = this.$refs['btn-text']?.$el
    let { offsetWidth = Infinity, scrollWidth = 0 } = content || {}
    this.isTooltipEnabled = scrollWidth > offsetWidth
  },
}
</script>
