import { SetupData, prop } from '@facilio/data'
import getProperty from 'dlv'
import {
  notifConfig,
  sysCreatedByUserOption,
  handleAddrChange,
  addModuleParam,
  fetchUsers,
  removeDeletedUser,
  getUsersFromTemplate,
  setUserMailWorkflow,
  setExpressionFromPlaceHolder,
} from './utils'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import access from '../../../../utils/access'
import { isMultiLookup } from '@facilio/utils/field'

export class EmailModel extends SetupData {
  static props = [
    'cachedFields',
    'actionType',
    'isNewTemplate',
    'isNew',
    'templateId',
    'templateJson',
    'moduleName',
    'rule',
    'option',
    'configRuleName',
    'isUserNonEditable',
  ]
  cachedFields = {}
  actionType = 3
  isNewTemplate
  isNew
  templateId = -1
  templateJson = {}
  moduleName
  rule
  option
  configRuleName
  isUserNonEditable
  constructor(data) {
    super(data)
    this.setResourceProperties()

    let parentProperties = Object.getPrototypeOf(this)
    if (!isEmpty(Object.keys(parentProperties))) {
      Object.entries(parentProperties).forEach(
        ([key, value]) => (this[key] = value)
      )
    }

    if (!isEmpty(data)) {
      let currentData = { ...this, ...data }
      let deserializedData = this.deserialize(currentData)
      this.updateDataProperty(deserializedData)
    }
  }

