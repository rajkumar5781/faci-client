<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import { CustomModuleData } from '../../../data/CustomModuleData'
import {
  FContainer,
  FText,
  FTooltip,
  FIcon,
  fDialog,
  ftoast,
} from '@facilio/design-system'

export default {
  extends: ModuleList,
  data() {
    return {
      createBtnText: 'New Tariff',
    }
  },
  computed: {
    modelDataClass() {
      return CustomModuleData
    },
    slotList() {
      return [
        {
          name: 'id',
          isHardcodedColumn: true,
          columnAttrs: {
            width: 80,
            displayName: 'ID',
            fixed: true,
          },
        },
        {
          criteria: JSON.stringify({ name: 'name' }),
        },
        {
          name: 'action',
          isActionColumn: true,
          columnAttrs: {
            width: 130,
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        },
      ]
    },
  },
  methods: {
    async deleteRecords(idList) {
      let { moduleName } = this

      let value = await fDialog.danger({
        title: this.$t('utility.delete_tariff', { ns: 'energy' }),
        description: this.$t('utility.are_you_sure_you_want_to_delete_this_tariff', { ns: 'energy' }),
        saveText: this.$t('utility.delete', { ns: 'energy' })
      })

      if (value) {
        this.isLoading = true
        try {
          await this.modelDataClass.delete(moduleName, idList)
          ftoast.success(
            this.$t('utility.tariff_deleted_successfully', { ns: 'energy' })
          )
          this.selectedListItemsIds = []
          this.selectedListItemsObj = []
          await this.refreshRecordDetails(true)
        } catch (error) {
          this.showErrorToastMessage(
            error,
            this.$t('custommodules.list.delete_error')
          )
        }
        this.isLoading = false
      }
    },
    slotsContent() {
      let { slotList, mainFieldName } = this || {}
      return {
        [slotList[0].name]: ({ record } = {}) => {
          return (
            <div>
              <FText color="textMain">{'#' + record.id}</FText>
            </div>
          )
        },
        [slotList[1].criteria]: ({ record } = {}) => {
          return (
            <FTooltip placement="bottomLeft" mouseEnterDelay={1}>
              <FText
                slot="title"
                fontsize="body3"
                fontWeight="medium"
                color="backgroundCanvas"
              >
                {record[mainFieldName]}
              </FText>
              <FText
                fontsize="body3"
                fontWeight="medium"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {record[mainFieldName]}
              </FText>
            </FTooltip>
          )
        },
        [slotList[2].name]: ({ record } = {}) => {
          return (
            <FContainer display="flex" gap="containerMedium">
              {this.$access.hasPermission('EDIT,UPDATE') && (
                <FIcon
                  group="edit"
                  name="edit-line"
                  size="16"
                  vOn:click={() => this.editModule(record)}
                />
              )}
              {this.$access.hasPermission('DELETE') && (
                <FIcon
                  group="default"
                  name="trash-can"
                  size="16"
                  vOn:click={() => this.deleteRecords([record.id])}
                />
              )}
            </FContainer>
          )
        },
      }
    },
  },
}
</script>
