<template>
  <FModal
    title="Signature"
    :visible="visiblity"
    size="M"
    @cancel="handleCancel"
    padding="containerNone"
  >
    <FContainer
      padding="sectionXSmall sectionSmall"
      class="rich-text-container"
      v-if="visiblity"
    >
      <FRichtext :uploadFile="uploadImage" v-model="signatureContentText" />
    </FContainer>
    <template #footer>
      <FContainer
        display="flex"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-end"
      >
        <FButton
          :loading="saving"
          appearance="primary"
          size="medium"
          @click="addSign"
        >
          {{ $t('save', 'Save', { ns: 'account' }) }}
        </FButton>
      </FContainer>
    </template>
  </FModal>
</template>
<script>
import {
  FModal,
  FForm,
  FFormItem,
  FInput,
  FContainer,
  FButton,
  FRichtext,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import { constructBaseURL } from '../../../../utils/api/base-url'

export default {
  name: 'EditSignatureDialog',
  props: ['showSignatureDialog', 'signatureContent'],
  components: {
    FModal,
    FForm,
    FFormItem,
    FInput,
    FContainer,
    FButton,
    FRichtext,
  },
  data() {
    return {
      visiblity: this.showSignatureDialog,
      saving: false,
      signatureContentText: null,
      successMsg: 'Signature added successfully',
      errorMsg: 'Error occured',
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
    }
  },
  created() {
    this.signatureContentText = this.signatureContent
  },
  watch: {
    showSignatureDialog(newVal, oldVal) {
      if (newVal != oldVal) this.visiblity = this.showSignatureDialog
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
  },
  methods: {
    async addSign() {
      this.saving = true
      let { options } = this
      let { signatureContentText } = this || {}
      if (isEmpty(signatureContentText)) {
        let message = 'No Signature Added'
        await this.deleteSign()
        ftoast.success(message, options)
        this.saving = false
        this.visiblity = false
        this.$emit('onClose')
        this.refreshPage()
        return
      }
      let { error } = await API.post(
        '/v2/application/users/addOrUpdateSignature',
        {
          signatureContent: signatureContentText,
        }
      )
      if (error) {
        let { errorMsg } = this
        ftoast.critical(errorMsg, options)
      } else {
        let { successMsg } = this
        ftoast.success(successMsg, options)
      }
      this.saving = false
      this.visiblity = false
      this.$emit('onSave')
    },
    async deleteSign() {
      let { error, data } = await API.get(
        '/v2/application/users/deleteSignature'
      )
      let { options } = this
      if (error) {
        let { errorMsg } = this
        ftoast.critical(errorMsg, options)
      } else {
        let signatureDelete = getProperty(data, 'signatureDelete', '')
        if (signatureDelete == 'success') {
          this.signatureContentText = ''
        }
      }
      this.saving = false
    },
    handleCancel() {
      this.visiblity = false
      this.$emit('onClose')
    },
    async uploadImage(file = {}) {
      const formData = new FormData()
      formData.append('file', file, file.name)
      formData.append('fileName', file.name)
      formData.append('fileContentType', file.name)
      let url = '/v2/publicFile/addPublicFile'
      let { error, data } = await API.post(url, formData)
      if (error) {
        ftoast.critical(error.message || this.$t('error_occurred'))
      } else {
        let { publicFileUrl } = data || {}
        let baseurl = constructBaseURL(null, null, true)
        let fileUrl = `${baseurl}${publicFileUrl}`
        return fileUrl
      }
    },
    // refreshPage() {
    //   window.location.reload()
    // },
  },
}
</script>
<style lang="scss">
.rich-text-container {
  .richtext-content {
    height: 200px !important;
  }
}
</style>
