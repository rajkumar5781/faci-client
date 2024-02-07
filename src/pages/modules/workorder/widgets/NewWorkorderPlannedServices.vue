<template>
  <LineItemList
    v-bind="$attrs"
    ref="lineItemTable"
    currentModuleName="workorder"
    :config="listConfiguration"
    :moduleName="moduleName"
    :widget="widget"
    :widgetDetails="widgetDetails"
    :additionalParams="additionalParams"
    :moduleDisplayName="moduleDisplayName"
    @onDelete="reloadCost()"
    @onCreateOrUpdate="reloadCost()"
    @handleSelection="selectedRecords"
    viewName="all"
    heading="List of Services"
    selectText="Select Service"
  >
  </LineItemList>
</template>
<script>
import LineItemList from './NewWorkorderPlanList.vue'
import WorkOrderPlans from './WorkOrderPlans.vue'
import { CustomModuleData } from '../../../../data/CustomModuleData'
export default {
  extends: WorkOrderPlans,
  props: ['workOrderId', 'widget', 'disableActionableUIElements'],
  components: {
    LineItemList,
  },
  data() {
    return {
      selectedLineItems: [],
    }
  },
  computed: {
    moduleName() {
      return 'workOrderPlannedServices'
    },
    moduleDisplayName() {
      return this.$t('workorder.Services', 'Services', { ns: 'workorder' })
    },
    listConfiguration() {
      let { formConfig, filters, disableActionableUIElements } = this
      return {
        filters,
        skipModulePermission: {
          editPermission: true,
          deletePermission: true,
        },
        ...(formConfig || {}),
        disableActionableUIElements: disableActionableUIElements,
      }
    },
    formConfig() {
      return {
        formType: 'POP_UP_FORM',
        modifyFieldPropsHook: field => {
          let { name } = field || {}
          if (name === 'service') {
            return { ...field, isDisabled: true }
          }
        },
      }
    },
    widgetDetails() {
      let { widget, emptyStateBtnList } = this
      let { widgetParams } = widget || {}
      let { summaryWidgetName } = widgetParams || {}
      let emptyStateText = this.$t(
        'inventory.workorder.no_services_associated',
        {
          ns: 'inventory',
        }
      )

      return {
        canHideTitle: true,
        perPage: 5,
        summaryWidgetName,
        emptyStateText,
        actionButtonList: emptyStateBtnList,
      }
    },
    emptyStateBtnList() {
      return [
        {
          label: this.$t('common.inventory.select_service'),
          value: {
            lookupModuleName: 'service',
            lookupModuleDisplayName: this.$t(
              'common.inventory._services',
              'Services',
              { ns: 'workorder' }
            ),
            getRecordDetails: async payload => {
              let { id, moduleName } = payload || {}
              let workOrderPlannedService = {
                service: {
                  id: id,
                },
              }

              return new CustomModuleData({
                ...workOrderPlannedService,
                moduleName,
              })
            },
          },
        },
      ]
    },
    additionalParams() {
      let params = {
        parent: { id: this.workOrderId },
        workOrder: {
          id: this.workOrderId,
        },
      }
      return params
    },
  },
}
</script>
