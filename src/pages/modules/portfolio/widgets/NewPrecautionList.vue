<template>
  <FContainer style="height: 100%">
    <FContainer
      v-if="loading"
      display="flex"
      justify-content="center"
      align-items="center"
      height="100%"
    >
      <FSpinner :size="30"> </FSpinner>
    </FContainer>
    <FContainer
      v-else-if="isEmpty(this.recordList)"
      display="flex"
      justify-content="center"
      align-items="center"
      height="100%"
    >
      <FEmptyState
        :title="
          $t(
            'safetyPlan.precautions.emptyState.title',
            'No Precautions Available',
            { ns: 'safetyPlan' }
          )
        "
        :vertical="false"
        size="S"
        illustration="no-entries"
      >
        <template #buttons v-if="isHazardModule">
          <FButton
            appearance="secondary"
            size="medium"
            @click="togglePrecautionWizard"
            >Select Precautions</FButton
          >
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer v-else>
      <CommonList
        v-if="!loading"
        ref="common-list"
        :slotList="slotList"
        :viewDetail="viewDetail"
        :records="recordList"
        :hideBorder="true"
        :portalName="widget.key + '-topbar'"
        selectType=""
        :getRoute="getRoute"
      >
        <template #[slotList[0].name]="{ record }" v-if="isHazardModule">
          <FIcon
            @click="deleteRecords([record.id])"
            pressable
            group="action"
            name="delete"
            size="16"
          >
          </FIcon>
        </template>
      </CommonList>
    </FContainer>
    <div class="widget-topbar-actions">
      <portal-target :name="widget.key + '-topbar'"></portal-target>
    </div>
    <portal :to="actionPortal">
      <FContainer
        v-if="!isHazardModule"
        display="flex"
        alignItems="center"
        justifyContent="center"
        class="related-list-widget-header-action"
      >
        <FContainer
          style="position: absolute; left: 100px"
          display="flex"
          align-items="center"
        >
          <FDivider height="24px" style="margin: 0px 12px" />
          <FDropdown
            :key="getDropdownName"
            :name="getDropdownName"
            @dropdown="filterList"
            :options="options"
            :split="false"
            :loading="false"
            selectable
            :buttonProps="{ appearance: 'secondary' }"
            contentWidth="200px"
          />
        </FContainer>
        <template v-if="!loading">
          <FInput
            v-if="showSearch"
            v-model="searchText"
            placeholder="search"
            appearance="default"
            size="medium"
            clearable
            @clear="showSearch = false"
            @enterPress="refreshRecordList"
          >
            <template #prefix>
              <FIcon
                group="action"
                name="search"
                size="16"
                :pressable="false"
                @click="showSearch = false"
              ></FIcon>
            </template>
          </FInput>
          <FIcon
            v-if="!showSearch"
            group="action"
            name="search"
            size="14"
            @click="showSearch = true"
          ></FIcon>
          <FDivider height="24px" margin="containerNone containerXLarge" />
          <ColumnCustomization
            :parentModuleName="parentModuleName"
            :moduleName="moduleName"
            :viewName="viewname"
            :viewFields="viewFields"
            @refreshRelatedList="refreshRecordList"
          ></ColumnCustomization>
        </template>
      </FContainer>
      <FContainer
        v-else-if="!isEmpty(this.recordList)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FButton
          appearance="secondary"
          size="medium"
          @click="togglePrecautionWizard"
          >Select Precautions</FButton
        >
        <FDivider height="24px" style="margin: 0px 12px" />
        <ColumnCustomization
          :parentModuleName="parentModuleName"
          :moduleName="moduleName"
          :viewName="viewname"
          :viewFields="viewFields"
          @refreshRelatedList="refreshRecordList"
        ></ColumnCustomization>
      </FContainer>
    </portal>
    <PrecautionsList
      v-if="showWizard"
      :details="details"
      :widget="widget"
      :records="recordList"
      @close="togglePrecautionWizard"
    ></PrecautionsList>
  </FContainer>
