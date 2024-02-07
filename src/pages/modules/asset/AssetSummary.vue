<script lang="jsx">
import ModuleSummary from '../../summary/ModuleSummary.vue'
import AddAssetDepreciationForm from '../asset/widgets/AddAssetDepreciationForm.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import MoveToStoreRoom from '../asset/widgets/MoveToStoreRoom.vue'
import DuplicateViewer from '../asset/widgets/DuplicateViewer.vue'
import RotatingAssetList from '../asset/widgets/RotatingAssetList.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { ftoast } from '@facilio/design-system'
import MeterRelationMixin from '../../summary/MeterRelationMixin.vue'
import AddRelationShip from '../meter/widgets/AddRelationShip.vue'
import {
  FContainer,
  FButton,
  FPopover,
  FMenuItem,
} from '@facilio/design-system'
import getProperty from 'dlv'

export default {
  name: 'AssetSummary',
  components: {
    FContainer,
    FButton,
    FPopover,
    FMenuItem,
    AddAssetDepreciationForm,
    MoveToStoreRoom,
    DuplicateViewer,
    RotatingAssetList,
    AddRelationShip,
  },
  extends: ModuleSummary,
  mixins: [MeterRelationMixin],
  data() {
    return {
      showAddDepreciationForm: false,
      showAssetDuplicationDialog: false,
      isButtonLoading: false,
      showStoreRoomPopUp: false,
      showUsagesList: false,
      plannedMaintenanceList: [],
      inspectionTemplateList: [],
      canMoveToStore: null,
    }
  },
  computed: {
    moreButtonList() {
      return [
        { name: 'Edit', identifier: 'editAsset', clickAction: this.editRecord },
        {
          name: 'Duplicate',
          identifier: 'duplicateAsset',
          clickAction: this.invokeAssetduplicationDialog,
        },
        {
          name: 'Apply Depreciation',
          identifier: 'assetDepreciation',
          clickAction: this.showAddDepreciation,
        },
        {
          name: 'Move to Storeroom',
          identifier: 'moveToStoreroom',
          clickAction: this.moveToStoreRoom,
        },
        {
          name: 'Add Meter Relationship',
          identifier: 'addMeterRelationShip',
          clickAction: this.addMeterRelationShip,
        },
      ]
    },
    showAvatar() {
      return true
    },
    avatarIconGroup() {
      return 'webtabs'
    },
    avatarIconName() {
      return 'asset'
    },
    decommission() {
      return getProperty(this, 'record.decommission', false)
    },
    headingProps() {
      let { decommission } = this
      if (decommission) {
        return {
          group: 'alert',
          name: 'decommissioning',
          text: 'Decommisioned',
        }
      } else {
        return {}
      }
    },
  },
  methods: {
    async moveToStoreRoomApi(selectedItem) {
      this.isButtonLoading = true
      let selectedStoreroom = selectedItem.selectedStoreroom
      let selectedRotatingItemType = selectedItem.selectedRotatingItemType
      let asset = this.record

      let { moduleName } = this

      if (isEmpty(selectedStoreroom)) {
        ftoast.critical('Please select a storeroom')
        this.isButtonLoading = false
        return
      }
      let storeRoomData = {
        id: selectedStoreroom,
      }
      let params = {
        id: asset.id,
        data: {
          storeRoom: storeRoomData,
        },
        params: {
          moveToStoreRoom: true,
        },
      }
      if (this.isNonRotatingAsset(asset)) {
        if (isEmpty(selectedRotatingItemType)) {
          ftoast.critical('Please select a Rotating Item Type')
          this.isButtonLoading = false
          return
        }
        params.data['rotatingItemType'] = {
          id: selectedRotatingItemType,
        }
      }
      let { error } = await API.updateRecord(moduleName, params)
      if (error) {
        ftoast.critical('Error while selecting storeroom')
      } else {
        ftoast.success('Moved to Storeroom successfully')

        this.showStoreRoomPopUp = false
        this.loadAssetsDetails()
      }
      selectedStoreroom = null
      this.isButtonLoading = false
    },
    showAddDepreciation() {
      this.showAddDepreciationForm = true
    },
    closeDepreciationForm() {
      this.showAddDepreciationForm = false
    },
    closeStoreroomPopup() {
      this.showStoreRoomPopUp = false
    },
    closeRotatingList() {
      this.showUsagesList = false
    },
    isNonRotatingAsset(asset) {
      let { rotatingItemType } = asset || {}
      return isEmpty(rotatingItemType)
    },
    editRecord() {
      let { record } = this
      let { id } = record || {}
      let { category } = record || {}
      let { categoryModuleName } = record
      let { name } = findRouteForModule('asset', pageTypes.EDIT) || {}
      name &&
        this.$router.push({
          name,
          params: { id },
          query: {
            categoryModuleName,
            formDetails: JSON.stringify({
              categoryModuleName,
              category: category.id,
            }),
          },
        })
    },
    defaultSpace() {
      return (
        <FContainer>
          {this.showAddDepreciationForm && (
            <AddAssetDepreciationForm
              asset={this.record}
              vOn:fetchAssetDetail={this.refreshObj}
              vOn:onClose={this.closeDepreciationForm}
            />
          )}
          {this.showStoreRoomPopUp && (
            <MoveToStoreRoom
              showStoreRoomPopUp={this.showStoreRoomPopUp}
              isSaving={this.isButtonLoading}
              vOn:onSave={this.moveToStoreRoomApi}
              vOn:onclose={this.closeStoreroomPopup}
              nonRotatingAsset={this.isNonRotatingAsset}
            />
          )}
          {this.showAssetDuplicationDialog && (
            <DuplicateViewer
              moduleName={this.record.categoryModuleName || 'asset'}
              selectedRecord={this.record.id}
              selectedRecordObj={this.record}
              vOn:sucess={this.redirectListPage}
              vOn:closed={this.closeAssetduplicationDialog}
            />
          )}
          {this.showUsagesList && (
            <RotatingAssetList
              plannedMaintenanceList={this.plannedMaintenanceList}
              inspectionTemplateList={this.inspectionTemplateList}
              vOn:onClose={this.closeRotatingList}
            />
          )}
          {this.canShowMeterRelationshipDialog && (
            <AddRelationShip
              canShowDialog={this.canShowMeterRelationshipDialog}
              record={this.record}
              moduleName={this.moduleName}
              vOn:saveDialog={this.saveMeterRelDialog}
              vOn:closeDialog={this.closeMeterRelDialog}
            />
          )}
        </FContainer>
      )
    },
    invokeAssetduplicationDialog() {
      this.showAssetDuplicationDialog = true
    },
    closeAssetduplicationDialog() {
      this.showAssetDuplicationDialog = false
    },

    async assetUsageList() {
      let queryParam = {
        assetId: this.record?.id,
      }
      let { data, error } = await API.post(
        '/v3/rotatingAsset/rotatingAssetUsages',
        queryParam
      )
      if (error) {
        ftoast.critical('Error while selecting storeroom')
        this.canMoveToStore = false
      } else {
        let { plannedMaintenanceList, inspectionTemplateList } = data || {}
        this.plannedMaintenanceList = plannedMaintenanceList || []
        this.inspectionTemplateList = inspectionTemplateList || []
        this.canMoveToStore = true
      }
    },
    async moveToStoreRoom() {
      await this.assetUsageList()
      let { plannedMaintenanceList, inspectionTemplateList, canMoveToStore } =
        this
      if (!canMoveToStore) return
      if (isEmpty(plannedMaintenanceList) && isEmpty(inspectionTemplateList)) {
        this.showStoreRoomPopUp = true
      } else {
        this.showUsagesList = true
      }
    },

    refreshObj() {
      this.loadAssetsDetails(true)
      this.loadAssetMovements(true)
    },
    loadAssetMovements() {
      let filters = JSON.stringify({
        assetId: [{ operatorId: 36, value: [this.record.id + ''] }],
      })

      API.get('/v2/assetMovement/list', {
        filters,
      }).then(({ error, data }) => {
        if (!error && data.stateFlows) {
          this.stateflows = data.stateFlows
        }
      })
    },
    async loadAssetsDetails() {
      this.loading = true
      let { asset, error } = await API.fetchRecord(
        'asset',
        {
          id: this.record.id,
        },
        { force: true } // temp call only for update
      )
      if (!isEmpty(error)) {
        ftoast.critical('Error Occured while fetching Asset')
      } else {
        this.asset = asset
      }
      this.loading = false
    },

    redirectListPage() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.LIST)
      let currentView =
        this.$attrs.viewname === 'filteredassets' ? 'all' : this.$attrs.viewname

      name &&
        this.$router.push({
          name,
          params: { viewname: currentView, moduleName },
          query: this.$route.query,
        })
    },
  },
}
</script>
