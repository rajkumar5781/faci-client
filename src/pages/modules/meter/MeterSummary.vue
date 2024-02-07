<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import MeterRelationMixin from '../../summary/MeterRelationMixin.vue'

export default {
  extends: ModuleSummary,
  name: 'MeterSummary',
  mixins: [MeterRelationMixin],
  computed: {
    moreButtonList() {
      let { systemButtons = [] } = this
      let moreButtons = systemButtons.filter(btn =>
        ['edit_summary', 'addMeterRelationShip'].includes(btn?.identifier)
      )
      moreButtons = (moreButtons || []).map(sysBtn => {
        let { name, identifier } = sysBtn || {}
        return {
          name,
          identifier,
          loading: false,
          clickAction:
            identifier === 'edit_summary' ? this.editRecord : this.addMeterRelationShip,
        }
      })
      return moreButtons
    },
  },
  methods: {
    async editRecord() {
      let { record } = this
      let { utilityType, id } = record || {}
      let { id: categoryId } = utilityType || {}

      if (!isEmpty(categoryId)) {
        let { utilitytype, error } = await API.fetchRecord('utilitytype', {
          id: categoryId,
        })
        if (!error) {
          let { moduleName: categoryModuleName, id: utilityType } =
            utilitytype || {}
          let { name } = findRouteForModule('meter', pageTypes.EDIT) || {}
          name &&
            this.$router.push({
              name,
              params: {
                id,
              },
              query: {
                categoryModuleName,
                formDetails: JSON.stringify({ utilityType }),
              },
            })
        } else {
          ftoast.critical(error?.message || this.$t('error_occurred'))
        }
      }
    },
  },
}
</script>
