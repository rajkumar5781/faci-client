<template>
  <div class="h-full">
    <FContainer
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <portal :to="`action-${widget.id}-${widget.name}`">
        <FButton
          v-if="!isEmpty(timeSheets)"
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="addTimeSheet()"
        >
          {{ $t('time_sheet.add_time_sheet', { ns: 'fsm' }) }}
        </FButton>
      </portal>
    </FContainer>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FSpinner :size="30"
    /></FContainer>
    <FContainer
      v-else-if="isEmpty(timeSheets)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :illustration="'add-item'"
        :title="$t('time_sheet.add_time_sheet', { ns: 'fsm' })"
        :description="$t('time_sheet.no_time_sheet_available', { ns: 'fsm' })"
        :vertical="true"
        :size="'M'"
      >
        <template #buttons>
          <FButton
            appearance="secondary"
            size="medium"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            @click="addTimeSheet()"
          >
            {{ $t('time_sheet.add_time_sheet', { ns: 'fsm' }) }}
          </FButton>
        </template>
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
          :data="timeSheets"
          :hideBorder="true"
          :rounded="false"
        >
          <template #[`cell.id`]="{ row, prop }"
            ><FText appearance="bodyReg14" color="textCaption">
              #{{ row[prop] }}
            </FText></template
          >
          <template #[`cell.code`]="{ row, prop }">
            <FTooltip placement="bottom" :mouseEnterDelay="1">
              <template slot="title">
                <FText
                  fontsize="body3"
                  fontWeight="medium"
                  color="backgroundCanvas"
                >
                  {{ row[prop] }}
                </FText>
              </template>
              <FButton appearance="link" @click="redirectToOverview(row.id)">
                <FText appearance="bodyReg14" color="textCaption">
                  {{ row[prop] }}
                </FText>
              </FButton>
            </FTooltip>
          </template>
          <template #[`cell.fieldAgent`]="{ row, prop }">
            <FContainer display="flex" flexDirection="row">
              <FContainer paddingRight="containerMedium">
                <FAvatar
                  size="S"
                  :userName="row[prop].name"
                  :avatarUrl="row[prop].avatarUrl"
                  font-size="8px"
                />
              </FContainer>
              <FContainer display="flex" alignSelf="center">
                <FText appearance="bodyReg14" color="textCaption">{{
                  row[prop].name
                }}</FText>
              </FContainer>
            </FContainer>
          </template>
          <template #[`cell.startTime`]="{ row, prop }"
            ><FText appearance="bodyReg14" color="textCaption">{{
              getDateTime(row[prop])
            }}</FText></template
          >
          <template #[`cell.endTime`]="{ row, prop }"
            ><FText appearance="bodyReg14" color="textCaption">{{
              getDateTime(row[prop])
            }}</FText></template
          >
          <template #[`cell.duration`]="{ row, prop }"
            ><FText appearance="bodyReg14" color="textCaption">{{
              getDuration(row[prop])
            }}</FText></template
          >
        </FTable>
      </FContainer>
      <portal :to="`footer-${widget.id}-${widget.name}`">
        <FContainer
          display="flex"
          alignItems="center"
          padding="containerLarge"
          backgroundColor="backgroundCanvas"
          marginTop="containerLarge containerXLarge"
          width="100%"
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
      </portal>
    </FContainer>
    <FContainer v-if="showPopup">
      <FModal
        :title="$t('time_sheet.time_sheet', { ns: 'fsm' })"
        :visible="showPopup"
        size="M"
        @ok="saveTimeSheet"
        @cancel="handleCancel"
      >
        <FForm ref="time-sheet-form" :model="formModel" :rules="rules">
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
            >
              <FContainer
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                gap="containerXxLarge"
              >
                <FFormItem
                  label="Field Agent"
                  prop="fieldAgent"
                  :hideLabel="false"
                  id="dsm-form-fieldAgent"
                  :required="true"
                  :disabled="true"
                >
                  <Lookup
                    :field.sync="peopleField"
                    v-model="formModel.fieldAgent"
                    :hideLookupIcon="false"
                    @showLookupWizard="openLookupWizard"
                  />
                </FFormItem>
                <FFormItem
                  label="ServiceAppointment"
                  prop="serviceAppointment"
                  :hideLabel="false"
                  :hideDropDown="true"
                  id="dsm-form-serviceAppointment"
                  :required="true"
                  :disabled="true"
                >
                  <Lookup
                    :field.sync="appointmentField"
                    v-model="formModel.serviceAppointment"
                    :hideLookupIcon="false"
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
                  label="Start Time"
                  prop="startTime"
                  :hideLabel="false"
                  id="dsm-form-startTime"
                  :required="true"
                >
                  <DatePicker
                    type="date-time"
                    v-model="formModel.startTime"
                    :account="$account"
                  />
                </FFormItem>
                <FFormItem
                  label="End Time"
                  prop="endTime"
                  :hideLabel="false"
                  id="dsm-form-endTime"
                >
                  <DatePicker
                    type="date-time"
                    v-model="formModel.endTime"
                    :account="$account"
                  />
                </FFormItem>
              </FContainer>
              <FContainer
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                gap="containerLarge"
              >
                <FContainer
                  display="flex"
                  flexDirection="column"
                  class="w-full"
                >
                  <FContainer
                    paddingBottom="containerXLarge"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <FText appearance="headingMed16">{{
                      $t('tasks.title', { ns: 'fsm' })
                    }}</FText>
                    <FButton
                      v-if="!isEmpty(formModel.serviceTasks)"
                      appearance="secondary"
                      size="medium"
                      iconGroup="navigation"
                      iconName="addition"
                      iconPosition="prefix"
                      @click="showTaskLookupWizard"
                    >
                      {{ $t('time_sheet.associate_task', { ns: 'fsm' }) }}
                    </FButton>
                  </FContainer>
                  <FContainer
                    paddingTop="containerLarge"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <FSpinner v-if="isTasksLoading" :size="30" />
                    <FContainer
                      display="flex"
                      border="solid 1px"
                      borderColor="borderNeutralBaseSubtler"
                      borderRadius="high"
                      padding="sectionLarge sectionLarge"
                      v-else-if="isEmpty(formModel.serviceTasks)"
                    >
                      <FEmptyState
                        :illustration="'add-item'"
                        :title="
                          $t('service_appointment.no_tasks_emptystate_title', {
                            ns: 'fsm',
                          })
                        "
                        :description="
                          $t('service_appointment.no_tasks_emptystate_desc', {
                            ns: 'fsm',
                          })
                        "
                        :vertical="false"
                        :size="'S'"
                      >
                        <template #buttons>
                          <FContainer
                            gap="containerLarge"
                            display="flex"
                            justifyContent="flex-start"
                            flexDirection="row"
                          >
                            <FButton
                              appearance="secondary"
                              size="small"
                              iconGroup="navigation"
                              iconName="addition"
                              iconPosition="prefix"
                              @click="showTaskLookupWizard"
                            >
                              {{
                                $t('service_appointment.associate_tasks', {
                                  ns: 'fsm',
                                })
                              }}
                            </FButton>
                          </FContainer>
                        </template>
                      </FEmptyState>
                    </FContainer>
                    <FTable
                      v-else-if="!isEmpty(formModel.serviceTasks)"
                      :columns="taskColumns"
                      :data="formModel.serviceTasks"
                    >
                      <template #[`cell.taskCode`]="{ row, prop }">
                        <FText> {{ row[prop] }}</FText></template
                      >
                      <template #[`cell.name`]="{ row, prop }"
                        ><FText> {{ row[prop] }}</FText></template
                      >
                      <template #[`cell.status`]="{ row, prop }">
                        <FTags
                          :text="statusDisplayName(row[prop])"
                          appearance="status"
                          :statusType="statusType(row[prop])"
                      /></template>
                      <template #[`cell.action`]="data">
                        <FIcon
                          group="action"
                          name="circle-minus"
                          size="16"
                          @click="deLink(data)"
                        />
                      </template>
                    </FTable>
                  </FContainer>
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
      v-if="canShowLookupWizard"
      :field.sync="peopleField"
      :canShowLookupWizard.sync="canShowLookupWizard"
      @closeWizard="cancelLookupWizard"
      @setLookupFieldValue="setLookupFieldValue"
    ></LookupWizard>
    <LookupWizard
      v-if="canShowTaskLookupWizard"
      :field.sync="taskField"
      :parentModuleName="moduleName"
      :canShowLookupWizard.sync="canShowTaskLookupWizard"
      @closeWizard="cancelTaskLookupWizard"
      @setLookupFieldValue="setTaskLookupFieldValue"
    ></LookupWizard>
  </div>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { DatePicker, Lookup, LookupWizard } from '@facilio/ui/new-forms'
