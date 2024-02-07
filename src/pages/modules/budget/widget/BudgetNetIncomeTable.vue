<template>
  <FContainer height="100%">
    <FContainer
      display="flex"
      alignItems="center"
      backgroundColor="backgroundMidgroundSubtle"
      borderBottom="1px solid"
      borderTop="1px solid"
      borderColor="borderNeutralBaseSubtler"
    >
      <FContainer
        width="170px"
        height="42px"
        padding="containerLarge containerXLarge"
        borderRight="1px solid"
        borderColor="borderNeutralBaseSubtler"
        display="flex"
        alignItems="center"
        backgroundColor="backgroundMidgroundSubtle"
      >
        <FText appearance="headingMed14">{{
          $t('budget.total', { ns: 'budget' })
        }}</FText>
      </FContainer>
      <template v-if="!hideMonths">
        <FContainer
          v-for="(column, index) in columns"
          :key="index"
          :width="`${column.width}px`"
          height="40px"
          padding="containerLarge containerXLarge"
          borderRight="1px solid"
          borderColor="borderNeutralBaseSubtler"
          display="flex"
          alignItems="center"
          :justifyContent="column.textAlign"
          flexGrow="1"
        >
          <FText appearance="headingMed14">{{ column.displayName }}</FText>
        </FContainer>
      </template>
      <FContainer
        height="40px"
        padding="containerLarge containerXLarge"
        display="flex"
        alignItems="center"
        justifyContent="right"
        flexGrow="1"
        width="116px"
      >
        <FText appearance="headingMed14">{{ getFiscalYearTitle }}</FText>
      </FContainer>
    </FContainer>
    <BudgetNetIncomeExpense
      :details="details"
      widgetType="income"
      :hideMonths="hideMonths"
    />
    <BudgetNetIncomeExpense
      :details="details"
      widgetType="expense"
      :hideMonths="hideMonths"
    />
    <FContainer
      display="flex"
      alignItems="center"
      borderBottom="1px solid"
      borderColor="borderNeutralBaseSubtler"
    >
      <FContainer
        width="170px"
        height="40px"
        padding="containerLarge containerXLarge"
        borderRight="1px solid"
        borderColor="borderNeutralBaseSubtler"
        backgroundColor="backgroundCanvas"
        display="flex"
        alignItems="center"
      >
        <FText appearance="headingMed14">{{
          $t('budget.netIncome', { ns: 'budget' })
        }}</FText>
      </FContainer>
      <template v-if="!hideMonths">
        <FContainer
          v-for="(month, monthIdx) in monthsDisplayName"
          :key="monthIdx"
          width="104px"
          height="40px"
          padding="containerLarge containerXLarge"
          borderRight="1px solid"
          borderColor="borderNeutralBaseSubtler"
          textAlign="right"
          overflow="hidden"
          flexGrow="1"
          display="flex"
          alignItems="center"
          justifyContent="right"
        >
          <FText overflow="scroll">{{
            getNetMonthlyBudgetIncome(monthIdx)
          }}</FText>
        </FContainer>
      </template>
      <FContainer
        width="122px"
        height="40px"
        padding="containerLarge containerXLarge"
        textAlign="right"
        overflow="hidden"
        flexGrow="1"
        display="flex"
        alignItems="center"
        justifyContent="right"
      >
        <FText overflow="scroll">{{
          getFormatedValue(getNetBudgetIncome)
        }}</FText>
      </FContainer>
    </FContainer>
    <FContainer
      display="flex"
      alignItems="center"
      borderBottom="1px solid"
      borderColor="borderNeutralBaseSubtler"
    >
      <FContainer
        width="170px"
        height="40px"
        padding="containerLarge containerXLarge"
        borderRight="1px solid"
        borderColor="borderNeutralBaseSubtler"
        backgroundColor="backgroundCanvas"
        display="flex"
        alignItems="center"
      >
        <FText appearance="headingMed14">{{
          $t('budget.netActualIncome', { ns: 'budget' })
        }}</FText>
      </FContainer>
      <template v-if="!hideMonths">
        <FContainer
          v-for="(month, monthIdx) in monthsDisplayName"
          :key="monthIdx"
          width="104px"
          height="40px"
          padding="containerLarge containerXLarge"
          borderRight="1px solid"
          borderColor="borderNeutralBaseSubtler"
          textAlign="right"
          overflow="hidden"
          flexGrow="1"
          display="flex"
          alignItems="center"
          justifyContent="right"
        >
          <FText overflow="scroll">{{
            getNetMonthlyActualIncome(monthIdx)
          }}</FText>
        </FContainer>
      </template>
      <FContainer
        width="122px"
        height="40px"
        padding="containerLarge containerXLarge"
        textAlign="right"
        overflow="hidden"
        flexGrow="1"
        display="flex"
        alignItems="center"
        justifyContent="right"
      >
        <FText overflow="scroll">{{
          getFormatedValue(getNetActualIncome)
        }}</FText>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText } from '@facilio/design-system'
import BudgetSummaryMixin from '../BudgetSummaryMixin.vue'
import BudgetNetIncomeExpense from '../BudgetNetIncomeExpense.vue'

export default {
  props: ['details', 'widgetType', 'hideMonths'],
  mixins: [BudgetSummaryMixin],
  components: { FContainer, FText, BudgetNetIncomeExpense },
  data() {
    return {
      canShowSplitUp: false,
    }
  },
  computed: {
    columns() {
      let { monthsDisplayName, getFiscalYearTitle } = this
      let monthColumns = []
      monthColumns = (monthsDisplayName || []).map((month, index) => {
        return {
          displayName: month,
          name: month,
          id: index + 2,
          width: 104,
          textAlign: 'right',
        }
      })
      return monthColumns
    },
    isIncomeWidget() {
      return this.widgetType === 'income'
    },
  },
  methods: {
    getFinalYrAmountBgColor() {
      let actualAmount = Number(getTotalIncomeYearlyActualAmount || 0)
      let budgetAmount = Number(getTotalIncomeYearlyBudgetAmount || 0)

      return actualAmount < budgetAmount
        ? 'backgroundSemanticRedSubtler'
        : 'backgroundSemanticGreenSubtle'
    },
  },
}
</script>
