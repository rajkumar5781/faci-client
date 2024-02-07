<template>
  <router-view v-if="!isLoading"></router-view>
</template>
<script>
import Utils from '../../utils'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import Vue from 'vue'
export default {
  name: 'PdfPreviewViewer',
  data() {
    return {
      loginRequired: false,
      account: {},
      isLoading: true,
    }
  },
  created() {
    this.loadUtils()
  },
  methods: {
    async loadUtils() {
      this.isLoading = true
      let account = await this.fetchAccount()
      Vue.use(Utils, { account })
      this.isLoading = false
    },
    async fetchAccount() {
      let { data, error } = await API.get('/v2/fetchAccount')
      if (error) {
        this.loginRequired = true
      } else {
        let { account } = data || {}
        if (!isEmpty(account)) {
          this.loginRequired = false
          this.account = account
          window.orgId = getProperty(account, 'org.id', null)
          window.userId = getProperty(account, 'user.id', null)
          return account
        } else {
          this.loginRequired = true
        }
        return
      }
    },
  },
}
</script>
