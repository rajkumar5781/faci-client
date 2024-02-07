<template>
  <FContainer height="100%">
    <FContainer
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <portal :to="`action-${widget.id}-${widget.name}`">
        <FButton
          v-if="canCreateAppointment"
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="addAppointment()"
        >
          {{ $t('service_order.create_appointment', { ns: 'fsm' }) }}
        </FButton>
      </portal>
    </FContainer>
    <FContainer
      v-if="isLoading"
      justifyContent="center"
      height="90%"
      display="flex"
      alignItems="center"
    >
      <FSpinner :size="40" :show="true" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(appointments)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        illustration="end-of-list"
        :title="
          $t('service_appointment.no_appointments_emptystate_title', {
            ns: 'fsm',
          })
        "
        :description="
          $t('service_appointment.no_appointments_emptystate_desc', {
            ns: 'fsm',
          })
        "
        :vertical="true"
        :size="'M'"
      >
      </FEmptyState>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="space-between"
    >
      <FContainer overflow="scroll">
        <FTable
          :columns="columns"
          :data="appointments"
          :showSelectBar="false"
          :rounded="false"
          :hideBorder="true"
        >
          <template #[`cell.code`]="{ row, prop }">
            <FButton appearance="link" @click="redirectToOverview(row.id)">
              <FText appearance="bodyReg14" color="textCaption">
                {{ row[prop] }}
              </FText>
            </FButton>
          </template>
          <template #[`cell.status`]="{ row, prop }">
            <FTags
              v-if="row[prop] !== '---'"
              appearance="status"
              :text="getDisplayName(row[prop])"
              :statusType="statusType(row[prop])"
            />
            <div v-else>{{ row[prop] }}</div>
          </template>
          <template #[`cell.priority`]="{ row, prop }">
            <FTags
              v-if="row[prop] !== '---'"
              :text="getDisplayName(row[prop])"
              :accentColor="accentColor(row[prop])"
              appearance="accent"
            ></FTags>
            <div v-else>{{ row[prop] }}</div>
          </template>
        </FTable>
      </FContainer>
      <FContainer
        display="flex"
        alignItems="center"
        padding="containerLarge"
        backgroundColor="backgroundCanvas"
        marginTop="containerLarge containerXLarge"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-start"
        position="sticky"
        bottom="0"
      >
        <FPagination
          :pageSize="pageSize"
          :total="totalRecords"
          :currentPage="currentPage"
          :disabled="disabled"
          @nextClick="currentChange"
          @prevClick="currentChange"
          @currentChange="currentChange"
        />
      </FContainer>
    </FContainer>
    <FContainer v-if="showPopup">
      <FModal
        :title="$t('service_appointment.service_appointment', { ns: 'fsm' })"
        :visible="showPopup"
        size="M"
        @ok="saveAppointment"
        @cancel="handleCancel"
        :confirmLoading="isButtonLoading"
      >
        <FForm ref="appointment-form" :model="formModel" :rules="rules">
          <FContainer
            display="flex"
            justifyContent="center"
            maxHeight="600px"
            padding="containerXxLarge"
          >
            <FContainer
              display="flex"
              flexDirection="column"
              width="60%"
              gap="containerXxLarge"
              paddingBottom="containerXxLarge"
            >
              <FContainer
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                gap="containerXxLarge"
              >
                <FFormItem
                  label="Name"
                  prop="name"
                  :hideLabel="false"
                  id="dsm-form-name"
                  :required="true"
                >
                  <FInput
                    v-model="formModel.name"
                    placeholder="Enter Name"
                  ></FInput>
                </FFormItem>
              </FContainer>
              <FContainer display="flex" flexDirection="row" justifyContent="space-between" gap="containerXxLarge">
                <FFormItem label="Work Order" prop="serviceOrder" :hideLabel="false" id="dsm-form-serviceOrder"
                  :required="true">
                  <Lookup :field.sync="orderField" v-model="formModel.serviceOrder" :hideLookupIcon="true" :disabled="true" />
                </FFormItem>
                <FFormItem
                  label="Field Agent"
                  prop="fieldAgent"
                  :hideLabel="false"
                  id="dsm-form-fieldAgent"
                  :required="false"
                >
                  <Lookup
                    :field.sync="peopleField"
                    v-model="formModel.fieldAgent"
                    :hideLookupIcon="false"
                    @showLookupWizard="openPeopleLookupWizard"
                  />
                </FFormItem>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                gap="containerXxLarge"
              >
                <FFormItem
                  label="Description"
                  prop="description"
                  :hideLabel="false"
                  id="dsm-form-description"
                  :disabled="true"
                >
                  <FTextArea
                    v-model="formModel.description"
                    placeholder="Enter Description"
                  ></FTextArea>
                </FFormItem>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                gap="containerXxLarge"
              >
                <FFormItem
                  label="Scheduled Start Time"
                  prop="scheduledStartTime"
                  :hideLabel="false"
                  id="dsm-form-scheduledStartTime"
                  :required="true"
                >
                  <DatePicker
                    type="date-time"
                    v-model="formModel.scheduledStartTime"
                    :account="$account"
                  />
                </FFormItem>
                <FFormItem
                  label="Scheduled End Time"
                  prop="scheduledEndTime"
                  :hideLabel="false"
                  id="dsm-form-scheduledEndTime"
                  :required="true"
                >
                  <DatePicker
                    type="date-time"
                    v-model="formModel.scheduledEndTime"
                    :account="$account"
                  />
                </FFormItem>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                gap="containerXxLarge"
              >
                <FFormItem
                  label="Resolution Due Duration"
                  prop="resolutionDueDuration"
                  :hideLabel="false"
                  id="dsm-form-scheduledEndTime"
                >
                  <FDuration v-model="formModel.resolutionDueDuration" />
                </FFormItem>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                gap="containerXxLarge"
                class="dialog-form-table"
              >
                <FContainer
                  display="flex"
                  flexDirection="column"
                  class="w-full"
                  height="fit-content"
                >
                  <ServiceAppointmentTasks
                    :field="tasksField"
                    :serviceOrder="details"
                    @tasks="setTaskValue"
                    :moduleName="moduleName"
                  ></ServiceAppointmentTasks>
                  <FContainer
                    v-if="invalidTaskInput"
                    display="flex"
                    gap="containerMedium"
                    marginTop="containerMedium"
                    alignItems="center"
                  >
                    <FIcon
                      group="alert"
                      name="critical-filled"
                      size="14"
                      color="textSemanticRed"
                      :pressable="false"
                    />
                    <FText appearance="captionReg12" color="textSemanticRed">
                      {{
                        $t('time_sheet.please_associate_tasks', { ns: 'fsm' })
                      }}
                    </FText>
                  </FContainer>
                </FContainer>
              </FContainer>
            </FContainer>
          </FContainer>
        </FForm>
      </FModal>
    </FContainer>
    <LookupWizard
      v-if="canShowPeopleLookupWizard"
      :field.sync="peopleField"
      :canShowLookupWizard.sync="canShowPeopleLookupWizard"
      @closeWizard="cancelPeopleLookupWizard"
      @setLookupFieldValue="setLookupFieldValue"
    ></LookupWizard>
    <LookupWizard
      v-if="canShowOrderLookupWizard"
      :field.sync="orderField"
      :canShowLookupWizard.sync="canShowOrderLookupWizard"
      @closeWizard="cancelOrderLookupWizard"
      @setLookupFieldValue="setLookupFieldValue"
    ></LookupWizard>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FTable,
  FTags,
  ftoast,
  FSpinner,
  FEmptyState,
  FPagination,
  FButton,
  FDuration,
  FTextArea,
  FForm,
  FFormItem,
  FModal,
  FIcon,
  FInput,
} from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import getProperty from 'dlv'
import FetchViewsMixin from '../../../../components/views/FetchViews.vue'
import { DatePicker, Lookup, LookupWizard } from '@facilio/ui/new-forms'
import { ServiceAppointmentTasks } from '@facilio/ui/common'
import { RelatedListData } from '../../../../components/page-builder/widgets/relatedList/RelatedListData'

