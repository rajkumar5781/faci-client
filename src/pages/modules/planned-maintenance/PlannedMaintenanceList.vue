<script lang="jsx">
import { API } from '@facilio/api'
import ModuleList from '../../list/ModuleList.vue'
import { ftoast, fDialog } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'PlannedMaintenanceList',
  extends: ModuleList,
  computed: {
    topBarSystemButtonsConfig() {
      return [
        {
          name: `Create ${this.moduleDisplayName}`,
          identifier: 'create',
          buttonName: `Create ${this.moduleDisplayName}`,
          positionType: 4,
          appearance: 'primary',
          action: this.redirectToFormCreation,
        },
      ]
    },

    recordSystemButtonsConfig() {
      return [
        {
          name: '',
          positionType: 2,
          iconButton: true,
          identifier: 'edit_list',
          iconName: 'edit-line',
          iconGroup: 'edit',
          iconPosition: 'prefix',
          action: this.onClickEditRecord,
          appearance: 'tertiary',
        },
        {
          name: '',
          iconButton: true,
          identifier: 'delete_list',
          iconName: 'trash-can',
          iconGroup: 'default',
          action: this.deleteRecords, // default action
          positionType: 2,
          appearance: 'tertiary',
        },
      ]
    },

    bulkSystemButtonsConfig() {
      return [
        {
          name: 'Publish',
          identifier: 'publishPM',
          action: this.onClickPublishPM,
          positionType: 4,
          appearance: 'secondary',
        },
        {
          name: 'Unpublish',
          identifier: 'unpublishPM',
          action: this.onClickUnPublishPM,
          positionType: 4,
          appearance: 'secondary',
        },
        {
          name: 'Delete',
          identifier: 'delete_bulk',
          action: this.deleteRecords, // default action
          positionType: 4,
          appearance: 'secondary',
        },
      ]
    },
  },
  methods: {
    /** On Click Listeners */

    // Triggers when the Publish button is clicked
    async onClickPublishPM() {
      let isConfirmPublishPM = await this.getWarningDialogResponse('publish')
      if (isConfirmPublishPM) {
        this.publishPm(true)
      }
    },

    // Triggers when the UnPublish button is clicked
    async onClickUnPublishPM() {
      let isConfirmUnPublishPM =
        await this.getWarningDialogResponse('unPublish')
      if (isConfirmUnPublishPM) {
        this.publishPm(false)
      }
    },

    // Triggers when the Edit icon is clicked
    async onClickEditRecord(row) {
      let { pmStatusEnum } = row || {}
      if (!isEmpty(pmStatusEnum) && pmStatusEnum === 'IN_ACTIVE') {
        this.editModule(row)
        return
      } else {
        let isConfirm = await this.getWarningDialogResponse('edit')
        if (isConfirm) {
          this.editModule(row)
        }
      }
    },

    // Triggers when the delete icon is clicked, not used
    async onClickDeleteRecord(idList) {
      let isConfirm = await this.getWarningDialogResponse('delete')
      if (isConfirm) {
        this.editModule(idList)
      }
    },

    /** Helper functions */

    /**
     * helper function to show the custom warning dialog for the following status
     * - edit
     * - publish
     * - unPublish
     * @param {*} status
     */
    async getWarningDialogResponse(status) {
      let title = '',
        description = '',
        confirmButtonText = '',
        cancelButtonText = this.$t('pm.cancel', { ns: 'maintenance' })

      if (status === 'edit') {
        title = this.$t('pm.edit_planned_maintenance_description_highlighted', {
          ns: 'maintenance',
        })
        description = this.$t('pm.edit_planned_maintenance_description', {
          ns: 'maintenance',
        })
        confirmButtonText = this.$t('pm.edit', { ns: 'maintenance' })
      } else if (status == 'delete') {
        // let { moduleDisplayName } = this
        // title = `Delete ${moduleDisplayName}`
        // description = `Are you sure to delete this ${moduleDisplayName}(s) ?`
        // confirmButtonText = this.$t('pm.delete', { ns: 'maintenance' })
        // cancelButtonText = this.$t('pm.cancel', { ns: 'maintenance' })
      } else if (status === 'publish') {
        title = this.$t('pm.publish_planned_maintenance', {
          ns: 'maintenance',
        })
        description = this.$t('pm.publish_planned_maintenance_description', {
          ns: 'maintenance',
        })
        confirmButtonText = this.$t('pm.publish', { ns: 'maintenance' })
      } else if (status === 'unPublish') {
        title = this.$t('pm.unpublish_planned_maintenance', {
          ns: 'maintenance',
        })
        description = this.$t('pm.unpublish_planned_maintenance_description', {
          ns: 'maintenance',
        })
        confirmButtonText = this.$t('pm.unpublish', { ns: 'maintenance' })
      } else {
        return false
      }

      let confirmationResponse = await fDialog.warning({
        title,
        description,
        saveText: confirmButtonText,
        cancelText: cancelButtonText,
      })
      return confirmationResponse
    },

    /**
     * publishPm function publishes or unPublishes the PMs selected in the current page.
     * @param {'publish'/'unPublish'} isPublish
     */
    async publishPm(isPublish) {
      let { selectedListItemsIds } = this || {}
      let params = {
        pmIds: selectedListItemsIds,
      }
      let url = `v3/plannedmaintenance/${
        isPublish ? 'bulkpublish' : 'bulkunpublish'
      }`
      let { error } = await API.post(url, params)
      if (!isEmpty(error)) {
        ftoast.critical(error.message || 'Error occured')
      } else {
        let successMsg = 'Success'
        if (isPublish) {
          successMsg = this.$t('pm.published_successfully', {
            ns: 'maintenance',
          })
        } else {
          successMsg = this.$t('pm.unpublished_successfully', {
            ns: 'maintenance',
          })
        }
        ftoast.success(successMsg)

        await this.loadRecords()
        this.selectedListItemsIds = []
        this.selectedListItemsObj = []
      }
    },
  },
}
</script>

<style></style>
