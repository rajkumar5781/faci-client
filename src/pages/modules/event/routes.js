import { pageTypes } from "@facilio/router";
const {CREATE,EDIT,LIST,OVERVIEW}=pageTypes
const moduleName='calendarEvent'
export default[
  {
    pageType:CREATE,
    moduleName,
    component: () => import('./CalenderEventForm.vue'),
  },
  {
    pageType:EDIT,
    moduleName,
    component: () => import('./CalenderEventForm.vue'),
  },
  {
    pageType:LIST,
    moduleName,
    component: () => import('./CalendarEventListPage.vue'),
  },
]
