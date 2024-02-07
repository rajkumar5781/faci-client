<template>
  <LineItemList
    v-bind="$attrs"
    ref="lineItemTable"
    currentModuleName="workorder"
    :config="listConfiguration"
    :moduleName="moduleName"
    :widgetDetails="widgetDetails"
    :widget="widget"
    :moduleDisplayName="moduleDisplayName"
    :additionalParams="additionalParams"
    viewName="all"
    @onDelete="reloadCost()"
    @onCreateOrUpdate="reloadCost()"
    heading="List of Labors"
    selectText="Select Craft"
  ></LineItemList>
</template>
<script>
import LineItemList from './NewWorkorderPlanList.vue'
import WorkOrderPlans from './WorkOrderPlans.vue'
import { CustomModuleData } from '../../../../data/CustomModuleData'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  extends: WorkOrderPlans,
  props: [
    'workOrderId',
    'widget',
    'disableActionableUIElements',
    'calculateDimensions',
    'layoutParams',
  ],
  components: {
    LineItemList,
  },
  data() {
    return {
      details: null,
      selectedLookupId: null,
    }
  },
  computed: {
    moduleName() {
      return 'workorderLabourPlan'
    },
    moduleDisplayName() {
      return this.$t('workorder.Labours', 'Labours', { ns: 'workorder' })
    },

    filters() {
      let filterObj = {
        parent: {
          operatorId: 9,
          value: [`${this.workOrderId}`],
        },
      }
      return filterObj
    },
    formConfig() {
      return {
        formType: 'POP_UP_FORM',
        modifyFieldPropsHook: field => {
          let { name } = field || {}
          if (['craft', 'totalPrice'].includes(name)) {
            return { ...field, isDisabled: true }
          }
        },
      }
    },

    listConfiguration() {
      let { filters, detailsLayout, formConfig, disableActionableUIElements } =
        this

      return {
        canHideHeader: false,
        canHideEdit: false,
        canHideDelete: false,
        canHideFooter: false,
        canHideFilter: false,
        canHideSummaryWidget: false,
        isSelectionEnabled: true,
        accordion: true, //expand one at a time
        detailsLayout, //details construction for quick summary
        labelPosition: 'vertical', // vertical or horizontal
        columns: 2, //colunms split in quick summary; max cols allowed is 4
        canShowActions: true,
        canShowEdit: true,
        canShowDelete: true,
        canHideColumnConfig: true,
        ...(formConfig || {}),
        filters,
        searchType: 'ADAVANCE_SEARCH',

        formTitle: {
          defaultForm: 'Labor',
          addForm: 'Labor Details',
          editForm: 'Labor Details',
        },
        disableActionableUIElements: disableActionableUIElements,
      }
    },
    widgetDetails() {
      let { widget } = this
      let { widgetParams } = widget || {}
      let { summaryWidgetName } = widgetParams || {}
      let emptyStateText = this.$t('inventory.workorder.no_labors_associated', {
        ns: 'inventory',
      })

      return {
        title: 'List of Labors',
        canHideTitle: true,
        perPage: 5,
        summaryWidgetName,
        emptyStateText,
        actionButtonList: [
          {
            label: 'Add Craft',
            value: {
              lookupModuleName: 'crafts',
              lookupModuleDisplayName: 'Craft',
              getRecordDetails: async payload => {
                let { id, moduleName, lookupModuleName } = payload || {}
                let params = {
                  recordId: id,
                  moduleName: lookupModuleName,
                }
                let { data, error } = await API.get(
                  `/v3/workOrderLabour/plans/${lookupModuleName}`,
                  params
                )
                if (error) {
                  ftoast.critical(error.message || this.$t('error_occured'))
                } else {
                  let { workorderLabourPlan } = data || {}

                  return new CustomModuleData({
                    ...(workorderLabourPlan || {}),
                    moduleName,
                  })
                }
              },
            },
          },
        ],
      }
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