  static resourceProperties = {
    cachedFields: {
      deserialize: actionObj => {
        let { fields } = actionObj || {}
        return {
          cachedFields: fields,
        }
      },
      serialize: null,
    },
    actionType: {},
    isNewTemplate: {
      deserialize: actionObj => {
        let { templateJson, template, disableNewTemplate } = actionObj || {}
        let { emailStructureId } = template || templateJson || {}
        let isNew = isEmpty(templateJson?.to) && isEmpty(template)
        let isNewTemplate = !disableNewTemplate
          ? isNew || emailStructureId > 0
          : false
        return {
          isNewTemplate,
        }
      },
      serialize: null,
    },
    isNew: {
      deserialize: actionObj => {
        let { templateJson, template } = actionObj || {}
        let isNew = isEmpty(templateJson?.to) && isEmpty(template)
        return { isNew }
      },
      serialize: null,
    },
    templateId: { serialize: null },
    templateJson: {
      deserialize: actionObj => {
        let { template, templateJson, moduleName } = actionObj || {}
        let extraProperties = {}
        let { emailStructureId } = templateJson || template || {}
        let isNew = isEmpty(templateJson?.to) && isEmpty(template)
        let isNewTemplate = emailStructureId > 0
        if (isNew) {
          return {
            templateJson: {
              to: [],
              cc: [],
              bcc: [],
              subject: '',
              message: '',
              fromAddr: null,
              emailStructureId: null,
              sendAsSeparateMail: true,
              isAttachmentAdded: false,
              templateFileFieldIds: [],
              templateFileIds: [],
              templateUrlStrings: [],
              attachmentList: [],
              workflow: {},
              userWorkflow: { isV2Script: true, workflowV2String: '' },
              ftl: false,
            },
          }
        } else {
          let {
            message,
            subject,
            fromAddr = null,
            emailStructureId,
            fromID = null,
            sendAsSeparateMail,
            userWorkflow,
            isAttachmentAdded,
            ftl = false,
            workflow,
            to: toField,
            cc: ccField,
            bcc: bccField,
          } = template || templateJson || {}
          //a special occation where message,subject surprisingly included only in originalTemplate
          if (
            !Object.hasOwn(template || {}, 'subject') &&
            !Object.hasOwn(templateJson || {}, 'subject')
          ) {
            let { originalTemplate } = template || {}
            subject = originalTemplate?.subject || ''
            message = originalTemplate?.message || ''
          }
          if (isEmpty(userWorkflow)) {
            userWorkflow = {
              isV2Script: true,
              workflowV2String: '',
            }
          }
          let { workflowV2String = '' } = userWorkflow || {}
          let userTemplate = template
          if (!isEmpty(templateJson)) {
            let { to, cc, bcc } = templateJson || {}
            userTemplate = {
              originalTemplate: { to, cc, bcc },
              ...templateJson,
            }
          }
          let to = [],
            cc = [],
            bcc = []
          if (!isEmpty(workflow)) {
            to = getUsersFromTemplate(userTemplate)
            cc = getUsersFromTemplate(userTemplate, 'cc')
            bcc = getUsersFromTemplate(userTemplate, 'bcc')
          } else {
            !isEmpty(toField) && (to = (toField || '').split(','))
            !isEmpty(ccField) && (cc = (ccField || '').split(','))
            !isEmpty(bccField) && (bcc = (bccField || '').split(','))
          }
          if (!isEmpty(userWorkflow.workflowV2String)) {
            userWorkflow.workflowV2String = !isEmpty(moduleName)
              ? workflowV2String
                  .replace('Map scriptFunc(Map ' + moduleName + ') {\n', '')
                  .replace(new RegExp('\n}' + '$'), '')
              : workflowV2String.replace('Map test()' + ' { ', '').slice(0, -2)
          }
          if (!isNewTemplate) {
            let templateObj = templateJson
            emailStructureId = null
            if (!isEmpty(template)) {
              templateObj = template.originalTemplate
            }
            let { html = false } = templateObj || {}
            extraProperties = { html }
          }
          return {
            templateJson: {
              ...extraProperties,
              subject,
              message,
              isAttachmentAdded,
              templateFileFieldIds: [],
              templateFileIds: [],
              templateUrlStrings: [],
              attachmentList: [],
              to,
              cc,
              bcc,
              fromAddr: fromAddr || fromID,
              emailStructureId: !isNewTemplate ? null : emailStructureId,
              sendAsSeparateMail,
              workflow: {},
              userWorkflow,
              ftl,
            },
          }
        }
      },
      serialize: (templateJson, instance) => {
        let { moduleName } = instance || {}
        let { to, cc, bcc, userWorkflow, workflow } = templateJson || {}
        let { workflowV2String } = userWorkflow || {}
        let ccKey = !isEmpty(cc)
          ? {
              ids: cc,
              key: 'cc',
            }
          : null
        let bccKey = !isEmpty(bcc)
          ? {
              ids: bcc,
              key: 'bcc',
            }
          : null
        setUserMailWorkflow(
          to,
          templateJson,
          'mail',
          moduleName,
          false,
          ccKey,
          bccKey
        )
        if (!instance.isNewTemplate) {
          let stringsMayContainPlaceholders = `${templateJson.message} ${
            templateJson.subject
          } ${(templateJson?.templateUrlStrings || []).join()}`
          setExpressionFromPlaceHolder(
            workflow,
            stringsMayContainPlaceholders,
            moduleName
          )
        }
        instance.addModuleParam()
        let type = 1,
          name = 'New WorkOrder Email Template'
        if (!isEmpty(workflowV2String)) {
          if (!isEmpty(moduleName)) {
            userWorkflow.workflowV2String = `Map scriptFunc(Map ${moduleName}) {\n${workflowV2String}\n}`
          } else {
            userWorkflow.workflowV2String = `Map test() { ${workflowV2String} }`
          }
        } else {
          userWorkflow = null
        }
        let keysToDelete = []
        if (!isEmpty(templateJson.attachmentList)) {
          templateJson.attachmentList = instance.constructAttachmentList()
        } else {
          keysToDelete = [
            'attachmentList',
            'templateFileIds',
            'templateUrlStrings',
            'templateFileFieldIds',
          ]
        }
        let { emailStructureId } = templateJson || {}
        if (isEmpty(emailStructureId)) {
          keysToDelete.push('emailStructureId')
        }
        if ((to || []).length < 2) {
          keysToDelete.push('sendAsSeparateMail')
        }
        if (isEmpty(cc)) {
          keysToDelete.push('cc')
        }
        if (isEmpty(bcc)) {
          keysToDelete.push('bcc')
        }
        for (const key of keysToDelete) {
          delete templateJson[key]
        }
        return {
          templateJson: {
            ...templateJson,
            name,
            type,
            userWorkflow,
          },
        }
      },
    },
    moduleName: {
      serialize: null,
    },
    rule: { serialize: null },
    option: { serialize: null },
    configRuleName: {
      deserialize: actionObj => {
        let { rule } = actionObj || {}
        let { name, ruleType } = rule || {}
        return {
          configRuleName: !isEmpty(rule) ? `${name}_${ruleType}` : '',
        }
      },
      serialize: null,
    },
    isUserNonEditable: {
      deserialize: actionObj => {
        let { rule } = actionObj || {}
        let { name, ruleType } = rule || {}
        let configRuleName = !isEmpty(rule) ? `${name}_${ruleType}` : ''
        let isUserNonEditable = getProperty(
          notifConfig,
          `${configRuleName}.isUsersEditable`
        )
        isUserNonEditable = rule && isUserNonEditable
        return {
          isUserNonEditable,
        }
      },
      serialize: null,
    },
  }

