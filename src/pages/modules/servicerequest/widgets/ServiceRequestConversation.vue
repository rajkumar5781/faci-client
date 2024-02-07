<template>
  <FContainer
    class="sr-conversation-threading"
    ref="parentDiv"
    :paddingBottom="hiddenConversationCount <= 0 ? 'containerXLarge' : ''"
  >
    <FContainer
      borderBottom="solid 1px"
      borderColor="backgroundMidgroundDark"
      backgroundColor="backgroundSemanticOrangeSubtle"
      v-if="checkDescriptionExit"
      @click="collapseDescriptionEvent()"
      cursor="pointer"
      width="100%"
    >
      <FContainer padding="containerLarge">
        <FContainer paddingBottom="containerMedium" display="flex">
          <FContainer
            paddingRight="containerLarge"
            display="flex"
            alignItems="center"
          >
            <FIcon
              group="files"
              name="document"
              size="16"
              :pressable="false"
            ></FIcon>
          </FContainer>
          <FContainer>
            <FText appearance="headingMed14">
              {{ $t('service_request.description', { ns: 'servicerequest' }) }}
            </FText>
          </FContainer>
        </FContainer>
        <FContainer padding="containerLarge" v-if="details.description">
          <FContainer
            paddingLeft="sectionSmall"
            paddingRight="sectionSmall"
            overflowX="scroll"
          >
            <FContainer v-if="!collapseDescription">
              <FText v-if="!checkDescriptionFromEMail">{{ getDetails }}</FText>
              <div v-else v-html="getDetails"></div>
            </FContainer>
            <FContainer
              v-if="collapseDescription"
              textOverflow="ellipsis"
              overflow="hidden"
              whiteSpace="nowrap"
            >
              <FText appearance="bodyReg14">{{
                addWhiteSpaceToNodes(getDetails, true)
              }}</FText>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer v-if="attachmentForDescription()">
          <AttachmentsFragment
            :attachmentsList="
              getExternalAttachments(
                getProperty(details, 'emailToModuleDataRecord.attachmentsList')
              )
            "
          />
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer
      marginTop="containerXLarge"
      v-if="showEmptyStateWithReplyCommentButtons()"
      display="flex"
      flexDirection="column"
      :alignItems="descriptionCheck() ? '' : 'center'"
      justifyContent="center"
      height="60%"
      paddingBottom="sectionLarge"
    >
      <FContainer v-if="!descriptionCheck()">
        <FEmptyState
          :title="
            $t('service_request.no_conversation_found', {
              ns: 'servicerequest',
            })
          "
          vertical
          size="M"
          illustration="add-item"
        />
      </FContainer>
      <FContainer
        display="flex"
        :justifyContent="descriptionCheck() ? '' : 'center'"
        :marginLeft="descriptionCheck() ? 'containerXLarge' : ''"
      >
        <FContainer marginRight="containerLarge">
          <FButton
            appearance="secondary"
            size="medium"
            @click="showMailer(3)"
            iconGroup="social"
            iconName="comment"
            iconPosition="prefix"
          >
            <FText appearance="headingMed14">
              {{ $t('service_request.comment', { ns: 'servicerequest' }) }}
            </FText>
          </FButton>
        </FContainer>
        <FContainer v-if="!isPortalUser()">
          <FButton
            appearance="primary"
            size="medium"
            @click="showMailer(1)"
            iconGroup="communication"
            iconName="reply-all-filled"
            iconColor="iconNeutralGrey01Subtler"
            iconPosition="prefix"
          >
            <FText appearance="headingMed14">{{
              $t('service_request.reply_all', { ns: 'servicerequest' })
            }}</FText>
          </FButton>
        </FContainer>
      </FContainer>
    </FContainer>

    <FContainer v-if="loading">
      <SRShimmer />
    </FContainer>
    <FContainer display="flex">
      <portal :to="`header-${widget.id}-${widget.name}`">
        <FContainer padding="containerLarge" display="flex">
          <FContainer
            marginRight="containerLarge"
            paddingLeft="containerMedium"
          >
            <FButton
              appearance="secondary"
              display="flex"
              @click="filterAll"
              :pressable="true"
              size="small"
            >
              <FIcon
                v-if="!emailAll"
                group="action"
                name="select-all"
                size="16"
                key="select-all-1"
                :pressable="false"
              ></FIcon>
              <FText
                appearance="bodyRegSt14"
                v-if="!emailAll"
                marginLeft="containerMedium"
              >
                {{ $t('service_request.all', { ns: 'servicerequest' }) }}</FText
              >
              <FIcon
                v-if="emailAll"
                group="action"
                name="select-all"
                key="select-all-2"
                size="18"
                :pressable="false"
              ></FIcon>
              <FText
                appearance="headingMed14"
                v-if="emailAll"
                marginLeft="containerMedium"
              >
                {{ $t('service_request.all', { ns: 'servicerequest' }) }}</FText
              >
            </FButton>
          </FContainer>
          <FContainer marginRight="containerLarge">
            <FButton
              appearance="secondary"
              display="flex"
              @click="filterOnlyComment"
              :pressable="true"
              size="small"
            >
              <FIcon
                v-if="!emailCommentOnly"
                group="communication"
                name="speech"
                size="16"
                key="speech-1"
                :pressable="false"
              ></FIcon>
              <FText
                appearance="bodyRegSt14"
                v-if="!emailCommentOnly"
                marginLeft="containerMedium"
              >
                {{
                  $t('service_request.only_comment', { ns: 'servicerequest' })
                }}
              </FText>
              <FIcon
                v-if="emailCommentOnly"
                group="communication"
                name="speech"
                size="18"
                key="speech-2"
                :pressable="false"
              ></FIcon>
              <FText
                appearance="headingMed14"
                v-if="emailCommentOnly"
                marginLeft="containerMedium"
              >
                {{
                  $t('service_request.only_comment', { ns: 'servicerequest' })
                }}
              </FText>
            </FButton>
          </FContainer>
          <FContainer marginRight="containerLarge">
            <FButton
              appearance="secondary"
              display="flex"
              @click="filterOnlyThread"
              :pressable="true"
              size="small"
            >
              <FIcon
                v-if="!emailThreadOnly"
                group="default"
                name="thread"
                size="16"
                key="thread-1"
                :pressable="false"
              ></FIcon>
              <FText
                appearance="bodyRegSt14"
                v-if="!emailThreadOnly"
                marginLeft="containerMedium"
              >
                {{
                  $t('service_request.only_thread', { ns: 'servicerequest' })
                }}
              </FText>
              <FIcon
                v-if="emailThreadOnly"
                group="default"
                name="thread"
                size="18"
                key="thread-2"
                :pressable="false"
              ></FIcon>
              <FText
                appearance="headingMed14"
                v-if="emailThreadOnly"
                marginLeft="containerMedium"
              >
                {{
                  $t('service_request.only_thread', { ns: 'servicerequest' })
                }}
              </FText>
            </FButton>
          </FContainer>
        </FContainer>
      </portal>
    </FContainer>
    <FContainer v-if="!loading && emailThreads.length > 0">
      <FContainer
        v-if="descriptionCheck() || attachmentForDescription()"
        borderBottom="solid 1px"
        borderColor="backgroundMidgroundDark"
        padding="containerXLarge"
        display="flex"
        @click="collapseDescriptionEvent()"
        cursor="pointer"
      >
        <FContainer marginTop="containerMedium">
          <FAvatar size="M" :userName="getRequesterOfDescription()"></FAvatar>
        </FContainer>
        <FContainer padding="containerLarge" width="95%">
          <FContainer
            paddingBottom="containerLarge"
            display="flex"
            width="100%"
          >
            <FContainer
              paddingRight="containerLarge"
              display="flex"
              alignItems="center"
            >
              <FIcon
                group="files"
                name="document"
                size="16"
                :pressable="false"
              ></FIcon>
            </FContainer>
            <FContainer>
              <FText appearance="headingMed14">
                {{
                  $t('service_request.description', { ns: 'servicerequest' })
                }}
              </FText>
            </FContainer>
          </FContainer>
          <FContainer
            v-if="descriptionCheck()"
            overflowX="scroll"
            padding="containerMedium"
          >
            <div v-if="!collapseDescription">
              <FText v-if="!checkDescriptionFromEMail">{{ getDetails }}</FText>
              <div v-else v-html="getDetails"></div>
            </div>
            <FContainer
              v-if="collapseDescription"
              textOverflow="ellipsis"
              overflow="hidden"
              whiteSpace="nowrap"
            >
              <FText appearance="bodyReg14">{{
                addWhiteSpaceToNodes(getDetails, true)
              }}</FText>
            </FContainer>
          </FContainer>
          <FContainer v-if="attachmentForDescription()">
            <AttachmentsFragment
              :attachmentsList="
                getExternalAttachments(
                  getProperty(
                    details,
                    'emailToModuleDataRecord.attachmentsList'
                  )
                )
              "
            />
          </FContainer>
        </FContainer>
      </FContainer>
      <FContainer v-if="!loading">
        <FContainer v-if="checkFilterState() && !loading">
          <FContainer
            v-if="hiddenConversationCount > 0"
            marginTop="sectionMedium"
            position="relative"
            marginBottom="containerLarge"
          >
            <FDivider width="100%" marginBottom="containerMedium"></FDivider>
            <FDivider width="100%"></FDivider>
            <FContainer
              class="expander"
              top="-15px"
              left="45px"
              position="absolute"
              cursor="pointer"
              height="35px"
              width="35px"
              @click="expandAllConversation()"
            >
              <FContainer
                class="expander-div show-expander-count"
                border="1px solid"
                borderRadius="full"
                height="35px"
                width="35px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderColor="backgroundMidgroundDark"
                backgroundColor="backgroundCanvas"
                cursor="pointer"
              >
                <FSpinner
                  v-if="fetchAllLoader"
                  :show="true"
                  :size="10"
                  color="#fff"
                ></FSpinner>
                <span v-else class="msg-count">
                  <FText appearance="headingMed14">{{
                    hiddenConversationCount
                  }}</FText>
                </span>
              </FContainer>
              <FContainer
                class="expander-div show-expander-icon"
                border="1px solid"
                borderRadius="full"
                height="35px"
                width="35px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderColor="backgroundMidgroundMedium"
                backgroundColor="iconAccentViolet"
                cursor="pointer"
              >
                <FSpinner
                  v-if="fetchAllLoader"
                  :show="true"
                  :size="10"
                  color="#fff"
                ></FSpinner>
                <FIcon
                  v-else
                  group="navigation"
                  name="expand"
                  color="backgroundCanvas"
                  size="20"
                  :pressable="false"
                  key="expand"
                ></FIcon>
              </FContainer>
            </FContainer>
          </FContainer>
          <FContainer
            v-for="(mailContent, index) in emailThreads"
            f
            :key="`mail-${index}`"
            @click="toggleContent(mailContent)"
            cursor="pointer"
          >
            <FContainer display="flex" padding="containerXLarge">
              <FContainer
                marginRight="containerMedium"
                marginTop="containerMedium"
              >
                <FAvatar
                  size="M"
                  :userName="getUserName(mailContent)"
                ></FAvatar>
              </FContainer>
              <FContainer width="95%">
                <FContainer
                  display="flex"
                  justifyContent="space-between"
                  padding="containerSmall"
                  alignItems="center"
                >
                  <FContainer display="flex" alignItems="center">
                    <FContainer
                      marginRight="containerMedium"
                      v-if="mailContent.messageType === messageTypeEnum.reply"
                      display="flex"
                      padding="containerSmall"
                    >
                      <FContainer
                        display="flex"
                        v-if="mailContent.fromType === messageTypeEnum.client"
                      >
                        <FIcon
                          group="communication"
                          name="receive-filled"
                          size="16"
                          color="backgroundSemanticRedMedium"
                          :pressable="false"
                        ></FIcon>
                      </FContainer>
                      <FContainer v-else display="flex">
                        <FIcon
                          group="communication"
                          name="reply-filled"
                          size="16"
                          :pressable="false"
                          color="iconSemanticGreen"
                        ></FIcon>
                      </FContainer>
                    </FContainer>
                    <FContainer
                      display="flex"
                      marginRight="containerSmall"
                      padding="containerMedium"
                      v-if="
                        mailContent.messageType ===
                          messageTypeEnum.publicNotes ||
                        mailContent.messageType === messageTypeEnum.privateNotes
                      "
                    >
                      <FIcon
                        group="communication"
                        name="comment-filled"
                        size="20"
                        color="iconAccentViolet"
                        :pressable="false"
                      ></FIcon>
                    </FContainer>
                    <FContainer display="flex">
                      <FText appearance="headingMed14">
                        {{ getFromAddressName(mailContent) }}
                      </FText>
                    </FContainer>
                  </FContainer>
                  <FContainer display="flex" justifyContent="space-between">
                    <FContainer
                      padding="containerMedium containerLarge"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FText appearance="headingMed14">{{
                        formatDate(mailContent.sysCreatedTime)
                      }}</FText>
                    </FContainer>
                    <FContainer
                      display="flex"
                      cursor="pointer"
                      v-if="!isPortalUser() && mailContent.messageType === 1"
                      @click="toggleContent(mailContent)"
                    >
                      <FButton
                        @click="getIndexForShowMail(index, 0)"
                        paddingRight="containerLarge"
                        appearance="tertiary"
                      >
                        <FTooltip placement="top" :mouseEnterDelay="1">
                          <template slot="title">
                            {{
                              $t('service_request.reply', {
                                ns: 'servicerequest',
                              })
                            }}
                          </template>
                          <FIcon
                            group="communication"
                            name="reply"
                            size="16"
                            :pressable="false"
                          ></FIcon>
                        </FTooltip>
                      </FButton>
                      <FButton
                        @click="getIndexForShowMail(index, 1)"
                        appearance="tertiary"
                      >
                        <FTooltip placement="top" :mouseEnterDelay="1">
                          <template slot="title">
                            {{
                              $t('service_request.reply_all', {
                                ns: 'servicerequest',
                              })
                            }}
                          </template>
                          <FIcon
                            group="communication"
                            name="reply-all"
                            size="18"
                            :pressable="false"
                          ></FIcon>
                        </FTooltip>
                      </FButton>
                    </FContainer>
                  </FContainer>
                </FContainer>
                <FContainer
                  paddingBottom="containerMedium"
                  paddingLeft="containerLarge"
                  paddingRight="containerLarge"
                  display="flex"
                  v-if="mailContent.to || mailContent.cc || mailContent.bcc"
                >
                  <FContainer display="flex">
                    <FText appearance="bodyReg14" color="textCaption">
                      {{ getMailList(mailContent) }}
                    </FText>
                  </FContainer>
                  <FContainer paddingLeft="containerXLarge">
                    <FPopover placement="bottom-start" trigger="hover">
                      <FContainer display="flex" cursor="pointer">
                        <FText
                          color="backgroundPrimaryDefault"
                          whiteSpace="nowrap"
                          >{{ getCount(mailContent) }}</FText
                        >
                        <FContainer padding="containerSmall"> </FContainer>
                      </FContainer>
                      <FContainer slot="content" padding="containerLarge">
                        <FContainer
                          display="flex"
                          padding="containerLarge"
                          v-if="
                            mailContent.from &&
                            mailContent.messageType === messageTypeEnum.reply
                          "
                        >
                          <FContainer width="65px">
                            <FText appearance="bodyReg14">
                              {{
                                $t('conversation.from', {
                                  ns: 'servicerequest',
                                })
                              }}
                            </FText>
                          </FContainer>
                          <FContainer>
                            <FContainer
                              display="flex"
                              v-for="(
                                from, index
                              ) in getDisplayNameAndEmailFromEMail(
                                mailContent.from
                              )"
                              :key="index"
                            >
                              <FContainer paddingRight="containerMedium">
                                <FText appearance="headingMed14">{{
                                  from.name
                                }}</FText>
                              </FContainer>
                              <FContainer>
                                <FText appearance="bodyReg14">{{
                                  from.email
                                }}</FText>
                              </FContainer>
                            </FContainer>
                          </FContainer>
                        </FContainer>
                        <FContainer
                          v-if="mailContent.to"
                          display="flex"
                          padding="containerLarge"
                        >
                          <FContainer
                            width="65px"
                            v-if="
                              mailContent.messageType === messageTypeEnum.reply
                            "
                          >
                            <FText
                              >{{
                                $t('conversation.to', {
                                  ns: 'servicerequest',
                                })
                              }}
                            </FText>
                          </FContainer>
                          <FContainer v-else width="70px">
                            <FText
                              >{{
                                $t('conversation.notify_to', {
                                  ns: 'servicerequest',
                                })
                              }}
                            </FText>
                          </FContainer>
                          <FContainer>
                            <FContainer
                              display="flex"
                              v-for="(
                                from, index
                              ) in getDisplayNameAndEmailFromEMail(
                                mailContent.to
                              )"
                              :key="index"
                            >
                              <FContainer paddingRight="containerMedium">
                                <FText appearance="headingMed14"
                                  >{{ from.name }}
                                </FText>
                              </FContainer>
                              <FContainer>
                                <FText appearance="bodyReg14">
                                  {{ from.email }}</FText
                                >
                              </FContainer>
                            </FContainer>
                          </FContainer>
                        </FContainer>
                        <FContainer
                          v-if="mailContent.bcc"
                          display="flex"
                          padding="containerLarge"
                        >
                          <FContainer width="65px">
                            <FText
                              >{{
                                $t('conversation.bcc', {
                                  ns: 'servicerequest',
                                })
                              }}
                            </FText>
                          </FContainer>
                          <FContainer>
                            <FContainer
                              display="flex"
                              v-for="(
                                from, index
                              ) in getDisplayNameAndEmailFromEMail(
                                mailContent.bcc
                              )"
                              :key="index"
                            >
                              <FContainer paddingRight="containerMedium">
                                <FText appearance="headingMed14">{{
                                  from.name
                                }}</FText>
                              </FContainer>
                              <FContainer>
                                <FText appearance="bodyReg14">{{
                                  from.email
                                }}</FText></FContainer
                              >
                            </FContainer>
                          </FContainer>
                        </FContainer>
                        <FContainer
                          v-if="mailContent.cc"
                          display="flex"
                          padding="containerLarge"
                        >
                          <FContainer width="65px">
                            <FText
                              >{{
                                $t('conversation.cc', {
                                  ns: 'servicerequest',
                                })
                              }}
                            </FText>
                          </FContainer>
                          <FContainer>
                            <FContainer
                              display="flex"
                              v-for="(
                                from, index
                              ) in getDisplayNameAndEmailFromEMail(
                                mailContent.cc
                              )"
                              :key="index"
                            >
                              <FContainer paddingRight="containerMedium">
                                <FText appearance="headingMed14"
                                  >{{ from.name }}
                                </FText>
                              </FContainer>
                              <FContainer>
                                <FText appearance="bodyReg14"
                                  >{{ from.email }}
                                </FText>
                              </FContainer>
                            </FContainer>
                          </FContainer>
                        </FContainer>
                        <FContainer
                          v-if="mailContent.sysCreatedTime"
                          display="flex"
                          padding="containerLarge"
                        >
                          <FContainer width="65px">
                            <FText
                              >{{
                                $t('conversation.date', {
                                  ns: 'servicerequest',
                                })
                              }}
                            </FText>
                          </FContainer>
                          <FContainer>
                            <FText appearance="headingMed14">{{
                              formatDate(mailContent.sysCreatedTime)
                            }}</FText>
                          </FContainer>
                        </FContainer>
                      </FContainer>
                    </FPopover>
                  </FContainer>
                </FContainer>
                <FContainer padding="containerLarge">
                  <FContainer overflowX="scroll">
                    <FContainer v-if="!mailContent.hideContent">
                      <div v-html="htmlRenderContent(mailContent)"></div>
                    </FContainer>
                    <FContainer
                      v-if="mailContent.hideContent"
                      textOverflow="ellipsis"
                      overflow="hidden"
                      whiteSpace="nowrap"
                    >
                      <FText appearance="bodyReg14">{{
                        htmlRenderContent(mailContent)
                      }}</FText>
                    </FContainer>
                    <FContainer
                      v-if="
                        !isEmpty(
                          getExternalAttachments(mailContent.attachmentsList)
                        )
                      "
                    >
                      <AttachmentsFragment
                        :attachmentsList="
                          getExternalAttachments(mailContent.attachmentsList)
                        "
                      />
                    </FContainer>
                    <FContainer
                      v-if="showQuote(mailContent)"
                      class="show-quote"
                      marginTop="containerSmall"
                    >
                      <FIcon
                        group="action"
                        name="options-horizontal"
                        size="16"
                        :pressable="true"
                        @click="toggleBlockQuote(mailContent)"
                        :disabled="mailContent.blockQuoteLoading"
                      ></FIcon>
                      <FSpinner
                        v-if="mailContent.blockQuoteLoading"
                        :show="true"
                        :size="25"
                      ></FSpinner>
                    </FContainer>
                  </FContainer>
                </FContainer>
              </FContainer>
            </FContainer>
            <FDivider width="100%"></FDivider>
          </FContainer>
        </FContainer>
        <FContainer
          display="flex"
          padding="containerXLarge"
          v-if="!mailerVisibility"
          marginBottom="containerXxLarge"
        >
          <FContainer
            marginRight="containerLarge"
            @click="showMailer(1)"
            v-if="!isPortalUser() && (emailAll || emailThreadOnly)"
          >
            <FButton appearance="primary" size="medium">
              <FIcon
                group="communication"
                name="reply-all-filled"
                size="16"
                color="backgroundNeutralGrey01Subtler"
                :pressable="false"
              ></FIcon>

              <FText appearance="headingMed14" paddingLeft="containerMedium">
                {{ $t('service_request.reply_all', { ns: 'servicerequest' }) }}
              </FText>
            </FButton>
          </FContainer>
          <FContainer
            @click="showMailer(3)"
            v-if="emailAll || emailCommentOnly"
          >
            <FButton appearance="secondary" size="medium" v-if="emailAll">
              <FIcon
                group="social"
                name="comment"
                size="16"
                :pressable="false"
              ></FIcon>
              <FText appearance="headingMed14" paddingLeft="containerMedium">
                {{ $t('service_request.comment', { ns: 'servicerequest' }) }}
              </FText>
            </FButton>
            <FButton appearance="primary" size="medium" v-if="emailCommentOnly">
              <FIcon
                group="communication"
                name="comment-filled"
                size="16"
                color="borderNeutralGrey01Subtler"
                :pressable="false"
              ></FIcon>

              <FText appearance="headingMed14" paddingLeft="containerMedium">
                {{ $t('service_request.comment', { ns: 'servicerequest' }) }}
              </FText>
            </FButton>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer
      v-if="showEmptyStateWhenDescriptionNotExist()"
      paddingTop="sectionLarge"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="60%"
      paddingBottom="sectionLarge"
    >
      <FContainer paddingTop="sectionLarge">
        <FEmptyState
          :title="
            $t('service_request.no_conversation_found', {
              ns: 'servicerequest',
            })
          "
          vertical
          size="M"
          illustration="add-item"
      /></FContainer>
      <FContainer
        display="flex"
        justifyContent="center"
        v-if="!mailerVisibility"
      >
        <FContainer @click="showMailer(3)" v-if="emailAll || emailCommentOnly">
          <FButton
            appearance="secondary"
            size="medium"
            v-if="emailAll"
            iconGroup="social"
            iconName="comment"
            iconPosition="prefix"
          >
            <FText appearance="headingMed14">
              {{ $t('service_request.comment', { ns: 'servicerequest' }) }}
            </FText>
          </FButton>
          <FButton
            appearance="primary"
            size="medium"
            v-if="emailCommentOnly"
            iconGroup="communication"
            iconName="comment-filled"
            iconPosition="prefix"
            iconColor="backgroundNeutralGrey01Subtler"
          >
            <FText appearance="headingMed14">
              {{ $t('service_request.comment', { ns: 'servicerequest' }) }}
            </FText>
          </FButton>
        </FContainer>
        <FContainer
          v-if="!isPortalUser() && (emailAll || emailThreadOnly)"
          paddingLeft="containerXLarge"
        >
          <FButton
            appearance="primary"
            size="medium"
            @click="showMailer(1)"
            iconGroup="communication"
            iconName="reply-all-filled"
            iconColor="iconNeutralGrey01Subtler"
            iconPosition="prefix"
          >
            <FText appearance="headingMed14">{{
              $t('service_request.reply_all', { ns: 'servicerequest' })
            }}</FText>
          </FButton></FContainer
        >
      </FContainer>
    </FContainer>
    <FContainer :paddingBottom="showEmptySpace ? 'sectionLarge' : ''">
      <FContainer
        v-if="!loading && mailerVisibility"
        :paddingBottom="showEmptySpace ? 'sectionLarge' : ''"
      >
        <Mailer
          :visibility.sync="mailerVisibility"
          :messageType="messageType"
          :details="details"
          :previousMail="getLastThread"
          @close="closeMailer()"
          @saved="record => saved(record)"
          @resizePage="resizePage"
        ></Mailer>
      </FContainer>
    </FContainer>
  </FContainer>
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
  FTooltip,
  FPopover,
  FIcon,
  ftoast,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import Mailer from './ServiceRequestMailer.vue'
