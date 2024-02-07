<template>
  <FModal
    title="Additional Cost"
    :visible.sync="additionalCostDialogVisibility"
    size="S"
    @ok="saveRecords()"
    @cancel="closeDialog()"
    :hideFooter="false"
  >
    <FContainer padding="containerXLarge containerXxLarge">
      <FContainer
        paddingBottom="containerXLarge"
        display="flex"
        gap="containerLarge"
      >
        <FContainer width="40%">
          <FText>
            {{ $t('workorder.cost_name', 'Cost Name', { ns: 'workorder' }) }}
          </FText>
        </FContainer>
        <FContainer>
          <FText>
            {{ $t('workorder.cost', 'Cost', { ns: 'workorder' }) }}
          </FText>
        </FContainer>
      </FContainer>
      <FContainer
        display="flex"
        flexDirection="column"
        gap="containerXxLarge"
        width="100%"
      >
        <FContainer
          v-for="(additionalCost, index) in additionalCosts"
          :key="index"
          display="flex"
          gap="sectionLarge"
          width="100%"
        >
          <FContainer display="flex" gap="sectionLarge" width="100%">
            <FContainer width="40%">
              <FInput
                v-model="additionalCost.name"
                :placeholder="
                  $t('workorder.enter_name', 'Enter Name', {
                    ns: 'workorder',
                  })
                "
                size="medium"
              >
              </FInput>
            </FContainer>
            <FContainer display="flex" width="40%">
              <!-- <FInput>
                <template #clickable> {{ currency }}</template>
              </FInput> -->
              <FContainer>
                <FInput
                  type="number"
                  :placeholder="
                    $t('workorder.enter_price', 'Enter Price', {
                      ns: 'workorder',
                    })
                  "
                  v-model="additionalCost.cost"
                  size="medium"
                  ><template #prefix> {{ currency }}</template></FInput
                >
              </FContainer>
            </FContainer>
            <FContainer width="20%">
              <FContainer
                v-if="additionalCosts.length > 1"
                @click="removeAdditionalCost(index)"
              >
                <FIcon group="action" name="circle-minus" size="16"></FIcon>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer paddingTop="containerXxLarge">
        <FButton appearance="secondary" @click="newAdditionalCost()">
          {{ $t('workorder.add', 'Add', { ns: 'workorder' }) }}
        </FButton>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
import { API } from '@facilio/api'
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
  FRow,
  FCol,
} from '@facilio/design-system'
import { getCurrency } from '../../../../utils/formatter'

export default {
  name: 'AdditionalCost',
  props: ['additionalCostDialogVisibility', 'details'],
  components: {
    FContainer,
    FText,
    FShimmer,
    FInput,
    FModal,
    FIcon,
    ftoast,
    FDivider,
    FButton,
    FRow,
    FCol,
  },
  data: () => ({
    additionalCosts: [{ name: null, cost: null }],
  }),
  computed: {
    currency() {
      let currency = getCurrency()
      return currency
    },
  },
  methods: {
    getCurrency,
    newAdditionalCost() {
      let { additionalCosts } = this
      let additionalCost = { name: null, cost: null }
      additionalCosts.push(cloneDeep(additionalCost))
      this.additionalCosts = additionalCosts
    },
    removeAdditionalCost(index) {
      let { additionalCosts } = this
      additionalCosts.splice(index, 1)
    },
    async saveRecords() {
      let { additionalCosts, details } = this || {}
      let { id } = details || {}
      additionalCosts = additionalCosts.filter(element => {
        let { name, cost } = element || {}
        return !isEmpty(name) && !isEmpty(cost)
      })
      if (!isEmpty(additionalCosts)) {
        let workorderCost = additionalCosts.map(element => {
          let { name, cost } = element || {}
          return {
            name: name,
            cost: cost,
            parentId: { id },
            costType: 5,
          }
        })
        let url = 'v3/modules/bulkCreate/workorderCost/workorder'
        let params = {
          data: {
            workorderCost: workorderCost,
          },
          moduleName: 'workorderCost',
        }
        let { error, data } = await API.post(url, params)
        if (error) {
          ftoast.critical(error.message || this.$t('error_occured'))
        } else {
          ftoast.success(
            this.$t(
              'workorder.add_cost_added_success',
              'Additional Cost Added Successfully',
              { ns: 'workorder' }
            )
          )
          this.resetAdditionalCosts()
          let { workorderCost } = data || {}
          this.$emit('saveAdditionalCost', workorderCost)
        }
      } else {
        ftoast.critical(
          this.$t(
            'workorder.please_add_additional_cost',
            'Please Add Additional Cost',
            { ns: 'workorder' }
          )
        )
      }
    },
    closeDialog() {
      this.$emit('closeAdditionalCost')
    },
    resetAdditionalCosts() {
      let resetAdditionalCosts = [{ name: null, cost: null }]
      this.$set(this, 'additionalCosts', resetAdditionalCosts)
    },
  },
}
</script>
