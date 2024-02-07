<template lang="">
  <div ref="page-builder-wrapper" class="pb-container">
    <FContainer
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      v-if="loading"
    >
      <FSpinner :size="40" />
    </FContainer>
    <FEmptyState
      v-else-if="isEmpty(tabs)"
      illustration="server"
      size="M"
      :title="emptyStateMessage.title"
      :description="emptyStateMessage.description"
      :vertical="false"
    ></FEmptyState>
    <FTabs
      v-else
      v-model="currentTab"
      :tabsList="tabs"
      :hideBorder="true"
      backgroundColor="backgroundMidgroundSubtle"
      padding="containerMedium containerNone"
      borderBottom="1px solid"
      borderLeft="1px solid"
      borderRight="1px solid"
      borderColor="borderNeutralBaseSubtler"
      borderBottomLeftRadius="var(--border-high)"
      borderBottomRightRadius="var(--border-high)"
      :display="showTabHeader ? 'flex' : 'none'"
      margin="containerNone containerLarge containerLarge containerLarge"
      @change="pushCurrentTab"
    >
      <FTabPane
        ref="tab-comp"
        class="d-flex flex-col !overflow-x-hidden"
        v-for="tab in tabs"
        :key="`${tab.id} ${tab.displayName}`"
        :activeKey="tab.name"
      >
        <portal-target
          class="flex-shrink-0 portal-sticky-pb"
          name="page-builder-sticky-top"
        >
        </portal-target>
        <FContainer
          v-if="loadingPage"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FSpinner :size="30" />
        </FContainer>
        <div class="flex-grow" v-else-if="currentTab === tab.name">
          <PageGrid
            :grid="tab"
            :ref="`page-builder-${tab.name}`"
            class="page-builder-wrapping"
            :key="`${tab.id}_${tab.displayName}`"
            :cellHeight="cellHeight"
          >
            <template #sectionHeader="{ section }">
              <FContainer
                v-if="
                  !isEmpty(section.displayName) || !isEmpty(section.description)
                "
                padding="containerLarge containerXLarge"
                display="flex"
                alignItems="center"
              >
                <FText
                  v-if="!isEmpty(section.displayName)"
                  appearance="headingMed20"
                >
                  {{ section.displayName }}
                </FText>
                <FDivider
                  height="16px"
                  margin="containerNone containerXLarge"
                ></FDivider>
                <FText
                  v-if="!isEmpty(section.description)"
                  appearance="bodyReg14"
                  color="textCaption"
                >
                  {{ section.description }}
                </FText>
              </FContainer>
            </template>
            <template v-slot="{ widget }">
              <WidgetSupplier
                :widget="widget"
                :groupKey="widget.key"
                v-bind="$attrs"
                :details="details"
                :id="id"
                :tabType="tab.tabType"
                :module="module"
                :record="details"
                :reloadSummary="reloadSummary"
                :resizeWidgetOnPage="resizeWidgetOnPage"
                :cellHeight="cellHeight"
                :cellWidth="cellWidth"
                :moduleName="module"
                class="page-widget-container"
                @fitToViewArea="fitToViewArea"
              />
            </template>
          </PageGrid>
        </div>
        <FContainer class="empty-scroll-box"></FContainer>
      </FTabPane>
    </FTabs>
  </div>
</template>
<script>
import { PageGrid } from '@facilio/ui/new-app'
import WidgetSupplier from './widgets/WidgetSupplier.vue'
import { getApp } from '@facilio/router'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { eventBus } from './event-bus.js'
import {
  FTabs,
  FTabPane,
  FText,
  FContainer,
  FSpinner,
  FDivider,
  FEmptyState,
} from '@facilio/design-system'
import dlv from 'dlv'
import { getTolgee } from '../../utils/tolgee'
import WidgetConfigMixin from './WidgetConfigMixin.vue'

const $t = getTolgee().t

const BULK_WIDGET = [
  'bulkRelatedList',
  'bulkRelationShipWidget',
  'meterRelationships',
]

const EMPTY_STATE_MESSAGE = {
  bulkRelatedList: $t(
    'summary.widgets.bulkwidget.no_related',
    'Related list is not configured'
  ),
  bulkRelationShipWidget: $t(
    'summary.widgets.bulkwidget.no_relation',
    'Relationship is not configured'
  ),
  meterRelationships: $t(
    'summary.widgets.bulkwidget.no_meters',
    'Meter Relationships not associated'
  ),
}

