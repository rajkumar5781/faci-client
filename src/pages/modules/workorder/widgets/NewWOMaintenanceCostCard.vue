<template>
  <FContainer display="flex" flex-direction="column" gap="containerXLarge">
    <FContainer>
      <FContainer
        padding="containerMedium containerNone"
        display="flex"
        justifyContent="space-between"
      >
        <FText appearance="headingMed14" color="textMain">{{
          $t('workorder.actuals_cost', 'Maintenance Cost', {
            ns: 'workorder',
          })
        }}</FText>

        <FButton @click="openInfo('actuals')" size="small" appearance="link">{{
          $t('workorder.view_detail', 'View Details', {
            ns: 'workorder',
          })
        }}</FButton>
      </FContainer>
      <FContainer
        padding="containerMedium containerNone"
        display="flex"
        justifyContent="space-between"
        align-self="stretch"
        alignItems="center"
        gap="containerLarge"
      >
        <FText appearance="bodyReg14" color="textMain">{{
          actualsGrossTotal
        }}</FText>
      </FContainer>
    </FContainer>

    <FContainer display="flex" flex-direction="column" alignItems="flex-start">
      <FContainer
        padding="containerMedium containerNone"
        display="flex"
        justifyContent="space-between"
        align-self="stretch"
        alignItems="center"
      >
        <FText appearance="headingMed14" color="textMain">{{
          $t('workorder.plans_cost', 'Estimated Cost', {
            ns: 'workorder',
          })
        }}</FText>
        <FButton @click="openInfo('plans')" size="small" appearance="link">{{
          $t('workorder.view_detail', 'View Details', {
            ns: 'workorder',
          })
        }}</FButton>
      </FContainer>
      <FContainer
        padding="containerMedium containerNone"
        display="flex"
        justifyContent="space-between"
        align-self="stretch"
        alignItems="center"
        gap="containerLarge"
      >
        <FText appearance="bodyReg14" color="textMain">
          {{ plansGrossTotal }}</FText
        >
      </FContainer>
    </FContainer>
    <CostInfo
      v-if="showDetails"
      :details="workorder"
      :costType="costType"
      :costDetails="costDetails"
      :showDetails="showDetails"
      :isLoading="isLoading"
      @updateAdditionalCost="updateAdditionalCost"
      @closeInfo="closeInfo"
    />
  </FContainer>
</template>
<script>
import { FContainer, FText, FButton } from '@facilio/design-system'
import CostInfo from './CostInfo.vue'
import { getCurrency } from '../../../../utils/formatter'

import getProperty from 'dlv'
export default {
  name: 'WOMaintenanceCostCard',
  props: ['workorder', 'plannedMaintenance', 'actualMaintenance', 'isLoading'],
  data: () => ({
    showDetails: false,
    costType: null,
    costDetails: {},
    actualMaintenanceObj: {
      itemCost: null,
      toolCost: null,
      serviceCost: null,
      grossAmount: null,
    },
  }),
  components: { FContainer, FText, FButton, CostInfo },
  computed: {
    plansGrossTotal() {
      let { plannedMaintenance } = this
      let grossAmount = getProperty(plannedMaintenance, 'grossAmount', 0)

      return `${getCurrency()} ${grossAmount}`
    },
    actualsGrossTotal() {
      let { actualMaintenanceObj } = this
      let grossAmount = getProperty(actualMaintenanceObj, 'grossAmount', 0)

      return `${getCurrency()} ${grossAmount}`
    },
  },
  created() {
    this.init()
  },
  watch: {
    actualMaintenance: {
      async handler(newVal) {
        let { costType } = this
        this.actualMaintenanceObj = newVal || {}
        if (costType === 'actuals') this.costDetails = newVal || {}
      },
      deep: true,
    },
  },
  methods: {
    getCurrency,
    async init() {
      let { actualMaintenance } = this
      this.actualMaintenanceObj = actualMaintenance || {}
    },
    openInfo(type) {
      let { plannedMaintenance, actualMaintenanceObj } = this
      this.costType = type
      this.costDetails =
        type === 'plans' ? plannedMaintenance : actualMaintenanceObj
      this.showDetails = true
    },
    updateAdditionalCost({ costList, skipOldValues }) {
      let { actualMaintenanceObj } = this
      let { customCostList } = actualMaintenanceObj || {}
      if (!skipOldValues) {
        customCostList = [...customCostList, ...costList]
      } else {
        customCostList = costList
      }
      let _actualMaintenanceObj = { ...actualMaintenanceObj, customCostList }
      this.actualMaintenanceObj = _actualMaintenanceObj
      this.costDetails = _actualMaintenanceObj
      this.$emit('updateActualGrossTotal', _actualMaintenanceObj)
    },
    closeInfo() {
      this.showDetails = false
      this.costType = null
      this.costDetails = null
    },
  },
}
</script>
