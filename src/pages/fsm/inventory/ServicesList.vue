<template>
  <FContainer height="100%">
    <FButton
      appearance="secondary"
      size="small"
      iconGroup="navigation"
      iconName="addition"
      iconPosition="prefix"
      @click="openServiceCreateDialog"
      class="new-item"
    >
      {{ $t('inventory.add_service', { ns: 'fsm' }) }}
    </FButton>
    <div v-if="loading" class="h-full flex items-center justify-center">
      <FSpinner :size="30" />
    </div>
    <FContainer
      v-else-if="isEmpty(serviceOrderServices)"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        :title="$t('inventory.services_title', { ns: 'fsm' })"
        :description="$t('inventory.services_description', { ns: 'fsm' })"
        vertical
        size="S"
        illustration="add-item"
      >
        <template #buttons>
          <FButton
            appearance="secondary"
            size="medium"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            @click="openServiceCreateDialog"
          >
            {{ $t('inventory.add_service', { ns: 'fsm' }) }}
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer height="100%" v-else>
      <FTable
        :columns="columns"
        :data="serviceOrderServices"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.action`]="data">
          <FContainer style="display: flex">
            <FIcon
              group="default"
              name="edit"
              size="16"
              @click="editService(data)"
            />
          </FContainer>
        </template>
      </FTable>
    </FContainer>
    <ServiceActualsCreation
      v-if="openServiceCreationDialog"
      :formBreadCrumb="formBreadCrumb"
      :confirmLoading="confirmLoading"
      :serviceOrderId="serviceOrderId"
      :canShowServiceTask="true"
      @cancelDialog="
        () => {
          openServiceCreationDialog = false
        }
      "
      @onSave="saveService"
    ></ServiceActualsCreation>
    <ServiceActualsForm
      v-if="showEditForm"
      :visiblity="showEditForm"
      :serviceData="serviceData"
      :saveText="saveText"
      :isEdit="true"
      :confirmLoading="confirmLoading"
      :serviceOrderId="serviceOrderId"
      :canShowServiceTask="true"
      @onServiceFormSave="updateService"
      @onServiceFormCancel="
        () => {
          showEditForm = false
        }
      "
    ></ServiceActualsForm>
  </FContainer>
</template>
<script>
import {
  FTable,
  FButton,
  FIcon,
  FSpinner,
  ftoast,
  FEmptyState,
  FContainer,
  FDivider,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { ServiceActualsForm } from '@facilio/ui/tasks'
import { ServiceActualsCreation } from '@facilio/ui/tasks'
import { RelatedListData } from '../../../components/page-builder/widgets/relatedList/RelatedListData'

export default {
  props: ['serviceOrderId', 'serviceAppointmentId', 'parentModule','recordId'],
  components: {
    FIcon,
    FTable,
    FSpinner,
    FButton,
    ServiceActualsCreation,
    ServiceActualsForm,
    FEmptyState,
    FContainer,
    FDivider,
  },
  data() {
    return {
      serviceData: null,
      confirmLoading: false,
      saveText: 'Update Service',
      loading: false,
      isEmpty,
      openServiceCreationDialog: false,
      showEditForm: false,
      serviceOrderServices: [],
      moduleName: 'serviceOrderServices',
      columns: [
        {
          displayName: 'Service',
          name: 'service',
          id: 1,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Quantity',
          name: 'quantity',
          id: 2,
          width: 100,
        },
        {
          displayName: 'Task',
          name: 'serviceTask',
          id: 3,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Unit Price',
          name: 'unitPrice',
          id: 4,
          width: 100,
        },
        {
          displayName: 'Duration',
          name: 'duration',
          id: 5,
          width: 150,
          resize: true,
        },
        {
          displayName: 'Start Time',
          name: 'startTime',
          id: 6,
          resize: true,

          width: 160,
        },
        {
          displayName: 'End Time',
          name: 'endTime',
          id: 7,
          width: 160,
          resize: true,
        },
        {
          displayName: 'Total Price',
          name: 'totalCost',
          id: 8,
          width: 100,
        },
      ],
    }
  },
  created() {
    this.getServiceOrderServices()
  },
  computed: {
    formBreadCrumb() {
      return {
        path: [
          {
            name: 'Services',
            page: 'serviceLookup',
          },
        ],
      }
    },
  },
  methods: {
    async getServiceOrderServices(force = true) {
      this.loading = true
      let {
        recordId,
        moduleName,
        parentModule,
        currentPage,
        pageSize,
      } = this

      let params = {
        moduleName: moduleName,
        viewname: 'hidden-all',
        page: currentPage,
        perPage: pageSize,
        force,
        recordId,
        relatedFieldName: parentModule,
        currentModuleName: parentModule,
      }
      try {
        let recordList = await RelatedListData.fetchAll(params)
        if (isArray(recordList)) {
        this.serviceOrderServices = (recordList || []).map(serviceItem => {
          let {
            service,
            quantity,
            startTime,
            endTime,
            duration,
            unitPrice,
            totalCost,
            serviceTask,
            id,
          } = serviceItem || {}
          return {
            id,
            service: this.getName(service),
            serviceTask: this.getName(serviceTask),
            quantity: this.getValue(quantity),
            unitPrice: this.getValue(unitPrice),
            duration: this.getDuration(duration),
            endTime: this.getTime(endTime),
            startTime: this.getTime(startTime),
            totalCost: this.getValue(totalCost),
          }
        })
        }
      } catch (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title,
          menuType: 'alerts',
          timeout: 5000,
        })
      }
      this.loading = false
    },
    openServiceCreateDialog() {
      this.openServiceCreationDialog = true
    },
    async saveService(serviceActual) {
      this.confirmLoading = true
      let { serviceOrderId, moduleName, parentModule } = this
      let serviceOrderService = {
        data: { ...serviceActual, serviceOrder: { id: serviceOrderId } },
      }
      if (parentModule === 'serviceAppointment') {
        let { serviceAppointmentId } = this
        serviceOrderService.data['serviceAppointment'] = {
          id: serviceAppointmentId,
        }
      }
      let { error } = await API.post(`v3/modules/data/${parentModule}/${moduleName}`, serviceOrderService)
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Created Service Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        this.openServiceCreationDialog = false
        await this.getServiceOrderServices()
      }
      this.confirmLoading = false
    },
    async editService(service) {
      let { moduleName, parentModule } = this
      let { row } = service || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { data, error } = await API.get(`v3/modules/data/${parentModule}/${moduleName}/${id}`)
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          let {serviceOrderServices} = data || {}
          this.serviceData = serviceOrderServices
          this.showEditForm = true
        }
      }
    },
    async updateService(actualService) {
      this.confirmLoading = true
      let { serviceData, moduleName, parentModule } = this
      let { id } = serviceData || {}
      let { error } = await API.patch(`v3/modules/data/${parentModule}/${moduleName}/${id}`, {
        id,
        data: actualService,
        moduleName
      })
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        this.showEditForm = false

        ftoast.success('Updated Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        await this.getServiceOrderServices()
      }
      this.confirmLoading = false
    },
    getTime(time) {
      if (isEmpty(time)) {
        return '---'
      }
      let date = new Date(time)
      return date.toLocaleString('en-US')
    },
    getDuration(totalSeconds) {
      if (isEmpty(totalSeconds)) {
        return '---'
      }
      let day = 86400
      let hour = 3600
      let minute = 60

      let daysout = Math.floor(totalSeconds / day)
      let hoursout = Math.floor((totalSeconds - daysout * day) / hour)
      let minutesout = Math.floor(
        (totalSeconds - daysout * day - hoursout * hour) / minute
      )
      let duration = ''
      if (daysout > 0) {
        duration += `${daysout} days `
      }
      if (hoursout > 0) {
        duration += `${hoursout} hours `
      }
      if (minutesout > 0) {
        duration += `${minutesout} mins`
      }
      return duration
    },
    getName(row) {
      let { name } = row || {}
      return name || '---'
    },
    getValue(row) {
      return row || '---'
    },
  },
}
</script>
<style scoped>
.new-item {
  position: absolute;
  top: 6px;
  right: 6px;
}
</style>
