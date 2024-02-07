<script>
import { isEmpty, isArray } from '@facilio/utils/validation'
import isEqual from 'lodash/isEqual'
import dlv from 'dlv'
import { formatGeoLocation, formatDate } from '../../../../utils/formatter'
import {
  isBooleanField,
  isDecimalField,
  isEnumField,
  isSystemEnumField,
  isMultiEnumField,
  isDateField,
  isDateTimeField,
  isSpecialEnumField,
  isGeoLocationField,
} from '@facilio/utils/field'

const specialEnumFieldsMap = {
  urgency: {
    1: 'Not Urgent',
    2: 'Urgent',
    3: 'Emergency',
  },
  tenantType: {
    1: 'Commercial',
    2: 'Residential',
  },
}
const moduleSingularDisplayNameMap = {
  workorder: 'Work Order',
  workpermit: 'Work Permit',
  quotation: 'Quote',
  asset: 'Asset',
}
const isSystemStringEnum = field => {
  return (
    field.dataTypeEnum === 'STRING_SYSTEM_ENUM' ||
    (field.dataTypeEnum || {})._name === 'STRING_SYSTEM_ENUM'
  )
}

const isTimeField = fieldObj => {
  return !isEmpty(fieldObj) && fieldObj.displayType === 'TIME'
}

const getDisplayValue = (field, value) => {
  if (isDecimalField(field)) {
    let unit = field.unit ? field.unit : ''
    return Number(value).toFixed(2) + ' ' + unit
  } else if (isDateTimeField(field)) {
    return value > 0 ? formatDate(value) : '---'
  } else if (isDateField(field)) {
    return value > 0 ? formatDate(value, true) : '---'
  } else if (isBooleanField(field)) {
    return value ? field.trueVal || 'True' : field.falseVal || 'False'
  } else if (isSpecialEnumField(field)) {
    return specialEnumFieldsMap[field.name][parseInt(value)] || '---'
  } else if (isEnumField(field)) {
    return field.enumMap[parseInt(value)] || '---'
  } else if (isSystemEnumField(field)) {
    return field.enumMap[parseInt(value)] || '---'
  } else if (isSystemStringEnum(field)) {
    return field.enumMap[value] || '---'
  } else if (isMultiEnumField(field)) {
    let { enumMap } = field

    let valueStr = (value || []).reduce((accStr, value) => {
      let str = enumMap[value] || ''
      return isEmpty(accStr) ? `${str}` : `${accStr}, ${str}`
    }, '')

    return isEmpty(valueStr) ? '---' : valueStr
  } else if (isGeoLocationField(field)) {
    return !isEmpty(value)
      ? `${parseFloat(value.lat).toFixed(6)},${parseFloat(value.lng).toFixed(
          6
        )}`
      : ''
  } else if (isTimeField(field)) {
    return formatTimeField(value) || '---'
  } else {
    return value
  }
}
const formatTimeField = value => {
  let format = getTimeFormat()
  return dayjs().startOf('day').milliseconds(value).format(format)
}

const isMultiLookupField = fieldObj => {
  let { dataTypeEnum } = fieldObj || {}
  return (
    dataTypeEnum === 'MULTI_LOOKUP' ||
    (dataTypeEnum || {})._name === 'MULTI_LOOKUP'
  )
}

const isUrlField = fieldObj => {
  let { dataTypeEnum } = fieldObj || {}
  return (
    dataTypeEnum === 'URL_FIELD' || (dataTypeEnum || {})._name === 'URL_FIELD'
  )
}

