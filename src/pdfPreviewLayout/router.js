export default [
  {
    name: 'pdfPreViewer',
    path: '/:appName/pdftemplate/preview/:moduleName/:recordId',
    props: true,
    meta: {
      requiresAuth: true,
    },
    component: () => import('./pages/Layout.vue'),
    children: [
      {
        path: '',
        props: true,
        component: () => import('./pages/PdfPreviewComponent.vue'),
      },
    ],
  },
]
