<template>
  <FContainer height="100%">
    <FContainer
      v-if="isLoading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FSpinner :size="30"
    /></FContainer>
    <FTable
      v-else-if="!isEmpty(serviceOrders)"
      :columns="columns"
      :data="serviceOrders"
      :rounded="false"
      :hideBorder="true"
    >
      <template #[`header.preferredStartTime`]>
        <FContainer
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <FText appearance="headingMed14">Preferred Start Time</FText>
          <FIcon
            group="default"
            name="sort"
            size="14"
            :pressable="true"
            @click="sortPreferredStartTime()"
          ></FIcon
        ></FContainer>
      </template>
      <template #[`cell.action`]="{ row }">
        <FContainer
          gap="containerLarge"
          display="flex"
          justifyContent="flex-start"
        >
          <FButton
            v-for="(button, idx) in systemButtonsForRecord(row)"
            :key="idx"
            :appearance="
              button?.identifier === 'reschedule' ? 'primary' : 'secondary'
            "
            size="small"
            @click="clickButtonAction(button, row)"
          >
            {{ button.label }}
          </FButton>
        </FContainer>
      </template>
    </FTable>

    <FContainer
      v-else
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FEmptyState
        :title="$t('service_pm.service_orders_title', { ns: 'fsm' })"
        :description="
          $t('service_pm.service_orders_description', { ns: 'fsm' })
        "
        vertical
        size="M"
        illustration="end-of-list"
      >
      </FEmptyState>
    </FContainer>
    <portal :to="`footer-${widget.id}-${widget.name}`">
      <FContainer
        padding="containerLarge"
        width="100%"
        position="sticky"
        bottom="0"
      >
        <FPagination
          :pageSize="perPage"
          :total="count"
          :currentPage.sync="page"
          @nextClick="currentChange"
          @prevClick="currentChange"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
    <FModal
      v-if="reschedulePopUpVisibility"
      :visible="reschedulePopUpVisibility"
      :confirmLoading="confirmLoading"
      size="XS"
      @cancel="
        () => {
          reschedulePopUpVisibility = false
        }
      "
    >
      <template #header>
        <FText appearance="headingMed16">{{
          $t('service_pm.reschedule', { ns: 'fsm' })
        }}</FText>
      </template>
      <template #footer>
        <FDivider width="100%"></FDivider>
        <FContainer
          display="flex"
          justifyContent="space-between"
          padding="containerXLarge sectionSmall"
        >
          <FCheckbox v-model="rescheduleSubsequent"
            >{{ $t('service_pm.reschedule_subsequent', { ns: 'fsm' }) }}
          </FCheckbox>
          <FButton
            appearance="primary"
            size="medium"
            @click="executeButtonAction(currentButton, currentRecord)"
          >
            {{ $t('service_pm.confirm', { ns: 'fsm' }) }}
          </FButton>
        </FContainer>
      </template>

      <FContainer
        display="flex"
        flexDirection="column"
        padding="sectionSmall"
        rowGap="containerMedium"
      >
        <FText appearance="captionReg12">{{
          $t('service_pm.preferred_start_date', { ns: 'fsm' })
        }}</FText>
        <FDatePicker
          v-model="rescheduleDate"
          :timeZone="timezone"
          :placeholder="$t('service_pm.pick_a_date', { ns: 'fsm' })"
          type="date"
          :validateDate="validateExecutionDate"
        />
      </FContainer>
    </FModal>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FTable,
  ftoast,
  FEmptyState,
  FSpinner,
  FModal,
  FButton,
  FText,
  FDatePicker,
  FDivider,
  FCheckbox,
  FPagination,
  FIcon,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export default {
  name: 'ServiceOrders',
  props: ['details', 'widget'],
  components: {
    FContainer,
    FTable,
    FEmptyState,
    FSpinner,
    FButton,
    FDatePicker,
    FModal,
    FText,
    FDivider,
    FCheckbox,
    FPagination,
    FIcon,
  },
  data() {
    return {
      orderType: 'asc',
      page: 1,
      perPage: 20,
      count: null,
      pageCount: null,
      isEmpty,
      currentButton: null,
      currentRecord: null,
      reschedulePopUpVisibility: false,
      rescheduleSubsequent: false,
      confirmLoading: false,
      isLoading: false,
      systemButtons: {},
      rescheduleDate: null,
      serviceOrders: [],
      columns: [
        {
          displayName: 'Name',
          name: 'name',
          id: 1,
          fixed: true,
          resize: true,
          width: 100,
        },
        {
          displayName: 'Created Time',
          name: 'createdTime',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Preferred Start Time',
          name: 'preferredStartTime',
          id: 3,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Preferred End Time',
          name: 'preferredEndTime',
          id: 4,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Status',
          name: 'status',
          id: 5,
          width: 100,
        },
      ],
    }
  },
  created() {
    this.getServiceOrdersCount()
    this.getServiceOrders(true)
  },
  computed: {
    timezone() {
      let { $account: account } = this || {}
      let timezone
      if (!(account || {}).timezone) {
        let orgTimeZone = getProperty(account, 'org.timezone')
        timezone = orgTimeZone ? orgTimeZone : 'Etc/UTC'
      } else {
        let { timezone: accountTimeZone } = account || {}
        timezone = accountTimeZone ? accountTimeZone : 'Etc/UTC'
      }
      return timezone
    },
    filters() {
      let { details } = this
      let { id } = details
      return {
        servicePlannedMaintenance: {
          operatorId: 36,
          value: [id + ''],
        },
      }
    },
  },
  methods: {
    async loadSystemButtons(serviceOrders) {
      this.buttonIconsArray = []
      if (!isEmpty(serviceOrders)) {
        let recordIds = serviceOrders.map(serviceOrder => serviceOrder.id)
        let url = `v2/systemButton/getAvailableButtonsForList`
        let bodyReg = {
          recordIds: recordIds,
          moduleName: 'serviceOrder',
          positionType: 2,
        }
        let { error, data } = await API.get(url, bodyReg, { force: true })
        if (error) {
          let { message } = error || {}
          ftoast.critical(message || this.$t('error_occurred'), {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          serviceOrders.forEach(record => {
            let { systemButtons, systemButtonsForRecords } = data || {}

            let { evaluatedButtonIds: buttonIds } =
              (systemButtonsForRecords || []).find(r => r.id === record.id) ||
              {}

            if (!isEmpty(buttonIds)) {
              this.systemButtons[record.id] = buttonIds
                .filter(buttonId => {
                  let { identifier } = systemButtons[buttonId] || {}
                  return ['reschedule', 'cancelSO'].includes(identifier)
                })
                .map(buttonId => {
                  let { identifier, name, id } = systemButtons[buttonId] || {}
                  return {
                    identifier: identifier,
                    label: name,
                    buttonId: id,
                    recordParentId: record.id,
                  }
                })
            }
          })
        }
      }
    },
    currentChange(page) {
      this.page = page
      this.getServiceOrders(true)
    },
    systemButtonsForRecord(record) {
      let { systemButtons } = this
      let { id } = record || {}
      return (systemButtons || {})[id] || []
    },
    clickButtonAction(button, record) {
      let { identifier } = button || {}
      if (identifier === 'reschedule') {
        let { startTime } = record || {}
        this.rescheduleDate = startTime
        this.currentButton = button
        this.currentRecord = record
        this.reschedulePopUpVisibility = true
      } else {
        this.executeButtonAction(button, record)
      }
    },
    async executeButtonAction(button, record) {
      let { error, data } = await this.invokeSystemButton(button, record)
      if (error) {
        let { message = '' } = error || {}
        ftoast.critical(message || this.$t('error_occurred'), {
          menuType: 'alerts',
          timeout: 7000,
        })
      } else {
        if (data?.serviceOrderStatusActions) {
          let { message = '' } = data.serviceOrderStatusActions
          ftoast.success(message, {
            menuType: 'alerts',
            timeout: 5000,
          })
        }
        this.reschedulePopUpVisibility = false
        this.getServiceOrders(true)
      }
    },
    async invokeSystemButton(button, record, params = {}) {
      this.confirmLoading = true
      let { identifier } = button || {}
      let { id } = record || {}
      let { id: servicePMId } = this.details || {}
      let { rescheduleDate, rescheduleSubsequent } = this
      let url = `v3/module/serviceOrder/${id}/systemButton/${identifier}`
      if (identifier === 'reschedule') {
        if (isEmpty(rescheduleDate)) {
          let message = this.$t('service_pm.reschedule_date_validation', {
            ns: 'fsm',
          })
          return { error: { message } }
        }
        params = {
          ...(params || {}),
          preferredStartTime: rescheduleDate,
          servicePMId,
          rescheduleSubsequent,
        }
      }
      let { error, data } = await API.post(url, params)
      this.confirmLoading = false
      return { error, data }
    },
    async getServiceOrdersCount() {
      let { filters } = this
      let params = {
        viewName: 'all',
        moduleName: 'serviceOrder',
        filters: JSON.stringify(filters),
      }
      let url = 'v3/modules/data/count'
      let { data, error } = await API.get(url, params)
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        let { count } = data || {}
        this.count = count
        this.pageCount = Math.floor(count / 50)
      }
    },
    sortPreferredStartTime() {
      let { orderType } = this
      this.orderType = orderType === 'asc' ? 'desc' : 'asc'
      this.getServiceOrders(true)
    },
    async getServiceOrders(force = false) {
      this.isLoading = true
      let { page, perPage, orderType, filters } = this

      let params = {
        filters: JSON.stringify(filters),
        force,
        orderBy: 'preferredStartTime',
        orderType,
        page,
        perPage,
      }
      let { list, error } = await API.fetchAll('serviceOrder', params)
      if (error) {
        let { message } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        await this.loadSystemButtons(list)
        this.serviceOrders = list.map(serviceOrder => {
          let { preferredStartTime, preferredEndTime, status, createdTime } =
            serviceOrder || {}
          return {
            ...serviceOrder,
            startTime: preferredStartTime,
            createdTime: this.getTime(createdTime),
            preferredStartTime: this.getTime(preferredStartTime),
            preferredEndTime: this.getTime(preferredEndTime),
            status: this.getName(status),
          }
        })
        this.isLoading = false
      }
    },
    validateExecutionDate(date) {
      let selectedDate = new Date(date)
      selectedDate.setHours(0, 0, 0, 0)
      let currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0)
      var nextDate = new Date(currentDate)
      nextDate.setDate(currentDate.getDate() + 1)
      return selectedDate.getTime() < nextDate.getTime()
    },
    getName(site) {
      let { primaryValue = '---' } = site || {}
      return primaryValue
    },
    getTime(time) {
      if (!isEmpty(time)) {
        let options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }
        let formattedDate = new Intl.DateTimeFormat('en-US', options).format(
          time
        )
        return formattedDate
      }
      return '---'
    },
  },
}
</script>
