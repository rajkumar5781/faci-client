<template>
  <div v-if="visible && !isEmpty(catalogItem)">
    <catalog-request-form
      :moduleName="getModuleName"
      :recordId="catalogItem.id"
      :formId="getFormId"
      :record="catalogItem"
      :isExternalModule="false"
      :closeAction="handleCancel"
      :approvalRule="null"
      :isV3="true"
      :formSubject="getFormSubject"
      :catalogItem="catalogItem"
      @saveRecord="saveRecord"
    ></catalog-request-form>
  </div>
</template>
<script>
import { ftoast } from '@facilio/design-system'
import CatalogRequestForm from './CatalogRequestForm.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import CatalogMixin from './CatalogMixin.vue'
import { findRouteForModule, pageTypes } from '@facilio/router'

export default {
  props: ['catalogItem', 'visible'],
  mixins: [CatalogMixin],
  components: {
    CatalogRequestForm,
    ftoast,
  },
  data() {
    return {
      isEmpty,
    }
  },
  computed: {
    getModuleName() {
      let { catalogItem = {} } = this
      let { module = {} } = catalogItem
      let { name } = module
      return name
    },
    getFormSubject() {
      let { catalogItem = {} } = this
      let { module = {} } = catalogItem
      let { displayName } = module
      return displayName
    },
    getFormId() {
      let { catalogItem = {} } = this
      let { formId, form = {} } = catalogItem
      if (isEmpty(formId)) {
        let { id } = form
        return id
      }
      return formId
    },
  },
  methods: {
    handleCancel() {
      this.$emit('closeCatalogRequest', true)
    },
    async saveRecord(params = {}) {
      let { formObj = {}, data = {} } = params
      let moduleName = this.getModuleFromFormObj(formObj)
      let { error, [moduleName]: record } = await API.createRecord(moduleName, {
        data,
      })
      if (isEmpty(error)) {
        ftoast.success(
          this.$t('catalog.record_created_successfully', {
            ns: 'servicecatalog',
          })
        )
        this.redirectToRecord(record, moduleName)
      } else {
        ftoast.critical(this.$t(error?.message) || this.$t('error_occurred'))
      }
      this.handleCancel()
    },
    redirectToRecord(record = {}, moduleName) {
      let { id } = record

      let { viewname = 'all', $route } = this
      let { query } = $route

      delete query.tabName

      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      let route = { name, params: { viewname, id }, query }

      this.$router.push(route)
    },
  },
}
</script>
