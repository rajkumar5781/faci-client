<template lang="">
  <FCard :hideBorder="hideBorder">
    <template #header>
      <FContainer v-if="!hideHeader">
        <portal-target
          ref="header-portal"
          class="portal-alignment-ws"
          :name="headerPortal"
        >
          <FContainer class="title-section-ws">
            <portal-target :name="titlePortal" class="portal-alignment-ws">
              <FContainer
                padding="containerLarge containerXLarge"
                height="40px"
                display="flex"
                alignItems="center"
              >
                <FText appearance="headingMed14">{{
                  widget.displayName || widget.name
                }}</FText>
              </FContainer></portal-target
            >
            <portal-target
              :name="actionPortal"
              class="portal-alignment-ws action-ws"
            >
            </portal-target>
          </FContainer>
        </portal-target>
      </FContainer>
    </template>
    <FContainer height="100%" overflow="hidden">
      <FDivider width="100%" v-if="!hideHeader"></FDivider>
      <component
        v-bind="$attrs"
        :is="widgetName"
        ref="fcard-body"
        :insideGroup="insideGroup"
        :widget="widget"
        :resizeWidgetOnPage="resizeWidgetOnPage"
        :interWidgetCom="interWidgetCom"
        :widgetId="widget.id"
        :payloadDrop="payloadDrop"
        :layoutParams="layoutParams"
        :resizeWidget="resizeWidget"
        :calculateDimensions="calculateDimensions"
        :cellHeight="cellHeight"
        :cellWidth="cellWidth"
        :fitMyContent="fitMyContent"
        :fitToViewArea="fitToViewArea"
        :footerPortal="computedFooterPortal"
        :headerPortal="headerPortal"
        :actionPortal="actionPortal"
        :titlePortal="titlePortal"
        :isContentOverflowed="isContentOverflowed"
        style="height: 100%"
        :sectionName="sectionName"
      ></component>
      <FContainer v-show="!widgetName" padding="containerXLarge">
        <FText>{{
          $t('summary.widgets.widget_not_available', 'Widget not available')
        }}</FText>
      </FContainer>
    </FContainer>
    <template #footer>
      <div>
        <FDivider v-if="showFooterDivider" width="100%" class="mB0"></FDivider>
        <portal-target
          v-if="!insideGroup"
          class="portal-alignment-ws"
          ref="footer-portal"
          :class="{ height2px: !showFooterDivider }"
          :name="computedFooterPortal"
          @change="footerChange"
          :style="{ 'min-height': showFooterDivider ? 'unset' : '0px' }"
        ></portal-target>
      </div>
    </template>
  </FCard>
</template>
<script>
import { FCard, FText, FContainer, FDivider } from '@facilio/design-system'
import {
  isNullOrUndefined,
  isEmpty,
  isFunction,
} from '@facilio/utils/validation'
import dlv from 'dlv'
import { eventBus } from '../event-bus'
/* module specific widget supplier start */
import AssetWidgetSupplierMixin from '../../../pages/modules/asset/widgets/AssetWidgetSupplierMixin'
import VendorQuotesWidgetSupplierMixin from '../../../pages/modules/vendorquotes/widgets/VendorQuotesWidgetSupplierMixin'
import FSMWidgetSupplierMixin from '../../../pages/fsm/FSMWidgetSupplierMixin'
import ClientWidgetSupplierMixin from '../../../pages/modules/client/widgets/ClientWidgetSupplierMixin'

import PortfolioWidgetSupplierMixin from '../../../pages/modules/portfolio/widgets/PortfolioWidgetSupplierMixin'
import MeterWidgetSupplierMixin from '../../../pages/modules/meter/widgets/MeterWidgetSupplierMixin'
import ServiceRequestWidegtSupplierMixin from '../../../pages/modules/servicerequest/widgets/ServiceRequestWidegtSupplierMixin'
import calendarWidgetSupplierMixin from '../../../pages/modules/calendar/widget/calendarWidgetSupplierMixin'
import controlActionWidgetSupplierMixin from '../../../pages/modules/controlAction/widgets/controlActionWidgetSupplierMixin'
import WorkOrderWidgetSupplierMixin from '../../../pages/modules/workorder/widgets/WorkOrderWidgetSupplierMixin'
import RemoteMonitorWidgetSupplierMixin from '../../../pages/remotemonitor/RemoteMonitorWidgetSupplierMixin'
import ReceivableWidgetSupplierMixin from '../../../pages/modules/receivables/widgets/receivableWidgetSupplierMixin'
import SafetyPlanWidgetSupplierMixin from '../../../pages/modules/safetyPlan/widget/safetyPlanWidgetSupplierMixin'
import TransferRequestWidgetSupplierMixin from '../../../pages/modules/transferRequest/widget/transferRequestWidgetSupplierMixin'
import RfqWidgetSupplierMixin from '../../../pages/modules/Rfq/widget/RfqWidgetSupplierMixin'
import UtilityIntegrationCustomerWidgetSupplierMixin from '../../../pages/modules/utilityIntegrationCustomer/widgets/UtilityIntegrationCustomerWidgetSupplierMixin'
import UtilityIntegrationBillWidgetSupplierMixin from '../../../pages/modules/utilityIntegrationBills/widgets/UtilityIntegrationBillWidgetSupplierMixin'
import ServiceModuleWidgetSupplierMixin from '../../../pages/modules/inventory/service/ServiceModuleWidgetSupplierMixin'
import ItemAndToolTypeWidgetSupplierMixin from '../../../pages/modules/inventory/itemandtooltypes/ItemAndToolTypeWidgetSupplierMixin'
import InventoryRequestWidgetSupplierMixin from '../../../pages/modules/inventory/inventoryrequest/InventoryRequestWidgetSupplierMixin'
import StoreRoomWidgetSupplierMixin from '../../../pages/modules/inventory/storeroom/StoreRoomWidgetSupplierMixin'
import ItemWidgetSupplierMixin from '../../../pages/modules/inventory/Item/ItemWidgetSupplierMixin.js'

