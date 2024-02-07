<template>
  <div class="h-full">
    <FContainer>
      <FButton
        appearance="secondary"
        size="small"
        iconGroup="navigation"
        iconName="addition"
        iconPosition="prefix"
        @click="openToolCreateDialog"
        class="new-item"
      >
        {{ $t('inventory.add_tool', { ns: 'fsm' }) }}
      </FButton>
    </FContainer>
    <div v-if="loading" class="h-full flex items-center justify-center">
      <FSpinner :size="30" />
    </div>
    <FContainer
      v-else-if="isEmpty(serviceOrderPlannedTools)"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        :title="$t('inventory.planned_tools_title', { ns: 'fsm' })"
        :description="$t('inventory.planned_tools_description', { ns: 'fsm' })"
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
            @click="openToolCreateDialog"
          >
            {{ $t('inventory.add_tool', { ns: 'fsm' }) }}
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer height="100%" v-else>
      <FTable
        :columns="columns"
        :data="serviceOrderPlannedTools"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.action`]="data">
          <FContainer display="flex">
            <FIcon
              group="default"
              name="edit"
              size="16"
              @click="editPlannedTool(data)"
            />
            <FIcon
              group="default"
              name="trash-can"
              size="16"
              @click="deletePlannedTool(data)"
            />
          </FContainer>
        </template>
      </FTable>
    </FContainer>

    <PlannedToolCreation
      v-if="openToolCreationDialog"
      :serviceOrderId="serviceOrderId"
      :serviceAppointmentId="serviceAppointmentId"
      :canShowServiceTask="true"
      @cancelDialog="
        () => {
          openToolCreationDialog = false
        }
      "
      @onSave="savePlannedTool"
    ></PlannedToolCreation>
    <PlannedToolForm
      v-if="showEditForm"
      :visiblity="showEditForm"
      :plannedToolData="plannedToolData"
      :saveText="saveText"
      :serviceOrderId="serviceOrderId"
      :serviceAppointmentId="serviceAppointmentId"
      :canShowServiceTask="true"
      @onToolFormSave="updatePlannedTool"
      @onToolFormCancel="
        () => {
          showEditForm = false
        }
      "
    ></PlannedToolForm>
  </div>
</template>
<script>
import {
  FTable,
  FButton,
  FIcon,
  FSpinner,
  ftoast,
  FContainer,
  FEmptyState,
  FDivider,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { RelatedListData } from '../../../components/page-builder/widgets/relatedList/RelatedListData'
import { PlannedToolCreation } from '@facilio/ui/tasks'
import { PlannedToolForm } from '@facilio/ui/tasks'

export default {
  props: ['serviceOrderId', 'serviceAppointmentId', 'parentModule','recordId'],
  components: {
    FTable,
    FSpinner,
    FButton,
    PlannedToolCreation,
    PlannedToolForm,
    FIcon,
    FContainer,
    FEmptyState,
    FDivider,
  },
  data() {
    return {
      saveText: 'Update Tool',
      loading: false,
      isEmpty,
      openToolCreationDialog: false,
      serviceOrderPlannedTools: [],
      plannedToolData: null,
      showEditForm: false,
      moduleName: 'serviceOrderPlannedTools',
      columns: [
        {
          displayName: 'Tool',
          name: 'toolType',
          id: 1,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Storeroom',
          name: 'storeRoom',
          id: 2,
          fixed: true,
          resize: true,
          width: 200,
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
          displayName: 'Quantity',
          name: 'quantity',
          id: 4,
          width: 100,
        },
        {
          displayName: 'Duration',
          name: 'duration',
          id: 5,
          width: 100,
        },
        {
          displayName: 'Rate/Hr',
          name: 'rate',
          id: 6,
          width: 100,
        },
        {
          displayName: 'Total Price',
          name: 'totalCost',
          id: 7,
          width: 100,
        },
      ],
    }
  },
  created() {
    this.getServiceOrderPlannedTools()
  },
  methods: {
    async getServiceOrderPlannedTools(force = true) {
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
          this.serviceOrderPlannedTools = (recordList || []).map(plannedTool => {
            let {
              toolType,
              storeRoom,
              quantity,
              duration,
              rate,
              totalCost,
              id,
              serviceTask,
            } = plannedTool || {}
            return {
              id,
              toolType: this.getName(toolType),
              storeRoom: this.getName(storeRoom),
              serviceTask: this.getName(serviceTask),
              quantity: this.getValue(quantity),
              rate: this.getValue(rate),
              duration: this.getDuration(duration),
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
    openToolCreateDialog() {
      this.openToolCreationDialog = true
    },
    async savePlannedTool(plannedTool) {
      let { serviceOrderId, moduleName, parentModule } = this
      let serviceOrderPlannedTool = {
        data: { ...plannedTool, serviceOrder: { id: serviceOrderId } },
      }
      if (parentModule === 'serviceAppointment') {
        let { serviceAppointmentId } = this
        serviceOrderPlannedTool.data['serviceAppointment'] = {
          id: serviceAppointmentId,
        }
      }
      let { error } = await API.post(
        `v3/modules/data/${parentModule}/${moduleName}`,
        serviceOrderPlannedTool
      )
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Created Planned Tool Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        this.openToolCreationDialog = false
        await this.getServiceOrderPlannedTools()
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
    async editPlannedTool(tool) {
      let { moduleName,parentModule } = this
      let { row } = tool || {}
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
          let { serviceOrderPlannedTools } = data || {}
          this.plannedToolData = serviceOrderPlannedTools
          this.showEditForm = true
        }
      }
    },
    async updatePlannedTool(plannedTool) {
      let { plannedToolData, moduleName, parentModule } = this
      let { id } = plannedToolData || {}
      let { error } = await API.patch(`v3/modules/data/${parentModule}/${moduleName}/${id}`, {
        id,
        data: plannedTool,
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

        await this.getServiceOrderPlannedTools()
      }
    },
    async deletePlannedTool(data) {
      let { moduleName,parentModule } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { error } = await API.delete(`v3/modules/data/${parentModule}/${moduleName}/${id}`)
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

          await this.getServiceOrderPlannedTools()
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
