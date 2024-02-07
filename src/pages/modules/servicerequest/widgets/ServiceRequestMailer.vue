<template>
  <div class="service-request-mailer" id="service-request-mailer-end-element">
    <FContainer paddingBottom="containerXLarge">
      <FContainer
        margin="containerXLarge"
        border="1px solid"
        borderColor="backgroundMidgroundDark"
        borderRadius="high"
      >
        <FContainer v-if="templateLoading">
          <FSpinner :size="16"></FSpinner>
        </FContainer>
        <FContainer display="flex" v-else-if="!isPortalUser()">
          <FContainer display="flex" width="100%">
            <FContainer
              display="flex"
              alignItems="center"
              justifyContent="center"
              padding="containerMedium"
            >
              <FPopover
                :showArrow="true"
                placement="bottom"
                trigger="clickToOpen"
                @visibleChange="resetValue"
              >
                <FButton
                  appearance="tertiary"
                  size="medium"
                  @click="getshowPopover"
                >
                  <FContainer>
                    <FIcon
                      v-if="mailerModel.messageType === MESSAGE_TYPE.reply"
                      group="communication"
                      name="reply"
                      :pressable="false"
                      key="reply"
                      size="20"
                    ></FIcon>
                    <FIcon
                      v-else
                      group="social"
                      name="comment"
                      :pressable="false"
                      key="comment"
                      size="20"
                    ></FIcon>
                  </FContainer>
                  <FContainer
                    padding="containerLarge"
                    marginLeft="containerMedium"
                  >
                    <FIcon
                      group="dsm"
                      name="chevron-down"
                      :pressable="false"
                      size="20"
                    >
                    </FIcon>
                  </FContainer>
                </FButton>
                <FContainer
                  slot="content"
                  v-if="showPopover"
                  padding="containerLarge"
                >
                  <FButton
                    appearance="tertiary"
                    @click="changeMessageType(MESSAGE_TYPE.reply)"
                    padding="containerLarge"
                    display="flex"
                    cursor="pointer"
                    alignItems="center"
                  >
                    <FContainer paddingRight="containerLarge" display="flex">
                      <FIcon
                        group="communication"
                        name="reply"
                        :pressable="false"
                        size="20"
                      ></FIcon>
                    </FContainer>
                    <FContainer>
                      <FText style="padding-right: 27px">
                        {{
                          $t('service_request.reply', { ns: 'servicerequest' })
                        }}
                      </FText>
                    </FContainer>
                  </FButton>
                  <FContainer marginBottom="containerMedium" />
                  <FButton
                    appearance="tertiary"
                    @click="changeMessageType(MESSAGE_TYPE.privateNote)"
                    padding="containerLarge"
                    display="flex"
                    cursor="pointer"
                    alignItems="center"
                  >
                    <FContainer paddingRight="containerLarge" display="flex">
                      <FIcon
                        group="social"
                        name="comment"
                        size="20"
                        :pressable="false"
                        key="comment"
                      ></FIcon>
                    </FContainer>
                    <FContainer>
                      <FText>
                        {{
                          $t('service_request.comment', {
                            ns: 'servicerequest',
                          })
                        }}
                      </FText>
                    </FContainer>
                  </FButton>
                </FContainer>
              </FPopover>
            </FContainer>
            <FDivider height="100%" v-if="isNote"></FDivider>
            <FContainer
              display="flex"
              v-if="isNote"
              alignItems="center"
              justifyContent="center"
              padding="containerMedium"
            >
              <FPopover
                :showArrow="true"
                placement="bottom"
                trigger="clickToOpen"
              >
                <FButton
                  appearance="tertiary"
                  size="medium"
                  @click="getShowPopoverForComment"
                >
                  <FContainer>
                    <FIcon
                      v-if="mailerModel.messageType === MESSAGE_TYPE.publicNote"
                      group="connectivity"
                      name="internet"
                      size="20"
                      :pressable="false"
                      key="internet"
                    ></FIcon>
                    <FIcon
                      v-else
                      group="action"
                      name="lock"
                      size="20"
                      :pressable="false"
                      key="lock"
                    ></FIcon>
                  </FContainer>
                  <FContainer
                    padding="containerLarge"
                    marginLeft="containerMedium"
                  >
                    <FIcon
                      group="dsm"
                      name="chevron-down"
                      :pressable="false"
                      size="20"
                    >
                    </FIcon>
                  </FContainer>
                </FButton>
                <FContainer
                  slot="content"
                  v-if="showCommentPopover"
                  padding="containerMedium"
                >
                  <FContainer padding="containerMedium">
                    <FButton
                      appearance="tertiary"
                      @click="changeMessageType(MESSAGE_TYPE.publicNote)"
                      cursor="pointer"
                    >
                      <FContainer
                        padding="containerSmall"
                        display="flex"
                        alignItems="center"
                      >
                        <FContainer
                          paddingRight="containerLarge"
                          display="flex"
                        >
                          <FIcon
                            group="connectivity"
                            name="internet"
                            :pressable="false"
                            size="20"
                          ></FIcon>
                        </FContainer>
                        <FContainer>
                          <FText style="padding-right: 5px">
                            {{
                              $t('service_request.public_note', {
                                ns: 'servicerequest',
                              })
                            }}
                          </FText>
                        </FContainer>
                      </FContainer>
                    </FButton>
                  </FContainer>
                  <FContainer padding="containerMedium">
                    <FButton
                      appearance="tertiary"
                      @click="changeMessageType(MESSAGE_TYPE.privateNote)"
                      cursor="pointer"
                    >
                      <FContainer
                        padding="containerSmall"
                        display="flex"
                        alignItems="center"
                      >
                        <FContainer
                          paddingRight="containerLarge"
                          display="flex"
                        >
                          <FIcon
                            group="action"
                            name="lock"
                            :pressable="false"
                            size="20"
                          ></FIcon>
                        </FContainer>
                        <FContainer>
                          <FText>
                            {{
                              $t('service_request.private_note', {
                                ns: 'servicerequest',
                              })
                            }}
                          </FText>
                        </FContainer>
                      </FContainer>
                    </FButton>
                  </FContainer>
                </FContainer>
              </FPopover>
            </FContainer>
            <FDivider height="100%" width="0.5px"></FDivider>
            <FContainer
              v-if="mailerModel.messageType == MESSAGE_TYPE.reply"
              display="flex"
              padding="containerSmall"
              alignItems="center"
              flexGrow="1"
            >
              <FContainer
                paddingRight="containerLarge"
                paddingLeft="containerLarge"
              >
                <FText appearance="headingMed14">
                  {{ $t('service_request.from', { ns: 'servicerequest' }) }}
                </FText>
              </FContainer>
              <FContainer flexGrow="1">
                <FSelect
                  class="border-none"
                  v-model="mailerModel.from"
                  size="small"
                  placeholder="Select From Address"
                  :clearable="false"
                  :options="fromAddressArray"
                  :loading="fromAddressloading"
                  :loadingText="'Loading...'"
                  :multiple="false"
                  :hideChevron="true"
                ></FSelect>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
        <FDivider width="100%" v-if="!isPortalUser()"></FDivider>
        <FContainer
          v-if="!isPortalUser()"
          display="flex"
          padding="containerSmall"
        >
          <FContainer flexGrow="1" display="flex" alignItems="center">
            <FContainer padding="containerLarge" paddingRight="sectionSmall">
              <FText appearance="headingMed14">{{
                mailerModel.messageType === 1
                  ? $t('service_request.to', { ns: 'servicerequest' })
                  : $t('service_request.notify_to', { ns: 'servicerequest' })
              }}</FText>
            </FContainer>
            <FContainer flexGrow="1">
              <FSelect
                class="border-none"
                v-model="mailerModel.to"
                :filterable="true"
                :options="toList"
                :allowCreate="true"
                size="small"
                @addOption="optionAddTO"
                :multiple="true"
                :disabled="mailerModel.messageType === 1"
                placeholder="Type to Search"
                :loading="loadingTo"
                :loadingText="'Loading...'"
                :addOptionLoading="addTOLoading"
                :clearable="true"
                :hideChevron="true"
                :remoteMethod="getSearchPeopleTo"
              >
              </FSelect>
            </FContainer>
          </FContainer>
          <FContainer
            marginLeft="containerXLarge"
            marginRight="containerMedium"
            display="flex"
            alignItems="center"
            v-if="showAddBccAndCcButton"
          >
            <FButton
              appearance="secondary"
              @click="showBccAndCc()"
              size="small"
            >
              <FText appearance="captionMed12">
                {{ getAddBccAndCcBtnText }}
              </FText>
            </FButton>
          </FContainer>
        </FContainer>
        <FDivider width="100%" v-if="!isPortalUser()"></FDivider>
        <FContainer
          v-if="!isPortalUser() && displayMailerCc"
          display="flex"
          padding="containerSmall"
        >
          <FContainer
            v-if="mailerModel.cc"
            display="flex"
            width="100%"
            alignItems="center"
          >
            <FContainer
              padding="containerLarge"
              paddingRight="containerXxLarge"
            >
              <FText appearance="headingMed14">{{
                $t('service_request.cc', { ns: 'servicerequest' })
              }}</FText>
            </FContainer>
            <FContainer flexGrow="1">
              <FContainer
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <FContainer width="100%">
                  <FSelect
                    class="border-none"
                    v-model="mailerModel.cc"
                    :multiple="true"
                    :disabled="false"
                    :filterable="true"
                    placeholder="Type to Search"
                    :options="ccList"
                    :loading="CCLoading"
                    :loadingText="'Loading...'"
                    :allowCreate="true"
                    :addOptionLoading="addCCLoading"
                    :clearable="false"
                    size="small"
                    @addOption="optionAddCC"
                    :hideChevron="true"
                    :remoteMethod="getSearchPeopleCc"
                  >
                  </FSelect>
                </FContainer>
                <FContainer marginRight="containerMedium">
                  <FButton
                    appearance="tertiary"
                    size="medium"
                    iconGroup="action"
                    iconName="delete"
                    :iconButton="true"
                    @click="deleteCcSelect()"
                  />
                </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
        <FDivider
          width="100%"
          v-if="!isPortalUser() && displayMailerCc"
        ></FDivider>
        <FContainer
          v-if="!isPortalUser() && displayMailerBcc"
          display="flex"
          padding="containerSmall"
        >
          <FContainer
            v-if="mailerModel.bcc"
            display="flex"
            width="100%"
            alignItems="center"
          >
            <FContainer paddingRight="containerXLarge" padding="containerLarge">
              <FText appearance="headingMed14">{{
                $t('service_request.bcc', { ns: 'servicerequest' })
              }}</FText>
            </FContainer>
            <FContainer flexGrow="1">
              <FContainer
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <FContainer width="100%">
                  <FSelect
                    class="border-none"
                    v-model="mailerModel.bcc"
                    :filterable="true"
                    placeholder="Type to Search"
                    :options="bccList"
                    size="small"
                    :loading="loadingBcc"
                    :loadingText="'Loading...'"
                    :clearable="false"
                    :allowCreate="true"
                    @addOption="optionAddBCC"
                    :multiple="true"
                    :disabled="false"
                    :addOptionLoading="addBCCLoading"
                    :hideChevron="true"
                    :remoteMethod="getSearchPeopleBcc"
                  >
                  </FSelect>
                </FContainer>
                <FContainer marginRight="containerMedium">
                  <FButton
                    appearance="tertiary"
                    size="medium"
                    iconGroup="action"
                    iconName="delete"
                    :iconButton="true"
                    @click="deleteBccSelect()"
                  />
                </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
        <FDivider
          width="100%"
          v-if="!isPortalUser() && displayMailerBcc"
        ></FDivider>
        <FContainer>
          <div
            class="fc-rich-text-editor service-req-rich-text-editor"
            :class="hideFormatter && 'hide-toolbar'"
          >
            <FContainer height="300px">
              <FRichtext
                v-model="mailerModel.htmlContent"
                :secondaryToolbar="true"
                :istoolbarPositionBottom="true"
                :isMoreOption="false"
                :iconColor="'#2e2e49'"
                :customToolOrder="customToolOrder"
                :hideBorder="true"
                :uploadFile="uploadImages"
              ></FRichtext>
            </FContainer>
          </div>

          <div
            v-if="!isEmpty(attachments) || !isEmpty(loadingFiles)"
            class="mailer-attachments-list d-flex mailer-border"
          >
            <ServiceRequestAttachments
              :attachments-list="attachmentsDetails"
              @deleteAttachment="deleteAttachment"
              :loadingFiles="loadingFiles"
            ></ServiceRequestAttachments>
          </div>
        </FContainer>
        <FDivider width="100%"></FDivider>
        <FContainer display="flex" padding="containerXLarge">
          <FContainer v-if="!hideActionButton" paddingRight="containerLarge">
            <FButton
              @click="addEMail()"
              :disabled="saving"
              appearance="primary"
              size="medium"
            >
              {{ getType }}
            </FButton>
          </FContainer>
          <FContainer v-if="!hideActionButton">
            <FButton
              @click="closeMailer()"
              :disabled="saving"
              appearance="secondary"
              size="medium"
            >
              {{ $t('service_request.cancel', { ns: 'servicerequest' }) }}
            </FButton>
          </FContainer>
          <FTooltip placement="top" :mouseEnterDelay="1">
            <template slot="title">
              {{
                $t('service_request.attach_file_content', {
                  ns: 'servicerequest',
                })
              }}
            </template>
            <div
              @change="addAttachment"
              class="svg-container mL20 mailer-attachment"
            >
              <FContainer cursor="pointer" marginLeft="containerMedium">
                <FButton size="medium" appearance="tertiary">
                  <form enctype="multipart/form-data">
                    <input
                      class="input-file-mailer"
                      type="file"
                      id="file-attachment"
                      multiple
                    />
                    <FIcon
                      group="text-edit"
                      name="attachment"
                      :pressable="true"
                      size="18"
                    ></FIcon>
                  </form>
                </FButton>
              </FContainer>
            </div>
          </FTooltip>
          <input
            class="hide"
            ref="fcImageInput"
            type="file"
            accept="image/*"
            @change="uploadImage"
          />
        </FContainer>
      </FContainer>
    </FContainer>
  </div>
