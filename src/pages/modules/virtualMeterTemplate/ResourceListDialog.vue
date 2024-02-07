<template>
  <FModal
    v-if="canShowGenerateWizard"
    :title="$t('meter.generate_vm', { ns: 'energy' })"
    :visible="canShowGenerateWizard"
    :confirmLoading="saving"
    :saveText="$t('meter.vmTemplate.generate_vm_save_txt', { ns: 'energy' })"
    size="S"
    type="default"
    padding="containerNone"
    @ok="generateVM()"
    @cancel="closeDialog()"
  >
    <FContainer
      v-if="isLoading"
      height="100px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FSpinner :show="isLoading" :size="30" />
    </FContainer>
    <FContainer v-else padding="containerXLarge sectionSmall" height="100px">
      <FText>{{ resourceType }}</FText>
      <Lookup
        v-model="resource"
        :field="resourceField"
        :moduleName="moduleName"
        @showLookupWizard="showLookupWizard"
      />
      <LookupWizard
        v-if="canShowLookupWizard"
        :canShowLookupWizard.sync="canShowLookupWizard"
        :parentModuleName="moduleName"
        :listUrlConfig="listUrlConfig"
        @setListValues="setWizardValue"
        :field.sync="resourceField"
      />
    </FContainer>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import {
  FModal,
  FContainer,
  FText,
  FSpinner,
  ftoast,
} from '@facilio/design-system'
import { Lookup, LookupWizard } from '@facilio/ui/new-forms'
import getProperty from 'dlv'

const lookupFieldNames = {
  site: 'Sites',
  building: 'Buildings',
  floor: 'Floors',
  space: 'Spaces',
}

export default {
  props: ['canShowGenerateWizard', 'record', 'moduleName'],
  components: { FModal, FContainer, FText, Lookup, LookupWizard, FSpinner },
  data() {
    return {
      error: false,
      isLoading: false,
      canShowLookupWizard: false,
      resource: [],
      resourceField: {},
      resourceIdsList: [],
      saving: false,
      toModuleName: null,
      resourceType: '',
    }
  },
  created() {
    this.init()
  },
  computed: {
    listUrlConfig() {
      let { moduleName, toModuleName } = this
      let params = {}

      return {
        url: `v3/unrelated/${moduleName}/fetchAll/${toModuleName}`,
        toModuleName,
        params,
        multiple: true,
      }
    },
  },
  methods: {
    async init() {
      this.isLoading = true
      let { record = {}, resourceIdsList, moduleName } = this
      let lookupModuleName = 'site'
      let resourceField = {}
      let {
        scope,
        buildings = [],
        spaceCategory,
        assetCategory,
        sites = [],
      } = record
      let param = {
        assignmentTypeId: scope,
        baseSpaceIds: buildings.map(building => building.id),
        spaceCategoryId: getProperty(spaceCategory, 'id', null),
        assetCategoryId: getProperty(assetCategory, 'id', null),
        siteIds: sites.map(site => site.id),
        vmTemplateId: getProperty(this, 'record.id', null),
        moduleName,
      }
      Object.keys(param).forEach(key => {
        let paramValue = getProperty(param, key, null)
        if (isEmpty(paramValue)) {
          delete param[key]
        }
      })
      resourceField = { displayTypeEnum: 'WOASSETSPACECHOOSER' }

      let { data, error } = await API.post(
        `v3/resourceAllocation/${moduleName}/getModuleAndCrtieriaFromConfig`,
        param
      )
      if (error) {
        ftoast.critical(error?.message || this.$t('error_occured'))
      } else {
        let { criteria, module } = data || {}
        resourceField = {
          clientCriteria: criteria,
        }
        lookupModuleName = module
      }

      let { relationShipId } = record || {}
      let { data: resourceData, error: fetchListError } = await API.get(
        'v3/virtualMeterTemplate/filterResources',
        {
          relationShipId,
        }
      )

      if (fetchListError) {
        ftoast.critical(error?.message || 'Error Occured')
      } else {
        let { resourceIds = [] } = resourceData || {}
        if (!isEmpty(resourceIds)) {
          resourceIdsList = this.getStringifyResourceIds(resourceIds)
        }
        if (!isEmpty(resourceIdsList)) {
          let filters = {
            id: { operatorId: 10, value: resourceIdsList },
          }
          resourceField = { ...resourceField, filters }
        }
      }

      let displayName = getProperty(lookupFieldNames, lookupModuleName, '')
      let placeHolderText = `Select ${displayName}`

      resourceField = {
        isDataLoading: false,
        options: [],
        lookupModuleName: lookupModuleName,
        field: {
          lookupModule: {
            name: lookupModuleName,
            displayName: displayName,
          },
        },
        placeHolderText: placeHolderText,
        forceFetchAlways: true,
        isDisabled: false,
        multiple: true,
        ...resourceField,
      }
      this.resourceField = resourceField
      this.toModuleName = lookupModuleName
      this.resourceType = getProperty(lookupFieldNames, lookupModuleName, '')
      this.isLoading = false
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
    showLookupWizard(_, canShow) {
      this.canShowLookupWizard = canShow
    },
    setWizardValue(selectedItems) {
      this.resource = selectedItems.map(item => item.value)
      this.resourceField.selectedItems = selectedItems
      this.canShowLookupWizard = false
    },
    async generateVM() {
      this.saving = true
      let { record = {}, resource } = this
      let { id } = record
      let { error } = await API.post('v3/virtualMeterTemplate/generateVM', {
        vmTemplateId: id,
        resourceIds: resource,
      })

      if (!error) {
        ftoast.success(this.$t('meter.vm_generated', { ns: 'energy' }))
        this.saving = false
        this.$emit('saveDialog')
      } else {
        ftoast.critical(error?.message || this.$t('error_occured'))
      }
      this.saving = false
    },
    getStringifyResourceIds(resourceIds = []) {
      if (!isEmpty(resourceIds)) {
        let resources = resourceIds.map(id => {
          return `${id}`
        })
        return resources
      }
      return null
    },
  },
}
</script>
