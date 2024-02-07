<template>
  <FContainer padding="containerXLarge">
    <FContainer
      borderRadius="high"
      height="25%"
      width="100%"
      backgroundColor="backgroundMidgroundSubtle"
      display="flex"
      justifyContent="space-between"
    >
      <FContainer width="35%" padding="containerXLarge">
        <FText color="textMain" appearance="headingMed14">{{
          $t('utility.bill_details', { ns: 'energy' })
        }}</FText>
        <FContainer
          v-for="(billItemLabel, billItemKey) in billDetails"
          :key="billItemKey"
          marginTop="containerXLarge"
          display="flex"
        >
          <FText color="textDescription" whiteSpace="pre">{{
            getBillLabel(billItemLabel)
          }}</FText>
          <FText color="textMain" appearance="headingMed14">{{
            getBillDetail(billItemKey)
          }}</FText>
        </FContainer>
      </FContainer>
      <FContainer
        width="30%"
        padding="containerXLarge"
        display="flex"
        flexDirection="column"
        overflowY="scroll"
      >
        <FText
          color="textMain"
          alignSelf="flex-end"
          appearance="headingMed14"
          >{{ $t('utility.bill_address', { ns: 'energy' }) }}</FText
        >
        <FText
          color="textMain"
          marginTop="containerXLarge"
          appearance="headingMed14"
          textAlign="justify"
          wordBreak="break-word"
          lineHeight="sectionSmall"
          paddingRight="containerNone"
          marginRight="containerNone"
          alignSelf="flex-end"
          >{{ getProperty(utilityBill, 'billingAddress', '---') }}</FText
        >
      </FContainer>
    </FContainer>
    <FContainer
      borderRadius="high"
      border="1px solid"
      borderColor="borderNeutralBaseSubtle"
      height="15%"
      width="100%"
      marginTop="containerXLarge"
      display="flex"
      gap="sectionSmall"
    >
      <FContainer
        v-for="(billTypeLabel, billTypeKey) in billType"
        :key="billTypeKey"
        padding="containerXLarge"
        display="flex"
        flexDirection="column"
      >
        <FText color="textDescription">{{ billTypeLabel }}</FText>
        <FText
          color="textMain"
          appearance="headingMed14"
          marginTop="containerLarge"
          >{{ getBillDetail(billTypeKey) }}</FText
        >
      </FContainer>
    </FContainer>
    <FContainer
      borderRadius="high"
      border="1px solid"
      borderColor="borderNeutralBaseSubtle"
      height="350px"
      marginTop="containerXLarge"
      display="flex"
      flexDirection="column"
      overflow="auto"
    >
      <FTable
        class="utility-bill-item-table"
        :columns="billColumns"
        :data="utilityBill.utilityIntegrationLineItemContexts"
        :hideBorder="true"
      >
        <template #[`cell.sno`]="record">
          <FText color="textMain" appearance="headingMed14" v-if="record">{{
            getProperty(record, 'row.index', '---')
          }}</FText>
        </template>
        <template #[`cell.name`]="record">
          <FContainer display="flex" flexDirection="column">
            <FText color="textMain" appearance="headingMed14">{{
              getProperty(record, 'row.name', '---')
            }}</FText>
            <FText
              color="textDescription"
              marginTop="containerLarge"
              v-if="getProperty(record, 'row.description', '')"
              >{{ getProperty(record, 'row.description', '---') }}</FText
            >
          </FContainer>
        </template>
        <template #[`cell.type`]="record">
          <FTags
            v-if="shouldShowConsumptionTag"
            appearance="status"
            statusType="success"
            :text="consumptionLabel"
          ></FTags>
          <template v-else>
            {{ '---' }}
          </template>
        </template>
        <template #[`cell.volume`]="record">
          <FText color="textMain" appearance="headingMed14">{{
            getItemUsage(record)
          }}</FText>
        </template>
        <template #[`cell.cost`]="record">
          <FText color="textMain" appearance="headingMed14">{{
            getAmount(record, 'cost')
          }}</FText>
        </template>
        <template #[`cell.rate`]="record">
          <FText color="textMain" appearance="headingMed14">{{
            getAmount(record, 'rate')
          }}</FText>
        </template>
      </FTable>
      <FContainer
        alignSelf="flex-end"
        width="33%"
        padding="containerXLarge"
        position="sticky"
        bottom="0"
        marginRight="containerLarge"
        justifyContent="space-between"
      >
        <FContainer
          display="flex"
          padding="containerXLarge"
          justifyContent="space-between"
        >
          <FText>{{ $t('utility.amount', { ns: 'energy' }) }}</FText>
          <FText
            color="textMain"
            appearance="headingMed14"
            class="mr-auto ml-32"
            >{{ grossAmount }}</FText
          >
        </FContainer>
        <FDivider width="100%" />
        <FContainer
          display="flex"
          padding="containerXLarge"
          justifyContent="space-between"
        >
          <FText>{{ $t('utility.tax', { ns: 'energy' }) }}</FText>
          <FText
            color="textMain"
            appearance="headingMed14"
            class="mr-auto ml-40"
            display="flex"
            justifySelf="flex-start"
            alignItems="center"
            >{{ taxAmount }}</FText
          >
        </FContainer>
        <FDivider width="100%" />
        <FContainer
          display="flex"
          padding="containerXLarge"
          justifyContent="space-between"
        >
          <FText>{{ $t('utility.total', { ns: 'energy' }) }}</FText>
          <FText
            color="textMain"
            appearance="headingMed14"
            class="mr-auto ml-36"
            >{{ totalAmount }}</FText
          >
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FTable,
  FTags,
  FDivider,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate } from '../../../../utils/formatter'

