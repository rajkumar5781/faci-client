<template>
  <FContainer height="100%">
    <portal :to="footerPortal" v-if="hasListCount">
      <FContainer height="40px" display="flex" alignItems="center">
        <FPagination
          :currentPage.sync="page"
          :total="totalCount"
          :pageCount="perPage"
          :pageSize="perPage"
          @currentChange="loadRelationData"
        ></FPagination>
      </FContainer>
    </portal>
    <portal v-if="hasRelationList" :to="actionPortal">
      <FContainer display="flex" alignItems="center">
        <MainFieldSearch
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch>
        <template v-if="canShowRelActionButtons">
          <FDivider
            margin="containerLarge"
            v-if="hasListCount || hasSearchText"
            height="16px"
          ></FDivider>
          <FContainer @click="showLookupFieldWizard = true">
            <FButton
              appearance="secondary"
              iconPosition="prefix"
              iconGroup="navigation"
              iconName="addition"
            >
              {{ $t('summary.widgets.bulkwidget.associate') }}
            </FButton>
          </FContainer>
        </template>
        <template v-if="!isLoading">
          <FDivider margin="containerLarge" height="16px"></FDivider>
          <ColumnCustomization
            :moduleName="toModuleName"
            :parentModuleName="moduleName"
            viewName="hidden-all"
            :viewFields="viewFields"
            @refreshRelatedList="reloadData"
          ></ColumnCustomization>
        </template>
      </FContainer>
    </portal>

    <FContainer
      height="100%"
      display="flex"
      alignItems="center"
      width="100%"
      justifyContent="center"
      v-if="isLoading || !hasRelationList"
    >
      <FSpinner v-if="isLoading" :size="20"></FSpinner>
      <FEmptyState
        v-else-if="!hasRelationList"
        :title="emptyStateText"
        illustration="add-item"
        size="S"
        :vertical="true"
      >
        <template #buttons>
          <FContainer
            v-if="canShowRelActionButtons"
            marginBottom="containerXLarge"
          >
            <FButton
              appearance="primary"
              iconPosition="prefix"
              iconGroup="navigation"
              iconName="addition"
              @click="showLookupFieldWizard = true"
            >
              {{ $t('summary.widgets.bulkwidget.associate') }}
            </FButton>
          </FContainer>
        </template>
      </FEmptyState>
    </FContainer>

    <CommonList
      v-else
      :viewDetail="viewDetail"
      :records="relationslist"
      :slotList="slotList"
      :hideBorder="true"
      :orgDetails="orgDetails"
      :getRoute="getRoute"
      :mainFieldAction="mainFieldRedirection"
      selectType=""
      @redirectToSummary="redirectToSummary"
    >
      <template #[slotList[0].name]="{ record }">
        <FText color="textCaption">{{ '#' + record.id }}</FText>
      </template>

      <template v-if="canShowRelActionButtons" #[slotList[1].name]="{ record }">
        <FButton
          @click="deleteRecords([record.id])"
          appearance="secondary"
          iconPosition="prefix"
          iconGroup="connectivity"
          iconName="unplug"
        >
          {{ 'Disassociate' }}
        </FButton>
      </template>
    </CommonList>

    <RelationshipWizard
      v-if="showLookupFieldWizard"
      :key="`${relationName}-${toModuleName}`"
      :canShowLookupWizard.sync="showLookupFieldWizard"
      :config="{}"
      :parentModuleName="moduleName"
      :field="fieldObj"
      :recordId="details.id"
      :isEdit="true"
      @setLookupFieldValue="setListValues"
    ></RelationshipWizard>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { RelationshipWizard } from '@facilio/ui/new-forms'
import { CommonList } from '@facilio/ui/new-app'
import ColumnCustomization from '../../../../pages/list/views/ColumnCustomization.vue'
import isEqual from 'lodash/isEqual'
import { pageTypes } from '@facilio/router'
import { findRouteForModule } from '../../../../utils/routerUtil'
import {
  FText,
  FContainer,
  FIcon,
  FDivider,
  FButton,
  FEmptyState,
  ftoast,
  fDialog,
  FPagination,
  FSpinner,
} from '@facilio/design-system'
import dlv from 'dlv'
import debounce from 'lodash/debounce'
import { getTimeFormat } from '../../../../utils/formatter'
import MainFieldSearch from '../relatedList/MainFieldSearch.vue'
import FetchViewsMixin from '../../../views/FetchViews.vue'

