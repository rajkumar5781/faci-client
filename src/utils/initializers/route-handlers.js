const hasAppChanged = (to, from) => {
  // if App changed ie. from /agent to /app, then reload whole page
  let isLogout = to.name === 'logout'

  let appNameRegex = /\/([a-zA-Z]*)\/?/
  let fromApp = new RegExp(appNameRegex).exec(from.fullPath)[1]
  let toApp = new RegExp(appNameRegex).exec(to.fullPath)[1]

  return !isLogout && !isEmpty(fromApp) && !isEmpty(toApp) && fromApp !== toApp
}

const setWebTab = async to => {
  const webtabStore = webtabs()
  if (isWebTabsEnabled()) {
    let meta = getTabInfo(to) || {}

    if (meta.groupId) {
      await webtabStore.setTabGroup(meta.groupId)
    } else {
      await webtabStore.setTabGroup(null)
    }

    if (meta.tabId) {
      await webtabStore.setTab(meta.tabId)
    }
  } else {
    return Promise.resolve()
  }
}

const routeHandler = router => {
  router.beforeEach((to, from, next) => {
    let toUrl = to?.fullPath || '/'
    let isErrorPage = toUrl.startsWith('/error')
    let shouldReload = hasAppChanged(to, from) && !isErrorPage

    if (shouldReload) {
      console.warn('Reloading page since app was changed')
      window.location.href = window.location.origin + to.fullPath
    }

    setWebTab(to)
    next()
  })
}

export default routeHandler
