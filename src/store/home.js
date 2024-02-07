import { defineStore } from 'pinia'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'

const home = defineStore('home', {
  state: () => ({
    loginRequired: false,
    account: null,
    features: null,
    unseenCount: null,
  }),
  actions: {
    async fetchAccount() {
      let { data, error } = await API.get('/v2/fetchAccount')
      if (error) {
        console.warn('Unable to fetch account details')
        this.loginRequired = true
      } else {
        let { account } = data || {}
        if (!isEmpty(account)) {
          this.loginRequired = false
          this.account = account
          window.orgId = getProperty(account, 'org.id', null)
          window.orgGroupName = getProperty(account, 'org.groupName', null)
          window.userId = getProperty(account, 'user.id', null)
          return account
        } else {
          this.loginRequired = true
        }
        return
      }
    },
    async fetchLicense() {
      let response = await API.get('v2/features')
      this.features = getProperty(response, 'data.features')
    },
    async setLoginRequired(val) {
      console.log(val)
      this.loginRequired = val
    },
    async fetchUnseenNotificationCount() {
      let { meta, error } = await API.fetchAll('usernotification', {
        withCount: true,
        unseen: true,
        page: 1,
        perPage: 1,
      })
      if (!error) {
        this.unseenCount = meta?.pagination?.totalCount
      }
    },
  },
})

export default home
