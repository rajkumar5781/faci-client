<template>
  <FContainer height="100%" marginBottom="sectionSmall">
    <FContainer
      display="flex"
      alignItems="center"
      backgroundColor="backgroundMidgroundSubtle"
      borderBottom="1px solid"
      :borderTop="!isIncomeWidget && '1px solid'"
      borderColor="borderNeutralBaseSubtler"
    >
      <FContainer
        :width="!hideMonths ? '152px' : '170px'"
        height="42px"
        padding="containerLarge containerXLarge"
        borderRight="1px solid"
        borderColor="borderNeutralBaseSubtler"
        display="flex"
        alignItems="center"
        backgroundColor="backgroundMidgroundSubtle"
      >
        <FText appearance="headingMed14">{{
          $t('budget.chartOfAccounts', { ns: 'budget' })
        }}</FText>
      </FContainer>
      <FContainer
        v-for="(column, index) in columns"
        :key="index"
        :width="`${column.width}px`"
        height="42px"
        padding="containerLarge containerXLarge"
        :borderRight="headerBorder(index)"
        borderColor="borderNeutralBaseSubtler"
        display="flex"
        alignItems="center"
        :justifyContent="column.textAlign"
        flexGrow="1"
      >
        <FText appearance="headingMed14">{{ column.displayName }}</FText>
      </FContainer>
    </FContainer>
    <FContainer v-for="record in allIncomeOrExpenses" :key="record.id">
      <FContainer
        backgroundColor="backgroundMidgroundSubtle"
        height="42px"
        padding="containerLarge containerXLarge"
        display="flex"
        alignItems="center"
      >
        <FText appearance="headingMed14">{{ getAccountName(record) }}</FText>
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
          height="42px"
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
            height="42px"
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
              getMonthlyIncome(record, monthIdx) || '0.00'
            }}</FText>
          </FContainer>
        </template>
        <FContainer
          width="110px"
          height="42px"
          padding="containerLarge containerXLarge"
          display="flex"
          alignItems="center"
          justifyContent="right"
          overflow="hidden"
          flexGrow="1"
        >
          <FText overflow="scroll">{{
            getFormatedValue(record.yearlyAmount)
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
          height="42px"
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
            height="42px"
            padding="containerLarge containerXLarge"
            borderRight="1px solid"
            borderColor="borderNeutralBaseSubtler"
            display="flex"
            alignItems="center"
            justifyContent="right"
            overflow="hidden"
            flexGrow="1"
            :backgroundColor="getMonthlyIncomeExpenseBgColor(record, monthIdx)"
          >
            <FText overflow="scroll">{{
              getAcutalMonthlyIncome(record, monthIdx)
            }}</FText>
          </FContainer>
        </template>
        <FContainer
          width="110px"
          height="42px"
          padding="containerLarge containerXLarge"
          display="flex"
          alignItems="center"
          justifyContent="right"
          overflow="hidden"
          flexGrow="1"
          :backgroundColor="getFinalYrAmountBgColor(record)"
        >
          <FText overflow="scroll">{{
            getFormatedValue(record.actualYearlyAmount)
          }}</FText>
        </FContainer>
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
        height="42px"
        padding="containerLarge containerXLarge"
        borderRight="1px solid"
        borderColor="borderNeutralBaseSubtler"
        display="flex"
        alignItems="center"
        backgroundColor="backgroundMidgroundSubtle"
      >
        <FText appearance="headingMed14">{{
          $t('budget.totalBudget', { ns: 'budget' })
        }}</FText>
      </FContainer>
      <template v-if="!hideMonths">
        <FContainer
          v-for="(month, monthIdx) in monthsDisplayName"
          :key="monthIdx"
          width="104px"
          height="42px"
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
        width="110px"
        height="42px"
        padding="containerLarge containerXLarge"
        display="flex"
        alignItems="center"
        justifyContent="right"
        overflow="hidden"
        flexGrow="1"
      >
        <FText overflow="scroll">{{ incomeOrExpenseYearlyBudget }}</FText>
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
        height="42px"
        padding="containerLarge containerXLarge"
        borderRight="1px solid"
        borderColor="borderNeutralBaseSubtler"
        display="flex"
        alignItems="center"
        backgroundColor="backgroundMidgroundSubtle"
      >
        <FText appearance="headingMed14">{{
          $t('budget.totalActuals', { ns: 'budget' })
        }}</FText>
      </FContainer>
      <template v-if="!hideMonths">
        <FContainer
          v-for="(month, monthIdx) in monthsDisplayName"
          :key="monthIdx"
          width="104px"
          height="42px"
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
            getTotalBudgetIncomeOrExpense(monthIdx, 'actualMonthlyAmount')
          }}</FText>
        </FContainer>
      </template>
      <FContainer
        width="110px"
        height="42px"
        padding="containerLarge containerXLarge"
        display="flex"
        alignItems="center"
        justifyContent="right"
        overflow="hidden"
        flexGrow="1"
      >
        <FText overflow="scroll">{{ incomeOrExpenseActualYearlyBudget }}</FText>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText } from '@facilio/design-system'
