<script lang="jsx">
import ModuleSummaryVue from '../../../summary/ModuleSummary.vue'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import { ftoast, fDialog } from '@facilio/design-system'
import { API } from '@facilio/api'

export default {
  extends: ModuleSummaryVue,
  computed: {
    systemBtnList() {
      return [
        {
          iconGroup: 'edit',
          iconName: 'edit-line',
          iconButton: true,
          iconPosition: 'prefix',
          identifier: 'edit',
          clickAction: this.editRecord,
          appearance: 'tertiary',
        },
      ]
    },
    moreButtonList() {
      return [
        {
          name: 'Delete',
          identifier: 'delete',
          clickAction: this.deleteRecord,
        },
      ]
    },
  },
  methods: {
    async deleteRecord() {
      let value = await fDialog.warning({
        title: `${this.$t('inventory.service.delete_service', {
          ns: 'inventory',
        })}`,
        description: `${this.$t('inventory.service.delete_confirmation', {
          ns: 'inventory',
        })}`,
        saveText: `${this.$t('inventory.service.delete', {
          ns: 'inventory',
        })}`,
        cancelText: `${this.$t('inventory.service.cancel', {
          ns: 'inventory',
        })}`,
      })

      if (value) {
        console.log('this ', this)
        let { moduleName, record, viewname = 'all' } = this
        let { id } = record || {}
        let { error } = await API.deleteRecord(moduleName, id)

        if (error) {
          ftoast.critical(error.message)
        } else {
          ftoast.success(
            this.$t('inventory.service.delete_success', { ns: 'inventory' })
          )
          if (isWebTabsEnabled()) {
            let { name } = findRouteForModule('service', pageTypes.LIST) || {}
            name &&
              this.$router.push({
                name,
                params: {
                  viewname,
                },
              })
          }
        }
      }
    },
  },
}
</script>
