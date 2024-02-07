<script lang="jsx">
import { isEmpty } from '@facilio/utils/validation'
import ModuleList from '../../list/ModuleList.vue'
import CategoryList from '../asset/widgets/CategoryList.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { API } from '@facilio/api'
import getProperty from 'dlv'

export default {
  name: 'JobPlanList',
  props: ['moduleName'],
  extends: ModuleList,
  data() {
    return {
      showCategory: false,
      canShowCategoryDialog: false,
      canShowAssetCreation: false,
      openNewAsset: false,
      dataObj: null,
      categoryModuleName: null,
    }
  },
  methods: {
    openCategoryList() {
      this.showCategory = true
      this.canShowCategoryDialog = true
    },
    closeCategoryForm() {
      this.showCategory = false
      this.canShowCategoryDialog = false
    },
    async editModule(record) {
      let { moduleName } = this
      let { group, jobPlanVersion: version } = record || {}
      let groupId = getProperty(group, 'id', null)
      version = `v${version}`
      let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
      name &&
        this.$router.push({
          name,
          params: { id: groupId },
          query: { jpversion: version },
        })
    },
    redirectToOverview(record) {
      let { moduleName, viewname, $route } = this
      let { group, jobPlanVersion: version } = record || {}
      let { query } = $route
      let groupId = getProperty(group, 'id', null)
      version = `v${version}`

      delete query.tabName //to remove preserved tabName from pageBuilder

      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      let route = {
        name,
        params: { viewname, id: groupId, moduleName },
        query: { jpversion: version },
      }

      this.$router.push(route)
    },
  },
  mainFieldClickAction(record, e) {
    this.redirectToOverview(record)
    e.preventDefault()
  },
  mainFieldRedirection({ record, value }) {
    console.log(record, 'record')
    let { routeName, viewname } = this
    let { id = null } = record || {}

    if (routeName) {
      let route = this.$router.resolve({
        name: routeName,
        params: { viewname, id },
      }).href

      return {
        url: route,
        text: value,
        id,
        clickAction: (field, e) => this.mainFieldClickAction(record, e),
        ...value,
      }
    }
  },
}
</script>
