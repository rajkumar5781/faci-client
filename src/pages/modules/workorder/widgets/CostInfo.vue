<template>
  <FModal
    :title="dialogTitle"
    :visible.sync="showDetails"
    size="S"
    @cancel="closeInfo()"
    :hideFooter="false"
  >
    <FContainer padding="containerXLarge">
      <FContainer v-if="isLoading">
        <FShimmer :rounded="rounded" />
      </FContainer>
      <FContainer v-else>
        <FContainer
          v-for="(key, label) in fixedCostInfo"
          :key="label"
          display="flex"
          justifyContent="space-between"
          padding="containerXLarge containerXLarge"
          marginRight="sectionMedium"
        >
          <FText>{{ label }}</FText>
          <FContainer>
            <FText>
              {{ getCostWithCurrency(key) }}
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>

      <FDivider v-if="!actualCost" width="100%"></FDivider>
      <template v-else>
        <FDivider v-if="!isEmpty(customCostInfo)" width="100%"></FDivider>
        <FContainer
          v-for="(cost, index) in customCostInfo"
          :key="`cost-${index}`"
          display="flex"
          justifyContent="space-between"
          padding="containerXLarge containerXLarge"
          alignItems="center"
          class="visibility-visible-actions"
        >
          <FText>
            {{ getCost(cost) }}
          </FText>
          <FContainer display="flex" marginRight="containerMedium" alignItems="center">
            <FText>
              {{ getCostWithCurrency(getCustomCost(cost)) }}
            </FText>
        
            <FContainer class="visibility-hide-actions" @click="deleteCustomCost(cost, index)">
            <FIcon
              group="default"
              name="trash-can"
              size="16"></FIcon>
            </FContainer>
          </FContainer>
        </FContainer>
        <FDivider width="100%"></FDivider>
      </template>
      <FContainer
        display="flex"
        justifyContent="space-between"
        padding="containerXLarge containerXLarge"
        marginRight="sectionMedium"
      >
        <FText>
          {{
            this.$t('workorder.total_cost', 'Total Cost', { ns: 'workorder' })
          }}
        </FText>
        <FText>
          {{ totalCost }}
        </FText>
      </FContainer>
    </FContainer>
    <template #footer>
      <FContainer
        display="flex"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-end"
        v-if="actualCost"
      >
        <FButton @click="addAdditionalCost()" appearance="primary">
          Add Additional Cost
        </FButton>
      </FContainer>
      <FContainer v-else></FContainer>
    </template>

    <AddAdditionalCost
      :additionalCostDialogVisibility="additionalCostDialogVisibility"
      :details="details"
      @saveAdditionalCost="saveAdditionalCost"
      @closeAdditionalCost="closeAdditionalCost"
    />
  </FModal>
</template>
<script>
import AddAdditionalCost from './AddAdditionalCost.vue'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FShimmer,
  FInput,
  FModal,
  FIcon,
  ftoast,
  FDivider,
  FButton,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { getCurrency } from '../../../../utils/formatter'
export default {
  name: 'WOCostDetailsCard',
  props: ['details', 'showDetails', 'costType', 'costDetails', 'isLoading'],
  components: {
    AddAdditionalCost,
    FContainer,
    FText,
    FShimmer,
    FInput,
    FModal,
    ftoast,
    FDivider,
    FIcon,
    FButton,
  },
  data: () => ({
    additionalCostDialogVisibility: false,
    isEmpty,
  }),
  computed: {
    dialogTitle() {
      let { costType } = this
      return costType === 'plans'
        ? this.$t('workorder.workorder.plans_cost', 'Estimated Cost', {
            ns: 'workorder',
          })
        : this.$t('workorder.workorder.actuals_cost', 'Maintenance Cost', {
            ns: 'workorder',
          })
    },
    actualCost() {
      let { costType } = this
      return costType === 'actuals'
    },
    footerClassName() {
      let { actualCost } = this
      return actualCost ? 'justify-content-space' : 'justify-content-end'
    },
    fixedCostInfo() {
      let { costDetails } = this
      let { Labour, Items, Tools, Services } = costDetails || {}

      return { Labour, Items, Tools, Services }
    },
    customCostInfo() {
      let { costDetails } = this
      let { customCostList } = costDetails || {}

      return customCostList
    },
    totalCost() {
      let currency = getCurrency()
      let { costDetails } = this
      let { grossAmount } = costDetails || {}

      return `${currency} ${grossAmount}`
    },
  },
  methods: {
    getCurrency,
    getCostWithCurrency(cost) {
      let currency = getCurrency()
      return `${currency} ${cost}`
    },
    closeInfo() {
      this.$emit('closeInfo')
    },
    getCost(cost) {
      return getProperty(cost, 'name', '---')
    },
    getCustomCost(cost) {
      return getProperty(cost, 'cost', 0)
    },
    addAdditionalCost() {
      this.additionalCostDialogVisibility = true
    },
    saveAdditionalCost(costList) {
      this.additionalCosts = costList
      this.$emit('updateAdditionalCost', { costList, skipOldValues: false })
      this.additionalCostDialogVisibility = false
    },
    async deleteCustomCost(cost, index) {
      let { id } = cost || {}
      let moduleName = 'workorderCost'
      let { error } = await API.deleteRecord(moduleName, id)
      if (error) {
        ftoast.error(error.message || this.$t('error_occured'))
      } else {
        ftoast.success(
          this.$t(
            'workorder.add_cost_deleted_success',
            'Additional Cost Deleted Successfully',
            { ns: 'workorder' }
          )
        )
        let { customCostInfo } = this
        customCostInfo.splice(index, 1)
        this.$emit('updateAdditionalCost', {
          costList: customCostInfo,
          skipOldValues: true,
        })
      }
    },
    closeAdditionalCost() {
      this.additionalCosts = [
        {
          name: null,
          cost: null,
        },
      ]
      this.additionalCostDialogVisibility = false
    },
  },
}
</script>
<style>
.visibility-visible-actions:hover .visibility-hide-actions {
  visibility: visible;
}

.visibility-hide-actions {
  visibility: hidden;
}
</style>
