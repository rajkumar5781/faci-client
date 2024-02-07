<template>
  <div class="h-full">
    <FContainer v-if="canShowActionButtons">
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
      v-else-if="isEmpty(servicePlanItems)"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        :title="$t('inventory.plan_items_title', { ns: 'fsm' })"
        :description="$t('inventory.plans_item_description', { ns: 'fsm' })"
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
        :data="servicePlanItems"
        :rounded="false"
        :hideBorder="true"
      >
        <template #[`cell.action`]="data" v-if="canShowActionButtons">
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
        </template>
      </FTable>
    </FContainer>

    <PlannedItemCreation
      v-if="openItemCreationDialog"
      :canShowServiceTaskTemplate="true"
      :servicePlanId="servicePlanId"
      :hidePrice="true"
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
      :canShowServiceTaskTemplate="true"
      :servicePlanId="servicePlanId"
      :hidePrice="true"
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
import { isEmpty } from '@facilio/utils/validation'
import { PlannedItemCreation } from '@facilio/ui/tasks'
import { PlannedItemForm } from '@facilio/ui/tasks'

export default {
  props: ['servicePlanId', 'canShowActionButtons'],
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
      isEmpty,
      openItemCreationDialog: false,
      servicePlanItems: [],
      plannedItemData: null,
      showEditForm: false,
      moduleName: 'servicePlanItems',
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
          name: 'serviceTaskTemplate',
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
      ],
    }
  },
  created() {
    this.getServicePlanItems()
  },
  methods: {
    async getServicePlanItems() {
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
          this.servicePlanItems = (list || []).map(plannedItem => {
            let { itemType, storeRoom, quantity, serviceTaskTemplate } =
              plannedItem || {}
            return {
              ...plannedItem,
              itemType: this.getName(itemType),
              storeRoom: this.getName(storeRoom),
              serviceTaskTemplate: this.getName(serviceTaskTemplate),
              quantity: this.getValue(quantity),
            }
          })
        }
      }
      this.loading = false
    },
    openItemCreateDialog() {
      this.openItemCreationDialog = true
    },
    async savePlannedItem(plannedItem) {
      let { servicePlanId, moduleName } = this
      let servicePlanItem = {
        data: { ...plannedItem, servicePlan: { id: servicePlanId } },
      }
      let { error } = await API.createRecord(moduleName, servicePlanItem)
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
        await this.getServicePlanItems()
      }
    },
    getName(row) {
      let { name } = row || {}
      return name || '---'
    },
    getValue(row) {
      return row || '---'
    },
    async editPlannedItem(data) {
      let { moduleName } = this
      let { row } = data || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let { servicePlanItems, error } = await API.fetchRecord(moduleName, {
          id,
        })
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          this.plannedItemData = servicePlanItems
          this.showEditForm = true
        }
      }
    },
    async updatePlannedItem(plannedItem) {
      let { plannedItemData, moduleName } = this
      let { id } = plannedItemData || {}
      let { error } = await API.updateRecord(moduleName, {
        id,
        data: plannedItem,
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
        await this.getServicePlanItems()
      }
    },
    async deletePlannedItem(data) {
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
          await this.getServicePlanItems()
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
