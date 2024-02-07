import { Tolgee, DevTools, FormatSimple } from '@tolgee/web'

const TOLGEE_CONFIG = Symbol.for('@facilio/tolgee')

export const initTolgee = () => {
  const globalSymbols = Object.getOwnPropertySymbols(window)
  if (!globalSymbols.includes(TOLGEE_CONFIG)) {
    const tolgee = Tolgee()
      .use(DevTools())
      .use(FormatSimple())
      .init({
        language: 'en',
        defaultNs: 'common',
        // for development mode
        // apiUrl: 'https://tolgee.facilio.in'
        // apiKey: '<your tolgee API key>'
        // for production
        staticData: {
          'en:common': () => import('../translations/common/en.json'),
          'en:account': () => import('../translations/account/en.json'),
          'en:asset': () => import('../translations/asset/en.json'),
          'en:inspection': () => import('../translations/inspection/en.json'),
          'en:fsm': () => import('../translations/fsm/en.json'),
          'en:energy': () => import('../translations/energy/en.json'),
          'en:procurement': () => import('../translations/procurement/en.json'),
          'en:classification': () =>
            import('../translations/classification/en.json'),
          'en:servicerequest': () =>
            import('../translations/servicerequest/en.json'),

          //remote monitor
          'en:remote_monitor': () =>
            import('../translations/remote_monitor/en.json'),
          'en:rule': () => import('../translations/rule/en.json'),
          'en:alarm': () => import('../translations/alarm/en.json'),
          'en:tenant': () => import('../translations/tenant/en.json'),
          'en:inventory': () => import('../translations/inventory/en.json'),
          'en:facilitybooking': () =>
            import('../translations/facilitybooking/en.json'),
          'en:kpi': () => import('../translations/kpi/en.json'),
          'en:visitor': () => import('../translations/visitor/en.json'),
          'en:servicecatalog': () =>
            import('../translations/servicecatalog/en.json'),
          'en:vendor_quotes': () =>
            import('../translations/vendor_quotes/en.json'),
          'en:view': () => import('../translations/view/en.json'),
          'en:maintenance': () => import('../translations/maintenance/en.json'),
          'en:budget': () => import('../translations/budget/en.json'),
          'en:portfolio': () => import('../translations/portfolio/en.json'),
          'en:approvals': () => import('../translations/approvals/en.json'),
          'en:invoice': () => import('../translations/invoice/en.json'),
          'en:error': () => import('../translations/error/en.json'),
          'en:attendance': () => import('../translations/attendance/en.json')
        },
      })
    tolgee.run()
    tolgee.addActiveNs('account')
    tolgee.addActiveNs('asset')
    tolgee.addActiveNs('energy')
    tolgee.addActiveNs('fsm')
    tolgee.addActiveNs('energy')
    tolgee.addActiveNs('classification')
    tolgee.addActiveNs('servicerequest')
    tolgee.addActiveNs('remote_monitor')
    tolgee.addActiveNs('rule')
    tolgee.addActiveNs('alarm')
    tolgee.addActiveNs('tenant')
    tolgee.addActiveNs('inventory')
    tolgee.addActiveNs('facilitybooking')
    tolgee.addActiveNs('kpi')
    tolgee.addActiveNs('procurement')
    tolgee.addActiveNs('visitor')
    tolgee.addActiveNs('servicecatalog')
    tolgee.addActiveNs('vendor_quotes')
    tolgee.addActiveNs('view')
    tolgee.addActiveNs('maintenance')
    tolgee.addActiveNs('budget')
    tolgee.addActiveNs('portfolio')
    tolgee.addActiveNs('inspection')
    tolgee.addActiveNs('approvals')
    tolgee.addActiveNs('invoice')
    tolgee.addActiveNs('error')
    tolgee.addActiveNs('attendance')

    window[TOLGEE_CONFIG] = tolgee
  }
}

export const getTolgee = () => {
  return window[TOLGEE_CONFIG]
}
