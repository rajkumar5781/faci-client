<template>
  <FContainer display="inline-flex" alignItems="flex-start" height="100%" width="100%">
    <FContainer
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      width="50%"
    >
      <FContainer
        @click="costSelection('maintenance')"
        :backgroundColor="
          this.selectedCost === 'maintenance' ? 'backgroundNeutralHovered' : ''
        "
        diplay="flex"
        flexDirection="column"
        alignItems="flex-start"
        width="100%"
      >
        <FContainer
          diplay="flex"
          flexDirection="column"
          alignItems="flex-start"
          padding="containerXxLarge"
          gap="containerLarge"
        >
          <FContainer>
            <FText color="textMain" appearance="captionReg14">
              Maintenance Cost</FText
            ></FContainer
          >
          <FContainer display="flex" flexDirection="column">
            <FContainer display="flex">
              <FContainer display="flex" flexDirection="column" width="50%">
                <FContainer>
                  <FText appearance="headingMed20" color="textMain"
                    >{{ getCurrencyValue(maintenanceCostYear) }}</FText
                  >
                </FContainer>
                <FContainer>
                <FContainer>
                <FText color="textCaption" appearance="captionReg12">
                  This Year
                </FText>
              </FContainer>
                </FContainer>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="column"
              >
                <FContainer>
                  <FText appearance="headingMed20" color="textMain"
                    >{{ getCurrencyValue(this.maintenanceCostLastYear) }}</FText
                  >
                </FContainer>
                <FContainer>
                <FText color="textCaption" appearance="captionReg12">
                  Last Year
                </FText>
              </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FDivider width="100%" />

      <!--  -->
      <FContainer
        @click="costSelection('plannedmaintenance')"
        :backgroundColor="
          this.selectedCost === 'plannedmaintenance'
            ? 'backgroundNeutralHovered'
            : ''
        "
        diplay="flex"
        flexDirection="column"
        alignItems="flex-start"
        width="100%"
      >
      <FContainer
          diplay="flex"
          flexDirection="column"
          alignItems="flex-start"
          padding="containerXxLarge"
          gap="containerLarge"
        >
          <FContainer>
            <FText color="textMain" appearance="captionReg14">
              Planned Maintenance</FText
            >
          </FContainer>
          <FContainer display="flex" flexDirection="column">
            <FContainer display="flex" >
              <FContainer display="flex" flexDirection="column" width="50%">
                <FContainer>
                  <FText appearance="headingMed20" color="textMain"
                    >{{getCurrencyValue(this.plannedMaintenanceCostThisYear)}}</FText
                  >
                </FContainer>
                <FContainer>
                <FContainer>
                <FText color="textCaption" appearance="captionReg12">
                  This Year
                </FText>
              </FContainer>
                </FContainer>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="column"
              >
                <FContainer>
                  <FText appearance="headingMed20" color="textMain"
                    >{{getCurrencyValue(this.plannedMaintenanceCostLastYear)}}</FText
                  >
                </FContainer>
                <FContainer>
                <FText color="textCaption" appearance="captionReg12">
                  Last Year
                </FText>
              </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FDivider width="100%" />

      <!--  -->

      <FContainer
        @click="costSelection('unplannedmaintenance')"
        :backgroundColor="
          this.selectedCost === 'unplannedmaintenance'
            ? 'backgroundNeutralHovered'
            : ''
        "
        diplay="flex"
        flexDirection="column"
        alignItems="flex-start"
        width="100%"
      >
        <FContainer
          diplay="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerLarge"
          padding="containerXxLarge"
        >
          <FContainer>
            <FText color="textMain" appearance="captionReg14">
              Unplanned Maintenance</FText
            ></FContainer
          >
          <FContainer display="flex" flexDirection="column">
            <FContainer display="flex">
              <FContainer display="flex" flexDirection="column" width="50%">
                <FContainer>
                  <FText appearance="headingMed20" color="textMain"
                    >{{ getCurrencyValue(this.unplannedMaintenanceCostThisYear) }}</FText
                  >
                </FContainer>
                <FContainer>
                <FContainer>
                <FText color="textCaption" appearance="captionReg12">
                  This Year
                </FText>
              </FContainer>
                </FContainer>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="column"
              >
                <FContainer>
                  <FText appearance="headingMed20" color="textMain"
                    >{{
                      getCurrencyValue(this.unplannedMaintenanceCostLastYear)
                    }}</FText
                  >
                </FContainer>
                <FContainer>
                <FText color="textCaption" appearance="captionReg12">
                  Last Year
                </FText>
              </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>

    <FDivider height="100%" />

    <!-- <FContainer
      display="flex"
      alignItems="center"
      width="60%"
      justifyContent="center"
      height="100%"
    >
      <ChartWidget
        key="costbreakup"
        :widget="widget"
        :moduleName="'workorderCost'"
        :dateObj="dateObj"
        :customizeChartOptions="customizeChartOptions"
        chartType="donut"
      ></ChartWidget>
    </FContainer> -->
  </FContainer>