</template>

<script>
import {
  FContainer,
  FText,
  FButton,
  FTags,
  FDivider,
  FSpinner,
  FAvatar,
  FEmptyState,
  FButtonGroup,
  FPopover,
  FSelect,
  FIcon,
  FTooltip,
  fDialog,
  ftoast,
  FShimmer,
  FRichtext,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty, isArray, validateEmail } from '@facilio/utils/validation'
import { mapState } from 'pinia'
import { prettyBytes } from '@facilio/utils/filters'
import { sanitize } from '@facilio/utils/sanitize'
import debounce from 'lodash/debounce'
import { getApp } from '@facilio/router'
import getProperty from 'dlv'
import ServiceRequestAttachments from './ServiceRequestAttachments.vue'
import { formatDate } from '../../../../../src/utils/formatter'
import { execRegex, cloneObject } from '../../../../utils/helpers'
import { getBaseURL, constructBaseURL } from '../../../../utils/api/base-url'

const editorFontSize = ['10px', '16px', '20px', '32px']

const MESSAGE_TYPE = {
  reply: 1,
  publicNote: 2,
  privateNote: 3,
}
const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const ATTACHMENT_DETAILS = [
  { name: 'pdf', displayName: 'PDF', className: 'red' },
  { name: 'docx', displayName: 'DOC', className: 'blue' },
  { name: 'xl', displayName: 'XLS', className: 'green' },
  { name: 'ppt', displayName: 'PPT', className: 'orange' },
  { name: 'img', displayName: 'IMG', className: 'gray' },
]

