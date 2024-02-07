<template>
  <FContainer display="flex" flexDirection="column">
    <CommentBox
      v-if="showEdit"
      :value="comment"
      :toolbar="toolbar"
      :isEdit="showEdit"
      :saveBtn="labelsMap.actions.save"
      :cancelBtn="labelsMap.actions.cancel"
      @save="emitUpdate"
      @close="showEdit = false"
    />
    <FContainer v-else display="flex" :padding="commentViewPadding">
      <FAvatar
        :userName="userName"
        style="margin-top: var(--spacing-containerMedium)"
      />
      <FContainer width="100%">
        <FContainer
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          marginLeft="containerXLarge"
        >
          <FContainer display="flex" gap="containerLarge" alignItems="center">
            <FText
              appearance="headingMed14"
              color="textDescription"
              v-if="comment.createdBy && comment.createdBy.id"
            >
              {{ comment.createdBy.name }}
            </FText>
            <FDivider height="12px" width="0px" />
            <FTooltip>
              <template slot="title">{{
                formatDate(comment.createdTime)
              }}</template>
              <FText appearance="captionReg12" color="textCaption">
                {{ fromNow(comment.createdTime) }}
              </FText>
            </FTooltip>
          </FContainer>
          <FDropdown
            v-if="commentMoreOptions"
            :options="commentMoreOptions"
            :split="false"
            :buttonProps="{ appearance: 'tertiary' }"
            contentWidth="150px"
            @dropdown="option => editDeleteHandler(option, comment)"
          >
            <FIcon
              group="action"
              name="options-horizontal"
              size="16"
              color="textCaption"
            ></FIcon>
          </FDropdown>
        </FContainer>
        <FContainer
          class="comment-body-style"
          marginLeft="containerXLarge"
          v-if="comment.bodyHTML"
          ><div v-html="sanitize(comment.bodyHTML)"></div
        ></FContainer>
        <FContainer marginTop="containerLarge" marginLeft="containerXLarge">
          <CommentAttachments
            v-if="canShowAttachments"
            :attachments="comment.attachments"
          ></CommentAttachments>
        </FContainer>
        <FContainer
          display="flex"
          alignItems="center"
          gap="containerLarge"
          margin="containerMedium containerMedium"
        >
          <FButton
            appearance="tertiary"
            iconGroup="communication"
            iconName="reply"
            iconPosition="prefix"
            size="small"
            @click="showOrHideReply({})"
          >
            <FText color="textCaption" appearance="captionMed12">{{
              'Reply'
            }}</FText>
          </FButton>
          <template
            v-if="
              toolbar?.comment_visibility == false ||
              isReply ||
              !CommentService.canShowSharing
                ? false
                : true
            "
          >
            <FDivider height="12px" width="0px" />
            <CommentVisiblity
              v-model="comment.commentSharing"
              :apps="CommentService.portalApps"
              :disable="!comment.editAvailable"
              @change="() => updateCommentSharing(comment)"
            >
              <FButton
                appearance="tertiary"
                iconGroup="default"
                :iconName="isPublicComment ? 'eye-open' : 'eye-slashed'"
                iconPosition="prefix"
                color="textCaption"
                size="small"
              >
                <FText color="textCaption" appearance="captionMed12">{{
                  isPublicComment ? 'Public' : 'Private'
                }}</FText>
              </FButton>
            </CommentVisiblity>
          </template>
        </FContainer>
        <FContainer marginTop="containerLarge" marginLeft="containerXLarge">
          <FContainer v-if="canShowCommentBar || canShowReplies">
            <FContainer v-if="canShowCommentBar" class="comment-reply-thread">
              <CommentBox
                ref="reply-input"
                :parentNote="comment"
                :placeholder="$t('comments.add_a_reply')"
                :saveBtn="labelsMap.actions.save"
                :cancelBtn="labelsMap.actions.cancel"
                :toolbar="toolbar"
                :referer="refererForReply"
                @save="createHandler"
                @close="showOrHideReply"
              >
              </CommentBox>
            </FContainer>

            <FContainer
              v-if="loading"
              class="h-24 flex items-center justify-center"
            >
              <FSpinner :size="20"></FSpinner>
            </FContainer>
            <FContainer v-else-if="canShowReplies" class="comment-reply-thread">
              <RecursiveComment
                v-for="(reply, replyIndex) in filteredReplies"
                :key="reply.id"
                :comment="reply"
                :currentLevel="currentLevel + 1"
                :index="replyIndex"
                :labelsMap="labelsMap"
                @edit="editHandler"
                @delete="deleteHandler"
                @replyParent="showOrHideReply"
              ></RecursiveComment>
            </FContainer>
          </FContainer>
          <FButton
            v-if="showRepliesButton"
            appearance="link"
            size="small"
            @click="viewMoreReplies"
          >
            {{ repliesExpandText }}</FButton
          >
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FSpinner,
  FAvatar,
  FDivider,
  FText,
  FTooltip,
  FButton,
  FDropdown,
  FIcon,
} from '@facilio/design-system'
import CommentBox from './CommentBox.vue'
import CommentVisiblity from './CommentVisiblity.vue'
import CommentAttachments from './CommentAttachments.vue'
import { eventBus } from '../../event-bus'
import { API } from '@facilio/api'
import { isEmpty, areValuesEmpty } from '@facilio/utils/validation'
import { fromNow, formatDate } from '../../../../utils/formatter'
import { ftoast, fDialog } from '@facilio/design-system'
import { cloneObject } from '../../../../utils/helpers'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { sanitize } from '@facilio/utils/sanitize'
import './comment.css'

