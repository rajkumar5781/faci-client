<template>
  <LineItemsWizard
    :config="listConfiguration"
    :currentModuleName="currentModuleName"
    :selectedLookupModuleId="selectedIds"
    @onSave="saveRecord"
    @onCancel="closeWizard"
    @onClose="closeWizard"
  ></LineItemsWizard>
</template>
<script>
import { API } from '@facilio/api'
import LineItemsWizard from '/src/pages/modules/inventory/components/lineitems/LineItemsWizard.vue'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { ftoast } from '@facilio/design-system'
export default {
  components: {
    LineItemsWizard,
  },
  props: ['widget', 'details', 'records'],
  computed: {
    columnCustomConfig() {
      return { canShowColumnConfig: false }
    },
    currentModuleName() {
      let { details } = this
      let { moduleName } = details || {}
      return moduleName
    },
    listConfiguration() {
      let { columnCustomConfig, searchAndFilterConfig } = this

      return {
        expand: false,
        isSelectionEnabled: false,
        isIndexEnabled: false,
        canHideFooter: true,
        lookupModuleName: 'precaution',
        lookupModuleDisplayName: 'Precautions',
        ...(columnCustomConfig || {}),
        ...(searchAndFilterConfig || {}),
        canEnableMainFieldAction: false,
        saveText: 'save',
        selectType: 'bulk',
      }
    },
    searchAndFilterConfig() {
      return { canHideSearch: false, canHideFilter: false }
    },
    id() {
      return getProperty(this, '$route.params.id', null)
    },
    selectedIds() {
      let { records } = this
      let ids = records.map(record => record.precaution.id)
      return ids
    },
  },
  methods: {
    closeWizard() {
      this.$emit('close')
    },
    async saveRecord(records) {
      this.$emit('loading', true)
      let url = 'v3/modules/data/bulkCreate'
      let selectedData = records
      if (!isEmpty(selectedData)) {
        let records = selectedData.map(record => {
          let { id } = record
          return { hazard: { id: this.id }, precaution: { id: id } }
        })
        let params = {
          data: {
            hazardPrecaution: records,
          },
          moduleName: 'hazardPrecaution',
          params: {
            return: true,
          },
        }
        let { error } = await API.post(url, params)
        if (error) {
          ftoast.critical(
            error?.message ||
              this.$t('safetyPlan.precautions.error', 'Error Occured', {
                ns: 'safetyPlan',
              })
          )
        } else {
          ftoast.success(
            this.$t(
              'safetyPlan.precautions.added',
              'Record Added Successfully',
              {
                ns: 'safetyPlan',
              }
            )
          )
        }
      }
      this.closeWizard()
      this.$emit('loading', false)
    },
  },
}
</script>
