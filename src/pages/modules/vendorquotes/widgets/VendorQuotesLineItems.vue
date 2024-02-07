<template>
  <FContainer>
    <FTabs
      v-model="activeTab"
      appearance="link"
      :tabsList="tabsList"
      padding="containerMedium containerNone"
      :hideBorder="false"
      :lazy="false"
    >
      <FTabPane activeKey="awardedItems" width="100%">
        <FContainer
          v-if="loading"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          padding="sectionLarge"
        >
          <FSpinner :size="35" />
        </FContainer>
        <FContainer v-else>
          <VendorQuoteLineItemsTable
            :vendorQuotesLineItemsData="awardedVendorQuotesLineItemList"
            :widget="widget"
          />
        </FContainer>
      </FTabPane>
      <FTabPane activeKey="allItems" padding="containerMedium">
        <FContainer
          v-if="loading"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          padding="sectionLarge"
        >
          <FSpinner :size="35" />
        </FContainer>
        <FContainer v-else>
          <VendorQuoteLineItemsTable
            :vendorQuotesLineItemsData="vendorQuoteLineItemList"
            :widget="widget"
        /></FContainer>
      </FTabPane>
    </FTabs>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import VendorQuoteLineItemsTable from './VendorQuoteLineItemsTable.vue'
import {
  FContainer,
  FText,
  FTable,
  FSpinner,
  FPagination,
  FTags,
  FIcon,
  FAvatar,
  FEmptyState,
  FDivider,
  FTabs,
  FTabPane,
} from '@facilio/design-system'
import { isBooleanField, isDecimalField } from '@facilio/utils/field'
import { isEmpty } from '@facilio/utils/validation'
import isEqual from 'lodash/isEqual'
import Rfqmixins from './../../../../pages/modules/Rfq/mixins/Rfqmixins'
import LineItemsMixin from './../../../../pages/modules/Rfq/mixins/LineItemsMixin.vue'
import {
  loadEnumMap,
  loadTaxes,
} from '../../../../pages/modules/Rfq/utils/purchaseUtils'
import dlv from 'dlv'

export default {
  mixins: [Rfqmixins, LineItemsMixin],
  components: {
    FContainer,
    FText,
    FTable,
    FPagination,
    FIcon,
    FTags,
    FSpinner,
    FAvatar,
    FEmptyState,
    FDivider,
    FTabs,
    FTabPane,
    VendorQuoteLineItemsTable,
  },
  props: ['widget', 'details'],
  data() {
    return {
      loading: false,
      isEmpty,
      uomEnumMap: {},
      activeTab: 'allItems',
      vendorQuotesLineItems: [],
      awardedVendorQuotesLineItems: [],
    }
  },
  async created() {
    this.loading = true
    await this.init()
    this.loading = false
  },
  computed: {
    tabsList() {
      let tabList = []
      if (!isEmpty(this.awardedVendorQuotesLineItemList)) {
        tabList.push({
          label: this.$t('vendor_quotes.awarded_items', {
            ns: 'vendor_quotes',
          }),
          value: 'awardedItems',
        })
        this.activeTab = 'awardedItems'
      }

      tabList.push({
        label: this.$t('vendor_quotes.all_quoted_items', {
          ns: 'vendor_quotes',
        }),
        value: 'allItems',
      })

      return tabList
    },
    vendorQuoteLineItemList() {
      let { vendorQuotesLineItems = [] } = this.details || {}

      let list = vendorQuotesLineItems.map(item => {
        let row = {
          name: this.getItemName(item, null),
          description: this.getItemDescription(item, null),
          uom: this.uom(item, null),
          unitPrice: this.getCounterPrice(item, null),
          quantity: item?.quantity,
          taxpercentage: this.getTaxPercentage(item, null),
          taxAmount: this.calculateTaxAmount(item, 0),
          remarks: this.getRemarks(item, null),
          quotedAmount: this.getAmount(item, null),
          counterPrice: item?.counterPrice,
          isLineItemAwarded: item.isLineItemAwarded,
        }

        return row
      })
      return list
    },
    awardedVendorQuotesLineItemList() {
      if (isEmpty(this.vendorQuoteLineItemList)) {
        return []
      }
      let list = this.vendorQuoteLineItemList.filter(lineItem => {
        return lineItem.isLineItemAwarded
      })
      return list
    },
  },
  methods: {
    async init() {
      let { vendorQuotesLineItems = [] } = this.details || {}
      this.uomEnumMap = await loadEnumMap()
      let taxList = await loadTaxes()
      this.allTaxes = taxList
      this.individualTaxes = this.getIndividualTaxes(
        vendorQuotesLineItems,
        taxList
      )
      this.groupedTaxes = this.getGroupedTaxes(vendorQuotesLineItems, taxList)
    },
  },
}
</script>