</template>
<script>
import PrecautionsList from '../components/PrecautionsLineItemList.vue'
import { CommonList } from '@facilio/ui/new-app'
import { LookupWizard } from '@facilio/ui/new-forms'
import {
  FContainer,
  FDivider,
  FIcon,
  FSpinner,
  FDropdown,
  FEmptyState,
  FButton,
  ftoast,
  fDialog,
  FInput,
} from '@facilio/design-system'
import ColumnCustomization from '../../../list/views/ColumnCustomization.vue'
import { CustomModuleData } from '../../../../data/CustomModuleData'
import { getFieldOptions } from '../../../../utils/picklist'
import {
  isArray,
  isEmpty,
  isFunction,
  isNullOrUndefined,
} from '@facilio/utils/validation'
import { getApp } from '@facilio/router'
import { API } from '@facilio/api'
export default {
  components: {
    FContainer,
    CommonList,
    FButton,
    FDivider,
    FEmptyState,
    FIcon,
    FDropdown,
    FInput,
    FSpinner,
    LookupWizard,
    ColumnCustomization,
    PrecautionsList,
  },
  props: [
    'moduleName',
    'moduleDisplayName',
    'widgetDetails',
    'viewname',
    'config',
    'widget',
    'details',
    'options',
    'parentModuleName',
    'isHazardModule',
    'actionPortal',
  ],
  created() {
    this.init()
  },
  data() {
    return {
      isEmpty,
      selectedValue: '',
      isArray,
      isFunction,
      dropDownName: '',
      viewDetail: null,
      recordList: null,
      isLoading: false,
      showSearch: false,
      searchText: '',
      recordCount: 0,
      showWizard: false,
      viewLoading: false,
      summaryDetailsLoading: false,
      showColumnSettings: false,
      selected: null,
    }
  },
  computed: {
    modelDataClass() {
      return CustomModuleData
    },
    getDropdownName() {
      let { dropDownName } = this
      if (!isEmpty(dropDownName)) {
        return dropDownName
      }
      return this.$t('safetyPlan.precautions.all', 'All Hazards', {
        ns: 'safetyPlan',
      })
    },
    slotList() {
      return [
        {
          name: 'action',
          isActionColumn: true,
          columnAttrs: {
            width: 130,
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        },
      ]
    },
    listUrlConfig() {
      let { searchText, parentId } = this
      let { relation } = this.widget || {}
      let { fromModuleName, reverseRelationLinkName } = relation || {}
      let params = {
        unAssociated: true,
      }
      if (!isEmpty(searchText)) {
        params.search = searchText
      }
      return {
        url: `v3/modules/${fromModuleName}/${parentId}/relationship/${reverseRelationLinkName}`,
        toModuleName: this.toModuleName,
        params,
      }
    },
    perPage() {
      return this.widgetDetails?.perPage || 10
    },
    emptyStateText() {
      let { moduleDisplayName, moduleName, widgetDetails } = this
      return (
        widgetDetails?.emptyStateText ||
        this.$t('common.products.no_module_available', {
          moduleName: moduleDisplayName || moduleName,
        })
      )
    },
    currentFilter() {
      let { appliedFilter, config } = this
      let { filters } = config || {}
      return { ...(filters || {}), ...(appliedFilter || {}) }
    },
    loading() {
      return this.isLoading || this.viewLoading || this.summaryDetailsLoading
    },
    viewFields() {
      let { fields } = this.viewDetail || {}
      return fields || []
    },
    mainFieldObj() {
      let { field: mainField } =
        this.viewFields.find(viewFld => viewFld?.field?.mainField) || {}
      return mainField || {}
    },
  },
  methods: {
    init() {
      this.loadViewDetails()
      this.refreshRecordList()
      this.loadSummaryDetailLayout()
      this.loadMetaInfo()
    },
    async refreshRecordList(force = false) {
      await this.loadRecords(force)
      await this.loadRecordCount(force)
    },
    togglePrecautionWizard() {
      this.showWizard = !this.showWizard
    },
    async deleteRecords(idList) {
      let { moduleDisplayName, moduleName, config } = this
      let { deletePopupDetails } = config || {}
      let { title, message, rbDanger, rbLabel } = deletePopupDetails || {}
      let customTitle = !isNullOrUndefined(title)
        ? title
        : `${this.$t('custommodules.list.delete')} ${moduleDisplayName}`
      let customMessage = !isNullOrUndefined(message)
        ? message
        : `${this.$t(
            'custommodules.list.delete_confirmation'
          )} ${moduleDisplayName}?`
      let customBtnLabel = !isNullOrUndefined(rbLabel)
        ? rbLabel
        : this.$t('custommodules.list.delete')
      let value = await fDialog.warning({
        title: customTitle,
        message: customMessage,
        rbDanger: !isNullOrUndefined(rbDanger) ? rbDanger : true,
        rbLabel: customBtnLabel,
      })

      if (value) {
        this.isLoading = true

        try {
          await this.modelDataClass.delete(moduleName, idList)
          ftoast.success(
            `${moduleDisplayName} ${this.$t(
              'custommodules.list.delete_success',
              'Deleted Successfully'
            )}`
          )
          this.$emit('onDelete')
          await this.refreshRecordList(true)
        } catch (errorMsg) {
          this.$message.error(errorMsg)
          this.isLoading = false
        }
      }
    },
    getRoute() {},
    async loadRecords(force = false) {
      let { moduleName, viewname, page, currentFilter, searchText, perPage } =
        this
      let { getRecordList } = this.config || {}
      let recordList = []

      this.isLoading = true
      try {
        if (isFunction(getRecordList)) {
          recordList = await getRecordList({
            page,
            filters: currentFilter,
            search: searchText,
            force,
          })
        } else {
          let params = {
            moduleName,
            viewName: viewname,
            filters: currentFilter,
            page,
            perPage,
            force,
            search: searchText,
          }

          recordList = await this.modelDataClass.fetchAll(params)
        }
        if (isArray(recordList)) {
          this.recordList = (recordList || []).map(record => ({
            ...record,
          }))
          await this.loadSiteList()
        }
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Unable to fetch moduleList')
      }
      this.isLoading = false
    },
    async loadRecordCount(force = false) {
      let { moduleName, viewname, currentFilter, searchText } = this
      let { getRecordCount } = this.config || {}
      let recordCount = null

      try {
        if (isFunction(getRecordCount)) {
          recordCount = await getRecordCount({
            filters: currentFilter,
            search: searchText,
            force,
          })
        } else {
          let params = {
            moduleName,
            viewname,
            filters: currentFilter,
            force,
            search: searchText,
          }

          recordCount = await this.modelDataClass.fetchRecordsCount(params)
        }

        this.recordCount = recordCount
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Unable to fetch count')
      }
    },
    async loadViewDetails() {
      let { moduleName, viewname, details } = this
      let { getViewDetails } = this.config || {}
      let response = {}
      let { moduleName: parentModule } = details || {}
      this.viewLoading = true
      try {
        if (isFunction(getViewDetails)) {
          response = await getViewDetails()
        } else {
          response = await API.get(
            `v2/views/${parentModule}/${moduleName}/${viewname}`,
            {
              moduleName,
            }
          )
        }
        let { error, data } = response || {}

        if (error) {
          throw error
        } else {
          this.viewDetail = data?.viewDetail || {}
        }
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Cannot fetch view details')
      }
      this.viewLoading = false
    },
    async loadSiteList() {
      let { recordList } = this
      let siteIds = (recordList || []).map(record => record.siteId)
      let defaultIds = [...new Set(siteIds)]
      let perPage = defaultIds.length

      if (perPage === 0) return

      let { error, options } = await getFieldOptions({
        field: { lookupModuleName: 'site', skipDeserialize: true },
        defaultIds,
        perPage,
      })

      if (!error) {
        this.siteList = options || {}
      }
    },
    async loadSummaryDetailLayout() {
      let { moduleName, widgetDetails, config } = this
      let { summaryWidgetName } = widgetDetails || {}
      let { expand } = config || {}

      if (!expand || isEmpty(summaryWidgetName)) return
      this.summaryDetailsLoading = true

      let appId = (getApp() || {}).id
      let params = { moduleName, appId, widgetName: summaryWidgetName }
      let { data, error } = await API.get(
        'v2/customPage/summaryFieldWidget',
        params
      )

      if (!error) {
        this.detailsLayoutProp = data
      }
      this.summaryDetailsLoading = false
    },
    async loadMetaInfo() {
      if (this.config?.canHideColumnConfig) return

      let { moduleName, details } = this
      let { moduleName: parentModule } = details || {}
      let { data, error } = await API.get(
        `/module/${parentModule}/${moduleName}/meta`,
        { moduleName }
      )

      if (!error) {
        this.metaInfo = data?.meta || {}
      }
    },
    filterList(hazard) {
      this.selectedValue = hazard
      this.dropDownName = hazard.label
      this.$emit('hazardSelected', hazard)
    },
  },
}
</script>
