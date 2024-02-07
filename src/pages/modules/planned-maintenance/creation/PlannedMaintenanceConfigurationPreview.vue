<template>
  <FContainer display="flex" flexDirection="column">
    <!-- Scope Configuration Preview -->
    <FContainer v-if="isLoading">
      <FShimmer :height="200" :width="650" />
    </FContainer>
    <FContainer
      v-else
      padding="containerXxLarge"
      backgroundColor="backgroundMidgroundSubtle"
      borderRadius="high"
      display="flex"
      flexDirection="column"
    >
      <FText appearance="headingMed14" color="textMain">
        {{ $t('pm_creation.pm_details', { ns: 'maintenance' }) }}
      </FText>
      <FContainer marginTop="containerXxLarge">
        <FieldsGroup
          style="overflow: hidden"
          :moduleName="moduleName"
          :columns="4"
          :detailsLayout="scopeFieldsLayout"
          :details="{ ...scopeData }"
          :config="config"
          :getRoute="getRoute"
          @redirectToSummary="redirectToSummary"
          :getTimeZone="getTimeZone"
        ></FieldsGroup>
      </FContainer>
    </FContainer>

    <!-- Work Order Configuration Preview -->
    <FContainer v-if="isFormLoading" marginTop="sectionSmall">
      <FShimmer :height="300" :width="650" />
    </FContainer>
    <FContainer
      v-else
      marginTop="sectionSmall"
      padding="containerXxLarge"
      backgroundColor="backgroundMidgroundSubtle"
      borderRadius="high"
      display="flex"
      flexDirection="column"
    >
      <FText appearance="headingMed14" color="textMain">
        {{ $t('pm_creation.work_order_details', { ns: 'maintenance' }) }}
      </FText>
      <FContainer marginTop="containerXxLarge">
        <FieldsGroup
          style="overflow: hidden"
          :moduleName="moduleName"
          :columns="4"
          :detailsLayout="clippedLayout"
          :details="{ ...moduleData }"
          :config="config"
          :getRoute="getRoute"
          @redirectToSummary="redirectToSummary"
          :getTimeZone="getTimeZone"
        ></FieldsGroup>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FRecordDetails,
  FShimmer,
  ftoast,
} from '@facilio/design-system'
import { FieldsGroup } from '@facilio/ui/new-app'
import { CustomModuleData } from '../../../../data/CustomModuleData'
import { SCOPE_PLACEHOLDER, dataTypeKey } from './utils/pm-utils.js'
import { isEmpty } from '@facilio/utils/validation'
import dlv from 'dlv'
import { getTimeFormat, getTimeZone } from '../../../../utils/formatter'
import { findRouteForModule, pageTypes } from '@facilio/router'
import FetchViewsMixin from '../../../../components/views/FetchViews.vue'
import { getBaseURL } from '../../../../utils/api/base-url.js'

