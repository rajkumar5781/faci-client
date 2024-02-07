<template>
  <FContainer
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
    height="100%"
  >
    <FContainer height="100%"
      ><FText appearance="captionReg12" color="textCaption">{{ title }}</FText>
    </FContainer>
    <FContainer
      height="100%"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      alignSelf="stretch"
    >
      <FText appearance="headingMed20">{{ value }}</FText>

      <FContainer
        tag="span"
        v-if="isDiff"
        marginLeft="containerXLarge"
        paddingLeft="containerMedium"
        paddingRight="containerMedium"
        paddingBottom="containerSmall"
        borderRadius="medium"
        :backgroundColor="backgroundColor"
      >
        <FIcon
          v-if="percentage > 0"
          group="navigation"
          name="up-triangle-filled"
          size="12"
          color="borderSemanticRedLight"
        ></FIcon>
        <FIcon
          v-else
          group="navigation"
          name="down-triangle-filled"
          size="12"
          color="borderSemanticGreenMedium"
        ></FIcon>
        <FText appearance="captionReg12">
          {{ getPercentageText }}
        </FText></FContainer
      >
    </FContainer>
    <FContainer
      height="100%"
      display="flex"
      justifyContent="space-between"
      alignItems="baseLine"
      width="100%"
    >
      <FText color="textCaption" appearance="captionReg12">{{
        $t('summary.this_month_till_now', { ns: 'rule' })
      }}</FText>
      <FContainer>
        <FText color="textCaption" appearance="captionReg12">{{
          $t('summary.prev_month', { ns: 'rule' })
        }}</FText>
        <FText appearance="captionReg12">{{ tillLastMonthValue }}</FText>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import { FContainer, FText, FIcon } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
export default {
  components: {
    FContainer,
    FText,
    FIcon,
  },
  props: ['title', 'value', 'tillLastMonthValue', 'percentage'],
  computed: {
    backgroundColor() {
      let { percentage } = this
      return percentage > 0
        ? 'backgroundSemanticRedSubtle'
        : 'backgroundSemanticGreenLight'
    },
    getPercentage() {
      let { percentage } = this
      return Math.abs(Number.parseFloat(percentage).toFixed(0))
    },
    getPercentageText() {
      let { getPercentage } = this
      return `${getPercentage}%`
    },
    isDiff() {
      let { percentage } = this
      return !isEmpty(percentage) && percentage != 0
    },
  },
  methods: {
    isEmpty,
  },
}
</script>
