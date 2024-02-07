<template>
  <FContainer
    border="solid 1px"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    backgroundColor="backgroundMidgroundSubtle"
    padding="containerLarge containerXLarge"
    display="flex"
    alignItems="center"
    justifyContent="space-between"
  >
    <FContainer display="flex" alignItems="center">
      <FIcon
        group="alert"
        name="circle-warning-filled"
        size="14"
        :pressable="false"
        color="iconPrimaryDefault"
      />
      <FText
        marginLeft="containerLarge"
        color="textMain"
        appearance="captionReg12"
      >
        {{ staticAlertMessage }}
      </FText>
    </FContainer>

    <FIcon
      group="default"
      name="close"
      size="14"
      @click="onClickCloseStaticAlertBanner"
    />
  </FContainer>
</template>

<script>
import { FContainer, FButton, FText, FIcon } from '@facilio/design-system'
export default {
  name: 'PlannerStaticAlertBanner',
  props: {
    staticAlertMessage: {
      type: String,
      required: true,
    },
  },
  components: {
    FContainer,
    FButton,
    FText,
    FIcon,
  },

  methods: {
    onClickCloseStaticAlertBanner() {
      //   this.$emit('onClickCloseStaticAlertBanner')
      this.$emit('update:isPlannerStaticAlertBannerVisible', false)
    },
  },
}
</script>

<style></style>