import BudgetSummaryMixin from './BudgetSummaryMixin.vue'

export default {
  props: ['details', 'widgetType', 'hideMonths'],
  mixins: [BudgetSummaryMixin],
  components: { FContainer, FText },

  computed: {
    allIncomeOrExpenses() {
      let { isIncomeWidget, getAllIncomes, getAllExpenses } = this
      return isIncomeWidget ? getAllIncomes : getAllExpenses
    },
    columns() {
      let { monthsDisplayName, getFiscalYearTitle, hideMonths } = this

      let monthColumns = []

      if (!hideMonths) {
        monthColumns = (monthsDisplayName || []).map((month, index) => {
          return {
            displayName: month,
            name: month,
            id: index + 2,
            width: 93,
            textAlign: 'right',
          }
        })
      }

      let finalYr = {
        displayName: getFiscalYearTitle,
        name: 'fy',
        id: 14,
        width: 98,
        textAlign: 'right',
      }
      return [...monthColumns, finalYr]
    },
    isIncomeWidget() {
      return this.widgetType === 'income'
    },
    incomeOrExpenseActualYearlyBudget() {
      let {
        getTotalIncomeYearlyActualAmount,
        getTotalExpenseYearlyActualAmount,
        isIncomeWidget,
      } = this

      let value = isIncomeWidget
        ? getTotalIncomeYearlyActualAmount
        : getTotalExpenseYearlyActualAmount
      return this.getFormatedValue(value)
    },
    incomeOrExpenseYearlyBudget() {
      let {
        getTotalIncomeYearlyBudgetAmount,
        getTotalExpenseYearlyBudgetAmount,
        isIncomeWidget,
      } = this
      let value = isIncomeWidget
        ? getTotalIncomeYearlyBudgetAmount
        : getTotalExpenseYearlyBudgetAmount
      return this.getFormatedValue(value)
    },
  },
  methods: {
    getAccountName(record) {
      let { account } = record || {}
      let { name } = account || {}
      return name
    },
    headerBorder(index) {
      return this.columns.length - 1 !== index ? '1px solid' : ''
    },
    getMonthlyIncome(record, monthIdx) {
      let { monthlyAmountSplitUp = [] } = record || {}
      let { monthlyAmountString } = monthlyAmountSplitUp[monthIdx] || {}
      return monthlyAmountString || '0.00'
    },
    getTotalBudgetIncomeOrExpense(monthIdx, amtStr) {
      let { isIncomeWidget, getTotalBudgetExpense, getTotalBudgetIncome } = this
      if (isIncomeWidget) return getTotalBudgetIncome(monthIdx, amtStr)
      else return getTotalBudgetExpense(monthIdx, amtStr)
    },
    getAcutalMonthlyIncome(record, monthIdx) {
      let { monthlyAmountSplitUp = [] } = record || {}
      let { actualMonthlyAmountString } = monthlyAmountSplitUp[monthIdx] || {}
      return actualMonthlyAmountString || '0.00'
    },
    hasIncomeActualsExceeded(record, monthIdx) {
      let { monthlyAmountSplitUp = [] } = record || {}
      let { actualMonthlyAmount = 0, monthlyAmount } =
        monthlyAmountSplitUp[monthIdx] || {}
      return actualMonthlyAmount >= monthlyAmount
    },
    hasExpenseActualsExceeded(record, monthIdx) {
      let { monthlyAmountSplitUp = [] } = record || {}
      let { actualMonthlyAmount = 0, monthlyAmount } =
        monthlyAmountSplitUp[monthIdx] || {}
      return actualMonthlyAmount < monthlyAmount
    },
    getMonthlyIncomeExpenseBgColor(record, monthIdx) {
      let {
        hasIncomeActualsExceeded,
        hasExpenseActualsExceeded,
        isIncomeWidget,
      } = this
      let value = isIncomeWidget
        ? hasIncomeActualsExceeded(record, monthIdx)
        : hasExpenseActualsExceeded(record, monthIdx)
      return value
        ? 'backgroundSemanticGreenSubtle'
        : 'backgroundSemanticRedSubtler'
    },
    getFinalYrAmountBgColor(record) {
      let { actualYearlyAmount = 0, yearlyAmount } = record || {}
      let isValue = this.isIncomeWidget
        ? actualYearlyAmount < yearlyAmount
        : actualYearlyAmount > yearlyAmount

      return isValue
        ? 'backgroundSemanticRedSubtler'
        : 'backgroundSemanticGreenSubtle'
    },
  },
}
</script>