export default {
  name: 'UtilityBillSummary',
  components: { FContainer, FText, FTable, FTags, FDivider },

  data() {
    return {
      consumptionLabel: this.$t('utility.consumption', { ns: 'energy' }),
    }
  },

  computed: {
    utilityBill() {
      let { $attrs = {} } = this
      let { details = {} } = $attrs
      let { utilityIntegrationLineItemContexts = [] } = details

      utilityIntegrationLineItemContexts =
        utilityIntegrationLineItemContexts.map((utility, index) => {
          index = index + 1
          if (index < 10) {
            index = `0${index}`
          }
          utility = { ...utility, index }
          return utility
        })
      details = { ...details, utilityIntegrationLineItemContexts }
      return details
    },
    grossAmount() {
      let { utilityBill } = this
      let totalAmount = getProperty(utilityBill, 'billTotalCost', 0)
      return `${totalAmount} AED`
    },
    taxAmount() {
      let { utilityBill } = this
      let totalAmount = getProperty(utilityBill, 'billTotalTax', 0)
      return `${totalAmount} AED`
    },
    totalAmount() {
      let { utilityBill } = this
      let totalAmount = getProperty(utilityBill, 'billTotalCost', 0)
      let taxAmount = getProperty(utilityBill, 'billTotalTax', 0)

      let result = totalAmount + taxAmount
      return `${result} AED`
    },
    shouldShowConsumptionTag() {
      let { record = {} } = this
      let { row = {} } = record
      let { rate } = row || {}
      return rate !== 0
    },
    billDetails() {
      return {
        billUid: this.$t('utility.id', { ns: 'energy' }),
        billStartDate: this.$t('utility.start_date', { ns: 'energy' }),
        billEndDate: this.$t('utility.end_date', { ns: 'energy' }),
        billStatementDate: this.$t('utility.statement_date', { ns: 'energy' }),
      }
    },
    billType() {
      return {
        serviceClass: this.$t('utility.utility_type', { ns: 'energy' }),
        supplierType: this.$t('utility.supplier', { ns: 'energy' }),
      }
    },
    billColumns() {
      return [
        {
          displayName: this.$t('utility.s_no', { ns: 'energy' }),
          name: 'sno',
          id: 1,
          fixed: false,
          resize: false,
          width: 100,
        },
        {
          displayName: this.$t('utility.items_description', { ns: 'energy' }),
          name: 'name',
          id: 2,
          fixed: false,
          resize: false,
          width: 220,
        },
        {
          displayName: this.$t('type', { ns: 'energy' }),
          name: 'type',
          id: 3,
          fixed: false,
          resize: false,
          width: 150,
        },
        {
          displayName: this.$t('utility.usage', { ns: 'energy' }),
          name: 'volume',
          id: 4,
          fixed: false,
          resize: false,
          width: 150,
        },
        {
          displayName: this.$t('utility.cost', { ns: 'energy' }),
          name: 'rate',
          id: 5,
          fixed: false,
          resize: false,
          width: 150,
        },
        {
          displayName: this.$t('utility.amount_AED', { ns: 'energy' }),
          name: 'cost',
          id: 6,
          fixed: false,
          resize: false,
          width: 150,
        },
      ]
    },
  },
  methods: {
    getProperty,
    getBillLabel(label) {
      return `${label} : `
    },
    getBillDetail(key) {
      let { utilityBill } = this
      let detail = ''
      if (['billStartDate', 'billEndDate', 'billStatementDate'].includes(key)) {
        let dateInfo = getProperty(utilityBill, `${key}`, '')
        detail = !isEmpty(dateInfo) ? formatDate(dateInfo) : '---'
      } else if (key === 'billUid') {
        detail = `#${getProperty(utilityBill, 'billUid', '---')}`
      } else {
        detail = getProperty(utilityBill, `${key}`, '---')
      }
      return detail
    },
    getItemUsage(record) {
      let { row } = record || {}
      let unit = getProperty(row, 'unit', '')
      let totalUsage = getProperty(row, 'volume', 0)
      return `${totalUsage} ${unit}`
    },
    getAmount(record, type) {
      let { row } = record || {}
      let amount = getProperty(row, `${type}`, 0)
      return `${amount}`
    },
  },
}
</script>
<style lang="scss" scoped>
.utility-bill-item-table {
  th {
    background-color: #f0f6ff;
  }
}
</style>