import VirtualMeterTemplateWidgetSupplierMixin from '../../../pages/modules/virtualMeterTemplate/widgets/VirtualMeterTemplateWidgetSupplierMixin'
import TenantWidgetSupplierMixin from '../../../pages/modules/tenant/TenantWidgetSupplierMixin'

import FacilityModuleWidgetSupplierMixin from '../../../pages/modules/facility/widgets/FacilityModuleWidgetSupplierMixin'
import BookingModuleWidgetSupplierMixin from '../../../pages/modules/booking/widgets/BookingModuleWidgetSupplierMixin'
import VisitorWidgetSupplierMixin from '../../../pages/modules/visitorManagemenet/VisitorWidgetSupplierMixin'
import JPWidgetSupplierMixin from '../../../pages/modules/jobplan/widgets/JPWidgetSupplierMixin'
import PlannedMaintenanceWidgetSupplierMixin from '../../../pages/modules/planned-maintenance/widgets/PlannedMaintenanceWIdgetSupplierMixin'
import RuleWidgetSupplierMixin from '../../../pages/modules/readingrule/RuleWidgetSupplierMixin'
import AlarmWidgetSupplierMixin from '../../../pages/modules/alarm/mixins/AlarmWidgetSupplierMixin'
import InspectionTemplateWidgetSupplierMixin from '../../../pages/modules/inspection/inspectionTemplate/widgets/InspectionTemplateWidgetSupplierMixin'
import InductionTemplateWidgetSupplierMixin from '../../../pages/modules/induction/inductionTemplate/widgets/inductionTemplateWidgetSupplierMixin'
import InspectionResponseWidgetSupplier from '../../../pages/modules/inspection/inspectionResponse/widgets/inspectionResponseWidgetSupplier'
import InductionResponseWidgetSupplierMixin from '../../../pages/modules/induction/inductionResponse/widgets/InductionResponseWidgetSupplier'
import BudgetWidgetSupplierMixin from '../../../pages/modules/budget/BudgetWidgetSupplierMixin'
import TermsAndConditionsWidgetSupplierMixin from '../../../pages/modules/termsAndConditions/TermsAndConditionsWidgetSupplierMixin'
import surveyResponseWidgetSupplierMixin from '../../../pages/modules/survey/widgets/SurveyResponseMixin'

/* module specific widget supplier end */

const NO_HEADER_HASH = [
  'widgetGroup',
  'costBreakup',
  'workschedule',
  'weatherCard',
  'plans',
  'ruleAssetsAlarm',
  'ruleAlarmInsight',
  'rootCauseAndImpact',
  'itemTypesDetailsCard',
  'bookingInfo',
  'transferRequestDetailsCard',
  'totalInviteWidget',
  'checkedInCountWidget',
  'vendorQuotesLineItems',
  'tenantSpecialWidget',
  'depreciationAnalysis',
  'pmPlannerTriggerDetailsWidget',
  'pmSchedulerDetailsWidget',
  'inspectionTemplateSummaryQuestionCount',
  'inspectionTemplateSummaryPageCount',
  'inspectionTemplateSummaryLastTriggered',
  'inductionTemplateSummaryQuestionCount',
  'inductionnTemplateSummaryPageCount',
  'inductionTemplateSummaryLastTriggered',
  'servicePMServiceOrders',
  'serviceOrderPlans',
  'serviceOrderActuals',
  'servicePlanInventory',
  'servicePM',
  'toolDetailsCard',
  'itemdetailscard',
  'workorderFinancial',
]

