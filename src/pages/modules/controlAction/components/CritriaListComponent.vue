<template>
  <FContainer
    width="100%"
    borderRadius="high"
    border="1px solid"
    borderColor="backgroundContainer"
    boxShadow="lightLow02"
  >
    <FContainer padding="containerXLarge">
      <FText appearance="headingMed14"> {{ getHeaderName }}</FText>
    </FContainer>
    <FContainer
      v-if="showBanner"
      display="flex"
      alignItems="center"
      width="100"
      padding="containerMedium containerXxLarge"
      backgroundColor="backgroundPrimaryDefault"
      color="backgroundContainer"
    >
      <FContainer
        paddingRight="containerMedium"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FIcon
          group="action"
          name="info"
          color="iconNeutralGrey01Subtler"
          size="16"
          :pressable="false"
        />
      </FContainer>
      <FContainer display="flex" width="100%">
        <FText appearance="bodyReg14">{{
          $t('controls.criteria_desc', { ns: 'energy', moduleName })
        }}</FText></FContainer
      >
      <FContainer display="flex" justifyContent="left">
        <FIcon
          group="action"
          name="cross-circle"
          size="16"
          @click="hideBanner()"
        />
      </FContainer>
    </FContainer>
    <FContainer padding="containerXLarge" minHeight="120px">
      <NewCriteriaBuilder
        ref="criteriaBuilder"
        v-model="renderDetails.criteria"
        :moduleName="moduleName"
        :isOneLevelEnabled="true"
        :showHeader="false"
        :showCriteriaTitle="false"
        :isAttributeBuilder="true"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FIcon } from '@facilio/design-system'
import { NewCriteriaBuilder } from '@facilio/criteria'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
export default {
  components: { FContainer, NewCriteriaBuilder, FText, FIcon },
  props: ['renderDetails'],
  data() {
    return {
      enableBanner: true,
    }
  },
  computed: {
    moduleName() {
      return getProperty(this, 'renderDetails.moduleName', 'asset')
    },
    showBanner() {
      let { enableBanner, renderDetails = {} } = this
      let { criteria } = renderDetails
      
      return (
        getProperty(this, 'renderDetails.infoBanner', false) &&
        enableBanner &&
        isEmpty(criteria)
      )
    },
    getHeaderName() {
      return this.getProperty(
        this,
        'renderDetails.headerName',
        'Default Header'
      )
    },
  },
  methods: {
    getProperty,
    hideBanner() {
      this.enableBanner = false
    },
  },
}
</script>
