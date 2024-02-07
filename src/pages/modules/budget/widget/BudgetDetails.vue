<script lang="jsx">
import BudgetAmountTable from '../BudgetAmountTable.vue'
import { FContainer, FSegmentedControl, FText } from '@facilio/design-system'
import BudgetNetIncomeTableVue from './BudgetNetIncomeTable.vue'
export default {
    props: ['details', 'resizeWidget', 'layoutParams', 'calculateDimensions', 'fitMyContent', 'widgetType', 'actionPortal', 'titlePortal'],
    components: { FContainer, FSegmentedControl, FText },
    data() {
        return {
            tab: '1',
            tabsLists: [
                { label: 'Months', value: '1' },
                { label: 'Year', value: '2' },
            ],
        }
    },
    computed: {
        hideMonths() {
            return this.tab === '2'
        },
        widgetDisplayName() {
            let { hideMonths } = this
            return hideMonths ? this.$t('budget.yearlyBudget', { ns: 'budget' }) : this.$t('budget.monthlyBudget', { ns: 'budget' })
        }
    },
    mounted() {
        this.autoResize()
    },
    methods: {
        autoResize(reset) {
            setTimeout(() => {
                let { h: layoutHeight } = this.layoutParams || {}

                if (reset) {
                    this.resizeWidget({ h: layoutHeight })
                    return
                }

                let container = this.$refs['budget-income-expense']?.$el

                if (!container) return
                this.fitMyContent()
            })
        },
    },
    render() {
        let { details, hideMonths } = this
        return (
            <FContainer height="fit-content !important" ref="budget-income-expense">
                <BudgetAmountTable
                    details={details}
                    widgetType="income"
                    hideMonths={hideMonths}
                />
                <BudgetAmountTable details={details} widgetType="expense" hideMonths={hideMonths} />
                <BudgetNetIncomeTableVue details={details} widgetType={this.widgetType} hideMonths={hideMonths} />

                <portal to={this.actionPortal}>
                    <FSegmentedControl v-model={this.tab} tabsList={this.tabsLists}>
                    </FSegmentedControl>
                </portal>
                <portal to={this.titlePortal}>
                    <FContainer
                        padding="containerLarge containerXLarge"
                        height="40px"
                        display="flex"
                        alignItems="center"
                    >
                        <FText appearance="headingMed14">{this.widgetDisplayName}</FText>
                    </FContainer>
                </portal>
            </FContainer>
        )
    },
}
</script>