  async getEmailTemplateList() {
    let { moduleName } = this
    let { error, data } = await API.get('v2/template/email/list', {
      moduleName,
    })
    return { data: data?.emailStructures, error }
  }
  static async getSenderList() {
    let moduleName = 'emailFromAddress'
    let { list, error } = await API.fetchAll(moduleName)
    if (!error) {
      /* sourceType=1 filters all addresses added for notifications */
      let emailFromAddress = (list || []).filter(em => em.sourceType === 1)
      emailFromAddress = emailFromAddress
      emailFromAddress = (emailFromAddress || []).map(emailAddress => {
        let label = getProperty(emailAddress, 'email', '')
        let value = getProperty(emailAddress, 'id', -1)
        return { label, value }
      })
      return emailFromAddress || []
    }
  }
  async getReceivingUsers(search = '', appId, receiverType = ['to']) {
    let responseObj = await fetchUsers.bind(this, search, appId, receiverType)()
    return responseObj
  }
  async getReceivingFields(search = '') {
    let { moduleName, cachedFields } = this
    let fields = []

    if (!isEmpty(cachedFields)) {
      fields = cachedFields
    } else {
      let { data } = await API.get('/module/metafields', { moduleName })
      fields = getProperty(data, 'meta.fields', [])
      this.cachedFields = fields
    }
    fields = this.filteredFieldsList(fields, search)

    let userFields = fields.filter(field => {
      let lookupModulename = getProperty(field, 'lookupModule.name')
      let userField = ['users', 'groups', 'people'].includes(lookupModulename)
      let requesterField =
        moduleName === 'workorder' &&
        (getProperty(field, 'name') || '') === 'requester'

      return userField || requesterField
    })
    let tenantFields = this.getSpecificlookupList(fields, 'tenant')

    let clientFields = this.getSpecificlookupList(fields, 'client')

    let vendorsFields = this.getSpecificlookupList(fields, 'vendors')

    let audienceFields = this.getSpecificlookupList(fields, 'audience')
    let senderFieldOptions = this.userTemplateOptions({
      userFields,
      audienceFields,
      vendorsFields,
      clientFields,
      tenantFields,
    })
    return senderFieldOptions || {}
  }
  getSpecificlookupList(fields, lookupModule) {
    let filteredFields = (fields || []).filter(field => {
      let { lookupModule: { name: lookupModulename } = {} } = field
      return lookupModulename === lookupModule
    })
    return filteredFields
  }
  constructOptionGroup(fields, getValue) {
    let fieldsList = []
    fieldsList = (fields || []).map(field => {
      let options = {
        label: field.displayName,
        value: getValue.bind(this, field, this.moduleName)(),
      }
      return options
    })
    return fieldsList
  }
  filteredFieldsList(fields, search = '') {
    let filteredFields = (fields || []).filter(field => {
      let { displayName } = field || {}
      let lcName = displayName.toLowerCase()
      let lcSearch = search.toLowerCase()
      let multiLookupField = isMultiLookup(field)
      return !multiLookupField && lcName.match(lcSearch)
    })

    return filteredFields
  }
  userTemplateOptions(otherFields) {
    let {
      userFields,
      audienceFields,
      vendorsFields,
      clientFields,
      tenantFields,
    } = otherFields
    let options = []

    if (!this.rule || !Object.hasOwn(notifConfig || {}, this.configRuleName)) {
      let usersGroup = this.constructOptionGroup(userFields, this.getValue)

      !isEmpty(usersGroup) && (options.fields = usersGroup)
      if (access.isLicenseEnabled('VENDOR')) {
        let vendorGroup = this.constructOptionGroup(
          vendorsFields,
          this.getPrimaryEmailValue
        )
        !isEmpty(vendorGroup) && (options.Vendors = vendorGroup)
      }
      if (access.isLicenseEnabled('TENANTS')) {
        let tenantGroup = this.constructOptionGroup(
          tenantFields,
          this.getPrimaryEmailValue
        )
        !isEmpty(tenantGroup) && (options.Tenants = tenantGroup)
      }
      if (access.isLicenseEnabled('CLIENT')) {
        let clientGroup = this.constructOptionGroup(
          clientFields,
          this.getPrimaryEmailValue
        )
        !isEmpty(clientGroup) && (options.Clients = clientGroup)
      }
      let audienceGroup = this.constructOptionGroup(
        audienceFields,
        this.getFieldNameValue
      )
      !isEmpty(audienceGroup) && (options.Audiences = audienceGroup)

      if (this.moduleName === 'quote') {
        let isCreatedByPresent = (options.fields || []).find(
          field => field.label === sysCreatedByUserOption.label
        )
        if (!isEmpty(isCreatedByPresent)) {
          options?.fields?.push({
            label: sysCreatedByUserOption.label,
            value: this.getValue(sysCreatedByUserOption, this.moduleName),
          })
        }
      }
      return options
    }
    let conf = notifConfig[this.configRuleName] || {}

    options = (userFields || [])
      .filter(user => (conf.options || []).includes(user.field))
      .map(user => ({
        label: user.label,
        value: this.getValue(user, conf.module),
      }))
    return options
  }
  async addAttachmentList() {
    let { templateJson, templateId } = this
    let { isAttachmentAdded } = templateJson || {}
    if (isAttachmentAdded) {
      let { data, error } = await API.get('/v2/template/attachment/getList', {
        templateId,
      })
      if (!error) {
        if (!isEmpty(data)) {
          let attachmentObj = this.deserializeAttachments(data)
          this.templateJson = { ...this.templateJson, ...attachmentObj }
        }
      }
    }
  }

