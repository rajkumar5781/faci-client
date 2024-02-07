<template>
  <div>
    <FModal
      :title="title"
      :visible="visibility"
      :saveText="'Save'"
      :size="'XL'"
      :hideFooter="false"
      type="default"
      @ok="saveRecord"
      @cancel="closeDialog"
      padding="containerNone"
      v-if="!isEmpty(lineItems) && !loading"
    >
      <FTable
        :columns="column"
        :data="lineItems"
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
        <template #cell.counterPrice="{ row, prop }">
          <FContainer
            display="flex"
            margin="containerMedium"
            gap="containerMedium"
          >
            <FInput
              v-model="row[prop]"
              :appearance="'default'"
              :placeholder="'Enter'"
              :size="'medium'"
              :type="'number'"
              @input="changeInput(row, prop)"
            />
          </FContainer>
        </template>
        <template #cell.taxpercentage="{ row, prop }">
          <FContainer
            display="flex"
            margin="containerMedium"
            gap="containerMedium"
          >
            <FSelect
              v-model="row[prop]"
              :filterable="true"
              :placeholder="'Select'"
              :options="taxList"
              :loading="taxLoading"
              :loadingText="'loading...'"
              :size="'medium'"
              :multiple="false"
              @change="setTax(row)"
            >
            </FSelect>
          </FContainer>
        </template>
        <template #cell.remarks="{ row, prop }">
          <FContainer
            display="flex"
            margin="containerMedium"
            gap="containerMedium"
          >
            <FInput
              v-model.sync="row[prop]"
              :appearance="'default'"
              :placeholder="'Enter'"
              :size="'medium'"
              :type="'string'"
              @change="changeRemark(row, prop)"
            />
          </FContainer>
        </template>
      </FTable>
      <FDivider width="100%"></FDivider>
      <FContainer
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        padding="containerLarge"
      >
        <FText
          appearance="headingMed14"
          color="backgroundNeutralInverseHovered"
          marginRight="containerXLarge"
        >
          {{
            this.$t('vendor_quotes.total_quoted_amount', {
              ns: 'vendor_quotes',
            })
          }}
        </FText>
        <FText
          appearance="headingMed14"
          color="backgroundNeutralInverseHovered"
          marginRight="containerLarge"
          >{{ totalQuotedAmountProp }}
        </FText>
      </FContainer>
    </FModal>
    <div v-else-if="isEmpty(lineItems) && !loading">
      {{ showEmptyLineItemNotification() }}
    </div>
  </div>
