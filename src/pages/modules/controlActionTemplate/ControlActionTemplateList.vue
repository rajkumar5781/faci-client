<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import { FContainer, FIcon, FTags } from '@facilio/design-system'
import { POSITION_TYPE } from '../../../components/custom-button/CustomButtonUtil'
import CustomButton from '../../../components/custom-button/CustomButton.vue'
import getProperty from 'dlv'
export default {
  extends: ModuleList,
  components: {
    FContainer,
    FIcon,
    CustomButton,
    FTags,
  },
  computed: {
    topBarSystemButtonsConfig() {
      return [
        {
          name: `${this.$t('controls.new_template', { ns: 'energy' })}`,
          identifier: 'create',
          buttonName: `New ${this.moduleDisplayName}`,
          positionType: 4,
          appearance: 'primary',
          action: this.redirectToFormCreation,
        },
      ]
    },
    slotList() {
      return [
        {
          name: 'action',
          isActionColumn: true,
          columnAttrs: {
            width: 130,
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        },
        {
          criteria: JSON.stringify({ name: 'controlActionTemplateStatus' }),
        },
        {
          criteria: JSON.stringify({ name: 'controlActionType' }),
        },
      ]
    },
  },
  methods: {
    getEnumValue(record, prop) {
      return getProperty(record, `${prop}`, null)
    },
    getStatusType(record) {
      let enumValue = this.getEnumValue(record, 'controlActionTemplateStatus')
      if (enumValue === 'Active') return 'success'
      else return 'danger'
    },
    slotsContent() {
      let { slotList, mainFieldName } = this
      return {
        [slotList[0].name]: ({ record } = {}) => {
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
              <CustomButton
                key={`${this.moduleName}_${record.id}_${POSITION_TYPE.LIST_ITEM}`}
                moduleName={this.moduleName}
                position={POSITION_TYPE.LIST_ITEM}
                record={record}
                modelDataClass={this.modelDataClass}
                vOn:onSuccess={this.refreshRecordDetails}
                vOn:onError={() => {}}
              ></CustomButton>
            </FContainer>
          )
        },
        [slotList[1].criteria]: ({ record } = {}) => {
          return (
            <FContainer>
              <FTags
                appearance="status"
                text={this.getEnumValue(record, 'controlActionTemplateStatus')}
                statusType={this.getStatusType(record)}
              ></FTags>
            </FContainer>
          )
        },
        [slotList[2].criteria]: ({ record } = {}) => {
          return (
            <FContainer>
              <FTags
                appearance="simple"
                text={this.getEnumValue(record, 'controlActionType')}
              ></FTags>
            </FContainer>
          )
        },
      }
    },
  },
}
</script>
