export default {
  components: {
    tenantdetailcontact: () =>
      import('./tenantWidgets/TenantPrimaryContactDetails.vue'),
    tenantdetailoverview: () =>
      import('./tenantWidgets/TenantDetailsWidget.vue'),
    tenantbookings: () => import('./tenantWidgets/TenantFacilityBooking.vue'),
    tenantupcomingbooking: () =>
      import('./tenantWidgets/TenantUpComingFacilityBooking.vue'),
    tenantworkorders: () => import('./tenantWidgets/TenantWorkorders.vue'),
    tenantrecentlyclosedworkorder: () =>
      import('./tenantWidgets/TenantRecentlyClosedWorkorder.vue'),
    tenantunittenant: () => import('./tenantUnitWidgets/TenantUnitTenant.vue'),
    tenantunitspecialwidget: () =>
      import('./tenantUnitWidgets/TenantUnitTenantHistory.vue'),
    tenantunitoverview: () =>
      import('./tenantUnitWidgets/TenantUnitInsightWidget.vue'),
    tenantunitworkorder: () =>
      import('./tenantUnitWidgets/TenantUnitWorkorders.vue'),
    tenantunitrecentlyclosedworkorder: () =>
      import('./tenantUnitWidgets/TenantUnitRecentlyClosedWorkorders.vue'),
    tenantContactRelatedListWidget: () =>
      import('./tenantWidgets/TenantContactRelatedList.vue'),
    tenantSpecialWidget: () =>
      import('./tenantWidgets/TenantUnitListWidget.vue'),
    tenantservicerequest: () =>
      import('./tenantWidgets/TenantServiceRequest.vue'),
    tenantunitlocation: () =>
      import('./tenantUnitWidgets/TenantUnitLocation.vue'),
  },
}
