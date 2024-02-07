<template>
  <FContainer margin="sectionSmall sectionSmall containerNone">
    <ConnectedForm
      v-if="!isLoading"
      :renderDetails="formObj"
      @closeForm="redirectToList"
    >
      <template #header-image>
        <FContainer display="flex" justifyContent="flex-end" height="100%">
          <FContainer width="350px" height="180px" overflow="hidden">
            <fc-illustration name="server" size="L" />
          </FContainer>
        </FContainer>
      </template>
      <template #save-action>
        <FButton
          :disabled="isNotAllowSave"
          :loading="isSaving"
          appearance="primary"
          size="medium"
          @click="saveRecord"
          >{{ $t('controls.save_btn_text', { ns: 'energy' }) }}</FButton
        >
      </template>
      <template #1-content>
        <ControlDetailsActionsForm
          :basicDetail="basicDetails"
          :isControlActionTemplateModule="true"
          @onDataChange="onDataChange"
        />
      </template>
      <template #2-content>
        <FContainer
          display="flex"
          justifyContent="center"
          marginTop="containerXxLarge"
          width="100%"
        >
          <FContainer display="flex" flexDirection="column" width="60%">
            <FContainer>
              <CritriaListComponent :renderDetails="assetRenderDetails" />
            </FContainer>
            <FContainer marginTop="containerXxLarge">
              <CritriaListComponent :renderDetails="controllerRenderDetails" />
            </FContainer>
          </FContainer>
        </FContainer>
      </template>
      <template #3-content>
        <FContainer
          display="flex"
          justifyContent="center"
          marginTop="containerXxLarge"
          width="100%"
        >
          <FContainer display="flex" flexDirection="column" width="60%">
            <FContainer>
              <CritriaListComponent :renderDetails="siteRenderDetails" />
            </FContainer>
          </FContainer>
        </FContainer>
      </template>
    </ConnectedForm>
  </FContainer>