  deserializeAttachments(data) {
    let {
      attachmentUrlList,
      attachments: attachmentList,
      attachmentFileFieldslList,
    } = data || {}
    let templateUrlStrings = (attachmentUrlList || []).map(url => url.urlString)
    let templateFileFieldIds = (attachmentFileFieldslList || []).map(
      fieldObj => fieldObj.fieldId
    )
    let templateFileIds = (attachmentList || []).map(
      attachment => attachment.fileId
    )
    return {
      templateFileFieldIds,
      templateFileIds,
      templateUrlStrings,
      attachmentList,
    }
  }
  constructAttachmentList() {
    let { templateJson } = this || {}
    this.templateJson.attachmentList = []
    let attachmentList = []
    let { templateFileIds, templateUrlStrings, templateFileFieldIds } =
      templateJson || {}

    let mappedFileIds = (templateFileIds || []).map(fileId => {
      return {
        fileId,
        type: 1,
      }
    })
    let mappedFileFileIds = (templateFileFieldIds || []).map(fieldId => {
      return {
        fieldId,
        type: 2,
      }
    })
    let mappedUrlStrings = (templateUrlStrings || [])
      .filter(url => !isEmpty(url))
      .map(urlString => {
        return {
          urlString,
          type: 3,
        }
      })
    attachmentList = [
      ...mappedFileIds,
      ...mappedUrlStrings,
      ...mappedFileFileIds,
    ]
    return attachmentList
  }
  onSaveAttachments(urlArray, fileIds, attachments, fileFieldIds) {
    this.templateJson.templateUrlStrings = urlArray
    this.templateJson.templateFileIds = fileIds

    this.templateJson.templateFileFieldIds = fileFieldIds
    this.templateJson.attachmentList = attachments
  }
  handleAddrChange(receiverType, userOptionList) {
    return handleAddrChange.bind(
      this,
      receiverType,
      userOptionList,
      true,
      true
    )()
  }
  removeDeletedUser(receiverType, userOptionList) {
    return removeDeletedUser.bind(this, receiverType, userOptionList)()
  }
  addModuleParam() {
    let { templateJson, moduleName } = this
    return addModuleParam.bind(this, templateJson, moduleName)()
  }
  getValue(user, module) {
    return '${' + this.getSubString(user, module) + '.email:-}'
  }
  getPrimaryEmailValue(user, module) {
    return '${' + this.getSubString(user, module) + '.primaryContactEmail:-}'
  }
  getSubString(user, module) {
    let { value, field, name } = user
    if (!isEmpty(value)) {
      return value
    }
    return `${module}.${field || name}`
  }
  getFieldNameValue(field, module) {
    let { name, lookupModule } = field || {}
    let { name: lookupModuleName } = lookupModule || {}
    if (!isEmpty(name)) {
      return `${name}.notif_mod_${lookupModuleName}`
    } else {
      return module
    }
  }
}