import planer from 'planer'
import AttachmentsFragment from './MailAttachmentsFragment.vue'
import { sanitize } from '@facilio/utils/sanitize'
import { FHtml } from '@facilio/ui/app'
import { getUnRelatedModuleList } from '../../../../utils/relatedFieldUtil'
import getProperty from 'dlv'
import { execRegex } from '../../../../utils/helpers'
import { getBaseURL } from '../../../../utils/api/base-url'
import SRShimmer from './ServiceRequestConversationShimmer.vue'
import { formatDate } from '../../../../../src/utils/formatter'
import cloneDeep from 'lodash/cloneDeep'

export default {
  props: ['details', 'widget', 'fitToViewArea', 'resizeWidget', 'fitMyContent'],
  components: {
    Mailer,
    AttachmentsFragment,
    FHtml,
    FContainer,
    FText,
    FButton,
    FTags,
    FDivider,
    FSpinner,
    FAvatar,
    FEmptyState,
    FTooltip,
    FPopover,
    FIcon,
    SRShimmer,
    ftoast,
  },
  data() {
    return {
      emailAll: true,
      visible: false,
      emailCommentOnly: false,
      emailThreadOnly: false,
      replyBtn: true,
      commentBtn: false,
      emailThreads: [],
      mailerVisibility: false,
      messageType: 1,
      loading: true,
      commentOnly: false,
      reduceSize: false,
      loadData: false,
      oneTimeLoaderForAll: true,
      oneTimeLoaderForComment: false,
      oneTimeLoaderForThread: false,
      typeVsIcon: {
        1: 'email',
        2: 'public',
        3: 'locked',
      },
      totalCount: null,
      fetchAllLoader: false,
      messageTypeEnum: {
        reply: 1,
        publicNotes: 2,
        privateNotes: 3,
        client: 1,
        admin: 2,
      },
      canDisableFilter: false,
      emptyState: true,
      buttonStyle: false,
      pageCount: 1,
      emptyStateForFilter: true,
      showDescription: false,
      descriptionTextContent: '',
      replyMoreToggle: -1,
      getIndex: -1,
      getSelectedIcon: '',
      imageList: [],
      collapseDescription: false,
    }
  },
  created() {
    if (!isEmpty(this.details?.emailToModuleDataRecord)) {
      this.replaceAllImgSrcWithPreviewUrl(this.details?.emailToModuleDataRecord)
    }
    let doc = new Document()
    let desc = getProperty(this, 'details.description', '')
    let description = getProperty(
      this.details,
      'emailToModuleDataRecord.htmlContent',
      desc
    )
    let details = sanitize(description)
    this.descriptionTextContent = planer.extractFrom(details, 'text/html', doc)
    this.fetchAllEmailThreads()
    this.$nextTick(() => {
      this.fitMyContent()
    })
  },
  computed: {
    showEmptySpace() {
      let { emailThreads = [] } = this
      return emailThreads.length < 3
    },
    getLastThread() {
      if (this.getIndex != -1) {
        if (this.getSelectedIcon == 'reply') {
          let emailObj = getProperty(
            this.emailThreads,
            `${this.getIndex}`,
            null
          )
          let copiedObject = cloneDeep(emailObj)

          delete copiedObject.bcc
          delete copiedObject.cc
          return copiedObject || this.details?.emailToModuleDataRecord || {}
        } else {
          let emailObj1 = getProperty(
            this.emailThreads,
            `${this.getIndex}`,
            null
          )

          let copiedObject = cloneDeep(emailObj1)

          return copiedObject || this.details?.emailToModuleDataRecord || {}
        }
      }
      return (
        [...(this.emailThreads || [])]
          .reverse()
          .find(thread => thread.messageType === 1) ||
        this.details?.emailToModuleDataRecord ||
        {}
      )
    },
    checkDescriptionFromEMail() {
      return sanitize(
        getProperty(this, 'details.emailToModuleDataRecord.htmlContent', false)
      )
    },
    getDetails() {
      return sanitize(
        getProperty(
          this.details,
          'emailToModuleDataRecord.htmlContent',
          false
        ) || getProperty(this.details, 'description', '')
      )
    },
    hiddenConversationCount() {
      return Number(this.totalCount || 0) - (this.emailThreads || []).length
    },
    checkDescriptionExit() {
      let {
        descriptionCheck,
        loading,
        emailThreads,
        attachmentForDescription,
      } = this
      return descriptionCheck() && !loading && emailThreads.length < 1
    },
  },
  methods: {
    getProperty,
    isEmpty,
    formatDate,
    getRequesterName() {
      let { details } = this
      let { requester } = details || {}
      let { name, email } = requester || {}
      return name || email || null
    },

    async fetchAllEmailThreads(fetchAll = false) {
      if (
        (this.emailAll && this.oneTimeLoaderForAll) ||
        (this.emailCommentOnly && this.oneTimeLoaderForComment) ||
        (this.emailThreadOnly && this.oneTimeLoaderForThread)
      ) {
        let filters = {
          dataModuleId: {
            operatorId: 9,
            value: [String(this.details?.moduleId)],
          },
          recordId: { operatorId: 9, value: [String(this.details?.id)] },
        }
        if (this.emailThreadOnly) {
          filters.messageType = { operatorId: 9, value: ['1'] }
        }
        if (this.emailCommentOnly) {
          filters.messageType = { operatorId: 9, value: ['2', '3'] }
        }
        let params = {
          viewName: 'all',
          filters: JSON.stringify(filters),
          withCount: true,
          orderBy: 'id',
          orderType: 'desc',
          page: this.pageCount,
        }
        if (fetchAll) {
          this.fetchAllLoader = true
          if (this.emailThreads.length < 50) {
            this.pageCount = 1
          } else {
            this.pageCount++
          }
          params.page = this.pageCount
        } else {
          params.perPage = 3
          this.loading = true
          this.pageCount = 1
          this.emailThreads = []
        }
        params.page = this.pageCount
        let { error, list, meta } = await getUnRelatedModuleList(
          'serviceRequest',
          'emailConversationThreading',
          params
        )
        if (error) {
          let { message } = error
          ftoast.critical(
            message || 'Error occurred while fetching email threads'
          )
        } else {
          if (list) {
            list.forEach(record => {
              this.setVariablesForRecord(record)
            })
          }
          if (this.emailThreads.length < 50) {
            this.emailThreads = (list || []).reverse()

            this.pageCount = 1
          } else {
            if (this.pageCount > 1) {
              let allEmailThreads = (list || []).reverse()
              this.emailThreads.forEach(record => {
                allEmailThreads.push(record)
              })
              this.emailThreads = allEmailThreads
            }
            params.page = this.pageCount
          }
          if (this.emailThreads.length > 0) {
            this.canDisableFilter = true
            this.buttonStyle = false
          }
          if (this.emailThreads.length > 0 || this.details.description) {
            this.emptyState = false
          }

          let { emailThreads = [] } = this
          let emailThreadsLength = emailThreads.length

          let { details } = this

          let descriptionContent = getProperty(details, 'description', null)
          if (emailThreadsLength < 1 && !isEmpty(descriptionContent)) {
            this.showDescription = true
          } else if (emailThreadsLength === 1 && isEmpty(descriptionContent)) {
            this.emailThreads[0].hideContent = false
          } else {
            this.showDescription = false
          }

          this.totalCount = getProperty(meta, 'pagination.totalCount', null)
          if (
            isEmpty(this.emailThreads) &&
            this.emailAll &&
            !this.details.description
          ) {
            this.emptyState = true
            this.mailerVisibility = false
          }
          if (!isEmpty(this.emailThreads)) {
            this.buttonStyle = false
          }
          if (
            !isEmpty(this.emailThreads) &&
            (this.emailCommentOnly || this.emailThreadOnly)
          ) {
            this.emptyStateForFilter = false
          }
        }
      }
      if (this.emailAll) {
        this.oneTimeLoaderForAll = false
        this.oneTimeLoaderForComment = true
        this.oneTimeLoaderForThread = true
        if (!getProperty(this, 'details.description') && this.emptyState) {
          this.buttonStyle = true
        } else {
          this.buttonStyle = false
        }
      }
      if (this.emailCommentOnly) {
        this.oneTimeLoaderForAll = true
        this.oneTimeLoaderForComment = false
        this.oneTimeLoaderForThread = true
      }
      if (this.emailThreadOnly) {
        this.oneTimeLoaderForAll = true
        this.oneTimeLoaderForComment = true
        this.oneTimeLoaderForThread = false
      }
      this.setLastThreadAsOpenState()
      this.fetchAllLoader = false

      this.fitContent()

      this.loading = false
    },
    setLastThreadAsOpenState() {
      let { emailThreads = [] } = this
      if (!isEmpty(emailThreads)) {
        let position = emailThreads.length - 1
        let lastThread = emailThreads[position] || []
        lastThread.hideContent = false
        this.collapseDescription = true
        this.fitContent()
      }
    },
    fitContent() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.fitMyContent()
        })
      }, 200)
    },
    condition(mailContent, index) {
      let { replyMoreToggle, messageTypeEnum } = this || {}
      return (
        index == replyMoreToggle &&
        !this.isPortalUser() &&
        (getProperty(mailContent, 'messageType') === messageTypeEnum.reply ||
          getProperty(mailContent, 'messageType') === messageTypeEnum.client)
      )
    },
    borderCheck() {
      let { emailAll, details, hiddenConversationCount } = this || {}
      let description = details || {}
      if (emailAll && description && hiddenConversationCount <= 0) {
        return true
      }
      return false
    },
    checkFilterState() {
      let { emptyState, emailLength, emailAll } = this || {}
      let state = !emptyState && !(emailLength() && emailAll)
      return state
    },
    checkEmptyState() {
      let { loading, emailLength, emailThreadOnly, emailCommentOnly } =
        this || {}
      let state =
        !loading && emailLength() && (emailThreadOnly || emailCommentOnly)

      if (state) {
        this.buttonStyle = true
      }
      return state
    },
    emailLength() {
      return isEmpty(this.emailThreads)
    },
    getCount(mailContent) {
      let count = 0
      if (mailContent.to) {
        count += mailContent.to.split(',').length
      }
      if (mailContent.bcc) {
        count += mailContent.bcc.split(',').length
      }
      if (mailContent.cc) {
        count += mailContent.cc.split(',').length
      }
      if (count > 5) {
        let tempCount = count - 5
        return '+' + tempCount + ' more'
      } else {
        return 'more'
      }
    },
    fitOverview() {
      this.$nextTick(() => this.fitToViewArea())
    },
    async getIndexForShowMail(index, val) {
      if (val == 0) {
        this.getSelectedIcon = 'reply'
      } else if (val == 1) {
        this.getSelectedIcon = 'replyAll'
      }
      this.getIndex = index
      await this.showMailer(1)
      this.fitContent()

      setTimeout(() => {
        document.querySelector('.page-builder-wrapping').scrollIntoView({
          behavior: 'smooth',
          inline: 'end',
          block: 'end',
        })
      }, 200)
    },
    getMailList(mailContent) {
      let emailValues = mailContent
      let emailNameList = []
      let count = 0
      if (emailValues.to) {
        let to = emailValues.to.split(',')
        if (count < 5) {
          to.forEach(val => {
            if (count < 5) {
              emailNameList.push(this.getNameAndEMail(val).name)
              count += 1
            }
          })
        }
      }
      if (emailValues.bcc) {
        let bcc = emailValues.bcc.split(',')
        if (count < 5) {
          bcc.forEach(val => {
            if (count < 5) {
              emailNameList.push(this.getNameAndEMail(val).name)
              count += 1
            }
          })
        }
      }
      if (emailValues.cc) {
        let cc = emailValues.cc.split(',')
        if (count < 5) {
          cc.forEach(val => {
            if (count < 5) {
              emailNameList.push(this.getNameAndEMail(val).name)
              count += 1
            }
          })
        }
      }
      if (emailNameList) {
        return 'To : ' + emailNameList.join(', ')
      } else {
        return ''
      }
    },
    showMailer(value) {
      this.messageType = value
      this.mailerVisibility = true
      this.emptyState = false
      this.emptyStateForFilter = false

      if (this.emailAll) {
        this.oneTimeLoaderForAll = true
      } else if (this.emailCommentOnly) {
        this.oneTimeLoaderForComment = true
      } else if (this.emailThreadOnly) {
        this.oneTimeLoaderForThread = true
      }
      this.fitContent()

      let { emailThreads = [] } = this
      if (!isEmpty(emailThreads)) {
        setTimeout(() => {
          document.querySelector('.page-builder-wrapping').scrollIntoView({
            behavior: 'smooth',
            inline: 'end',
            block: 'end',
          })
        }, 200)
      }
    },
    scrollToMailer() {
      if (this.$refs.parentDiv) {
        const parentDiv = this.$refs.parentDiv
        const scrollOptions = {
          top: parentDiv.scrollHeight,
          behavior: 'smooth',
        }

        parentDiv.scrollTo(scrollOptions)

        const endScrollOptions = {
          top: parentDiv.scrollHeight,
          behavior: 'smooth',
        }

        this.$nextTick(() => {
          parentDiv.scrollTo(endScrollOptions)
        })
      }
    },
    closeMailer() {
      this.emptyStateForFilter = true
      this.fetchAllEmailThreads()
      this.mailerVisibility = false
      this.getIndex = -1
      this.getSelectedIcon = ''
      this.fitContent()
    },

    saved(record) {
      this.setVariablesForRecord(record)
      this.emailThreads = [...this.emailThreads, record]
      this.closeMailer()
    },
    setVariablesForRecord(record = {}) {
      record.hideContent = true
      this.replaceAllImgSrcWithPreviewUrl(record)
      if (isEmpty(record.htmlContent)) {
        record.htmlContent = ''
      }
      if (record.messageType === 1) {
        record.blockQuoteLoading = false
        record.showBlockQuote = false
        let doc = new Document()
        let mainContent = planer.extractFrom(
          record.htmlContent,
          'text/html',
          doc
        )
        if (!isEmpty(mainContent) && mainContent != record.htmlContent) {
          record.containsQuote = true
        }
        record.mainContent = mainContent
      } else {
        record.mainContent = record.htmlContent
      }
    },
    toggleContent(mailContent) {
      mailContent.hideContent = !mailContent.hideContent
      this.fitContent()
    },
    toggleDescription() {
      this.showDescription = !this.showDescription
      this.fitContent()
    },
    toggleBlockQuote(record) {
      record.showBlockQuote = !record.showBlockQuote
      this.toggleContent(record)
      this.fitContent()
    },
    getDisplayNameFromEMail(to) {
      let list = to.split(',')
      let listOfNames = []
      list.forEach(address => {
        listOfNames.push(this.getNameAndEMail(address).name)
      })
      return listOfNames.join(', ')
    },
    getDisplayNameAndEmailFromEMail(to) {
      let list = to.split(',')
      let listOfNames = []
      list.forEach(address => {
        listOfNames.push(this.getNameAndEMail(address))
      })
      return listOfNames
    },
    getExternalAttachments(list) {
      return (list && list.filter(at => at.type !== 2)) || []
    },
    attachmentForDescription() {
      let { descriptionCheck, getExternalAttachments, details } = this || {}

      let attachmentList = getProperty(
        details,
        'emailToModuleDataRecord.attachmentsList'
      )
      let externalAttachment = getExternalAttachments(attachmentList)
      let hasAttachment = !isEmpty(externalAttachment)

      return hasAttachment && descriptionCheck()
    },
    replaceAllImgSrcWithPreviewUrl(record) {
      let regExVal = /src=['"]cid:([^'"]+)['"]/
      let regExExecValues = execRegex(
        record.htmlContent,
        new RegExp(regExVal, 'g')
      )
      regExExecValues.forEach(value => {
        let cid = value[1]
        let attachment =
          record.attachmentsList &&
          record.attachmentsList.find(
            at => at.contentId === cid && at.type === 2
          )
        if (!isEmpty(attachment)) {
          record.htmlContent = record.htmlContent.replace(
            regExVal,
            `src="${this.getImagePreviewUrl(
              attachment.fileId
            )}" data-id="${cid}"`
          )
        }
      })
    },
    appendWhiteSpace(el) {
      let walk = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT, null)
      let node = walk?.nextNode()
      while (node) {
        if (node?.nodeName !== 'SREL') {
          let ws_node = document.createTextNode(' ')
          node?.parentNode.insertBefore(ws_node, node?.nextSibling)
        }
        node = walk?.nextNode()
      }
      return el?.firstChild?.textContent || el?.firstChild?.innerText || ''
    },
    addWhiteSpaceToNodes(content, isDescription = false) {
      if (!this.checkDescriptionFromEMail && isDescription) {
        return !isEmpty(content) ? content : ''
      }
      let doc = document.createDocumentFragment()
      let wrapper = document.createElement('srel')
      wrapper.innerHTML = sanitize(content)
      doc.appendChild(wrapper)
      return !isEmpty(content) ? this.appendWhiteSpace(doc) : ''
    },
    expandAllConversation() {
      if (this.emailAll) {
        this.oneTimeLoaderForAll = true
      } else if (this.emailCommentOnly) {
        this.oneTimeLoaderForComment = true
      } else if (this.emailThreadOnly) {
        this.oneTimeLoaderForThread = true
      }
      this.fetchAllEmailThreads(true)
    },
    filterAll() {
      this.emailAll = true
      this.emailCommentOnly = false
      this.emailThreadOnly = false
      this.commentOnly = false
      this.loadData = false
      this.fetchAllEmailThreads()
      this.closeMailer()
    },
    filterOnlyComment() {
      this.emailAll = false
      this.emailCommentOnly = true
      this.emailThreadOnly = false
      this.commentOnly = true
      this.emptyStateForFilter = true
      this.loadData = false
      if (this.canDisableFilter) {
        this.fetchAllEmailThreads()
      }
      this.closeMailer()
    },
    filterOnlyThread() {
      this.emailAll = false
      this.emailCommentOnly = false
      this.emailThreadOnly = true
      this.commentOnly = false
      this.emptyStateForFilter = true
      this.loadData = false
      if (this.canDisableFilter) {
        this.fetchAllEmailThreads()
        this.emailThreads = this.emailThreads.reverse()
      }
      this.closeMailer()
    },
    descriptionCheck() {
      let { checkFilterState, details, emailAll } = this || {}
      return (
        (checkFilterState() || details.description) &&
        emailAll &&
        this.details.description
      )
    },
    replyMoreToggleFunction(key) {
      if (this.replyMoreToggle == -1) {
        this.replyMoreToggle = key
      } else {
        this.replyMoreToggle = -1
      }
    },
    requester() {
      let requesterName = getProperty(this, 'details.requester.name')
      let requesterEmail = getProperty(this, 'details.requester.email')
      return requesterName || requesterEmail
    },
    htmlRenderContent(mailContent) {
      let { addWhiteSpaceToNodes } = this || {}
      let { hideContent, mainContent, htmlContent, showBlockQuote } =
        mailContent || {}

      let blockQuote = showBlockQuote
        ? sanitize(htmlContent)
        : sanitize(mainContent)

      let content = hideContent ? addWhiteSpaceToNodes(mainContent) : blockQuote

      return content
    },
    getUserName(mailContent) {
      let { fromUser, fromPeople } = mailContent || {}
      let { name, userName } = fromUser || {}
      let { name: fromPeopleName, email } = fromPeople || {}
      return name || userName || fromPeopleName || email || ''
    },
    getRequesterOfDescription() {
      let { details } = this
      let { requester } = details
      let { name, email } = requester || {}
      let requesterName = name || email
      return requesterName
    },
    showQuote(mailContent) {
      let { hideContent, containsQuote, showBlockQuote } = mailContent

      return !hideContent && containsQuote && !showBlockQuote
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
    getFromAddressName(mailContent) {
      return mailContent.from ? this.getNameAndEMail(mailContent.from).name : ''
    },
    showEmptyStateWithReplyCommentButtons() {
      let {
        descriptionCheck,
        loading,
        emailThreads,
        attachmentForDescription,
        mailerVisibility,
      } = this
      return (
        descriptionCheck() &&
        !loading &&
        emailThreads.length < 1 &&
        !mailerVisibility
      )
    },
    showFilterButtons() {
      let { loading, emailThreads, emailCommentOnly, emailThreadOnly } = this
      return (
        !loading &&
        (emailThreads.length > 0 || emailCommentOnly || emailThreadOnly)
      )
    },
    getNameAndEMail(value) {
      let mailRegEx = /(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/g
      let values = mailRegEx.exec(value)
      if (isEmpty(values)) {
        let name = value.replace('<>', '')
        return { name }
      }
      return { name: values[1] || values[2] || '', email: values[2] || '' }
    },
    showEmptyStateWhenDescriptionNotExist() {
      let {
        descriptionCheck,
        loading,
        emailThreads,
        attachmentForDescription,
        mailerVisibility,
      } = this
      return (
        !descriptionCheck() &&
        !loading &&
        emailThreads.length < 1 &&
        !attachmentForDescription() &&
        !mailerVisibility
      )
    },
    isPortalUser() {
      return getProperty(this.$account, 'user.appType') > 0
    },
    resizePage(param) {
      if (param) {
        this.fitContent()
      }
    },
    collapseDescriptionEvent() {
      this.collapseDescription = !this.collapseDescription
      this.fitContent()
    },
  },
}
</script>
<style lang="scss">
.sr-conversation-threading {
  height: fit-content !important;
  position: relative;
  .expander {
    .show-expander-count {
      opacity: 1;
      display: flex;
    }
    .show-expander-icon {
      opacity: 0;
      display: none;
    }
  }
  .expander:hover {
    .show-expander-count {
      opacity: 0;
      display: none;
    }
    .show-expander-icon {
      display: flex;
      opacity: 1;
    }
  }
}
</style>
