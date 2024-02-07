export default [
  {
    name: 'workflowEditor',
    path: '/:appName/workflow',
    props: true,
    component: () => import('./WorkflowEditor.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: 'subDomainWorkflowEditor',
    path: '/:orgSubDomain/:appName/workflow',
    props: true,
    component: () => import('./WorkflowEditor.vue'),
    meta: {
      requiresAuth: false,
    },
  },
]
