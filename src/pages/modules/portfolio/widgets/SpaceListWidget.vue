<template>
  <FContainer height="100%">
    <FContainer height="100%" ref="spaceList" :key="widget.id">
      <template>
        <portal
          v-if="!isEmpty(list) && totalCount > 4"
          paddingTop="sectionLarge"
          ref="footer-portal"
          :to="`footer-${widget.id}-${widget.name}`"
        >
          <FContainer height="100%" padding="containerMedium containerNone">
            <FPagination
              :total="totalCount"
              :pageCount="pageCount"
              :currentPage.sync="page"
              :pageSize="perPage"
            ></FPagination>
          </FContainer>
        </portal>
      </template>
      <!-- Widget Content -->

      <FContainer
        v-if="loading"
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <FSpinner :size="25" />
      </FContainer>
      <FContainer
        v-else-if="!isAllSpacesTab && isEmpty(list) && isEmpty(searchText)"
        paddingTop="containerMedium"
        height="100%"
      >
        <FContainer height="100%" display="flex" justifyContent="center">
          <FContainer height="100%" display="flex" justifyContent="center">
            <FContainer
              display="flex"
              justifyContent="center"
              width="500px"
              height="100%"
            >
              <FEmptyState
                :title="
                  $t(
                    `portfolio.space_list.no_${moduleName}_data`,
                    emptyStateMessage,
                    {
                      ns: 'portfolio',
                    }
                  )
                "
                :description="
                  $t(
                    `portfolio.space_list.no_${moduleName}_data_caption`,
                    emptyStateDesc,
                    {
                      ns: 'portfolio',
                    }
                  )
                "
                :vertical="false"
                size="S"
                illustration="no-entries"
              >
                <template #buttons>
                  <FContainer
                    v-if="
                      $access.hasPermission('space:CREATE') && !decommission
                    "
                    display="flex"
                    align-items="center"
                    flex-direction="row"
                  >
                    <FButton
                      appearance="secondary"
                      size="medium"
                      iconGroup="navigation"
                      iconName="addition"
                      iconPosition="prefix"
                      @click="goToSpaceCreation()"
                    >
                      {{
                        $t(
                          `portfolio.list.add_${buttonDisplayName.toLowerCase()}`,
                          `Add ${buttonDisplayName}`,
                          { ns: 'portfolio' }
                        )
                      }}
                    </FButton>
                  </FContainer>
                </template>
              </FEmptyState>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer
        v-else-if="!isAllSpacesTab && isEmpty(list) && !isEmpty(searchText)"
        paddingTop="containerMedium"
        height="100%"
      >
        <FContainer height="100%" display="flex" justifyContent="center">
          <FContainer height="100%" display="flex" justifyContent="center">
            <FContainer
              display="flex"
              justifyContent="center"
              width="500px"
              height="100%"
            >
              <FEmptyState
                :title="
                  $t(
                    `portfolio.space_list.no_search_${moduleName}_data`,
                    emptyStateMessage,
                    {
                      ns: 'portfolio',
                    }
                  )
                "
                :description="
                  $t(
                    `portfolio.space_list.no_search_${moduleName}_data_caption`,
                    emptyStateDesc,
                    {
                      ns: 'portfolio',
                    }
                  )
                "
                :vertical="false"
                size="S"
                illustration="no-entries"
              >
              </FEmptyState>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer v-else-if="isAllSpacesTab" height="100%">
        <FTabs v-model="activeTab" :tabsList="tabs" @change="tabChange">
          <FTabPane v-for="tab in tabs" :activeKey="tab.value" :key="tab.value">
            <CommonSpaceList
              :list="list"
              :details="details"
              :parentModuleName="parentModuleName"
              :moduleName="moduleName"
              :buttonName="buttonDisplayName"
              @refresh="closeForm"
              @openForm="goToSpaceCreation"
            />
          </FTabPane>
        </FTabs>
      </FContainer>
      <FContainer v-else>
        <CommonSpaceList
          :list="list"
          :details="details"
          :parentModuleName="parentModuleName"
          :buttonName="buttonDisplayName"
          :moduleName="moduleName"
          @refresh="closeForm"
          @openForm="goToSpaceCreation"
        />
      </FContainer>
      <portal
        :to="`action-${widget.id}-${widget.name}`"
        class="portal-alignment-ws action-ws"
        v-if="showHeader"
      >
        <FInput
          v-if="showSearch"
          v-model="searchText"
          placeholder="search"
          appearance="default"
          size="medium"
          clearable
          :clearValue="clearSearchText"
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
        <FDivider height="24px" margin="containerNone containerXLarge" />
        <FContainer
          v-if="$access.hasPermission('space:CREATE') && !decommission"
          display="flex"
          align-items="center"
          flex-direction="row"
        >
          <FButton
            appearance="secondary"
            size="small"
            @click="goToSpaceCreation()"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
          >
            {{
              $t(
                `portfolio.list.add_${buttonDisplayName.toLowerCase()}`,
                `Add ${buttonDisplayName}`,
                { ns: 'portfolio' }
              )
            }}
          </FButton>
        </FContainer>
      </portal>
    </FContainer>
    <BaseSpaceForm
      v-if="showDialog"
      :isDialogForm="showDialog"
      :parentModule="parentModuleName"
      :parentId="details.id"
      :fromSummary="true"
      :formModuleName="moduleName"
      @refresh="closeForm"
      @close="closeForm"
    ></BaseSpaceForm>
  </FContainer>
