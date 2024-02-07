<template>
  <Error40X
    :errorCode="errorCode"
    :title="errorText"
    :description="getErrorMessage"
    :userMail="userDetails"
    :isPreRequired="true"
    :customEvent="true"
    @onGoHome="goHome"
  >
    <template #action>
      <FButton @click="logout">{{ buttonText }}</FButton>
    </template></Error40X
  >
</template>
<script>
import Error40X from './Error40X.vue'
import helpers from '../../utils/helpers'
import { FButton } from '@facilio/design-system'
import Vue from 'vue'
import { isEmpty } from '@facilio/utils/validation'
import { getTolgee } from '../../utils/tolgee'

const $t = getTolgee().t
export default {
  components: { Error40X, FButton },
  data() {
    return {
      errorCode: 403,
    }
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
      return $t('pages.not-authorized', {
        ns: 'error',
      })
    },
    errorText() {
      return $t('pages.ah-oh', {
        ns: 'error',
      })
    },
    buttonText() {
      return $t('pages.logout', {
        ns: 'error',
      })
    },
  },
  methods: {
    logout() {
      helpers.logout(window.location.pathname, true)
    },
    goHome() {
      Vue.cookie.delete('lastvisit')
      let route = this.$router.resolve({ path: '/' })
      window.location.href = route?.href
    },
  },
}
</script>
