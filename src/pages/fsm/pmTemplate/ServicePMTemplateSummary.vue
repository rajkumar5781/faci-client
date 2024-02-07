<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import {
  FContainer,
  fDialog,
  FModal,
  FButton,
  FText,
} from '@facilio/design-system'
import { LookupWizard, Trigger } from '@facilio/ui/new-forms'
import { isEmpty } from '@facilio/utils/validation'

const TYPE = {
  SITE: 1,
  ASSET: 2,
  SPACE: 3,
  BUILDING: 4,
  FLOOR: 5,
}
const TYPE_NAMES = {
  1: 'Sites',
  2: 'Assets',
  3: 'Spaces',
  4: 'Buildings',
  5: 'Floors',
}
export default {
  extends: ModuleSummary,
  name: 'ServicePMTemplateSummary',
  components: {
    FContainer,
    LookupWizard,
    Trigger,
  },
  data() {
    return {
      showConfirmation: false,
      triggerData: null,
      field: null,
      selectedResource: null,
      showWizard: false,
      createPMButtonLoading: false,
      params: null,
      showTrigger: false,
      assetBreadCrumb: {
        path: [
          {
            name: 'Select Assets',
            page: 'selectAssets',
          },
        ],
      },
      siteBreadCrumb: {
        path: [
          {
            name: 'Select Sites',
            page: 'selectSites',
          },
        ],
      },
      spaceBreadCrumb: {
        path: [
          {
            name: 'Select Spaces',
            page: 'selectSpaces',
          },
        ],
      },
      buildingBreadCrumb: {
        path: [
          {
            name: 'Select Buildings',
            page: 'selectBuildings',
          },
        ],
      },
      floorBreadCrumb: {
        path: [
          {
            name: 'Select Floors',
            page: 'selectFloors',
          },
        ],
      },
      triggerBreadCrumb: {
        path: [],
      },
      selectAllRecordProp: {
        canShow: true,
        allRecordsSelected: false,
      },
    }
  },
  computed: {
    assetField() {
      let { record } = this
      let { assetCategory } = record || {}
      let { id: assetCategoryId } = assetCategory || {}
      let assetField = {
        isDataLoading: false,
        options: [],
        name: 'asset',
        lookupModuleName: 'asset',
        field: {
          lookupModule: {
            name: 'asset',
            displayName: 'Assets',
          },
        },
        filters: {
          category: { operatorId: 36, value: [`${assetCategoryId}`] },
        },
        multiple: true,
      }
      return assetField
    },
    spaceField() {
      let { record } = this
      let { spaceCategory } = record || {}
      let { id: spaceCategoryId } = spaceCategory || {}
      let spaceField = {
        isDataLoading: false,
        options: [],
        name: 'space',
        lookupModuleName: 'basespace',
        field: {
          lookupModule: {
            name: 'basespace',
            displayName: 'Spaces',
          },
        },
        multiple: true,
      }
      if (!isEmpty(spaceCategoryId)) {
        spaceField['filters'] = {
          spaceCategory: { operatorId: 36, value: [`${spaceCategoryId}`] },
        }
      }
      return spaceField
    },
    siteField() {
      let siteField = {
        isDataLoading: false,
        options: [],
        name: 'site',
        lookupModuleName: 'site',
        field: {
          lookupModule: {
            name: 'site',
            displayName: 'Sites',
          },
        },
        filters: {},
        multiple: true,
      }
      return siteField
    },
    systemBtnList() {
      let { createPMButtonLoading } = this
      return [
        {
          name: 'Create PM',
          identifier: 'createServicePM',
          clickAction: this.createServicePM,
          loading: createPMButtonLoading,
        },
      ]
    },
  },
  methods: {
    defaultSpace() {
      let {
        showTrigger,
        showWizard,
        triggerBreadCrumb,
        triggerData,
        showConfirmation,
      } = this
      return (
        <FContainer>
          {showWizard && (
            <LookupWizard
              parentModuleName="servicePMTemplate"
              field={this.field}
              selectedResource={this.selectedResource}
              selectAllRecordProp={this.selectAllRecordProp}
              canShowLookupWizard={showWizard}
              vOn:closeWizard={() => (this.showWizard = false)}
              vOn:setLookupFieldValue={this.createPMforSelectedResource}
            ></LookupWizard>
          )}
          {showTrigger && (
            <Trigger
              breadCrumb={triggerBreadCrumb}
              saveText="Create PM"
              triggerData={triggerData}
              vOn:trigger={this.saveTrigger}
              vOn:cancel={() => (this.showTrigger = false)}
              vOn:path={this.setActiveModal}
            ></Trigger>
          )}
          {showConfirmation && (
            <FModal
              visible={showConfirmation}
              title={this.$t('service_pm.pm_creation_title', {
                ns: 'fsm',
              })}
              size="S"
              vOn:cancel={() => (this.showConfirmation = false)}
            >
              <FContainer padding="sectionSmall">
                {this.$t('service_pm.pm_creation_description', {
                  ns: 'fsm',
                })}
              </FContainer>
              <template slot="footer">
                <FContainer
                  padding="containerXLarge sectionSmall"
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  borderTop="1px solid"
                  borderColor="borderNeutralBaseSubtler"
                  gap="containerLarge"
                >
                  <FButton
                    appearance="secondary"
                    size="medium"
                    vOn:click={this.createPM}
                  >
                    <FText appearance="headingMed14">Create</FText>
                  </FButton>
                  <FButton
                    appearance="primary"
                    size="medium"
                    vOn:click={this.createAndPublishPM}
                  >
                    <FText appearance="headingMed14"> Create and Publish</FText>
                  </FButton>
                </FContainer>
              </template>
            </FModal>
          )}
        </FContainer>
      )
    },
    createPM() {
      this.executeAction(this.params)
    },
    createAndPublishPM() {
      let { params } = this
      this.params = {
        ...params,
        publish: true,
      }
      this.executeAction(this.params)
    },
    async invokeSystemButton(buttonIdentifier, params = {}) {
      let { record } = this || {}
      let url = `v3/module/servicePMTemplate/${record?.id}/systemButton/${buttonIdentifier}`
      let { error, data } = await API.post(url, params)
      return { error, data }
    },
    async executeAction(params) {
      this.showConfirmation = false
      let { refreshData } = this || {}
      let identifier = 'createServicePM'
      this.createPMButtonLoading = true
      let { error, data } = await this.invokeSystemButton(identifier, params)
      this.createPMButtonLoading = false
      if (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title: title,
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        let { servicePMStatusActions } = data || {}
        let {
          message = this.$t('service_pm.service_pm_creation_success_msg', {
            ns: 'fsm',
          }),
        } = servicePMStatusActions || {}
        ftoast.success(message, {
          menuType: 'alerts',
          timeout: 5000,
        })
        refreshData()
      }
    },
    createServicePM() {
      let { record } = this || {}
      let { masterPMType } = record || {}
      if (masterPMType === TYPE.SITE) {
        this.field = this.siteField
        this.selectedResource = null
        this.triggerBreadCrumb.path = this.siteBreadCrumb.path
      } else if (masterPMType === TYPE.ASSET) {
        this.field = this.assetField
        this.selectedResource = null
        this.triggerBreadCrumb.path = this.assetBreadCrumb.path
      } else if (masterPMType === TYPE.SPACE) {
        this.field = this.spaceField
        this.selectedResource = { label: 'Space', value: 'space' }
        this.triggerBreadCrumb.path = this.spaceBreadCrumb.path
      } else if (masterPMType === TYPE.BUILDING) {
        this.field = this.spaceField
        this.selectedResource = { label: 'Building', value: 'building' }
        this.triggerBreadCrumb.path = this.buildingBreadCrumb.path
      } else if (masterPMType === TYPE.FLOOR) {
        this.field = this.spaceField
        this.selectedResource = { label: 'Floor', value: 'floor' }
        this.triggerBreadCrumb.path = this.floorBreadCrumb.path
      }
      this.showWizard = true
    },
    mandatoryMessage(masterPMType) {
      if (masterPMType === TYPE.SITE) {
        return this.$t('service_pm.sites_required', {
          ns: 'fsm',
        })
      } else if (masterPMType === TYPE.SPACE) {
        return this.$t('service_pm.spaces_required', {
          ns: 'fsm',
        })
      } else if (masterPMType === TYPE.ASSET) {
        return this.$t('service_pm.assets_required', {
          ns: 'fsm',
        })
      } else if (masterPMType === TYPE.BUILDING) {
        return this.$t('service_pm.buildings_required', {
          ns: 'fsm',
        })
      } else if (masterPMType === TYPE.FLOOR) {
        return this.$t('service_pm.floors_required', {
          ns: 'fsm',
        })
      }
    },
    async createPMforSelectedResource(props) {
      let { masterPMType, servicePMTrigger } = this.record || {}
      let { field, isBulkSelect } = props || {}
      let { selectedItems } = field || {}
      if (isEmpty(selectedItems)) {
        let message = this.mandatoryMessage(masterPMType)
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
        return
      }
      let selectedIds = selectedItems.map(selectedItem => selectedItem.value)
      this.triggerData = servicePMTrigger
      if (masterPMType === TYPE.SITE) {
        this.params = {
          type: TYPE.SITE,
          siteIds: selectedIds,
        }
      } else if (masterPMType === TYPE.SPACE) {
        this.params = {
          type: TYPE.SPACE,
          spaceIds: selectedIds,
        }
      } else if (masterPMType === TYPE.ASSET) {
        this.params = {
          type: TYPE.ASSET,
          assetIds: selectedIds,
        }
      } else if (masterPMType === TYPE.BUILDING) {
        this.params = {
          type: TYPE.BUILDING,
          spaceIds: selectedIds,
        }
      } else if (masterPMType === TYPE.FLOOR) {
        this.params = {
          type: TYPE.FLOOR,
          spaceIds: selectedIds,
        }
      }

      if (isBulkSelect) {
        let value = await fDialog.warning({
          title: `Do you want to select all the ${TYPE_NAMES[masterPMType]}?`,
          description: `For all the selected ${TYPE_NAMES[masterPMType]}, a unique Planned Maintenance will be created. Proceed to provide the recurring schedule details.?`,
          saveText: 'Proceed',
          cancelText: 'Cancel',
        })
        if (value) {
          this.showWizard = false
          this.showTrigger = true
        }
      } else {
        this.showWizard = false
        this.showTrigger = true
      }
    },
    setActiveModal(currModal) {
      let { page } = currModal || {}
      this.activeModal = page || {}
      let { activeModal } = this
      if (activeModal === 'selectAssets') {
        this.field = this.assetField
        this.selectedResource = null
      } else if (activeModal === 'selectSites') {
        this.field = this.siteField
        this.selectedResource = null
      } else if (activeModal === 'selectSpaces') {
        this.field = this.spaceField
        this.selectedResource = { label: 'Space', value: 'space' }
      } else if (activeModal === 'selectBuildings') {
        this.field = this.spaceField
        this.selectedResource = { label: 'Building', value: 'building' }
      } else if (activeModal === 'selectFloors') {
        this.field = this.spaceField
        this.selectedResource = { label: 'Floor', value: 'floor' }
      }

      this.showWizard = true
    },
    saveTrigger(trigger) {
      let { startTime, id } = trigger || {}
      if (isEmpty(startTime)) {
        let message = this.$t('service_pm.start_time_required', {
          ns: 'fsm',
        })
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
        return
      }
      if (!isEmpty(id)) {
        delete trigger.id
      }
      this.showTrigger = false
      let { params } = this
      this.params = {
        ...params,
        trigger,
      }
      this.showConfirmation = true
    },
    refreshData() {
      this.loadRecord(true)
      this.loadSystemButtons(true)
    },
  },
}
</script>
