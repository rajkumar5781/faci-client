<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import { FText, FTooltip, FContainer, FIcon } from '@facilio/design-system'
import getProperty from 'dlv'
import { POSITION_TYPE } from '../../../components/custom-button/CustomButtonUtil'
import CustomButton from '../../../components/custom-button/CustomButton.vue'
export default {
  extends: ModuleList,
  components: {
    FText,
    FTooltip,
    FContainer,
    FIcon,
    CustomButton,
  },
  computed: {
    slotList() {
      return [
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
    getProperty,
    slotsContent() {
      let { slotList, mainFieldName } = this
      return {
        [slotList[1].criteria]: ({ record } = {}) => {
          return (
            <FTooltip placement="bottomLeft" mouseEnterDelay={1}>
              <FContainer>
                <FText
                  slot="title"
                  fontsize="body3"
                  fontWeight="medium"
                  color="backgroundCanvas"
                >
                  {getProperty(record, mainFieldName)}
                </FText>
                <FText
                  fontsize="body3"
                  fontWeight="medium"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {getProperty(record, mainFieldName)}
                </FText>
              </FContainer>
            </FTooltip>
          )
        },
        [slotList[1].name]: ({ record } = {}) => {
          return this.systemCustomButtons(record)
        },
      }
    },
  },
}
</script>
