<template>
  <div v-if="showForm">
    <DialogForm
      :moduleName="selectedButton.moduleName"
      :formId="selectedButton.formId"
      :transition="selectedButton"
      :saveAction="executeAction"
      :closeAction="closeFlowForm"
      :approvalRule="null"
      :isV3="true"
      :title="selectedButton.name"
    ></DialogForm>
  </div>
</template>

<script>
import { API } from '@facilio/api'
import DialogForm from '../../../pages/form/DialogForm.vue'
import { isEmpty, isObject } from '@facilio/utils/validation'
import { ftoast } from '@facilio/design-system'

export default {
  props: ['selectedButton', 'selectedRecords', 'moduleName'],
  components: { DialogForm },
  data() {
    return {
      showForm: false,
    }
  },
  created() {
    this.startAction()
  },

  methods: {
    async startAction() {
      this.showForm = true
    },
    closeFlowForm() {
      this.showForm = false
      this.$emit('closed')
    },
    async executeAction(formData) {
      let { selectedButton, selectedRecords, moduleName } = this

      Object.entries(formData).forEach(([key, value]) => {
        if (isEmpty(value)) {
          delete formData[key]
        } else if (isObject(value)) {
          Object.entries(value).forEach(([k, v]) => {
            if (isEmpty(v)) {
              delete value[k]
            }
          })
        }
      })

      let params = {
        customButtonId: selectedButton.id,
        moduleName: moduleName,
        data: {
          [moduleName]: selectedRecords.map(record => {
            return { id: record.id, ...formData }
          }),
        },
      }
      return API.post('v3/modules/data/bulkpatch', params).then(
        this.responseHandler
      )
    },
    responseHandler({ error }) {
      this.$emit('closed')
      if (error) {
        ftoast.critical(this.$t('error_occurred'))
        this.$emit('response', false)
      } else {
        ftoast.success(this.$t('custommodules.custom_buttons.record_updated'))
      }
      this.$emit('response', true)
    },
  },
}
</script>

<style></style>
