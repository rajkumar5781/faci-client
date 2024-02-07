<template>
  <FContainer height="100%">
    <FEmptyState
      v-if="isEmpty(vendorQuotesLineItemsData)"
      size="M"
      illustration="no-data"
      :title="
        $t('vendor_quotes.empty_line_items', {
          ns: 'vendor_quotes',
        })
      "
    ></FEmptyState>

    <FContainer
      v-else
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="space-between"
    >
      <FContainer overflowY="scroll">
        <FTable
          :columns="column"
          :data="vendorQuotesLineItemsData"
          :rounded="false"
          :hideBorder="false"
        >
          <template #cell.name="{ row, prop }">
            <FContainer
              display="flex"
              margin="containerMedium"
              gap="containerMedium"
            >
              <FIcon group="dsm" name="line-item" size="16"></FIcon>

              <FContainer
                display="flex"
                justifyContent="center"
                flex-direction="column"
                flex-wrap="nowrap"
                word-break="break-word"
              >
                <FText
                  color="backgroundNeutralGrey01Darkest"
                  appearance="bodyReg14"
                >
                  {{ row[prop] }}
                </FText>
                <FText
                  color="backgroundNeutralGrey01Dark"
                  appearance="bodyRegSt14"
                >
                  {{ row['description'] }}
                </FText>
              </FContainer>
            </FContainer>
          </template>
        </FTable>
      </FContainer>
      <portal
        :to="`footer-${widget.id}-${widget.name}`"
        v-if="!isEmpty(vendorQuotesLineItemsData)"
      >
        <FContainer
          padding="containerXxLarge"
          display="flex"
          justifyContent="flex-end"
          width="100%"
        >
          <FContainer>
            <FText appearance="headingMed14">
              {{
                this.$t('vendor_quotes.total_quoted_amount', {
                  ns: 'vendor_quotes',
                })
              }}
            </FText>
          </FContainer>
          <FContainer paddingLeft="containerLarge">
            <FText appearance="headingMed14">{{ totalQA }}</FText>
          </FContainer>
        </FContainer>
      </portal>
    </FContainer>
  </FContainer>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import Rfqmixins from './../../../../pages/modules/Rfq/mixins/Rfqmixins'
import LineItemsMixin from './../../../../pages/modules/Rfq/mixins/LineItemsMixin.vue'
import {
  loadTaxes,
  taxMode,
} from '../../../../pages/modules/Rfq/utils/purchaseUtils'
import {
  FContainer,
  FTable,
  FSpinner,
  FEmptyState,
  FText,
  FIcon,
} from '@facilio/design-system'

export default {
  mixins: [Rfqmixins, LineItemsMixin],
  components: {
    FContainer,
    FTable,
    FSpinner,
    FEmptyState,
    FText,
    FIcon,
  },
  props: ['vendorQuotesLineItemsData', 'widget'],

  data() {
    return {
      isEmpty,
      column: [
        {
          displayName: this.$t('vendor_quotes.item_desc', {
            ns: 'vendor_quotes',
          }),
          name: 'name',
          id: 1,
          fixed: true,
        },
        {
          displayName: this.$t('vendor_quotes.uom', {
            ns: 'vendor_quotes',
          }),
          name: 'uom',
          id: 2,
          width: 150,
        },
        {
          displayName: this.$t('vendor_quotes.quantity', {
            ns: 'vendor_quotes',
          }),
          name: 'quantity',
          id: 3,
          width: 150,
        },
        {
          displayName: this.$t('vendor_quotes.quotedUnitPrice', {
            ns: 'vendor_quotes',
          }),
          name: 'unitPrice',
          id: 4,
          width: 250,
        },
        {
          displayName: this.$t('vendor_quotes.taxpercentage', {
            ns: 'vendor_quotes',
          }),
          name: 'taxpercentage',
          id: 5,
          width: 150,
        },
        {
          displayName: this.$t('vendor_quotes.taxamount', {
            ns: 'vendor_quotes',
          }),
          name: 'taxAmount',
          id: 6,
          width: 250,
        },
        {
          displayName: this.$t('vendor_quotes.remarks', {
            ns: 'vendor_quotes',
          }),
          name: 'remarks',
          id: 7,
          width: 250,
        },
        {
          displayName: this.$t('vendor_quotes.quotedamount', {
            ns: 'vendor_quotes',
          }),
          name: 'quotedAmount',
          id: 8,
          width: 250,
          fixedRight: true,
        },
      ],
    }
  },
  computed: {
    totalQA() {
      return this.totalQuotedAmount(this.vendorQuotesLineItemsData, null)
    },
  },
}
</script>