const customToolOrder = [
  'undo',
  'redo',
  'separator',
  'fontfamily',
  'fontsize',
  'separator',
  'bold',
  'italic',
  'underline',
  'separator',
  'setColor',
  'highlight',
  'strike',
  'separator',
  'orderedList',
  'bulletList',
  'separator',
  'textalign',
  'indent-less',
  'indent-more',
  'separator',
  'blockquote',
  'line',
  'separator',
  'link',
  'table',
  'separator',
  'addimage',
]
export default {
  props: [
    'visibility',
    'messageType',
    'details',
    'previousMail',
    'hideActionButton',
  ],

  components: {
    FContainer,
    FText,
    FButton,
    FTags,
    FDivider,
    FSpinner,
    FAvatar,
    FEmptyState,
    FButtonGroup,
    FPopover,
    FSelect,
    FIcon,
    FTooltip,
    fDialog,
    ftoast,
    ServiceRequestAttachments,
    FShimmer,
    FRichtext,
  },
  data() {
    return {
      mailerDefaults: {
        from: null,
        fromType: 1,
        to: [],
        cc: null,
        bcc: null,
        messageType: 1,
        content: '',
        htmlContent: '',
        textContent: '',
        subject: '',
      },
      messageTypeVal: 1,
      showPopperContent: false,
      MESSAGE_TYPE,
      commentType: 1,
      showBccCc: false,
      showCcSelectBox: false,
      showBccSelectBox: false,
      types: [
        {
          icon: 'reply',
          label: 'Reply',
          value: 1,
        },
        {
          icon: 'notes',
          label: 'Comment',
          value: 3,
        },
      ],
      notesType: [
        {
          icon: 'public',
          label: 'Public Note',
          value: 2,
        },
        {
          icon: 'locked',
          label: 'Private Note',
          value: 3,
        },
      ],
      noteType: 3,
      mailerModel: {},
      saving: false,
      fileSaving: false,
      hideFormatter: false,
      appendContent: false,
      attachments: [],
      uploadedAttachments: [],
      imageUploads: [],
      fromAddressloading: false,
      fromAddressList: [],
      quillInstance: null,
      signatureContent: null,
      users: [],
      bccUsers: [],
      toUsers: [],
      loadingBcc: false,
      loadingTo: false,
      CCLoading: false,
      ccSelected: false,
      bccSelected: false,
      toSelected: false,
      templateLoading: false,
      customToolOrder,

      fromAddressArray: [],
      addCCLoading: false,
      addTOLoading: false,
      addBCCLoading: false,
      toArray: [],
      bccArray: [],
      ccArray: [],
      ccVal: '',
      toVal: '',
      ccOneTimeWatcher: true,
      showPopover: false,
      showCommentPopover: false,
      loadingFiles: [],
      toAddList: [],
      bccAddList: [],
      ccAddList: [],
    }
  },

  computed: {
    toList() {
      this.toAddList
      this.userListTo
      let address = [...this.toAddList, ...this.userListTo]
      let toSet = new Set(address)
      return toSet.size != 0 ? [...toSet] : []
    },
    bccList() {
      this.bccAddList
      this.userListBcc
      let address = [...this.bccAddList, ...this.userListBcc]
      let toSet = new Set(address)
      return toSet.size != 0 ? [...toSet] : []
    },
    ccList() {
      this.ccAddList
      this.userList
      let address = [...this.ccAddList, ...this.userList]
      let toSet = new Set(address)
      return toSet.size != 0 ? [...toSet] : []
    },
    getAddBccAndCcBtnText() {
      let { showBccSelectBox, showCcSelectBox } = this
      let btn_name = ''
      if (!showBccSelectBox && !showCcSelectBox) {
        return this.$t('service_request.add_cc_bcc', { ns: 'servicerequest' })
      } else if (!showBccSelectBox) {
        btn_name = this.$t('conversation.bcc', { ns: 'servicerequest' })
      } else if (!showCcSelectBox) {
        btn_name = this.$t('conversation.cc', { ns: 'servicerequest' })
      } else {
        this.showBccCc = true
      }
      return this.$t('service_request.add_button_text', {
        btn_name,
        ns: 'servicerequest',
      })
    },
    displayMailerCc() {
      let { mailerModel = {}, showCcSelectBox } = this
      let { cc = [] } = mailerModel
      if (!isEmpty(cc)) {
        this.showCcSelectBox = true
        this.$emit('resizePage', true)
        return true
      }
      return showCcSelectBox
    },
    displayMailerBcc() {
      let { mailerModel = {}, showBccSelectBox } = this
      let { bcc = [] } = mailerModel
      if (!isEmpty(bcc)) {
        this.showBccSelectBox = true
        this.$emit('resizePage', true)
        return true
      }
      return showBccSelectBox
    },
    showAddBccAndCcButton() {
      let { mailerModel = {}, showBccCc } = this
      let { messageType } = mailerModel
      return messageType === 1 && !showBccCc
    },
    appId() {
      let { id } = getApp() || {}
      return id
    },
    userList() {
      this.CCLoading = true
      let { mailerModel } = this
      let { cc: ccArray = [] } = mailerModel || {}
      if (!isEmpty(ccArray) && ccArray.length > 0) {
        ccArray.forEach(cc => {
          let nameAndEmail = this.getNameAndEmailFromString(cc)
          let { users = [] } = this
          let userExit = users.find(user => {
            this.CCLoading = false
            return user.email === nameAndEmail.email
          })
          if (!userExit) {
            this.users.push(nameAndEmail)
          }
        })
      }

      let { users, ccSelected } = this
      if (!ccSelected) {
        let ccList = users.map(user => {
          let { name, email } = user || {}
          let label = ''
          let value = ''
          if (isEmpty(name)) {
            label = email
            value = email
          } else if (isEmpty(email)) {
            label = name
            value = name
          } else {
            label = `${name || ''} (${email})`.trim()
            value = `${isEmpty(name) ? '' : name} ${
              isEmpty(name) ? '' : '<'
            }${email}${isEmpty(name) ? '' : '>'}`.trim()
          }
          let newOption = {
            label: label,
            value: value,
          }
          this.CCLoading = false
          return newOption
        })

        this.ccAddList = ccList

        return ccList
      }
      this.ccVal = this.mailerModel.cc
      this.CCLoading = false
      return []
    },
    attachmentsDetails() {
      let { attachments } = this || {}
      return attachments.map(attachment => {
        let extension = this.getExtension(attachment.name)
        let properties = ATTACHMENT_DETAILS.find(
          details => details.name == extension
        )
        let { displayName, className } = properties || {}
        return { ...attachment, displayName, className }
      })
    },
    userListBcc() {
      this.loadingBcc = true
      let { mailerModel } = this
      let { bcc: bccArray = [] } = mailerModel || {}
      if (!isEmpty(bccArray) && bccArray.length > 0) {
        bccArray.forEach(bcc => {
          let nameAndEmail = this.getNameAndEmailFromString(bcc)
          let { bccUsers = [] } = this
          let userExit = bccUsers.find(user => {
            this.BCCLoading = false
            return user.email === nameAndEmail.email
          })
          if (!userExit) {
            this.bccUsers.push(nameAndEmail)
          }
        })
      }
      let { bccUsers, bccSelected } = this

      if (!bccSelected) {
        let bccList = bccUsers.map(user => {
          let { name, email } = user || {}
          let label = ''
          let value = ''
          if (isEmpty(name)) {
            label = email
            value = email
          } else if (isEmpty(email)) {
            label = name
            value = name
          } else {
            label = `${name || ''} (${email})`.trim()
            value = `${isEmpty(name) ? '' : name} ${
              isEmpty(name) ? '' : '<'
            }${email}${isEmpty(name) ? '' : '>'}`.trim()
          }
          let newOption = {
            label: label,
            value: value,
          }

          return newOption
        })
        this.bccAddList = bccList

        return bccList
      }
      this.loadingBcc = false
      return []
    },
    userListTo() {
      this.loadingTo = true
      let { mailerModel } = this
      let { to: toArray = [] } = mailerModel || {}
      if (!isEmpty(toArray) && toArray.length > 0) {
        let toArr = toArray.forEach(to => {
          let nameAndEmail = this.getNameAndEmailFromString(to)
          let { toUsers = [] } = this

          let userExit = toUsers.find(user => {
            this.loadingTo = false
            return user.email === nameAndEmail.email
          })
          if (!userExit) {
            this.toUsers.push(nameAndEmail)
          }
        })
      }

      let { toUsers, toSelected } = this
      if (!toSelected) {
        let toAddressList = toUsers.map(user => {
          let { name, email } = user || {}
          let label = ''
          let value = ''
          if (isEmpty(name)) {
            label = email
            value = email
          } else if (isEmpty(email)) {
            label = name
            value = name
          } else {
            label = `${name || ''} (${email})`.trim()
            value = `${isEmpty(name) ? '' : name} ${
              isEmpty(name) ? '' : '<'
            }${email}${isEmpty(name) ? '' : '>'}`.trim()
          }
          return { label, value }
        })

        this.toAddList = toAddressList

        return toAddressList
      }
      this.loadingTo = false
      return []
    },
    isSignatureFileEmpty() {
      let { user } = this.account || {}
      let { signatureFileId } = user || {}
      return isEmpty(signatureFileId)
    },
    getType() {
      let { mailerModel } = this
      let { messageType } = mailerModel || {}
      if (messageType === MESSAGE_TYPE.reply) {
        return this.$t('service_request.reply', { ns: 'servicerequest' })
      } else {
        return this.$t('service_request.comment', { ns: 'servicerequest' })
      }
    },
    isNote() {
      let { mailerModel } = this
      let { messageType } = mailerModel || {}
      return (
        messageType === MESSAGE_TYPE.publicNote ||
        messageType === MESSAGE_TYPE.privateNote
      )
    },
  },
  async created() {
    this.templateLoading = true
    await this.getSignatureContent()
    this.initModel()
    this.templateLoading = false
  },
  methods: {
    isEmpty,
    getSearchPeopleTo: debounce(function (searchText = '') {
      this.getPeopleTo(searchText)
    }, 500),
    getSearchPeopleBcc: debounce(function (searchText = '') {
      this.getPeopleBcc(searchText)
    }, 500),
    getSearchPeopleCc: debounce(function (searchText = '') {
      this.getPeople(searchText)
    }, 500),
    getshowPopover() {
      this.showPopover = true
    },
    getShowPopoverForComment() {
      this.showCommentPopover = true
    },
    changeMessageType(value) {
      this.mailerModel.messageType = value
      this.showBccCc = false
      this.showBccSelectBox = false
      this.showCcSelectBox = false
      if (value === MESSAGE_TYPE.reply) {
        this.setForReply(this.mailerModel)
        this.loadFromAddressList()
      }
      this.$set(this.mailerModel, 'cc', [])
      this.$set(this.mailerModel, 'bcc', [])

      this.showPopover = false
      this.showCommentPopover = false
    },
    async initModel() {
      this.mailerModel = cloneObject(this.mailerDefaults)
      this.mailerModel.messageType = this.messageType
      if (this.messageType === 1) {
        this.setForReply(this.mailerModel)

        if (!isEmpty(this.previousMail)) {
          this.appendContent = true
        }
        if (isEmpty(this.mailerModel.from)) {
          this.loadFromAddressList()
        }
        if (isEmpty(this.mailerModel.cc)) {
          await this.EmailAddressList()
        }
        if (isEmpty(this.mailerModel.to)) {
          this.setForReply(this.mailerModel)
        }
      } else {
        if (isEmpty(this.mailerModel.to)) {
          this.setForReply(this.mailerModel)
        }
        this.setFromForUser()
        if (this.isPortalUser()) {
          this.noteType = 2
        }
      }
      this.mailerModel.subject = this.details?.subject
      if (!isEmpty(this.signatureContent)) {
        this.mailerModel.htmlContent = sanitize(
          '<br><br><br>' + this.signatureContent
        )
      }
    },
    async getSignatureContent() {
      if (!this.isSignatureFileEmpty && this.messageType == 1) {
        let { error, data } = await API.get(
          '/v2/application/users/getSignature'
        )

        if (error) {
          ftoast.critical(error.message || 'Error Occured')
        } else {
          this.signatureContent = getProperty(
            data,
            'signature.signatureContent',
            ''
          )
        }
      }
    },
    async getPeopleTo(searchText = '') {
      let { details, appId } = this
      let { requester } = details || {}
      let requesterMail = getProperty(requester, 'email', '')

      this.loadingTo = true
      if (!isEmpty(searchText)) {
        this.toSelected = true
        let params = {
          genericSearch: !isEmpty(searchText) ? searchText : null,
        }
        let { data, error } = await API.get('/v2/serviceRequest/getPeopleList', params)

        if (error) {
          let { message } = error
          ftoast.critical(
            message ||
              this.$t(`error.error_occured_from_address_list`, {
                ns: 'servicerequest',
              })
          )
        } else {
          let { people = [] } = data || {}
          this.toUsers = []
          this.toUsers = people.map(user => ({
            name: user.name,
            email: user.email,
          }))
        }
        let requesterAvailable = this.toUsers.some(
          user => user.email === requesterMail
        )
        if (!requesterAvailable) {
          let tempUserEmail = getProperty(requester, 'email', '')
          if (tempUserEmail.includes(searchText)) {
            this.toUsers = [
              ...this.toUsers,
              { name: requester.name, email: requester.email },
            ]
          }
        }
        this.removeDuplicates(this.toUsers)
        this.toSelected = false
      } else {
        let requesterAvailable = this.toUsers.some(
          user => user.email === requesterMail
        )
        if (!requesterAvailable) {
          let tempUserEmail = getProperty(requester, 'email', '')
          if (tempUserEmail.includes(searchText)) {
            this.toUsers = [
              ...this.toUsers,
              { name: requester.name, email: requester.email },
            ]
          }
        }
        this.removeDuplicates(this.toUsers)
        this.toSelected = false
      }
      this.loadingTo = false
    },
    async getPeopleBcc(searchText = '') {
      this.loadingBcc = true

      if (!isEmpty(searchText)) {
        this.bccSelected = true
        let params = {
          genericSearch: !isEmpty(searchText) ? searchText : null,
        }
        let { data, error } = await API.get('/v2/serviceRequest/getPeopleList', params)

        if (error) {
          let { message } = error
          ftoast.critical(
            message ||
              this.$t(`error.error_occured_from_address_list`, {
                ns: 'servicerequest',
              })
          )
        } else {
          let { people = [] } = data || {}
          this.bccUsers = []
          this.bccUsers = people.map(user => ({
            name: user.name,
            email: user.email,
          }))
        }
        this.bccSelected = false
      }

      this.loadingBcc = false
    },
    async getPeople(searchText = '') {
      this.CCLoading = true

      if (!isEmpty(searchText)) {
        this.ccSelected = true
        let params = {
          genericSearch: !isEmpty(searchText) ? searchText : null,
        }
        let { data, error } = await API.get('/v2/serviceRequest/getPeopleList', params)

        if (error) {
          let { message } = error
          ftoast.critical(
            message ||
              this.$t(`error.error_occured_from_address_list`, {
                ns: 'servicerequest',
              })
          )
        } else {
          let { people = [] } = data || {}
          this.users = []
          this.users = people.map(user => ({
            name: user.name,
            email: user.email,
          }))
        }
        this.ccSelected = false
      }

      this.CCLoading = false
    },
    getEmailSubString(email) {
      if (
        typeof email === 'string' &&
        email.includes('<') &&
        email.includes('>')
      ) {
        return (
          email.substring(email.indexOf('<') + 1, email.lastIndexOf('>')) ||
          email
        )
      } else {
        return email
      }
    },
    removeDuplicates(emailArray) {
      return emailArray.filter((email, index, copyEmailArray) => {
        let emailSubstring = this.getEmailSubString(email)
        let firstIndex = copyEmailArray.findIndex(copyEmail => {
          let copyEmailSubstring = this.getEmailSubString(copyEmail)
          return emailSubstring === copyEmailSubstring
        })
        return firstIndex === index
      })
    },
    validateUsers(userArray = []) {
      userArray.forEach((email, index) => {
        email = email.toLowerCase()
        let emailSubstring = this.getEmailSubString(email)

        if (!emailRegex.test(emailSubstring)) {
          ftoast.critical(
            this.$t(`error.invalid_email`, { ns: 'servicerequest' })
          )
          userArray.splice(index, 1)
        }
      })
      return userArray
    },
    setCCUser(cc) {
      this.mailerModel.cc = cc
      this.ccSelected = true
    },
    setBCCUser(bcc) {
      this.mailerModel.bcc = this.validateUsers(this.removeDuplicates(bcc))
      this.bccSelected = true
    },
    setToUser(to) {
      this.mailerModel.to = this.validateUsers(this.removeDuplicates(to))
      this.toSelected = true
    },
    async EmailAddressList() {
      let emailToOmit = []
      let { data, error } = await API.get(`/setup/serviceRequest/emailsettings`)

      if (error) {
        let { message } = error
        ftoast.critical(
          message || 'Error Occured while fetching From address list'
        )
      } else {
        let supportEmails = getProperty(data, 'supportEmails', [])
        emailToOmit = (supportEmails || []).reduce((emails, curEmail) => {
          let { actualEmail, fwdEmail } = curEmail || {}
          emails.push(actualEmail)
          emails.push(fwdEmail)
          return emails
        }, [])
      }

      let mailCC = getProperty(this.previousMail, 'cc', '')
        .split(',')
        .filter(mail => !isEmpty(mail))
      let mailBCC = getProperty(this.previousMail, 'bcc', '')
        .split(',')
        .filter(mail => !isEmpty(mail))
      let emailToModuleDataRecord = getProperty(
        this.details,
        'emailToModuleDataRecord.to',
        ''
      )
        .split(',')
        .filter(mail => !isEmpty(mail))

      mailCC = (mailCC || []).filter(
        mail => !emailToModuleDataRecord.includes(mail)
      )
      mailBCC = (mailBCC || []).filter(
        mail => !emailToModuleDataRecord.includes(mail)
      )

      mailCC = this.constructEmailAddress(mailCC)
      mailBCC = this.constructEmailAddress(mailBCC)

      const emailFilter = mail => {
        let matchedemail = mail.match(/<(.+?)>/gm)
        matchedemail =
          matchedemail !== null ? matchedemail[0].replaceAll(/<|>/gm, '') : mail
        return !emailToOmit.some(omittedEmail => omittedEmail === matchedemail)
      }
      let ccList = mailCC.filter(emailFilter)
      let resultCcArray = this.removeSpaceFromBeforeName(ccList)
      this.mailerModel.cc = resultCcArray

      let bccList = mailBCC.filter(emailFilter)
      let resultBccArray = this.removeSpaceFromBeforeName(bccList)
      this.mailerModel.bcc = resultBccArray
    },
    constructEmailAddress(emailAddress = []) {
      let tempCCAddress = []
      emailAddress.forEach(address => {
        let { email, name } = this.getNameAndEmailFromString(address)

        if (isEmpty(name) && !isEmpty(email)) {
          name = this.constructNameFromEmail(email)
        }

        let value = `${isEmpty(name) ? '' : name} ${
          isEmpty(name) ? '' : '<'
        }${email}${isEmpty(name) ? '' : '>'}`.trim()

        tempCCAddress.push(value)
      })
      return tempCCAddress
    },
    constructNameFromEmail(email) {
      if (!isEmpty(email)) {
        const regex = /^([^@]+)@/
        let match = email.match(regex)
        if (match) {
          let output = match[1]
          return output
        }
      }
      return ''
    },
    removeSpaceFromBeforeName(list = []) {
      return list.map(str => str.replace(/[\r\n\t]/g, '').trim())
    },
    setFromForUser() {
      let user = this.$account?.user || this.$portaluser
      this.mailerModel.from = `${user?.name || ''} <${user?.email}>`
    },
    getNotesType(type) {
      return this.notesType.find(t => t.value === type)
    },
    async loadFromAddressList() {
      this.fromAddressloading = true
      let params = {
        recordId: this.details?.id,
        moduleId: this.details?.moduleId,
      }
      let { data = {}, error } = await API.post(
        `/v3/mailmessage/getfromEmailForEmailThreadingReply`,
        params
      )
      if (error) {
        let { message } = error
        ftoast.critical(
          message || 'Error Occured while fetching From address list'
        )
      } else {
        let { emailFromAddress = [] } = data || {}
        this.fromAddressList = emailFromAddress || []
        let { fromAddressList = [] } = this

        let tempFromAddress = []
        fromAddressList.forEach(address => {
          let tempAddressObj = {}
          let { email, displayName: name } = address || {}

          let label = `${name || ''} (${email})`.trim()
          let value = `${isEmpty(name) ? '' : name} ${
            isEmpty(name) ? '' : '<'
          }${email}${isEmpty(name) ? '' : '>'}`.trim()

          tempAddressObj.label = label
          tempAddressObj.value = value

          tempFromAddress.push(tempAddressObj)
        })
        this.fromAddressArray = tempFromAddress

        this.setFromAddress()
      }
      this.fromAddressloading = false
    },
    setFromAddress() {
      if (!isEmpty(this.fromAddressList) && isArray(this.fromAddressList)) {
        let record = this.fromAddressList[0]
        this.mailerModel.from = `${record.displayName || ''} <${record.email}>`
      } else {
        this.mailerModel.from = 'noreply@facilio.com'
      }
    },
    async closeMailer() {
      let value = await fDialog.warning({
        title: 'Discard Changes',
        description:
          'You have unsaved changes and your data will be lost. Are you sure you want to discard?',
        saveText: 'Discard',
        cancelText: 'Cancel',
      })
      if (value) {
        this.$emit('close')
      }
    },
    async addEMail() {
      this.saving = true
      let mailerModel = this.getFormattedMailerModel()
      let params = {
        data: mailerModel,
      }
      let { data = {}, error } = await API.post(
        `v3/serviceRequest/emailConversationThreading`,
        params
      )
      if (!isEmpty(data)) {
        let { emailConversationThreading } = data || {}
        this.$emit('saved', emailConversationThreading)
      } else {
        let { status } = error || {}
        if (!isEmpty(status) && status === 403) {
          ftoast.critical(
            this.$t(
              'error.403',
              { ns: 'servicerequest' },
              {
                timeout: 3000,
              }
            )
          )
        } else {
          ftoast.critical('Error occurred', {
            timeout: 3000,
          })
        }
      }

      this.saving = false
    },
    getFormattedMailerModel() {
      let data = cloneObject(this.mailerModel)
      if (!isEmpty(data.to) && isArray(data.to)) {
        data.to = data.to.join()
      } else {
        data.to = null
      }
      if (!isEmpty(data.cc) && isArray(data.cc)) {
        data.cc = data.cc.join()
      } else {
        data.cc = null
      }
      if (!isEmpty(data.bcc) && isArray(data.bcc)) {
        data.bcc = data.bcc.join()
      } else {
        data.bcc = null
      }
      if (data.messageType === 3) {
        data.messageType = this.noteType
      } else if (data.messageType === 1 && this.appendContent) {
        data.htmlContent = this.appendPreviousMail(data.htmlContent, true)
      }
      this.replaceAllImgSrcWithCid(data)
      if (!isEmpty(this.uploadedAttachments)) {
        this.$set(
          data,
          'emailConversationThreadingattachments',
          this.uploadedAttachments
        )
      }

      data.dataModuleId = this.details?.moduleId
      data.recordId = this.details?.id
      data.siteId = this.details?.siteId
      data.fromPeople = {
        id: this.$account?.user?.peopleId || this.$portaluser?.peopleId || null,
      }
      if (this.isPortalUser()) {
        data.fromType = 1
      } else {
        data.fromType = 2
      }
      return data
    },
    replaceAllImgSrcWithCid(data) {
      let mailRegEx =
        /src=['"](?:[^"'\/]*\/)*([^'"]+)['"] data-id=['"]([^'"]+)['"]/
      let regExExecValues = execRegex(
        data.htmlContent,
        new RegExp(mailRegEx, 'g')
      )
      regExExecValues.forEach(value => {
        let cid = value[2]
        let attachment = this.imageUploads.find(
          at => at.contentId === String(cid)
        )
        if (!isEmpty(attachment)) {
          data.htmlContent = data.htmlContent.replace(
            mailRegEx,
            `src="cid:${cid}"`
          )
          this.uploadedAttachments.push(attachment)
        }
      })
    },
    enableCC(type = 'cc') {
      this.mailerModel[type] = []
    },
    disableCC(type = 'cc') {
      this.mailerModel[type] = null
    },
    resetValue(value) {
      this.mailerModel = cloneObject(this.mailerDefaults)
      this.mailerModel.messageType = value
      if (value === 1) {
        this.setForReply(this.mailerModel)
        if (!isEmpty(this.previousMail)) {
          this.appendContent = true
        }
        if (isEmpty(this.fromAddressList)) {
          this.loadFromAddressList()
        } else {
          this.setFromAddress()
        }
      } else {
        this.setFromForUser()
        this.appendContent = false
      }
    },
    setForReply(model) {
      let name = getProperty(this.details, 'requester.name', '')
      let email = getProperty(this.details, 'requester.email', '')
      var cleanedEmail = email.replace(/\s/g, '')
      this.details.requester.email = cleanedEmail
      model.to = [`${name} <${cleanedEmail}>` || 'support@facilio.com']
      model.to = this.removeSpaceFromBeforeName(model.to)
      model.cc = []
    },
    toggleFormatter() {
      this.hideFormatter = !this.hideFormatter
    },
    setPrevMailContent() {
      this.mailerModel.htmlContent = this.appendPreviousMail(
        this.mailerModel.htmlContent,
        true
      )
      this.appendContent = false
    },
    appendPreviousMail(htmlContent, attachInlineImgs = false) {
      let { previousMail } = this
      let from = previousMail?.from || 'support@facilio.com'

      let { name, email } = this.getNameAndEMail(from)
      let content = previousMail?.htmlContent || ''
      htmlContent += `<br><br><p>`
      htmlContent += `<blockquote style="margin:0px 0px 0px 6px;border-left:1px solid rgb(204,204,204);padding-left:8px;font-size: 15px">`
      htmlContent += `<p>${formatDate(previousMail.sysCreatedTime)} ${
        name ? name : ''
      } &lt;<a href="mailto:${email}" rel="noreferrer" target="_blank">${email}</a>&gt; wrote:</p>`
      htmlContent += `${content}</blockquote></p>`
      let inlineAttachemnts =
        previousMail?.attachmentsList &&
        previousMail?.attachmentsList.filter(at => at.type === 2)
      if (attachInlineImgs && !isEmpty(inlineAttachemnts)) {
        let attachments = inlineAttachemnts.map(record => {
          return {
            fileId: record?.fileId,
            type: record?.type,
            contentId: record?.contentId,
          }
        })
        this.imageUploads.push(...attachments)
      }
      return sanitize(htmlContent)
    },

    async addAttachment(event) {
      this.loadingFiles = []
      let filesList = event?.target?.files || []
      let files =
        [...filesList].filter(file => {
          let { size, name } = file
          if (size > 10485760) {
            ftoast.critical(
              name + ' exceeded size limit (Max File Size is 10MB)'
            )
            return false
          }
          return true
        }) || []
      this.saving = true
      this.fileSaving = true
      this.loadingFiles = files || []
      if (!isEmpty(files)) {
        await this.uploadFiles(files)
      }
      this.saving = false
      this.fileSaving = false
      this.loadingFiles = []
      this.$emit('resizePage', true)
    },
    async uploadFiles(files = []) {
      let { error, ids = [] } = await API.uploadFiles(files)
      if (error) {
        let { message } = error
        ftoast.critical(message || 'Error occured')
      } else if (ids) {
        ids.forEach(id => {
          this.uploadedAttachments.push({
            fileId: id,
            type: 1,
            createdTime: Date.now(),
          })
        })
        files.forEach(file => {
          let { name, size, type } = file
          let bytes = prettyBytes(size)
          this.attachments.push({
            name,
            size,
            bytes,
            type,
          })
        })
      }
    },
    deleteAttachment(index) {
      let { uploadedAttachments, attachments } = this
      uploadedAttachments.splice(index, 1)
      attachments.splice(index, 1)
    },
    imageHandler() {
      this.$refs.fcImageInput.click()
    },
    async uploadImage(event) {
      let file = event.target.files[0]
      if (file?.size > 10485760) {
        ftoast.critical(
          file?.name + ' exceeded size limit (Max File Size is 10MB)'
        )
        return
      }
      let { error, ids } = await API.uploadFiles([file])
      if (error) {
        let { message } = error
        ftoast.critical(message || 'Error occured')
      } else if (ids) {
        let [id] = ids
        this.imageUploads.push({
          fileId: id,
          type: 2,
          contentId: String(id),
          createdTime: Date.now(),
        })
        let imagePreviewUrl = this.getImagePreviewUrl(id)
        if (this.quillInstance) {
          let currentIndex = this.quillInstance.selection.lastRange.index
          this.quillInstance.insertEmbed(currentIndex, 'imageBlot', {
            src: imagePreviewUrl,
            dataId: id,
            alt: file?.name,
          })
          this.quillInstance.setSelection(currentIndex + 1, 0)
        }
      }
      event.target.value = ''
    },
    getExtension(fileName) {
      let name = fileName.split('.')
      let format = name[1]
      if (format == 'pdf') {
        return 'pdf'
      }
      if (['jpg', 'jpeg', 'png', 'svg'].includes(format)) {
        return 'img'
      }
      if (['docx', 'doc', 'docm', 'dot', 'dotx'].includes(format)) {
        return 'docx'
      }
      if (
        ['xls', 'xlsx', 'xl', 'xll', 'xlm', 'xlsm', 'xlsx'].includes(format)
      ) {
        return 'xl'
      }
      if (['ppt', 'pptx'].includes(format)) {
        return 'ppt'
      } else {
        return 'none'
      }
    },
    showBccAndCc() {
      this.$emit('resizePage', true)
      this.showBccCc = true
      this.showBccSelectBox = true
      this.showCcSelectBox = true
    },
    optionAddTO(email) {
      this.addTOLoading = true
      let { to = [] } = this.mailerModel || {}
      if (this.validateEmail(email)) {
        let newOption = {
          label: email,
          value: email,
        }
        let { userListTo = [] } = this
        let userExit = userListTo.find(user => {
          return user.email === newOption.value
        })
        if (!userExit) {
          this.userListTo.push(newOption)
          to.push(email)
        }
      } else {
        ftoast.critical(
          this.$t(`error.invalid_email`, { ns: 'servicerequest' })
        )
      }
      this.removeDuplicates(this.userListTo)
      this.removeDuplicates(to)
      this.mailerModel.to = to
      this.addTOLoading = false
    },
    optionAddCC(email) {
      this.addCCLoading = true
      let { cc = [] } = this.mailerModel || {}
      if (this.validateEmail(email)) {
        let newOption = {
          label: email,
          value: email,
        }
        let { userList = [] } = this
        let userExit = userList.find(user => {
          return user.email === newOption.value
        })
        if (!userExit) {
          this.userList.push(newOption)
          cc.push(email)
        }
      } else {
        ftoast.critical(
          this.$t(`error.invalid_email`, { ns: 'servicerequest' })
        )
      }
      this.removeDuplicates(this.userList)
      this.removeDuplicates(cc)
      this.mailerModel.cc = cc
      this.addCCLoading = false
    },
    optionAddBCC(email) {
      this.addBCCLoading = true
      let { bcc = [] } = this.mailerModel || {}
      if (this.validateEmail(email)) {
        let newOption = {
          label: email,
          value: email,
        }
        let { userListBCC = [] } = this
        let userExit = userListBCC.find(user => {
          return user.email === newOption.value
        })
        if (!userExit) {
          // this.userListBCC.push(newOption)
          bcc.push(email)
        }
      } else {
        ftoast.critical(
          this.$t(`error.invalid_email`, { ns: 'servicerequest' })
        )
      }
      this.removeDuplicates(this.userListBcc)
      this.removeDuplicates(bcc)
      this.mailerModel.bcc = bcc
      this.addBCCLoading = false
    },
    validateEmail(email) {
      if (isEmpty(email)) {
        return true
      } else {
        email = email.trim()
        let emailRegx =
          /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!emailRegx.test(email)) {
          return false
        }
        return true
      }
    },
    getNameAndEmailFromString(value) {
      let mailRegEx = /(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/g
      let values = mailRegEx.exec(value)
      if (isEmpty(values)) {
        return { name: value }
      }
      return { name: values[1] || '', email: values[2] || '' }
    },
    getImagePreviewUrl(id, width, height) {
      let url = `${getBaseURL()}/v2/files/preview/${id}`
      if (!isEmpty(width)) {
        url += `?width=${width}`
        if (!isEmpty(height)) {
          url += `&height=${height}`
        }
      }
      return url
    },
    getNameAndEMail(value) {
      let mailRegEx = /(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/g
      let values = mailRegEx.exec(value)
      if (isEmpty(values)) {
        return { name: value }
      }
      return { name: values[1] || values[2] || '', email: values[2] || '' }
    },
    isPortalUser() {
      return getProperty(this.$account, 'user.appType') > 0
    },
    deleteCcSelect() {
      this.showCcSelectBox = false
      this.showBccCc = false
      this.$set(this.mailerModel, 'cc', [])
    },
    deleteBccSelect() {
      this.showBccSelectBox = false
      this.showBccCc = false
      this.$set(this.mailerModel, 'bcc', [])
    },
    async uploadImages(file = {}) {
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
  },
}
</script>
<style lang="scss">
.service-request-mailer {
  .custom-file-input {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  .hidden-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
  .mailer-attachment {
    .input-file-mailer {
      opacity: 0;
      width: 35px;
      height: 35px;
      position: absolute;
      cursor: pointer;
      z-index: 10;
    }
  }
  .hide {
    display: none;
  }
  .border-none {
    div {
      div {
        border: none !important;
      }
    }
  }
}
</style>
