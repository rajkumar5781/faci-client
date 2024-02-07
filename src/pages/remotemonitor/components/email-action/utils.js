import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { API } from '@facilio/api'

export const Modules = {
  WORKORDER: 'workorder',
  WORKREQUEST: 'workorderrequest',
  ALARM: 'alarm',
}

export const Fields = {
  REQUESTER: 'requester',
  REQUESTED_BY: 'requestedBy',
  ASSIGNED_BY: 'assignedBy',
  ASSIGNED_TO: 'assignedTo',
  ASSIGNED_GROUP: 'assignmentGroup',
  VENDOR: 'vendor',
  TENANT: 'tenant',
  SYS_CREATED_BY: 'sysCreatedBy',
}

export const notifConfig = {
  'Approve Workrequest_11': {
    options: [Fields.REQUESTER],
    module: Modules.WORKREQUEST,
    isUsersEditable: true,
  },
  'Reject Workrequest_11': {
    options: [Fields.REQUESTER],
    module: Modules.WORKREQUEST,
    isUsersEditable: true,
  },
  'Notify Requester on Closing Workorder_11': {
    options: [Fields.REQUESTER],
    module: Modules.WORKORDER,
    isUsersEditable: true,
  },
  'Technician Closes Workorder_11': {
    options: [Fields.ASSIGNED_TO, Fields.ASSIGNED_BY],
    module: Modules.WORKORDER,
  },
  'Assign Tech_11': {
    options: [Fields.ASSIGNED_TO],
    module: Modules.WORKORDER,
    isUsersEditable: true,
  },
  'Assign Team_11': {
    options: [Fields.ASSIGNED_GROUP],
    module: Modules.WORKORDER,
    isUsersEditable: true,
  },
  'Add Comment_11': {
    options: [Fields.ASSIGNED_TO, Fields.ASSIGNED_BY],
    module: Modules.WORKORDER,
  },
  'Technician Resolves Workorder_11': {
    options: [Fields.ASSIGNED_TO, Fields.ASSIGNED_BY],
    module: Modules.WORKORDER,
  },
  'Workorder on hold_11': {
    options: [Fields.ASSIGNED_BY],
    module: Modules.WORKORDER,
  },
  Approval: {
    options: [Fields.REQUESTED_BY, Fields.REQUESTER],
    module: Modules.WORKORDER,
  },
}

export const sysCreatedByUserOption = {
  label: 'Created By',
  field: Fields.SYS_CREATED_BY,
}

export const handleAddrChange = function (
  receiverType,
  userOptionList,
  isPlaceHolder,
  isEmail
) {
  let selectedReceivers = this.templateJson[receiverType] || []
  userOptionList = {
    ...(userOptionList || {}),
    ...(isPlaceHolder ? { placeHolders: [] } : {}),
    ...(isEmail ? { emailIds: [] } : {}),
    ['Deleted User']: [],
  }
  let valuedOptions = Object.values(userOptionList)
  let receiverValuesArr = valuedOptions.reduce((prev, arr) => {
    let isNumber = isNaN(getProperty(arr, '0.value') || NaN)
    if (isNumber) {
      prev.push(...(arr || []).map(obj => obj.value))
    }
    return prev
  }, [])
  let { users } = userOptionList || {}
  let selectedUsers = (selectedReceivers || []).filter(id => !isNaN(id))
  let notFoundUsers = (selectedUsers || []).filter(id => {
    let userListIds = (users || []).map(user => user.value)
    return !userListIds.includes(id)
  })
  selectedReceivers = (selectedReceivers || []).filter(value => {
    return isNaN(value) && !receiverValuesArr.includes(value)
  })
  if (!isEmpty(notFoundUsers)) {
    userOptionList['Deleted User'] = (notFoundUsers || []).map(id => {
      return { label: `${id}`, value: id }
    })
  }
  selectedReceivers = selectedReceivers || []
  let emailIds = []
  let placeHolders = []
  ;(selectedReceivers || []).forEach(receiver => {
    let receiverObj = { label: receiver, value: receiver }
    if (isEmail && validateEmail(receiver)) {
      emailIds.push(receiverObj)
    } else if (isPlaceHolder && receiver.startsWith('${cs.')) {
      placeHolders.push(receiverObj)
    } else {
      receiverTypeList = getProperty(this, `templateJson.${receiverType}`, [])
      let valueIndex = (receiverTypeList || []).findIndex(
        value => value === receiver
      )

      if (valueIndex !== -1) {
        receiverTypeList.splice(valueIndex, 1)
      }
    }
  })
  userOptionList.emailIds = emailIds
  userOptionList.placeHolder = placeHolders
  return userOptionList
}
export const addModuleParam = function (templateJson, moduleName) {
  let workflowParameters = getProperty(templateJson, 'workflow.parameters')
  let { ftl } = templateJson || {}
  let isModuleInWorkflow =
    ftl &&
    !isEmpty(workflowParameters) &&
    workflowParameters.some(param => param.name === moduleName)
  if (!isModuleInWorkflow) {
    let parameters = getProperty(templateJson, 'workflow.parameters', [])
    parameters.push({
      name: moduleName,
      typeString: 'String',
    })
    templateJson.workflow.parameters = parameters
  }
}
export const fetchUsers = async function (
  search = '',
  appIdProp = null,
  receiverTypeList = ['to']
) {
  let { application: appId } = this.templateJson || {}
  let userList = [],
    defaultIds = []
  let params = {
    page: 1,
    perPage: 20,
    inviteAcceptStatus: true,
    appId: !isEmpty(appIdProp) ? appIdProp : appId,
    search: !isEmpty(search) ? search : null,
  }
  receiverTypeList = receiverTypeList || []
  receiverTypeList.forEach(type => {
    let endList = getProperty(this, 'templateJson.type', null)
    if (!isEmpty(endList)) {
      let userIds = (endList || []).filter(id => typeof id === 'number')
      defaultIds = [...defaultIds, ...userIds]
    }
  })
  defaultIds = [...new Set(defaultIds)]
  if (!isEmpty(defaultIds) && isEmpty(search)) {
    params.defaultIds = defaultIds
    params.perPage = defaultIds.length > 20 ? defaultIds.length : 20
  }

  let { data, error } = await API.get('/setup/newUserList', params)
  if (!error) {
    userList = (data?.users || []).map(user => {
      let { id, name, email } = user
      return {
        value: id,
        label: `${name} (${email})`,
      }
    })
  }
  return { data: userList, error }
}
export const removeDeletedUser = function (receiverType, userOptionList) {
  let selectedReceivers = this.templateJson[receiverType] || []
  let dUserId = (userOptionList['Deleted User'] || []).map(user => user.value)
  let receiverWithoutDUser = selectedReceivers.filter(
    id => !dUserId.includes(id)
  )
  delete userOptionList['Deleted User']
  this.templateJson[receiverType] = receiverWithoutDUser
  return userOptionList
}

