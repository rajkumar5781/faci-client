<template>
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
              <WidgetSupplierV2
                :widget="widget"
                :groupKey="widget.key"
                v-bind="$attrs"
                :details="details"
                :id="id"
                :tabType="tab.tabType"
                :module="module"
                :record="details"
                :cellHeight="cellHeight"
                :cellWidth="cellWidth"
                :moduleName="module"
                class="page-widget-container"
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
import PageBuilder from '../../../components/page-builder/PageBuilderV1.vue'
import WidgetSupplierV2 from './WidgetSupplierV2.vue'

export default {
  extends: PageBuilder,
  components: { WidgetSupplierV2 },
  methods: {
    async getSerializedWidgets(widgets, columnWidth) {
      let size_hash = { 6: 'large', 4: 'medium', 2: 'small' }
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

        h = h >= 6 ? 6 : h >= 4 ? 4 : 2
        let size = size_hash[h]

        if (configType === 'FLEXIBLE') w = columnWidth

        if (this.BULK_WIDGET.includes(widgetTypeName)) {
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
                message: this.EMPTY_STATE_MESSAGE[widgetTypeName],
              },
            ]
          ).map(relatedObj => {
            return Object.assign(
              {
                ...widgets[iter],
                ...relatedObj,
                h,
                w,
                size,
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
            size,
            noResize: true,
            noMove: true,
          }
        }
        iter--
      }

      this.totalWidgetCountList[currentTab] += widgets.length

      return widgets
    },
  },
}
</script>
