import Vue from 'vue'

export const andOperatorOnLong = (permVal, totalPermVal) => {
  let hi = 0x80000000
  let low = 0x7fffffff
  let hi1 = ~~(permVal / hi)
  let hi2 = ~~(totalPermVal / hi)
  let low1 = permVal & low
  let low2 = totalPermVal & low
  let h = hi1 & hi2
  let l = low1 & low2
  return h * hi + l
}

export const logout = (redirect, forceLogin) => {
  Vue.cookie.delete('fc.currentSite')
  Vue.cookie.delete('fc.currentOrg')

  if (window.location.hostname == 'localhost') {
    let logoutURL = window.identityServerURL + '/logout'
    if (redirect) {
      logoutURL = logoutURL + '?redirect=' + encodeURIComponent(redirect)
    }
    window.location.href = logoutURL
  } else {
    let logoutURL = '/identity/logout'
    if (redirect) {
      logoutURL = logoutURL + '?redirect=' + encodeURIComponent(redirect)
    }
    window.location.href = logoutURL
  }
}
