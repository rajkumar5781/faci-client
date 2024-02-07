<template>
  <Attachment
    ref="attachment"
    :module="attachmentsModule"
    :parentModule="moduleName"
    :record="details"
    :resize="resizeWidget"
    :groupActionPortal="groupActionPortal"
    :sectionName="sectionName"
  />
</template>

<script>
import { FContainer, FTooltip, FButton } from '@facilio/design-system'
import Attachment from './Attachment.vue'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'AttachmentWidget',
  components: { FContainer, FTooltip, FButton, Attachment },
  props: [
    'details',
    'widget',
    'groupActionPortal',
    'moduleName',
    'attachmentsModuleName',
    'resizeWidget',
    'sectionName'
  ],
  computed: {
    attachmentsModule() {
      let { widget, attachmentsModuleName } = this
      let name = getProperty(widget, 'widgetParams.attachmentsModuleName')
      return !isEmpty(name) ? name : attachmentsModuleName
    },
  },
}
</script>
