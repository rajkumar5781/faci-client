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
          v-if="!isEmpty(trips)"
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="addTrip()"
        >
          {{ $t('trip.add_trip', { ns: 'fsm' }) }}
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
      v-else-if="isEmpty(trips)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :illustration="'add-item'"
        :title="$t('trip.add_trip', { ns: 'fsm' })"
        :description="$t('trip.no_trip_available', { ns: 'fsm' })"
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
            @click="addTrip()"
          >
            {{ $t('trip.add_trip', { ns: 'fsm' }) }}
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
      <FTable
        :columns="columns"
        :data="trips"
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
        <template #[`cell.people`]="{ row, prop }">
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
        :title="$t('trip.trips', { ns: 'fsm' })"
        :visible="showPopup"
        size="M"
        @ok="saveTrip"
        @cancel="handleCancel"
      >
        <FForm ref="trip-form" :model="formModel" :rules="rules">
          <FContainer
            display="flex"
            justifyContent="center"
            height="350px"
            paddingTop="containerXxLarge"
          >
            <FContainer
              width="60%"
              display="flex"
              flexDirection="column"
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
                  :required="true"
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
                <FContainer width="50%">
                  <FFormItem
                    label="Trip Distance"
                    prop="tripDistance"
                    :hideLabel="false"
                    id="dsm-form-tripDistance"
                    :required="false"
                  >
                    <FInput
                      v-model="formModel.tripDistance"
                      :appearance="'default'"
                      placeholder="Enter Distance"
                      :disabled="false"
                      size="medium"
                      :wrap="true"
                    ></FInput>
                  </FFormItem>
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
  </div>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
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
  FInput,
} from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { DatePicker, Lookup, LookupWizard } from '@facilio/ui/new-forms'
import { RelatedListData } from '../../../../components/page-builder/widgets/relatedList/RelatedListData'
import FetchViews from '../../../../components/views/FetchViews.vue'
export default {
  props: ['details', 'widget', 'fitToViewArea', 'reloadSummary', 'moduleName'],
  mixins: [FetchViews],
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
    FInput,
  },
  data() {
    return {
      isLoading: false,
      pageSize: 10,
      totalPage: 1,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      showPopup: false,
      canShowLookupWizard: false,
      columns: [
        { displayName: 'ID', name: 'id', id: 1, fixed: true },
        { displayName: 'Name', name: 'code', id: 2 },
        {
          displayName: 'Field Agent',
          name: 'people',
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
      trips: [],
      relatedModuleName: 'trip',
      relatedFieldName: 'serviceAppointment',
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
        endTime: [
          {
            required: true,
            message: this.$t('trip.please_select_end_time', { ns: 'fsm' }),
            trigger: 'change',
          },
        ],
      },
    }
  },
  created() {
    this.fitToViewArea()
    this.getTrips()
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
    openLookupWizard() {
      this.canShowLookupWizard = true
    },
    cancelLookupWizard() {
      this.canShowLookupWizard = false
    },
    setLookupFieldValue({ field }) {
      let { selectedItems } = field || {}
      let { value } = selectedItems[0] || {}
      this.$set(this.formModel, 'fieldAgent', value)
    },
    async getTrips(force = true) {
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
          this.trips = recordList
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
    addTrip() {
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
      }
      this.showPopup = true
    },
    handleCancel() {
      this.showPopup = false
    },
    reLoadPage() {
      this.reloadSummary()
      this.getTrips()
    },
    async saveTrip() {
      let isValid = this.$refs['trip-form'].validate()
      if (isValid) {
        let {
          formModel: {
            fieldAgent,
            startTime,
            endTime,
            serviceAppointment,
            tripDistance,
          },
          relatedModuleName,
          moduleName
        } = this
        let data = {
          people: { id: fieldAgent },
          serviceAppointment: { id: serviceAppointment },
          startTime,
          endTime,
        }
        if (!isEmpty(tripDistance)) data.tripDistance = tripDistance
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
          let message = 'Trip Created Successfully!'
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
      this.getServiceTasksList()
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
