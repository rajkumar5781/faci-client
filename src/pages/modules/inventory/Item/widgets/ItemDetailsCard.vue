<template>
  <FContainer display="flex" justifyContent="center" alignItems="center">
    <FContainer
      v-for="(field, idx) in leftFields"
      :key="`item-details-1${idx}`"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="50%"
    >
      <div class="item-details-overflow">
        <FText appearance="headingMed20" color="textDefault">
          {{ field.value }}
        </FText>
      </div>
      <div class="item-details-overflow">
        <FText appearance="captionReg12">
          {{ field.displayName }}
        </FText>
      </div>
    </FContainer>
    <FDivider height="20px" margin="containerNone containerXLarge"></FDivider>

    <FContainer
      v-for="(field, idx) in middleFields"
      :key="`item-details-2${idx}`"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="50%"
    >
      <div class="item-details-overflow">
        <FText appearance="headingMed20" color="textDefault">
          {{ field.value }}
        </FText>
      </div>
      <div class="item-details-overflow">
        <FText appearance="captionReg12" color="backgroundNeutralGrey01Dark">
          {{ field.displayName }}
        </FText>
      </div>
    </FContainer>
    <FDivider height="20px" margin="containerNone containerXLarge"></FDivider>
    <FContainer
      v-for="(field, idx) in rightFields"
      :key="`item-details-3${idx}`"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="50%"
    >
      <div class="item-details-overflow">
        <FText appearance="headingMed20" color="textDefault">
          {{ field.value }}
        </FText>
      </div>
      <div class="item-details-overflow">
        <FText appearance="captionReg12" color="backgroundNeutralGrey01Dark">
          {{ field.displayName }}
        </FText>
      </div>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FDivider } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { formatDate,getCurrency } from '../../../../../utils/formatter'
import * as d3 from 'd3'

export default {
  props: ['details', 'widget'],
  components: {
    FContainer,
    FText,
    FDivider,
  },

  computed: {
    leftFields() {
      let { details = {} } = this
      return [
        {
          value: getProperty(details, 'storeRoom.name', '---'),
          displayName: this.$t('inventory.item.storeroom', {
            ns: 'inventory',
          }),
        },
        {
          value: this.convertDateField(details?.lastPurchasedDate),
          displayName: this.$t('inventory.item.last_purchased_date', {
            ns: 'inventory',
          }),
        },
      ]
    },
    middleFields() {
      let { details = {} } = this
      return [
        {
          value: getProperty(details, 'quantity', '---'),
          displayName: this.$t('inventory.available_quantity', {
            ns: 'inventory',
          }),
        },
        {
          value: getProperty(details, 'currentQuantity', '---'),
          displayName: this.$t('inventory.current_quantity', {
            ns: 'inventory',
          }),
        },
        {
          value: getProperty(details, 'reservedQuantity', '---'),
          displayName: this.$t('inventory.reserved_quantity', {
            ns: 'inventory',
          }),
        },
        {
          value: getProperty(details, 'minimumQuantity', '---'),
          displayName: this.$t('inventory.minimum_quantity', {
            ns: 'inventory',
          }),
        },
      ]
    },
    rightFields() {
      let { details = {} } = this
      return [
        {
          value: this.formatCurrency(details?.lastPurchasedPrice),
          displayName: this.$t('inventory.item.last_purchased_price', {
            ns: 'inventory',
          }),
        },
        {
          value: getProperty(details, 'isRotating', false) ? 'Yes' : 'No',
          displayName: this.$t('inventory.item.individually_tracked', {
            ns: 'inventory',
          }),
        },
      ]
    },
    prefixUnit() {
      return ['$', '£', '₹'].includes(getCurrency())
    },
  },
  methods: {
    convertDateField(value) {
      if (!isEmpty(value)) {
        return formatDate(value, true)
      }
      return '---'
    },
    formatedValue(value) {
        return d3.format('.2f')(value)
    },
    formatCurrency(value) {
      if (!isEmpty(value)) {
      let costVal = this.formatedValue(value)
      return this.prefixUnit?`${getCurrency()} ${costVal}`:`${costVal} ${getCurrency()}`
      }
      return '---'
    },
  },
}
</script>
<style scoped>
.item-details-overflow {
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
