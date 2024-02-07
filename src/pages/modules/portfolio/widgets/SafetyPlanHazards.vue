<template>
  <FContainer style="height: 100%">
    <portal :to="`action-${widget.id}-${widget.name}`">
      <FContainer display="flex" alignItems="center" justifyContent="center">
        <template v-if="!isEmpty(recordList) || !isEmpty(searchText)">
          <template v-if="canShowAddButton">
            <FInput
              v-if="showSearch"
              v-model="searchText"
              placeholder="search"
              appearance="default"
              size="medium"
              clearable
              @enterPress="refreshList"
            >
              <template #prefix>
                <FIcon
                  group="action"
                  name="search"
                  size="16"
                  :pressable="false"
                  @click="showSearch = false"
                ></FIcon> </template
            ></FInput>
            <FIcon
              v-if="!showSearch"
              group="action"
              name="search"
              size="14"
              @click="showSearch = true"
            ></FIcon>
            <FDivider height="24px" style="margin: 0px 12px" />
            <FButton
              appearance="secondary"
              size="small"
              :split="false"
              iconGroup="navigation"
              iconName="addition"
              iconPosition="prefix"
              @click="openLookupWizard"
            >
              {{
                $t('safetyPlan.add_hazard', 'Add Hazard', { ns: 'safetyPlan' })
              }}
            </FButton>
          </template>
          <ColumnCustomization
            :parentModulName="currentModuleName"
            :moduleName="moduleName"
            :viewName="viewname"
            :viewFields="viewFields"
            @refreshRelatedList="reloadData"
          ></ColumnCustomization>
        </template>
      </FContainer>
    </portal>
    <FContainer
      v-if="showLoading"
      display="flex"
      justify-content="center"
      align-items="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(recordList) && isEmpty(searchText)"
      height="100%"
      width="100%"
      display="flex"
      justify-content="center"
      alignItems="center"
    >
      <FEmptyState
        :title="
          $t('safetyPlan.emptyState.title', `No Hazards Associated`, {
            ns: 'portfolio',
          })
        "
        :description="
          $t(
            'safetyPlan.emptyState.desc',
            `No hazards associated for this record`,
            { ns: 'portfolio' }
          )
        "
        vertical
        size="S"
        illustration="no-entries"
      >
        <template #buttons>
          <FButton
            v-if="canShowAddButton"
            appearance="secondary"
            size="medium"
            :split="false"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            @click="openLookupWizard"
          >
            {{
              $t('safetyPlan.add_hazard', 'Add Hazard', { ns: 'safetyPlan' })
            }}
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>
    <CommonList
      v-else-if="!isEmpty(recordList)"
      :viewDetail="viewDetail"
      :records="recordList"
      :slotList="slotList"
      :hideBorder="true"
      :orgDetails="orgDetails"
      selectType=""
      :getRoute="getRoute"
      :mainFieldAction="mainFieldAction"
    >
      <template #[slotList[2].name]="{ record }">
        <FContainer display="flex" gap="containerMedium">
          <FIcon
            group="default"
            name="trash-can"
            size="16"
            @click="deleteRecords([record.id])"
          />
        </FContainer>
      </template>
    </CommonList>
    <portal :to="`footer-${widget.id}-${widget.name}`">
      <Pagination
        v-if="!isEmpty(recordCount) && recordCount > 5"
        :key="`pagination-${moduleName}`"
        :totalCount="recordCount"
        :currentPageNo.sync="page"
        :currentPageCount="(recordList || []).length"
        :perPage="perPage"
      />
    </portal>
    <LookupWizard
      v-if="showHazardWizard"
      parentModuleName="safetyPlanHazard"
      :canShowLookupWizard.sync="showHazardWizard"
      :field.sync="wizardField"
      :selectedResource="getSelectedHazards"
      @setLookupFieldValue="saveRecord"
    >
    </LookupWizard>
  </FContainer>
