<script>
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'

export default {
  data: () => ({
    meterRelations: null,
  }),
  computed: {
    recordId() {
      return getProperty(this, 'id', null)
    },
    fromModuleName() {
      let { module } = this
      return module === 'meter'
        ? getProperty(this, 'details.utilityTypeModuleName', '')
        : module
    },
  },
  methods: {
    async loadAvailableMeterRelations() {
      let { fromModuleName, recordId, module } = this
      let url = ''
      if(module === 'meter') {
        url = `v2/relationship/${module}/${fromModuleName}/getRelationshipForRecord`
      }
      else {
        url = `v2/relationship/${fromModuleName}/getRelationshipForRecord`
      }
      let params = {
        recordId,
        relationCategory: 3, // Meter RelationType
      }
      let { error, data = {} } = await API.get(url, params, { force: true })
      if (error) {
        ftoast.critical(
          error?.message || this.$t('error_occurred_short_message')
        )
      } else {
        let { relationshipList = [] } = data
        if (!isEmpty(relationshipList)) {
          relationshipList = relationshipList.map(relation => {
            return { ...relation, relation }
          })
          return relationshipList
        }
      }
    },
  },
}
</script>
