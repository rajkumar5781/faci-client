<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import { FContainer, FText, FButton, FTooltip } from '@facilio/design-system'
import { POSITION_TYPE } from '../../../components/custom-button/CustomButtonUtil'
import AdvancedSearch from '../../../components/search/AdvancedSearch.vue'
import CustomButton from '../../../components/custom-button/CustomButton.vue'
import getProperty from 'dlv'
export default {
  extends: ModuleList,
  components: {
    FContainer,
    FText,
    AdvancedSearch,
    CustomButton,
    FButton,
    FTooltip,
  },
  computed: {
    mainFieldName() {
      return 'poId'
    },
    slotList() {
      return [
        {
          criteria: JSON.stringify({ name: 'poId' }),
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
      let { slotList } = this
      return {
        [slotList[0].criteria]: ({ record } = {}) => {
          return (
            <FTooltip placement="bottomLeft" mouseEnterDelay={1}>
              <template slot="title">
                {this.getPurchaseOrderName(record)}
              </template>
              <FButton
                appearance="link"
                vOn:click={() => this.redirectToOverview(record.id)}
              >
                <FText cursor="pointer">
                  {this.getPurchaseOrderName(record)}
                </FText>
              </FButton>
            </FTooltip>
          )
        },
        [slotList[1].name]: ({ record } = {}) => {
          return this.systemCustomButtons(record)
        },
      }
    },
    getPurchaseOrderName(record) {
      return getProperty(record, 'poId.name', '---')
    },
  },
}
</script>
