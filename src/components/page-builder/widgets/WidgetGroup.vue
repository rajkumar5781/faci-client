<template>
  <FContainer>
    <FTabs
      v-model="activeTab"
      ref="ftab-comp"
      :tabsList="widgetTabs"
      padding="containerMedium containerNone"
      :hideBorder="false"
      @change="tabPaneChanged"
    >
      <FTabPane
        v-for="section in widgetTabs"
        :activeKey="section.name"
        :key="section.id"
      >
        <FContainer
          class="h-full"
          :key="section.id"
          v-if="activeTab === section.name"
        >
          <widget-supplier
            class="widget-card page-widget-container widget-container"
            :ref="`widget-${widget.id}-${widget.name}`"
            v-for="(widgetElement, index) in section.widgets"
            v-bind="$attrs"
            :contentHeight="contentHeight"
            :groupKey="widgetKey"
            :groupActionPortal="groupActionPortal"
            :activeTab="activeTab"
            :wrapperId="widget.id"
            :wrapperName="widget.name"
            :sectionName="section.name"
            :resizeWidget="resizeWidget"
            :key="`${widgetElement.id} ${widgetElement.name} ${index}`"
            :widget="widgetElement"
            :insideGroup="true"
          ></widget-supplier>
        </FContainer>
      </FTabPane>
    </FTabs>
    <portal-target
      :name="groupActionPortal"
      class="absolute top-1.5 right-1.5"
    ></portal-target>
  </FContainer>
</template>
<script>
import { FContainer, FTabs, FTabPane } from '@facilio/design-system'
import WidgetSupplier from './WidgetSupplier.vue'
import dlv from 'dlv'
import { isEmpty } from '@facilio/utils/validation'

export default {
  props: ['widget', 'resizeWidget', 'fitToViewArea', 'tabType'],
  components: {
    FContainer,
    WidgetSupplier,
    FTabs,
    FTabPane,
  },
  data() {
    return {
      activeTab: null,
      widgetTabs: [],
      tabsHeightList: {},
    }
  },
  created() {
    let { widgetDetail } = this.widget || {}
    let { sections } = widgetDetail
    this.widgetTabs = (sections || []).map(section => {
      return {
        ...section,
        widgets: (section.widgets || []).map(widget => {
          return { ...widget, height: widget.height + 3 }
        }),
        label: section.displayName,
        value: section.name,
      }
    })

    this.widgetKey = sections.reduce((acc, current) => {
      return `${acc} ${current.name}`
    }, '')
    this.tabsHeightList = (sections || []).reduce((acc, section) => {
      let maxheight = (section.widgets || []).reduce((prevMaxVal, widget) => {
        return Math.max(prevMaxVal, widget.height)
      }, new Number())
      acc[section.name] = maxheight
      return acc
    }, {})
    this.activeTab = dlv(sections, '0.name') || null
  },
  computed: {
    widgetList() {
      let { widgetTabs } = this
      return (widgetTabs || []).map(tab => {
        let { displayName: label, name: value } = tab
        return { label, value }
      })
    },
    groupActionPortal() {
      let { id, name } = this.widget
      return `groupaction-${id}-${name}`
    },
  },
  methods: {
    tabPaneChanged(newVal) {
      if (this.tabType === 'SINGLE_WIDGET_TAB') return
      let h = dlv(this.tabsHeightList, `${newVal}`) || this.widget?.height || 4
      this.resizeWidget({ h: h })
    },
    contentHeight() {
      let { widget } = this
      let [widgtComp] = this.$refs[`widget-${widget.id}-${widget.name}`] || []
      let tabComp = this.$refs['ftab-comp']?.$el
      if (!isEmpty(widgtComp) || !isEmpty(tabComp)) {
        let height = widgtComp?.$el?.scrollHeight || comp?.scrollHeight
        let headerHeight = dlv(tabComp, 'firstChild.offsetHeight') || 0
        return height + headerHeight
      }
    },
  },
}
</script>
