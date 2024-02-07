const Handlebars = require('handlebars')
const isDev = process.env.NODE_ENV === 'development'

function stringify(json) {
  // To make handlebars unescape the data. Used only in dev
  return new Handlebars.SafeString(JSON.stringify(json))
}

module.exports = {
  development: {
    staticURL: '',
    webpackPublicPath: '',
    title: 'Facilio',
    faviconURL: 'https://static.facilio.com/common/favicon.png',
    brandConfig: stringify({
      name: 'Facilio',
      legalName: 'Facilio Inc',
      logo: 'https://static.facilio.com/common/facilio-dark-logo.svg',
      logoLight: 'https://static.facilio.com/common/facilio-light-logo.svg',
      favicon: 'https://static.facilio.com/common/favicon.png',
      website: 'www.facilio.com',
      copyright: 'Facilio Inc &copy; 2023',
    }),
    dataDogClientId: 'pubb065ce5aa6a0cf51468ac84be3072f15',
    identityServerURL:
      process.env.VITE_BASE_URL || 'https://stage.facilio.in/identity',
    isGoogleAnalytics: false,
    addOrgDomainInRootPath: false,
    requestHeaders: stringify({}),
  },
  production: {
    staticURL: '{{staticURL}}',
    webpackPublicPath: '{{webpackPublicPath}}',
    title: '{{title}}',
    faviconURL: '{{faviconURL}}',
    brandConfig: '{{brandConfig}}',
    dataDogClientId: '{{dataDogClientId}}',
    identityServerURL: '{{identityServerURL}}',
    isGoogleAnalytics: '{{isGoogleAnalytics}}',
    addOrgDomainInRootPath: '{{addOrgDomainInRootPath}}',
    requestHeaders: '{{requestHeaders}}',
  },
}
