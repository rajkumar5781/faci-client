import { pageTypes } from '@facilio/router'
const { OVERVIEW, CREATE, EDIT, LIST } = pageTypes
const moduleName = 'invoice'
export default [
  {
    pageType: CREATE,
    moduleName,
    component: () => import('./InvoiceForm.vue'),
  },
  {
    pageType: EDIT,
    moduleName,
    component: () => import('./InvoiceForm.vue'),
  },
  {
    pageType: LIST,
    moduleName,
    component: () => import('./InvoiceListPage.vue'),
  },
  {
    pageType: OVERVIEW,
    moduleName,
    component: () => import('./InvoiceListPage.vue'),
    props: route => {
      let { params = {} } = route || {}
      return {
        ...params,
      }
    },
    children: [
      {
        path: '',
        component: () => import('./InvoiceSummaryPage.vue'),
      },
    ],
  },
]
