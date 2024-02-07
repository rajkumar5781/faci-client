import { pageTypes, DEFAULT } from '@facilio/router'

export default [
  {
    pageType: pageTypes.PORTFOLIO_SUMMARY,
    moduleName: DEFAULT,
    component: () => import('../portfolio/widgets/PortfolioDefaultLayout.vue'),
  },
  {
    pageType: pageTypes.PORTFOLIO_CREATE,
    moduleName: DEFAULT,
    component: () => import('../portfolio/BaseSpaceForm.vue'),
  },
  {
    pageType: pageTypes.PORTFOLIO_LIST,
    moduleName: 'site',
    component: () => import('../portfolio/PortfolioHome.vue'),
  },
  {
    pageType: pageTypes.PORTFOLIO_VIEWS,
    moduleName: DEFAULT,
    component: () => import('../portfolio/components/PortfolioViewManager.vue'),
  },
  {
    pageType: pageTypes.PORTFOLIO_VIEW_CREATION,
    moduleName: DEFAULT,
    component: () =>
      import('../portfolio/components/PortfolioViewCreationForm.vue'),
  },
  {
    pageType: pageTypes.PORTFOLIO_EDIT,
    moduleName: DEFAULT,
    component: () => import('../portfolio/BaseSpaceForm.vue'),
  },
  {
    pageType: pageTypes.OVERVIEW,
    moduleName: 'site',
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import(
            '../../../pages/modules/portfolio/widgets/BaseSpaceOverview.vue'
          ),
      },
    ],
  },
  {
    pageType: pageTypes.OVERVIEW,
    moduleName: 'building',
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import(
            '../../../pages/modules/portfolio/widgets/BaseSpaceOverview.vue'
          ),
      },
    ],
  },
  {
    pageType: pageTypes.OVERVIEW,
    moduleName: 'floor',
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import(
            '../../../pages/modules/portfolio/widgets/BaseSpaceOverview.vue'
          ),
      },
    ],
  },
  {
    pageType: pageTypes.OVERVIEW,
    moduleName: 'space',
    component: () => import('../../../pages/list/ModuleList.vue'),
    children: [
      {
        path: '',
        component: () =>
          import(
            '../../../pages/modules/portfolio/widgets/BaseSpaceOverview.vue'
          ),
      },
    ],
  },
]
