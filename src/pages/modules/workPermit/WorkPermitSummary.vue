<script lang="jsx">
import { isEmpty } from '@facilio/utils/validation'
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
import { FModal } from '@facilio/design-system'
import dlv from 'dlv'
import { dset } from 'dset'
import CheckListValidation from './CheckListValidation.vue'
import CheckListCreation from './CheckListCreation.vue'
import { ftoast } from '@facilio/design-system'
export default {
  extends: ModuleSummary,
  components: {
    FModal,
    CheckListModal: CheckListCreation,
    CheckListValidation,
  },
  data() {
    return {
      canShowDialog: false,
      canShowValidationDialog: false,
      dialogName: '',
      categoriesMap: {},
      checkLists: [],
      checkListByCategory: {},
      validationType: 1,
    }
  },
  computed: {
    systemBtnList() {
      return [
        {
          name: 'Submit Pre-requisite',
          identifier: 'preRequisites_summary',
          appearance: 'primary',
          clickAction: () => {
            this.openModal('Prerequisites Check List')
          },
        },
        {
          name: 'Submit Post Work',
          identifier: 'postCheckList_summary',
          appearance: 'primary',
          clickAction: () => {
            this.openModal('Post-Work Check List')
          },
        },
        {
          name: 'Review Pre-requisite',
          identifier: 'preReview_summary',
          appearance: 'primary',
          clickAction: () => {
            this.openValidationDialog('pre')
          },
        },
        {
          name: 'Review Post Work',
          identifier: 'postReview_summary',
          appearance: 'primary',
          clickAction: () => {
            this.openValidationDialog('post')
          },
        },
      ]
    },
    moreButtonList() {
      return [
        {
          name: 'Edit',
          identifier: 'edit_summary',
          appearance: 'tertiary',
          clickAction: this.editRecord,
        },
        {
          name: 'Delete',
          identifier: 'delete_summary',
          appearance: 'tertiary',
          clickAction: this.editRecord,
        },
      ]
    },
    showDialog() {
      let { canShowDialog } = this
      return canShowDialog
    },
    showValidationDialog() {
      let { canShowValidationDialog } = this
      return canShowValidationDialog
    },
    title() {
      let { dialogName } = this
      return dialogName
    },
  },
  methods: {
    defaultSpace() {
      let {
        showDialog,
        showValidationDialog,
        title,
        checkListByCategory,
        record,
        validationType,
      } = this
      if (showDialog) {
        return (
          <CheckListModal
            title={title}
            record={record}
            checkListByCategory={checkListByCategory}
            vOn:onCancel={this.closeDialog}
            vOn:refresh={this.refresh}
          ></CheckListModal>
        )
      }
      if (showValidationDialog) {
        return (
          <CheckListValidation
            details={record}
            validationType={validationType}
            permitStatus={record.permitStatus}
            vOn:onCancel={this.closeDialog}
            vOn:saved={this.refresh}
          ></CheckListValidation>
        )
      }
    },
    async openModal(dialogName) {
      let validationType
      if (dialogName.includes('Pre')) {
        validationType = '1'
      } else {
        validationType = '2'
      }
      await this.loadCheckList(validationType)
      await this.loadCheckListCategory()
      this.dialogName = dialogName
      this.canShowDialog = true
    },
    closeDialog() {
      this.canShowDialog = false
      this.canShowValidationDialog = false
    },
    async loadCheckList(validationType) {
      let url = '/v3/modules/workpermittypechecklistcategory/view/all'
      let workPermitId = dlv(this, 'record.workPermitType.id')
      let filters = {
        workPermitType: {
          operatorId: 36,
          value: [`${workPermitId}`],
        },
        validationType: {
          operatorId: 36,
          value: [validationType],
        },
      }
      if (!isEmpty(filters)) {
        filters = JSON.stringify(filters)
      }
      let params = {
        viewName: 'all',
        filters,
        moduleName: 'workpermittypechecklistcategory',
      }
      let { data, error } = await API.get(url, params)
      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t(
              'api.error.checklist',
              'Error Occured while fetching checklists',
              { ns: 'workPermit' }
            )
        )
      } else {
        this.checkLists = data.workpermittypechecklistcategory
      }
    },
    async loadCheckListCategory() {
      let { data, error } = await API.get(
        '/v3/picklist/workpermittypechecklistcategory'
      )
      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t(
              'api.error.category',
              'Error Occured while fetching categories',
              { ns: 'workPermit' }
            )
        )
      } else {
        let categories = data.pickList
        let categoryMap = {}
        categoryMap = categories.reduce((prev, category) => {
          prev[category.value] = category.label
          return prev
        }, {})
        this.constructCheckListByCategory(categoryMap)
      }
    },
    refresh() {
      this.canShowDialog = false
      this.refreshData()
    },
    constructCheckListByCategory(categoryMap) {
      let { checkLists } = this
      let checkListMap = {}
      checkLists.map(item => {
        let { checklist } = item
        if (!isEmpty(checklist)) {
          checklist.map(checkListItems => {
            // check whether the map doesnt has current category
            let listCategoryMap = dlv(
              checkListMap,
              categoryMap[checkListItems.category.id],
              []
            )

            //initialize object with category as key
            if (isEmpty(listCategoryMap)) {
              dset(checkListMap, categoryMap[checkListItems.category.id], [])
            }

            //push values to current category
            checkListMap[categoryMap[checkListItems.category.id]].push({
              required: 1,
              remarks: null,
              ...checkListItems,
            })
          })
        }
      })
      this.checkListByCategory = checkListMap
    },
    openValidationDialog(validationType) {
      this.validationType = validationType === 'pre' ? 1 : 2
      this.canShowValidationDialog = true
    },
  },
}
</script>
