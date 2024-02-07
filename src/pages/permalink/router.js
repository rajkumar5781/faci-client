export default [
  {
    name: 'go-to-summary',
    path: '/:app/goto/summary/:moduleName/:id',
    component: () => import('/src/pages/permalink/RedirctToSummary.vue'),
  },
]
