<template>
  <FContainer
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
    gap="containerXLarge"
    height="100%"
    width="100%"
  >
    <FContainer>
      <portal
        :to="`action-${widget.id}-${widget.name}`"
        class="portal-alignment-ws action-ws"
      >
        <FTimelineFilter
          v-if="!isEmpty(dateObj)"
          @change="setDateObject"
        ></FTimelineFilter>
      </portal>
    </FContainer>
    <FContainer
      padding="sectionSmall"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
    >
      <FText appearance="bodyReg14" color="textMain">
        {{ $t('asset.MTTR', 'MTTR', { ns: 'asset' }) }}</FText
      >
      <FContainer
        display="flex"
        width="612px"
        justifyContent="space-between"
        alignItems="center"
      >
        <FContainer display="flex" alignItems="flex-end" gap="containerXLarge">
          <FContainer display="flex" alignItems="center">
            <FContainer
              display="flex"
              padding="containerXLarge containerNone"
              flexDirection="column"
              alignItems="flex-start"
              gap="containerMedium"
            >
              <FText
                text-overflow="ellipsis"
                appearance="headingMed20"
                color="textMain"
              >
                {{ stats.mttr }}
              </FText>
              <FText
                text-overflow="ellipsis"
                appearance="captionReg12"
                color="textCaption"
                >{{
                  $t('asset.range.THIS_YEAR', 'This Year', { ns: 'asset' })
                }}</FText
              >
            </FContainer>
          </FContainer>

          <FContainer
            display="flex"
            padding="containerXLarge containerLarge"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            gap="containerMedium"
          >
            <FText
              text-overflow="ellipsis"
              appearance="bodyReg14"
              color="textMain"
            >
              {{ stats.mttrTillLastMonth }}
            </FText>
            <FText
              text-overflow="ellipsis"
              appearance="captionReg12"
              color="textCaption"
              >Till last month
            </FText>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <FDivider width="100%"></FDivider>
    <FContainer height="100%" width="100%">
      <ModuleReport
        :reportConfig="report"
        :visualizationProps="visualizationProps"
      ></ModuleReport>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FTimelineFilter,
  FButton,
  FDivider,
} from '@facilio/design-system'
import AssetMeanTimeBtwFailure from './AssetMeanTimeBtwFailure.vue'
import ModuleReport from '../../../../components/reports/module/ModuleReport.vue'
import { isEmpty } from '@facilio/utils/validation'

export default {
  extends: AssetMeanTimeBtwFailure,
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'activeTab',
    'widget',
    'resizeWidget',
    'eventBus',
    'moduleName',
  ],
  components: {
    FContainer,
    FText,
    FTimelineFilter,
    FButton,
    FDivider,
    ModuleReport,
  },
  data() {
    return {
      isEmpty,
      metrics: {},
      dateObj: {
        operatorId: 44,
      },
      visualizationProps: {
        chart: {
          chartType: 'line',
        },
      },
      report: {
        report: {
          moduleName: 'assetbreakdown',
          dimensions: {
            // server config xfield
            fieldName: 'fromtime',
            moduleName: 'assetbreakdown',
            special: false,
            lookupModuleName: 'time',
          },
          measures: [
            // y field
            {
              fieldName: 'duration',
              moduleName: 'assetbreakdown',
              aggr: 2,
              sortOrder: 2,
              limit: 15,
            },
          ],
          groupBy: null,
          filters: {
            globalCriteria: {
              conditions: null,
              pattern: '(1)',
            },
          },
          drillDown: null,
          reportMode: 0,
          reportType: 0,
          timeFilter: {
            fieldName: 'fromtime',
            moduleName: 'assetbreakdown',
            dateOperator: 44,
            startTime: null,
            endTime: null,
          },
        },
      },
      criteria: null,
    }
  },
}
</script>
