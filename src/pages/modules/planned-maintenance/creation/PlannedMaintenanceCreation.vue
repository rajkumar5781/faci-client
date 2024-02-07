<template>
  <FContainer class="pm-form-container">
    <MultiStepperForm
      ref="multi-stepper-form"
      :formHeading="formHeading"
      :formDescription="formDescription"
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
            {{ closeButtonText }}
          </FButton>
        </FContainer>
      </template>

      <template #main-content>
        <FContainer marginBottom="containerXxLarge">
          <component
            ref="main-content-component"
            :is="activePage"
            :moduleName="moduleName"
            :isSaving.sync="isSaving"
            @updateIsSaving="isSaving => updateIsSaving(isSaving)"
            @loadPMDetail="id => loadPMDetail(id)"
            :pmProps="pmProps"
            :pmRecord="pmRecord"
            :isPmLoading="isPmLoading"
            :disableButton.sync="disableButton"
            :isDataEdited.sync="isDataEdited"
          ></component>
        </FContainer>
      </template>
      <template #footer-buttons>
        <FButton
          v-if="showPrevButton"
          appearance="tertiary"
          size="medium"
          iconGroup="navigation"
          iconName="left"
          iconPosition="prefix"
          @click="prevPageButtonClick"
          :disabled="isSaving"
        >
          {{ prevButtonName }}
        </FButton>
        <FButton
          appearance="primary"
          size="medium"
          iconGroup="navigation"
          :iconName="nextButtonIconName"
          iconPosition="suffix"
          @click="nextPageButtonClick"
          :loading="nextButtonLoading || isSaving"
        >
          {{ saveButtonText }}
        </FButton>
      </template>
    </MultiStepperForm>
  </FContainer>
</template>

<script>
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { FContainer, FButton, ftoast } from '@facilio/design-system'
import { MultiStepperForm } from '@facilio/ui/new-forms'
import PlannedMaintenanceWOConfiguration from '../creation/PlannedMaintenanceWOConfiguration.vue'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import { API } from '@facilio/api'
import FetchViewsMixin from '../../../../components/views/FetchViews.vue'

