<template>
  <FContainer height="100%" width="100%" overflow="hidden">
    <FContainer
      padding="containerNone containerXLarge"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <FContainer
        v-if="!hideHeader"
        backgroundColor="backgroundMidgroundSubtle"
        :borderRadius="!withTabs ? 'high' : 'high high none none'"
        border="1px solid"
        :borderBottom="withTabs ? 'solid 1px' : ''"
        borderColor="borderNeutralBaseSubtler"
        padding="containerXLarge"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexShrink="0"
      >
        <div>
          <slot name="header-content">
            <FShimmer v-if="isViewLoading" :width="240" :height="52" />
            <ViewsList
              v-else
              :moduleName="moduleName"
              :currentView="currentView"
              :canShowViewManager="canShowViewList"
              :isLoading="isViewLoading"
              :groupViewList="groupsWithViews"
              @onLoadViewDetails="loadViewDetails"
              @onClickViewManager="redirectToViewManager"
              @onChangeView="updateView"
            />
          </slot>
        </div>
        <div>
          <slot name="header"></slot>
        </div>
      </FContainer>
      <FContainer
        v-if="withTabs"
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="none none high high"
        border="1px solid"
        borderTop="none"
        borderColor="borderNeutralBaseSubtler"
        ><slot name="header-panel"></slot
      ></FContainer>
      <slot name="body-content">
        <FContainer
          border="solid 1px"
          borderRadius="high"
          borderColor="borderNeutralBaseSubtler"
          marginTop="containerLarge"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <slot name="sub-header"></slot>
          <slot></slot>
        </FContainer>
      </slot>
    </FContainer>
  </FContainer>
</template>

<script>
import { ViewsList } from '@facilio/ui/new-app'
import { FContainer, FSidebar, FShimmer } from '@facilio/design-system'
import { mapState, mapActions } from 'pinia'
import viewStore from '../../../store/views'
import webtabStore from '../../../store/webtabs'
import { isEmpty, isNull } from '@facilio/utils/validation'
import {
  isWebTabsEnabled,
  findRouteForTab,
  pageTypes,
  findRouteForModule,
  getApp,
} from '@facilio/router'
import dlv from 'dlv'

const appCategoryHash = {
  PORTALS: 1,
  WORK_CENTERS: 2,
  FEATURE_GROUPING: 3,
  TOOLS: 4,
}