</template>
<script>
// import ChartWidget from 'src/beta/summary/widget/chart/ChartWidget.vue'
// import NewDateHelper from 'src/components/mixins/NewDateHelper'
import { FContainer, FRow, FCol, FText, FDivider } from '@facilio/design-system'
import { getCurrency } from '../../../../utils/formatter'
import { API } from '@facilio/api'
import * as d3 from 'd3'
export default {
  props: [
    'details',
    'layoutParams',
    'resizeWidget',
    'hideTitleSection',
    'groupKey',
    'activeTab',
    'widget',
  ],
  components: { FRow, FCol, FContainer, FText, FDivider },
  data() {
    return {
      ids: '',
      dateObj: {},
      selectedCost: 'maintenance',
      refreshChart: false,
      plannedMaintenanceCostThisYear: 0,
      unplannedMaintenanceCostThisYear: 0,
      maintenanceCostThisYear: 0,
      plannedMaintenanceCostLastYear: 0,
      unplannedMaintenanceCostLastYear: 0,
      maintenanceCostLastYear: 0,
      typeVsDisplayNameMap: {
        maintenance: 'MAINTENANCE COST',
        plannedmaintenance: 'PLANNED MAINTENANCE',
        unplannedmaintenance: 'UNPLANNED MAINTENANCE',
      },
      customizeChartOptions: {
        donut: {
          centerText: {
            primaryText: '_sum',
            secondaryText: 'Total Cost',
          },
        },
        legend: {
          position: 'bottom',
        },
      },
    }
  },
  mounted() {
    this.costSelection('maintenance')
    this.loadMaintenanceCost()
  },
  computed: {
    prefixUnit() {
      return ['$', '£', '₹'].includes(getCurrency())
    },
    maintenanceCostYear() {
      return this.maintenanceCostThisYear
    },
  },
  methods: {
    formatedValue(value) {
        return d3.format('.2f')(value)
    },
    costSelection(type) {
      // this.customizeChartOptions.donut.centerText.secondaryText = this.typeVsDisplayNameMap[
      //   type
      // ]
      this.selectedCost = type
      this.refreshChart = false
      this.workorderIdsForSelectedCostAndsetChartParams()
    },
    async workorderIdsForSelectedCostAndsetChartParams() {
      let { data } = await API.post('/v2/workflow/getDefaultWorkflowResult', {
        defaultWorkflowId: 106,
        paramList: [
          this.details.id,
          this.selectedCost === 'plannedmaintenance'
            ? 2
            : this.selectedCost === 'unplannedmaintenance'
            ? 3
            : 1,
        ],
      })
      this.ids = data?.workorderIds || []
      Object.values(
        this.widget.widgetDetail?.chartParams?.criteria?.conditions || []
      ).forEach(a => {
        if (a.columnName == 'Workorder_cost.PARENT_ID') {
          a.value = this.ids ? this.ids.substring(0, this.ids.length - 1) : ''
        }
      })
    },
    async loadMaintenanceCost() {
      let { data } = await API.post('/v2/workflow/getDefaultWorkflowResult', {
        defaultWorkflowId: 105,
        paramList: [this.details.id],
      })

      if (data?.workflow?.returnValue) {
        this.plannedMaintenanceCostThisYear =
          data.workflow.returnValue.plannedMaintenanceCostThisYear
        this.unplannedMaintenanceCostThisYear =
          data.workflow.returnValue.unplannedMaintenanceCostThisYear
        this.maintenanceCostThisYear =
          data.workflow.returnValue.maintenanceCostThisYear
        this.plannedMaintenanceCostLastYear =
          data.workflow.returnValue.plannedMaintenanceCostLastYear
        this.unplannedMaintenanceCostLastYear =
          data.workflow.returnValue.unplannedMaintenanceCostLastYear
        this.maintenanceCostLastYear =
          data.workflow.returnValue.maintenanceCostLastYear
      }
    },
    getArrowDesign(costThisYear, costLastYear) {
      if (costThisYear === costLastYear) return 'hide-v'
      return costThisYear < costLastYear
        ? 'fill-green rotate-bottom'
        : 'fill-red'
    },
    getCurrencyValue(cost){
      let costVal = this.formatedValue(cost)
      return this.prefixUnit?`${getCurrency()} ${costVal}`:`${costVal} ${getCurrency()}`
    },
  },
}
</script>