export default {
  name: 'PlannedMaintenanceCreation',

  components: {
    FContainer,
    MultiStepperForm,
    FButton,
    PlannedMaintenanceWOConfiguration,
    configuration: () => import('./PlannedMaintenanceWOConfiguration.vue'),
    planner: () => import('./PlannerConfiguration.vue'),
    preview: () => import('./PlannedMaintenanceCreationPreview.vue'),
  },
  mixins: [FetchViewsMixin],
  data: () => ({
    canMoveToNextPage: true,
    currentPageNumber: 1,
    isLastPage: false,
    saveButtonName: 'Publish',
    prevButtonName: 'Prev',
    nextButtonLoading: false,
    isSaving: false,
    disableButton: false, // seems to be dummy
    activeStep: 'Configuration',
    isDataEdited: false,
    pmRecord: {},
    isPmLoading: false,
  }),
  computed: {
    pmProps() {
      let { $route } = this || {}
      let { query } = $route || {}
      let { id } = query || {}
      if (isEmpty(id)) {
        let { params } = $route || {}
        let { id: recordId } = params || {}
        id = recordId
      }
      id = !isEmpty(id) ? parseInt(id) : null
      return { id }
    },
    stepData() {
      return this.steps.map(step => step.displayName)
    },
    moduleName() {
      let { $attrs } = this
      let { moduleName = '' } = $attrs || {}
      return moduleName
    },
    showPrevButton() {
      let { currentPageNumber } = this
      if (currentPageNumber === 1) {
        return false
      }
      return true
    },
    saveButtonText() {
      let { isLastPage, saveButtonName, currentPageNumber, steps } = this
      if (isLastPage) {
        return saveButtonName
      }
      let currentStep = steps[currentPageNumber - 1]
      if (currentStep.name === 'planner') {
        return 'Continue'
      }
      return 'Save & Continue'
    },
    nextButtonIconName() {
      let { isLastPage } = this
      if (isLastPage) {
        return ''
      }
      return 'right'
    },
    activePage() {
      let { $route, steps } = this || {}
      let { query } = $route || {}
      let { tab } = query || {}

      // update active step
      let pageNumber = 0
      steps.find((step, index) => {
        if (step.name === tab) {
          pageNumber = index
        }
      })
      let { displayName } = steps[pageNumber] || {}
      this.activeStep = displayName

      return tab || 'configuration'
    },
    closeButtonText() {
      let { currentPageNumber, steps } = this
      let currentStep = steps[currentPageNumber - 1]
      if (currentStep.name === 'configuration') {
        return this.$t('pm_creation.discard_and_close', {
          ns: 'maintenance',
        })
      }
      return this.$t('pm_creation.close', {
        ns: 'maintenance',
      })
    },

    // Constants
    formHeading() {
      return this.$t('pm_creation.multi_stepper_form_title', {
        ns: 'maintenance',
      })
    },
    formDescription() {
      return this.$t('pm_creation.multi_stepper_form_description', {
        ns: 'maintenance',
      })
    },
    steps() {
      return [
        {
          displayName: this.$t('pm_creation.configuration', {
            ns: 'maintenance',
          }),
          name: 'configuration',
        },
        {
          displayName: this.$t('pm_creation.planner', { ns: 'maintenance' }),
          name: 'planner',
        },
        {
          displayName: this.$t('pm_creation.preview', { ns: 'maintenance' }),
          name: 'preview',
        },
      ]
    },
  },
  methods: {
    /**
     * loadPm fetches the PM
     */
    async loadPMDetail(pmId) {
      if (isEmpty(pmId)) {
        return
      }
      this.isPmLoading = true
      let moduleName = 'plannedmaintenance'
      let { [moduleName]: data, error } = await API.fetchRecord(
        moduleName,
        {
          id: pmId,
        },
        { force: true }
      )
      if (isEmpty(error)) {
        this.pmRecord = data
      } else {
        ftoast.critical(
          error.message || 'Error occured while fetching planned maintenance'
        )
      }
      this.isPmLoading = false
    },
    /**
     * Callback methods for PageHeader buttons
     */
    onClickDiscard() {
      this.redirectToList()
    },

    /**
     * Callback method called after the page is changed.
     * @param {*} isLastPage
     * @param {*} currentStep
     */
    currentStepHandler(isLastPage, currentStep) {
      this.isLastPage = isLastPage
      this.currentPageNumber = currentStep
      console.log('currentStepHandler next page: ' + currentStep)
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

    /**
     * Callback methods for footer buttons
     */
    prevPageButtonClick() {
      this.$refs['multi-stepper-form'].moveToPrevPage()
    },
    async nextPageButtonClick() {
      this.nextButtonLoading = true

      let pageComponent = this.$refs['main-content-component']
      if (!isEmpty(pageComponent)) {
        // this.isSaving = true

        let { onSave } = pageComponent || {}

        if (!isEmpty(onSave)) {
          let canProceed = await pageComponent.onSave()
          if (canProceed) {
            // validate before moving to next page
            this.$refs['multi-stepper-form'].moveToNextPage()
          }
        }

        // this.isSaving = false
      }

      this.nextButtonLoading = false
    },
    updateIsSaving(isSaving) {
      this.isSaving = isSaving
    },

    redirectToList() {
      let { viewname } = this

      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule(this.moduleName, pageTypes.LIST) || {}
        name &&
          this.$router.push({
            name,
            params: {
              viewname,
            },
            query: this.$route.query,
          })
      } else {
        this.$router.push({
          name: 'pm-list',
          params: { viewname },
          query: this.$route.query,
        })
      }
    },

    // TODO: handle redirectToList when edit is clicked from List, and redirectToSummary when edit is clicked summary
    async redirectToSummary() {
      let { pmProps, moduleName } = this
      let { id } = pmProps || {}
      if (isEmpty(id)) {
        this.redirectToList()
      }
      let viewname = await this.fetchView(moduleName)
      let routerPath = null
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      if (name) {
        routerPath = this.$router.resolve({ name, params: { viewname, id } })
      }
      !!routerPath && this.$router.push(routerPath?.href)
    },
  },
}
</script>
<style scoped>
.pm-form-container {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 100vh;
  width: 100%;
  background: #ffffff;
}
</style>
