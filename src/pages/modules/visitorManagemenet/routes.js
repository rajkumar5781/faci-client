import { pageTypes } from '@facilio/router'
const { OVERVIEW, LIST, CREATE, EDIT } = pageTypes
export default [
  {
    pageType: LIST,
    moduleName: 'groupinvite',
    component: () => import('./GroupInviteList.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'invitevisitor',
    component: () => import('./VisitorList.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'visitorlog',
    component: () => import('./VisitorList.vue'),
  },
  {
    pageType: CREATE,
    moduleName: 'watchlist',
    component: () => import('./WatchListCreation.vue'),
  },
  {
    pageType: LIST,
    moduleName: 'watchlist',
    component: () => import('./WatchList.vue'),
  },
  {
    pageType: CREATE,
    moduleName: 'invitevisitor',
    component: () => import('./VisitorForms.vue'),
  },
  {
    pageType: CREATE,
    moduleName: 'visitorlog',
    component: () => import('./VisitsForms.vue'),
  },
  {
    pageType: CREATE,
    moduleName: 'groupinvite',
    component: () => import('./GroupInviteFormLayout.vue'),
  },
  {
    pageType: EDIT,
    moduleName: 'groupinvite',
    component: () => import('./GroupInviteFormLayout.vue'),
  },
]
