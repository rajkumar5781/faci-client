<template>
  <FContainer height="100%">
    <FDropdown
      :buttonProps="{
        appearance: 'secondary',
        size: 'small',
        iconGroup: 'navigation',
        iconName: 'addition',
        iconPosition: 'prefix',
      }"
      :name="$t('inventory.add_item', { ns: 'fsm' })"
      :options="optionsArray"
      :split="true"
      :contentWidth="contentWidth"
      @dropdown="handleDropdown"
      @click="openItemCreateDialog"
      class="new-item"
    >
    </FDropdown>
    <div v-if="loading" class="h-full flex items-center justify-center">
      <FSpinner :size="30" />
    </div>
    <FContainer
      v-else-if="isEmpty(serviceOrderItems)"
      class="h-full flex items-center justify-center"
    >
      <FEmptyState
        :title="$t('inventory.items_title', { ns: 'fsm' })"
        :description="$t('inventory.items_description', { ns: 'fsm' })"
        vertical
        size="S"
        illustration="add-item"
      >
        <template #buttons>
          <FDropdown
            :buttonProps="buttonPropsObj"
            :name="$t('inventory.add_item', { ns: 'fsm' })"
            :options="optionsArray"
            :split="true"
            :contentWidth="contentWidth"
            @dropdown="handleDropdown"
            @click="openItemCreateDialog"
          >
          </FDropdown>
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer height="100%" v-else>
      <FTable
        :columns="columns"
        :data="serviceOrderItems"
        :rounded="false"
        :hideBorder="true"
      >
      </FTable>
    </FContainer>

    <ItemActualsCreation
      v-if="openItemCreationDialog"
      :formBreadCrumb="formBreadCrumb"
      :confirmLoading="confirmLoading"
      :serviceOrderId="serviceOrderId"
      :canShowServiceTask="true"
      @cancelDialog="
        () => {
          openItemCreationDialog = false
        }
      "
      @onSave="saveItem"
    ></ItemActualsCreation>
    <AddReservedItems
      v-if="openReservedItemsDialog"
      :serviceOrderId="serviceOrderId"
      :confirmLoading="confirmLoading"
      :canShowServiceTask="true"
      @cancelDialog="
        () => {
          openReservedItemsDialog = false
        }
      "
      @onSave="saveItem"
    ></AddReservedItems>
  </FContainer>
</template>
<script>
import {
  FTable,
  FSpinner,
  FDropdown,
  ftoast,
  FContainer,
  FEmptyState,
  FDivider,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import { AddReservedItems } from '@facilio/ui/tasks'
import { ItemActualsCreation } from '@facilio/ui/tasks'
import { RelatedListData } from '../../../components/page-builder/widgets/relatedList/RelatedListData'

export default {
  props: ['serviceOrderId', 'serviceAppointmentId', 'parentModule','recordId'],
  components: {
    FTable,
    FSpinner,
    FDropdown,
    ItemActualsCreation,
    AddReservedItems,
    FContainer,
    FEmptyState,
    FDivider,
  },
  data() {
    return {
      loading: false,
      isEmpty,
      openItemCreationDialog: false,
      openPlannedItemsDialog: false,
      openReservedItemsDialog: false,
      openIssuedItemsDialog: false,
      confirmLoading: false,
      serviceOrderItems: [],
      moduleName: 'serviceOrderItems',
      columns: [
        {
          displayName: 'Item',
          name: 'item',
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
    this.getServiceOrderItems()
  },
  computed: {
    formBreadCrumb() {
      return {
        path: [
          {
            name: 'Items',
            page: 'itemsLookup',
          },
        ],
      }
    },
    buttonPropsObj() {
      return {
        appearance: 'secondary',
        size: 'medium',
        iconGroup: 'navigation',
        iconName: 'addition',
        iconPosition: 'prefix',
      }
    },
    contentWidth() {
      // return { control: 'text', defaultValue: '200px' }
      return '150px'
    },
    optionsArray() {
      return [
        // { label: 'Add Planned Item', value: 'addPlannedItem' },
        { label: 'Add Reserved Item', value: 'addReservedItem' },
        // { label: 'Add Issued Item', value: 'addIssuedItem' },
      ]
    },
  },
  methods: {
    handleDropdown(option) {
      let { value } = option || {}
      if (value === 'addPlannedItem') {
        this.openPlannedItemsDialog = true
      } else if (value === 'addReservedItem') {
        this.openReservedItemsDialog = true
      } else if (value === 'addIssuedItem') {
        this.openIssuedItemsDialog = true
      }
    },
    async getServiceOrderItems(force = true) {
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
        this.serviceOrderItems = (recordList || []).map(itemData => {
          let {
            item,
            storeRoom,
            quantity,
            unitPrice,
            totalCost,
            id,
            serviceTask,
          } = itemData || {}
          return {
            id,
            item: this.getItemName(item),
            storeRoom: this.getName(storeRoom),
            serviceTask: this.getName(serviceTask),
            quantity: this.getValue(quantity),
            unitPrice: this.getValue(unitPrice),
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
    openItemCreateDialog() {
      this.openItemCreationDialog = true
    },
    async saveItem(itemActual) {
      this.confirmLoading = true
      let { serviceOrderId, moduleName, parentModule } = this
      let serviceOrderItem = {
        data: { ...itemActual, serviceOrder: { id: serviceOrderId } },
      }
      if (parentModule === 'serviceAppointment') {
        let { serviceAppointmentId } = this
        serviceOrderItem.data['serviceAppointment'] = {
          id: serviceAppointmentId,
        }
      }
      let { error } = await API.post(`v3/modules/data/${parentModule}/${moduleName}`, serviceOrderItem)
      if (error) {
        let { message } = error || this.$t('error_occurred')
        ftoast.critical(message, {
          menuType: 'alerts',
          timeout: 3000,
        })
      } else {
        ftoast.success('Created Work Order Item Successfully', {
          menuType: 'alerts',
          timeout: 3000,
        })

        this.openItemCreationDialog = false
        this.openReservedItemsDialog = false
        await this.getServiceOrderItems()
      }
      this.confirmLoading = false
    },
    getName(row) {
      let { name = '---' } = row || {}
      return name
    },
    getItemName(row) {
      let { itemType } = row || {}
      let { name } = itemType || {}
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
