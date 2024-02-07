<script>
import ModuleForm from '../../form/ModuleForm.vue'
import getProperty from 'dlv'
import { isEmpty, isFunction } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { findRouteForModule, pageTypes } from '@facilio/router'
export default {
  extends: ModuleForm,
  data() {
    return {
      isEmpty,
      isFunction,
      inviteVisitorRecord: {},
    }
  },
  async created() {
    let prom1 = this.init()
    let list = [prom1]
    if (this.isInviteModule) {
      let prom2 = this.getInviteVisitorRecord()
      list.push(prom2)
    }
    Promise.all(list)
  },
  computed: {
    visitorType() {
      let visitorTypeId =
        getProperty(this.$route, 'query.visitorTypeId') || null
      return { id: visitorTypeId }
    },
    inviteVisitorId() {
      return getProperty(this.$route, 'query.inviteVisitorId') || null
    },
    isInviteModule() {
      return this.inviteVisitorId != null
    },
    queryData() {
      if (this.isInviteModule) {
        return this.inviteVisitorRecord
      } else {
        let query = getProperty(this.$route, 'query') || {}
        let { formDetails } = query

        if (!isEmpty(formDetails)) {
          formDetails = JSON.parse(formDetails)
        } else {
          formDetails = query
        }

        return formDetails || {}
      }
    },
  },
  methods: {
    async getInviteVisitorRecord() {
      let params = {
        moduleName: 'invitevisitor',
        id: this.inviteVisitorId,
      }

      let { error, data } = await API.get('v3/modules/data/summary', params)
      if (error) {
        ftoast.critical(
          error?.message || this.$t('error_occurred', 'Error occured')
        )
      } else {
        this.moduleData = getProperty(data, 'invitevisitor') || {}
        this.inviteVisitorRecord = new this.modelDataClass(invitevisitor)
      }
    },
    async saveRecord(formModel) {
      let { formObj, visitorType, afterSaveHook, afterSerializeHook } = this

      this.isSaving = true
      let response
      if (this.isInviteModule) {
        let data = { ...formModel, visitorType, hasCheckedIn: true }
        response = await API.updateRecord('invitevisitor', {
          id: parseInt(this.inviteVisitorId),
          data,
        })
      } else {
        response = await this.moduleData.save(
          formObj,
          formModel,
          afterSerializeHook
        )
      }
      this.isSaving = false
      // Hook to handle notification after crud operation
      this.notificationHandler(response)

      // Hook to handle response after crud operation
      if (!isEmpty(afterSaveHook) && isFunction(afterSaveHook)) {
        this.afterSaveHook(response)
      }
    },
    afterSaveHook(response) {
      let { moduleName, isInviteModule } = this
      if (isInviteModule) {
        let { name } = findRouteForModule('visitorlog', pageTypes.LIST)
        name && this.$router.push({ name })
      } else {
        let { [moduleName]: data } = response
        let { id } = data
        this.redirectToSummary(id)
      }
    },
    afterSerializeHook({ data }) {
      let { visitorType } = this
      return { ...data, visitorType }
    },
  },
}
</script>
