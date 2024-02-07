<script lang="jsx">
import CommonAlarmList from './CommonAlarmList.vue'
import NewAlarmMixin from './mixins/NewAlarmMixin'
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FTags,
  FAvatar,
  FDropdown,
  FTooltip,
  FButton,
} from '@facilio/design-system'
export default {
  extends: CommonAlarmList,
  name: 'BMSAlarmList',
  mixins: [NewAlarmMixin],
  components: {
    FContainer,
    FTags,
    FText,
    FDropdown,
    FAvatar,
    FTooltip,
    FButton,
  },
  computed: {
    slotList() {
      return [
        {
          name: 'severity',
          field: this.getFieldFromViewDetail('severity'),
          isHardcodedColumn: true,
          columnAttrs: {
            width: 100,
            fixed: 'left',
          },
        },
        {
          criteria: JSON.stringify({ name: this.mainFieldName }),
        },
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
            <FContainer display="flex" justifyContent="center">
              <FTags
                appearance="accent"
                text={this.getAlarmDisplayName(record)}
                accentColor={this.getAccentColor(record)}
                accentLevel={this.getAccentLevel(record)}
              />
            </FContainer>
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
        [slotList[3].name]: ({ record } = {}) => {
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
