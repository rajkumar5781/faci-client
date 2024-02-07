export default {
  components: {
    calendarEventView: () => import('./CalendarView.vue'),
    calendarEventList: () => import('./EventsList.vue'),
    calendarAssociationList: () => import('./CalendarAssociation.vue'),
  },
}
