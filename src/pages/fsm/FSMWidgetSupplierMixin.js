export default {
  components: {
    // service-order
    serviceTaskWidget: () =>
      import('./serviceorder/widgets/ServiceOrderTasks.vue'),
    serviceOrderAppointments: () =>
      import('./serviceorder/widgets/ServiceOrderAppointments.vue'),
    serviceOrderPlans: () => import('./inventory/PlansList.vue'),
    serviceOrderActuals: () => import('./inventory/ActualsList.vue'),

    // service-appointment
    serviceAppointmentServiceTasks: () =>
      import('./service-appointment/widgets/ServiceAppointmentTasks.vue'),
    serviceAppointmentPlans: () => import('./inventory/PlansList.vue'),
    serviceAppointmentActuals: () => import('./inventory/ActualsList.vue'),
    serviceAppointmentTimesheet: () =>
      import('./service-appointment/widgets/ServiceAppointmentTimesheet.vue'),
    serviceAppointmentTrip: () =>
      import('./service-appointment/widgets/ServiceAppointmentTrip.vue'),

    // territory
    territorySites: () => import('./territory/widgets/TerritorySites.vue'),
    fieldAgents: () => import('./territory/widgets/TerritoryFieldAgents.vue'),
    geography: () => import('./territory/widgets/TerritoryGeography.vue'),

    // timesheet
    timeSheetTasks: () => import('./timesheet/widgets/TimesheetTasks.vue'),

    // employee
    lastKnownLocation: () =>
      import('./employee/widgets/EmployeeLastKnownLocation.vue'),
    currentStatus: () => import('./employee/widgets/EmployeeCurrentStatus.vue'),
    skill: () => import('./employee/widgets/EmployeeSkills.vue'),
    workSchedule: () => import('./employee/widgets/EmployeeWorkSchedule.vue'),
    tripJourney: () => import('./trips/widgets/Journey.vue'),

    //Service PM
    servicePMServiceOrders: () =>
      import('./servicePM/widgets/ServicePMServiceOrders.vue'),
    servicePlanTasks: () => import('./servicePM/widgets/ServicePlanTasks.vue'),
    servicePlanInventory: () =>
      import('./servicePlan/widgets/ServicePlanInventory.vue'),
    servicePM: () => import('./pmTemplate/ServicePMList.vue'),
  },
}