</template>
<script>
import BaseSpaceForm from '../BaseSpaceForm.vue'
import { pageTypes, findRouteForTab } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FPagination,
  FSpinner,
  FEmptyState,
  FTabs,
  FTabPane,
  ftoast,
  FIcon,
  FInput,
  FDivider,
  FButton,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import CommonSpaceList from '../components/CommonSpaceList.vue'

import getProperty from 'dlv'
import $access from '../../../../utils/access/index'

export default {
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'sectionKey',
    'widget',
    'resizeWidget',
    'fitMyContent',
  ],
  components: {
    FPagination,
    FSpinner,
    FEmptyState,
    FTabs,
    FTabPane,
    ftoast,
    FDivider,
    FButton,
    FContainer,
    FText,
    FIcon,
    FInput,
    CommonSpaceList,
    BaseSpaceForm,
  },
  data() {
    return {
      getProperty,
      isActive: true,
      showSearch: false,
      searchText: '',
      activeTab: 'independent_spaces',
      loading: false,
      list: null,
      page: 1,
      perPage: 4,
      isEmpty,
      showFormDialog: false,
      totalCount: null,
    }
  },
  created() {
    this.loadData()
    this.loadCount()
  },
  computed: {
    buttonName() {
      let { widget: { widgetParams: { moduleName = {} } = {} } = {} } = this
      return moduleName
    },
    moduleName() {
      let { widget: { widgetParams: { moduleName = {} } = {} } = {} } = this
      return moduleName
    },
    buttonDisplayName() {
      let { widget: { widgetParams: { moduleName = {} } = {} } = {} } = this
      let buttonDisplayName = `${moduleName[0].toUpperCase()}${moduleName.slice(
        1
      )}`
      return buttonDisplayName
    },
    showHeader() {
      let { searchText, list } = this
      if (!isEmpty(searchText) && isEmpty(list)) {
        return true
      } else if (!isEmpty(searchText) && isEmpty(list)) {
        return false
      }
      return true
    },
    parentModuleName() {
      let { widget: { widgetParams: { parentName = {} } = {} } = {} } = this
      return parentName
    },
    filters() {
      let { widget: { widgetParams: { parentName = {} } = {} } = {} } = this
      let filter = ''
      if (parentName == 'site') {
        filter = [
          {
            siteId: { operatorId: 36, value: [this.details.id + ''] },
          },
          {
            site: {
              operatorId: 36,
              value: [this.details.id + ''],
            },
            building: {
              operatorId: 1,
            },
            floor: {
              operatorId: 1,
            },
            space1: {
              operatorId: 1,
            },
            space2: {
              operatorId: 1,
            },
            space3: {
              operatorId: 1,
            },
          },
        ]
      } else if (parentName == 'building') {
        filter = [
          {
            buildingId: { operatorId: 36, value: [this.details.id + ''] },
          },
          {
            building: {
              operatorId: 36,
              value: [this.details.id + ''],
            },
            floor: {
              operatorId: 1,
            },
            space1: {
              operatorId: 1,
            },
            space2: {
              operatorId: 1,
            },
            space3: {
              operatorId: 1,
            },
          },
        ]
      } else if (parentName == 'floor') {
        filter = [
          {
            floorId: { operatorId: 36, value: [this.details.id + ''] },
          },
          {
            floor: {
              operatorId: 36,
              value: [this.details.id + ''],
            },
            space1: {
              operatorId: 1,
            },
            space2: {
              operatorId: 1,
            },
            space3: {
              operatorId: 1,
            },
          },
        ]
      } else {
        filter = [
          {
            spaceId1: { operatorId: 36, value: [this.details.id + ''] },
          },
        ]
      }
      return filter
    },

    fetchFilter() {
      let filters
      if (this.isAllSpacesTab && this.filters.length == 2) {
        if (this.activeTab == 'independent_spaces') {
          filters = encodeURIComponent(JSON.stringify(this.filters[1]))
        } else {
          filters = encodeURIComponent(JSON.stringify(this.filters[0]))
        }
      } else {
        filters = encodeURIComponent(JSON.stringify(this.filters[0]))
      }
      return filters
    },
    fetchListUrl() {
      let { searchText } = this
      if (!isEmpty(searchText)) {
        return `v3/modules/${this.moduleName}/view/hidden-all?fetchOnlyViewGroupColumn=true&moduleName=${this.moduleName}&viewname=hidden-all&filters=${this.fetchFilter}&search=${searchText}`
      } else {
        return `v3/modules/${this.moduleName}/view/hidden-all?fetchOnlyViewGroupColumn=true&moduleName=${this.moduleName}&viewname=hidden-all&filters=${this.fetchFilter}`
      }
    },
    fetchCountUrl() {
      let { searchText } = this
      if (!isEmpty(searchText)) {
        return `v3/modules/data/count?viewName=hidden-all&includeParentFilter=false&moduleName=${this.moduleName}&filters=${this.fetchFilter}&search=${searchText}`
      } else
        return `v3/modules/data/count?viewName=hidden-all&includeParentFilter=false&moduleName=${this.moduleName}&filters=${this.fetchFilter}`
    },
    emptyStateMessage() {
      return `No ${this.moduleName}s have been added yet.`
    },
    emptyStateDesc() {
      return `There seems to be no  ${this.moduleName}s associated. Click here to add a  ${this.moduleName}.`
    },
    decommission() {
      return getProperty(this, 'details.decommission', false)
    },
    isAllSpacesTab() {
      let { parentModuleName, moduleName } = this
      if (
        moduleName == 'space' &&
        ['site', 'building', 'floor'].includes(parentModuleName)
      ) {
        return true
      }
      return false
    },
    tabs() {
      return [
        { label: 'Independent Spaces', value: 'independent_spaces' },
        { label: 'All Spaces', value: 'spaces' },
      ]
    },
    showDialog() {
      let { showFormDialog } = this
      return showFormDialog
    },
    routeName() {
      let { name = null } = findRouteForTab(pageTypes.PORTFOLIO_CREATE) || {}
      return name
    },
    pageCount() {
      return Math.ceil(this.totalCount / this.perPage)
    },
  },
  watch: {
    showSearch(newVal) {
      if (newVal == false) {
        this.clearSearchText()
      }
    },
    async page() {
      await this.loadData()
    },
  },
  methods: {
    async refreshDetails() {
      await this.loadData({ force: true })
      await this.loadCount({ force: true })
    },
    async clearSearchText() {
      this.searchText = ''
      await this.refreshList()
    },
    async loadData({ force = false } = {}) {
      this.loading = true
      let { data, error } = await API.get(
        `${this.fetchListUrl}&perPage=${this.perPage}&page=${this.page}`,
        null,
        { force }
      )
      if (error) {
        ftoast.critical(error?.message || 'Error Occured')
      } else {
        this.list = data[this.moduleName]
        if (isEmpty(this.list)) {
          this.resizeWidget({ h: 5 })
        }
        //resize need to be done here
      }
      this.loading = false
    },
    async loadCount({ force = false } = {}) {
      let { data, error } = await API.get(`${this.fetchCountUrl}`, null, {
        force,
      })
      if (error) {
        ftoast.critical(error?.message || 'Error Occured')
      } else {
        this.totalCount = data.count
      }
    },
    async tabChange() {
      await this.loadData()
      await this.loadCount()
    },
    getManagedBy(space) {
      return space.managedBy?.name ? space.managedBy.name : '__'
    },
    getSite(site) {
      return site?.name ? site.name : '---'
    },
    async closeForm() {
      this.showFormDialog = false
      await this.refreshDetails()
    },
    async refreshList() {
      await this.loadData(true)
      await this.loadCount(true)
    },
    goToSpaceCreation() {
      this.showFormDialog = true
    },
  },
}
</script>