export const getUsersFromTemplate = function (template, property) {
  let userIds = []
  let key = template.originalTemplate.hasOwnProperty('id') ? 'id' : 'to'
  if (property) {
    key = property
  }
  if (!template.originalTemplate[key]) {
    return userIds
  }
  let userMails = Array.isArray(template.originalTemplate[key])
    ? template.originalTemplate[key]
    : template.originalTemplate[key].split(',')
  if (template.workflow.expressions.length) {
    for (let i = 0; i < template.workflow.expressions.length; i++) {
      let exp = template.workflow.expressions[i]
      if (
        (exp.fieldName === 'email' ||
          exp.fieldName === 'ouid' ||
          exp.fieldName === 'phone') &&
        (exp.moduleName === 'users' || exp.moduleName === 'groups') &&
        exp.aggregateString === '[0]'
      ) {
        if (exp.criteria.conditions && exp.criteria.conditions[1].value) {
          let userId = parseInt(exp.criteria.conditions[1].value)
          if (userIds.indexOf(userId) === -1) {
            if (exp.name.startsWith('bcc_')) {
              if (key === 'bcc') {
                userIds.push(userId)
              }
            } else if (exp.name.startsWith('cc_')) {
              if (key === 'cc') {
                userIds.push(userId)
              }
            } else {
              if (['to', 'id'].includes(key)) {
                userIds.push(userId)
              }
            }
          }
        }
      } else if (
        exp.defaultFunctionContext &&
        [
          'getRoleEmails',
          'getRolePhone',
          'getRoleOuids',
          'getRolePhoneCall',
          'getRoleWhatsapp',
        ].includes(exp.defaultFunctionContext.functionName)
      ) {
        userIds.push(parseInt(exp.defaultFunctionContext.params.split(',')))
        template.toType = 'role'
      } else if (
        !isEmpty(exp) &&
        !isEmpty(exp.defaultFunctionContext) &&
        ['getAudienceEmail'].includes(exp.defaultFunctionContext.functionName)
      ) {
        template.toType = 'audience'
        userIds.push(exp.name)
      } else if (exp.constant) {
        let mail = userMails.find(
          mail => mail.replace(':-', '').replace('!""', '') === exp.constant
        )
        if (mail) {
          userIds.push(mail)
        }
      }
    }
  } else if (
    template.workflow.parameters &&
    template.workflow.parameters.length
  ) {
    template.workflow.parameters.forEach(param => {
      let mail = userMails.find(
        mail =>
          mail.replace(':-', '').replace('!""', '') === '${' + param.name + '}'
      )
      if (mail) {
        userIds.push(mail)
      }
    })
  } else {
    userMails.forEach(mail => {
      let user = this.users.find(user => user.email === mail)
      if (user) {
        userIds.push(parseInt(user.id))
      }
    })
  }
  userMails.forEach(mail => {
    if (isNaN(mail) && mail.startsWith('${cs.')) {
      let placeHolder = mail
      userIds.push(placeHolder)
    }
  })
  if (!userIds.length) {
    userIds = userMails
  }
  return userIds
}

