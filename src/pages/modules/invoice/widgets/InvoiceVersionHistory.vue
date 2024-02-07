<template>
  <div>
    <FModal
      title="Invoice Version History"
      :visible.sync="showVersionHistory"
      size="M"
      @ok="handleOk"
      @cancel="close"
      :hideFooter="true"
    >
      <FContainer v-if="isEmpty(versionHistory)">
        <FContainer width="500px">
          <FEmptyState
            :title="$t('invoice.no_version_history', { ns: 'invoice' })"
            :description="
              $t('invoice.empty_version_history', { ns: 'invoice' })
            "
            vertical
            size="M"
            illustration="add-item"
          >
          </FEmptyState>
        </FContainer>
      </FContainer>
      <FContainer v-else height="100%" minHeight="200px">
        <FTable
          :rounded="false"
          :columns="column"
          :hideBorder="true"
          :data="versionHistory"
          @onCellClick="goToInvoice"
        >
          <template #[`cell.subject`]="{ row }">
            <FText color="textMain">{{ row.subject }}</FText>
          </template>
          <template #[`cell.sysCreatedTime`]="{ row }">
            <FText color="textMain">{{ formatDate(row.sysCreatedTime) }}</FText>
          </template>
          <template #[`cell.moduleState`]="{ row }">
            <FTags
              v-if="isStateFlowEnabled"
              appearance="status"
              :text="row.moduleState.displayName"
              :disabled="false"
              statusType="default"
            />
            <FTags
              v-else
              appearance="status"
              :text="invoiceStatusEnumList[row.invoiceStatus]"
              :disabled="false"
              :statusType="INVOICE_STATUS_TAG[row.invoiceStatusEnum]"
            />
          </template>
          <template #[`cell.sysCreatedBy`]="{ row }">
            <FContainer
              display="flex"
              alignItems="center"
              gap="containerMedium"
            >
              <FAvatar size="S" :userName="getSysCreatedName(row)"></FAvatar>
              <FContainer>
                <FText color="textMain"> {{ getSysCreatedName(row) }}</FText>
              </FContainer>
            </FContainer>
          </template>
          <template #[`cell.action`]="{ row }">
            <div style="display: flex">
              <FButton
                appearance="link"
                size="medium"
                iconGroup="dsm"
                iconName="open-window"
                iconPosition="prefix"
                @click="redirectToInvoice(row)"
              >
                View
              </FButton>
            </div>
          </template>
        </FTable>
      </FContainer>
    </FModal>
  </div>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import router from '../../../../router'
import { formatDate } from '../../../../utils/formatter'
import {
  FModal,
  FTextArea,
  FContainer,
  FEmptyState,
  FTable,
  FText,
  FAvatar,
  FTags,
  FIcon,
  FButton,
} from '@facilio/design-system'
import getProperty from 'dlv'
import {
  findRouteForModule,
  pageTypes,
  isWebTabsEnabled,
} from '@facilio/router'
export default {
  name: 'InvoiceVersionHistory',
  props: [
    'moduleName',
    'invoiceId',
    'showVersionHistory',
    'isStateFlowEnabled',
    'invoiceStatusEnumList',
  ],
  data() {
    return {
      isEmpty,
      INVOICE_STATUS_TAG: {
        DRAFT: 'default',
        DELIVERED: 'warning',
        REJECTED: 'danger',
        APPROVED: 'information',
        CANCELLED: 'danger',
        PAYMENT_ACKNOWLEDGED: 'success',
        REVISED: 'neutral',
      },
      column: [
        {
          displayName: 'Version',
          name: 'invoiceVersion',
          id: 1,
          width: 100,
          clickable: true,
        },
        {
          displayName: 'Publish State',
          name: 'moduleState',
          id: 2,
          width: 200,
          clickable: true,
        },
        {
          displayName: 'Created By',
          name: 'sysCreatedBy',
          id: 3,
          width: 200,
          clickable: true,
        },
        {
          displayName: 'Created on',
          name: 'sysCreatedTime',
          id: 4,
          resize: true,
          width: 200,
        },
      ],
      versionHistory: [],
    }
  },
  created() {
    this.getInvoiceHistory()
  },
  components: {
    FModal,
    FTextArea,
    FContainer,
    FTable,
    FEmptyState,
    FText,
    FAvatar,
    FTags,
    FIcon,
    FButton,
  },
  computed: {
    currModuleName() {
      return 'invoice'
    },
    widgetTitle() {
      return 'Invoice Version History'
    },
  },
  methods: {
    formatDate,
    goToInvoice(row) {
      let { invoiceId, moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      let version = `v${row.invoiceVersion}`
      let params = { id: invoiceId }
      let query = { version }
      let { href } =
        router.resolve({
          name,
          params,
          query,
        }) || {}
      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
    getSysCreatedName(row) {
      return row?.sysCreatedByPeople?.name ? row?.sysCreatedByPeople?.name : ''
    },

    getStatusType(name) {
      if (name === 'Published') {
        return 'success'
      } else if (name === 'Draft') {
        return 'warning'
      } else {
        return 'neutral'
      }
    },
    async getInvoiceHistory() {
      let { invoiceId, moduleName } = this
      let params = { invoiceId }
      let { data, error } = await API.get('v3/invoice/versionHistory', params)
      if (!error) {
        let { result } = data || {}
        this.versionHistory = result
      } else {
        ftoast.critical(error?.message || 'Error Fetching Version History')
      }
    },
    redirectToInvoice(record) {
      let { group, invoiceVersion: version } = record || {}
      let groupId = getProperty(group, 'id', null)
      let { moduleName } = this
      let route = {}
      version = `v${version}`
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      route = {
        name,
        params: {
          viewname: 'all',
          id: groupId,
        },
        query: { version },
      }
      let { href } = router.resolve(route) || {}
      if (!isEmpty(href)) {
        window.open(href, '_blank', 'noopener,noreferrer')
      }
    },
    close() {
      this.$emit('onclose')
    },
    handleOk() {
      this.close()
    },
  },
}
</script>
<style scoped>
.fc-task-remarks-dia {
  padding: 24px 16px;
}
</style>