import { formatDate, getFormattedDuration } from '../../../../utils/formatter'
import {
  FContainer,
  FText,
  FTable,
  FButton,
  FPagination,
  ftoast,
  FSpinner,
  FAvatar,
  FTooltip,
  FEmptyState,
  FModal,
  FForm,
  FFormItem,
  FIcon,
  FTags,
} from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { RelatedListData } from '../../../../components/page-builder/widgets/relatedList/RelatedListData'
import FetchViewsVue from '../../../../components/views/FetchViews.vue'
export default {
  props: ['details', 'widget', 'fitToViewArea', 'reloadSummary', 'moduleName'],
  mixins: [FetchViewsVue],
  components: {
    FText,
    FContainer,
    FTable,
    FButton,
    FPagination,
    FSpinner,
    FAvatar,
    FTooltip,
    FEmptyState,
    FModal,
    FForm,
    FFormItem,
    DatePicker,
    Lookup,
    LookupWizard,
    FIcon,
    FTags,
  },
  data() {
    return {
      invalidTaskInput: false,
      isLoading: false,
      pageSize: 10,
      totalPage: 1,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      showPopup: false,
      relatedFieldName: 'serviceAppointment',
      relatedModuleName: 'timeSheet',
      columns: [
        { displayName: 'ID', name: 'id', id: 1, fixed: true },
        { displayName: 'Name', name: 'code', id: 2 },
        {
          displayName: 'Field Agent',
          name: 'fieldAgent',
          id: 3,
        },
        { displayName: 'Start Time', name: 'startTime', id: 4 },
        {
          displayName: 'End Time',
          name: 'endTime',
          id: 5,
        },
        {
          displayName: 'Duration',
          name: 'duration',
          id: 6,
        },
      ],
      timeSheets: [],
      taskColumns: [
        {
          displayName: 'Code',
          name: 'taskCode',
          id: 1,
          fixed: true,
          width: 75,
        },
        {
          displayName: 'Task Name',
          name: 'name',
          id: 2,
        },
        {
          displayName: 'Status',
          name: 'status',
          id: 3,
        },
      ],
      taskField: {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'serviceTask',
        name:'serviceTasks',
        field: {
          name:'serviceTasks',
          lookupModule: {
            name: 'serviceTask',
            displayName: 'Tasks',
          },
          config:{
            lookupModuleName : 'serviceTask'
          }
        },
        multiple: true,
        filters: {},
      },
      canShowLookupWizard: false,
      canShowTaskLookupWizard: false,
      formModel: {
        startTime: null,
        endTime: null,
        tripDistance: null,
        fieldAgent: null,
        serviceAppointment: null,
      },
      peopleField: {
        isDataLoading: false,
        options: [],
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
      appointmentField: {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'serviceAppointment',
        field: {
          lookupModule: {
            name: 'serviceAppointment',
            displayName: 'Appointment',
          },
        },
        additionalParams: {
          orderBy: 'name',
          orderType: 'asc',
        },
      },
      isTasksLoading: false,
      rules: {
        fieldAgent: [
          {
            required: true,
            message: this.$t('trip.please_select_field_agent', { ns: 'fsm' }),
            trigger: 'change',
          },
        ],
        serviceAppointment: [
          {
            required: true,
            message: this.$t('trip.please_select_service_appointment', {
              ns: 'fsm',
            }),
            trigger: 'change',
          },
        ],
        startTime: [
          {
            required: true,
            message: this.$t('trip.please_select_start_time', { ns: 'fsm' }),
            trigger: 'change',
          },
        ],
      },
    }
  },
  created() {
    this.fitToViewArea()
    this.constructLookupFilters()
    this.getTimeSheetList()
  },
  methods: {
    isEmpty,
    getDateTime(value) {
      if (!isEmpty(value)) return formatDate(value, false)
      return '---'
    },
    getDuration(value) {
      if (!isEmpty(value)) return getFormattedDuration(value, 's')
    },
    constructLookupFilters() {
      let { details } = this
      let { id } = details || {}
      if (!isEmpty(id)) {
        let serviceAppointmentCriteria = {
          operatorId: 36,
          value: [`${id}`],
        }
        this.$set(
          this.taskField.filters,
          'serviceAppointment',
          serviceAppointmentCriteria
        )
      }
    },
    openLookupWizard() {
      this.canShowLookupWizard = true
    },
    cancelLookupWizard() {
      this.canShowLookupWizard = false
    },
    showTaskLookupWizard() {
      this.canShowTaskLookupWizard = true
    },
    cancelTaskLookupWizard() {
      this.canShowTaskLookupWizard = false
    },
    setLookupFieldValue({ field }) {
      let { selectedItems } = field || {}
      let { value } = selectedItems[0] || {}
      this.$set(this.formModel, 'fieldAgent', value)
    },
    async setTaskLookupFieldValue(props) {
      let { taskField: selectedLookupField } = this
      let { field } = props

      if (isEmpty(selectedLookupField)) this.selectedLookupField = field

      let { selectedItems } = field || {}
      let options = []

      if (!isEmpty(selectedItems)) {
        if (!isEmpty(options)) {
          let ids = options.map(item => item.value)
          let newOptions = selectedItems.filter(
            item => !ids.includes(item.value)
          )
          options.unshift(...newOptions)
        } else {
          options = [...selectedItems]
        }
      }

      this.$set(
        this.formModel,
        'serviceTasks',
        await this.fetchTaskList(selectedItems)
      )
    },
    async fetchTaskList(options = [], force = true) {
      this.isTasksLoading = true
      let selectItemIds = options.map(item => item.value)
      let { details, moduleName, relatedFieldName, currentPage, pageSize } =
        this
      let { id: recordId } = details || {}

      let params = {
        moduleName: 'serviceTask',
        viewname: 'hidden-all',
        page: currentPage,
        perPage: pageSize,
        force,
        recordId,
        relatedFieldName,
        currentModuleName: moduleName,
      }
      if (!isEmpty(selectItemIds)) {
        params = {
          ...params,
          filter: JSON.stringify({
            id: { operatorId: 9, value: selectItemIds.map(String) },
          }),
          perPage: selectItemIds.length,
          page: 1,
        }
      }
      try {
        let recordList = await RelatedListData.fetchAll(params)
        if (isArray(recordList)) {
          this.isTasksLoading = false
          return recordList
        }
      } catch (error) {
        let { message, title = '' } = error
        this.isTasksLoading = false
        ftoast.critical(message || this.$t('error_occurred'), {
          title,
          menuType: 'alerts',
          timeout: 5000,
        })
      }
    },
    statusDisplayName(status) {
      let { displayName } = status || {}
      return displayName
    },
    statusType(status) {
      let { statusType } = status || {}
      return statusType
    },
    deLink(data) {
      let { row } = data || {}
      let { key } = row || {}
      let { formModel } = this
      let { serviceTasks = [] } = formModel || {}
      let index = serviceTasks.findIndex(task => task.key === key)
      serviceTasks.splice(index, 1)
      let tasksArr = []
      serviceTasks.forEach((task, index) => {
        task.key = index + 1
        tasksArr.push(task)
      })
      this.$set(this.formModel, 'serviceTasks', tasksArr)
    },
    async getTimeSheetList(force = true) {
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
          this.timeSheets = recordList
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
    async addTimeSheet() {
      let { details } = this
      let { id, name, fieldAgent } = details || {}
      if (!isEmpty(id)) {
        let appointment = {
          label: name,
          value: id,
        }
        this.$set(this.appointmentField, 'options', [appointment])
        this.$set(this.appointmentField, 'selectedItems', [appointment])
        this.$set(this.formModel, 'serviceAppointment', id)
        if (!isEmpty(fieldAgent?.id)) {
          let agent = {
            label: fieldAgent?.name,
            value: fieldAgent?.id,
          }
          this.$set(this.peopleField, 'options', [agent])
          this.$set(this.peopleField, 'selectedItems', [agent])
          this.$set(this.formModel, 'fieldAgent', fieldAgent.id)
        }
        let associatedTasks = await this.fetchTaskList()

        let options = (associatedTasks || []).map(task => {
          return { label: task.name, value: task.id }
        })
        this.$set(this.taskField, 'options', options)
        this.$set(this.taskField, 'selectedItems', options)
        this.$set(this.formModel, 'serviceTasks', associatedTasks)
      }
      this.showPopup = true
    },
    handleCancel() {
      this.showPopup = false
    },
    reLoadPage() {
      this.reloadSummary()
      this.getTimeSheetList()
    },
    async saveTimeSheet() {
      let {
        formModel: {
          fieldAgent,
          startTime,
          endTime,
          serviceAppointment,
          serviceTasks,
        },
        relatedModuleName,
        moduleName
      } = this
      let isValid = this.$refs['time-sheet-form'].validate()
      this.invalidTaskInput = isEmpty(serviceTasks)
      if (this.invalidTaskInput) return
      if (isValid && !this.invalidTaskInput) {
        let data = {
          fieldAgent: { id: fieldAgent },
          serviceAppointment: { id: serviceAppointment },
          startTime,
          serviceTasks,
        }
        if (!isEmpty(endTime)) data.endTime = endTime
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
          let message = 'TimeSheet Created Successfully!'
          ftoast.success(message, {
            title: '',
            menuType: 'alerts',
            timeout: 5000,
          })
          this.handleCancel()
          this.reLoadPage()
        }
      }
    },
    currentChange(page) {
      this.currentPage = page
      this.getTimeSheetList()
    },
    async redirectToOverview(id) {
      let { relatedModuleName, $route } = this
      let viewname = await this.fetchView(relatedModuleName)
      let { query } = $route

      let { name } =
        findRouteForModule(relatedModuleName, pageTypes.OVERVIEW) || {}
      if (name) {
        let route = { name, params: { viewname, id, moduleName: relatedModuleName }, query }
        this.$router.push(route)
      }
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