const NO_BORDER_HASH = ['pmSchedulerDetailsWidget', 'workorderFinancial']

export default {
  mixins: [
    AssetWidgetSupplierMixin,
    ClientWidgetSupplierMixin,
    FSMWidgetSupplierMixin,
    PortfolioWidgetSupplierMixin,
    FSMWidgetSupplierMixin,
    PortfolioWidgetSupplierMixin,
    MeterWidgetSupplierMixin,
    ServiceRequestWidegtSupplierMixin,
    calendarWidgetSupplierMixin,
    controlActionWidgetSupplierMixin,
    WorkOrderWidgetSupplierMixin,
    RemoteMonitorWidgetSupplierMixin,
    ReceivableWidgetSupplierMixin,
    SafetyPlanWidgetSupplierMixin,
    TransferRequestWidgetSupplierMixin,
    RfqWidgetSupplierMixin,
    TermsAndConditionsWidgetSupplierMixin,
    UtilityIntegrationCustomerWidgetSupplierMixin,
    UtilityIntegrationBillWidgetSupplierMixin,
    VirtualMeterTemplateWidgetSupplierMixin,
    TenantWidgetSupplierMixin,
    ServiceModuleWidgetSupplierMixin,
    ItemAndToolTypeWidgetSupplierMixin,
    FacilityModuleWidgetSupplierMixin,
    BookingModuleWidgetSupplierMixin,
    InventoryRequestWidgetSupplierMixin,
    VisitorWidgetSupplierMixin,
    VendorQuotesWidgetSupplierMixin,
    JPWidgetSupplierMixin,
    StoreRoomWidgetSupplierMixin,
    ItemWidgetSupplierMixin,
    PlannedMaintenanceWidgetSupplierMixin,
    RuleWidgetSupplierMixin,
    AlarmWidgetSupplierMixin,
    InspectionTemplateWidgetSupplierMixin,
    InductionTemplateWidgetSupplierMixin,
    InspectionResponseWidgetSupplier,
    InductionResponseWidgetSupplierMixin,
    BudgetWidgetSupplierMixin,
    surveyResponseWidgetSupplierMixin,
  ],
  props: [
    'resizeWidgetOnPage',
    'cellHeight',
    'wrapperId',
    'wrapperName',
    'widget',
    'cellWidth',
    'insideGroup',
    'contentHeight',
    'sectionName',
  ],
  data() {
    return {
      payloadDrop: null,
      resizeId: null,
      showFooterDivider: false,
      titleFilled: false,
    }
  },

  components: {
    FCard,
    FText,
    FContainer,
    FDivider,
    summaryFieldsWidget: () => import('./fieldSummary/SummaryFieldsWidget.vue'),
    fixedSummaryFieldsWidget: () =>
      import('./fieldSummary/SummaryFieldsWidget.vue'),
    bulkempty: () => import('./BulkEmptyState.vue'),
    bulkRelatedList: () => import('./relatedList/RelatedList.vue'),
    approvalRelatedList: () => import('./relatedList/ApprovalRelatedList.vue'),
    relatedList: () => import('./relatedList/SingleRelatedList.vue'),
    activity: () => import('./history/ActivityWidget.vue'),
    widgetGroup: () => import('./WidgetGroup.vue'),
    bulkRelationShipWidget: () => import('./relationship/RelationWidget.vue'),
    classification: () =>
      import('./classification/ClassificationSpecificationWidget.vue'),
    comment: () => import('./notes/NotesWidget.vue'),
    attachment: () => import('./attachments/AttachmentWidget.vue'),
    statetransitiontimelog: () => import('./timeLog/MetricsWorkLog.vue'),
    meterRelationships: () => import('./relationship/RelationWidget.vue'),
    approvalFields: () => import('./approvals/ApprovalsFields.vue'),
    approvalListWidget: () => import('./approvals/ApprovalListWidget.vue'),
  },
  mounted() {
    let { widgetType } = this.widget
    eventBus.$on(widgetType, payload => {
      this.payloadDrop = payload
    })
  },
  beforeDestroy() {
    let { widgetType } = this.widget
    eventBus.$off(widgetType, payload => {
      this.payloadDrop = payload
    })
  },
  computed: {
    widgetName() {
      let components = Object.keys(this.$options.components)
      if (this.$options.mixins) {
        this.$options.mixins.forEach(mn => {
          components = components.concat(Object.keys(mn.components))
        })
      }
      let { widgetTypeObj } = this.widget
      let { name } = widgetTypeObj || {}
      let compAvail = components.includes(name)
      return compAvail ? name : null
    },
    isFixedType() {
      let { configType } = this.widget || {}
      return configType === 'FIXED'
    },
    finId() {
      let { wrapperId, widget } = this
      let { id } = widget

      return wrapperId || id
    },
    finName() {
      let { wrapperName, widget } = this
      let { name } = widget

      return wrapperName || name
    },
    hideHeader() {
      let { insideGroup, widgetName } = this
      return NO_HEADER_HASH.includes(widgetName) || insideGroup
    },
    headerPortal() {
      let { id, name } = this.widget
      return `header-${id}-${name}`
    },
    computedFooterPortal() {
      let { finId, finName } = this
      return `footer-${finId}-${finName}`
    },
    actionPortal() {
      let { id, name } = this.widget
      return `action-${id}-${name}`
    },
    titlePortal() {
      let { id, name } = this.widget
      return `title-${id}-${name}`
    },
    layoutParams() {
      let { height, width, positionY, positionX } = this.widget

      return {
        h: height,
        w: width,
        x: positionX,
        y: positionY,
      }
    },
    hideBorder() {
      let { insideGroup, widgetName } = this
      return NO_BORDER_HASH.includes(widgetName) || insideGroup
    },
  },
  methods: {
    interWidgetCom(widgetType, payload) {
      let { widgetType: fromWidgetsType, id } = this.widget
      let payloadObj = {
        from: {
          widgetType: fromWidgetsType,
          id,
        },
        payload,
      }
      eventBus.$emit(widgetType, payloadObj)
    },
    isContentOverflowed(bufferHeight = 0) {
      let fullHeight = this.getContentHeight()
      let content = this.$el
      let headerHeight = this.$refs['header-portal']?.$el?.scrollHeight || 0
      let footerHeight = this.$refs['footer-portal']?.$el?.scrollHeight || 0
      let { offsetHeight = Infinity } = content || {}
      let totalSpace = offsetHeight - footerHeight - headerHeight + bufferHeight
      return fullHeight > totalSpace
    },
    fitToViewArea() {
      if (this.isFixedType) return
      this.$emit('fitToViewArea', this.finId, this.finName)
    },
    getContentHeight() {
      let height = null
      let content = this.$refs['fcard-body']?.$el
      if (isFunction(this.contentHeight)) {
        height = this.contentHeight()
      } else if (content) {
        height = content.scrollHeight
      }
      return height
    },
    fitMyContent() {
      if (this.isFixedType) return
      let { finId, finName } = this
      let height = this.getContentHeight()
      let headerHeight = this.$refs['header-portal']?.$el?.scrollHeight || 0
      let footerHeight = this.$refs['footer-portal']?.$el?.scrollHeight || 0
      height = height + headerHeight + footerHeight + 16

      this.resizeWidgetOnPage(finId, finName, {
        h: height,
      })
    },
    footerChange(param) {
      let { passengers } = param
      if (!isFunction((passengers || [])[0])) {
        return
      }
      let vNode = (passengers || [])[0]()
      let scrollHeight = dlv(vNode, '0.elm.scrollHeight') || 0
      if (!isEmpty(scrollHeight) && scrollHeight !== 0) {
        this.showFooterDivider = true
      }
    },
    resizeWidget(params) {
      if (this.isFixedType) return
      let { cellHeight, cellWidth, finId, finName } = this
      let { h, w, height, width } = params || {}
      let headerHeight = 0,
        footerHeight = 0
      setTimeout(() => {
        headerHeight = this.$refs['header-portal']?.$el?.scrollHeight || 0
        footerHeight = this.$refs['footer-portal']?.$el?.scrollHeight || 0
        let dimensions = {}
        if (isNullOrUndefined(h) && isNullOrUndefined(w)) {
          dimensions.h = height + headerHeight + footerHeight + 16
          dimensions.w = width
        } else {
          let { h: extraHeight } = this.calculateDimensions({
            height: headerHeight + footerHeight + 16,
          })
          h = h + extraHeight
          Object.entries({ w, h }).forEach(([key, value]) => {
            let unitArr = {
              w: cellWidth,
              h: cellHeight,
            }
            if (Math.sign(value) !== 1) return
            dimensions[key] = value * unitArr[key]
          })
        }

        this.resizeWidgetOnPage(finId, finName, dimensions)
      })
    },
    calculateDimensions(params) {
      let { height, width } = params
      let { cellHeight, cellWidth } = this
      let reHeight = Math.ceil(height / cellHeight)
      let reWidth = Math.ceil(width / cellWidth)
      return { w: reWidth, h: reHeight }
    },
  },
}
</script>
<style lang="scss" scoped>
.title-section-ws {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.portal-alignment-ws {
  display: flex;
  align-items: center;
  // min-height: 48px;
  &.action-ws {
    margin-right: 12px;
  }
}
.empty-widget-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-weight: 500;
  text-transform: uppercase;
}
.header-part {
  .header-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    padding: 10px;
  }
}
.widget-container {
  height: 100%;
  width: 100%;
  position: relative;
  background-color: #fff;
}
</style>
