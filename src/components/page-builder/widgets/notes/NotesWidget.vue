<template>
  <FContainer class="h-full">
    <Comment
      :module="notesModule"
      :parentModule="moduleName"
      :record="details"
      :showMore="3"
      :resize="resizeWidget"
      :sectionName="sectionName"
    />
  </FContainer>
</template>

<script>
import { FContainer } from '@facilio/design-system'
import Comment from './Comment.vue'
import getProperty from 'dlv'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'NotesWidget',
  props: ['moduleName', 'details', 'resizeWidget', 'notesModuleName', 'widget','sectionName'],
  components: { FContainer, Comment },
  computed: {
    notesModule() {
      let { widget, notesModuleName } = this
      let name = getProperty(widget, 'widgetParams.notesModuleName')
      return !isEmpty(name) ? name : notesModuleName
    },
  },
}
</script>
