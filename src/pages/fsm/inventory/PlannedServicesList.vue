<template>
  <div class="h-full">
    <FContainer>
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
    </FContainer>
    <div v-if="loading" class="h-full flex items-center justify-center">
      <FSpinner :size="30" />
    </div>
    <FContainer
      v-else-if="isEmpty(serviceOrderPlannedServices)"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        :title="$t('inventory.planned_services_title', { ns: 'fsm' })"
        :description="
          $t('inventory.planned_services_description', { ns: 'fsm' })
        "
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
        :data="serviceOrderPlannedServices"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.action`]="data">
          <div style="display: flex">
            <FIcon
              group="default"
              name="edit"
              size="16"
              @click="editPlannedService(data)"
            />
            <FIcon
              group="default"
              name="trash-can"
              size="16"
              @click="deletePlannedService(data)"
            />
          </div>
        </template>
      </FTable>
    </FContainer>

    <PlannedServiceCreation
      v-if="openServiceCreationDialog"
      :serviceOrderId="serviceOrderId"
      :serviceAppointmentId="serviceAppointmentId"
      :canShowServiceTask="true"
      @cancelDialog="
        () => {
          openServiceCreationDialog = false
        }
      "
      @onSave="savePlannedService"
    ></PlannedServiceCreation>
    <PlannedServicesForm
      v-if="showEditForm"
      :visiblity="showEditForm"
      :plannedServiceData="plannedServiceData"
      :saveText="saveText"
      :serviceOrderId="serviceOrderId"
      :serviceAppointmentId="serviceAppointmentId"
      :canShowServiceTask="true"
      @onServiceFormSave="updatePlannedService"
      @onServiceFormCancel="
        () => {
          showEditForm = false
        }
      "
    ></PlannedServicesForm>
  </div>
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
import { PlannedServiceCreation } from '@facilio/ui/tasks'
import { PlannedServicesForm } from '@facilio/ui/tasks'
import { RelatedListData } from '../../../components/page-builder/widgets/relatedList/RelatedListData'

export default {
  props: ['serviceOrderId', 'serviceAppointmentId', 'parentModule', 'recordId'],
  components: {
    FTable,
    FSpinner,
    FButton,
    PlannedServiceCreation,
    PlannedServicesForm,
    FIcon,
    FEmptyState,
    FContainer,
    FDivider,
  },
  data() {
    return {
      saveText: 'Update Service',
      loading: false,
      isEmpty,
      openServiceCreationDialog: false,
      serviceOrderPlannedServices: [],
      plannedServiceData: null,
      showEditForm: false,
      moduleName: 'serviceOrderPlannedServices',
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
          displayName: 'Task',
          name: 'serviceTask',
          id: 2,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Quantity',
          name: 'quantity',
          id: 3,
          width: 100,
        },
        {
          displayName: 'Duration',
          name: 'duration',
          id: 4,
          width: 100,
        },
        {
          displayName: 'Unit Price',
          name: 'unitPrice',
          id: 5,
          width: 100,
        },
        {
          displayName: 'Total Price',
          name: 'totalCost',
          id: 6,
          width: 100,
        },
      ],
    }
  },
  created() {
    this.getServiceOrderPlannedServices()
  },
  methods: {
    async getServiceOrderPlannedServices(force = true) {
      this.loading = true
      let { recordId, moduleName, parentModule, currentPage, pageSize } = this

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
          this.serviceOrderPlannedServices = (recordList || []).map(
            plannedService => {
              let {
                serviceTask,
                service,
                quantity,
                duration,
                unitPrice,
                totalCost,
                id,
              } = plannedService || {}
              return {
                id,
                service: this.getName(service),
                quantity: this.getValue(quantity),
                serviceTask: this.getName(serviceTask),
                unitPrice: this.getValue(unitPrice),
                duration: this.getDuration(duration),
                totalCost: this.getValue(totalCost),
              }
            }
          )
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
    async savePlannedService(plannedService) {
      let { serviceOrderId, moduleName, parentModule } = this
      let serviceOrderPlannedService = {
        data: { ...plannedService, serviceOrder: { id: serviceOrderId } },
      }
      if (parentModule === 'serviceAppointment') {
        let { serviceAppointmentId } = this
        serviceOrderPlannedService.data['serviceAppointment'] = {
          id: serviceAppointmentId,
        }
      }
      let { error } = await API.post(
        `v3/modules/data/${parentModule}/${moduleName}`,
        serviceOrderPlannedService
      )
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Created Planned Service Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        this.openServiceCreationDialog = false
        await this.getServiceOrderPlannedServices()
      }
    },
    getName(row) {
      let { name } = row || {}
      return name || '---'
    },
    getValue(row) {
      return row || '---'
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
    async editPlannedService(service) {
      let { moduleName, parentModule } = this
      let { row } = service || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { data, error } = await API.get(
          `v3/modules/data/${parentModule}/${moduleName}/${id}`
        )
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          let { serviceOrderPlannedServices } = data || {}
          this.plannedServiceData = serviceOrderPlannedServices
          this.showEditForm = true
        }
      }
    },
    async updatePlannedService(plannedService) {
      let { plannedServiceData, moduleName, parentModule } = this
      let { id } = plannedServiceData || {}
      let { error } = await API.patch(
        `v3/modules/data/${parentModule}/${moduleName}/${id}`,
        {
          id,
          data: plannedService,
          moduleName,
        }
      )
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

        await this.getServiceOrderPlannedServices()
      }
    },
    async deletePlannedService(data) {
      let { moduleName, parentModule } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { error } = await API.delete(
          `v3/modules/data/${parentModule}/${moduleName}/${id}`
        )
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          ftoast.success('Deleted Successfully', {
            menuType: 'alerts',
            timeout: 3000,
          })

          await this.getServiceOrderPlannedServices()
        }
      }
    },
  },
}
</script>
<style scoped>
.new-item {
  position: absolute;
  top: 6px;
  right: 12px;
}
</style>
