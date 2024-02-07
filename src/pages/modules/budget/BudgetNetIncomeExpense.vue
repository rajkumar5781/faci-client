<template>
  <FContainer>
    <FContainer
      backgroundColor="backgroundMidgroundSubtle"
      padding="containerLarge containerXLarge"
      height="40px"
      display="flex"
      alignItems="center"
    >
      <FText appearance="headingMed14">{{ title }}</FText>
    </FContainer>
    <FContainer
      display="flex"
      alignItems="center"
      borderTop="1px solid"
      borderBottom="1px solid"
      borderColor="borderNeutralBaseSubtler"
    >
      <FContainer
        width="170px"
        height="40px"
        padding="containerLarge containerXLarge"
        borderRight="1px solid"
        borderColor="borderNeutralBaseSubtler"
        display="flex"
        alignItems="center"
        backgroundColor="backgroundCanvas"
      >
        <FText>{{ $t('budget.budget', { ns: 'budget' }) }}</FText>
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
          display="flex"
          alignItems="center"
          justifyContent="right"
          overflow="hidden"
          flexGrow="1"
        >
          <FText overflow="scroll">{{
            getTotalBudgetIncomeOrExpense(monthIdx, 'monthlyAmount')
          }}</FText>
        </FContainer>
      </template>
      <FContainer
        width="122px"
        height="40px"
        padding="containerLarge containerXLarge"
        justifyContent="right"
        display="flex"
        alignItems="center"
        overflow="hidden"
        flexGrow="1"
      >
        <FText overflow="scroll">{{ totalIncomeExpenseYearlyAmt }}</FText>
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
        display="flex"
        alignItems="center"
        backgroundColor="backgroundCanvas"
      >
        <FText>{{ $t('budget.actuals', { ns: 'budget' }) }}</FText>
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
          display="flex"
          alignItems="center"
          justifyContent="right"
          overflow="hidden"
          flexGrow="1"
          :backgroundColor="getMonthlyIncomeExpenseBgColor(monthIdx)"
        >
          <FText overflow="scroll">{{
            getTotalBudgetIncomeOrExpense(monthIdx, 'actualMonthlyAmount')
          }}</FText>
        </FContainer>
      </template>
      <FContainer
        width="122px"
        height="40px"
        padding="containerLarge containerXLarge"
        :backgroundColor="finalYrAmountBgColor"
        display="flex"
        alignItems="center"
        justifyContent="right"
        overflow="hidden"
        flexGrow="1"
      >
        <FText overflow="scroll">{{ totalActualYearlyAmt }}</FText>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import BudgetSummaryMixin from './BudgetSummaryMixin.vue'
import { FContainer, FText } from '@facilio/design-system'

export default {
  mixins: [BudgetSummaryMixin],
  props: ['details', 'widgetType', 'hideMonths'],
  components: { FContainer, FText },
  computed: {
    title() {
      return this.isIncomeWidget
        ? this.$t('budget.income', { ns: 'budget' })
        : this.$t('budget.expense', { ns: 'budget' })
    },
    isIncomeWidget() {
      return this.widgetType === 'income'
    },
    totalIncomeExpenseYearlyAmt() {
      let {
        isIncomeWidget,
        getTotalIncomeYearlyBudgetAmount = 0,
        getTotalExpenseYearlyBudgetAmount = 0,
      } = this
      let value = isIncomeWidget
        ? getTotalIncomeYearlyBudgetAmount
        : getTotalExpenseYearlyBudgetAmount
      return this.getFormatedValue(value)
    },
    totalActualYearlyAmt() {
      let {
        getTotalExpenseYearlyActualAmount = 0,
        getTotalIncomeYearlyActualAmount = 0,
        isIncomeWidget,
      } = this
      let value = isIncomeWidget
        ? getTotalIncomeYearlyActualAmount
        : getTotalExpenseYearlyActualAmount
      return this.getFormatedValue(value)
    },
    finalYrAmountBgColor() {
      let { isIncomeWidget, finalYrIncomeBgColor, finalYrExpenseBgColor } = this
      return isIncomeWidget ? finalYrIncomeBgColor : finalYrExpenseBgColor
    },
    finalYrIncomeBgColor() {
      let {
        getTotalIncomeYearlyBudgetAmount = 0,
        getTotalIncomeYearlyActualAmount = 0,
      } = this
      return Number(getTotalIncomeYearlyActualAmount) <
        Number(getTotalIncomeYearlyBudgetAmount)
        ? 'backgroundSemanticRedSubtler'
        : 'backgroundSemanticGreenSubtle'
    },
    finalYrExpenseBgColor() {
      let {
        getTotalExpenseYearlyActualAmount = 0,
        getTotalExpenseYearlyBudgetAmount = 0,
      } = this
      return Number(getTotalExpenseYearlyActualAmount) >
        Number(getTotalExpenseYearlyBudgetAmount)
        ? 'backgroundSemanticRedSubtler'
        : 'backgroundSemanticGreenSubtle'
    },
  },
  methods: {
    getMonthlyIncomeExpenseBgColor(monthIndex) {
      return this.isIncomeWidget
        ? this.getMonthlyIncomeBgColor(monthIndex)
        : this.getMonthlyExpenseBgColor(monthIndex)
    },
    getMonthlyIncomeBgColor(monthIndex) {
      let monthlyAmount = Number(
        this.getTotalBudgetIncome(monthIndex, 'monthlyAmount') || 0
      )
      let actualMonthlyAmount = Number(
        this.getTotalBudgetIncome(monthIndex, 'actualMonthlyAmount') || 0
      )
      console.log(actualMonthlyAmount, this.getTotalBudgetIncome(monthIndex, 'monthlyAmount'))
      return actualMonthlyAmount < monthlyAmount
        ? 'backgroundSemanticRedSubtler'
        : 'backgroundSemanticGreenSubtle'
    },
    getMonthlyExpenseBgColor(monthIndex) {
      let { getTotalBudgetExpense } = this
      let monthlyAmount = Number(
        getTotalBudgetExpense(monthIndex, 'monthlyAmount') || 0
      )
      let actualMonthlyAmount = Number(
        getTotalBudgetExpense(monthIndex, 'actualMonthlyAmount') || 0
      )
      return actualMonthlyAmount > monthlyAmount
        ? 'backgroundSemanticRedSubtler'
        : 'backgroundSemanticGreenSubtle'
    },
    getTotalBudgetIncomeOrExpense(monthIdx, type) {
      let { isIncomeWidget, getTotalBudgetIncome, getTotalBudgetExpense } = this
      if (isIncomeWidget) return getTotalBudgetIncome(monthIdx, type)
      else return getTotalBudgetExpense(monthIdx, type)
    },
  },
}
</script>
