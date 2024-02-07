<template>
  <Error40X
    :errorCode="errorCode"
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
import { isEmpty } from '@facilio/utils/validation'
import ErrorMixin from './ErrorMixin'
import helpers from '../../utils/helpers'
import { FButton } from '@facilio/design-system'
import { getTolgee } from '../../utils/tolgee'

const $t = getTolgee().t

export default {
  components: { Error40X, FButton },
  mixins: [ErrorMixin],
  data() {
    return {
      errorCode: 429,
    }
  },
  computed: {
    getErrorMessage() {
      let { errMessage } = this
      if (!isEmpty(errMessage)) {
        return errMessage
      }
      return $t('pages.to-many-requst', {
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
