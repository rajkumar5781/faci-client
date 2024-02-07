<template>
  <FContainer v-if="isLoading" class="flex-middle fc-empty-white">
    <FSpinner :size="25" />
  </FContainer>
  <FContainer v-else  class="h-full">
    <FContainer v-if="!showTable"  class="h-full">
      <FContainer display="flex" justifyContent="center"  class="h-full">
        <FContainer width="500px">
          <FEmptyState
            description="No failure class associated for asset"
            vertical
            illustration="no-entries"
            size="S"
            
          >
            <template #buttons>
              <FButton @click="showDialog" appearance="primary"
                >Failure Hierarchy</FButton
              >
            </template>
          </FEmptyState>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer v-else>
      <portal
        :to="`action-${widget.id}-${widget.name}`"
        class="portal-alignment-ws action-ws"
      >
        <FButton appearance="tertiary" size="small" @click="showDialog()">
          <FIcon group="default" name="edit-text" size="16"></FIcon>
        </FButton>

        <FButton @click="deleteRecords()" appearance="tertiary" size="small">
          <FIcon group="action" name="delete" size="16"></FIcon>
        </FButton>
      </portal>
      <FContainer>
        <FTable
          :rounded="false"
          hideBorder
          :columns="column"
          :data="getRecord()"
        >
        </FTable>
      </FContainer>
    </FContainer>
    <FailureReportDialog
      v-if="showMsgPopup"
      :key="renderDialogComponent"
      :failureClass="failureClass"
      :selectedProblem="selectedProblem"
      :selectedCause="selectedCause"
      :selectedRemedy="selectedRemedy"
      @showLookUpWizard="showLookUpWizard"
      @savePCRToRelModule="savePCRToRelModule"
      @closeDialog="closeDialog"
    ></FailureReportDialog>
    <div v-if="canShowLookupWizard">
      <LookupWizard
        :canShowLookupWizard.sync="canShowLookupWizard"
        :selectedLookupField="failureCodeField"
        @setLookupFieldValue="closeLookUpWizard"
      ></LookupWizard>
    </div>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import FailureReportDialog from './FailureReportDialog.vue'
import { LookupWizard } from '@facilio/ui/new-forms'

const EQUALS_OPERATOR = 9
import {
  FSpinner,
  FTable,
  FContainer,
  FIcon,
  FButton,
  FText,
  ftoast,
  FDivider,
  FEmptyState,
  fDialog,
} from '@facilio/design-system'

