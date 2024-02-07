<script>
import ModuleSummary from '../../summary/ModuleSummary.vue'
import { API } from '@facilio/api'
import { fDialog, ftoast } from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
export default {
  extends: ModuleSummary,
  computed: {
    systemBtnList() {
      return [
        {
          name: 'Publish',
          identifier: 'publish_summary',
          appearance: 'primary',
          clickAction: this.publish,
        },
      ]
    },
    moreButtonList() {
      return [
        {
          name: 'Edit',
          identifier: 'edit_summary',
          appearance: 'tertiary',
          clickAction: this.editRecord,
        },
        {
          name: 'Delete',
          identifier: 'delete_summary',
          appearance: 'tertiary',
          clickAction: this.editRecord,
        },
        {
          name: 'Revise',
          identifier: 'revise_summary',
          appearance: 'tertiary',
          clickAction: this.reviseRecord,
        },
      ]
    },
  },
  methods: {
    async publish() {
      let { record, moduleName } = this
      let { id } = record

      let { error } = await API.updateRecord(moduleName, {
        id,
        data: {},
        params: { publish: true },
      })

      if (error) {
        ftoast.critical(error?.message)
      } else {
        ftoast.success(
          this.$t('tAndC.publish.success', 'Record Published Successfully', {
            ns: 'tAndc',
          })
        )
        this.refreshData()
      }
    },
    async deleteRecord() {
      let value = await fDialog.warning({
        title: `${this.$t('tAndc.delete.title', 'Delete Terms And Conditions', {
          ns: 'tAndc',
        })}`,
        description: `${this.$t(
          'tAndc.delete.confirmation',
          'Are you sure you want to delete this record?',
          {
            ns: 'tAndc',
          }
        )}`,
        saveText: `${this.$t('tAndc.delete.deleteTxt', 'Delete', {
          ns: 'tAndc',
        })}`,
        cancelText: `${this.$t('tAndc.delete.cancelTxt', 'Cancel', {
          ns: 'tAndc',
        })}`,
      })

      if (value) {
        let { moduleName, record, viewname = 'all' } = this
        let { id } = record || {}
        let { error } = await API.deleteRecord(moduleName, id)

        if (error) {
          ftoast.critical(error?.message)
        } else {
          ftoast.success(
            this.$t('tAndC.delete.success', 'Deleted Successfully', {
              ns: 'tAndc',
            })
          )
          let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}
          name &&
            this.$router.push({
              name,
              params: {
                viewname,
              },
            })
        }
      }
    },
    reviseRecord() {
      let { moduleName, record } = this
      let { id } = record
      let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
      name &&
        this.$router.push({ name, params: { id }, query: { isRevised: true } })
    },
  },
}
</script>