export const setUserMailWorkflow = function (
  ids,
  mailTemplate,
  mode,
  module,
  isFtl,
  ccDetails,
  bccDetails
) {
  if (!mailTemplate) {
    mailTemplate = {}
  }

  if (!mailTemplate.workflow) {
    mailTemplate.workflow = {}
  }
  if (!mailTemplate.workflow.parameters) {
    mailTemplate.workflow.parameters = []
  }
  if (!mailTemplate.workflow.expressions) {
    mailTemplate.workflow.expressions = []
  }

  if (isFtl) {
    if (!mailTemplate.workflow.parameters.find(param => param.name === 'org')) {
      mailTemplate.workflow.parameters.push({
        name: 'org',
        typeString: 'String',
      })
    }
    if (
      !mailTemplate.workflow.parameters.find(param => param.name === 'user')
    ) {
      mailTemplate.workflow.parameters.push({
        name: 'user',
        typeString: 'String',
      })
    }
  } else if (
    !mailTemplate.workflow.parameters.find(param => param.name === 'org.domain')
  ) {
    mailTemplate.workflow.parameters.push({
      name: 'org.domain',
      typeString: 'String',
    })
  }
  mailTemplate.workflow.expressions = mailTemplate.workflow.expressions.filter(
    exp =>
      exp.fieldName !== 'email' &&
      exp.fieldName !== 'ouid' &&
      exp.fieldName !== 'mobile' &&
      exp.moduleName !== 'users' &&
      exp.moduleName !== 'groups' &&
      exp.aggregateString !== '[0]' &&
      exp.name !== 'org.domain'
  )
  if (!isFtl) {
    mailTemplate.workflow.expressions.push({
      name: 'org.domain',
      constant: '$' + '{org.domain}',
    })
  }
  mailTemplate.workflow.workflowString = null

  let mailKey = mode === 'mobile' ? 'id' : 'to'
  setMailTemplateExpression(ids, mailTemplate, mailKey, mode, module, isFtl)
  if (ccDetails) {
    let ccIds = ccDetails.ids
    let ccKey = ccDetails.key
    setMailTemplateExpression(ccIds, mailTemplate, ccKey, mode, module, isFtl)
  }
  if (bccDetails) {
    let bccIds = bccDetails.ids
    let bccKey = bccDetails.key
    setMailTemplateExpression(bccIds, mailTemplate, bccKey, mode, module, isFtl)
  }

  return mailTemplate
}
export const setExpressionFromPlaceHolder = function (workflow, str, module) {
  let placeHolders = getPlaceholders(str)
  if (!placeHolders.length) {
    return
  }

  if (!workflow.parameters) {
    workflow.parameters = []
  }
  if (!workflow.expressions) {
    workflow.expressions = []
  }
  placeHolders.forEach(placeHolder => {
    if (!workflow.parameters.some(param => param.name === placeHolder)) {
      workflow.parameters.push({ name: placeHolder, typeString: 'String' })
    }
    if (!workflow.expressions.some(param => param.name === placeHolder)) {
      if (module && placeHolder === 'getTransitionPermaLink') {
        addTransitionPermaLinkExpr(workflow, placeHolder, module)
      } else {
        workflow.expressions.push({
          name: placeHolder,
          constant: '${' + placeHolder + '}',
        })
      }
    }
  })
}
function setMailTemplateExpression(
  ids,
  mailTemplate,
  mailKey,
  mode,
  module,
  isFtl
) {
  mailTemplate[mailKey] = ''
  ids = ids.filter((id, i) => {
    if (isNaN(id)) {
      if (id.includes('notif_mod_audience')) {
        mailTemplate.toType = 'audience'
        return true
      }
      mailTemplate[mailKey] += id
      if (i + 1 !== ids.length) {
        mailTemplate[mailKey] += ','
      }
      if (!id.startsWith('${cs.')) {
        let value = id.replace(/[:\\-]/g, '')
        if (
          !mailTemplate.workflow.expressions.find(exp => exp.constant === value)
        ) {
          let name = value.replace(/[${}]/g, '')
          mailTemplate.workflow.expressions.push({
            name: name,
            constant: value,
          })
          mailTemplate.workflow.parameters.push({
            name: name,
            typeString: 'String',
          })
        }
      }
      return false
    }
    return true
  })

  let roleFunc = {
    mail: 'getRoleEmails',
    sms: 'getRolePhone',
    phonecall: 'getRolePhoneCall',
    whatsapp: 'getRoleWhatsapp',
    mobile: 'getRoleOuids',
  }

  // TODO remove expressions for mobile to
  for (let i = 0; i < ids.length; i++) {
    let lastCharIndex = mailTemplate[mailKey].length - 1

    if (
      i === 0 &&
      mailTemplate[mailKey] &&
      mailTemplate[mailKey][lastCharIndex] !== ','
    ) {
      mailTemplate[mailKey] += ','
    }

    let expName =
      (mailKey === 'cc' ? 'cc_' : '') +
      (mailKey === 'bcc' ? 'bcc_' : '') +
      'user_' +
      (mode ? ExpKeys[mode] : 'email') +
      (i + 1)

    if (mailTemplate.toType === 'audience') {
      expName = ids[i]
    }

    mailTemplate[mailKey] += '$' + '{' + expName
    if (isFtl) {
      mailTemplate[mailKey] += '!}'
    } else {
      mailTemplate[mailKey] += ':-}'
    }

    if (i + 1 !== ids.length) {
      mailTemplate[mailKey] += ','
    }
    if (mailTemplate.toType === 'role') {
      let roleId = ids[i]

      mailTemplate.workflow.expressions.push({
        name: expName,
        defaultFunctionContext: {
          nameSpace: 'system',
          functionName: roleFunc[mode],
          params: roleId + ',${' + module + '.resource.id}',
        },
      })
      addParam(mailTemplate.workflow, module + '.resource.id', 'Number')
    } else if (mailTemplate.toType === 'audience') {
      let audienceFieldName = ids[i].substring(
        0,
        ids[i].indexOf('.notif_mod_audience')
      )
      mailTemplate.workflow.expressions.push({
        name: expName,
        defaultFunctionContext: {
          nameSpace: 'system',
          functionName: 'getAudienceEmail',
          params:
            `'${audienceFieldName}','${module}','` + '${' + module + ".id}'",
        },
      })
      addParam(mailTemplate.workflow, module + '.id', 'Number')
    } else if (mailTemplate.toType === 'group') {
      mailTemplate.workflow.expressions.push({
        name: expName,
        fieldName: mode
          ? ExpKeys[mode] === 'id'
            ? 'groupId'
            : ExpKeys[mode]
          : 'email',
        moduleName: 'groups',
        aggregateString: '[0]',
        criteria: {
          pattern: '(1)',
          conditions: {
            1: {
              fieldName: 'groupId',
              operatorId: 9,
              sequence: '1',
              value: ids[i],
            },
          },
        },
      })
    } else {
      mailTemplate.workflow.expressions.push({
        name: expName,
        fieldName: mode
          ? ExpKeys[mode] === 'id'
            ? 'ouid'
            : ExpKeys[mode]
          : 'email',
        moduleName: 'users',
        aggregateString: '[0]',
        criteria: {
          pattern: '(1)',
          conditions: {
            1: {
              fieldName: 'ouid',
              operatorId: 9,
              sequence: '1',
              value: ids[i],
            },
          },
        },
      })
    }
  }
}

