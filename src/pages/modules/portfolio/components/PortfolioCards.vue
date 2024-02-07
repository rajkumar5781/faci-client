<template>
  <FContainer
    :height="loading ? `96%` : `100%`"
    borderRadius="high"
    border="1px solid"
    borderColor="borderNeutralBaseSubtler"
    background="backgroundContainer"
  >
    <FContainer v-if="loading" height="100%" width="100%">
      <FShimmer :rounded="false" :height="90" />
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="flex-start"
      gap="containerLarge"
      padding="containerXLarge"
      width="100%"
    >
      <FContainer>
        <FText appearance="headingMed14" color="textMain">{{ title }}</FText>
      </FContainer>
      <FContainer
        display="flex"
        padding="containerMedium"
        alignItems="center"
        gap="containerLarge"
      >
        <FContainer display="flex" alignItems="center" gap="containerLarge">
          <FContainer>
            <FIcon
              padding="containerNone"
              :group="iconGroup"
              :name="iconName"
              :size="'20'"
              :pressable="false"
              color="textDefault"
            />
          </FContainer>
          <FContainer>
            <FText color="textMain" appearance="headingMed20">{{
              count
            }}</FText>
          </FContainer>
        </FContainer>
        <FContainer v-if="area">
          <FText appearance="bodyReg14" color="textCaption">{{
            `${area}`
          }}</FText>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FShimmer, FIcon, FText } from '@facilio/design-system'
export default {
  components: {
    FContainer,
    FShimmer,
    FText,
    FIcon,
  },
  props: ['loading', 'title', 'count', 'iconName', 'iconGroup', 'area'],
}
</script>