export default {
  props: [
    'moduleName',
    'details',
    'resizeWidget',
    'layoutParams',
    'calculateDimensions',
    'widget',
  ],
  components: {
    FSpinner,
    FTable,
    FContainer,
    FDivider,
    FIcon,
    FButton,
    FEmptyState,
    FText,
    FailureReportDialog,
    LookupWizard,
  },
  data() {
    return {
      isLoading: false,
      failureClass: null,
      failureClassId: null,
      showTable: false,
      relModuleId: null,
      failureProblem: null,
      failureCause: null,
      failureRemedy: null,
      showMsgPopup: false,
      selectedProblem: null,
      selectedCause: null,
      selectedRemedy: null,
      canShowLookupWizard: false,
      pcrModuleName: null,
      workorderFailureReport: null,
      problems: [],
      causes: [],
      remedies: [],
      codeIds: [],
      pcrDisplayName: null,
      pcrObj: {},
      isEdit: false,
      selectedField: null,
      renderDialogComponent: 0,
      column: [
        { displayName: 'Type', name: 'type', id: 1 },
        { displayName: 'Name', name: 'code', id: 2 },
        { displayName: 'Description', name: 'description', id: 3 },
      ],
    }
  },
  created() {
    this.getAssociatedFailureClass()
  },
  computed: {
    problemField() {
      let { failureClass } = this || {}
      let currentField = this.getFailurefields(
        'failurecodeproblems',
        'Failure Code Problems',
        'Choose Problem'
      )
      if (failureClass) {
        let filters = {
          failureClass: {
            operatorId: EQUALS_OPERATOR,
            value: [`${this.failureClass?.id}`],
          },
        }
        currentField['filters'] = filters
      }
      return currentField
    },
    causeField() {
      let { selectedProblem } = this || {}
      let currentField = this.getFailurefields(
        'failurecodecauses',
        'Failure Code Causes',
        'Choose Cause'
      )
      if (selectedProblem) {
        let filters = {
          failureCodeProblems: {
            operatorId: EQUALS_OPERATOR,
            value: [`${this.selectedProblem}`],
          },
        }
        currentField['filters'] = filters
      }

      return currentField
    },
    remedyField() {
      let { selectedCause } = this || {}
      let currentField = this.getFailurefields(
        'failurecoderemedies',
        'Failure Code Remedies',
        'Choose Remedy'
      )
      if (selectedCause) {
        let filters = {
          failureCodeCauses: {
            operatorId: EQUALS_OPERATOR,
            value: [`${this.selectedCause}`],
          },
        }
        currentField['filters'] = filters
      }

      return currentField
    },
    failureCodeField() {
      let { codeIds, selectedField } = this || {}
      if (codeIds.length <= 0) codeIds.push('0')
      let currentField = this.getFailurefields(
        'failurecode',
        this.pcrDisplayName
      )
      if (codeIds) {
        let filters = {
          id: {
            operatorId: EQUALS_OPERATOR,
            value: codeIds,
          },
        }
        currentField['filters'] = filters
      }
      if (selectedField) currentField['selectedItems'] = [selectedField]
      return currentField
    },
    canShowButton(){
      return !isEmpty(this.failureClass)
    },
  },
  methods: {
    init() {
      this.selectedProblem = null
      this.selectedCause = null
      this.selectedRemedy = null
      this.relModuleId = null
      this.workorderFailureReport = null
    },


    autoResize() {
     this.resizeWidget({ h: 4 })
    },

    closeDialog() {
      this.showMsgPopup = false
    },

    getProblem() {
      let fc_problems = getProperty(
        this,
        'failureClass.failureCodeProblems',
        []
      )
      let problems = []
      let obj = {}
      fc_problems.forEach(problem => {
        obj[JSON.stringify(problem.code_id)] = problem.id
        problems.push(problem)
      })
      this.problems = problems
      this.pcrObj = { ...this.pcrObj, ...obj }
    },

    async showLookUpWizard(moduleName, selectedItem) {
      this.selectedField = null
      let ids = []
      let obj = {}
      if (moduleName === 'failurecodeproblems') {
        this.problems.forEach(prob => {
          if (prob.id === selectedItem) {
            this.selectedField = { label: prob.code, value: prob.code_id }
          }
          ids.push(JSON.stringify(prob.code_id))
        })
        this.pcrDisplayName = 'Failure Code Problems'
      } else if (moduleName === 'failurecodecauses') {
        this.problems.forEach(problem => {
          if (problem.id === this.selectedProblem) {
            let causes = getProperty(problem, 'failureCodeCauses', [])
            causes.forEach(cause => {
              if (cause.id === selectedItem) {
                this.selectedField = { label: cause.code, value: cause.code_id }
              }
              obj[JSON.stringify(cause.code_id)] = cause.id
              ids.push(JSON.stringify(cause.code_id))
            })
          }
        })
        this.pcrDisplayName = 'Failure Code Causes'
      } else if (moduleName === 'failurecoderemedies') {
        this.problems.forEach(problem => {
          if (problem.id === this.selectedProblem) {
            let causes = getProperty(problem, 'failureCodeCauses', [])
            causes.forEach(cause => {
              if (cause.id === this.selectedCause) {
                let remedies = getProperty(cause, 'failureCodeRemedies', [])
                remedies.forEach(remedy => {
                  if (remedy.id === selectedItem) {
                    this.selectedField = {
                      label: remedy.code,
                      value: remedy.code_id,
                    }
                  }
                  obj[JSON.stringify(remedy.code_id)] = remedy.id
                  ids.push(JSON.stringify(remedy.code_id))
                })
              }
            })
          }
        })
        this.pcrDisplayName = 'Failure Code Remedies'
      }
      this.codeIds = [...ids]
      this.pcrObj = { ...this.pcrObj, ...obj }
      this.pcrModuleName = moduleName
      this.canShowLookupWizard = true
    },

    closeLookUpWizard(pcrLookUpdata) {
      let modName = this.pcrModuleName
      let { renderDialogComponent } = this
      if (pcrLookUpdata) {
        let field = getProperty(pcrLookUpdata, 'field')
        if (!isEmpty(field)) {
          let selectedData = getProperty(field, 'selectedItems')[0]
          if (modName === 'failurecodeproblems') {
            this.selectedProblem =
              this.pcrObj[JSON.stringify(selectedData.value)]
            this.selectedCause = null
            this.selectedRemedy = null
          } else if (modName === 'failurecodecauses') {
            this.selectedCause = this.pcrObj[JSON.stringify(selectedData.value)]
            this.selectedRemedy = null
          } else if (modName === 'failurecoderemedies') {
            this.selectedRemedy =
              this.pcrObj[JSON.stringify(selectedData.value)]
          }
          this.renderDialogComponent =
            selectedData.value + renderDialogComponent
        }
      }
    },

    getFailurefields(lookupModuleName, displayName, placeHolder) {
      let currentField = {
        isDataLoading: false,
        options: [],
        lookupModuleName,
        field: {
          lookupModule: {
            name: lookupModuleName,
            displayName,
          },
        },
        multiple: false,
        forceFetchAlways: true,
        isDisabled: true,
        placeHolderText: placeHolder,
      }
      return currentField
    },

    async showDialog() {
      if (!this.failureClass) {
        ftoast.critical(this.$t('workorder.no_failure_class','No Failure Class Associated',{ns:'workorder'}))
      } else {
        if (this.relModuleId) {
          await this.setPCRRecords(this.workorderFailureReport)
          this.isEdit = true
          this.showMsgPopup = true
        } else {
          this.isEdit = false
          this.showMsgPopup = true
        }
      }
    },

    async deleteRecords() {
      let { moduleName, relModuleId } = this

      let value = await fDialog.warning({
        title: 'Delete Record',
        description: this.$t(
          `workorder.are_you_sure_want_to_delete_this_record`,
          'Are you sure want to delete this record ?',
          { ns: 'workorder' }
        ),
        saveText: 'Delete',
        cancelText: 'Cancel',
      })

      if (value) {
        this.isLoading = true
        let { error } = await API.deleteRecord(
          `${moduleName}FailureClassRelationship`,
          [relModuleId]
        )
        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          this.init()
          await this.refreshWidget()
          ftoast.success(
            this.$t(
              'workorder.report_delete',
              'Failure Report deleted successfully!',
              { ns: 'workorder' }
            )
          )
          this.isLoading = false
        }
      }
    },

    getName(item) {
      return getProperty(item, 'name', '---')
    },

    getDescription(item) {
      let description = getProperty(item, 'description', 'NA')
      return description
    },

    async getAssociatedFailureClass() {
      this.isLoading = true
      let { moduleName } = this
      let id = getProperty(this, 'details.id', null)
      let workorder = this.details
      let { failureClass } =
        moduleName === 'workorder' ? workorder : this.details
      let failureClassId = getProperty(failureClass, 'id', null)
      let params = {
        filters: JSON.stringify({
          parent: {
            operatorId: EQUALS_OPERATOR,
            value: [`${id}`],
          },
        }),
      }
      let { list, error } = await API.fetchAll(
        `${moduleName}FailureClassRelationship`,
        params,
        {
          force: true,
        }
      )
      let data = list?.length && list[0]
      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        if (data) {
          this.workorderFailureReport = data
          this.relModuleId = getProperty(data, 'id', null)
          this.failureClass = getProperty(data, 'failureClass', null)
          this.failureProblem = getProperty(
            data,
            'failureProblem.failureCode',
            null
          )
          if (this.failureProblem) this.failureProblem['type'] = 'Problem'
          this.failureCause = getProperty(
            data,
            'failureCause.failureCode',
            null
          )
          if (this.failureCause) this.failureCause['type'] = 'Cause'
          this.failureRemedy = getProperty(
            data,
            'failureRemedy.failureCode',
            null
          )
          if (this.failureRemedy) this.failureRemedy['type'] = 'Remedy'
          this.setPCRRecords(data)
        }
        await this.getFailureClass(failureClassId)
      }
      this.showTable = this.selectedProblem ? true : false
      this.isLoading = false
      this.autoResize()
    },
    setPCRRecords(data) {
      let problem = getProperty(data, 'failureProblem.id', null)
      let cause = getProperty(data, 'failureCause.id', null)
      let remedy = getProperty(data, 'failureRemedy.id', null)
      this.selectedRemedy = remedy
      this.selectedCause = cause
      this.selectedProblem = problem
    },
    async getFailureClass(failureClassId) {
      if (failureClassId) {
        let { failureclass, error } = await API.fetchRecord(
          'failureclass',
          {
            id: failureClassId,
          },
          {
            force: true,
          }
        )
        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          this.failureClass = failureclass
          this.getProblem()
        }
      }
    },
    getFailureData(subModules, id) {
      if (subModules.length) {
        let woFailurevalue = {}
        subModules.forEach((data, index) => {
          if (data.id === id) {
            woFailurevalue = {
              data,
              index,
            }
          }
        })
        return woFailurevalue
      }
    },

    async savePCRToRelModule(
      selectedProblem,
      selectedCause,
      selectedRemedy,
      force = true
    ) {
      this.isLoading = true
      let { moduleName, details, isEdit, relModuleId, failureClass } = this
      let failureClassId = getProperty(failureClass, 'id', null)
      let data = {
        parent: {
          id: details.id,
        },
        failureClass: {
          id: failureClassId,
        },
        failureProblem: {
          id: selectedProblem,
        },
        failureCause: {
          id: selectedCause,
        },
        failureRemedy: {
          id: selectedRemedy,
        },
      }
      let response = {}
      let successMsg = ''
      if (!isEdit) {
        successMsg = this.$t(
          'workorder.report_added',
          'Failure Report added successfully!',
          { ns: 'workorder' }
        )
        response = await API.createRecord(
          `${moduleName}FailureClassRelationship`,
          { data },
          force
        )
      } else {
        successMsg = this.$t(
          'workorder.report_updated',
          'Failure Report updated successfully!',
          { ns: 'workorder' }
        )
        response = await API.updateRecord(
          `${moduleName}FailureClassRelationship`,
          {
            id: relModuleId,
            data,
          },
          force
        )
      }
      this.isLoading = false

      let { error } = response || {}
      if (error) {
        ftoast.critical(error?.message || 'Error occured while saving')
      } else {
        await this.refreshWidget()
        ftoast.success(successMsg)
      }
    },
    async refreshWidget() {
      this.autoResize()
      await this.getAssociatedFailureClass()
    },
    getRecord() {
      let recordList = []
      recordList.push(this.failureProblem)

      if (isEmpty(this.failureCause)) {
        recordList.push({
          type: 'Cause has not been added',
          name: '',
          description: '',
        })
      } else {
        recordList.push(this.failureCause)
      }

      if (isEmpty(this.failureRemedy)) {
        recordList.push({
          type: 'Remedy has not been added',
          name: '',
          description: '',
        })
      } else {
        recordList.push(this.failureRemedy)
      }
      return recordList
    },
  },
}
</script>
