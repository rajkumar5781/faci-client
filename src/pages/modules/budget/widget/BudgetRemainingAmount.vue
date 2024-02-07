<script lang="jsx">
import BudgetAmount from '../BudgetAmount.vue'
export default {
  props: ['details'],
  render() {
    let { details } = this
    return <BudgetAmount details={details} widgetName='remainingBudget' />
  },
}
</script>