export default {
  props: ['module', 'id', 'details'],
  mixins: [WidgetConfigMixin],
  data() {
    return {
      pageId: null,
      currentTab: null,
      loading: false,
      cellHeight: 62,
      tabs: [],
      loadingPage: false,
      isEmpty,
      emptyStateMessage: {
        title: $t(
          'summary.page_empty_title',
          'Page not configured for this module'
        ),
        description: $t(
          'summary.page_empty_desc',
          'Please contact your administrator'
        ),
      },
      showTabHeader: false,
      totalWidgetCountList: {},
      BULK_WIDGET,
      EMPTY_STATE_MESSAGE,
    }
  },
  components: {
    WidgetSupplier,
    FTabs,
    FTabPane,
    FText,
    FContainer,
    PageGrid,
    FSpinner,
    FDivider,
    FEmptyState,
  },
  async mounted() {
    this.loading = true
    let { tabName } = this
    await this.fetchPageData(tabName)
    this.pushCurrentTab()
    this.doSingleTabFit()
    this.loading = false
  },
  computed: {
    tabName() {
      let { query } = this.$route
      let { tabName } = query || {}
      return tabName || null
    },
    gridCell() {
      return 12
    },
    cellWidth() {
      return (
        Math.ceil(
          this.$refs['page-builder-wrapper']?.scrollWidth / this.gridCell
        ) || null
      )
    },
    appId() {
      let { id } = getApp() || {}
      return id
    },
  },
  watch: {
    currentTab(newVal) {
      this.tabPaneChanged(newVal)
    },
  },
  methods: {
    async deserializeTabs(rawTabs) {
      let tabs = await Promise.all(
        rawTabs.map(async (tab, tabIndex) => {
          let { displayName } = tab || {}
          let columns = await Promise.all(
            (tab.columns || []).map(async (column, columnIndex, columns) => {
              let { width: columnWidth } = column

              if (columnIndex > 0) {
                const previousColumn = columns[columnIndex - 1]
                let { x, width } = previousColumn
                column.x = x + width
              } else {
                column.x = 0
              }

              const sections = await Promise.all(
                (column?.sections || []).map(async section => {
                  let widgets = await this.getSerializedWidgets(
                    section?.widgets,
                    columnWidth
                  )
                  return {
                    ...section,
                    widgets,
                  }
                })
              )

              return {
                ...column,
                sections,
              }
            })
          )

          return {
            ...tab,
            id: tab.id,
            key: `t${tabIndex}`,
            columns,
            value: tab.name,
            label: displayName,
          }
        })
      )

      return tabs
    },

    fitToViewArea(widgetId, widgetName) {
      let [tabComp] = this.$refs['tab-comp']
      let h = tabComp.$el.offsetHeight
      this.resizeWidgetOnPage(widgetId, widgetName, { h: h })
    },
    async fetchPageData(tabName) {
      let { module: moduleName, appId, id: recordId } = this
      let { data, error } = await API.get(
        `v2/customPage/${moduleName}/fetchForRecord`,
        {
          moduleName,
          appId,
          recordId,
          tabName,
          layoutType: 'WEB',
          showNewPageBuilder: true,
        }
      )
      if (!error) {
        let { id } = data?.customPage || {}
        this.pageId = id
        let tabs = data?.customPage?.layouts?.WEB || []

        let foundTab = (tabs || []).filter(tab => tab.name == tabName)
        this.currentTab = !isEmpty(foundTab)
          ? tabName
          : dlv(tabs, `0.name`) || null
        this.tabs = await this.deserializeTabs(tabs)
        if ((tabs || []).length > 1) {
          this.$emit('appendedTabHeader')
          this.showTabHeader = true
        }
      } else {
        this.emptyStateMessage = {
          title: '',
          description: $t(
            'summary.page_api_fail',
            'We were not able to show the required info, please retry later !!'
          ),
        }
      }
    },
    doSingleTabFit() {
      setTimeout(() => {
        let { tabs, currentTab, totalWidgetCountList } = this
        let currentTabObj = tabs.find(tab => tab.name === currentTab)
        if (currentTabObj.tabType === 'SINGLE_WIDGET_TAB') {
          let { id, name } =
            dlv(currentTabObj, 'columns.0.sections.0.widgets.0') || {}
          if (id && name && totalWidgetCountList[currentTab] == 1)
            this.fitToViewArea(id, name)
        }
      })
    },
    reloadSummary() {
      eventBus.$emit('refresh-overview')
    },
    async getSerializedWidgets(widgets, columnWidth) {
      let { currentTab } = this
      let widgetLength = (widgets || []).length || 0
      let iter = widgetLength - 1

      while (iter > -1) {
        const {
          positionX,
          positionY,
          width,
          height,
          widgetTypeObj,
          widgetDetail,
          configType,
        } = widgets[iter] || {}
        let { name: widgetTypeName } = widgetTypeObj || {}
        widgets[iter].key = widgets[iter].id
        let h = height
        let w = width

        if (configType === 'FLEXIBLE') w = columnWidth

        if (BULK_WIDGET.includes(widgetTypeName)) {
          let { relatedList, relationships } = widgetDetail || {}

          if (widgetTypeName === 'meterRelationships') {
            relationships = await this.loadAvailableMeterRelations()
          }

          let relatedWidgets = (
            relatedList ||
            relationships || [
              {
                bulkIsEmpty: true,
                widgetTypeObj: { name: 'bulkempty' },
                message: EMPTY_STATE_MESSAGE[widgetTypeName],
              },
            ]
          ).map(relatedObj => {
            return Object.assign(
              {
                ...widgets[iter],
                ...relatedObj,
                h,
                w,
                noResize: true,
                x: 0,
                y: 0,
                noMove: true,
                id: relatedObj.id,
              },
              {
                relatedList: relatedObj,
              }
            )
          })
          widgets.splice(iter, 1, ...relatedWidgets)
        } else {
          widgets[iter] = {
            ...widgets[iter],
            x: positionX,
            y: positionY,
            h,
            w,
            noResize: true,
            noMove: true,
          }
        }
        iter--
      }
      if (!Object.hasOwn(this.totalWidgetCountList, currentTab))
        this.totalWidgetCountList[currentTab] = 0
      this.totalWidgetCountList[currentTab] += widgets.length

      return widgets
    },

    resizeWidgetOnPage(widgetId, widgetName, dimensions) {
      let { currentTab } = this
      let [tabRef] = this.$refs[`page-builder-${currentTab}`]
      tabRef?.resize(widgetId, widgetName, dimensions)
    },
    pushCurrentTab() {
      let { currentTab } = this
      let { query } = this.$route
      if (currentTab && currentTab !== query.tabName)
        this.$router
          .replace({
            path: this.$route.fullPath,
            query: { ...query, tabName: currentTab },
          })
          .catch({})
    },

    async fetchCurrentTab(tabIndex) {
      this.loadingPage = true
      let { currentTab, pageId, module: moduleName } = this
      let { data, error } = await API.get(
        `v2/customPage/tabs/${moduleName}/fetch`,
        {
          tabName: currentTab,
          moduleName,
          layoutType: 'WEB',
          pageId,
        }
      )
      if (!error) {
        let tab = await this.deserializeTabs([data.tab])
        this.$set(this.tabs, `${tabIndex}`, tab[0])
      }
      this.loadingPage = false
    },
    async tabPaneChanged(tabName) {
      let { tabs, currentTab } = this
      this.$nextTick(async () => {
        let tabIndex = tabs.findIndex(tab => tab.name == tabName)

        if (tabIndex !== -1) {
          let columns = dlv(this.tabs, `${tabIndex}.columns`) || null
          isEmpty(columns) && (await this.fetchCurrentTab(tabIndex))
          this.doSingleTabFit()
        }
      })
    },
  },
}
</script>
<style lang="scss">
.portal-sticky-pb {
  width: 100%;
  background: white;
  margin-left: 8px;
}
.pb-container {
  height: 100%;
  background-color: transparent;

  .npb-section-title {
    font-weight: normal;
    line-height: 18px;
    letter-spacing: 0.7px;
    font-size: 18px;
    color: #000;
  }

  .el-tabs__nav-wrap {
    padding-left: 20px;
  }

  .npb-section-desc {
    font-size: 13px;
    color: gray;
    line-height: 20px;
    letter-spacing: 0.3px;
    margin-top: 5px;
  }
}
</style>
<style lang="scss" scoped>
.page-widget-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
