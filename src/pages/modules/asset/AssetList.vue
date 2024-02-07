<script lang="jsx">
import { isEmpty } from '@facilio/utils/validation'
import ModuleList from '../../list/ModuleList.vue'
import CategoryList from '../asset/widgets/CategoryList.vue'
import BulkUpdateViewer from './widgets/BulkUpdateViewer.vue'
import {
  findRouteForModule,
  pageTypes,
  isWebTabsEnabled,
  getApp,
} from '@facilio/router'
import { ftoast } from '@facilio/design-system'
import { API } from '@facilio/api'

export default {
  props: ['moduleName'],
  extends: ModuleList,
  data() {
    return {
      showCategory: false,
      canShowCategoryDialog: false,
      canShowAssetCreation: false,
      openNewAsset: false,
      dataObj: null,
      categoryModuleName: null,
      showBulkUpdate: false,
      bulkfieldlist: [
        'type',
        'department',
        'manufacturer',
        'supplier',
        'model',
        'unitPrice',
      ],
      assetDeptList: [],
      assetCategoryList: [],
      assetTypeList: [],
    }
  },
  created() {
    this.loadAssetDepartment()
    this.loadAssetCategory()
    this.loadAssetType()
  },
  computed: {
    bulkSystemButtonsConfig() {
      return [
        {
          name: 'Update',
          identifier: 'update_bulk',
          action: this.onClickBulkUpdate,
          positionType: 4,
          appearance: 'secondary',
        },
        {
          name: 'Delete',
          identifier: 'delete_bulk',
          action: this.deleteRecords, // default action
          positionType: 4,
          appearance: 'secondary',
        },
        {
          name: 'Print QR',
          identifier: 'printQR',
          action: this.redirectToQrPage,
          positionType: 4,
          appearance: 'secondary',
        },
      ]
    },
    printQrSelectedUrl() {
      let url
      let appName = getApp().linkName
      let encodedIds = encodeURIComponent(this.selectedListItemsIds.join(','))
      console.log('encodedIds', encodedIds)
      if (isWebTabsEnabled()) {
        url = `/legacy/${appName}/iframe/pdf/asset/${encodedIds}`
      } else {
        url = `/legacy/app/iframe/pdf/asset/${encodedIds}`
      }
      return window.location.protocol + '//' + window.location.host + url
    },
  },
  methods: {
    defaultSpace() {
      return (
        <div>
          {this.showCategory && (
            <CategoryList
              canShowCategoryDialog={this.canShowCategoryDialog}
              vOn:openAssetCreation={this.openAssetFormCreation}
              vOn:closeCategory={this.closeCategoryForm}
            />
          )}
          {this.showBulkUpdate && (
            <BulkUpdateViewer
              module={this.moduleName}
              fieldlist={this.bulkfieldlist}
              vOn:submit={this.bulkAction}
              vOn:closed={this.closeBulkUpdate}
              showBulkUpdate={this.showBulkUpdate}
            />
          )}
        </div>
      )
    },
    redirectToFormCreation() {
      this.openCategoryList()
    },

    openCategoryList() {
      this.showCategory = true
      this.canShowCategoryDialog = true
    },
    closeCategoryForm() {
      this.showCategory = false
      this.canShowCategoryDialog = false
    },
    openAssetFormCreation(asset) {
      let categoryModuleName = null
      if (!isEmpty(asset)) {
        categoryModuleName = asset.moduleName
        let { moduleName } = asset
        this.dataObj = {
          categoryModuleName: moduleName,
          category: asset,
        }
        this.showCategory = false
        this.canShowCategoryDialog = false
      }

      this.openNewAsset = true
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.CREATE) || {}
      name &&
        this.$router.push({
          name,
          params: { moduleName },
          query: {
            categoryModuleName,
            formDetails: JSON.stringify({
              categoryModuleName: moduleName,
              category: asset.id,
            }),
          },
        })
    },
    async editModule(record) {
      let { id } = record || {}
      let { category } = record || {}
      let { asset, error } = await API.fetchRecord(
        'asset',
        {
          id: record.id,
        },
        { force: true }
      )
      if (!isEmpty(error)) {
        ftoast.critical('Error Occured while fetching Asset')
      } else {
        this.asset = asset
      }
      this.loading = false
      let { categoryModuleName } = this.asset || {}
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
    onClickBulkUpdate() {
      this.showBulkUpdate = true
    },
    closeBulkUpdate() {
      this.showBulkUpdate = false
    },
    async bulkAction(actions) {
      let fields = {}
      for (let action of actions) {
        if (action.field === 'category') {
          let id = parseInt(action.valueArray)
          let cate = this.getAssetCategory(id) || {}

          fields.category = {
            id,
            name: cate.displayName,
          }
        } else if (action.fieldObj[0].name === 'type') {
          fields.type = {
            id: action.valueArray,
            name: this.getAssetType(parseInt(action.valueArray)).name,
          }
        } else if (action.fieldObj[0].name === 'department') {
          fields.department = {
            id: action.valueArray,
            name: this.getAssetDepartment(parseInt(action.valueArray)).name,
          }
        } else if (action.field === 'assignedTo') {
          if (action.value != null) {
            fields.assignedTo = { id: parseInt(action.value) }
          }
          if (action.valueArray != null) {
            fields.assignmentGroup = { id: parseInt(action.valueArray) }
          }
        } else {
          fields[action.field] = action.value
        }
      }
      let { moduleName, selectedListItemsIds } = this
      let recordMap = selectedListItemsIds.map(id => {
        return { ...(fields || {}), id }
      })
      let params = {
        moduleName: moduleName,
        data: {
          [moduleName]: recordMap,
        },
      }

      this.loading = true
      let { error } = await API.post(
        `v3/modules/bulkPatch/${moduleName}`,
        params
      )
      if (error) {
        ftoast.critical(error?.message || 'Failed to update.')
      } else {
        ftoast.success('Bulk Asset Updated Successfully')
      }
      await this.refreshRecordDetails()
      this.showBulkUpdate = false
    },
    async loadAssetDepartment() {
      let params = {
        page: 1,
        perPage: 5000,
        withCount: true,
      }
      let { data, error } = await API.get(
        'v2/module/data/list?moduleName=assetdepartment',
        params
      )
      if (isEmpty(error)) {
        let { moduleDatas } = data || []
        this.assetDeptList = moduleDatas
      }
    },
    getAssetDepartment(assetdeptId) {
      let { assetDeptList } = this
      if (assetDeptList && assetDeptList.length > 0)
        return assetDeptList.find(
          assetDepartment => assetDepartment.id === assetdeptId
        )
    },
    async loadAssetCategory() {
      let params = {
        page: 1,
        perPage: 5000,
        withCount: true,
      }
      let { data, error } = await API.get(
        'v2/module/data/list?moduleName=assetcategory',
        params
      )
      if (isEmpty(error)) {
        let { moduleDatas } = data || []
        this.assetCategoryList = moduleDatas
      }
    },
    getAssetCategory(assetCatId) {
      let { assetCategoryList } = this
      if (assetCategoryList && assetCategoryList.length > 0)
        return assetCategoryList.find(
          assetCategory => assetCategory.id === assetCatId
        )
    },
    async loadAssetType() {
      let params = {
        page: 1,
        perPage: 5000,
        withCount: true,
      }
      let { data, error } = await API.get(
        'v2/module/data/list?moduleName=assettype',
        params
      )
      if (isEmpty(error)) {
        let { moduleDatas } = data || []
        this.assetTypeList = moduleDatas
      }
    },
    getAssetType(assetTypeId) {
      let { assetTypeList } = this
      if (assetTypeList && assetTypeList.length > 0)
        return assetTypeList.find(assetType => assetType.id === assetTypeId)
    },
    redirectToQrPage() {
      window.open(this.printQrSelectedUrl)
    },
  },
}
</script>
