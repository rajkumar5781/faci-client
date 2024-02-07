<script lang="jsx">
import ModuleList from '../../../list/ModuleList.vue'
import AdvancedSearch from '../../../../components/search/AdvancedSearch.vue'
import getProperty from 'dlv'
import {
  FContainer,
  FSwitch,
  FButton,
  FText,
  FTooltip,
} from '@facilio/design-system'

export default {
  extends: ModuleList,

  components: {
    FContainer,
    FSwitch,
    AdvancedSearch,
    FButton,
    FText,
    FTooltip,
  },

  computed: {
    slotList() {
      let mainFieldName = getProperty(this, 'mainFieldName', 'name')
      return [
        {
          name: 'id',
          isHardcodedColumn: true,
          columnAttrs: {
            width: 100,
            displayName: 'ID',
            fixed: 'right',
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
