<template>
  <FContainer
    position="absolute"
    top="0px"
    left="0px"
    height="100vh"
    width="100%"
    backgroundColor="backgroundContainer"
  >
    <MultiStepperForm
      ref="kpi-creation-form"
      :formHeading="formHeading"
      :formDescription="$t('kpi_description', { ns: 'kpi' })"
      :stepsData="stepData"
      :currentStepName="activeStep"
      @currentStepListener="
        (isLastPage, currentStep) => currentStepHandler(isLastPage, currentStep)
      "
    >
      <template #page-header-buttons>
        <FContainer gap="containerXLarge" display="flex">
          <FButton
            appearance="secondary"
            size="medium"
            @click="onClickDiscard"
            :disabled="isSaving"
          >
            {{ $t('discard_and_close', { ns: 'kpi' }) }}
          </FButton>
        </FContainer>
      </template>

      <template #main-content>
        <component
          v-if="!isLoading"
          ref="main-content-component"
          :is="activePage"
          :moduleName="moduleName"
          :kpiDetailsObj="kpiDetailsObj"
          :kpiTypeObj="kpiTypeObj"
          :kpiFormulaBuilderObj="kpiFormulaBuilderObj"
          :isEditForm="isEditForm"
          @kpiDetailsChange="setKpiDetailsObj"
          @kpiTypeChange="setKpiTypeObj"
          @kpiFormulaBuilderObjChange="setKpiFormulaBuilderObj"
        ></component>
      </template>

      <template #footer-buttons>
        <FButton
          v-if="showPrevButton"
          appearance="secondary"
          size="medium"
          @click="prevPageButtonClick"
          :disabled="isSaving"
        >
          {{ $t('previous', { ns: 'kpi' }) }}
        </FButton>
        <FContainer paddingLeft="containerLarge">
          <FButton
            appearance="primary"
            size="medium"
            @click="nextPageButtonClick"
            :loading="nextButtonLoading || isSaving"
          >
            {{ saveButtonText }}
          </FButton>
        </FContainer>
      </template>
    </MultiStepperForm>
  </FContainer>
</template>
<script>
import { FContainer, FButton, ftoast } from '@facilio/design-system'
import { MultiStepperForm } from '@facilio/ui/new-forms'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { CustomModuleData } from '../../../data/CustomModuleData'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import { dset } from 'dset'
import { constructNamespace } from '@facilio/formula'
import { API } from '@facilio/api'

