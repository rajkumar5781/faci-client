<template>
  <FContainer height="100%">
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
    <div v-if="loading" class="h-full flex items-center justify-center">
      <FSpinner :size="30" />
    </div>
    <FContainer
      v-else-if="isEmpty(serviceOrderTools)"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        :title="$t('inventory.tools_title', { ns: 'fsm' })"
        :description="$t('inventory.tools_description', { ns: 'fsm' })"
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
        :data="serviceOrderTools"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.action`]="data">
          <FContainer style="display: flex">
            <FIcon
              group="default"
              name="edit"
              size="16"
              @click="editTool(data)"
            />
          </FContainer>
        </template>
      </FTable>
    </FContainer>
    <ToolActualsCreation
      v-if="openToolCreationDialog"
      :formBreadCrumb="formBreadCrumb"
      :confirmLoading="confirmLoading"
      :serviceOrderId="serviceOrderId"
      :canShowServiceTask="true"
      @cancelDialog="
        () => {
          openToolCreationDialog = false
        }
      "
      @onSave="saveTool"
    ></ToolActualsCreation>
    <ToolActualsForm
      v-if="showEditForm"
      :visiblity="showEditForm"
      :toolData="toolData"
      :saveText="saveText"
      :isEdit="true"
      :confirmLoading="confirmLoading"
      :serviceOrderId="serviceOrderId"
      :canShowServiceTask="true"
      @onToolFormSave="updateTool"
      @onToolFormCancel="
        () => {
          showEditForm = false
        }
      "
    ></ToolActualsForm>
  </FContainer>
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
import { ToolActualsForm } from '@facilio/ui/tasks'
import { ToolActualsCreation } from '@facilio/ui/tasks'
import { RelatedListData } from '../../../components/page-builder/widgets/relatedList/RelatedListData'

export default {
  props: ['serviceOrderId', 'serviceAppointmentId', 'parentModule','recordId'],
  components: {
    FIcon,
    FTable,
    FSpinner,
    FButton,
    ToolActualsCreation,
    ToolActualsForm,
    FContainer,
    FEmptyState,
    FDivider,
  },
  data() {
    return {
      toolData: null,
      saveText: 'Update Tool',
      loading: false,
      confirmLoading: false,
      isEmpty,
      openToolCreationDialog: false,
      showEditForm: false,
      serviceOrderTools: [],
      moduleName: 'serviceOrderTools',
      columns: [
        {
          displayName: 'Tool',
          name: 'tool',
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
          displayName: 'Rate/Hr',
          name: 'rate',
          id: 5,
          width: 100,
        },
        {
          displayName: 'Duration',
          name: 'duration',
          id: 6,
          width: 150,
          resize: true,
        },
        {
          displayName: 'Issue Time',
          name: 'issueTime',
          id: 7,
          resize: true,

          width: 160,
        },
        {
          displayName: 'Return Time',
          name: 'returnTime',
          id: 8,
          width: 160,
          resize: true,
        },
        {
          displayName: 'Total Price',
          name: 'totalCost',
          id: 9,
          width: 100,
        },
      ],
    }
  },
  created() {
    this.getServiceOrderTools()
  },
  computed: {
    formBreadCrumb() {
      return {
        path: [
          {
            name: 'Tools',
            page: 'toolsLookup',
          },
        ],
      }
    },
  },
  methods: {
    async getServiceOrderTools(force = true) {
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
          this.serviceOrderTools = (recordList || []).map(toolItem => {
            let {
              tool,
              storeRoom,
              duration,
              issueTime,
              returnTime,
              quantity,
              rate,
              totalCost,
              serviceTask,
              id,
            } = toolItem || {}
            return {
              id,
              tool: this.getToolName(tool),
              storeRoom: this.getName(storeRoom),
              serviceTask: this.getName(serviceTask),
              quantity: this.getValue(quantity),
              duration: this.getDuration(duration),
              issueTime: this.getTime(issueTime),
              returnTime: this.getTime(returnTime),
              rate: this.getValue(rate),
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
    async saveTool(toolActual) {
      this.confirmLoading = true
      let { serviceOrderId, moduleName, parentModule } = this
      let serviceOrderTool = {
        data: { ...toolActual, serviceOrder: { id: serviceOrderId } },
      }
      if (parentModule === 'serviceAppointment') {
        let { serviceAppointmentId } = this
        serviceOrderTool.data['serviceAppointment'] = {
          id: serviceAppointmentId,
        }
      }
      let { error } = await API.post(
        `v3/modules/data/${parentModule}/${moduleName}`,
        serviceOrderTool
      )
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Created Tool Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        this.openToolCreationDialog = false
        await this.getServiceOrderTools()
      }
      this.confirmLoading = false
    },
    async editTool(data) {
      let { moduleName, parentModule } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { serviceOrderTools, error } = await API.get(
          `v3/modules/data/${parentModule}/${moduleName}/${id}`
        )
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          this.toolData = serviceOrderTools
          this.showEditForm = true
        }
      }
    },
    async updateTool(actualTool) {
      this.confirmLoading = true
      let { toolData, moduleName, parentModule } = this
      let { id } = toolData || {}
      let { error } = await API.patch(
        `v3/modules/data/${parentModule}/${moduleName}/${id}`,
        {
          id,
          data: actualTool,
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

        await this.getServiceOrderTools()
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
    getToolName(row) {
      let { toolType } = row || {}
      let { name } = toolType || {}
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
  right: 12px;
}
</style>
