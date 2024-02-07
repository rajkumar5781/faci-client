<script lang="jsx">
import ModuleList from '../../../list/ModuleList.vue'
import AdvancedSearch from '../../../../components/search/AdvancedSearch.vue'
import getProperty from 'dlv'
import RMAlarmsListMixin from '../RMAlarmsListMixin.vue'
import {
  FContainer,
  FSwitch,
  FButton,
  FText,
  FTooltip,
  FTags,
} from '@facilio/design-system'

export default {
  extends: ModuleList,
  mixins: [RMAlarmsListMixin],
  components: {
    FContainer,
    FSwitch,
    AdvancedSearch,
    FButton,
    FText,
    FTooltip,
    FTags,
  },
  computed: {
    slotList() {
      let mainFieldName = getProperty(this, 'mainFieldName', 'name')
      return [
        {
          name: 'alarmState',
          isHardcodedColumn: true,
          columnAttrs: {
            width: 120,
            fixed: 'true',
          },
        },
        {
          criteria: JSON.stringify({ name: mainFieldName }),
        },
      ]
    },
  },

  methods: {
    slotsContent() {
      let { slotList, mainFieldName } = this
      return {
        [slotList[0].name]: ({ record } = {}) => {
          return (
            <FContainer>
              <FTags
                appearance="accent"
                text={this.getAlarmStateDisplayName(record)}
                accentColor={this.getAccentColor(record)}
                accentLevel={this.getAccentLevel(record)}
                style="display:flex;justify-content:center;width:60px"
              />
            </FContainer>
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
                {getProperty(record, `${mainFieldName}`, '- -')}
              </FText>
              <FButton
                appearance="link"
                vOn:click={() => this.redirectToOverview(record.id)}
              >
                <FText
                  fontsize="body3"
                  fontWeight="medium"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {getProperty(record, `${mainFieldName}`, '- -')}
                </FText>
              </FButton>
            </FTooltip>
          )
        },
      }
    },
  },
}
</script>
