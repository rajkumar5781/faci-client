import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { fDialog } from '@facilio/design-system'
import { default as customAlertDialog } from '../CustomAlertDialog.js'

export const JOB_PLAN_SCOPE = {
  ASSETS: 1,
  SPACES: 2,
  ASSETCATEGORY: 3,
  SPACECATEGORY: 4,
  BUILDINGS: 5,
  SITES: 6,
  FLOORS: 7,
}
export const SCOPE_CATEGORY_PLACEHOLDER = {
  ASSETS: 'Assets',
  SPACES: 'Spaces',
  ASSETCATEGORY: 'Assets',
  SPACECATEGORY: 'Spaces',
  BUILDINGS: 'Buildings',
  SITES: 'Sites',
  FLOORS: 'Floors',
}
export const SCOPE_PLACEHOLDER = {
  ASSETS: 'Assets',
  SPACES: 'Spaces',
  ASSETCATEGORY: 'Asset Category',
  SPACECATEGORY: 'Space Category',
  BUILDINGS: 'Buildings',
  SITES: 'Sites',
  FLOORS: 'Floors',
}
export const SCOPE_CATEGORY_SINGULAR_PLACEHOLDER = {
  ASSETS: 'Asset',
  SPACES: 'Space',
  ASSETCATEGORY: 'Asset',
  SPACECATEGORY: 'Space',
  BUILDINGS: 'Building',
  SITES: 'Site',
  FLOORS: 'Floor',
}

export const SCOPE_ICON_PLACEHOLDER = {
  ASSETS: { iconGroupName: 'webtabs', iconName: 'asset' },
  SPACES: { iconGroupName: 'webtabs', iconName: 'space' },
  ASSETCATEGORY: { iconGroupName: 'webtabs', iconName: 'asset' },
  SPACECATEGORY: { iconGroupName: 'webtabs', iconName: 'space' },
  BUILDINGS: { iconGroupName: 'portfolio', iconName: 'building' },
  SITES: { iconGroupName: 'default', iconName: 'site' },
  FLOORS: { iconGroupName: 'product', iconName: 'floor-v2' },
}

export const PUBLISH_STATUS = {
  Unpublish: 1,
  Publish: 2,
  Disable: 3,
  'Pending Revision': 4,
  Revised: 5,
}

export const PUBLISHED_STATUS = {
  1: 'Unpublished',
  2: 'Published',
  3: 'Disabled',
  4: 'Pending Revision',
  5: 'Revised',
}

export const PUBLISHED_STATUS_ICON_HASH = {
  1: 'unpublish',
  2: 'published',
  3: 'disabled',
  4: 'pending-revision',
  5: 'revised',
}

export const PUBLISHED_STATUS_ICON_COLOR_HASH = {
  unpublish: '#ff5533',
  published: '#009945',
  disabled: '#b8c0c6',
  'pending-revision': '#fa942e',
  revised: '#71818e',
}

export const FREQUENCY_HASH = {
  1: 'DAILY',
  2: 'WEEKLY',
  3: 'MONTHLY_DATE',
  4: 'MONTHLY_WEEK',
  5: 'ANNUALLY_DATE',
  6: 'ANNUALLY_WEEK',
  7: 'QUARTERLY_DATE',
  8: 'QUARTERLY_WEEK',
  9: 'HALF_YEARLY_DATE',
  10: 'HALF_YEARLY_WEEK',
}

export const FREQUENCY_TYPE_ENUM_HASH = {
  DAILY: 'Daily',
  MONTHLY: 'Monthly',
  MONTHLY_DATE: 'Monthly | Date',
  MONTHLY_WEEK: 'Monthly | Week',
  ANNUALLY_DATE: 'Annually | Date',
  ANNUALLY_WEEK: 'Annually | Week',
  QUARTERLY_DATE: 'Quarterly | Date',
  QUARTERLY_WEEK: 'Quarterly | Week',
  HALF_YEARLY_DATE: 'Half Yearly | Date',
  HALF_YEARLY_WEEK: 'Half Yearly | Week',
}

export const getResourcePlaceholder = (pmRecord, isUpperCase, isSingular) => {
  let placeholder = 'Resource'
  if (!isEmpty(pmRecord)) {
    let { assignmentTypeEnum } = pmRecord || {}
    if (isSingular) {
      placeholder =
        SCOPE_CATEGORY_SINGULAR_PLACEHOLDER[assignmentTypeEnum] || 'Resource'
    } else {
      placeholder = SCOPE_CATEGORY_PLACEHOLDER[assignmentTypeEnum] || 'Resource'
    }
  }
  if (!isUpperCase) {
    placeholder = placeholder.toLowerCase()
  }
  return placeholder
}

export const getResourcePlannerListPlaceholder = (pmRecord, count) => {
  let placeholder = 'Count'
  if (!isEmpty(pmRecord)) {
    let { assignmentTypeEnum } = pmRecord || {}
    placeholder = `${SCOPE_CATEGORY_SINGULAR_PLACEHOLDER[assignmentTypeEnum]} Count: ${count}`
  }

  return placeholder
}

export const getPlaceholderText = props => {
  let { pmRecord, text, isUpperCase, modifyText, replaceAll, isSingular } =
    props || {}
  let resourcePlaceholder = getResourcePlaceholder(
    pmRecord,
    isUpperCase,
    isSingular
  )
  let replaceableText = 'Resources'
  if (!isUpperCase) {
    replaceableText = 'resources'
    resourcePlaceholder = resourcePlaceholder.toLowerCase()
  }
  if (!isEmpty(modifyText)) {
    replaceableText = modifyText
  }
  if (replaceAll) return text.replaceAll(replaceableText, resourcePlaceholder)
  else return text.replace(replaceableText, resourcePlaceholder)
}

export const getResourceIconPlaceholder = pmRecord => {
  let placeholder = {}
  if (!isEmpty(pmRecord)) {
    let { assignmentTypeEnum } = pmRecord || {}
    placeholder = SCOPE_ICON_PLACEHOLDER[assignmentTypeEnum]
    placeholder.hoverMessage = SCOPE_CATEGORY_PLACEHOLDER[assignmentTypeEnum]
  }

  return placeholder
}

export function getCategoryFilter(pmRecord, category) {
  let categoryHash = { 3: 'assetCategory', 4: 'spaceCategory' }
  let categoryFilter = {}
  let selectedCategory = categoryHash[category] || {}

  if (!isEmpty(selectedCategory)) {
    let categoryId = getProperty(pmRecord, `${selectedCategory}.id`, null)

    if (!isEmpty(categoryId)) {
      categoryFilter = {
        [selectedCategory]: { operatorId: 54, value: [`${categoryId}`] },
      }
    }
  }
  return categoryFilter
}

/* Helper method to open a Warning Dialog */
export function getWarningDialogValue(
  title,
  description,
  saveText,
  cancelText
) {
  return fDialog.warning({
    title,
    description,
    saveText,
    cancelText,
  })
}

export function getCustomAlertDialog(
  title,
  description,
  descriptionHighlighted,
  showHighlightedDescriptionFirst,
  saveText,
  cancelText
) {
  return customAlertDialog.warning({
    title,
    description,
    descriptionHighlighted,
    showHighlightedDescriptionFirst,
    saveText,
    cancelText,
  })
}

export const dataTypeKey = {
  1: 'STRING',
  2: 'NUMBER',
  3: 'DECIMAL',
  4: 'BOOLEAN',
  6: 'DATE_TIME',
}
