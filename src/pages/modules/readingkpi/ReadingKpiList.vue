<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import {
  FTooltip,
  FText,
  FContainer,
  FSwitch,
  ftoast,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
export default {
  name: 'ReadingKpiList',
  extends: ModuleList,
  components: {
    FText,
    FTooltip,
    FContainer,
    FSwitch,
  },
  computed: {
    mainFieldName() {
      return 'name'
    },
    slotList() {
      return [
        {
          criteria: JSON.stringify({ name: 'name' }),
        },
        {
          criteria: JSON.stringify({ name: 'categoryId' }),
        },
        {
          criteria: JSON.stringify({ name: 'status' }),
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
    async updateStatus(record) {
      let { id, status } = record || {}
      let url = 'v3/modules/data/patch'
      let params = {
        data: { status: status === 'No' },
        moduleName: this.moduleName,
        id,
      }
      let { error, data } = await API.post(url, params)

      if (!isEmpty(error)) {
        ftoast.critical('Error Occurred')
      } else {
        ftoast.success(
          this.$t('summary.status_success', 'Status updated successfully', {
            ns: 'rule',
          })
        )
        record.status = status === 'No' ? 'Yes' : 'No'
      }
    },
    slotsContent() {
      let { slotList, mainFieldName } = this || {}
      return {
        [slotList[0].criteria]: ({ record } = {}) => {
          return (
            <FTooltip placement="bottomLeft" mouseEnterDelay={1}>
              <FText
                slot="title"
                appearance="bodyReg14"
                color="backgroundCanvas"
              >
                {record[mainFieldName]}
              </FText>
              <FText
                appearance="bodyReg14"
                overflow="hidden"
                textOverflow="ellipsis"
                cursor="pointer"
              >
                {record[mainFieldName]}
              </FText>
            </FTooltip>
          )
        },
        [slotList[1].criteria]: ({ record } = {}) => {
          return (
            <FContainer display="flex">
              <FText appearance="bodyReg14">
                {getProperty(record, 'category.ctx.displayName', '--')}
              </FText>
            </FContainer>
          )
        },
        [slotList[2].criteria]: ({ record } = {}) => {
          return (
            <FSwitch
              value={record.status === 'Yes'}
              vOn:change={() => this.updateStatus(record)}
            ></FSwitch>
          )
        },
        [slotList[3].name]: ({ record } = {}) => {
          return this.systemCustomButtons(record)
        },
      }
    },
  },
}
</script>
