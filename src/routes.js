import { pageTypes, DEFAULT } from '@facilio/router'
import dashboardRoutes from './pages/dashboard/routes'
import analyticsRoutes from './pages/analytics/routes'
import connectedAppRoutes from './pages/connectedapp/routes'
import fsmRoutes from './pages/fsm/routes'
import shiftRoutes from './pages/shift/routes'
import attendanceRoutes from './pages/attendance/routes'

import inspectionRoutes from './pages/modules/inspection/router'
import inductionRoutes from './pages/modules/induction/router'
import meterRoutes from './pages/modules/meter/routes'
import remoteMonitoringRoutes from './pages/remotemonitor/routes.js'
import calendarEventRoutes from './pages/modules/event/routes'
import calendarRoute from './pages/modules/calendar/routes'
import controlActionRoute from './pages/modules/controlAction/routes'
import controlActionTemplateRoute from './pages/modules/controlActionTemplate/routes'

import readingRuleRoutes from './pages/modules/readingrule/routes'
import alarmRoutes from './pages/modules/alarm/routes'
import receivableRoutes from './pages/modules/receivables/routes'
import purchaseOrderRoutes from './pages/modules/purchaseOrder/routes'
import purchaseRequestRoutes from './pages/modules/purchaseRequest/routes'
import transferRequestRoutes from './pages/modules/transferRequest/routes'
import safePlanRoutes from './pages/modules/safetyPlan/routes'
import WorkPermitRoutes from './pages/modules/workPermit/routes'
import rfqRoutes from './pages/modules/Rfq/routes'
import jobPlanRoutes from './pages/modules/jobplan/routes'

import kpiRoutes from './pages/modules/kpi/routes'
import portfolioRoutes from './pages/modules/portfolio/routes'

import utilityDisputeRoutes from './pages/modules/utilityDispute/routes.js'
import utilityIntegrationBillRoutes from './pages/modules/utilityIntegrationBills/routes.js'
import utilityIntegrationCustomerRoutes from './pages/modules/utilityIntegrationCustomer/routes.js'
import utilityIntegrationTariffRoutes from './pages/modules/utilityIntegrationTariff/routes.js'
import visitorModuleRoutes from './pages/modules/visitorManagemenet/routes'
import clientModuleRoutes from './pages/modules/client/routes'

import itemRoutes from './pages/modules/inventory/Item/routes'
import toolRoutes from './pages/modules/inventory/tool/routes'

import storeRoomRoutes from './pages/modules/inventory/storeroom/routes'

import virtualMeterTemplateRoutes from './pages/modules/virtualMeterTemplate/routes'
import WorkflowRoutes from './pages/workflow/router'
import quoteRoutes from './pages/modules/quotes/routes'
import inventoryRoutes from './pages/modules/inventory/routes'
import serviceRequestRoutes from './pages/modules/servicerequest/routes'
import amenityRoutes from './pages/modules/amenity/routes'
import ServiceCatalogRoutes from './pages/modules/servicecatalog/routes'
import vendorQuotesRoutes from './pages/modules/vendorquotes/routes'
import tenantContactRoutes from './pages/modules/tenantContact/routes'
import vendorContactRoutes from './pages/modules/vendorContact/routes'
import FacilityRoutes from './pages/modules/facility/routes'
import BookingRoutes from './pages/modules/booking/routes'
import plannedMaintenanceRoutes from './pages/modules/planned-maintenance/route.js'
import workorderRoutes from './pages/modules/workorder/routes'
import TermsAndConditionsRoutes from './pages/modules/termsAndConditions/routes.js'
import ApprovalRoutes from './pages/Approvals/routes.js'
import readingKpiRoutes from './pages/modules/readingkpi/routes'
import SummaryRedirection from '/src/pages/permalink/router.js'
import InvoiceRoutes from './pages/modules/invoice/routes'
import SurveyRoutes from './pages/modules/survey/routes'
import InventoryRequestRoutes from './pages/modules/inventory/inventoryrequest/routes'

const { APP_HOME, LIST, OVERVIEW, CREATE, EDIT, VIEW_MANAGER, VIEW_CREATION } =
  pageTypes

