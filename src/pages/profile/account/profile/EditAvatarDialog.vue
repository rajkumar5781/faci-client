<template>
  <FModal
    title="Profile picture"
    :visible="visiblity"
    size="S"
    :confirmLoading="saving"
    @cancel="closeAvatarDialog"
    padding="containerNone"
  >
    <FContainer
      padding="containerXxLarge"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <FAvatar
        class="change-avatar"
        :avatarUrl="avatarUrl"
        :userName="userName"
      >
      </FAvatar>
    </FContainer>
    <template #footer>
      <FContainer
        display="flex"
        justifyContent="center"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
      >
        <FContainer marginRight="containerXxLarge">
          <FButton
            appearance="secondary"
            size="medium"
            iconGroup="edit"
            iconName="edit-line"
            iconPosition="prefix"
            :loading="saving"
          >
            {{ $t('change', 'Change', { ns: 'account' }) }}
            <FContainer class="opacity-0" position="absolute" width="85px">
              <input
                type="file"
                accept="image/*"
                style="width: 80px"
                @change="uploadImage($event.target.files)"
              />
            </FContainer>
          </FButton>
        </FContainer>
        <FButton
          appearance="secondary"
          size="medium"
          iconGroup="action"
          iconName="delete"
          iconPosition="prefix"
          :loading="removing"
          :disabled="disableRemoveButton"
          @click="removeAvatar"
        >
          {{ $t('remove', 'Remove', { ns: 'account' }) }}
        </FButton>
      </FContainer>
    </template>
  </FModal>
</template>
<script>
import {
  FModal,
  FContainer,
  FButton,
  FAvatar,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'EditAvatarDialog',
  props: ['showAvatarDialog', 'user'],
  components: {
    FModal,
    FContainer,
    FButton,
    FAvatar,
  },
  data() {
    return {
      visiblity: this.showAvatarDialog,
      userObj: {},
      avatarUrl: '',
      userName: '',
      userId: -1,
      saving: false,
      removing: false,
      addedMsg: 'Profile picture updated successfully',
      removedMsg: 'Profile picture removed successfully',
      errorMsg: 'Error occurred',
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
    }
  },
  created() {
    let { user } = this
    this.userObj = user
    this.userName = user?.name
    this.userId = user?.uid
    this.avatarUrl = user?.avatarUrl
  },
  watch: {
    showAvatarDialog(newVal, oldVal) {
      if (newVal != oldVal) this.visiblity = this.showAvatarDialog
    },
  },
  computed: {
    options() {
      return {
        manualClear: this.manualClear,
        menuType: this.menuType,
        timeout: this.timeout,
      }
    },
    disableRemoveButton() {
      let { avatarUrl } = this
      return isEmpty(avatarUrl)
    },
  },
  methods: {
    closeAvatarDialog() {
      this.visiblity = false
      this.$emit('onClose')
    },
    async uploadImage(file) {
      this.saving = true
      let fileList = Array.from(file)
      let payload = new FormData()
      payload.append('user.avatar', fileList[0])
      payload.append('userId', this.userId)

      let { error, data } = await API.post(
        '/settings/users/avatar/upload',
        payload
      )
      if (error) {
        let { options, errorMsg } = this || {}
        ftoast.critical(errorMsg, options)
      } else {
        this.avatarUrl = data.avatarUrl
        this.user.avatarUrl = data.avatarUrl
        let { options, addedMsg } = this || {}
        ftoast.success(addedMsg, options)
      }
      this.saving = false
    },
    async removeAvatar() {
      this.removing = true
      let { error } = await API.post('/settings/users/avatar/delete', {
        userId: this.userId,
      })
      if (error) {
        let { options, errorMsg } = this || {}
        ftoast.critical(errorMsg, options)
      } else {
        this.avatarUrl = null
        this.user.avatarUrl = null
        let { options, removedMsg } = this || {}
        ftoast.success(removedMsg, options)
      }
      this.removing = false
    },
  },
}
</script>
<style>
.change-avatar {
  overflow: hidden;
  height: 198px !important;
  width: 198px !important;
}
.change-avatar span {
  font-size: 50px;
}
.change-avatar img {
  height: 198px;
  width: 198px;
}
</style>
