<template>
  <FContainer>
    <FModal
      :title="'View Quotes'"
      :visible="showQuoteModal"
      size="XL"
      @cancel="closeDialog"
      :hideFooter="true"
    >
      <FContainer padding="containerXLarge" v-if="isEmpty(quotesData)">
        <FEmptyState
          vertical
          size="M"
          :title="$t('rfq.no_item_quoted', { ns: 'procurement' })"
          illustration="end-of-list"
        />
      </FContainer>
      <FContainer v-else minHeight="200px" paddingBottom="containerMedium">
        <FTable :columns="column" :data="quotesData" :hideBorder="true">
          <template #[`cell.itemDescription`]="{ row }">
            <FContainer v-if="row.inventoryType === 1">
              <FIcon group="dsm" name="line-item" size="12" />
              <FText>{{ getProperty(row, 'itemType.name', '---') }}</FText>
            </FContainer>
            <FContainer v-else>
              <FIcon group="action" name="spanner" size="13" />
              <FText>{{ getProperty(row, 'toolType.name', '---') }}</FText>
            </FContainer>
          </template>
          <template #[`cell.uom`]="{ row }">
            <FText>{{ uom(row) }}</FText>
          </template>
          <template #[`cell.counterPrice`]="{ row }">
            <FText>{{ getCounterPrice(row) }}</FText>
          </template>
          <template #[`cell.taxPercentage`]="{ row }">
            <FText>{{ getTaxPercentage(row) }}</FText>
          </template>
          <template #[`cell.taxAmount`]="{ row }">
            <FText>{{ getTaxAmount(row) }}</FText>
          </template>
          <template #[`cell.remarks`]="{ row }">
            <FText>{{ getRemarks(row) }}</FText>
          </template>
          <template #[`cell.amount`]="{ row }">
            <FText>{{ getAmount(row) }}</FText>
          </template>
        </FTable>
      </FContainer>
    </FModal>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FModal,
  FIcon,
  FText,
  FTable,
  FEmptyState,
} from '@facilio/design-system'
import RfqMixin from '../mixins/Rfqmixins'
import LineItemsMixin from '../mixins/LineItemsMixin.vue'
import poMixin from '../../purchaseOrder/mixin/poMixin.vue'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { loadTaxes, loadEnumMap, taxMode } from '../utils/purchaseUtils'
import getProperty from 'dlv'
import { getCurrency } from '../../../../utils/formatter'

export default {
  name: 'viewQuotesModal',
  props: ['showQuoteModal', 'quotesData'],
  mixins: [RfqMixin, LineItemsMixin, poMixin],
  components: { FContainer, FModal, FText, FIcon, FTable, FEmptyState },
  data() {
    return {
      uomEnumMap: {},
    }
  },
  created() {
    this.init()
  },
  computed: {
    column() {
      let currency = getCurrency()
      return [
        {
          displayName: this.$t('rfq.table_column.item_description', {
            ns: 'procurement',
          }),
          name: 'itemDescription',
          id: 1,
          fixed: true,
        },
        {
          displayName: this.$t('rfq.table_column.uom', { ns: 'procurement' }),
          name: 'uom',
          id: 2,
        },
        {
          displayName: this.$t('rfq.table_column.quantity', {
            ns: 'procurement',
          }),
          name: 'quantity',
          id: 3,
        },
        {
          displayName: this.$t('rfq.table_column.quoted_unit_price', {
            ns: 'procurement',
            currency,
          }),
          name: 'counterPrice',
          id: 4,
        },
        {
          displayName: this.$t('rfq.table_column.tax', { ns: 'procurement' }),
          name: 'taxPercentage',
          id: 5,
        },
        {
          displayName: this.$t('rfq.table_column.taxAmount', {
            ns: 'procurement',
            currency,
          }),
          name: 'taxAmount',
          id: 6,
        },
        {
          displayName: this.$t('rfq.table_column.remark', {
            ns: 'procurement',
          }),
          name: 'remarks',
          id: 7,
        },
        {
          displayName: this.$t('rfq.table_column.quoted_amount_price', {
            ns: 'procurement',
            currency,
          }),
          name: 'amount',
          id: 8,
          fixedRight: true,
        },
      ]
    },
  },
  methods: {
    getProperty,
    isEmpty,
    async init() {
      let { quotesData } = this
      let taxList = await loadTaxes()
      this.allTaxes = taxList
      this.individualTaxes = this.getIndividualTaxes(quotesData, taxList)
      this.groupedTaxes = this.getGroupedTaxes(quotesData, taxList)
      this.uomEnumMap = await loadEnumMap()
      if (
        !this.isEdit &&
        taxMode() === 2 &&
        !isEmpty(taxList) &&
        isArray(taxList) &&
        taxList.length === 1
      ) {
        this.$set(this.model, 'tax.id', this.getProperty(taxList, [0, 'id']))
      }
    },
    closeDialog() {
      this.$emit('cancel', false)
    },
  },
}
</script>
