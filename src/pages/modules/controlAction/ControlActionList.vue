<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import { POSITION_TYPE } from '../../../components/custom-button/CustomButtonUtil'
import CustomButton from '../../../components/custom-button/CustomButton.vue'
import { FContainer, FIcon, FText, FTags } from '@facilio/design-system'
import getProperty from 'dlv'
import { STATUS_MAP } from './widgets/controlsUtil'
import { isEmpty } from '@facilio/utils/validation'
export default {
  extends: ModuleList,
  components: {
    FContainer,
    FIcon,
    FText,
    FTags,
    CustomButton,
  },
  computed: {
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
          criteria: JSON.stringify({ name: 'controlActionStatus' }),
        },
        {
          criteria: JSON.stringify({ name: 'controlActionType' }),
        },
        {
          criteria: JSON.stringify({ name: 'controlActionExecutionType' }),
        },
      ]
    },
  },
  methods: {
    getEnumValue(record, prop) {
      return getProperty(record, `${prop}`, '---')
    },
    getAccentColor(record) {
      let statusEnum = getProperty(record, 'controlActionStatusEnum', '')
      let statusType = this.getTagProps(statusEnum)
      return !isEmpty(statusType) ? statusType : 'green'
    },
    getExecutionTypeColor(record) {
      let executionType = getProperty(
        record,
        'controlActionExecutionType',
        0
      )
      return executionType === 'Actual' ? 'green' : 'yellow'
    },
    getTagProps(value) {
      let tagDetail = STATUS_MAP.filter(status => status.enum === value)
      if (!isEmpty(tagDetail)) {
        return getProperty(tagDetail, '0.accentColor', null)
      } else {
        return {}
      }
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
                appearance="accent"
                text={this.getEnumValue(record, 'controlActionStatus')}
                accentLevel="L2"
                accentColor={this.getAccentColor(record)}
              />
            </FContainer>
          )
        },
        [slotList[2].criteria]: ({ record } = {}) => {
          return (
            <FContainer>
              <FTags
                appearance="simple"
                text={this.getEnumValue(record, 'controlActionType')}
              />
            </FContainer>
          )
        },
        [slotList[3].criteria]: ({ record } = {}) => {
          return (
            <FContainer>
              <FTags
                appearance="accent"
                text={this.getEnumValue(record, 'controlActionExecutionType')}
                accentLevel="L2"
                accentColor={this.getExecutionTypeColor(record)}
              />
            </FContainer>
          )
        },
      }
    },
  },
}
</script>
