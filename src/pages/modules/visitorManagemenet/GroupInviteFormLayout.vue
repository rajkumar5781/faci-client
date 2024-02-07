<template>
  <MicroEmbed
    v-if="url"
    ref="groupInviteForm"
    name="facilio-client"
    :url="url"
    @GroupInviteFormClose="handleEvents"
    @GroupInviteFormCancel="redirectToOverview"
    class="group-invite-full-screen"
  />
</template>

<script>
import MicroEmbed from '../../../components/micro-embed/MicroEmbed.vue'
import { FContainer } from '@facilio/design-system'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, getApp, pageTypes } from '@facilio/router'

const env = import.meta.env

export default {
  props: ['moduleName', 'viewname'],
  components: { FContainer, MicroEmbed },
  data() {
    return {
      handlers: {},
    }
  },
  computed: {
    url() {
      let { linkName } = getApp()
      let orgSubDomain = window.addOrgDomainInRootPath
        ? window.location.pathname.slice(1).split('/')[0]
        : null

      let url = `legacy/${
        orgSubDomain ? `${orgSubDomain}/` : ''
      }${linkName}/iframe/groupinvite/${this.getPath()}`

      if (env.MODE === 'development') {
        return `${env.VITE_BASE_URL}/${url}`
      } else {
        return `/${url}`
      }
    },
    isEditForm() {
      let recordId = getProperty(this.$route.params, 'id') || null
      return !isEmpty(recordId)
    },
    getRecordId() {
      let recordId = getProperty(this.$route.params, 'id') || null
      return recordId
    },
    getFormId() {
      let formId = getProperty(this.$route.query, 'formId') || null
      return formId
    },
    getVisitorType() {
      let visitorType = getProperty(this.$route.query, 'visitorTypeId') || null
      return visitorType
    },
  },
  methods: {
    handleEvents(obj) {
      let { id } = obj || {}
      this.redirectToOverview(id)
    },
    redirectToOverview(recordId) {
      let { moduleName, viewname } = this
      if (isEmpty(viewname)) {
        viewname = 'all'
      }
      let params = {
        viewname,
      }
      if (!isEmpty(recordId)) {
        params = { ...params, id: recordId }
      }
      let { name } =
        findRouteForModule(
          moduleName,
          isEmpty(recordId) ? pageTypes.LIST : pageTypes.OVERVIEW
        ) || {}
      if (!isEmpty(name)) {
        this.$router.push({ name, params })
      }
    },
    getPath() {
      let path = ''
      let { isEditForm, getRecordId, getFormId, getVisitorType } = this
      if (isEditForm) {
        path =
          `${getRecordId}/edit?formId=` +
          getFormId +
          '&visitorTypeId=' +
          getVisitorType +
          '&formMode=bulk'
      } else {
        path =
          'new?formId=' +
          getFormId +
          '&visitorTypeId=' +
          getVisitorType +
          '&formMode=bulk'
      }
      return path
    },
  },
}
</script>
<style lang="scss">
.group-invite-full-screen {
  width: 100vw;
  position: absolute;
  left: 0;
  top: 0;
}
</style>
