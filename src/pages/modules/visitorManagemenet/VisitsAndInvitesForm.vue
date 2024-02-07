<template>
  <FContainer>
    <InviteCodeForm
      v-if="otpVisibility"
      @openVisitsForm="openVisitsForm"
      @onClose="closeForm"
    ></InviteCodeForm>
    <VisitsLogForm
      v-else
      :showInviteCode="isVisitModule"
      :moduleName="moduleName"
      @loadForm="openForm"
      @openInviteCode="openInviteCode"
      @onClose="closeForm"
    ></VisitsLogForm>
  </FContainer>
</template>
<script>
import { findRouteForModule, pageTypes } from '@facilio/router'
import InviteCodeForm from './InviteCodeForm.vue'
import VisitsLogForm from './VisitsLogForm.vue'
import { FContainer } from '@facilio/design-system'

export default {
  props: ['moduleName', 'formMode'],
  components: {
    InviteCodeForm,
    VisitsLogForm,
    FContainer,
  },
  data() {
    return {
      otpVisibility: false,
    }
  },
  computed: {
    isVisitModule() {
      return this.moduleName === 'visitorlog'
    },
  },
  methods: {
    openInviteCode() {
      this.$nextTick(() => (this.otpVisibility = true))
    },
    openVisitsForm(params = {}) {
      let { name } = findRouteForModule('visitorlog', pageTypes.CREATE)
      let { invitevisitorId, visitorTypeId } = params
      let query = {
        inviteVisitorId: invitevisitorId,
        visitorTypeId: visitorTypeId,
      }
      if (name) {
        this.$router.push({ name, query })
      }
    },
    openForm(visitorType = {}) {
      let { visitorFormId, id } = visitorType
      let { formMode, moduleName } = this
      let query = {
        visitorTypeId: id,
        formId: visitorFormId,
      }
      if (formMode === 'bulk') moduleName = 'groupinvite'
      let { name } = findRouteForModule(moduleName, pageTypes.CREATE)

      if (name) {
        if (formMode) {
          query = { ...query, formMode }
        }

        this.$router.push({ name, query })
      }

      this.closeForm()
    },
    closeForm() {
      this.$emit('onClose')
    },
  },
}
</script>
