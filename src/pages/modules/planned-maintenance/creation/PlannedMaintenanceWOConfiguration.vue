<template>
  <FContainer display="flex" flexDirection="column" alignItems="center">
    <FContainer display="flex" flexDirection="column">
      <FContainer
        paddingTop="containerXxLarge"
        paddingBottom="sectionSmall"
        position="sticky"
        zIndex="20"
        top="0px"
        backgroundColor="backgroundContainer"
        width="100%"
      >
        <PlannedMaintenanceConfigurationHeader
          :description="
            $t('pm_creation.configuration_header_description', {
              ns: 'maintenance',
            })
          "
          :heading="
            $t('pm_creation.configuration', {
              ns: 'maintenance',
            })
          "
          headingAppearance="headingMed16"
          descriptionAppearance="bodyReg14"
        ></PlannedMaintenanceConfigurationHeader>
      </FContainer>

      <FContainer marginTop="containerXxLarge">
        <ScopeConfiguration
          v-if="!isLoading"
          ref="scope-config-form"
          @onScopeChange="setScopeProperties"
          :labelPosition="labelPosition"
          :scopeModel="scopeModel"
          :isEdit="isEdit"
          :isScopeEdited.sync="isScopeEdited"
          :deletedSiteObj.sync="deletedSiteObj"
          :isDataEdited.sync="isDataEdited"
          :formWidthStyle="switchWidthStyle"
        ></ScopeConfiguration>
      </FContainer>

      <FContainer
        marginTop="containerXxLarge"
        border="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        borderRadius="high"
      >
        <FContainer v-if="isLoading" class="loading-container">
          <LiveFormLoader />
        </FContainer>
        <FContainer v-else>
          <FContainer
            v-if="showEmptyState"
            class="form-empty-container z-20"
            paddingTop="sectionSmall"
          >
            <FEmptyState
              illustration="no-entries"
              title=" No template configured"
              description="Please contact administrator"
              :vertical="true"
            />
          </FContainer>
          <FContainer
            v-else-if="!showEmptyState && !isCreateEditWidgetConfigured"
            class="dsm-form-wrapper z-20"
          >
            <LiveForm
              ref="live-web-form"
              :form="formObj"
              :formsList="forms"
              :isV3Api="isV3Api"
              :showHeader="true"
              :isEdit="isEdit"
              :moduleDataId="moduleDataId"
              :moduleData="moduleData"
              :saving="isSaving"
              :loading="isLoading"
              :connectedAppEventChannel="getConnectedAppsInstance()"
              :modifyFieldPropsHook="modifyFieldPropsHook1"
              :account="$account"
              :moduleName="moduleName"
              :liveFormWidthStyle="formSwitchStyle"
              :queryData="queryData"
              :dialog="true"
              @save="saveRecord"
              @cancel="redirectToList"
              @hasConnectedApp="hasConnectedApp"
              @onFormModelChange="setFormProperties"
            >
              <template #header>
                <FContainer
                  paddingTop="sectionSmall"
                  paddingLeft="sectionSmall"
                  paddingRight="sectionSmall"
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <FormHeading
                    :formHeading="formHeading"
                    formDescription=""
                    paddingRight="sectionSmall"
                  />
                  <FContainer>
                    <FContainer
                      class="dsm-form-container"
                      id="dsm-form-container"
                    >
                      <FContainer class="form-header-blur">
                        <PMv2FormSwitch
                          :form="selectedForm"
                          :formsList="forms"
                          :moduleDisplayName="moduleDisplayName"
                          :isEdit="isEdit"
                          class="form-switch"
                          @switchForm="switchForm"
                        />
                      </FContainer>
                    </FContainer>
                  </FContainer>
                </FContainer>
              </template>
            </LiveForm>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import ModuleForm from '../../../../pages/form/ModuleForm.vue'
