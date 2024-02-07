<script>
import { isEmpty, isArray } from '@facilio/utils/validation'
import * as d3 from 'd3'
import getProperty from 'dlv'

export default {
  props: ['calculateDimensions', 'resizeWidget', 'details'],
  computed: {
    budgetMonthsDisplayName() {
      return [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
    },
    monthsDisplayName() {
      let { details, budgetMonthsDisplayName } = this
      let { fiscalYear } = details || {}
      if (!isEmpty(fiscalYear)) {
        let month = Number(fiscalYear)
        return [
          ...budgetMonthsDisplayName.slice(month - 1, 12),
          ...budgetMonthsDisplayName.slice(0, month - 1),
        ]
      }
      return budgetMonthsDisplayName
    },
    currencySymbol() {
      let { data } = this.$account || {}
      let { currencyInfo } = data || {}
      return currencyInfo?.displaySymbol || '$'
    },
    getFiscalYearTitle() {
      let { fiscalYearStart } = this.details || {}
      
      return `FY${
        !isEmpty(fiscalYearStart) ? 2018 + Number(fiscalYearStart) : ''
      } (${this.currencySymbol})`
    },
    getAllIncomes() {
      let { budgetAmountList } = this.details || {}
      let list = []
      if (isArray(budgetAmountList)) {
        list = (budgetAmountList || []).filter(
          element => element.amountType === 1
        )
      }
      return list
    },
    getAllExpenses() {
      let { budgetAmountList } = this.details || {}
      let list = []
      if (isArray(budgetAmountList)) {
        list = (budgetAmountList || []).filter(
          element => element.amountType === 2
        )
      }
      return list
    },
    getTotalIncomeYearlyBudgetAmount() {
      let { getAllIncomes } = this
      let total = 0
      if (!isEmpty(getAllIncomes)) {
        getAllIncomes.forEach(record => {
          total += Number(record.yearlyAmount || 0)
        })
      }
      return total || 0
    },
    getTotalIncomeYearlyActualAmount() {
      let { getAllIncomes } = this
      let total = 0
      if (!isEmpty(getAllIncomes)) {
        getAllIncomes.forEach(record => {
          total += Number(record.actualYearlyAmount || 0)
        })
      }
      return total || 0
    },
    getNetBudgetIncome() {
      return (
        Number(this.getTotalIncomeYearlyBudgetAmount) -
        Number(this.getTotalExpenseYearlyBudgetAmount)
      )
    },
    getNetActualIncome() {
      return (
        Number(this.getTotalIncomeYearlyActualAmount) -
        Number(this.getTotalExpenseYearlyActualAmount)
      )
    },
    getTotalExpenseYearlyBudgetAmount() {
      let { getAllExpenses } = this
      let total = 0
      if (!isEmpty(getAllExpenses)) {
        getAllExpenses.forEach(record => {
          total += Number(record.yearlyAmount || 0)
        })
      }
      return total
    },
    getTotalExpenseYearlyActualAmount() {
      let { getAllExpenses } = this
      let total = 0
      if (!isEmpty(getAllExpenses)) {
        getAllExpenses.forEach(record => {
          total += Number(record.actualYearlyAmount || 0)
        })
      }
      return total
    },
    getActualAmount() {
      return (
        (this.getTotalIncomeYearlyActualAmount || 0) -
        (this.getTotalExpenseYearlyActualAmount || 0)
      )
    },
    getTotalBudgetAmount() {
      let { totalIncome, totalExpense } = this.details || {}
      return (totalIncome || 0) - (totalExpense || 0)
    },
    getRemainingAmount() {
      let { totalNetIncome } = this.details || {}
      return (totalNetIncome || 0) - (this.getActualAmount || 0)
    },
    getRemainingIncomeAmount() {
      let { totalIncome } = this.details || {}
      return (
        Number(totalIncome || 0) - Number(this.getTotalIncomeYearlyActualAmount)
      )
    },
    getRemainingExpenseAmount() {
      let { totalExpense } = this.details || {}
      return (
        Number(totalExpense || 0) -
        Number(this.getTotalExpenseYearlyActualAmount)
      )
    },
    percentageOfAmountUsed() {
      let { totalNetIncome } = this.details || {}
      return (this.getActualAmount / totalNetIncome || 0) * 100 || 0
    },
  },
  methods: {
    getTotalBudgetIncome(index, key) {
      let total = 0
      this.getAllIncomes.forEach(record => {
        let value =
          getProperty(record, `monthlyAmountSplitUp.${index}.${key}`) || 0
        total += Number(value)
      })
      return d3.format('.2f')(total)
    },
    getTotalBudgetExpense(index, key) {
      let total = 0
      this.getAllExpenses.forEach(record => {
        let value =
          getProperty(record, `monthlyAmountSplitUp.${index}.${key}`) || 0
        total += Number(value)
      })
      return d3.format('.2f')(total)
    },
    getNetMonthlyBudgetIncome(index) {
      return d3.format('.2f')(
        Number(this.getTotalBudgetIncome(index, 'monthlyAmount')) -
          Number(this.getTotalBudgetExpense(index, 'monthlyAmount')) || 0
      )
    },
    getNetMonthlyActualIncome(index) {
      return d3.format('.2f')(
        Number(this.getTotalBudgetIncome(index, 'actualMonthlyAmount')) -
          Number(this.getTotalBudgetExpense(index, 'actualMonthlyAmount')) || 0
      )
    },
    getFormatedValue(value = 0) {
      return d3.format('.2f')(value)
    },
  },
}
</script>
