<template>
  <FModal
    :title="title"
    :visible="true"
    size="L"
    @cancel="close"
    @ok="save"
    padding="containerNone"
    class="email-action"
  >
    <FContainer
      v-if="loadingForm"
      height="300px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FSpinner :size="30"
    /></FContainer>
    <FContainer v-else>
      <FContainer padding="sectionSmall">
        <FForm
          ref="email-action-form"
          uniqueId="email-action-form"
          :model="emailNotification.templateJson"
          position="left"
          :rules="formRules"
          class="flex flex-col gap-y-6"
        >
          <FContainer display="flex" alignItems="center">
            <FText appearance="headingMed14" color="textCaption" width="10%">
              {{ $t('email_action.from', { ns: 'remote_monitor' }) }}
            </FText>
            <FFormItem prop="fromAddr" :hideLabel="true">
              <FSelect
                v-model="emailNotification.templateJson.fromAddr"
                :placeholder="
                  $t('email_action.enter_from_address', {
                    ns: 'remote_monitor',
                  })
                "
                :options="senderAddr || []"
              >
              </FSelect>
            </FFormItem>
          </FContainer>
          <FContainer display="flex" alignItems="center">
            <FText appearance="headingMed14" color="textCaption" width="10%">
              {{ $t('email_action.to', { ns: 'remote_monitor' }) }}
            </FText>
            <FFormItem prop="to" :hideLabel="true">
              <FSelect
                v-model="emailNotification.templateJson.to"
                :placeholder="
                  $t('email_action.enter_to_address', { ns: 'remote_monitor' })
                "
                :multiple="true"
                :options="toUserList"
              >
                //need to support created by .... and more option support in to
                cc bcc
                <template #suffix>
                  <FButton
                    appearance="secondary"
                    size="small"
                    :disabled="disableCCAndBCCBtn"
                    @click="showCCandBCC"
                  >
                    <FIcon group="dsm" name="calendar" size="12"></FIcon>
                    {{
                      $t('email_action.add_cc_bcc', { ns: 'remote_monitor' })
                    }}
                  </FButton>
                </template>
              </FSelect>
            </FFormItem>
          </FContainer>
          <FContainer v-if="showEmailCC" display="flex" alignItems="center">
            <FText appearance="headingMed14" color="textCaption" width="10%">
              {{ $t('email_action.cc', { ns: 'remote_monitor' }) }}
            </FText>
            <FFormItem prop="cc" :hideLabel="true">
              <FSelect
                v-model="emailNotification.templateJson.cc"
                :placeholder="
                  $t('email_action.enter_cc_address', { ns: 'remote_monitor' })
                "
                :multiple="true"
                :options="ccUserList"
              >
              </FSelect>
            </FFormItem>
          </FContainer>
          <FContainer v-if="showEmailBCC" display="flex" alignItems="center">
            <FText appearance="headingMed14" color="textCaption" width="10%">
              {{ $t('email_action.bcc', { ns: 'remote_monitor' }) }}
            </FText>
            <FFormItem prop="bcc" :hideLabel="true">
              <FSelect
                v-model="emailNotification.templateJson.bcc"
                :placeholder="
                  $t('email_action.enter_bcc_address', { ns: 'remote_monitor' })
                "
                :multiple="true"
                :options="bccUserList"
              >
              </FSelect>
            </FFormItem>
          </FContainer>
          <FContainer display="flex" alignItems="center">
            <FText appearance="headingMed14" color="textCaption" width="10%">
              {{ $t('email_action.template', { ns: 'remote_monitor' }) }}
            </FText>
            <FFormItem prop="emailStructureId" :hideLabel="true">
              <FSelect
                v-model="emailNotification.templateJson.emailStructureId"
                :placeholder="
                  $t('email_action.select_email_template', {
                    ns: 'remote_monitor',
                  })
                "
                :options="emailTemplateOptions"
                :allowCreate="true"
              >
              </FSelect>
            </FFormItem>
          </FContainer>
        </FForm>
      </FContainer>
      <template v-if="!isEmpty(emailStructureId)">
        <FDivider width="100%" backgroundColor="backgroundMidgroundDark" />
        <FContainer padding="">
          <EmailContent :emailStructureId="emailStructureId" />
        </FContainer>
      </template>
    </FContainer>
  </FModal>
