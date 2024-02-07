<template>
  <div class="h-full">
    <FContainer v-if="canShowActionButtons">
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
      v-else-if="isEmpty(servicePlanServices)"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        :title="$t('inventory.plans_service_title', { ns: 'fsm' })"
        :description="$t('inventory.plans_services_description', { ns: 'fsm' })"
        :vertical="false"
        size="S"
        :illustration="canShowActionButtons ? 'add-item' : 'end-of-list'"
      >
        <template #buttons v-if="canShowActionButtons">
          <FButton
            appearance="secondary"
            size="small"
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
        :data="servicePlanServices"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.action`]="data" v-if="canShowActionButtons">
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
        </template>
      </FTable>
    </FContainer>

    <PlannedServiceCreation
      v-if="openServiceCreationDialog"
      :canShowServiceTaskTemplate="true"
      :servicePlanId="servicePlanId"
      :hidePrice="true"
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
      :canShowServiceTaskTemplate="true"
      :servicePlanId="servicePlanId"
      :hidePrice="true"
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
  FText,
  FIcon,
  FSpinner,
  ftoast,
  FContainer,
  FEmptyState,
  FDivider,
  FTooltip,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { PlannedServiceCreation } from '@facilio/ui/tasks'
import { PlannedServicesForm } from '@facilio/ui/tasks'

export default {
  props: ['servicePlanId', 'canShowActionButtons'],
  components: {
    FTable,
    FButton,
    FSpinner,
    PlannedServiceCreation,
    PlannedServicesForm,
    FText,
    FIcon,
    FContainer,
    FEmptyState,
    FDivider,
    FTooltip,
  },
  data() {
    return {
      saveText: 'Update Service',
      loading: false,
      isEmpty,
      openServiceCreationDialog: false,
      servicePlanServices: [],
      plannedServiceData: null,
      showEditForm: false,
      moduleName: 'servicePlanServices',
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
          name: 'serviceTaskTemplate',
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
      ],
    }
  },
  created() {
    this.getServicePlanServices()
  },
  methods: {
    async getServicePlanServices() {
      this.loading = true
      let { servicePlanId, moduleName } = this
      if (!isEmpty(servicePlanId)) {
        let filters = {
          servicePlan: {
            operatorId: 36,
            value: [servicePlanId + ''],
          },
        }
        let params = {
          filters: JSON.stringify(filters),
        }
        let { list, error } = await API.fetchAll(moduleName, params, {
          force: true,
        })
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          this.servicePlanServices = (list || []).map(plannedService => {
            let { service, quantity, serviceTaskTemplate, duration } =
              plannedService || {}
            return {
              ...plannedService,
              service: this.getName(service),
              serviceTaskTemplate: this.getName(serviceTaskTemplate),
              quantity: this.getValue(quantity),
              duration: this.getDuration(duration),
            }
          })
        }
      }
      this.loading = false
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
    openServiceCreateDialog() {
      this.openServiceCreationDialog = true
    },
    async savePlannedService(plannedService) {
      let { servicePlanId, moduleName } = this
      let servicePlanService = {
        data: { ...plannedService, servicePlan: { id: servicePlanId } },
      }
      let { error } = await API.createRecord(moduleName, servicePlanService)
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Created Planned Service successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        this.openServiceCreationDialog = false
        await this.getServicePlanServices()
      }
    },
    getName(row) {
      let { name } = row || {}
      return name || '---'
    },
    getValue(row) {
      return row || '---'
    },
    async editPlannedService(data) {
      let { moduleName } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { servicePlanServices, error } = await API.fetchRecord(moduleName, {
          id,
        })
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          this.plannedServiceData = servicePlanServices
          this.showEditForm = true
        }
      }
    },
    async updatePlannedService(plannedService) {
      let { plannedServiceData, moduleName } = this
      let { id } = plannedServiceData || {}
      let { error } = await API.updateRecord(moduleName, {
        id,
        data: plannedService,
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
        await this.getServicePlanServices()
      }
    },
    async deletePlannedService(data) {
      let { moduleName } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { error } = await API.deleteRecord(moduleName, id)
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
          await this.getServicePlanServices()
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
