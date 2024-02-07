<template>
  <div class="h-screen flex items-center justify-center">
    <FContainer margin="sectionMedium">
      <div class="m-auto" v-if="!signupFailed">
        <FSpinner class="m-auto" :size="50" />
        <div class="mt-6">
          Your {{ brandName }} account is being set up, please wait a moment.
        </div>
      </div>
      <div class="m-auto text-center" v-else>
        <FIcon
          group="action"
          name="cross-circle"
          :pressable="false"
          size="50"
        />
        <div class="mt-6">
          There was a problem setting up your {{ brandName }} account. Please
          contact our support team for help resolving this issue.
        </div>
      </div>
    </FContainer>
  </div>
</template>
<script>
import { FContainer, FSpinner, FIcon } from '@facilio/design-system'
import { API } from '@facilio/api'
let intervalInstance = null
export default {
  name: 'OrgSetup',
  components: {
    FContainer,
    FSpinner,
    FIcon,
  },
  data: () => ({
    signupCompleted: false,
    signupFailed: false,
  }),
  computed: {
    brandName() {
      return brandConfig.name
    },
  },
  mounted() {
    intervalInstance = setInterval(() => {
      if (!this.signupCompleted && !this.signupFailed) {
        API.get('/v2/orgsetup').then(({ data }) => {
          if (data) {
            if (data.status == 'completed') {
              this.signupCompleted = true
              window.location.href = '/'
            } else if (data.status == 'failed') {
              this.signupFailed = true
            }
          }
        })
      }
    }, 5000)
  },
  destroyed() {
    if (intervalInstance) {
      clearInterval(intervalInstance)
      intervalInstance = null
    }
  },
}
</script>
