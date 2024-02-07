import { pageTypes } from '@facilio/router'
const { LIST, CREATE, EDIT } = pageTypes
const moduleName = 'amenity'
export default [
  {
    pageType: LIST,
    moduleName,
    component: () => import('./AmenityList.vue'),
  },
  {
    pageType: CREATE,
    moduleName,
    component: () => import('./AmenityForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName,
    component: () => import('./AmenityForm.vue'),
  },
]
