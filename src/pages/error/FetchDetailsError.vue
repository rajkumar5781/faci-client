<template>
  <Error40X
    :errorCode="errorCode"
    :description="getErrorMessage"
    :userMail="userDetails"
    :isPreRequired="true"
  >
    <template #action>
      <FButton @click="logout">{{ buttonText }}</FButton>
    </template></Error40X
  >
</template>
<script>
import Error40X from './Error40X.vue'
import Vue from 'vue'
import { FButton } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import ErrorMixin from './ErrorMixin'
import { getTolgee } from '../../utils/tolgee'

const $t = getTolgee().t

export default {
  mixins: [ErrorMixin],
  components: { Error40X, FButton },
  data() {
    return {}
  },
  computed: {
    userDetails() {
      let { $account } = this || {}
      let { user } = $account || {}
      let { email } = user || {}
      return email
    },
    getErrorMessage() {
      let { errMessage } = this
      if (!isEmpty(errMessage)) {
        return errMessage
      }
      return $t('pages.something-missing', {
        ns: 'error',
      })
    },
    errorCode() {
      let errorCode = getProperty(this, '$route.query.errorCode', '404')
      return errorCode
    },
    buttonText() {
      return $t('pages.logout', {
        ns: 'error',
      })
    },
  },
  methods: {
    logout() {
      Vue.cookie.delete('fc.currentSite')
      Vue.cookie.delete('fc.currentOrg')

      let loginURL = '/auth/login'

      API.get('/logout', null, { force: true })
        .then(() => {
          window.location.href = loginURL
        })
        .catch(error => {
          if (error) console.warn(error)
        })
    },
  },
}
</script>
