<script lang="jsx">
import ModuleSummary from '../../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
import {
  ftoast,
  FModal,
  FContainer,
  FForm,
  FFormItem,
  FInput,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { findRouteForModule, pageTypes } from '@facilio/router'

export default {
  name: 'InspectionTemplateSummary',
  extends: ModuleSummary,
  components: {
    ftoast,
    FModal,
    FContainer,
    FForm,
    FFormItem,
    FInput,
  },
  data() {
    return {
      canShowCloneTemplateDialog: false,
      isClonedInspectionSaving: false,
      cloneTemplate: {
        name: null,
      },
      rules: {
        name: [
          {
            required: true,
            message: 'Please input template name',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    systemBtnList() {
      return [
        {
          name: `${this.$t('template.qanda_builder', { ns: 'inspection' })}`,
          identifier: 'qAndABuilder',
          clickAction: this.openQAndABuilder,
        },
        {
          name: `${this.$t('template.publish', { ns: 'inspection' })}`,
          identifier: 'publish',
          clickAction: this.publishTemplate,
        },
      ]
    },
    moreButtonList() {
      return [
        {
          name: `${this.$t('template.edit', { ns: 'inspection' })}`,
          identifier: 'edit',
          clickAction: this.editRecord,
        },
        {
          name: `${this.$t('template.execute_now', { ns: 'inspection' })}`,
          identifier: 'executeNow',
          clickAction: this.executeTrigger,
        },
        {
          name: `${this.$t('template.clone', { ns: 'inspection' })}`,
          identifier: 'clone',
          clickAction: this.cloneInspection,
        },
      ]
    },
  },
  methods: {
    openQAndABuilder() {
      let customPath = this.$router.resolve({
        name: 'inspection-builder',
        query: { pageNo: 1 },
      }).href

      this.$router.push({ path: customPath })
    },
    async executeTrigger() {
      let { record } = this
      let { creationType, id } = record
      if (creationType === 2) {
        this.canShowExecuteWizard = true
      } else {
        let { moduleName } = this
        let { error } = await API.post(
          `v3/qanda/template/execute?moduleName=${moduleName}&id=${id}`,
          {}
        )
        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          ftoast.success(`Inspection Template is executed`)
        }
      }
    },
    async publishTemplate() {
      let { record } = this
      let { id } = record || {}
      let { error } = await API.post(`v3/qanda/template/publish?id=${id}`, {})
      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        ftoast.success('Inspection Template published successfully')
        window.location.reload()
      }
    },
    cloneInspection() {
      this.canShowCloneTemplateDialog = true
    },
    setVisible(val) {
      this.canShowCloneTemplateDialog = val
    },
    setValue(val) {
      this.cloneTemplate.name = val
    },
    defaultSpace() {
      return (
        <template>
          {this.canShowCloneTemplateDialog && (
            <FModal
              title="Clone Inspection Template"
              vOn:ok={this.saveClonedInspection}
              vOn:cancel={this.closeDialog}
              visible={this.canShowCloneTemplateDialog}
              size="S"
              confirmLoading={this.isClonedInspectionSaving}
              {...{ on: { 'update:visible': this.setVisible } }}
            >
              <FContainer height="100px" padding="containerXLarge">
                <FForm
                  ref="form"
                  model={this.cloneTemplate}
                  position="top"
                  vOn:rules={this.rules}      
                >
                  <FFormItem
                    label={this.$t('template.template_name', { ns: 'inspection' })}
                    prop="name"
                  >
                    <FInput
                      value={this.cloneTemplate.name}
                      placeholder={this.$t('template.nameField_Clone', {
                        ns: 'inspection',
                      })}
                      vOn:input={this.setValue}
                    ></FInput>
                  </FFormItem>
                </FForm>
              </FContainer>
            </FModal>
          )}
        </template>
      )
    },
    async saveClonedInspection() {
      let { record, cloneTemplate } = this
      let { name } = cloneTemplate
      if (isEmpty(name)) {
        this.$message.error('Template Name cannot be empty')
        return
      }
      this.isClonedInspectionSaving = true
      let { id } = record
      let { data, error } = await API.post(
        `v3/qanda/template/clone?id=${id}&templateName=${name}`,
        {}
      )
      this.isClonedInspectionSaving = false
      if (error) {
        ftoast.critical(error.message || 'Error Occured')
      } else {
        ftoast.success('Successfully Cloned Inspection Template')
        if (!isEmpty(data)) {
          this.closeDialog()
          let { $route = {} } = this
          let viewname = getProperty($route, 'params.viewname', 'all')
          let { clonedTemplate } = data
          let { id } = clonedTemplate
          if (!isEmpty(id)) {
            this.openSummary(id, viewname)
          }
        }
      }
    },
    closeDialog() {
      this.cloneTemplate.name = null
      this.$set(this, 'canShowCloneTemplateDialog', false)
    },
    openSummary(id, viewname) {
      let { name } = findRouteForModule(this.moduleName, pageTypes.OVERVIEW) || {}
      this.$router.push({
        name,
        params: { id, viewname },
        query: this.$route.query,
      })
    },
  },
}
</script>