export default {
  props: [
    'details',
    'widget',
    'toModuleName',
    'parentId',
    'moduleName',
    'actionPortal',
    'footerPortal',
    'fitMyContent',
  ],
  components: {
    CommonList,
    ColumnCustomization,
    RelationshipWizard,
    FIcon,
    FText,
    FContainer,
    FDivider,
    FButton,
    FEmptyState,
    FPagination,
    FSpinner,
    MainFieldSearch,
  },
  mixins: [FetchViewsMixin],
  data() {
    return {
      relationslist: [],
      page: 1,
      perPage: 5,
      showMainFieldSearch: false,
      searchText: null,
      viewDetail: {},
      totalCount: null,
      showLookupFieldWizard: false,
      isLoading: false,
      showColumnSettings: false,
      routeName: null,
      currentViewName: null,
    }
  },
  created() {
    this.init()
    this.debounceMainFieldSearch = debounce(() => {
      this.page = 1
      this.loadRelationData()
    }, 700)
  },
  computed: {
    fieldObj() {
      let { relation } = this.widget
      return { relationData: relation }
    },
    access() {
      return this.$access
    },
    listUrlConfig() {
      let { searchText, details } = this
      let { relation } = this.widget || {}
      let { fromModuleName, reverseRelationLinkName } = relation || {}
      let params = {
        unAssociated: true,
      }
      if (!isEmpty(searchText)) {
        params.search = searchText
      }
      return {
        url: `v3/modules/${fromModuleName}/${details?.id}/relationship/${reverseRelationLinkName}`,
        toModuleName: this.toModuleName,
        params,
        multiple: true,
      }
    },
    emptyStateText() {
      return `No ${this.toModuleDisplayName} Associated`
    },
    mainFieldName() {
      let { viewDetail } = this
      let { fields } = viewDetail || {}
      let mainFieldObj = (fields || []).find(fld => fld?.field?.mainField) || {}
      let { field } = mainFieldObj || {}
      let { name } = field || {}

      return name
    },
    mainFieldObj() {
      let { fields } = this.viewDetail || {}
      let { field: mainField } =
        (fields || []).find(viewFld => viewFld?.field?.mainField) || {}
      return mainField || {}
    },
    viewFields() {
      return this.viewDetail?.fields || []
    },
    slotList() {
      return [
        // { criteria: JSON.stringify({ name: this.mainFieldName }) },
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
          name: 'action',
          isActionColumn: true,
          columnAttrs: {
            width: 120,
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        },
      ]
    },
    toModuleDisplayName() {
      return dlv(this.widget, 'relation.toModule.displayName')
    },
    relationName() {
      return dlv(this.widget, 'relation.relationName')
    },
    isLink() {
      let isCustomModule = dlv(this.widget, 'relation.toModule.custom')
      return isCustomModule
    },
    filterObj() {
      let filterObj = {}
      let { mainFieldName, searchText } = this

      if (!isEmpty(mainFieldName) && !isEmpty(searchText)) {
        filterObj[mainFieldName] = { operatorId: 5, value: [searchText] }
      }

      return filterObj
    },
    hasRelationList() {
      return !isEmpty(this.relationslist)
    },
    hasSearchText() {
      return !isEmpty(this.searchText)
    },
    hasListCount() {
      return !isEmpty(this.totalCount) && this.totalCount !== 0
    },
    relationshipDisplayName() {
      return dlv(this.widget, 'relation.name')
    },
    orgDetails() {
      let timeformat = getTimeFormat()
      let timezone = dlv(this.$account, 'org.timezone', 'Etc/UTC')
      let dateformat = dlv(this.$account, 'org.dateFormat') || 'DD-MMM-YYYY'
      return {
        dateformat: dateformat,
        timezone: timezone,
        timeformat: timeformat,
      }
    },
    canShowRelActionButtons() {
      let { $access, showLoading, moduleName } = this
      let hasPermission = $access.hasPermission(`${moduleName}:UPDATE`)
      let isVirtualRelationship = dlv(this.widget, 'relation.isVirtual', false)
      return hasPermission && !showLoading && !isVirtualRelationship
    },
  },
  watch: {
    filterObj(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) this.debounceMainFieldSearch()
    },
  },
  methods: {
    async init() {
      this.loadRelationData()
      this.loadViewDetails()
      this.routeName = await this.getRouteName()
      this.currentViewName = await this.fetchView(this.moduleName)
    },
    reloadData() {
      this.showColumnSettings = false
      this.init()
    },
    async loadViewDetails() {
      let viewDetailUrl = `v2/views/${this.toModuleName}/hidden-all?moduleName=${this.toModuleName}`
      let { data, error } = await API.get(viewDetailUrl)

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        this.viewDetail = data?.viewDetail || {}
      }
    },
    async getRoute(moduleName, moduleObj) {
      return await findRouteForModule(moduleName, pageTypes.OVERVIEW, moduleObj)
    },
    getFixName(record) {
      let { mainFieldName } = this
      let { [mainFieldName]: recordName } = record || {}
      return recordName || '---'
    },
    async loadRelationData() {
      let { relation } = this.widget || {}
      let { reverseRelationLinkName } = relation || {}
      let params = {
        viewName: 'hidden-all',
        page: this.page,
        includeParentFilter: true,
        withCount: true,
        perPage: this.perPage,
        filters: !isEmpty(this.filterObj)
          ? JSON.stringify(this.filterObj)
          : null,
      }

      this.isLoading = true

      let config = { force: true }
      let url = `v3/modules/${this.moduleName}/${this.details?.id}/relationship/${reverseRelationLinkName}`
      let { data, meta, error } = await API.get(url, params, config)

      if (error) {
        let { isCancelled } = error || {}
        if (!isCancelled) ftoast.critical('Error Occured')
      } else {
        this.relationslist = data[this.toModuleName] || []
        this.totalCount = dlv(meta, 'pagination.totalCount', null)
      }
      this.isLoading = false
      setTimeout(() => {
        this.$emit('fitContent')
      })
    },
    setListValues(data) {
      let { selectedItems } = data?.field || {}

      if (!isEmpty(selectedItems)) {
        let selectedId = selectedItems.map(item => {
          let { value } = item || {}
          return value
        })

        this.bulkCreateRelations(selectedId)
      }
    },
    async getRouteName() {
      let { name = null } =
        (await findRouteForModule(this.toModuleName, pageTypes.OVERVIEW)) || {}
      return name
    },
    mainFieldRedirection({ record, value }) {
      let { routeName, currentViewName } = this
      let { id } = record || {}

      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: {
            viewname: currentViewName,
            id,
            moduleName: this.toModuleName,
          },
        }).href

        return {
          url: route,
          text: value,
          id,
          clickAction: (field, e) => this.openRecordSummary(id, e),
          ...value,
        }
      }
    },
    async openRecordSummary(id, e) {
      let { toModuleName } = this
      let { name } =
        (await findRouteForModule(toModuleName, pageTypes.OVERVIEW)) || {}

      if (name) {
        let viewname = await this.fetchView(toModuleName)

        this.$router.push({
          name,
          params: { viewname, id, moduleName: toModuleName },
        })
      }

      e.preventDefault()
    },
    async redirectToSummary(field) {
      let { moduleName, id } = field || {}
      let viewname = await this.fetchView(moduleName)
      let { name } =
        (await findRouteForModule(moduleName, pageTypes.OVERVIEW)) || {}

      if (name) {
        this.$router.push({ name, params: { viewname, id, moduleName } })
      }
    },
    // openMainFieldSearch() {
    //   this.showMainFieldSearch = true

    //   this.$nextTick(() => {
    //     let mainFieldSearchInput = this.$refs['mainFieldSearchInput']

    //     if (!isEmpty(mainFieldSearchInput)) {
    //       mainFieldSearchInput.focus()
    //     }
    //   })
    // },
    // hideMainFieldSearch() {
    //   if (isEmpty(this.searchText)) this.showMainFieldSearch = false
    // },
    async bulkCreateRelations(selectedIds) {
      this.isLoading = true

      let { widget, parentId } = this
      let { relation } = widget || {}
      let { fromModuleName, toModuleName, forwardRelationLinkName } =
        relation || {}
      let url = `v3/modules/${fromModuleName}/${parentId}/relationship/${forwardRelationLinkName}`
      let params = { data: { [toModuleName]: selectedIds } }
      let { error } = await API.post(url, params)

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
        this.isLoading = false
      } else {
        ftoast.success(this.$t('custommodules.summary.relation_add_success'))
        this.loadRelationData()
      }
    },
    async deleteRecords(idList) {
      let value = await fDialog.warning({
        title: 'Dissociate',
        description:
          'Are you sure you want to remove the record from associated relationship?',
        saveText: 'Yes',
        cancelText: 'No',
      })

      if (!value) return

      this.isLoading = true

      let { widget, parentId } = this
      let { relation } = widget || {}
      let { fromModuleName, toModuleName, forwardRelationLinkName } =
        relation || {}
      let url = `v3/modules/${fromModuleName}/${parentId}/relationship/${forwardRelationLinkName}`
      let params = { data: { [toModuleName]: idList } }
      let { error } = await API.patch(url, params)

      if (error) {
        ftoast.critical(error.message || 'Error Occured')
        this.isLoading = false
      } else {
        this.relationslist.length === 1 && this.page > 1 && (this.page = -1)

        this.loadRelationData()
      }
    },
  },
}
</script>