</template>
<script>
import { isArray, isEmpty, isNullOrUndefined } from '@facilio/utils/validation'
import RelatedList from '../../../../components/page-builder/widgets/relatedList/RelatedList.vue'
import { API } from '@facilio/api'
import {
  FButton,
  fDialog,
  ftoast,
  FInput,
  FContainer,
  FEmptyState,
  FIcon,
} from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'
import { eventBus } from '../../../../components/page-builder/event-bus'
import getProperty from 'dlv'
import { CommonList } from '@facilio/ui/new-app'
import { findRouteForModule, pageTypes } from '@facilio/router'
export default {
  extends: RelatedList,
  components: {
    FButton,
    LookupWizard,
    FContainer,
    FEmptyState,
    FIcon,
    FInput,
    CommonList,
  },
  props: ['widget', 'details'],
  data() {
    return {
      moduleNameSuffix: 'Hazard',
      showHazardWizard: false,
      selectedIds: [],
      selectedItems: [],
      showSearch: false,
      searchText: '',
    }
  },
  computed: {
    moduleName() {
      let { moduleName: currentModuleName } = this.$attrs
      if (currentModuleName && !this.isPrecautionModule) {
        if (
          ['site', 'floor', 'building', 'space'].includes(currentModuleName)
        ) {
          return 'space' + this.moduleNameSuffix
        } else {
          return currentModuleName + this.moduleNameSuffix
        }
      } else {
        return 'hazardPrecaution'
      }
    },
    isPrecautionModule() {
      return getProperty(this, 'widget.widgetParams.isPrecautionModule', false)
    },
    getSelectedHazards() {
      let { selectedItems } = this
      return selectedItems
    },
    canShowAddButton() {
      let { widget } = this || {}
      let { widgetParams } = widget || {}
      if (!isEmpty(widgetParams)) {
        let { isPrecautionModule } = widgetParams || {}
        if (isPrecautionModule) {
          return false
        }
      }
      return true
    },
    parentModuleName() {
      let { moduleName: currentModuleName } = this.$attrs
      return currentModuleName
    },
    relatedFieldName() {
      let { moduleName: currentModuleName } = this.$attrs
      if (currentModuleName) {
        if (
          ['site', 'floor', 'building', 'space'].includes(currentModuleName)
        ) {
          return 'space'
        } else {
          return currentModuleName
        }
      } else {
        return 'id'
      }
    },
    emptyStateText() {
      return 'No Data Available'
    },
    wizardField() {
      return {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'hazard',
        name: 'hazard',
        field: {
          lookupModule: {
            name: 'hazard',
            displayName: 'Hazards',
          },
        },
        multiple: true,
        forceFetchAlways: true,
        selectedItems: this.selectedItems || [],
        customParams: {
          excludeAvailableHazards: this.details?.id,
          parentModuleName: this.parentModuleName,
        },
      }
    },
    slotList() {
      return [
        {
          name: 'id',
          isHardcodedColumn: true,
          columnAttrs: {
            width: 80,
            displayName: 'ID',
            fixed: true,
          },
        },
        {
          criteria: JSON.stringify({ name: 'name' }),
        },
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
    hazardRoute() {
      let { name = null } = findRouteForModule('hazard', pageTypes.OVERVIEW)
      return name
    },
    mainFieldAction() {
      this.hazardRoute ? this.redirectToOverview : null
    },
  },
  methods: {
    async loadRecords(force = false) {
      this.isLoading = true
      let { viewname, perPage, recordId, $attrs, page, searchText } = this
      let { moduleName: currentModuleName } = $attrs
      let params = {
        moduleName: this.moduleName,
        viewName: viewname,
        perPage,
        recordId,
        relatedFieldName: this.relatedFieldName,
        currentModuleName,
        page,
        search: searchText,
        force,
      }
      try {
        let recordList = await this.modelDataClass.fetchAll(params)
        if (isArray(recordList)) this.recordList = recordList || []

        this.recordCount = this.modelDataClass.recordListCount
        if (this.recordCount == 0) {
          this.recordCount = -1
        }
        this.selectedIds = this.recordList.reduce(
          (list, record) => (record?.id && list.push(record.id), list),
          []
        )
        this.selectedItems = this.recordList.reduce(
          (list, record) => (
            record?.id &&
              list.push({
                label: record?.hazard.name,
                value: record?.hazard.id,
              }),
            list
          ),
          []
        )
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Unable to fetch moduleList')
      }
      this.isLoading = false
    },
    async loadViewDetails() {
      this.viewLoading = true
      let viewName = `hidden-all`
      if (this.isPrecautionModule) {
        viewName = `associatedhazards`
      }
      try {
        let { moduleName, details } = this
        let { moduleName: parentModule } = details || {}
        let { error, data } = await API.get(
          `v2/views/${parentModule}/${moduleName}/${viewName}`,
          { moduleName }
        )

        if (error) throw error
        else this.viewDetail = data?.viewDetail || {}
      } catch (errorMsg) {
        ftoast.critical(errorMsg || 'Cannot fetch view details')
      }
      this.viewLoading = false
    },
    redirectToOverview({ record, value }) {
      let { hazardRoute } = this
      let { id } = record || {}

      if (hazardRoute) {
        let route = this.$router.resolve({
          name: hazardRoute,
          params: { viewname: 'all', id },
        }).href

        return { url: route, target: '_blank', text: value, clickAction: false }
      }
    },
    openLookupWizard() {
      this.showHazardWizard = true
    },
    async saveRecord(value) {
      this.isLoading = true
      let { details, parentModuleName } = this
      if (['site', 'building', 'space', 'floor'].includes(parentModuleName)) {
        parentModuleName = 'space'
      }
      let { id } = details || {}
      let url = 'v3/modules/data/bulkCreate'
      let field = getProperty(value, 'field')
      let selectedData = getProperty(field, 'selectedItems')
      let successMsg = `Hazards added successfully!`
      if (!isEmpty(selectedData)) {
        let records = []
        selectedData.filter(record => {
          let occurrence
          this.selectedItems.forEach(item => {
            if (record.value == item.value) occurrence = 1
          })
          if (occurrence != 1) {
            let { value } = record
            let data = {
              [parentModuleName]: {
                id,
              },
            }
            records.push({ data, hazard: { id: value } })
          }
        })
        if (!isEmpty(records)) {
          let { moduleName } = this || {}
          let params = {
            moduleName,
            params: {
              [parentModuleName]: id,
            },
            data: {
              [moduleName]: records,
            },
          }
          let { error } = await API.post(url, params)
          if (error) {
            ftoast.critical(
              error?.message || this.$t('common.safetyPlan.error_occured')
            )
          } else {
            successMsg && ftoast.success(successMsg)
            this.refreshList()
          }
        }
      } else {
        ftoast.critical(this.$t('common.safetyPlan.error_occured'))
      }
      this.closeWizard()
      this.isLoading = false
    },
    closeWizard() {
      this.showHazardWizard = false
    },
    async refreshList() {
      this.loadRecords(true)
      this.loadViewDetails(true)
      this.refreshPrecautions()
    },
    refreshPrecautions() {
      eventBus.$emit('refresh-sf-precautions')
    },
    async deleteRecords(idList) {
      let { moduleDisplayName, moduleName, config } = this

      let value = await fDialog.warning({
        title: this.$t(
          'safetyPlan.dialog.hazard.delete.title',
          'Delete Hazard',
          {
            ns: 'safetyPlan',
          }
        ),
        description: this.$t(
          'safetyPlan.dialog.hazard.delete.desc',
          `Are you sure you want to delete associated Hazard?`,
          { ns: 'safetyPlan' }
        ),
        saveText: 'Delete',
        cancelText: 'Cancel',
      })

      if (value) {
        this.isLoading = true

        try {
          await API.deleteRecord(moduleName, idList)
          ftoast.success(
            `${moduleDisplayName} ${this.$t(
              'custommodules.list.delete_success',
              'Deleted Successfully'
            )}`
          )
          this.$emit('onDelete')
          await this.refreshList()
        } catch (errorMsg) {
          ftoast.critical(errorMsg)
          this.isLoading = false
        }
      }
    },
  },
}
</script>