</template>

<script>
import EmailContent from './EmailContent.vue'
import { EmailModel } from './EmailModel'
import { getApp } from '@facilio/router'
import cloneDeep from 'lodash/cloneDeep'
import { isEmpty, isNullOrUndefined } from '@facilio/utils/validation'
import getProperty from 'dlv'
import {
  FModal,
  FContainer,
  FForm,
  FFormItem,
  FSelect,
  FText,
  FDivider,
  FButton,
  FIcon,
  FSpinner,
  ftoast,
} from '@facilio/design-system'
export default {
  props: [
    'title',
    'moduleName',
    'actionObj',
    'rule',
    'configName',
    'metaFields',
  ],
  components: {
    FModal,
    FContainer,
    FForm,
    FFormItem,
    FSelect,
    FText,
    FDivider,
    FButton,
    FIcon,
    EmailContent,
    FSpinner,
  },
  data() {
    return {
      showEmailCC: false,
      showEmailBCC: false,
      disableCCAndBCCBtn: false,
      notificationMailAddresses: null,
      loadingForm: false,
      loadingToReceiver: false,
      loadingCcReceiver: false,
      loadingBccReceiver: false,
      emailNotification: null,
      placeholderString: '',
      toList: {},
      ccList: {},
      bccList: {},
      senderAddr: null,
      receivingUsers: [],
      receivingFields: [],
      emailTemplateList: [],
      emailTemplateOptionsList: [],
      emailTemplateLoading: false,
      showFileAttachDialog: false,
      nonActiveUserRemoved: { to: false, cc: false, bcc: false },
      formRules: {
        to: {
          trigger: 'blur',
          validator: value => {
            if (isEmpty(value)) {
              return {
                errorMessage: this.$t('email_action.please_select_to_address', {
                  ns: 'remote_monitor',
                }),
                invalid: true,
              }
            }
          },
        },
        emailStructureId: {
          trigger: 'blur',
          validator: value => {
            if (isEmpty(value) && this.emailNotification.isNewTemplate) {
              return {
                errorMessage: this.$t(
                  'email_action.please_select_email_template',
                  {
                    ns: 'remote_monitor',
                  }
                ),
                invalid: true,
              }
            }
          },
        },
      },
    }
  },
  created() {
    this.init()
  },
  computed: {
    disableSeperateMail() {
      let { templateJson } = this.emailNotification || {}
      let { to } = templateJson || {}

      return !to || (to || []).length < 2
    },
    appId() {
      return (getApp() || {}).id
    },
    appLinkName() {
      return (getApp() || {}).linkName
    },
    showNewTemplate() {
      let showNewTemplate = getProperty(this, 'emailNotification.isNewTemplate')
      return isNullOrUndefined(showNewTemplate) ? true : val
    },
    emailStructureId() {
      let emailStructureId = getProperty(
        this,
        'emailNotification.templateJson.emailStructureId'
      )
      return emailStructureId
    },
    toUserList() {
      let toUserList = getProperty(this, 'toList.users', [])
      return toUserList || []
    },
    ccUserList() {
      let ccUserList = getProperty(this, 'ccList.users', [])
      return ccUserList || []
    },
    bccUserList() {
      let bccUserList = getProperty(this, 'bccList.users', [])
      return bccUserList || []
    },
    emailTemplateOptions() {
      let emailTemplateOptions = getProperty(
        this,
        'emailTemplateOptionsList',
        []
      )
      return emailTemplateOptions || []
    },
  },
  methods: {
    isEmpty,
    async init() {
      this.loadingForm = true
      let {
        moduleName = null,
        actionObj = {},
        rule = {},
        configName = null,
        metaFields: fields,
      } = this
      let emailObj = {
        ...actionObj,
        moduleName,
        rule,
        configName,
        fields,
      }
      this.emailNotification = new EmailModel(emailObj)
      let { isAttachmentAdded } = this.emailNotification.templateJson
      isAttachmentAdded && this.emailNotification.addAttachmentList()
      this.placeholderString =
        getProperty(
          this.emailNotification,
          'templateJson.userWorkflow.workflowV2String',
          ''
        ) || ''
      let { cc, bcc } = this.emailNotification.templateJson
      !isEmpty(cc) && this.openCCField()
      !isEmpty(bcc) && this.openBCCField()
      this.setEmailTemplateList()
      await this.setInitialReceiverDropDowns()
      this.loadingForm = false
    },
    removeDeletedUser(receiverType, visible) {
      let receiverObj = getProperty(this, `${receiverType}List`) || {}
      let dUser = receiverObj['Deleted User']

      if (
        !visible &&
        !this.nonActiveUserRemoved[receiverType] &&
        dUser.length > 0
      ) {
        let fieldList = getProperty(this, `${receiverType}List`) || {}
        let newList = this.emailNotification.removeDeletedUser(
          receiverType,
          fieldList
        )
        this.setListValues(receiverType, newList)
        this.nonActiveUserRemoved[receiverType] = true
      }
    },
    async setInitialReceiverDropDowns() {
      let receivingUsers = [],
        receivingFields = []
      this.senderAddr = await EmailModel.getSenderList()
      let typeList = ['to', 'cc', 'bcc']
      let { data, error } = await this.emailNotification.getReceivingUsers(
        null,
        this.appId,
        typeList
      )
      if (!error) {
        receivingUsers = data
      } else {
        let errorMessage =
          error?.message || this.$t('error_occurred_short_message')
        ftoast.critical(errorMessage, {
          menuType: 'alerts',
          timeout: 1000,
        })
      }
      receivingFields = await this.emailNotification.getReceivingFields()
      let receiverCategoricalList = {
        users: receivingUsers,
        ...receivingFields,
      }
      this.toList = cloneDeep(receiverCategoricalList)
      this.ccList = cloneDeep(this.toList)
      this.bccList = cloneDeep(this.toList)
      typeList.forEach(type => {
        let fieldList = getProperty(this, `${type}List`)
        this.handleReceiverAddrChange(type, fieldList)
      })
      let { senderAddr, emailNotification } = this
      let { isNew } = emailNotification || {}
      if (!isEmpty(senderAddr) && isNew) {
        const matchedMail = senderAddr.find(em =>
          em.label.startsWith('noreply@')
        )
        if (matchedMail) {
          this.emailNotification.templateJson.fromAddr = getProperty(
            matchedMail,
            'value',
            null
          )
        }
      }
    },
    async setEmailTemplateList() {
      this.emailTemplateLoading = true
      let { data, error } = await this.emailNotification.getEmailTemplateList()
      if (error) {
        let errorMessage =
          error.message || this.$t('error_occurred_short_message')
        ftoast.critical(errorMessage, {
          menuType: 'alerts',
          timeout: 1000,
        })
      } else {
        this.emailTemplateList = data
        this.emailTemplateOptionsList = data.map(emailTemplate => {
          let label = emailTemplate?.name
          let value = emailTemplate?.id
          return { label, value }
        })
      }
      this.emailTemplateLoading = false
    },
    onSaveAttachments(urlArray, fileIds, attachments, fileFieldIds) {
      this.emailNotification.onSaveAttachments(
        urlArray,
        fileIds,
        attachments,
        fileFieldIds
      )
    },
    async handleReceiverAddrChange(receiverType, alternateList) {
      let receiverList = alternateList || {}
      if (isEmpty(alternateList)) {
        receiverList = {
          users: (getProperty(this, `${receiverType}List`) || {}).users,
        }
        let otherFields = await this.emailNotification.getReceivingFields()
        receiverList = Object.assign(receiverList, otherFields)
      }
      let list = this.emailNotification.handleAddrChange(
        receiverType,
        receiverList
      )
      this.setListValues(receiverType, list)
    },
    setListValues(receiverType, list) {
      let filteredList = this.removeEmptyGroup(list)
      receiverType === 'to' && (this.toList = filteredList)
      receiverType === 'cc' && (this.ccList = filteredList)
      receiverType === 'bcc' && (this.bccList = filteredList)
    },
    async setReceiverOptions(receiverType, search) {
      this.toggleReceiverLoading(receiverType, true)
      let receivingFields = []
      let { data, error } = await this.emailNotification.getReceivingUsers(
        search,
        this.appId,
        [receiverType]
      )
      let receiverTypeList = getProperty(this, `${receiverType}List`) || {}
      receivingFields = await this.emailNotification.getReceivingFields(search)
      receivingFields = Object.assign({ users: data }, receivingFields)
      if (isEmpty(search)) {
        receivingFields = this.emailNotification.handleAddrChange(
          receiverType,
          receivingFields
        )
      } else {
        if (!isEmpty(receiverTypeList?.placeHolders)) {
          receivingFields.placeHolders = this.searchForValues(
            search,
            receiverTypeList.placeHolders
          )
        }
        if (!isEmpty(receiverTypeList?.emailIds)) {
          receivingFields.emailIds = this.searchForValues(
            search,
            receiverTypeList.emailIds
          )
        }
      }
      let listObj = { users: data, ...receivingFields }
      this.setListValues(receiverType, listObj)
      this.toggleReceiverLoading(receiverType, false)
    },
    toggleReceiverLoading(receiverType, loadingState) {
      if (receiverType === 'to') {
        this.loadingToReceiver = loadingState
      } else if (receiverType === 'cc') {
        this.loadingCcReceiver = loadingState
      } else if (receiverType === 'bcc') {
        this.loadingBccReceiver = loadingState
      }
    },
    searchForValues(searchTerm = '', searchableList) {
      let filteredData = (searchableList || []).filter(item => {
        let lcLabel = (item.label || '').toLowerCase()
        let lcSearchTerm = searchTerm.toLowerCase()

        return lcLabel.match(lcSearchTerm)
      })
      return filteredData
    },
    removeEmptyGroup(listObj) {
      let arrayedList = Object.entries(listObj || {})
      let filteredList = arrayedList.reduce((prev, [key, arr]) => {
        if (!isEmpty(arr)) {
          prev[key] = arr
        }
        return prev
      }, {})

      return filteredList || {}
    },
    savePlaceholder() {
      this.$set(
        this.emailNotification.templateJson.userWorkflow,
        'workflowV2String',
        this.placeholderString
      )
      this.closePlaceholder()
    },
    closePlaceholder() {
      this.placeholderString =
        getProperty(
          this.emailNotification,
          'templateJson.userWorkflow.workflowV2String',
          ''
        ) || ''
      this.showScriptDialog = false
    },
    openPlaceholderDialog() {
      this.showScriptDialog = true
    },
    openCCField() {
      this.showEmailCC = true
    },
    openBCCField() {
      this.showEmailBCC = true
    },
    save() {
      let isValid = false
      let emailActionForm = this.$refs['email-action-form']

      isValid = emailActionForm.validate()

      if (!isValid) return
      this.$emit('onSave', this.serializeData())
    },
    serializeData() {
      return this.emailNotification.serialize()
    },
    close() {
      this.$emit('onClose')
    },
    switchToNewTemplate() {
      this.emailNotification.isNewTemplate = true
    },
    showCCandBCC() {
      this.showEmailBCC = true
      this.showEmailCC = true
      this.disableCCAndBCCBtn = true
    },
  },
}
</script>