function addTransitionPermaLinkExpr(workflow, placeHolder, module) {
  workflow.expressions.push(
    {
      name: placeHolder + 's',
      defaultFunctionContext: {
        nameSpace: 'default',
        functionName: 'getTransitionPermaLink',
        params:
          "'" +
          window.location.protocol +
          '//' +
          window.location.host +
          "'," +
          module +
          ".id,'/link/1','" +
          module +
          "'",
      },
    },
    {
      name: placeHolder,
      defaultFunctionContext: {
        nameSpace: 'list',
        functionName: 'get',
        params: placeHolder + "s, '0'",
      },
    }
  )
  addParam(workflow, module + '.id', 'Number')
}

function addParam(workflow, name, type) {
  if (!workflow.parameters) {
    workflow.parameters = []
  }
  let params = workflow.parameters
  if (!params.find(param => param.name === name)) {
    params.push({ name: name, typeString: type || 'String' })
  }
}

function validateEmail(email) {
  let emailRegx =
    /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (emailRegx.test(email) === false) {
    return false
  }
  return true
}

function getPlaceholders(str) {
  return this.execRegex(str, /(\$\{([^\\:}]*))/g, 2)
}
const ExpKeys = {
  mail: 'email',
  sms: 'phone',
  whatsapp: 'phone',
  phonecall: 'phone',
  web: 'id',
  mobile: 'id',
}