const routes = [
  {
    pageType: LIST,
    moduleName: DEFAULT,
    component: () => import('./pages/list/ModuleList.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName: DEFAULT,
    component: () => import('./pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./pages/summary/ModuleSummary.vue'),
      },
    ],
  },
  {
    pageType: CREATE,
    moduleName: DEFAULT,
    component: () => import('./pages/form/ModuleForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: DEFAULT,
    component: () => import('./pages/form/ModuleForm.vue'),
  },
  {
    pageType: VIEW_MANAGER,
    moduleName: DEFAULT,
    component: () => import('./pages/view/ViewManagerLayout.vue'),
  },
  {
    pageType: VIEW_CREATION,
    moduleName: DEFAULT,
    component: () => import('./pages/view/ViewCreationForm.vue'),
  },
  //asset
  {
    pageType: CREATE,
    moduleName: 'asset',
    component: () => import('./pages/modules/asset/AssetForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'asset',
    component: () => import('./pages/modules/asset/AssetForm.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'asset',
    component: () => import('./pages/modules/asset/AssetList.vue'),
  },

  //budget
  {
    pageType: CREATE,
    moduleName: 'budget',
    component: () => import('./pages/modules/budget/BudgetForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'budget',
    component: () => import('./pages/modules/budget/BudgetForm.vue'),
  },

  //budget - accounttype
  {
    pageType: CREATE,
    moduleName: 'accounttype',
    component: () =>
      import('./pages/modules/budget/accountType/AccountTypeForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'accounttype',
    component: () =>
      import('./pages/modules/budget/accountType/AccountTypeForm.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'accounttype',
    component: () =>
      import('./pages/modules/budget/accountType/AccountTypeList.vue'),
  },

  //budget - chartOfAccount
  {
    pageType: CREATE,
    moduleName: 'chartofaccount',
    component: () =>
      import('./pages/modules/budget/chartOfAccount/ChartOfAccountForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'chartofaccount',
    component: () =>
      import('./pages/modules/budget/chartOfAccount/ChartOfAccountForm.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'chartofaccount',
    component: () =>
      import('./pages/modules/budget/chartOfAccount/ChartOfAccountList.vue'),
  },

  {
    pageType: OVERVIEW,
    moduleName: 'asset',
    component: () => import('./pages/modules/asset/AssetList.vue'),
    props: route => {
      let { params = {} } = route || {}
      return {
        ...params,
      }
    },
    children: [
      {
        path: '',
        component: () => import('./pages/modules/asset/AssetSummary.vue'),
      },
    ],
  },

  {
    pageType: OVERVIEW,
    moduleName: 'tenant',
    component: () => import('./pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () => import('./pages/modules/tenant/TenantSummary.vue'),
      },
    ],
  },
  {
    pageType: OVERVIEW,
    moduleName: 'tenantunit',
    component: () => import('./pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import(
            './pages/modules/tenant/tenantUnitWidgets/TenantUnitSummary.vue'
          ),
      },
    ],
  },
  ...readingRuleRoutes,
  ...alarmRoutes,
  ...kpiRoutes,
  ...visitorModuleRoutes,
  ...vendorQuotesRoutes,
  ...clientModuleRoutes,
  ...tenantContactRoutes,
  ...vendorContactRoutes,
  ...jobPlanRoutes,
  ...itemRoutes,
  ...toolRoutes,
  ...storeRoomRoutes,
  ...plannedMaintenanceRoutes,
  ...ApprovalRoutes,
  ...readingKpiRoutes,
  ...InvoiceRoutes,
]

export default [
  {
    pageType: APP_HOME,
    appName: DEFAULT,
    layoutType: 1,
    component: () => import('./layouts/portal/PortalAppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      ...routes,
      ...dashboardRoutes,
      ...connectedAppRoutes,
      ...fsmRoutes,
      ...shiftRoutes,
      ...attendanceRoutes,
      ...analyticsRoutes,
      ...meterRoutes,
      ...calendarEventRoutes,
      ...calendarRoute,
      ...controlActionRoute,
      ...controlActionTemplateRoute,
      ...receivableRoutes,
      ...purchaseOrderRoutes,
      ...purchaseRequestRoutes,
      ...transferRequestRoutes,
      ...safePlanRoutes,
      ...rfqRoutes,
      ...utilityDisputeRoutes,
      ...utilityIntegrationBillRoutes,
      ...utilityIntegrationCustomerRoutes,
      ...utilityIntegrationTariffRoutes,
      ...virtualMeterTemplateRoutes,
      ...WorkflowRoutes,
      ...inventoryRoutes,
      ...serviceRequestRoutes,
      ...amenityRoutes,
      ...ServiceCatalogRoutes,
      ...quoteRoutes,
      ...FacilityRoutes,
      ...BookingRoutes,
      ...workorderRoutes,
      ...ApprovalRoutes,
      ...SummaryRedirection,
      ...SurveyRoutes,
      ...InventoryRequestRoutes,
      ...inspectionRoutes,
      ...inductionRoutes,
    ],
  },
  {
    pageType: APP_HOME,
    // This route will be used as the default app route for apps with layoutType as 2
    // unless explicity overriden using appName down below
    appName: DEFAULT,
    layoutType: 2,
    component: () => import('./layouts/main/MainAppLayout.vue'),
    meta: { requiresAuth: true },
    // The following components will be used to render default pages for tabs
    // unless explicity overriden by specifying criteria like moduleName
    children: [
      ...routes,
      ...dashboardRoutes,
      ...connectedAppRoutes,
      ...fsmRoutes,
      ...shiftRoutes,
      ...attendanceRoutes,
      ...inspectionRoutes,
      ...inductionRoutes,
      ...meterRoutes,
      ...analyticsRoutes,
      ...remoteMonitoringRoutes,
      ...calendarEventRoutes,
      ...calendarRoute,
      ...controlActionRoute,
      ...controlActionTemplateRoute,
      ...receivableRoutes,
      ...purchaseOrderRoutes,
      ...purchaseRequestRoutes,
      ...transferRequestRoutes,
      ...safePlanRoutes,
      ...rfqRoutes,
      ...utilityDisputeRoutes,
      ...utilityIntegrationBillRoutes,
      ...utilityIntegrationCustomerRoutes,
      ...utilityIntegrationTariffRoutes,
      ...virtualMeterTemplateRoutes,
      ...WorkflowRoutes,
      ...inventoryRoutes,
      ...serviceRequestRoutes,
      ...amenityRoutes,
      ...ServiceCatalogRoutes,
      ...portfolioRoutes,
      ...quoteRoutes,
      ...FacilityRoutes,
      ...BookingRoutes,
      ...WorkPermitRoutes,
      ...TermsAndConditionsRoutes,
      ...workorderRoutes,
      ...SummaryRedirection,
      ...SurveyRoutes,
      ...InventoryRequestRoutes,
    ],
  },
]
