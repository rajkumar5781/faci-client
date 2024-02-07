<template>
  <FContainer class="h-full">
    <CommentBox
      v-if="showCommentBox || (comments && comments.length)"
      ref="commentBox"
      :autofocus="showCommentBox"
      :placeholder="labelsMap.placeholder"
      :saveBtn="labelsMap.actions.save"
      :cancelBtn="labelsMap.actions.cancel"
      :toolbar="toolbar"
      @focus="closeAllReplyInputs"
      @save="createHandler"
    />
    <FContainer class="h-full">
      <FContainer
        v-if="loading"
        display="flex"
        class="h-full w-full"
        justifyContent="center"
        alignItems="center"
        marginTop="containerXxLarge"
      >
        <FSpinner :size="20"></FSpinner>
      </FContainer>
      <FContainer
        v-else-if="isEmpty(comments) && !showCommentBox"
        display="flex"
        class="h-full w-full"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <FEmptyState
          illustration="no-activities"
          :title="labelsMap.empty_state.title"
          :description="labelsMap.empty_state.description"
        >
          <template #buttons>
            <FButton
              iconGroup="social"
              iconName="comment"
              iconPosition="prefix"
              appearance="secondary"
              @click="showCommentBox = true"
              >Add Comment</FButton
            >
          </template>
        </FEmptyState>
      </FContainer>
      <template v-else>
        <CommentView
          v-for="(comment, index) in filteredComments"
          :key="comment.id"
          class="parent-comments"
          :comment="comment"
          :currentLevel="1"
          :index="index"
          :toolbar="toolbar"
          :labelsMap="labelsMap"
          @edit="editHandler"
          @delete="deleteHandler"
          @updateCommentSharing="updateCommentSharing"
          @refreshComments="loadComments()"
        ></CommentView>
        <FContainer
          v-if="comments && canShowViewMore"
          marginLeft="containerLarge"
          paddingLeft="containerXLarge"
        >
          <FButton appearance="link" @click="showMoreComments()">
            {{
              'View ' +
              moreCommentsCount +
              ' more ' +
              (moreCommentsCount > 1
                ? labelsMap.title.plural
                : labelsMap.title.singular)
            }}
          </FButton>
        </FContainer>
      </template>
    </FContainer>
  </FContainer>
</template>

<script>
import CommentView from './CommentView.vue'
import CommentBox from './CommentBox.vue'
import {
  FContainer,
  FEmptyState,
  FSpinner,
  FText,
  FButton,
} from '@facilio/design-system'
import cloneDeep from 'lodash/cloneDeep'
import { eventBus } from '../../event-bus'
import { isEmpty, areValuesEmpty } from '@facilio/utils/validation'
import { getCommentService } from './comment-service'
import { ftoast } from '@facilio/design-system'

const DEFAULT_LABELS = {
  title: {
    singular: 'comment',
    plural: 'comments',
  },
  actions: {
    save: 'Save',
    cancel: 'Cancel',
  },
  placeholder: 'Add a comment',
  empty_state: {
    title: 'No comments added yet',
    description: 'Be the first to leave a comment and start the conversation!',
  },
  delete_confirm: {
    title: 'Delete comment',
    description: 'Are you sure you want to delete this comment?',
  },
  comment_visibility: {
    title: 'Comment visibility',
    on_update: 'Comment visibility changed successfully!',
  },
}

