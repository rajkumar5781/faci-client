<script>
import ModuleForm from '../../form/ModuleForm.vue'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { findRouteForModule, pageTypes } from '@facilio/router'

export default {
  extends: ModuleForm,
  name: 'JobPlanForm',
  data: () => ({ dataId: null }),
  computed: {
    isV3Api() {
      return true
    },
    groupId() {
      let { $route } = this
      let { params } = $route || {}
      let { id } = params || {}

      return !isEmpty(id) ? parseInt(id) : null
    },
    version() {
      let { $route } = this
      let { query } = $route || {}
      let version = getProperty(query, 'jpversion', '')

      version = version.slice(1)
      return !isEmpty(version) ? parseInt(version) : null
    },
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      let { moduleName } = this
      this.isLoading = true
      await this.initJP()
      await this.loadFormsList(moduleName)
      if (!isEmpty(this.dataId)) {
        await this.loadModuleData({
          moduleName,
          moduleDataId: this.dataId,
        })
      } else {
        this.moduleData = new this.modelDataClass({
          moduleName,
          ...(this.dataObj || {}),
        })
      }
      this.setInitialForm()

      this.isLoading = false
    },
    async initJP() {
      let { groupId, version } = this
      let params = { groupId, jobPlanVersion: version }
      if (!isEmpty(groupId) && !isEmpty(version)) {
        let { error, data } = await API.get('v3/jobPlan/getJobPlanId', params)

        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          let { result } = data || {}
          this.dataId = result
        }
      }
    },
    redirectToList() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}
      name &&
        this.$router.push({
          name,
        })
    },
    afterSaveHook(response) {
      let { moduleName } = this
      let { [moduleName]: data } = response

      this.redirectToSummary(data)
    },
    redirectToSummary(jobplan) {
      let { moduleName, viewname } = this
      let { group, jobPlanVersion: version } = jobplan || {}
      let groupId = getProperty(group, 'id', null)

      version = `v${version}`
      let params = {
        viewname: !isEmpty(viewname) ? viewname : 'all',
        id: groupId,
      }

      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      name &&
        this.$router.push({
          name,
          params,
          query: { jpversion: version },
        })
    },
  },
}
</script>
