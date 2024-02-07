<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import {
  FContainer,
  FText,
  FButton,
  FTooltip,
  FIcon,
} from '@facilio/design-system'
import AdvancedSearch from '../../../components/search/AdvancedSearch.vue'
import getProperty from 'dlv'

export default {
  extends: ModuleList,

  computed: {
    mainFieldName() {
      return 'billUid'
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
          criteria: JSON.stringify({ name: 'billUid' }),
        },
      ]
    },
  },
  methods: {
    header() {
      let { canHideFilter, filters, moduleName, moduleDisplayName } = this || {}
      return (
        <div class="flex items-center">
          {!canHideFilter && (
            <AdvancedSearch
              filters={filters}
              moduleName={moduleName}
              moduleDisplayName={moduleDisplayName}
            ></AdvancedSearch>
          )}
        </div>
      )
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
                {getProperty(record, mainFieldName)}
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
                  {getProperty(record, mainFieldName)}
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
