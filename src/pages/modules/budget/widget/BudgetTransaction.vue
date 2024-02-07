<script lang="jsx">
import { isEmpty } from '@facilio/utils/validation'
import RelatedList from '../../../../components/page-builder/widgets/relatedList/RelatedList.vue'
import { ftoast } from '@facilio/design-system'
import { CustomModuleData } from '../../../../data/CustomModuleData'
import { getOrgMoment } from '../../readingrule/util'
import {
  getStartOfMonthInMillis,
  getEndOfMonthInMillis,
} from '../../../../utils/formatter'

export default {
  props: ['details'],
  extends: RelatedList,
  computed: {
    moduleName() {
      return 'transaction'
    },
    moduleDisplayName() {
      return this.$t('budget.transactions', { ns: 'budget' })
    },
    perPage() {
      return 10
    },
    modelDataClass() {
      return CustomModuleData
    },
    hasTransactionResource() {
      let { details } = this
      let { focalPointType } = details || {}

      return [2, 3].includes(focalPointType)
    },
    transactionResourceId() {
      let { details } = this
      let { focalPointResource } = details || {}
      let { id } = focalPointResource || {}
      return id
    },
    cAIdsInBudget() {
      let { details } = this
      let { budgetAmountList } = details || {}

      return (budgetAmountList || [])
        .map(budgetAmt => {
          let { account } = budgetAmt || {}
          let { id } = account || {}
          return !isEmpty(id) ? id : null
        })
        .filter(ba => !isEmpty(ba))
    },
  },
  methods: {
    async loadRecords(force = false) {
      let { moduleName, viewname, perPage, page, filters = {}, details } = this
      let { fiscalYearStart, fiscalYear } = details
      if (!isEmpty(this.cAIdsInBudget)) {
        let value = this.cAIdsInBudget.map(id => `${id}`)
        filters.account = { operatorId: 36, value }
      }
      if (this.hasTransactionResource) {
        if (this.transactionResourceId) {
          filters.transactionResource = {
            operatorId: 36,
            value: [`${this.transactionResourceId}`],
          }
        }
      } else {
        filters.transactionResource = { operatorId: 1 }
      }
      if (!isEmpty(fiscalYearStart) && !isEmpty(fiscalYear)) {
        let startMonth = fiscalYear
        let endMonth = startMonth + 11
        let endYear = fiscalYearStart
        if (startMonth != 1) {
          endYear = fiscalYearStart + 1
          endMonth = endMonth % 12
        }
        let startDateInMillis = getStartOfMonthInMillis(
          2018 + fiscalYearStart,
          startMonth
        )
        let endDateInMillis = getEndOfMonthInMillis(2018 + endYear, endMonth)
        filters.transactionDate = {
          operatorId: 20,
          value: [`${startDateInMillis}`, `${endDateInMillis}`],
        }
      }
      let payload = {
        viewName: 'all',
        page,
        perPage,
        withCount: true,
        filters: !isEmpty(filters) ? filters : null,
        force,
        includeParentFilter: !isEmpty(filters),
        fetchOnlyViewGroupColumn: false,
        moduleName,
      }

      this.isLoading = true
      try {
        let { data } = await CustomModuleData.fetchAllRecords(payload)
        this.recordList = data || []
        this.recordCount = CustomModuleData.recordListCount
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Unable to fetch moduleList')
      }
      this.isLoading = false
    },
  },
}
</script>
