<script>
import { isEmpty } from '@facilio/utils/validation'
import ModuleForm from '../../form/ModuleForm.vue'
import { pageTypes, findRouteForTab } from '@facilio/router'
import getProperty from 'dlv'
import { eventBus } from '../../../components/page-builder/event-bus'

export default {
  extends: ModuleForm,
  props: [
    'visibility',
    'data',
    'dataObj',
    'isDialogForm',
    'formModuleName',
    'fromSummary',
    'fromSpaceList',
    'recordId',
    'parentId',
  ],
  data() {
    return {
      dialog: this.isDialogForm || false,
    }
  },
  computed: {
    moduleDataId() {
      let id = getProperty(this, '$route.params.id', null)
      let { fromSummary, recordId } = this
      if (!fromSummary && !isEmpty(id)) {
        return parseInt(id) || null
      } else if (fromSummary && recordId) {
        return recordId
      } else {
        return
      }
    },
    moduleName() {
      let { fromSummary, formModuleName, $route } = this
      if (fromSummary) {
        return formModuleName
      }
      return $route.params?.moduleName
    },
    isV3Api() {
      return true
    },
  },
  methods: {
    async loadFormsList(moduleName) {
      try {
        let forms = await this.modelDataClass.loadFormsList(moduleName)
        let selectedForms
        if (this.dataObj && moduleName == 'space') {
          if (this.dataObj.parentSpace) {
            selectedForms = forms.filter(form => {
              let { name } = form
              return name.includes('default_space_web_space')
            })
          } else if (this.dataObj.floor && this.dataObj.floor.id) {
            selectedForms = forms.filter(form => {
              let { name } = form
              return name.includes('default_space_web_floor')
            })
          } else if (this.dataObj.building && this.dataObj.building.id) {
            selectedForms = forms.filter(form => {
              let { name } = form
              return name.includes('default_space_web_building')
            })
          } else if (this.dataObj.site && this.dataObj.site.id) {
            selectedForms = forms.filter(form => {
              let { name } = form
              return name.includes('default_space_web_site')
            })
          }
          this.forms = selectedForms
        } else {
          this.forms = forms
        }
      } catch (error) {
        this.showErrorToastMessage(
          error,
          this.$t(
            'portfolio.form.error',
            'Unable to fetch module form templates',
            {
              ns: 'portfolio',
            }
          )
        )
      }
    },
    afterSerializeHook({ data }) {
      if (!isEmpty(data.space)) {
        data.parentSpace = { id: data.space }
        delete data.space
      }
      return data
    },
    modifyFieldPropsHook(field) {
      let { name, value } = field || {}
      if (name === 'parentSpace') {
        return {
          ...field,
          name: 'space',
          value: this.dataObj?.parentSpace,
        }
      }
      if (name == 'photoId') {
        return {
          ...field,
          name: 'photo',
        }
      }
      if (
        this.fromSummary &&
        this.moduleDataId &&
        (name === 'siteId' || name === 'site')
      ) {
        return { ...field, isDisabled: true }
      }
    },
    afterSaveHook(response) {
      let data = response
      let { [this.moduleName]: record } = data || {}
      let { id, name } = record || {}
      if (!data?.error) {
        if (this.fromSpaceList) {
          eventBus.$emit('refresh-spaceList')
          eventBus.$emit('refresh-tree')
        } else if (this.fromSummary) {
          this.redirectToList()
          eventBus.$emit('refresh-spaceList')
          eventBus.$emit('refresh-tree')
        } else {
          let { moduleDataId } = this
          if (moduleDataId) {
            this.redirectToNewSummary(moduleDataId)
          } else {
            this.redirectToNewSummary(id)
          }
        }
      }
    },
    redirectToNewSummary(id) {
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      let { $route: { params: { viewname } } = {}, moduleName = {} } =
        this || {}
      if (name) {
        this.$router.push({
          name,
          params: {
            id: id,
            viewname: viewname || 'all',
            moduleName: moduleName,
          },
        })
      }
    },
    redirectToList() {
      if (this.isDialogForm) {
        this.$emit('onClose')
      } else {
        this.$router.back()
      }
    },
  },
}
</script>
