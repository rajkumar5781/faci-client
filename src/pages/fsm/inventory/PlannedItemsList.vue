<template>
  <div class="h-full">
    <FContainer>
      <FButton
        appearance="secondary"
        size="small"
        iconGroup="navigation"
        iconName="addition"
        iconPosition="prefix"
        @click="openItemCreateDialog"
        class="new-item"
      >
        {{ $t('inventory.add_item', { ns: 'fsm' }) }}
      </FButton>
    </FContainer>
    <div v-if="loading" class="h-full flex items-center justify-center">
      <FSpinner :size="30" />
    </div>
    <FContainer
      v-else-if="isEmpty(serviceOrderPlannedItems)"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        :title="$t('inventory.planned_items_title', { ns: 'fsm' })"
        :description="$t('inventory.planned_items_description', { ns: 'fsm' })"
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
            @click="openItemCreateDialog"
          >
            {{ $t('inventory.add_item', { ns: 'fsm' }) }}
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer height="100%" v-else>
      <FTable
        :columns="columns"
        :data="serviceOrderPlannedItems"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.itemType`]="{ row, prop }">
          <FContainer display="flex" gap="containerMedium">
            <FTooltip placement="top" v-if="isReserved(row)">
              <template slot="title">
                {{ $t('inventory.reserved', { ns: 'fsm' }) }}
              </template>
              <fc-icon
                group="action"
                name="tick-circle-filled"
                color="#73D06A"
                size="16"
              ></fc-icon>
            </FTooltip>
            <FText>{{ row[prop] }}</FText>
          </FContainer>
        </template>
        <template #[`cell.action`]="data">
          <div style="display: flex" v-if="!isReserved(data.row)">
            <FButton
              :loading="reserving"
              appearance="secondary"
              size="small"
              @click="reserveItem(data)"
            >
              {{ $t('inventory.reserve', { ns: 'fsm' }) }}
            </FButton>
            <!-- <FText v-else color="backgroundSemanticGreenDark">
              <FIcon
                group="action"
                name="circle-tick"
                size="16"
                :pressable="false"
                color="backgroundSemanticGreenDark"
                class="pR4"
              ></FIcon>
              {{ $t('inventory.reserved', { ns: 'fsm' }) }}
            </FText> -->
            <FIcon
              group="default"
              name="edit"
              size="16"
              @click="editPlannedItem(data)"
            />
            <FIcon
              group="default"
              name="trash-can"
              size="16"
              @click="deletePlannedItem(data)"
            />
          </div>
        </template>
      </FTable>
    </FContainer>

    <PlannedItemCreation
      v-if="openItemCreationDialog"
      :serviceOrderId="serviceOrderId"
      :serviceAppointmentId="serviceAppointmentId"
      :canShowServiceTask="true"
      @cancelDialog="
        () => {
          openItemCreationDialog = false
        }
      "
      @onSave="savePlannedItem"
    ></PlannedItemCreation>
    <PlannedItemForm
      v-if="showEditForm"
      :visiblity="showEditForm"
      :plannedItemData="plannedItemData"
      :saveText="saveText"
      :serviceOrderId="serviceOrderId"
      :serviceAppointMentId="serviceAppointmentId"
      :canShowServiceTask="true"
      @onItemFormSave="updatePlannedItem"
      @onItemFormCancel="
        () => {
          showEditForm = false
        }
      "
    ></PlannedItemForm>
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
import { isEmpty, isArray } from '@facilio/utils/validation'
import { PlannedItemCreation } from '@facilio/ui/tasks'
import { PlannedItemForm } from '@facilio/ui/tasks'
import { RelatedListData } from '../../../components/page-builder/widgets/relatedList/RelatedListData'

export default {
  props: ['serviceOrderId', 'serviceAppointmentId', 'parentModule', 'recordId'],
  components: {
    FTable,
    FButton,
    FSpinner,
    PlannedItemCreation,
    PlannedItemForm,
    FText,
    FIcon,
    FContainer,
    FEmptyState,
    FDivider,
    FTooltip,
  },
  data() {
    return {
      saveText: 'Update Item',
      loading: false,
      reserving: false,
      isEmpty,
      openItemCreationDialog: false,
      serviceOrderPlannedItems: [],
      plannedItemData: null,
      showEditForm: false,
      moduleName: 'serviceOrderPlannedItems',
      columns: [
        {
          displayName: 'Item',
          name: 'itemType',
          id: 1,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Storeroom',
          name: 'storeRoom',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Task',
          name: 'serviceTask',
          id: 3,
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
    this.getServiceOrderPlannedItems()
  },
  methods: {
    async getServiceOrderPlannedItems(force = true) {
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
          this.serviceOrderPlannedItems = (recordList || []).map(
            plannedItem => {
              let {
                itemType,
                storeRoom,
                quantity,
                unitPrice,
                totalCost,
                isReserved,
                id,
                serviceTask,
              } = plannedItem || {}
              return {
                id,
                itemType: this.getName(itemType),
                storeRoom: this.getName(storeRoom),
                serviceTask: this.getName(serviceTask),
                quantity: this.getValue(quantity),
                unitPrice: this.getValue(unitPrice),
                totalCost: this.getValue(totalCost),
                isReserved,
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
    openItemCreateDialog() {
      this.openItemCreationDialog = true
    },
    async savePlannedItem(plannedItem) {
      let { serviceOrderId, moduleName, parentModule } = this
      let serviceOrderPlannedItem = {
        data: { ...plannedItem, serviceOrder: { id: serviceOrderId } },
      }
      if (parentModule === 'serviceAppointment') {
        let { serviceAppointmentId } = this
        serviceOrderPlannedItem.data['serviceAppointment'] = {
          id: serviceAppointmentId,
        }
      }
      let { error } = await API.post(
        `v3/modules/data/${parentModule}/${moduleName}`,
        serviceOrderPlannedItem
      )
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Created Planned Item successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        this.openItemCreationDialog = false
        await this.getServiceOrderPlannedItems()
      }
    },
    getName(row) {
      let { name } = row || {}
      return name || '---'
    },
    getValue(row) {
      return row || '---'
    },
    isReserved(row) {
      let { isReserved } = row || {}
      return isReserved
    },
    async reserveItem(data) {
      this.reserving = true
      let { moduleName, parentModule } = this
      let { row } = data || {}
      let { id } = row || {}
      let { error } = await API.patch(
        `v3/modules/data/${parentModule}/${moduleName}/${id}`,
        {
          id,
          params: {
            reserve: true,
          },
          moduleName,
        }
      )
      if (error) {
        let { message, title } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          title,
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Reserved Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })
        await this.getServiceOrderPlannedItems()
      }
      this.reserving = false
    },
    async editPlannedItem(item) {
      let { moduleName, parentModule } = this
      let { row } = item || {}
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
          let { serviceOrderPlannedItems } = data || {}
          this.plannedItemData = serviceOrderPlannedItems
          this.showEditForm = true
        }
      }
    },
    async updatePlannedItem(plannedItem) {
      let { plannedItemData, moduleName, parentModule } = this
      let { id } = plannedItemData || {}
      let { error } = await API.patch(
        `v3/modules/data/${parentModule}/${moduleName}/${id}`,
        {
          id,
          data: plannedItem,
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
        await this.getServiceOrderPlannedItems()
      }
    },
    async deletePlannedItem(data) {
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
          await this.getServiceOrderPlannedItems()
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