export default {
  name: 'ServiceOrderAppointmentList',
  props: ['details', 'widget', 'fitToViewArea', 'reloadSummary', 'moduleName'],
  mixins: [FetchViewsMixin],
  components: {
    FText,
    FContainer,
    FTable,
    FSpinner,
    FTags,
    FEmptyState,
    FPagination,
    FButton,
    DatePicker,
    Lookup,
    LookupWizard,
    ServiceAppointmentTasks,
    FDuration,
    FTextArea,
    FForm,
    FFormItem,
    FModal,
    FIcon,
    FInput,
  },
  data() {
    return {
      isLoading: false,
      isButtonLoading:false,
      relatedModuleName: 'serviceAppointment',
      relatedFieldName:'serviceOrder',
      appointments: [],
      columns: [
        {
          displayName: 'Code',
          name: 'code',
          id: 1,
          fixed: true,
          resize: true,
          width: 200,
          clickable: true,
        },
        {
          displayName: 'Name',
          name: 'name',
          id: 2,
        },
        {
          displayName: 'Field Agent',
          name: 'fieldAgent',
          id: 2,
        },
        {
          displayName: 'Priority',
          name: 'priority',
          id: 2,
        },
        {
          displayName: 'Status',
          name: 'status',
          id: 3,
        },
        {
          displayName: 'Space',
          name: 'space',
          id: 4,
        },
        {
          displayName: 'Asset',
          name: 'asset',
          id: 5,
        },
      ],
      pageSize: 10,
      totalPage: 1,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      showPopup: false,
      peopleField: {
        isDataLoading: false,
        options: [],
        name: 'fieldAgent',
        lookupModuleName: 'people',
        field: {
          lookupModule: {
            name: 'people',
            displayName: 'people',
          },
        },
        filters: {
          dispatchable: { operatorId: 15, value: ['true'] },
          oneLevelLookup: {},
        },
        additionalParams: {
          orderBy: 'name',
          orderType: 'asc',
        },
      },
      orderField: {
        isDataLoading: false,
        options: [],
        name: 'serviceOrder',
        lookupModuleName: 'serviceOrder',
        field: {
          lookupModule: {
            name: 'serviceOrder',
            displayName: 'Work Order',
          },
        },
        additionalParams: {
          orderBy: 'name',
          orderType: 'asc',
        },
      },
      tasksField: {
        isDataLoading: false,
        options: [],
        name: 'serviceTasks',
        lookupModuleName: 'serviceTask',
        field: {
          lookupModule: {
            name: 'serviceTask',
            displayName: 'Task',
          },
        },
        additionalParams: {
          orderBy: 'name',
          orderType: 'asc',
        },
      },
      formModel: {
        name: null,
        serviceOrder: null,
        description: null,
        fieldAgent: null,
        category: null,
        scheduledStartTime: null,
        scheduledEndTime: null,
        resolutionDueDuration: null,
        serviceTasks: [],
      },
      canShowOrderLookupWizard: false,
      canShowPeopleLookupWizard: false,
      invalidTaskInput: false,
      rules: {
        name: [
          {
            required: true,
            message: this.$t('service_order.please_enter_name', { ns: 'fsm' }),
            trigger: 'change',
          },
        ],
        serviceOrder: [
          {
            required: true,
            message: this.$t('service_order.please_select_service_order', {
              ns: 'fsm',
            }),
            trigger: 'change',
          },
        ],
        scheduledStartTime: [
          {
            required: true,
            message: this.$t(
              'service_appointment.please_select_scheduled_start',
              { ns: 'fsm' }
            ),
            trigger: 'change',
          },
        ],
        scheduledEndTime: [
          {
            required: true,
            message: this.$t(
              'service_appointment.please_select_scheduled_end',
              { ns: 'fsm' }
            ),
            trigger: 'change',
          },
        ],
      },
    }
  },
  created() {
    this.fitToViewArea()
    this.getServiceAppointmentsList()
  },
  computed: {
    buttonPropsObj() {
      return {
        appearance: 'secondary',
      }
    },
    canCreateAppointment() {
      let { details } = this
      let { status: serviceOrderStatus } = details || {}
      let { status } = serviceOrderStatus || {}
      return !['cancelled', 'completed', 'closed'].includes(status)
    },
  },
  methods: {
    isEmpty,
    getDisplayName(record) {
      let { displayName } = record || {}
      return displayName
    },
    statusType(status) {
      let { statusType } = status || {}
      return statusType
    },
    accentColor(priority) {
      let { color } = priority || {}
      return color
    },
    async getServiceAppointmentsList(force = true) {
      this.isLoading = true
      let {
        details,
        moduleName,
        relatedFieldName,
        relatedModuleName,
        currentPage,
        pageSize,
      } = this
      let { id: recordId } = details || {}

      let params = {
        moduleName: relatedModuleName,
        viewname: 'hidden-all',
        page: currentPage,
        perPage: pageSize,
        force,
        recordId,
        relatedFieldName,
        currentModuleName: moduleName,
      }
      try {
        let recordList = await RelatedListData.fetchAll(params)
        if (isArray(recordList)) {
          this.appointments = this.getAppointmentsArray(recordList)
        }
        this.totalRecords = RelatedListData.recordListCount
      } catch (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title,
          menuType: 'alerts',
          timeout: 5000,
        })
      }
      this.isLoading = false
    },
    getAppointmentsArray(list) {
      if (!isEmpty(list)) {
        let appointments = list.map(appointment => {
          return {
            id: getProperty(appointment, 'id', null),
            code: getProperty(appointment, 'code', '---'),
            name: getProperty(appointment, 'name', '---'),
            fieldAgent: getProperty(appointment, 'fieldAgent.name', '---'),
            priority: getProperty(appointment, 'priority', '---'),
            status: getProperty(appointment, 'status', '---'),
            space: getProperty(appointment, 'space.name', '---'),
            asset: getProperty(appointment, 'asset.name', '---'),
          }
        })
        return appointments
      }
      return []
    },
    refreshData() {
      this.reloadSummary()
      this.getServiceAppointmentsList()
    },
    currentChange(page) {
      this.currentPage = page
      this.getServiceAppointmentsList()
    },
    async redirectToOverview(id) {
      let { relatedModuleName, $route } = this
      let viewname = await this.fetchView(relatedModuleName)
      let { query } = $route
      if (!isEmpty(id) && !isEmpty(viewname)) {
        let { name } = findRouteForModule(relatedModuleName, pageTypes.OVERVIEW) || {}
        let route = { name, params: { viewname, id, moduleName: relatedModuleName }, query }
        this.$router.push(route)
      }
    },
    async addAppointment() {
      let { details } = this
      let {
        id,
        name,
        fieldAgent,
        category,
        preferredStartTime,
        preferredEndTime,
        resolutionDueDuration,
      } = details || {}
      if (!isEmpty(id)) {
        let order = {
          label: name,
          value: id,
        }
        this.$set(this.orderField, 'options', [order])
        this.$set(this.orderField, 'selectedItems', [order])
        this.$set(this.formModel, 'serviceOrder', id)
        if (!isEmpty(fieldAgent?.id)) {
          let agent = {
            label: fieldAgent?.name,
            value: fieldAgent?.id,
          }
          this.$set(this.peopleField, 'options', [agent])
          this.$set(this.peopleField, 'selectedItems', [agent])
          this.$set(this.formModel, 'fieldAgent', fieldAgent.id)
        }
        if (!isEmpty(category)) this.$set(this.formModel, 'category', category)
        if (!isEmpty(preferredStartTime))
          this.$set(this.formModel, 'scheduledStartTime', preferredStartTime)
        if (!isEmpty(preferredEndTime))
          this.$set(this.formModel, 'scheduledEndTime', preferredEndTime)
        if (!isEmpty(resolutionDueDuration))
          this.$set(
            this.formModel,
            'resolutionDueDuration',
            resolutionDueDuration
          )
      }
      this.showPopup = true
    },
    openOrderLookupWizard() {
      this.canShowOrderLookupWizard = true
    },
    cancelOrderLookupWizard() {
      this.canShowOrderLookupWizard = false
    },
    setLookupFieldValue({ field }) {
      let { selectedItems, name } = field || {}
      let { value } = selectedItems[0] || {}
      this.$set(this.formModel, name, value)
    },
    openPeopleLookupWizard() {
      this.canShowPeopleLookupWizard = true
    },
    cancelLookupWizard() {
      this.canShowPeopleLookupWizard = false
    },
    setTaskValue(serviceTasks) {
      this.$set(this.formModel, 'serviceTasks', serviceTasks)
    },
    handleCancel() {
      this.showPopup = false
    },
    async saveAppointment() {
      this.isButtonLoading = true
      let {
        formModel: {
          name,
          serviceOrder,
          description,
          fieldAgent,
          category,
          scheduledStartTime,
          scheduledEndTime,
          resolutionDueDuration,
          serviceTasks,
        },
        relatedModuleName,
        moduleName
      } = this
      let isValid = this.$refs['appointment-form'].validate()
      this.invalidTaskInput = isEmpty(serviceTasks)
      if (this.invalidTaskInput) {
        this.isButtonLoading = false
        return
      }
      if (isValid && !this.invalidTaskInput) {
        let newTasks = (serviceTasks || []).filter(task => isEmpty(task.id))
        let associatedTasks = (serviceTasks || []).filter(
          task => !isEmpty(task.id)
        )
        let taskData = {
          newTasks,
          associatedTasks,
        }
        let data = {
          name,
          serviceOrder: { id: serviceOrder },
          category,
          scheduledStartTime,
          scheduledEndTime,
          resolutionDueDuration,
          description,
          associatedTasks: taskData,
        }
        if(!isEmpty(fieldAgent)) this.$set(data,'fieldAgent',{ id: fieldAgent })
        let { error } = await API.post(`v3/modules/data/${moduleName}/${relatedModuleName}`, {
          data,
        })
        if (error) {
          let { message = '', title = '' } = error
          ftoast.critical(message, {
            title,
            menuType: 'alerts',
            timeout: 5000,
          })
        } else {
          let message = 'Appointment Created Successfully!'
          ftoast.success(message, {
            title: '',
            menuType: 'alerts',
            timeout: 5000,
          })
          this.handleCancel()
          this.refreshData()
        }
      }
      this.isButtonLoading = false
    },
  },
}
</script>
<style lang="scss">
.dialog-form-table {
  .action-table {
    width: auto !important;
  }
}
</style>