export default {
  name: 'CommonLayout',
  components: { FContainer, FSidebar, ViewsList, FShimmer },
  props: [
    'moduleName',
    'getPageTitle',
    'showViewRearrange',
    'visibleViewCount',
    'showViewEdit',
    'pathPrefix',
    'retainFilters',
    'hideSubHeader',
    'recordCount',
    'recordLoading',
    'withTabs',
    'hideHeader',
  ],
  data() {
    return {
      isEmpty,
      currentModuleName: this.moduleName,
      hideViewSidebar: false,
      isSidePanelOpen: false,
    }
  },
  created() {
    this.init()
  },
  computed: {
    ...mapState(viewStore, {
      metaInfo: 'metaInfo',
      isViewLoading: 'isLoading',
      viewDetail: 'currentViewDetail',
      groupViews: state => {
        return !isEmpty(state.groupViews) ? state.groupViews : []
      },
    }),
    ...mapState(webtabStore, {
      currentTab: 'selectedTab',
    }),
    groupsWithViews() {
      return (this.groupViews || []).filter(data => !isEmpty(data.views))
    },
    currentView() {
      let { $route } = this

      if ($route.params.viewname) {
        return $route.params.viewname
      } else {
        return null
      }
    },
    canShowViewList() {
      let { appCategory } = getApp() || {}
      let { FEATURE_GROUPING, WORK_CENTERS } = appCategoryHash
      return [FEATURE_GROUPING, WORK_CENTERS].includes(appCategory)
    },
    filtersToRetain() {
      let { retainFilters } = this
      if (isNull(retainFilters)) {
        return []
      } else if (!isEmpty(retainFilters)) {
        return retainFilters
      } else {
        return ['search', 'includeParentFilter']
      }
    },
    hasQuery() {
      let { query } = this.$route

      if (query.filters === '') {
        return true
      } else if (query.filters) {
        return true
      } else {
        return false
      }
    },
    canShowViewsSidePanel: {
      get() {
        let { isSidePanelOpen, $slots } = this
        let isViewHeaderOverriden = !isEmpty($slots.views)

        return isSidePanelOpen && !isViewHeaderOverriden
      },
      set(value) {
        this.isSidePanelOpen = value
      },
    },
  },
  title() {
    let title = this.getPageTitle()
    return !isEmpty(title) ? title : ''
  },
  watch: {
    moduleName(newVal, oldVal) {
      if (newVal && oldVal !== newVal) {
        this.init()
        this.setPageTitle()
      }
    },
    $route(newVal, oldVal) {
      if (newVal.params.viewname !== oldVal.params.viewname) {
        this.setPageTitle()
      }
    },
    metaInfo(newVal, oldVal) {
      if (newVal && oldVal !== newVal) {
        this.setPageTitle()
      }
    },
    currentView: {
      async handler(newVal, oldVal) {
        if (newVal && oldVal !== newVal) {
          await this.loadViewDetails()
          this.getMetaInfo()
          this.setPageTitle()
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(viewStore, [
      'clearViews',
      'loadModuleMeta',
      'loadGroupViews',
      'loadViewDetail',
    ]),
    async init() {
      let { moduleName } = this
      await this.clearViews()
      await this.loadGroupViews({ moduleName })
    },
    reloadList() {
      let routeParams = dlv(this, '$route.params')
      this.$router
        .push({ params: { ...routeParams, viewname: '' } })
        .catch(() => {})
      this.$router
        .push({
          params: { ...routeParams, viewname: routeParams.viewname },
        })
        .catch(() => {})
    },
    redirectToViewManager() {
      let { moduleName } = this
      let { name } =
        findRouteForModule(moduleName, pageTypes.VIEW_MANAGER) || {}

      name && this.$router.push({ name, params: { moduleName } })
    },
    getMetaInfo() {
      this.loadModuleMeta(this.moduleName)
    },
    updateView(view, group = null) {
      if (!isEmpty(view)) {
        let viewname = view?.name || view

        let { currentTab, filtersToRetain = [] } = this
        let { query } = this.$route

        let filteredQuery = Object.keys(query || {}).reduce((obj, key) => {
          if (filtersToRetain.includes(key)) {
            obj[key] = query[key]
          }
          return obj
        }, {})
        let route =
          findRouteForTab(currentTab.id, {
            pageType: pageTypes.LIST,
          }) || {}

        if (route) {
          this.$router
            .push({
              ...route,
              params: { viewname },
              query: filteredQuery,
            })
            .catch(error => console.warn('Could not switch view\n', error))
        }
      }
    },
    getPathForView(view) {
      let { pathPrefix } = this
      let prefix =
        pathPrefix[pathPrefix.length - 1] === '/'
          ? pathPrefix.slice(0, -1)
          : pathPrefix

      return `${prefix}/${view.name}`
    },
    async loadViewDetails() {
      await this.loadViewDetail({
        viewName: this.currentView,
        moduleName: this.moduleName,
      })
    },
    setPageTitle() {
      let { getPageTitle, setTitle, currentView } = this
      let title = getPageTitle(currentView)

      if (!isEmpty(title)) setTitle(title)
    },
    keyDownHandler(e) {
      if (e.shiftKey && e.key === 'N') {
        if (isWebTabsEnabled()) {
          let { name } =
            findRouteForModule(this.moduleName, pageTypes.CREATE) || {}
          if (e.target.localName === 'body') {
            name && this.$router.push({ name }).catch(() => {})
          }
        }
      }
    },
  },
}
</script>
