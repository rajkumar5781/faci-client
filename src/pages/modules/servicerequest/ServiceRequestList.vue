<script lang="jsx">
import ModuleList from '../../../pages/list/ModuleList.vue'
import {
  FContainer,
  FButton,
  ftoast,
  FIcon,
  FText,
} from '@facilio/design-system'
import { TeamStaff } from '@facilio/ui/new-forms'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { POSITION_TYPE } from '../../../components/custom-button/CustomButtonUtil'
import CustomButton from '../../../components/custom-button/CustomButton.vue'
import getProperty from 'dlv'

const modeTypes = {
  ISNEW: 'New',
  CUSTOMER_REPLIED: 'Customer Replied',
  AGENT_REPLIED: 'Admin Replied',
  CREATED: 'Created',
}

export default {
  extends: ModuleList,
  name: 'ServiceRequestList',
  data() {
    return {
      field: {
        name: 'teamstaff',
      },
      formModelValue: {
        teamstaff: {
          assignedTo: { id: null },
          assignmentGroup: { id: null },
        },
      },
      showTeamStaffPopup: false,
    }
  },
  computed: {
    getSiteIds() {
      let { selectedListItemsObj = [] } = this
      let siteIds = []
      selectedListItemsObj.map(list => {
        let { siteId } = list
        siteIds.push(siteId)
      })
      return null
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
          name: 'mode',
          isActionColumn: false,
          columnAttrs: {
            width: 130,
            fixed: 'right',
          },
        },
      ]
    },
  },
  watch: {
    formModelValue: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          let { teamstaff = {} } = newVal
          let { assignedTo = null, assignmentGroup = null } = teamstaff
          let { id: assignmentGroupId } = assignmentGroup
          let { id: assignedToId } = assignedTo
          if (!isEmpty(assignedToId)) {
            this.assignRecords(assignedTo, assignmentGroupId)
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    slotsContent() {
      let { slotList } = this || {}
      return {
        [slotList[0].name]: ({ record } = {}) => {
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
              <CustomButton
                key={`${this.moduleName}_${record.id}_${POSITION_TYPE.LIST_ITEM}`}
                moduleName={this.moduleName}
                position={POSITION_TYPE.LIST_ITEM}
                record={record}
                modelDataClass={this.modelDataClass}
                vOn:onSuccess={this.refreshRecordDetails}
                vOn:onError={() => {}}
              ></CustomButton>
            </FContainer>
          )
        },
        [slotList[1].name]: ({ record }) => {
          let { mode = 'CREATED' } = record
          let modetype = modeTypes[mode]
          return (
            <FContainer>
              <FText>{modetype}</FText>
            </FContainer>
          )
        },
      }
    },

    async assignRecords(assignedTo = {}, assignmentGroup = {}) {
      let { moduleName } = this
      let recordMap = this.selectedListItemsIds.map(id => {
        let record
        if (assignedTo) {
          record = { id, assignedTo }
        } else if (assignmentGroup) {
          record = { id, assignmentGroup }
        }
        return record
      })
      let params = {
        moduleName: moduleName,
        data: {
          [moduleName]: recordMap,
        },
      }
      this.isLoading = false
      let { error } = await API.post('v3/modules/data/bulkpatch', params)
      if (error) {
        ftoast.critical(
          error?.message ||
            this.$t('service_request.error_occur_while_assigning', {
              ns: 'servicerequest',
            })
        )
      } else {
        ftoast.success(
          error?.message ||
            this.$t('service_request.service_request_assigned_successfully', {
              ns: 'servicerequest',
            })
        )
        this.showTeamStaffPopup = false
        this.unselectAll()
        await this.refreshRecordDetails(true)
        this.formModelValue = {
          teamstaff: {
            assignedTo: { id: null },
            assignmentGroup: { id: null },
          },
        }
      }
      this.isLoading = false
    },
    bulkActionButtons() {
      let { field, $account: account, formModelValue } = this

      return (
        <FContainer display="flex">
          {this.$access.hasPermission('UPDATE') && (
            <FContainer paddingRight="containerLarge">
              <TeamStaff
                ref={`field-value-${field.name}`}
                formModel={formModelValue}
                account={account}
                field={field}
                siteId={this.getSiteIds}
                {...{
                  on: {
                    'update:formModel': val => (this.formModelValue = val),
                  },
                }}
              >
                <template slot="input">
                  {
                    <FContainer paddingRight="containerLarge">
                      <FButton appearance="secondary" size="medium">
                        {this.$t('service_request.assign', {
                          ns: 'servicerequest',
                        })}
                      </FButton>
                    </FContainer>
                  }
                </template>
              </TeamStaff>
            </FContainer>
          )}
          {this.$access.hasPermission('DELETE') && (
            <FButton
              appearance="secondary"
              size="medium"
              vOn:click={() => this.deleteRecords(this.selectedListItemsIds)}
            >
              {this.$t('delete', 'Delete', { ns: 'common' })}
            </FButton>
          )}
        </FContainer>
      )
    },
  },
}
</script>