const RECORD_MENTION_CLASS = 'comment-mentions-record'
export default {
  name: 'RecursiveComment',
  inject: ['CommentService', 'resizeNotesWidget'],
  props: ['comment', 'index', 'toolbar', 'currentLevel', 'labelsMap'],
  components: {
    FContainer,
    FSpinner,
    FAvatar,
    FDivider,
    FText,
    FTooltip,
    FButton,
    FDropdown,
    FIcon,
    CommentBox,
    CommentVisiblity,
    CommentAttachments,
  },
  data() {
    return {
      canShowReplyInput: false,
      peoplePopoverVisible: false,
      canShowReplies: false,
      showEdit: false,
      repliesCount: 0,
      replies: [],
      loading: false,
      refererForReply: null,
      replyBtnHover: false,
      sharingIconHover: false,
      peoplePopoverReference: null,
      users: [],
      sanitize,
    }
  },
  computed: {
    userName() {
      let { $account } = this || {}
      let { user } = $account || {}
      let { name } = user || {}
      return name
    },
    commentMoreOptions() {
      let { comment } = this
      let { $account } = this || {}
      let { user } = $account || {}
      if ((comment.createdBy || {}).id === user.id) {
        return [
          { label: 'Edit', value: 'edit' },
          { label: 'Delete', value: 'delete' },
        ]
      }
      return null
    },
    commentViewPadding() {
      let { currentLevel } = this || {}
      if (currentLevel > 1)
        return 'containerLarge containerNone containerLarge containerXxLarge'
      else return 'containerLarge containerXxLarge'
    },
    canShowCommentBar() {
      let { currentLevel, canShowReplyInput } = this
      return currentLevel === 1 && canShowReplyInput
    },
    showRepliesButton() {
      let { repliesCount, currentLevel, canShowReplies } = this
      return repliesCount > 0 && currentLevel === 1 && !canShowReplies
    },
    isReply() {
      let { currentLevel } = this
      return currentLevel > 1
    },
    isPublicComment() {
      let { comment } = this
      return comment.commentSharing && comment.commentSharing.length
    },
    canShowAttachments() {
      return isEmpty(this.comment?.attachments) ||
        !this.comment?.attachments.length > 0
        ? false
        : true
    },
    canShowSharingIcon() {
      let { comment, isReply } = this
      return comment.editAvailable && !isReply
    },
    filteredReplies() {
      let { replies } = this
      if (isEmpty(replies) || areValuesEmpty(replies)) {
        return []
      } else {
        let filteredComments = cloneObject(replies || []).sort(
          (a, b) => b.createdTime - a.createdTime
        )
        return filteredComments
      }
    },

    repliesExpandText() {
      let { canShowReplies, repliesCount } = this
      if (canShowReplies) {
        return 'Hide replies'
      } else {
        return repliesCount > 0
          ? repliesCount === 1
            ? `View 1 reply`
            : `View ${repliesCount} replies`
          : 'View replies'
      }
    },
  },
  mounted() {
    this.init()
  },

  destroyed() {
    this.removeEventBusListeners()
    this.removeClickEventForMentions()
  },
  methods: {
    fromNow,
    formatDate,
    async editDeleteHandler(option, note) {
      let { value: command } = option || {}
      if (command === 'delete') {
        let success = await this.deleteNote(note)
        if (success) {
          this.$emit('delete', note)
        }
      }
      if (command === 'edit') {
        this.closeOtherCommentBoxes()
        this.showEdit = true
      }
    },
    getCurrentUser() {
      let { $account } = this
      return $account.user
    },
    init() {
      this.fetchUsers()
      this.setEventBusListeners()
      this.repliesCount = this.comment?.replyCount
      this.addClickEventForMentions()
    },
    setEventBusListeners() {
      eventBus.$on('close-reply-text-area', id => {
        if (id != this.commentViewId) {
          this.canShowReplyInput = false
        }
      })
    },
    removeEventBusListeners() {
      eventBus.$off('close-reply-text-area')
    },
    async fetchUsers() {
      let { data, error } = await API.get('/users')
      if (!error) {
        this.users = data.users
      }
    },
    getPeopleForAttribute(attributeValue) {
      let MentionDetails = attributeValue.split('~')
      let recordId, ppl
      if (!isNaN(MentionDetails[1])) {
        recordId = parseInt(MentionDetails[1])
      }
      if (recordId) {
        ppl = this.getPeopleForId(recordId)
      }
      return ppl
    },
    getPeopleForId(peopleId) {
      let { comment } = this
      let { mentions } = comment || []
      if (!isEmpty(mentions)) {
        let mention = mentions.find(
          mention => mention?.recordObj?.id === peopleId
        )
        if (!isEmpty(mention?.recordObj)) {
          return mention.recordObj
        }
      }
      return null
    },
    async showOrHideReply(command) {
      let {
        currentLevel,
        canShowReplyInput,
        comment,

        canShowReplies,
        showRepliesButton,
      } = this
      if (currentLevel != 1) {
        command = {
          action: 'open',
          referer: comment.createdBy,
        }
        this.$emit('replyParent', command)
      } else {
        let showReply = !canShowReplyInput
        if (command?.action === 'open') {
          showReply = true
        }
        if (showReply) {
          let referer = !isEmpty(command.referer)
            ? command.referer
            : comment.createdBy

          this.refererForReply =
            referer.peopleId == this.getCurrentUser().peopleId ? null : referer
          await this.$nextTick()
          this.$refs['reply-input']?.resetComment()
          this.closeOtherCommentBoxes()
        }
        this.canShowReplyInput = showReply
        if (showRepliesButton && !canShowReplies) {
          this.viewMoreReplies()
        }
        this.resizeNotesWidget()
      }
    },
    closeOtherCommentBoxes() {
      let { commentViewId } = this
      eventBus.$emit('shrink-comment-text-area')
      eventBus.$emit('close-reply-text-area', commentViewId)
    },
    createHandler(note) {
      this.replies.push(note)
      this.repliesCount = this.replies.length
    },
    emitUpdate(note) {
      this.$emit('edit', note)
    },
    editHandler(note) {
      let { replies } = this
      let existingNote = replies.find(r => r.id === note.id)
      if (existingNote) {
        this.replies.splice(replies.indexOf(existingNote), 1, note)
      }
    },
    deleteHandler(note) {
      let { replies } = this
      let doNote = replies.find(r => r.id === note.id)
      if (doNote) {
        this.replies.splice(replies.indexOf(doNote), 1)
        this.repliesCount = replies.length
      }
    },
    updateCommentSharing(comment) {
      this.$emit('updateCommentSharing', comment)
    },
    commentViewId() {
      return _.uniqueId('comment_view')
    },
    getAppName(appId) {
      let { CommentService } = this
      if (CommentService.portalApps) {
        let app = CommentService.portalApps.find(a => a.id == appId)
        if (app) {
          return app.name
        }
      }
      return ''
    },

    async loadReplies() {
      let { CommentService, comment } = this
      this.loading = true
      this.resizeNotesWidget()
      let { data, error } = await CommentService.fetchComments(comment)
      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        this.replies = data
        this.repliesCount = this.replies.length
      }
      this.loading = false
      this.resizeNotesWidget()
    },
    async EditOrDeleteNote(command, note) {
      if (command === 'delete') {
        let success = await this.deleteNote(note)
        if (success) {
          this.$emit('delete', note)
        }
      }
      if (command === 'edit') {
        this.closeOtherCommentBoxes()
        this.showEdit = true
      }
    },
    async deleteNote(note) {
      let { promptDelete } = this
      let isDelete = await promptDelete()
      if (!isDelete) {
        return false
      } else {
        let { error } = this.CommentService.delete(note)
        if (error) {
          ftoast.critical(error.message || this.$t('error_occurred'))
          return false
        } else {
          ftoast.success('Notes deleted successfully')
          return true
        }
      }
    },
    async promptDelete() {
      let value = await fDialog.warning({
        title: this.labelsMap.delete_confirm.title,
        description: this.labelsMap.delete_confirm.description,
        saveText: 'Delete',
        cancelText: 'Cancel',
      })
      return value ? true : false
    },

    viewMoreReplies() {
      let { replies } = this
      this.canShowReplies = true
      if (isEmpty(replies)) {
        this.loadReplies()
      }
      this.resizeNotesWidget()
    },

    addClickEventForMentions() {
      this.$nextTick(() => {
        let recordmentionelements =
          this.$el.getElementsByClassName(RECORD_MENTION_CLASS)

        if (recordmentionelements && recordmentionelements.length) {
          let lengthofEl = recordmentionelements.length
          for (let i = 0; i < lengthofEl; i++) {
            recordmentionelements[i].addEventListener('click', () => {
              this.redirectToOverview(recordmentionelements[i])
            })
          }
        }
      })
    },
    removeClickEventForMentions() {
      this.$nextTick(() => {
        let recordmentionelements =
          this.$el.getElementsByClassName(RECORD_MENTION_CLASS)

        if (recordmentionelements && recordmentionelements.length) {
          let lengthofEl = recordmentionelements.length
          for (let i = 0; i < lengthofEl; i++) {
            recordmentionelements[i].removeEventListener('click', () => {
              this.redirectToOverview(recordmentionelements[i])
            })
          }
        }
      })
    },
    redirectToOverview(el) {
      let route
      let mentionId = el.getAttribute('data-id')
      if (isEmpty(mentionId) || !mentionId.includes('~')) {
        return
      }
      let mentionDetails = mentionId.split('~')
      let moduleName = mentionDetails[0]
      let recordId = mentionDetails[1]
      if (isNaN(recordId)) {
        return
      }

      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      if (name) {
        route = this.$router.resolve({
          name,
          params: { viewname: 'all', id: recordId, moduleName },
        }).href
        if (route) {
          window.open(route, '_blank')
        }
      }
    },
  },
}
</script>