export default {
  name: 'KPICreationForm',
  components: {
    FContainer,
    FButton,
    MultiStepperForm,
    kpiDetails: () => import('./KPIDetails.vue'),
    kpiFormulaBuilder: () => import('./KPIFormulaBuilder.vue'),
  },
  data() {
    return {
      activeStep: 'KPI Details',
      currentPageNumber: 1,
      isLastPage: false,
      isSaving: false,
      nextButtonLoading: false,
      isLoading: false,
      kpiDetailsObj: {
        name: '',
        metricId: null,
        unitId: null,
        customUnit: null,
        description: '',
        resourceType: 1, //enum index
        categoryId: null,
        connectedResources: null,
      },
      kpiTypeObj: {
        kpiTypeLabel: 'computed',
        kpiType: 1,
        frequency: null,
      },
      kpiFormulaBuilderObj: {},
    }
  },
  created() {
    this.init()
  },
  computed: {
    formHeading() {
      let { isEditForm } = this
      return isEditForm
        ? this.$t('edit_kpi', { ns: 'kpi' })
        : this.$t('new_kpi', { ns: 'kpi' })
    },
    recordId() {
      return (
        getProperty(this, '$route.params.id', null) ||
        getProperty(this, '$attrs.id', null)
      )
    },
    isEditForm() {
      let { recordId } = this
      return !isEmpty(recordId)
    },
    modelDataClass() {
      return CustomModuleData
    },
    moduleName() {
      return getProperty(this, '$attrs.moduleName', '')
    },
    saveButtonText() {
      let { isLastPage } = this
      return isLastPage
        ? this.$t('save', { ns: 'kpi' })
        : this.$t('next', { ns: 'kpi' })
    },
    activePage() {
      let { $route = {}, steps = [] } = this
      let { query = {} } = $route
      let { tab } = query

      // update active step
      const pageNumber = steps.findIndex((step = {}) => step.name === tab);

      let { displayName } = steps[pageNumber] || {}
      this.activeStep = displayName

      return tab || 'kpiDetails'
    },
    stepData() {
      return this.steps.map(step => step.displayName)
    },
    steps() {
      return [
        {
          displayName: this.$t('kpi_details', { ns: 'kpi' }),
          name: 'kpiDetails',
        },
        {
          displayName: this.$t('kpi_formula_builder', { ns: 'kpi' }),
          name: 'kpiFormulaBuilder',
        },
      ]
    },
    showPrevButton() {
      let { currentPageNumber } = this
      return currentPageNumber !== 1
    },
  },
  methods: {
    async init() {
      let { isEditForm, moduleName, recordId } = this
      this.isLoading = true
      if (isEditForm) {
        let { data } = await this.modelDataClass.fetchRecord({
          moduleName,
          id: recordId,
        })
        let {
          name,
          metricId,
          unitId,
          customUnit,
          description,
          resourceType,
          category,
          assets,
        } = data || {}
        let { ctx } = category || {}
        let { id: categoryId } = ctx || {}
        let kpiDetailsObj = {
          name,
          metricId,
          unitId,
          customUnit,
          description,
          resourceType, //enum index
          categoryId,
          connectedResources: assets,
        }
        this.setKpiDetailsObj(kpiDetailsObj)
        let { kpiType, frequency, ns } = data || {}
        let kpiTypeLabel = kpiType === 3 ? 'realtime' : 'computed'
        let kpiTypeObj = {
          kpiTypeLabel,
          kpiType,
          frequency,
        }
        this.setKpiTypeObj(kpiTypeObj)
        dset(this, 'kpiFormulaBuilderObj', ns)
      }
      this.isLoading = false
    },
    currentStepHandler(isLastPage, currentStep) {
      this.isLastPage = isLastPage
      this.currentPageNumber = currentStep
      this.redirectToStep(currentStep)
    },
    redirectToStep(currentStep) {
      let { steps } = this || {}
      if (currentStep <= steps.length) {
        let step = steps[currentStep - 1] // doing currentStep - 1 as currentStep is based on 1
        let { name = '' } = step || {}
        let query = getProperty(this, '$route.query')
        this.$router
          .push({ path: '', query: { ...query, tab: name } })
          .catch(() => {})
      }
    },
    prevPageButtonClick() {
      this.$refs['kpi-creation-form'].moveToPrevPage()
      let { kpiFormulaBuilderObj } = this
      let { fields, workflowContext } = kpiFormulaBuilderObj || {}
      let modifiedKpiFormulaBuilderObj = {}
      if (!isEmpty(fields)) {
        let modifiedFields = fields.filter(field => {
          let { fieldId } = field || {}
          return !isEmpty(fieldId)
        })
        if (!isEmpty(modifiedFields)) {
          modifiedKpiFormulaBuilderObj = constructNamespace({
            fields: modifiedFields,
            workflowContext,
          })
        }
      }
      dset(this, 'kpiFormulaBuilderObj', modifiedKpiFormulaBuilderObj)
    },
    async nextPageButtonClick() {
      let pageComponent = this.$refs['main-content-component']
      if (!isEmpty(pageComponent)) {
        let { validateForm } = pageComponent || {}
        if (!isEmpty(validateForm)) {
          let canProceed = pageComponent.validateForm()
          // validate before moving to next page
          if (canProceed) {
            let { isLastPage } = this
            if (isLastPage) {
              this.isSaving = true
              await this.save()
              this.isSaving = false
            } else this.$refs['kpi-creation-form'].moveToNextPage()
          }
        }
      }
    },
    async save() {
      let {
        kpiDetailsObj,
        kpiTypeObj,
        kpiFormulaBuilderObj,
        moduleName,
        isEditForm,
      } = this
      let assets = getProperty(kpiDetailsObj, 'connectedResources', null)
      delete kpiDetailsObj.connectedResources
      let data = {
        ...kpiDetailsObj,
        assets,
        ...kpiTypeObj,
        ns: constructNamespace(kpiFormulaBuilderObj, assets),
      }
      let isValidKpi = this.validateFields(data)
      if (isValidKpi) {
        if (!isEditForm) {
          let { error } = await API.createRecord(moduleName, { data })
          if (error) {
            ftoast.critical(error.message)
          } else {
            ftoast.success(this.$t('create_success', { ns: 'kpi' }))
            this.redirectToList()
          }
        } else {
          let { recordId: id } = this
          let { error } = await API.updateRecord(moduleName, { data, id })
          if (error) {
            ftoast.critical(error.message)
          } else {
            ftoast.success(this.$t('edit_success', { ns: 'kpi' }))
            this.redirectToList()
          }
        }
      } else {
        ftoast.critical(this.$t('variables_must_be_unique', { ns: 'kpi' }))
      }
    },
    validateFields(data = {}) {
      let variables = []
      let isRelatedReadingPresent = false
      let isCurrentAssetAvailable = false
      let { ns = {} } = data
      let { fields, includedAssetIds = [] } = ns

      variables = fields

      const uniqueVariables = [
        ...new Set(variables.map(variable => variable.varName)),
      ]
      const finalReadings = []

      variables.forEach(variable => {
        let {
          fieldId,
          resourceId,
          relMapContext = {},
          nsFieldType,
        } = variable || {}
        let { mappingLinkName } = relMapContext

        if (!isEmpty(fieldId)) {
          finalReadings.push(fieldId)
        }
        if (
          (resourceId === -1 &&
            ['ASSET_READING', 'METER_READING', 'SITE_READING'].includes(
              nsFieldType
            )) ||
          !isEmpty(mappingLinkName)
        ) {
          isCurrentAssetAvailable = isCurrentAssetAvailable || true
        }
        if (nsFieldType === 'RELATED_READING') {
          isRelatedReadingPresent = true
        }
      })

      if (
        uniqueVariables.length === variables.length &&
        finalReadings.length === variables.length
      ) {
        return (
          isCurrentAssetAvailable ||
          isRelatedReadingPresent ||
          (!isEmpty(includedAssetIds) && includedAssetIds.length <= 5)
        )
      }
      return false
    },
    onClickDiscard() {
      this.redirectToList()
    },
    redirectToList() {
      let { viewname } = this

      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule(this.moduleName, pageTypes.LIST) || {}
        if (name) {
          this.$router.push({
            name,
            params: {
              viewname,
            },
            query: this.$route.query,
          })
        }
      }
    },
    setKpiDetailsObj(kpiDetailsObj) {
      dset(this, 'kpiDetailsObj', kpiDetailsObj)
    },
    setKpiTypeObj(kpiTypeObj) {
      dset(this, 'kpiTypeObj', kpiTypeObj)
    },
    setKpiFormulaBuilderObj(kpiFormulaBuilderObj) {
      dset(this, 'kpiFormulaBuilderObj', kpiFormulaBuilderObj)
    },
  },
}
</script>