export default {
  methods: {
    getUserName(id) {
      if (id) {
        let user = null
        // user = (this.users || []).find(us => us.ouid === id)

        // if (user) {
        //   return user.name
        // } else
        if (!isEmpty(this.portalUserList)) {
          user = (this.portalUserList || []).find(u => u.ouid === id)
          if (user) {
            return user.name
          } else {
            return '---1'
          }
        } else {
          return '---2'
        }
      } else {
        return '---3'
      }
    },
    // getUserAvatarUrl(id) {
    //   if (id) {
    //     let user = null
    //     user = (this.users || []).find(us => us.ouid === id)

    //     if (user) {
    //       return user.avatarUrl
    //     } else if (!isEmpty(this.portalUserList)) {
    //       user = (this.portalUserList || []).find(u => u.ouid === id)
    //       if (user) {
    //         return user.avatarUrl
    //       }
    //     }
    //   }
    //   return null
    // },
    getAttachmentsString(obj) {
      let str = ''
      for (let item = 0; item < (obj || []).length; item++) {
        if (item !== 0) {
          if (item === obj.length - 1) {
            str += ' and '
          } else {
            str += ', '
          }
        }
        str += obj[item]
      }
      return str
    },
    getAssignedBy(updatedFields) {
      let user = (updatedFields || []).find(el => el.fieldName === 'assignedTo')
      if (user.newValue) {
        return this.getUser(user.newValue.id).name
      } else if (user.oldValue) {
        return this.getUser(user.oldValue.id).name
      }
    },
    getLocation(value) {
      return formatGeoLocation(value)
    },
    getMessage(activity) {
      let { info } = activity || {}
      let { module, fieldsMap } = this
      if (module === 'newreadingalarm') {
        return this.processAlarmActivity(activity)
      } else if ([63, 64, 70, 71].includes(activity.type)) {
        return this.formatQuotationActivity(activity)
      } else if (activity.type === 75 && !isEmpty(info.changeSet)) {
        let filteredArr = info.changeSet.filter(a => {
          let { field: fieldName, newValue, oldValue } = a || {}
          let field = fieldsMap[fieldName] || {}
          let isMultiLookupChanged = true
          if (isMultiLookupField(field)) {
            isMultiLookupChanged =
              (newValue || []).length !== (oldValue || []).length
          }

          return (
            isMultiLookupChanged &&
            a.field !== 'modifiedTime' &&
            a.newValue !== -99 &&
            !(isEmpty(a.oldValue) && isEmpty(a.newValue)) &&
            !isEqual(a.oldValue, a.newValue) &&
            a.field !== 'moduleState' &&
            a.field !== 'sysModifiedTime'
          )
        })
        if (!isEmpty(filteredArr)) {
          return {
            message:
              '<span class="activity-bold-text">updated </span>' +
              filteredArr.reduce((accStr, activity) => {
                return isEmpty(accStr)
                  ? this.getValue(activity)
                  : `${accStr}, ${this.getValue(activity)}`
              }, ''),
          }
        } else {
          return { message: null }
        }
      } else {
        // 64,66,69,71,72 Common Activities for Comment, Attachments, Status Update, Approval, Approval Entry respectively
        // use same for other modules
        if (activity.type === 65) {
          return {
            message:
              '<span class="activity-bold-text"> added the Comment </span>' +
              '<span class="activity-normal-text !italic">' +
              '(' +
              (dlv(activity, 'info.Comment', '') || '')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;') +
              ')' +
              '</span>',
          }
        } else if ((activity || {}).type === 66) {
          return {
            message:
              '<span class="activity-bold-text">' +
              'attached ' +
              '</span>' +
              '<span class="activity-normal-text !italic">' +
              dlv(activity, ['info', 'attachment', 0, 'Filename'], '') +
              '</span>',
          }
        } else if ([69, 33].includes((activity || {}).type)) {
          return {
            message:
              '<span class="activity-bold-text">' +
              'updated status ' +
              '</span>' +
              '<span class="activity-normal-text">' +
              'from ' +
              '</span>' +
              '<span class="activity-normal-text !italic">' +
              (dlv(activity, 'info.oldValue', '') || '')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;') +
              ' to ' +
              (dlv(activity, 'info.newValue', '') || '')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;') +
              '</span>',
          }
        } else if ((activity || {}).type === 72) {
          // Approval Activity Message
          let { metaInfo } = this
          let { module } = metaInfo || {}
          let { displayName } = module || {}
          if (isEmpty(displayName)) {
            displayName = module
          }
          let approvalMessage = ``
          let approvalStatus = dlv(activity, 'info.status', '')
          let moduleSingularDisplayName = !isEmpty(
            moduleSingularDisplayNameMap[module]
          )
            ? moduleSingularDisplayNameMap[module]
            : displayName
          if (approvalStatus === 'Approved') {
            approvalMessage = `<span class="activity-bold-text"> approved the ${moduleSingularDisplayName}</span>`
          } else if (approvalStatus === 'Rejected') {
            approvalMessage = `<span class="activity-bold-text"> rejected the ${moduleSingularDisplayName}</span>`
          } else if (approvalStatus === 'Requested') {
            approvalMessage = `<span class="activity-bold-text"> resent for Approval.</span>`
          }
          return {
            message: approvalMessage,
          }
        } else if ((activity || {}).type === 73) {
          return {
            message: `<span class="activity-bold-text"> initiated Approval process</span>`,
          }
        } else if ((activity || {}).type === 109) {
          let employee = (info?.changeSet || []).find(
            a =>
              a.field === 'employee' &&
              a.newValue > 0 &&
              a.oldValue !== a.newValue
          )
          if (employee) {
            return {
              message: `<span class="activity-bold-text"> assigned <span class="activity-normal-text !italic">${(
                info.empName || ''
              )
                .replace(/</g, '&lt;')
                .replace(
                  />/g,
                  '&gt;'
                )}</span> to desk <span class="activity-normal-text !italic">${
                info.deskName
              }</span> </span>`,
            }
          } else {
            return { message: null }
          }
        } else if ((activity || {}).type === 110) {
          let employee = (info?.changeSet || []).find(
            a =>
              a.field === 'employee' &&
              a.oldValue > 0 &&
              a.oldValue !== a.newValue
          )
          if (employee) {
            return {
              message: `<span class="activity-bold-text"> unassigned <span class="activity-normal-text !italic">${(
                info.empName || ''
              )
                .replace(/</g, '&lt;')
                .replace(
                  />/g,
                  '&gt;'
                )}</span> from desk <span class="activity-normal-text !italic">${
                info.deskName
              }</span> </span>`,
            }
          } else {
            return { message: null }
          }
        }
      }
      return {
        message:
          '<span class="activity-bold-text">' +
          `${activity.message || ''}`
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;') +
          '</span>',
      }
    },
    getValue(info) {
      let { fieldsMap } = this
      let { field: fieldName, newValue, oldValue } = info || {}
      let field = fieldsMap[fieldName] || {}
      let displayValue = newValue
      let displayOldValue = oldValue

      if (!isEmpty(field)) {
        if (!isArray(displayValue) && Number(displayValue)) {
          displayValue = Number(displayValue)
        } else if (isArray(displayValue)) {
          if (displayValue.length > 5) {
            displayValue = `${displayValue.slice(0, 5).join(', ')} +${Math.abs(
              displayValue.length - 5
            )}`
          } else {
            displayValue = !isEmpty(displayValue)
              ? `${displayValue.join(', ')}`
              : '---'
          }
        }
        displayValue = getDisplayValue(field, displayValue)

        if (!isArray(displayOldValue) && Number(displayOldValue)) {
          displayOldValue = Number(displayOldValue)
        }

        if (!isEmpty(displayOldValue)) {
          if (isMultiLookupField(field)) {
            let lookupRecordNames = (displayOldValue || []).map(
              currRecord =>
                currRecord.displayName || currRecord.name || currRecord.subject
            )
            if (lookupRecordNames.length > 5) {
              displayOldValue = `${lookupRecordNames
                .slice(0, 5)
                .join(', ')} +${Math.abs(lookupRecordNames.length - 5)}`
            } else {
              displayOldValue = !isEmpty(lookupRecordNames)
                ? `${lookupRecordNames.join(', ')}`
                : '---'
            }
          } else if (isUrlField(field)) {
            let { href: displayOldValueHref } = displayOldValue || {}
            let { href: displayValueHref } = displayValue || {}

            displayOldValue = displayOldValueHref
            displayValue = displayValueHref
          } else {
            displayOldValue = getDisplayValue(field, displayOldValue)
          }
        }
      }
      if (!isEmpty(displayOldValue) && displayOldValue !== '---') {
        return (
          '<span class="activity-bold-text">' +
          `${info.displayName || ''}`
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;') +
          '</span>' +
          '<span class="activity-normal-text">' +
          ' from ' +
          '</span>' +
          '<span class="activity-normal-text !italic">' +
          `${displayOldValue || ''}`
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;') +
          '</span>' +
          '<span class="activity-normal-text">' +
          ' to ' +
          '</span>' +
          '<span class="activity-normal-text !italic">' +
          `${displayValue || ''}`.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
          '</span>'
        )
      }
      return (
        '<span class="activity-bold-text">' +
        `${info.displayName || ''}`
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;') +
        '</span>' +
        '<span class="activity-normal-text">' +
        ' as ' +
        '</span>' +
        '<span class="activity-normal-text !italic">' +
        `${displayValue || ''}`.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        '</span>'
      )
    },
    processAlarmActivity(activity) {
      if (activity.type === 50) {
        return {
          message:
            '<span class="activity-bold-text">created alarm occurrence </span>',
        }
      } else if (activity.type === 51) {
        return {
          message:
            '<span class="activity-bold-text"> created workorder </span>',
        }
      } else if (activity.type === 53) {
        return {
          message:
            '<span class="activity-bold-text"> Acknowledged Alarm </span>',
        }
      } else if (activity.type === 54) {
        return {
          message:
            '<span class="activity-bold-text"> added the Comment </span>' +
            '<span class="activity-normal-text !italic">' +
            '(' +
            activity.infoJsonStr.Comment.replace(/</g, '&lt;').replace(
              />/g,
              '&gt;'
            ) +
            ')' +
            '</span>',
        }
      } else if (activity.type === 56) {
        return {
          message:
            '<span class="activity-bold-text"> alarm occurrence cleared </span>',
        }
      } else if (activity.type === 57) {
        return {
          message: '<span class="activity-bold-text"> Auto Cleared </span>',
        }
      }
      return 'Activity'
    },
    formatQuotationActivity(activity) {
      let message = ''
      let val = dlv(activity, 'info.totalCost', null)
      let amount
      let { displaySymbol = '$' } = this.$account.data.currencyInfo || {}
      if (val) {
        val = Math.round((val + Number.EPSILON) * 100) / 100
        amount =
          displaySymbol === '$' || displaySymbol === '₹'
            ? displaySymbol + val
            : val + ' ' + displaySymbol
      }
      if (activity.type === 63) {
        message =
          `<span class="activity-bold-text"> Created the Quote for </span>` +
          (amount
            ? `<span class="activity-normal-text !italic">${amount
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')}</span>`
            : ``)
      } else if (activity.type === 64) {
        message =
          `<span class="activity-bold-text"> Updated the Quote.</span>` +
          (amount
            ? `<span class="activity-bold-text"> Amount changed to</span> <span class="activity-normal-text !italic">${amount
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')}</span>`
            : ``)
      } else if (activity.type === 70) {
        message = `<span class="activity-bold-text"> Associated Term(s)</span> <span class="activity-normal-text !italic">${(
          dlv(activity, 'info.termsName') || ''
        )
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</span>`
      } else if (activity.type === 71) {
        message = `<span class="activity-bold-text"> Disassociated Term(s) </span> <span class="activity-normal-text !italic">${(
          dlv(activity, 'info.termsName') || ''
        )
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</span>`
      }
      return {
        message,
      }
    },
  },
}
</script>
