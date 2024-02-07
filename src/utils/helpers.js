import dlv from 'dlv'
import Vue from 'vue'
import { getApp } from '@facilio/router'
import getProperty from 'dlv'

export default {
  logout(redirect, forceLogin) {
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
  },
  getAppDomain() {
    let {
      location: { protocol },
    } = window
    let app = getApp()
    let domain = getProperty(app, 'appDomain.domain', null)
    return `${protocol}//${domain}`
  },
}
export const isValidPhoneNumber = function (number) {
  let phoneno = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g
  if (number.match(phoneno)) {
    return true
  } else {
    return false
  }
}
export const execRegex = (str, regex, group = null) => {
  let result = []
  let match = regex.exec(str)
  while (match != null) {
    if (group) {
      result.push(match[group])
    } else {
      result.push(match)
    }
    match = regex.exec(str)
  }
  return result
}
export const cloneObject = obj => {
  return JSON.parse(JSON.stringify(obj))
}