export default {
  name: 'Notes',
  props: [
    'module',
    'parentModule',
    'record',
    'labels',
    'toolbar',
    'showMore',
    'resize',
    'sectionName'
  ],
  components: {
    FContainer,
    FEmptyState,
    FSpinner,
    FText,
    FButton,
    CommentBox,
    CommentView,
  },
  data() {
    return {
      CommentService: getCommentService(),
      comments: [],
      loading: true,
      showAllComments: false,
      showCommentBox: false,
    }
  },

  async created() {
    await this.init()
  },
  destroyed() {
    this.killActiveEvents()
    this.CommentService.$destroy()
  },

  provide() {
    return {
      CommentService: this.CommentService,
      fetchComments: this.fetchComments,
      resizeNotesWidget: this.resizeNotesWidget,
    }
  },

  computed: {
    labelsMap() {
      let { labels } = this
      labels = labels || {}
      return { ...DEFAULT_LABELS, ...labels }
    },
    defaultVisibleCommentsCount() {
      let { showMore } = this
      if (showMore) {
        if (typeof showMore == 'number') {
          return showMore
        } else if (typeof showMore == 'boolean') {
          return showMore ? 3 : -1
        }
      }
      return 3
    },
    filteredComments() {
      let { comments, defaultVisibleCommentsCount, showAllComments } = this
      if (isEmpty(comments) || areValuesEmpty(comments)) {
        return []
      } else {
        let filteredArr = cloneDeep(comments).sort(
          (a, b) => b.createdTime - a.createdTime
        )
        return showAllComments || defaultVisibleCommentsCount < 0
          ? filteredArr
          : filteredArr.slice(0, defaultVisibleCommentsCount)
      }
    },
    moreCommentsCount() {
      let { comments, filteredComments } = this
      return comments.length - filteredComments.length
    },
    canShowViewMore() {
      let { comments, showAllComments, defaultVisibleCommentsCount } = this
      return (
        !showAllComments &&
        comments &&
        comments.length > defaultVisibleCommentsCount
      )
    },
  },
  watch: {
    record: function () {
      this.loadComments()
    },
    comments: function () {
      if (
        this.record &&
        typeof this.record === 'object' &&
        this.setNoOfNotesLength
      ) {
        this.setNoOfNotesLength(this.comments.length)
      }
    },
  },
  methods: {
    isEmpty,
    async init() {
      await this.initCommentService()
      await this.initiateEventListeners()
      await this.loadComments()
    },
    async initCommentService() {
      this.setupCommentServiceData()
      this.prefillCommentSharing()
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
    setupCommentServiceData() {
      this.CommentService.module = this.module
      this.CommentService.parentModule = this.parentModule
      this.CommentService.record = this.record
      this.CommentService.isServicePortal = this.isServicePortal
      this.CommentService.getPeopleFieldForRecord()
    },

    initiateEventListeners() {
      eventBus.$on('woDescriptiontranslate', woDescriptiontranslate => {
        this.woDescriptiontranslate = woDescriptiontranslate
      })
      eventBus.$on('tictketnotes_reloadlist', this.loadComments)
      eventBus.$on('shrink-comment-text-area', this.blurCommentBox)
    },

    killActiveEvents() {
      eventBus.$off('woDescriptiontranslate', () => {
        this.woDescriptiontranslate = false
      })
      eventBus.$on('tictketnotes_reloadlist')
      eventBus.$off('shrink-comment-text-area')
    },
    closeAllReplyInputs() {
      eventBus.$emit('close-reply-text-area')
    },
    blurCommentBox() {
      this.$refs['commentBox'].expandTextBox = false
    },
    expandNotesWidget() {
      eventBus.$emit('expandNotesWidget')
    },
    createHandler(note) {
      this.comments.push(note)
    },
    editHandler(note) {
      let { comments } = this
      let existingNote = comments.find(r => r.id === note.id)
      if (existingNote) {
        let index = comments.indexOf(existingNote)
        this.comments.splice(index, 1, note)
      }
    },
    deleteHandler(note) {
      let { comments } = this
      let existingNote = comments.find(r => r.id === note.id)
      if (existingNote) {
        this.comments.splice(comments.indexOf(existingNote), 1)
      }
      this.resizeNotesWidget()
    },

    updateCommentSharing(comment) {
      let { comments, CommentService } = this
      let existComment = comments.find(c => c.id == comment.id)
      let commentIndex = comments.indexOf(existComment)
      this.$set(this.comments, commentIndex, comment)
      let { error } = CommentService.updateCommentSharing(comment)
      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        ftoast.success(this.labelsMap.comment_visibility.on_update)
      }
    },

    async loadComments() {
      let { CommentService, resizeNotesWidget } = this
      this.loading = true
      let { data, error } = await CommentService.fetchComments()
      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        this.comments = !isEmpty(data) ? data : []
      }
      this.loading = false
      resizeNotesWidget()
    },
    showMoreComments() {
      this.showAllComments = true
      this.resizeNotesWidget()
    },
    resizeNotesWidget(writeMode = false) {
      this.$nextTick(() => {
        setTimeout(() => {
          let height = this.$el.scrollHeight + 50
          let canIncrease = height > 250 && (this.comments.length || writeMode)
          height = canIncrease ? height : 250
          this.resize({ height })
        }, 100)
      })
    },
  },
}
</script>
