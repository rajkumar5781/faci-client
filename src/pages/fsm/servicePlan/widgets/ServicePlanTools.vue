<template>
  <div class="h-full">
    <FContainer v-if="canShowActionButtons">
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
      v-else-if="isEmpty(servicePlanTools)"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        :title="$t('inventory.plans_tool_title', { ns: 'fsm' })"
        :description="$t('inventory.plans_tool_description', { ns: 'fsm' })"
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
        :data="servicePlanTools"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.action`]="data" v-if="canShowActionButtons">
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
        </template>
      </FTable>
    </FContainer>

    <PlannedToolCreation
      v-if="openToolCreationDialog"
      :canShowServiceTaskTemplate="true"
      :servicePlanId="servicePlanId"
      :hidePrice="true"
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
      :canShowServiceTaskTemplate="true"
      :servicePlanId="servicePlanId"
      :hidePrice="true"
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
import { PlannedToolCreation } from '@facilio/ui/tasks'
import { PlannedToolForm } from '@facilio/ui/tasks'

export default {
  props: ['servicePlanId', 'canShowActionButtons'],
  components: {
    FTable,
    FButton,
    FSpinner,
    PlannedToolCreation,
    PlannedToolForm,
    FText,
    FIcon,
    FContainer,
    FEmptyState,
    FDivider,
    FTooltip,
  },
  data() {
    return {
      saveText: 'Update Tool',
      loading: false,
      isEmpty,
      openToolCreationDialog: false,
      servicePlanTools: [],
      plannedToolData: null,
      showEditForm: false,
      moduleName: 'servicePlanTools',
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
          name: 'serviceTaskTemplate',
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
      ],
    }
  },
  created() {
    this.getServicePlanTools()
  },
  methods: {
    async getServicePlanTools() {
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
          this.servicePlanTools = (list || []).map(plannedTool => {
            let {
              toolType,
              storeRoom,
              quantity,
              serviceTaskTemplate,
              duration,
            } = plannedTool || {}
            return {
              ...plannedTool,
              toolType: this.getName(toolType),
              storeRoom: this.getName(storeRoom),
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
    openToolCreateDialog() {
      this.openToolCreationDialog = true
    },
    async savePlannedTool(plannedTool) {
      let { servicePlanId, moduleName } = this
      let servicePlanTool = {
        data: { ...plannedTool, servicePlan: { id: servicePlanId } },
      }
      let { error } = await API.createRecord(moduleName, servicePlanTool)
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Created Planned Tool successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        this.openToolCreationDialog = false
        await this.getServicePlanTools()
      }
    },
    getName(row) {
      let { name } = row || {}
      return name || '---'
    },
    getValue(row) {
      return row || '---'
    },
    async editPlannedTool(data) {
      let { moduleName } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { servicePlanTools, error } = await API.fetchRecord(moduleName, {
          id,
        })
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          this.plannedToolData = servicePlanTools
          this.showEditForm = true
        }
      }
    },
    async updatePlannedTool(plannedTool) {
      let { plannedToolData, moduleName } = this
      let { id } = plannedToolData || {}
      let { error } = await API.updateRecord(moduleName, {
        id,
        data: plannedTool,
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
        await this.getServicePlanTools()
      }
    },
    async deletePlannedTool(data) {
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
          await this.getServicePlanTools()
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
