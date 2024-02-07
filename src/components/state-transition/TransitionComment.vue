<template>
  <FModal
    :visible="true"
    size="M"
    :title="title"
    @ok="onSave"
    @cancel="onClose"
  >
    <CommentBox
      ref="commentBox"
      :placeholder="$t('comments.enter_comment')"
      :hideActionButton="true"
    ></CommentBox>
  </FModal>
</template>

<script>
import CommentBox from '../page-builder/widgets/notes/CommentBox.vue'
import { FContainer, FModal } from '@facilio/design-system'
import { getCommentService } from '../page-builder/widgets/notes/comment-service'
import { dset as setProperty } from 'dset'

export default {
  props: ['record', 'moduleName', 'transition'],
  data() {
    return {
      CommentService: getCommentService(),
    }
  },
  components: {
    CommentBox,
    FContainer,
    FModal,
  },
  computed: {
    title() {
      return this.transition?.name
    },
  },
  provide() {
    return {
      resizeNotesWidget: this.resizeNotesWidget,
      CommentService: this.CommentService,
    }
  },
  created() {
    setProperty(this.CommentService, 'record', this.record)
    setProperty(this.CommentService, 'parentModule', this.moduleName)
    this.prefillCommentSharing()
  },
  methods: {
    resizeNotesWidget() {
      this.$nextTick(() => {
        setTimeout(() => {
          let height = this.$el.scrollHeight + 50
          height = height > 250 && this.comments.length ? height : 250
          this.resize({ height })
        }, 100)
      })
    },
    resize(params) {
      return params
    },
    onClose() {
      this.$emit('onClose')
    },
    onSave() {
      let data = this.$refs['commentBox']?.setupNewComment()
      this.$emit('onSave', data)
    },
    async prefillCommentSharing() {
      let { CommentService } = this

      await CommentService.getSharingApps()
      if (CommentService.canShowSharing) {
        if (this.$refs['commentBox']) {
          this.$refs['commentBox'].commentSharing =
            CommentService.defaultSharingApps
        }
      }
    },
  },
}
</script>
