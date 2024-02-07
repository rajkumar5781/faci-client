<template>
  <Error40X
    :errorCode="errorCode"
    :title="errorText"
    :description="getErrorMessage"
    :isPreRequired="true"
  >
    <template #action>
      <FButton v-if="canGoBack" @click="goBack">{{ buttonText }}</FButton>
    </template></Error40X
  >
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { FButton } from '@facilio/design-system'
import ErrorMixin from './ErrorMixin'
import Error40X from './Error40X.vue'
import { getTolgee } from '../../utils/tolgee'

const $t = getTolgee().t
export default {
  mixins: [ErrorMixin],
  data() {
    return {
      errorCode: 404,
      canGoBack: window.history.length > 1,
    }
  },
  computed: {
    getErrorMessage() {
      let { errMessage } = this
      if (!isEmpty(errMessage)) {
        return errMessage
      }
      return $t('pages.page-not-exist', {
        ns: 'error',
      })
    },
    errorText() {
      return $t('pages.something-missing', {
        ns: 'error',
      })
    },
    buttonText() {
      return $t('pages.go-back', {
        ns: 'error',
      })
    },
  },
  components: { Error40X, FButton },
  methods: {
    goBack() {
      window.history.go(-1)
    },
  },
}
</script>