</template>
<script>
import {
  FContainer,
  FText,
  FModal,
  FTable,
  FInput,
  ftoast,
  FIcon,
  FSelect,
  FDropdown,
  FDivider,
  FEmptyState,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import Rfqmixins from './../../../../pages/modules/Rfq/mixins/Rfqmixins'
import LineItemsMixin from './../../../../pages/modules/Rfq/mixins/LineItemsMixin.vue'
import { isEmpty } from '@facilio/utils/validation'
import { dset as setProperty } from 'dset'
import {
  loadEnumMap,
  loadTaxes,
} from '../../../../pages/modules/Rfq/utils/purchaseUtils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  props: ['record', 'visibility', 'moduleName'],

  components: {
    FContainer,
    FTable,
    FText,
    FModal,
    FInput,
    ftoast,
    FIcon,
    FSelect,
    FDropdown,
    FDivider,
    FEmptyState,
  },
  async created() {
    await this.init()
  },
  data() {
    return {
      lineItems: [],
      uomEnumMap: {},
      totalQuotedAmountProp: '---',
      loading: false,
      taxLoading: true,
      isEmpty,
      column: [
        {
          displayName: this.$t('vendor_quotes.item_desc', {
            ns: 'vendor_quotes',
          }),
          name: 'name',
          id: 1,
          fixed: true,
          width: 100,
        },
        {
          displayName: this.$t('vendor_quotes.quantity', {
            ns: 'vendor_quotes',
          }),
          name: 'quantity',
          id: 2,
          width: 100,
        },
        {
          displayName: this.$t('vendor_quotes.uom', {
            ns: 'vendor_quotes',
          }),
          name: 'uom',
          id: 3,
          width: 100,
        },

        {
          displayName: this.$t('vendor_quotes.quotedUnitPrice', {
            ns: 'vendor_quotes',
          }),
          name: 'counterPrice',
          id: 4,
          width: 100,
        },
        {
          displayName: this.$t('vendor_quotes.taxpercentage', {
            ns: 'vendor_quotes',
          }),
          name: 'taxpercentage',
          id: 5,
          width: 100,
        },
        {
          displayName: this.$t('vendor_quotes.taxamount', {
            ns: 'vendor_quotes',
          }),
          name: 'taxamount',
          id: 6,
          width: 100,
        },
        {
          displayName: this.$t('vendor_quotes.quotedamount', {
            ns: 'vendor_quotes',
          }),
          name: 'quotedamount',
          id: 7,
          width: 100,
        },
        {
          displayName: this.$t('vendor_quotes.remarks', {
            ns: 'vendor_quotes',
          }),
          name: 'remarks',
          id: 8,
          width: 100,
        },
      ],
      counterPrice: 0.0,
      tax: 0,
      remarks: '',
      taxlist: [],
      title: this.$t('vendor_quotes.addQuote', {
        ns: 'vendor_quotes',
      }),
    }
  },
  mixins: [Rfqmixins, LineItemsMixin],
  methods: {
    async init() {
      this.loading = true
      await this.setLineItems()
      this.uomEnumMap = await loadEnumMap()
      this.allTaxes = await loadTaxes()

      this.individualTaxes = this.getIndividualTaxes(
        this.lineItems,
        this.allTaxes
      )
      this.groupedTaxes = this.getGroupedTaxes(this.lineItems, this.allTaxes)
      this.setTaxesForSelect()

      this.addDefaultValuesForLineItems()
      this.computeLineItems()
      this.changeTotalQuotedAmountProp()
      this.loading = false
    },

    setTaxesForSelect() {
      this.taxLoading = true

      this.taxList = (this.allTaxes || []).map(tax => {
        let { name, id, rate } = tax
        return { value: id, label: `${name} (${rate}%)` }
      })

      this.taxLoading = false
    },
    setLineItems() {
      let { record: { vendorQuotesLineItems } = [] } = this || []
      this.lineItems = cloneDeep(vendorQuotesLineItems)
    },
    closeDialog() {
      this.$emit('closed', false)
    },
    computeLineItems() {
      let { lineItems = [] } = this || {}

      this.lineItems = lineItems.map(item => {
        let data = {
          name: this.getItemName(item, null),
          description: this.getItemDescription(item, null),
          uom: this.uom(item, null),
          unitPrice: this.getCounterPrice(item, null),
          quantity: item?.quantity,
          taxpercentage: getProperty(item, 'tax.id', null),
          taxamount: this.getTaxAmount(item, null),
          remarks: this.getRemarks(item, null),
          quotedamount: this.getAmount(item, null),
        }
        return { ...item, ...data }
      })
    },
    addDefaultValuesForLineItems() {
      let { lineItems } = this || {}
      if (!isEmpty(lineItems)) {
        lineItems.forEach(lineItem => {
          let tax = getProperty(lineItem, 'tax')
          if (isEmpty(tax)) {
            this.$set(lineItem, 'tax', { id: null })
          }
        })
      }
    },

    async saveRecord() {
      this.record.vendorQuotesLineItems = this.lineItems

      let param = {
        id: getProperty(this.record, 'id'),
        data: {
          relations: {
            vendorQuotesLineItems: [{ data: getProperty(this, 'lineItems') }],
          },
        },
      }
      let { error } = await API.updateRecord(this.moduleName, param)
      if (error) {
        ftoast.critical(
          error.message ||
            this.$t('vendor_quotes.error_while_adding_quote_details', {
              ns: 'vendor_quotes',
            })
        )
      } else {
        let successMsg = this.$t('vendor_quotes.quote_added_success_msg', {
          ns: 'vendor_quotes',
        })
        ftoast.success(successMsg)
        this.closeDialog()
        this.$emit('saved')
      }
    },
    changeInput(row, prop) {
      let updatingRow = this.lineItems.find(data => data.id == row.id)
      let floatNumber = parseFloat(row[prop]) || null
      setProperty(updatingRow, 'counterPrice', floatNumber)
      this.computeQuotedAmount(updatingRow)
    },
    changeRemark(row, prop) {
      let updatingRow = this.lineItems.find(data => data.id == row.id)
      setProperty(updatingRow, 'remarks', row[prop])
    },
    setTax(row) {
      let updatingRow = this.lineItems.find(data => data.id == row.id)
      let taxId = row.taxpercentage
      updatingRow.taxpercentage = taxId

      let taxObj = null
      if (!isEmpty(taxId)) {
        taxObj = this.getTaxObject(taxId)
      }
      updatingRow.tax = taxObj
      this.computeQuotedAmount(updatingRow)
    },
    computeQuotedAmount(updatingRow) {
      let taxamount = this.calculateTaxAmount(updatingRow, null)
      let quotedamount = this.getAmount(updatingRow, null)
      setProperty(updatingRow, 'taxamount', taxamount)
      setProperty(updatingRow, 'quotedamount', quotedamount)
      this.changeTotalQuotedAmountProp()
    },
    changeTotalQuotedAmountProp() {
      this.totalQuotedAmountProp = this.totalQuotedAmount(this.lineItems)
    },
    showEmptyLineItemNotification() {
      ftoast.information(
        this.$t('vendor_quotes.empty_line_items', {
          ns: 'vendor_quotes',
        })
      )
    },
  },
}
</script>
