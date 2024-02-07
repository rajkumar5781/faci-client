<template>
  <Error40X
    :errorCode="errorCode"
    :title="errorText"
    :description="getErrorMessage"
    :isPreRequired="true"
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
    errorText() {
      return $t('pages.ah-oh', {
        ns: 'error',
      })
    },
    getErrorMessage() {
      return $t('pages.not-authorized', {
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
  },
}
</script>
