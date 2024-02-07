<template>
  <FContainer height="100%" display="flex">
    <FShimmer
      v-if="isEmpty(currentViewDisplayName)"
      :width="180"
      :height="28"
    />

    <div v-else-if="!canShowViewsSidePanel">
      <FPopover
        trigger="clickToOpen"
        v-model="showPopover"
        placement="bottom-start"
        @show="() => (showPopover = true)"
        @hide="() => (showPopover = false)"
      >
        <div slot="content">
          <FContainer
            display="flex"
            alignItems="center"
            gap="containerLarge"
            borderBottom="solid 1px"
            borderColor="borderNeutralGrey02Light"
          >
            <ViewsList
              v-if="showPopover"
              :groupViews="groupViews"
              :moduleName="moduleName"
              :currentGroup="currentGroup"
              :hideArrowIcon="true"
              @onChange="goToView"
            />
          </FContainer>
        </div>
        <FButton
          appearance="secondary"
          iconGroup="navigation"
          iconName="accordion-down"
          >{{ currentViewDisplayName }}
        </FButton>
      </FPopover>
    </div>
    <FText v-else
      ><FText color="textMain" appearance="headingMed16">{{
        currentViewDisplayName
      }}</FText></FText
    >
  </FContainer>
</template>

<script>
import {
  FShimmer,
  FButton,
  FContainer,
  FPopover,
  FDropdownMenu,
  FMenuItem,
  FText,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { mapState, mapActions } from 'pinia'
import viewStore from '../../../store/views'
import webtabStore from '../../../store/webtabs'
import { isWebTabsEnabled, findRouteForTab, pageTypes } from '@facilio/router'
import dlv from 'dlv'
import isEqual from 'lodash/isEqual'
import ViewsList from './ViewsList.vue'

export default {
  name: 'ViewHeader',
  components: {
    FShimmer,
    FButton,
    FContainer,
    FPopover,
    FDropdownMenu,
    FMenuItem,
    FText,
    FIcon,
    ViewsList,
  },
  props: [
    'moduleName',
    'pathPrefix',
    'showCurrentViewOnly',
    'maxVisibleMenu',
    'showRearrange',
    'retainFilters',
    'canShowViewsSidePanel',
  ],
  created() {
    this.init()
  },
  data() {
    return {
      isEmpty,
      showReorderPanel: false,
      showPopover: false,
    }
  },
  computed: {
    ...mapState(viewStore, {
      groupViews: state => {
        return !isEmpty(state.groupViews) ? state.groupViews : []
      },
    }),
    ...mapState(webtabStore, {
      currentTab: 'selectedTab',
      currentTabGroup: 'selectedTabGroup',
    }),
    currentViewDisplayName() {
      let { currentViews, currentView = '' } = this
      let { label } =
        (currentViews || []).find(view => view.name === currentView) || {}

      return label || ''
    },
    currentGroupViews() {
      let { filteredViews } = this
      let { list, more } = filteredViews || {}
      let views = [...(list || []), ...(more || [])]
      views = views.map(view => {
        return { ...view, value: view.name }
      })
      return views || {}
    },
    selectedViewObj() {
      let { currentView, currentGroupViews } = this || {}
      return currentGroupViews.filter(view => view.name === currentView)
    },
    currentView() {
      if (this.$route.params.viewname) {
        return this.$route.params.viewname
      } else {
        return null
      }
    },
    currentViews() {
      let { groupViews, currentView } = this
      let selectedViews = []

      groupViews.forEach(group => {
        let { views } = group
        let selectedView = (views || []).find(v => v.name === currentView)
        if (selectedView) {
          selectedViews = views
        }
      })

      return selectedViews.map(view => ({
        label: view.displayName,
        id: view.id,
        name: view.name,
        isCustom: !view.isDefault,
        primary: view.primary,
      }))
    },
    currentGroup() {
      let { groupViews } = this

      let selectedGroup = (groupViews || []).find(group => {
        let { views } = group
        let selectedView = (views || []).find(v => v.name === this.currentView)

        return !isEmpty(selectedView)
      })

      return selectedGroup
    },
    maxMenuLength() {
      return this.maxVisibleMenu || 3
    },
    filteredViews() {
      let list = []
      let more = null
      let {
        showCurrentViewOnly,
        currentViews,
        currentView,
        maxMenuLength: maxLength,
      } = this

      let currentViewPosition = currentViews.findIndex(
        v => v.name === currentView
      )

      if (showCurrentViewOnly) {
        list = [currentViews[currentViewPosition]]
      } else if (currentViews.length - 1 < maxLength) {
        list = currentViews
      } else if (currentViewPosition < maxLength) {
        list = currentViews.slice(0, maxLength)
        more = currentViews.slice(maxLength)
      } else {
        list = [
          ...currentViews.slice(0, maxLength - 1),
          currentViews[currentViewPosition],
        ]
        more = currentViews
          .slice(maxLength - 1)
          .filter(v => v.name !== currentView)
      }

      return {
        list,
        more,
      }
    },
  },
  watch: {
    moduleName(newVal, oldVal) {
      newVal !== oldVal && this.init()
    },
    currentView: {
      handler(newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          this.loadViewDetails()
        } else if (newVal !== oldVal && isEmpty(newVal)) {
          this.initializeViews()
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(viewStore, [
      'clearViews',
      'loadGroupViews',
      'loadViewDetail',
    ]),
    async init() {
      await this.clearViews()
      await this.loadViews()
    },

    async loadViews() {
      let { moduleName } = this
      await this.loadGroupViews({ moduleName })
      this.initializeViews()
    },

    loadViewDetails() {
      let { currentView, moduleName, currentGroup } = this
      let viewObj =
        dlv(currentGroup, 'views', []).find(v => v.name === currentView) || {}
      let viewModuleName = dlv(viewObj, 'moduleName', null)

      if (isEmpty(currentView)) return
      if (isEmpty(moduleName) && isEmpty(viewModuleName)) return

      let param = {
        viewName: currentView,
        moduleName: isEmpty(viewModuleName) ? moduleName : viewModuleName,
      }
      this.loadViewDetail(param)
    },

    initializeViews() {
      let { groupViews, currentView } = this
      let viewsList = (groupViews || []).reduce(
        (res, { views }) => [...res, ...(views || [])],
        []
      )
      let isCurrentViewNotAvailable = isEmpty(
        (viewsList || []).find(view => view.name === currentView)
      )
      if (isCurrentViewNotAvailable) {
        let firstGroup = groupViews && groupViews[0]
        let firstGroupWithViews = groupViews.find(
          group => !isEmpty(group.views)
        )
        let { name } = firstGroupWithViews || {}
        if (firstGroup && name) {
          this.$emit('hideViewSidebar', false)
          this.openGroup(name)
        } else {
          this.$emit('hideViewSidebar', true)
        }
      }
    },

    switchView(views) {
      let [view] = views || []
      this.showPopover = false
      this.goToView(view)
    },
    goToView(view, group = null) {
      this.showPopover = false
      if (!isEmpty(view)) {
        let { name: viewname } = view

        if (viewname === 'rearrange-views') {
          this.showReorderPanel = true
          return
        }

        let { currentTab, retainFilters = [] } = this
        let { query } = this.$route
        let retainedQuery = retainFilters.reduce((filter, key) => {
          filter[key] = query[key]

          return filter
        }, {})

        if (isWebTabsEnabled()) {
          let route =
            findRouteForTab(currentTab.id, {
              pageType: pageTypes.LIST,
            }) || {}

          if (route) {
            this.$router
              .push({
                ...route,
                params: { viewname },
                query: retainedQuery,
              })
              .catch(error => console.warn('Could not switch view\n', error))
          }
        } else {
          let path = this.getPathForView(view, group)
          this.$router.push({ path, query: retainedQuery }).catch(() => {})
        }
      }
    },

    openGroup(command) {
      let view
      let group = (this.groupViews || []).find(g => g.name === command)

      if (!isEmpty(group)) {
        if (!isEmpty(group.views)) {
          view = group.views && group.views[0]
          this.goToView(view, group)
        }
      }
    },

    openViewsSidePanel() {
      this.$emit('update:canShowViewsSidePanel', true)
    },

    getPathForView(view) {
      let { pathPrefix } = this
      let prefix =
        pathPrefix[pathPrefix.length - 1] === '/'
          ? pathPrefix.slice(0, -1)
          : pathPrefix

      return `${prefix}/${view.name}`
    },
  },
}
</script>
