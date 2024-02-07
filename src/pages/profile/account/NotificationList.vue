<template>
  <FContainer>
    <FContainer
      v-if="isLoading || isEmpty(modifiedNotificationData)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="300px"
    >
      <FSpinner v-if="isLoading" :size="showInTab ? 40 : 20" />
      <FContainer v-else-if="isEmpty(modifiedNotificationData)">
        <FEmptyState
          :title="$t('notification.no_notification')"
          :description="$t('notification.description')"
          :vertical="true"
          :size="!showInTab ? 'S' : 'M'"
          illustration="no-activities"
        ></FEmptyState>
      </FContainer>
    </FContainer>
    <FContainer
      v-else
      :height="showInTab && 'calc(100vh - 330px)'"
      :maxHeight="!showInTab && '500px'"
      overflow="scroll"
      :marginTop="showInTab && 'sectionMedium'"
      paddingLeft="sectionSmall"
      paddingRight="sectionSmall"
    >
      <portal to="pagination">
        <FContainer paddingRight="sectionSmall">
          <Pagination
            :totalCount="totalCount"
            :currentPageNo.sync="page"
            :perPage="perPage"
          />
        </FContainer>
      </portal>
      <FContainer
        v-for="(notification, index) in modifiedNotificationData"
        :key="index"
      >
        <FContainer
          display="flex"
          flexDirection="row"
          padding="containerXLarge"
          borderTop="1px solid"
          borderColor="borderNeutralBaseSubtle"
          gap="containerXLarge"
          cursor="pointer"
          width="100%"
          :backgroundColor="
            !notification.isRead ? 'backgroundAccentBlueSubtle' : ''
          "
          @click="!showInTab && notificationClickAction(notification)"
        >
          <FContainer display="flex" flexDirection="row" alignItems="center">
            <FIcon
              group="webtabs"
              :name="getModuleIconName(notification)"
              size="18"
              borderRadius="full"
              border="1px solid"
              borderColor="borderNeutralBaseSubtle"
              padding="4"
            ></FIcon>
          </FContainer>
          <FContainer
            gap="containerLarge"
            display="flex"
            flex-direction="column"
            width="100%"
          >
            <FContainer
              display="flex"
              alignItems="center"
              gap="containerXLarge"
            >
              <FContainer
                display="flex"
                flexDirection="row"
                flexGrow="1"
                :alignItems="showInTab && 'center'"
                :gap="showInTab ? 'containerXLarge' : 'containerMedium'"
                justifyContent="space-between"
              >
                <FContainer>
                  <FText appearance="headingMed14" color="textMain">{{
                    notification.title
                  }}</FText>
                  <FText appearance="bodyReg14" color="textCaption">{{
                    ` | ${getModuleName(notification)}`
                  }}</FText>
                </FContainer>
                <FContainer>
                  <FText appearance="bodyReg14" color="textCaption">{{
                    `${fromNowDate(notification.sysCreatedTime)}`
                  }}</FText>
                </FContainer>
              </FContainer>
            </FContainer>
            <FText
              appearance="bodyReg14"
              color="textDescription"
              overflow="hidden"
              textOverflow="ellipsis"
              class="ellipsis-txt"
              >{{ notification.subject }}</FText
            >
            <FContainer>
              <FContainer
                v-if="showInTab && hasAction(notification)"
                gap="containerMedium"
                @click="notificationClickAction(notification)"
                class="link-text flex"
              >
                <FIcon
                  group="dsm"
                  name="open-window"
                  size="16"
                  :pressable="false"
                ></FIcon>
                <FText>{{ $t('notification.go_to_summary') }}</FText>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FText,
  FIcon,
  FSpinner,
  FEmptyState,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import dlv from 'dlv'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
import FetchViewsMixin from '../../../../src/components/views/FetchViews.vue'
import Pagination from '../../list/Pagination.vue'
import { fromNow } from '../../../utils/formatter'

const notificationsStatus = {
  UNSEEN: 1,
  UNREAD: 2,
  SEEN: 3,
}

export default {
  props: ['showInTab'],
  mixins: [FetchViewsMixin],
  components: {
    FContainer,
    FText,
    FIcon,
    FSpinner,
    FEmptyState,
    Pagination,
  },
  data() {
    return {
      isEmpty,
      modifiedNotificationData: [],
      isLoading: false,
      perPage: this.showInTab ? 50 : 7,
      totalCount: null,
      page: 1,
    }
  },
  created() {
    this.fetchNotificationsPopup()
  },
  watch: {
    page() {
      this.fetchNotificationsPopup()
    },
  },
  methods: {
    async fetchNotificationsPopup() {
      this.isLoading = true
      let { list, meta, error } = await API.fetchAll('usernotification', {
        page: this.page,
        perPage: this.perPage,
      })
      if (!error) {
        this.totalCount = meta?.pagination?.totalCount
        if (!isEmpty(list)) this.$emit('hasNotificationData')
        this.deserialize(list)
      }
      this.deserialize(list)
      this.isLoading = false
    },
    deserialize(data) {
      this.modifiedNotificationData = (data || []).map(fld => {
        let isRead =
          fld.notificationStatus == notificationsStatus.SEEN ? true : false

        return { ...fld, isRead }
      })
    },
    fromNowDate(date) {
      return fromNow(date) || ''
    },
    getModuleName(item) {
      let moduleObj = dlv(item, 'action.actionData.module')
      let moduleName = dlv(moduleObj, 'name')
      let moduleDisplayName = dlv(moduleObj, 'displayName')
      let extendedModuleName = dlv(moduleObj, 'extendModule.name')

      return moduleDisplayName || moduleName || extendedModuleName || ''
    },
    getRecordId(item) {
      let recordId = dlv(item, 'action.actionData.recordId')

      if (!isEmpty(recordId) && recordId !== -1) {
        return recordId
      }
    },
    getActionType(item) {
      let actionType = dlv(item, 'action.actionType')

      if (!isEmpty(actionType)) {
        return actionType
      }
    },
    getModuleIconName(item) {
      let moduleName = this.getModuleName(item)
      let data = {
        workorder: 'workorder',
        asset: 'asset',
        training: 'connected_apps',
      }

      return !isEmpty(data[moduleName]) ? data[moduleName] : 'raw_alarm'
    },
    async notificationClickAction(notification) {
      notification.isRead = true

      let moduleName = this.getModuleName(notification)
      let recordId = this.getRecordId(notification)
      let actionType = this.getActionType(notification)

      if (!isEmpty(moduleName) && !isEmpty(recordId) && !isEmpty(actionType)) {
        let viewname = await this.fetchView(moduleName)

        let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}

        if (name) {
          let routerObj = {
            name,
            params: { viewname, id: recordId, moduleName },
          }

          this.$router.push(routerObj)
        }
      }
      this.$emit('onClosePopover')

      await this.updateStatus(notification)
      this.fetchNotificationsPopup()
    },
    async updateStatus(notificationItem) {
      let { data, error } = await API.updateRecord('usernotification', {
        id: notificationItem.id,
        data: {
          notificationStatus: notificationsStatus.SEEN,
          readAt: new Date().getTime(),
        },
      })
    },
    hasAction(notification) {
      let moduleName = this.getModuleName(notification)
      let recordId = this.getRecordId(notification)
      let actionType = this.getActionType(notification)
      return !isEmpty(moduleName) && !isEmpty(recordId) && !isEmpty(actionType)
    },
  },
}
</script>
<style scoped>
.notification-dot {
  height: 7px;
  width: 7px;
  border-radius: 50%;
  display: inline-block;
}
.ellipsis-txt {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.link-text {
  color: #0059d6;
}
</style>
