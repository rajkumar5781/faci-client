<script lang="jsx">
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { FButton, ftoast, fDialog } from '@facilio/design-system'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import ModuleSummary from '../../summary/ModuleSummary.vue'

export default {
  name: 'PlannedMaintenanceSummary',
  props: ['viewname'],
  extends: ModuleSummary,
  components: { FButton },
  data() {
    return {
      publishPmButtonLoading: false,
      unpublishPmButtonLoading: false,
      isEditDialogOpen: false,
    }
  },
  computed: {
    /**
     * Constants that're mostly used
     */
    currentModuleName() {
      return 'plannedmaintenance'
    },
    moduleDisplayName() {
      let { moduleMeta } = this
      let { displayName } = moduleMeta || {}
      return displayName
    },
    pmId() {
      let { record } = this
      let { id } = record || {}
      return id
    },

    // notificationDetails is used for showing UnPublished state of the PM
    notificationDetails() {
      return {
        description: this.$t(
          'pm.you_need_to_publish_this_record_to_generate_workorders',
          { ns: 'maintenance' }
        ),
        hideCloseIcon: true,
      }
    },
    // isApprovalEnabled is used for showing UnPublished state of the PM
    isApprovalEnabled() {
      let { record } = this
      return record?.pmStatusEnum === 'IN_ACTIVE'
    },

    tagProps() {
      let { record = {} } = this || {}
      let tag = {}
      if (record.pmStatusEnum) {
        tag = {
          text: '---',
          statusType: 'information',
          variant: 'simple',
          appearance: 'status',
        }
        if (record.pmStatusEnum === 'ACTIVE') {
          tag = {
            ...tag,
            text: this.$t('pm.published', { ns: 'maintenance' }),
            statusType: 'success',
          }
        } else if (record.pmStatusEnum === 'IN_ACTIVE') {
          tag = {
            ...tag,
            text: this.$t('pm.un_published', { ns: 'maintenance' }),
            statusType: 'danger',
          }
        }
      }
      return tag
    },

    moreButtonList() {
      return [
        {
          name: this.$t('pm.edit', { ns: 'maintenance' }),
          identifier: 'edit',
          clickAction: this.editPm,
          disabled: this.disableEditPm,
        },
        {
          name: this.$t('pm.unpublish', { ns: 'maintenance' }),
          identifier: 'unpublishPM',
          clickAction: this.unpublishPM,
          disabled: this.disableUnpublishPM,
        },
        {
          name: this.$t('pm.viewWorkOrders', { ns: 'maintenance' }),
          identifier: 'viewWorkOrders',
          clickAction: this.viewWorkOrders,
        },
      ]
    },

    systemBtnList() {
      return [
        {
          name: this.$t('pm.publish', { ns: 'maintenance' }),
          identifier: 'publishPM',
          clickAction: this.publishPM,
          disabled: this.disablePublishPM,
          loading: this.publishPmButtonLoading,
        },
      ]
    },

    /**
     * Declarations for disabled property of the buttons
     */
    disableEditPm() {
      let { publishPmButtonLoading } = this
      return publishPmButtonLoading
    },
    disableUnpublishPM() {
      let { unpublishPmButtonLoading } = this
      return unpublishPmButtonLoading
    },
    disablePublishPM() {
      let { isEditDialogOpen } = this
      return isEditDialogOpen
    },
  },
  methods: {
    /**
     * Actionable methods
     */

    /* This function navigates to Edit PM Page. */
    async editPm() {
      let { record } = this
      let { pmStatusEnum } = record || {}
      if (pmStatusEnum == 'IN_ACTIVE') {
        this.editRecord()
        return
      } else {
        this.isEditDialogOpen = true

        let confirmOpenEdit = await fDialog.warning({
          title: this.$t(
            'pm.edit_planned_maintenance_description_highlighted',
            {
              ns: 'maintenance',
            }
          ),
          description: this.$t('pm.edit_planned_maintenance_description', {
            ns: 'maintenance',
          }),
          saveText: this.$t('pm.edit', { ns: 'maintenance' }),
          cancelText: this.$t('pm.cancel', { ns: 'maintenance' }),
        })
        if (confirmOpenEdit) {
          this.editRecord()
        }
      }

      this.isEditDialogOpen = false
    },

    /* This function publishes the PM */
    async publishPM() {
      this.publishPmButtonLoading = true

      let { isEditDialogOpen } = this
      if (isEditDialogOpen) {
        this.publishPmButtonLoading = false
        return
      }
      let confirmPublishPM = await fDialog.warning({
        title: this.$t('pm.publish_planned_maintenance_description', {
          ns: 'maintenance',
        }),
        description: this.$t(
          'pm.publish_planned_maintenance_description_highlighted',
          {
            ns: 'maintenance',
          }
        ),
        saveText: this.$t('pm.publish', { ns: 'maintenance' }),
        cancelText: this.$t('pm.cancel', { ns: 'maintenance' }),
      })
      if (!confirmPublishPM) {
        this.publishPmButtonLoading = false
        return
      }
      let { pmId } = this
      let url = '/v3/plannedmaintenance/publish'
      let message = this.$t('pm.published_successfully', { ns: 'maintenance' })

      let { error } = await API.post(url, { pmId })
      if (isEmpty(error)) {
        ftoast.success(message || 'success')
        this.refreshData()
      } else {
        ftoast.critical(error.message || 'Error occured')
      }
      this.publishPmButtonLoading = false
    },

    /* This function unpublishes the PM */
    async unpublishPM() {
      this.unpublishPmButtonLoading = true

      let confirmUnpublishPM = await fDialog.warning({
        title: this.$t('pm.unpublish_planned_maintenance_description', {
          ns: 'maintenance',
        }),
        description: this.$t(
          'pm.unpublish_planned_maintenance_description_highlighted',
          {
            ns: 'maintenance',
          }
        ),
        saveText: this.$t('pm.unpublish', { ns: 'maintenance' }),
        cancelText: this.$t('pm.cancel', { ns: 'maintenance' }),
      })
      if (!confirmUnpublishPM) {
        this.unpublishPmButtonLoading = false
        return
      }
      let { record } = this
      let { id: pmId } = record || {}
      let url = '/v3/plannedmaintenance/deactivate'
      let message = this.$t('pm.unpublished_successfully', {
        ns: 'maintenance',
      })

      let { error } = await API.post(url, { pmId })
      if (isEmpty(error)) {
        ftoast.success(message || 'success')
        this.refreshData()
      } else {
        ftoast.critical(error.message || 'Error occured')
      }
      this.unpublishPmButtonLoading = false
    },

    /**
     * Helper methods
     */

    /* This function navigates to the workorders page, to view the workorders triggered from current record */
    viewWorkOrders() {
      let { pmId } = this || {}
      let search = JSON.stringify({
        pmV2: { operatorId: 9, value: [`${pmId}`] },
      })
      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule('workorder', pageTypes.LIST) || {}
        name &&
          this.$router.push({
            name,
            params: { viewname: 'all' },
            query: { search },
          })
      } else {
        let message = this.$t('pm.workOrder_tab_not_configured', {
          ns: 'maintenance',
        })
        ftoast.critical(message || 'success')
      }
    },

    /* This allows us to keep the Publish button on the notification banner  */
    /* not using this as it's been now shown as action button in summary page */
    // notificationButtons() {
    //   let { publishPM, publishPmButtonLoading, disablePublishPM } = this || {}

    //   return (
    //     <FButton
    //       appearance="secondaryInverse"
    //       size="medium"
    //       loading={publishPmButtonLoading}
    //       disabled={disablePublishPM}
    //       vOn:click={() => publishPM()}
    //     >
    //       {this.$t('pm.publish', {
    //         ns: 'maintenance',
    //       })}
    //     </FButton>
    //   )
    // },
  },
}
</script>