</template>
<script>
import { FContainer, FButton, ftoast } from '@facilio/design-system'
import { ConnectedForm } from '@facilio/ui/new-forms'
import ControlDetailsActionsForm from '../controlAction/components/ControlDetailsActionsForm.vue'
import CritriaListComponent from '../controlAction/components/CritriaListComponent.vue'
import cloneDeep from 'lodash/cloneDeep'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import {
  getExecutionType,
  isScheduledTemplateType,
} from '../controlAction/widgets/controlsUtil'
export default {
  data() {
    return {
      basicDetails: {},
      isSaving: false,
      isLoading: false,
      moduleName: 'controlActionTemplate',
      assetRenderDetails: {
        headerName: this.$t('controls._asset_criteria', { ns: 'energy' }),
        moduleName: 'asset',
        infoBanner: true,
        criteria: null,
      },
      siteRenderDetails: {
        headerName: this.$t('controls._site_criteria', { ns: 'energy' }),
        moduleName: 'site',
        infoBanner: true,
        criteria: null,
      },
      controllerRenderDetails: {
        headerName: this.$t('controls._controller_criteria', { ns: 'energy' }),
        moduleName: 'controllers',
        infoBanner: true,
        criteria: null,
      },
    }
  },
  created() {
    let { $attrs, basicDetails } = this
    this.basicDetails = { ...basicDetails, controlActionTemplateType: null }
    let { id } = $attrs || {}
    if (!isEmpty(id)) {
      this.loadFormData(id)
    }
  },
  computed: {
    isNotAllowSave() {
      let { basicDetails = {} } = this
      let {
        name,
        controlActionType,
        assetCategory,
        controlActionTemplateType,
        calendar,
      } = basicDetails
      if (isScheduledTemplateType(controlActionTemplateType)) {
        return isEmpty(calendar)
      }
      return (
        isEmpty(name) ||
        isEmpty(controlActionType) ||
        isEmpty(assetCategory) ||
        isEmpty(controlActionTemplateType)
      )
    },
    formObj() {
      let { basicDetails = {} } = this
      let { controlActionTemplateType } = basicDetails
      let tabs = [
        {
          label: this.$t('controls.ca_header', { ns: 'energy' }),
          value: '1',
        },
      ]
      if (controlActionTemplateType !== 3) {
        let additionalTabs = [
          {
            label: this.$t('controls.asset_criteria', { ns: 'energy' }),
            value: '2',
          },
          {
            label: this.$t('controls.site_criteria', { ns: 'energy' }),
            value: '3',
          },
        ]
        tabs = [...tabs, ...additionalTabs]
      }
      return {
        tabsList: tabs,
        headerObject: {
          title: this.$t('controls.new_ca_template', { ns: 'energy' }),
          description: this.$t('controls.ca_template_description', {
            ns: 'energy',
          }),
          gradient: 'blue',
        },
        isForm: true,
      }
    },
    moduleDisplayName() {
      return 'Control Action Template'
    },
  },
  components: {
    FContainer,
    CritriaListComponent,
    FButton,
    ConnectedForm,
    ControlDetailsActionsForm,
  },
  methods: {
    onDataChange(updatedDetails) {
      this.basicDetails = cloneDeep(updatedDetails)
    },
    async loadFormData(id) {
      this.isLoading = true
      let { moduleName, basicDetails } = this
      let { error = {}, [moduleName]: record = {} } = await API.fetchRecord(
        moduleName,
        {
          id,
        }
      )
      if (error) {
        let { message } = error
        ftoast.critical(message)
      } else {
        let {
          assetCriteria = {},
          siteCriteria = {},
          controllerCriteria = {},
          assetCategory = {},
          calendar = {},
        } = record
        let { conditions: assetConditions, pattern: assetPattern } =
          assetCriteria
        let { conditions: siteConditions, pattern: sitePattern } = siteCriteria
        let { conditions: controllerConditions, pattern: controllerPattern } =
          controllerCriteria
        let { id: categoryId } = assetCategory
        let { id: calendarId } = calendar
        this.basicDetails = {
          ...basicDetails,
          ...record,
          assetCategory: categoryId,
          calendar: calendarId,
        }
        this.assetRenderDetails.criteria =
          !isEmpty(assetConditions) && !isEmpty(assetPattern)
            ? {
                conditions: assetConditions,
                pattern: assetPattern,
              }
            : null
        this.controllerRenderDetails.criteria =
          !isEmpty(controllerConditions) && !isEmpty(controllerPattern)
            ? {
                conditions: controllerConditions,
                pattern: controllerPattern,
              }
            : null
        this.siteRenderDetails.criteria =
          !isEmpty(siteConditions) && !isEmpty(sitePattern)
            ? {
                conditions: siteConditions,
                pattern: sitePattern,
              }
            : null
      }
      this.isLoading = false
    },
    serializedData() {
      let {
        basicDetails = {},
        assetRenderDetails = {},
        siteRenderDetails = {},
        controllerRenderDetails = {},
      } = this
      let {
        assetCategory,
        calendar,
        name,
        siteCriteriaId,
        assetCriteriaId,
        controllerCriteriaId,
        controlActionTemplateType,
        isEnableRevert,
        actionContextList = [],
        revertActionDateTime,
        isSandBox,
      } = basicDetails
      let unWantedDataToSave = []
      assetCategory = { id: assetCategory }
      calendar = { id: calendar }
      let { criteria: assetCriteria } = assetRenderDetails
      let { criteria: siteCriteria } = siteRenderDetails
      let { criteria: controllerCriteria } = controllerRenderDetails
      if (!isEmpty(siteCriteriaId)) {
        unWantedDataToSave.push('siteCriteriaId')
      }
      if (!isEmpty(assetCriteriaId)) {
        unWantedDataToSave.push('assetCriteriaId')
      }
      if (!isEmpty(controllerCriteriaId)) {
        unWantedDataToSave.push('controllerCriteriaId')
      }
      let updatedActionContextList = cloneDeep(actionContextList)
      if (!isEnableRevert) {
        revertActionDateTime = null
        updatedActionContextList = actionContextList.map(action => {
          return {
            ...action,
            revertActionOperatorType: null,
            revertActionValue: null,
          }
        })
      }
      if (controlActionTemplateType != 2) {
        unWantedDataToSave.push('calendar')
      }
      let controlActionExecutionTypeEnum = isSandBox ? 'SIMULATION' : 'ACTUAL'
      let dataToSave = {
        ...basicDetails,
        revertActionDateTime,
        actionContextList: updatedActionContextList,
        controlActionExecutionType: getExecutionType(
          controlActionExecutionTypeEnum
        ),
        assetCategory,
        subject: name,
        calendar,
        assetCriteria,
        siteCriteria,
        controllerCriteria,
      }
      unWantedDataToSave.forEach(val => {
        delete dataToSave[val]
      })
      return dataToSave
    },
    async saveRecord() {
      this.isSaving = true
      let { $attrs, moduleName, moduleDisplayName } = this
      let { id } = $attrs || {}
      let data = this.serializedData()
      let response = {}
      let msg = ''
      if (isEmpty(id)) {
        response = await API.createRecord(moduleName, {
          data,
        })
        msg = `${moduleDisplayName} ${this.$t('created', { ns: 'energy' })}`
      } else {
        response = await API.updateRecord(moduleName, {
          id,
          data,
        })
        msg = `${moduleDisplayName} ${this.$t('updated', { ns: 'energy' })}`
      }

      let { error, [this.moduleName]: record } = response || {}
      if (!error) {
        let { id: recordId } = record || {}
        ftoast.success(msg)
        this.redirectToSummary(recordId)
      } else {
        ftoast.critical(error?.message)
      }
      this.isSaving = false
    },
    redirectToSummary(id) {
      if (isWebTabsEnabled() && !isEmpty(id)) {
        let { name } =
          findRouteForModule(this.moduleName, pageTypes.OVERVIEW) || {}
        name &&
          this.$router.push({
            name,
            params: { id, viewname: 'all' },
          })
      }
    },
    redirectToList() {
      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule(this.moduleName, pageTypes.LIST) || {}
        name &&
          this.$router.push({
            name,
          })
      }
    },
  },
}
</script>
