<template>
  <div v-if="showForm">
    <DialogForm
      :moduleName="selectedButton.formModuleName"
      :recordId="record.id"
      :formId="selectedButton.formId"
      :record="record"
      :isExternalModule="isExternalModule"
      :transition="selectedButton"
      :saveAction="executeAction"
      :closeAction="closeFlowForm"
      :actionType="actionType"
      :isFormOfCustomButton="true"
      :approvalRule="null"
      :isV3="isV3"
      :title="selectedButton.name"
    ></DialogForm>
  </div>
</template>

<script>
import { API } from '@facilio/api'
import DialogForm from '../../../pages/form/DialogForm.vue'
import { isEmpty, isFunction } from '@facilio/utils/validation'
import { ACTION_TYPES } from '../CustomButtonUtil.js'
import { getApp } from '@facilio/router'
import dlv from 'dlv'
import { ftoast } from '@facilio/design-system'
import { dset as setProperty } from 'dset'

export default {
  props: [
    'selectedButton',
    'record',
    'moduleName',
    'updateUrl',
    'transformFn',
    'actionType',
    'isPortalApp',
  ],
  components: { DialogForm },
  data() {
    return {
      showForm: false,
    }
  },
  created() {
    this.startAction()
  },
  computed: {
    isExternalModule() {
      let formModuleName = dlv(this.selectedButton, 'formModuleName')
      let { moduleName } = this
      return (
        formModuleName &&
        (formModuleName !== moduleName || formModuleName === 'workorder')
      )
    },
    isV3() {
      let { moduleName, updateUrl, isExternalModule } = this
      let isUpdateUrlEmpty = !isEmpty(moduleName) && isEmpty(updateUrl)

      return isExternalModule || isUpdateUrlEmpty
    },
    woTransitionStateLicenseEnabled() {
      const woTransitionStateLicense = this.$access.isLicenseEnabled(
        'WO_STATE_TRANSITION_V3'
      )
      return woTransitionStateLicense
    },
  },
  methods: {
    async startAction() {
      this.showForm = true
    },
    closeFlowForm() {
      this.showForm = false
      this.$emit('closed')
    },
    async executeAction(formData, formId) {
      let {
        selectedButton,
        record,
        moduleName,
        isExternalModule,
        woTransitionStateLicenseEnabled,
      } = this
      let params
      let isVendorPortal = getApp().linkName === 'vendor'
      let isNotWoV3 =
        this.moduleName === 'workorder' && !woTransitionStateLicenseEnabled

      if ((isVendorPortal || !this.isPortalApp) && isNotWoV3) {
        let url = this.getUrl(selectedButton)
        let formModuleName = dlv(selectedButton, 'formModuleName')

        if (this.actionType === ACTION_TYPES.CREATE_RECORD) {
          let { error } = await this.createRecordForModule(
            formModuleName,
            formData,
            selectedButton
          )
          if (error) {
            this.responseHandler({ error: error })
            return
          }
        }
        params = this.transformFn(
          {
            moduleName: moduleName,
            id: record.id,
            customButtonId: selectedButton.id,
          },
          isExternalModule ? {} : formData
        )

        return API.post(url, params).then(this.responseHandler)
      } else {
        let relations
        if (this.actionType === ACTION_TYPES.CREATE_RECORD) {
          let fieldId = dlv(selectedButton, 'lookupField.id')
          let formModuleName = dlv(selectedButton, 'formModuleName')

          relations = {
            [formModuleName]: [
              {
                fieldId: fieldId,
                data: [{ ...formData, formId }],
              },
            ],
          }
        }
        params = {
          id: record.id,
          customButtonId: selectedButton.id,
          data: isExternalModule ? { relations } : formData,
        }

        let { id: recordId } = record || {}
        let url = `v3/action/${moduleName}/${recordId}/customButton`

        return API.patch(url, params).then(this.responseHandler)
      }
    },
    createRecordForModule(moduleName, formData, selectedButton) {
      let recordId = dlv(this.record, 'id')
      let fieldName = dlv(selectedButton, 'lookupField.name')

      if (moduleName === 'workorder') {
        let siteId = dlv(this.record, 'siteId')
        let formId = dlv(selectedButton, 'formId')

        let { tasksString, ticketattachments } = formData
        delete formData.ticketattachments
        delete formData.tasksString

        if (dlv(selectedButton, 'lookupField.default')) {
          formData[fieldName] = { id: recordId }
        } else {
          setProperty(formData, `data.${fieldName}`, recordId)
        }

        formData = {
          workorder: { ...formData, formId, siteId },
        }
        if (!isEmpty(ticketattachments)) {
          formData['ticketattachments'] = ticketattachments
        }
        if (!isEmpty(tasksString)) {
          formData['tasksString'] = JSON.stringify(tasksString)
        }

        let url = 'v2/workorders/add'
        return API.post(url, formData)
      } else {
        formData[fieldName] = { id: recordId }

        return API.createRecord(moduleName, {
          data: formData,
        })
      }
    },
    responseHandler({ error }) {
      this.$emit('closed')
      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
        this.$emit('response', false)
      } else {
        if (this.isExternalModule) {
          ftoast.success(this.$t('custommodules.custom_buttons.record_created'))
        } else {
          ftoast.success(
            this.$t('custommodules.custom_buttons.action_executed')
          )
        }
        this.$emit('response', true)
      }
    },
    getUrl(buttonItem) {
      if (isFunction(this.updateUrl)) {
        return this.updateUrl(buttonItem)
      } else {
        return this.updateUrl
      }
    },
  },
}
</script>

<style></style>
