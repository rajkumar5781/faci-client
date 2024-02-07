<script lang="jsx">
import ModuleList from '../../../list/ModuleList.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import {
  FContainer,
  FSwitch,
  FButton,
  FText,
  FTooltip,
  FIcon,
  ftoast,
} from '@facilio/design-system'

export default {
  extends: ModuleList,

  components: {
    FContainer,
    FSwitch,
    FButton,
    FText,
    FTooltip,
    FIcon,
    ftoast,
  },

  computed: {
    slotList() {
      let mainFieldName = getProperty(this, 'mainFieldName', 'name')
      return [
        {
          name: 'id',
          isHardcodedColumn: true,
          columnAttrs: {
            displayName: 'ID',
            width: 100,
            fixed: 'right',
          },
        },
        {
          criteria: JSON.stringify({ name: mainFieldName }),
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
        {
          name: 'status',
          columnAttrs: {
            width: 100,
            fixed: 'right',
          },
        },
      ]
    },
  },

  methods: {
    changeStatus(record, changedStatus) {
      let { records = {} } = this
      let { id: recordId } = record
      this.records = records.map(data => {
        let { id: dataId } = data || {}

        if (dataId === recordId) {
          this.updateStatus(recordId, changedStatus)

          return { ...data, status: changedStatus }
        } else return data
      })
    },

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
                {getProperty(record, `${mainFieldName}`, '-')}
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
                  {getProperty(record, `${mainFieldName}`, '-')}
                </FText>
              </FButton>
            </FTooltip>
          )
        },
        [slotList[2].name]: ({ record } = {}) => {
          return (
            <FContainer display="flex" gap="containerMedium">
              {this.$access.hasPermission('EDIT,UPDATE') && (
                <FIcon
                  group="edit"
                  name="edit-line"
                  size="16"
                  vOn:click={() => this.editModule(record)}
                />
              )}
              {this.$access.hasPermission('DELETE') && (
                <FIcon
                  group="default"
                  name="trash-can"
                  size="16"
                  vOn:click={() => this.deleteRecords([record.id])}
                />
              )}
            </FContainer>
          )
        },
        [slotList[3].name]: ({ record } = {}) => {
          let { status: recordStatus } = record || {}
          let status = recordStatus === 'Yes' || recordStatus === 'True'
          return (
            <FContainer display="flex" gap="containerMedium">
              <FSwitch
                size="small"
                v-model={status}
                vOn:change={changedStatus =>
                  this.changeStatus(record, changedStatus)
                }
              />
            </FContainer>
          )
        },
      }
    },

    async updateStatus(id, status) {
      let data = { status, id }
      let { error } = await API.post(
        `/v3/ruleList/alarmFilterRule/ruleStatus/${id}`,
        {
          data,
        }
      )
      if (isEmpty(error)) {
        let successMsg = this.$t(
          'alarm_filter_rule.status_save_success_message',
          'Status Updated',
          {
            ns: 'remote_monitor',
          }
        )
        ftoast.success(successMsg)
      } else {
        let { message } = error || {}
        ftoast.critical(message)
      }
    },
  },
}
</script>
