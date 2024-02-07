export default {
  components: {
    totalBudget: () => import('./widget/BudgetTotalAmount.vue'),
    actualBudgetAmount: () => import('./widget/BudgetActualAmount.vue'),
    remainingBudget: () => import('./widget/BudgetRemainingAmount.vue'),
    budgetTransactions: () => import('./widget/BudgetTransaction.vue'),
    budgetIncomeExpense: () => import('./widget/BudgetDetails.vue'),
  },
}
