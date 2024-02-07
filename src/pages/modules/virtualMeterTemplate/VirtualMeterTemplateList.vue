<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import getProperty from 'dlv'
import { FContainer, FText} from '@facilio/design-system'

export default {
  extends: ModuleList,
  name: 'VirtualMeterTemplateList',
  components: {
    FContainer,
    FText,
  },
  computed: {
    createBtnText() {
      return this.$t('meter.vmTemplate.new_template', { ns: 'energy' })
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
          criteria: JSON.stringify({ name: 'relationShipId' }),
        },
      ]
    },
  },
  methods: {
    slotsContent() {
      let { slotList } = this
      return {
        [slotList[0].name]: ({ record } = {}) => {
          return this.systemCustomButtons(record)
        },

        [slotList[1].criteria]: ({ record } = {}) => {
          return (
            <FContainer textAlign="left">
              <FText>
                { getProperty(record, 'relationShip.name', '') }
              </FText>
            </FContainer>
          )
        }, 
      }
    },
  },
}
</script>
