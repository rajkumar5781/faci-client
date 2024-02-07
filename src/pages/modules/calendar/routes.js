import { pageTypes } from "@facilio/router";
const {CREATE,EDIT,LIST,OVERVIEW}=pageTypes
const moduleName='calendar'
export default[
  {
    pageType:CREATE,
    moduleName,
    component: () => import('./CalendarForm.vue'),
  },
  {
    pageType:EDIT,
    moduleName,
    component: () => import('./CalendarForm.vue'),
  },
]