import { LiveForm, LiveFormLoader } from '@facilio/forms'
import { FContainer, FText, ftoast, fDialog } from '@facilio/design-system'
import ScopeConfiguration from '../creation/ScopeConfiguration.vue'
import PlannedMaintenanceConfigurationHeader from './PlannedMaintenanceConfigurationHeader.vue'
import { getPlaceholderText, PUBLISH_STATUS } from './utils/pm-utils'
import FormHeading from './FormHeading.vue'
import PMv2FormSwitch from './PMv2FormSwitch.vue'

export default {
  name: 'PlannedMaintenanceWOConfiguration',
  extends: ModuleForm,
  components: {
    LiveForm,
    LiveFormLoader,
    FContainer,
    FText,
    ScopeConfiguration,
    FormHeading,
    PlannedMaintenanceConfigurationHeader,
    PMv2FormSwitch,
  },

  props: ['pmProps', 'disableButton', 'isDataEdited'],
  data() {
    return {
      formObj: {},
      scopeModel: {},
      isScopeEdited: false,
      deletedSiteObj: {},
      formHeading: this.$t('pm_creation.work_order_details', {
        ns: 'maintenance',
      }),
    }
  },
  computed: {
    isV3Api() {
      return true
    },
    labelPosition() {
      // setting label position to top, as other positions has to be supported
      // at DSM component level. Once supported, we can uncomment the below lines.

      // let { formObj } = this || {}
      // let { labelPosition } = formObj || {}
      // return Constants.FORMS_LABELALIGNMENT_ENUMHASH[labelPosition] || 'top'
      return 'top'
    },
    moduleDataId() {
      let { $route } = this
      let { query } = $route

      let { id } = query || {}

      if (isEmpty(id)) {
        let { params } = $route || {}
        let { id: recordId } = params || {}
        id = recordId
      }

      return !isEmpty(id) ? Number(id) : id
    },
  },

  methods: {
    setScopeProperties(value) {
      this.scopeModel = value
    },
    setFormProperties(value) {
      let { formModel } = this || {}
      this.formModel = { ...formModel, ...value }
      this.$emit('update:isDataEdited', true)
    },
    async onSave() {
      let validated = this.$refs['scope-config-form'].validate()
      if (!validated) {
        return false
      }

      let confirmPmCreation = await fDialog.info({
        title: this.$t(
          'pm_creation.confirm_planned_maintenance_creation_description_highlighted',
          {
            ns: 'maintenance',
          }
        ),
        description: this.$t(
          'pm_creation.confirm_planned_maintenance_creation_description',
          {
            ns: 'maintenance',
          }
        ),
        saveText: this.$t('pm_creation.confirm_creation', {
          ns: 'maintenance',
        }),
        cancelText: this.$t('pm_creation.cancel', { ns: 'maintenance' }),
      })
      if (!confirmPmCreation) {
        return false
      }
      let isSaveCompleted = await this.$refs['live-web-form'].saveRecord()

      return validated && isSaveCompleted
    },

    async loadModuleData({ moduleDataId, moduleName }) {
      let response
      this.isLoading = true
      if (this.isV3Api) {
        response = await API.fetchRecord(moduleName, { id: moduleDataId })
      } else {
        response = await API.get(
          `/v2/module/data/${moduleDataId}?moduleName=${moduleName}`,
          { force: true }
        )
      }

      let { error, data = {}, [moduleName]: record } = response
      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t('pm_creation.error_occurred', { ns: 'maintenance' })
        )
      } else {
        let moduleDataCopy = this.isV3Api ? record : data['moduleData']
        this.moduleData = new this.modelDataClass({
          moduleName,
          ...(moduleDataCopy || {}),
        })
        this.scopeModel = moduleDataCopy
        this.checkAndDeactivatePm()
      }
      this.isLoading = false
    },

    getFormattedText(text, isUpperCase) {
      let { moduleData } = this || {}

      return getPlaceholderText({ pmRecord: moduleData, text, isUpperCase })
    },

    async saveRecord() {
      this.$emit('updateIsSaving', true)
      let {
        moduleName,
        moduleDataId,
        isScopeEdited,
        deletedSiteObj,
        siteDialogMessage,
      } = this || {}

      let { deletedSiteCount } = deletedSiteObj || {}
      // let canSave = true
      if (isScopeEdited) {
        let dialogObj = {
          title: this.getFormattedText(
            this.$t('maintenance.pm.scope_changed', { ns: 'maintenance' })
          ),
          htmlMessage: this.getFormattedText(
            this.$t('maintenance.pm.scope_changed_desc', { ns: 'maintenance' })
          ),
          rbDanger: true,
          rbLabel: 'Confirm',
        }
        canSave = await this.$dialog.confirm(dialogObj)
      }
      // if (deletedSiteCount) {
      //   canSave = await this.$dialog.confirm({
      //     htmlMessage: siteDialogMessage,
      //     rbLabel: this.$t('pm_creation.proceed',  {ns:'maintenance'}),
      //     rbClass: 'pmv2-edit-dialog-btn',
      //     className: 'pmv2-edit-dialog',
      //   })
      //   if (!canSave) this.deletedSiteObj.canRevert = true
      // }
      // if (canSave) {

      let { formModel, scopeModel, formObj, selectedForm } = this || {}
      let { id: formId } = selectedForm || {}
      let response = await this.moduleData.save(
        formObj,
        formModel,
        this.afterSerializeHook
      )

      // let data = this.serializedData(formObj, formModel)
      // data = { ...scopeModel, ...data, formId }
      // // Create PM without Publishing it.
      // data = { ...data, pmStatus: PUBLISH_STATUS['Unpublish'] }
      // let promise
      // if (isEmpty(moduleDataId)) {
      //   promise = API.createRecord(moduleName, {
      //     data,
      //   })
      // } else {
      //   promise = API.updateRecord(moduleName, {
      //     data,
      //     id: moduleDataId,
      //   })
      // }

      let { error, [moduleName]: record } = response
      this.$emit('updateIsSaving', false)

      if (!error) {
        let { id } = record || {}
        let { $route } = this
        let { meta } = $route || {}
        let { pageType } = meta || {}
        if (pageType === 'CREATE') {
          this.$router.push({ path: '', query: { id: id, tab: 'planner' } })
        } else if (pageType === 'EDIT') {
          this.$router.push({ path: '', query: { tab: 'planner' } })
        }
        return true
      } else {
        ftoast.critical(
          error || 'Error occured while creating pm configuration'
        )
        return false
      }
    },
    disableSaveBtn(value) {
      this.$emit('update:disableButton', value)
    },
    afterSerializeHook({ data }) {
      let { scopeModel, selectedForm } = this || {}
      let { id: formId } = selectedForm || {}
      data = { ...scopeModel, ...data, formId }
      // Create PM without Publishing it.
      data = { ...data, pmStatus: PUBLISH_STATUS['Unpublish'] }
      return data
    },
    modifyFieldPropsHook1() {
      this.$emit('update:isDataEdited', true)
    },
    checkAndDeactivatePm() {
      let { isEdit, moduleData } = this || {}
      let { pmStatusEnum } = moduleData || {}
      if (isEdit && pmStatusEnum === 'ACTIVE') {
        this.deactivatePm()
      }
    },
    async deactivatePm() {
      let { moduleDataId: pmId } = this || {}
      let { error } = await API.post('/v3/plannedmaintenance/deactivate', {
        pmId,
      })
      if (!isEmpty(error)) {
        ftoast.critical(
          error.message ||
            this.$t('pm_creation.error_occurred', { ns: 'maintenance' })
        )
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.wo-configuration-container {
  /* margin: 0px 25%; */
  padding-bottom: 5%;
}
.live-form-dsm-section-container {
  box-shadow: 0 0 0 0 !important;
  // 0 0.3px 0.9px 0 rgba(0, 0, 0, 0.11),
  // 0 1.6px 3.6px 0 rgba(0, 0, 0, 0.13);

  &:hover {
    box-shadow: 0 0 0 0 !important;
    // 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.11),
    // 0 6.4px 14.4px 0 rgba(0, 0, 0, 0.13);
  }
}
</style>
