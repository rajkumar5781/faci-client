<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { LookupWizard } from '@facilio/ui/new-forms'
import getProperty from 'dlv'
import { API } from '@facilio/api'
export default {
  extends: ModuleSummary,
  data() {
    return {
      showHazardWizard: false,
    }
  },
  components: { LookupWizard },
  computed: {
    systemBtnList() {
      return [
        {
          name: 'Add Hazard',
          identifier: 'addHazard',
          clickAction: this.addSafetyHazard,
        },
      ]
    },
    wizardField() {
      let id = getProperty(this, 'record.id', null)
      let field = {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'hazard',
        name:'hazard',
        field: {
          lookupModule: {
            name: 'hazard',
            displayName: 'Hazards',
          },
        },
        multiple: true,
        forceFetchAlways: true,
        customParams: {
          excludeAvailableHazards: id,
        },
      }
      return field
    },
  },
  methods: {
    getProperty,
    addSafetyHazard() {
      this.showHazardWizard = true
    },
    async saveRecord(hazardData) {
      this.isLoading = true
      let records = []
      let field = getProperty(hazardData, 'field')
      let selectedData = getProperty(field, 'selectedItems')
      let id = getProperty(this, 'record.id', null)
      selectedData.map(data => {
        let { value } = data || {}
        records.push({
          safetyPlan: {
            id,
          },
          hazard: {
            id: value,
          },
        })
      })
      let url = 'v3/modules/data/bulkCreate'
      let params = {
        data: {
          safetyPlanHazard: records,
        },
        moduleName: 'safetyPlanHazard',
        params: {
          return: true,
        },
      }
      let { error } = await API.post(url, params)
      if (!error) {
        await this.loadRecord(true)
      }
      this.isLoading = false
      this.closeLookUpWizard()
    },
    defaultSpace() {
      let { showHazardWizard, wizardField } = this
      return (
        <LookupWizard
          canShowLookupWizard={showHazardWizard}
          field={wizardField}
          parentModuleName="safetyPlanHazard"
          vOn:setLookupFieldValue={this.saveRecord}
          vOn:closeWizard={this.closeLookUpWizard}
        ></LookupWizard>
      )
    },
    closeLookUpWizard() {
      this.showHazardWizard = false
    },
  },
}
</script>