export default {
  name: 'PlannedMaintenanceConfigurationPreview',
  components: {
    FContainer,
    FText,
    FRecordDetails,
    FieldsGroup,
    FShimmer,
    FetchViewsMixin,
  },

  props: {
    pmProps: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      moduleName: 'plannedmaintenance',
      isLoading: false,
      isFormLoading: false,
      moduleData: {},
      moduleObj: {},
      formObj: {},
      scopeData: {},
      getTimeZone,
    }
  },

  computed: {
    moduleDataId() {
      let { pmProps } = this
      let { id } = pmProps

      if (isEmpty(id)) {
        let { $route } = this
        let recordId = this.$attrs.id || $route.params.id
        id = !isEmpty(recordId) ? Number(recordId) : recordId
      }
      return id
    },
    modelDataClass() {
      return CustomModuleData
    },
    formId() {
      let { moduleData } = this
      let formId = moduleData?.formId
      return formId
    },

    /* Properties required for Planner detail  */
    plannerPreviewData() {
      let {} = this
      let data = {
        frequencyTypeName,
        resourceCount,
        startTime: executionStartDate,
        endTime: executionEndDate,
      }
      return data
    },

    scopeFieldsList() {
      let fieldsList = [
        {
          displayName: 'Name',
          name: 'name',
          displayType: 1,
          rowIndex: 1,
          colIndex: 1,
          colSpan: 1,
          field: {
            dataTypeEnum: 'TEXTBOX',
            displayType: 1,
            specialType: false,
          },
        },
        {
          displayName: 'Sites',
          name: 'sites',
          displayType: 66,
          rowIndex: 1,
          colIndex: 2,
          colSpan: 1,
          field: {
            dataTypeEnum: 'MULTI_LOOKUP',
            displayType: 66,
            specialType: false,
          },
        },
        {
          displayName: 'Category',
          name: 'category',
          displayType: 1,
          rowIndex: 1,
          colIndex: 3,
          colSpan: 1,
          field: {
            dataTypeEnum: 'TEXTBOX',
            displayType: 1,
            specialType: false,
          },
        },
      ]
      let { moduleData } = this
      let assignmentTypeEnum = moduleData?.assignmentTypeEnum

      if (assignmentTypeEnum === 'ASSETCATEGORY') {
        fieldsList.push({
          displayName: 'Asset Category',
          name: 'assetCategory',
          displayType: 1,
          rowIndex: 1,
          colIndex: 4,
          colSpan: 1,
          field: {
            dataTypeEnum: 'TEXTBOX',
            displayType: 1,
            specialType: false,
          },
        })
      } else if (assignmentTypeEnum === 'SPACECATEGORY') {
        fieldsList.push({
          displayName: 'Space Category',
          name: 'spaceCategory',
          displayType: 1,
          rowIndex: 1,
          colIndex: 4,
          colSpan: 1,
          field: {
            dataTypeEnum: 'TEXTBOX',
            displayType: 1,
            specialType: false,
          },
        })
      }
      return fieldsList
    },
    scopeFieldsLayout() {
      let { scopeFieldsList } = this
      let layout = {
        columns: 4,
        fields: scopeFieldsList,
      }
      let detailsLayout = [layout]
      return detailsLayout
    },

    clippedLayout() {
      let { formObj } = this
      let { fields = [] } = formObj || {}
      let layout = {
        columns: 4,
        fields,
      }
      let detailsLayout = [layout]
      return detailsLayout
    },
    config() {
      let { multiCurrency, $account: account } = this
      let timeformat = getTimeFormat()
      let timezone = dlv(account, 'org.timezone', 'Etc/UTC')
      let dateformat = dlv(account, 'org.dateFormat') || 'DD/MM/YYYY'
      return {
        dateformat: dateformat,
        timezone: timezone,
        timeformat: timeformat,
        org: this.$account.org,
        multiCurrency,
        baseUrl: getBaseURL(),
      }
    },
  },

  async created() {
    let { moduleName, moduleDataId } = this
    await this.loadModuleData({ moduleName, moduleDataId })
    let { formId } = this
    if (!isEmpty(formId)) {
      await this.loadFormData(formId)
    }
  },

  methods: {
    async loadModuleData({ moduleDataId, moduleName }) {
      this.isLoading = true
      try {
        let { customProps = {} } = this || {}
        this.moduleData = await this.modelDataClass.fetch({
          moduleName,
          id: moduleDataId,
          ...customProps,
        })
        let { moduleData } = this
        let assignmentTypeEnum = moduleData?.assignmentTypeEnum
        let category = moduleData?.assignmentTypeEnum
          ? SCOPE_PLACEHOLDER[assignmentTypeEnum]
          : '---'
        this.scopeData = {
          name: moduleData.name,
          sites: moduleData.sites,
          category,
        }

        if (assignmentTypeEnum === 'ASSETCATEGORY') {
          this.scopeData = {
            ...this.scopeData,
            assetCategory: moduleData?.assetCategory?.name || '---',
          }
        } else if (assignmentTypeEnum === 'SPACECATEGORY') {
          this.scopeData = {
            ...this.scopeData,
            spaceCategory: moduleData?.spaceCategory?.name || '---',
          }
        }
      } catch (error) {
        ftoast.critical(
          error.message || 'Error Occurred while fetching form details'
        )
      }
      this.isLoading = false
    },

    async loadFormData(formId) {
      this.isFormLoading = true
      let { moduleName, moduleDataId, moduleData } = this
      let formObj = {}
      let selectedForm = { id: formId }
      try {
        let form = await this.modelDataClass.loadFormData({
          formId,
          moduleName,
          selectedForm: selectedForm,
        })

        if (!isEmpty(form)) {
          formObj = {
            ...form,
            secondaryBtnLabel: 'Cancel',
            primaryBtnLabel: 'Save',
          }

          this.formObj = formObj

          if (!isEmpty(moduleDataId) && !isEmpty(moduleData?.id)) {
            let { fields = [] } = formObj || {}
            formObj = this.moduleData.deserialize(formObj)
            this.deserializePreviewFields(formObj)
          }
        }
      } catch (error) {
        ftoast.critical(
          error.message || 'Error Occurred while fetching form details'
        )
      }

      this.isFormLoading = false
      return formObj
    },

    deserializePreviewFields(formObj) {
      let { fields = [] } = formObj || {}
      let row = 3,
        col = 1
      let fieldsList1 = fields.filter(
        field => field.name === 'subject' || field.name === 'description'
      )
      let fieldsList2 = fields.filter(
        field => !(field.name === 'subject' || field.name === 'description')
      )

      fieldsList1 = fieldsList1.map(field => {
        let { name } = field
        if (name === 'subject') {
          field = { ...field, rowIndex: 1, colIndex: 1, colSpan: 4 }
        } else if (name === 'description') {
          field = { ...field, rowIndex: 2, colIndex: 1, colSpan: 4 }
        }
        return field
      })

      fieldsList2 = fieldsList2.map(field => {
        field = { ...field, rowIndex: row, colIndex: col, colSpan: 1 }
        col += 1
        if (col == 5) {
          col = 1
          row += 1
        }
        return field
      })

      fields = [...fieldsList1, ...fieldsList2]
      this.formObj = { ...formObj, fields }
    },

    async redirectToSummary(field) {
      let { moduleName, id } = field || {}
      let viewname = await this.fetchView(moduleName)
      let routerPath = null
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      if (name) {
        routerPath = this.$router.resolve({ name, params: { viewname, id } })
      }
      !!routerPath && window.open(routerPath?.href, '_blank')
    },

    getRoute(attrs) {
      let { moduleName } = this
      return findRouteForModule(moduleName, pageTypes.OVERVIEW)
    },
  },
}
</script>
