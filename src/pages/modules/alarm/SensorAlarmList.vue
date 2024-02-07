<script lang="jsx">
import CommonAlarmList from './CommonAlarmList.vue'
import getProperty from 'dlv'
import NewAlarmMixin from './mixins/NewAlarmMixin'
import {
  FContainer,
  FTooltip,
  FText,
  FButton,
  FTags,
  FDropdown,
  FAvatar,
} from '@facilio/design-system'
import cloneDeep from 'lodash/cloneDeep'
import { isEmpty } from '@facilio/utils/validation'
export default {
  name: 'SensorAlarmList',
  extends: CommonAlarmList,
  mixins: [NewAlarmMixin],
  components: {
    FContainer,
    FTooltip,
    FText,
    FButton,
    FTags,
    FDropdown,
    FAvatar,
  },
  computed: {
    modifiedViewDetails() {
      let { viewDetail } = this
      let clonedViewDetail = cloneDeep(viewDetail)
      let { fields } = clonedViewDetail
      if (!isEmpty(fields)) {
        clonedViewDetail.fields = fields.filter(
          field => field.fieldName !== 'readingFieldId'
        )
      }
      return clonedViewDetail
    },
    slotList() {
      return [
        {
          name: 'readingFieldId',
          field: this.getFieldFromViewDetail('readingFieldId'),
          isHardcodedColumn: true,
          columnAttrs: {
            width: 150,
            displayName: 'Sensor',
            fixed: 'left',
          },
        },
        {
          criteria: JSON.stringify({ name: this.mainFieldName }),
        },
        { criteria: JSON.stringify({ name: 'severity' }) },
        {
          criteria: JSON.stringify({ name: 'acknowledgedBy' }),
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
    slotsContent() {
      let { slotList, mainFieldName } = this || {}
      return {
        [slotList[0].name]: ({ record } = {}) => {
          return (
            <FTooltip placement="bottomLeft" mouseEnterDelay={1}>
              <FText
                slot="title"
                appearance="bodyReg14"
                color="backgroundCanvas"
              >
                {this.getSensorDisplayName(record)}
              </FText>
              <FText
                appearance="bodyReg14"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {this.getSensorDisplayName(record)}
              </FText>
            </FTooltip>
          )
        },
        [slotList[1].criteria]: ({ record } = {}) => {
          return (
            <FTooltip placement="bottomLeft" mouseEnterDelay={1}>
              <FText
                slot="title"
                appearance="bodyReg14"
                color="backgroundCanvas"
              >
                {record[mainFieldName]}
              </FText>
              <FButton
                appearance="link"
                vOn:click={() => this.redirectToOverview(record.id)}
              >
                <FText
                  appearance="bodyReg14"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {record[mainFieldName]}
                </FText>
              </FButton>
            </FTooltip>
          )
        },
        [slotList[2].criteria]: ({ record } = {}) => {
          return (
            <FTags
              appearance="accent"
              text={this.getAlarmDisplayName(record)}
              accentColor={this.getAccentColor(record)}
              accentLevel={this.getAccentLevel(record)}
            />
          )
        },
        [slotList[3].criteria]: ({ record } = {}) => {
          return (
            <FContainer>
              {this.canAcknowledge(record) ? (
                <FContainer display="flex" justifyContent="center">
                  <FButton
                    appearance="secondary"
                    size="medium"
                    vOn:click={() => this.acknowledgeAlarms(record)}
                  >
                    {this.$t('alarm.acknowledge', 'Acknowledge', {
                      ns: 'alarm',
                    })}
                  </FButton>
                </FContainer>
              ) : (
                <FContainer display="flex">
                  {this.isActiveAlarm(record) && (
                    <FContainer display="flex">
                      {record.acknowledgedBy && (
                        <FContainer marginRight="containerLarge">
                          <FAvatar
                            size="S"
                            userStatus="nil"
                            userName={getProperty(
                              record,
                              'acknowledgedBy.name'
                            )}
                          />
                        </FContainer>
                      )}
                      <FText appearance="bodyReg14" paddingTop="containerSmall">
                        {getProperty(record, 'acknowledgedBy.name')}
                      </FText>
                    </FContainer>
                  )}
                </FContainer>
              )}
            </FContainer>
          )
        },
        [slotList[4].name]: ({ record } = {}) => {
          return (
            <FDropdown
              options={this.getDropdownOptions(record)}
              split={false}
              vOn:dropdown={this.handleDropdown}
            >
              <FButton
                appearance="tertiary"
                size="medium"
                iconGroup="action"
                iconName="options-vertical"
                iconButton={true}
              />
            </FDropdown>
          )
        },
      }
    },
  },
}
</script>
