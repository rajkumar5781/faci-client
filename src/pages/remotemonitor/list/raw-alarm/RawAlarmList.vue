<script lang="jsx">
import ModuleList from '../../../list/ModuleList.vue'
import getProperty from 'dlv'
import AdvancedSearch from '../../../../../src/components/search/AdvancedSearch.vue'
import RMAlarmsListMixin from '../RMAlarmsListMixin.vue'
import {
  FContainer,
  FSwitch,
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
            fixed: 'left',
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
              <template slot="title">
                {getProperty(record, `${mainFieldName}`, '- -')}
              </template>
              <FText>{getProperty(record, `${mainFieldName}`, '- -')}</FText>
            </FTooltip>
          )
        },
      }
    },
  },
}
</script>
