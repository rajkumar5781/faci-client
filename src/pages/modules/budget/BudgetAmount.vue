<script lang="jsx">
import {
  FContainer,
  FText,
  FIcon,
  FDivider,
  FTags,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import BudgetSummaryMixin from './BudgetSummaryMixin.vue'

export default {
  name: 'BudgetAmount',
  props: ['details', 'widgetName'],
  mixins: [BudgetSummaryMixin],
  components: { FText, FContainer, FIcon, FDivider, FTags },

  computed: {
    budgetAmountMap() {
      let {
        totalNetIncome,
        totalIncome,
        totalExpense,
        getActualAmount,
        getTotalIncomeYearlyActualAmount,
        getTotalExpenseYearlyActualAmount,
        getRemainingAmount,
        getRemainingIncomeAmount,
        getRemainingExpenseAmount,
      } = this
      return {
        totalBudget: {
          netIncome: totalNetIncome,
          totalIncome: totalIncome,
          totalExpense: totalExpense,
        },
        actualBudget: {
          netIncome: getActualAmount || 0,
          totalIncome: getTotalIncomeYearlyActualAmount || 0,
          totalExpense: getTotalExpenseYearlyActualAmount || 0,
        },
        remainingBudget: {
          netIncome: getRemainingAmount || 0,
          totalIncome: getRemainingIncomeAmount || 0,
          totalExpense: getRemainingExpenseAmount || 0,
        },
      }
    },
    currency() {
      let { data } = this.$account || {}
      let { currencyInfo } = data || {}
      let { displaySymbol } = currencyInfo || {}
      return displaySymbol || '$'
    },
    totalNetIncome() {
      let { totalNetIncome } = this.details || {}
      return totalNetIncome || 0
    },
    totalIncome() {
      let { totalIncome } = this.details || {}
      return totalIncome || 0
    },
    totalExpense() {
      let { totalExpense } = this.details || {}
      return totalExpense || 0
    },
    prefixUnit() {
      let { currency } = this
      return ['$', '£', '₹'].includes(currency)
    },
  },
  render() {
    let {
      prefixUnit,
      getFormatedValue,
      currency,
      widgetName,
      budgetAmountMap,
      currencySymbol,
    } = this
    let { netIncome, totalIncome, totalExpense } =
      budgetAmountMap[widgetName] || {}

    let value = netIncome < 0 ? netIncome * -1 : netIncome
    value = getFormatedValue(value)

    return (
      <FContainer>
        <FContainer
          display="flex"
          alignItems="center"
          padding="containerXxLarge containerLarge containerXxLarge containerXxLarge"
          height="60px"
        >
          <FContainer display="flex">
            {!isEmpty(prefixUnit) && (
              <FText appearance="headingMed20">{currency}</FText>
            )}
            <FContainer paddingLeft="containerMedium">
              <FText appearance="headingMed20">{value}</FText>
            </FContainer>
            {isEmpty(prefixUnit) && (
              <FText appearance="headingMed20">{currency}</FText>
            )}
          </FContainer>
          {parseInt(netIncome) !== 0 && (
            <FContainer paddingLeft="containerLarge">
              {parseInt(netIncome) > 0 ? (
                <FContainer
                  backgroundColor="backgroundSemanticGreenSubtle"
                  borderRadius="medium"
                  border="1px solid"
                  borderColor="borderSemanticGreenLight"
                >
                  <FIcon
                    group="navigation"
                    name="up-triangle-filled"
                    color="backgroundSemanticGreenMedium"
                    size="12"
                  ></FIcon>
                </FContainer>
              ) : (
                <FContainer
                  backgroundColor="backgroundSemanticRedSubtler"
                  borderRadius="medium"
                  border="1px solid"
                  borderColor="borderSemanticRedSubtle"
                >
                  <FIcon
                    group="navigation"
                    name="down-triangle-filled"
                    color="backgroundSemanticRedMedium"
                    size="12"
                  ></FIcon>
                </FContainer>
              )}
            </FContainer>
          )}
        </FContainer>
        <FDivider width="100%" />
        <FContainer>
          <FContainer
            display="flex"
            alignItems="center"
            padding="containerLarge containerXxLarge containerLarge containerXxLarge"
          >
            <FContainer width="120px">
              <FText>{this.$t('budget.income', { ns: 'budget' })}</FText>
            </FContainer>
            <FText>
              {currencySymbol} {getFormatedValue(totalIncome)}
            </FText>
          </FContainer>
          <FContainer
            display="flex"
            alignItems="center"
            padding="containerNone containerXxLarge"
          >
            <FContainer width="120px">
              <FText>{this.$t('budget.expense', { ns: 'budget' })}</FText>
            </FContainer>
            <FText>
              {currencySymbol} {getFormatedValue(totalExpense)}
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>
    )
  },
}
</script>
