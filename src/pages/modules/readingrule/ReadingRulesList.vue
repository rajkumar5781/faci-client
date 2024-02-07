<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import NewAlarmMixin from '../../../pages/modules/alarm/mixins/NewAlarmMixin'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FTags,
  FAvatar,
  FDropdown,
  FSwitch,
  FButton,
  FIcon,
  FTooltip,
  ftoast,
  fDialog,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
import cloneDeep from 'lodash/cloneDeep'
import getProperty from 'dlv'
export default {
  extends: ModuleList,
  name: 'RulesList',
  mixins: [NewAlarmMixin],
  components: {
    FContainer,
    FTags,
    FText,
    FDropdown,
    FAvatar,
    FSwitch,
    FButton,
    FIcon,
    FTooltip,
  },
  data() {
    return {
      selectType: '',
    }
  },
  computed: {
    modifiedViewDetails() {
      let { viewDetail } = this
      let clonedViewDetail = cloneDeep(viewDetail)
      let { fields } = clonedViewDetail || {}
      if (isEmpty(fields)) return
      clonedViewDetail.fields = fields.filter(field => {
        let { fieldName = '' } = field
        return !['name', 'status'].includes(fieldName)
      })
      return clonedViewDetail
    },
    slotList() {
      return [
        {
          name: 'severity',
          isHardcodedColumn: true,
          columnAttrs: {
            displayName: 'Severity',
          },
        }, //0
        {
          name: 'space/asset',
          isHardcodedColumn: true,
          columnAttrs: {
            displayName: 'Space/Asset',
          },
        }, // 1
        {
          name: 'type',
          isHardcodedColumn: true,
          columnAttrs: {
            displayName: 'Type',
          },
        }, //2
        {
          name: 'status',
          isHardcodedColumn: true,
          dataTypeEnum: 'BOOLEAN',
          columnAttrs: {
            displayName: 'Status',
          },
        }, //3
        {
          name: this.mainFieldName,
          isHardcodedColumn: true,
          columnAttrs: {
            displayName: 'Name',
            fixed: 'left',
          },
        }, //4

        {
          name: 'id',
          isHardcodedColumn: true,
          columnAttrs: {
            width: 80,
            displayName: 'ID',
            fixed: 'left',
          },
        }, //5
        {
          criteria: JSON.stringify({ name: 'assetCategory' }),
          columnAttrs: {
            displayName: 'Category',
          },
        }, //6

        {
          criteria: JSON.stringify({ name: 'readingFieldId' }),
          columnAttrs: {
            label: 'Reading Field',
          },
        }, //7
        {
          criteria: JSON.stringify({ name: 'readingModuleId' }),
          columnAttrs: {
            label: 'Reading Module',
          },
        }, //8
        {
          name: 'action',
          isActionColumn: true,
          columnAttrs: {
            width: 130,
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        }, //9
      ]
    },
    moduleDisplayName() {
      return this.$t('summary.rule', { ns: 'rule' })
    },
  },
  methods: {
    getRecordData(record, property) {
      return getProperty(record, property, '--')
    },
    getType(record) {
      let { assetCategory = {} } = record
      let name = !isEmpty(assetCategory) ? 'Asset' : 'Space'
      return this.$t('summary.asset_or_space', { ns: 'rule', name })
    },
    getSpaceOrAsset(record) {
      let { assetCategory = {}, ns = {} } = record || {}
      let { includedAssetIds } = ns || []
      if (assetCategory) {
        let { displayName = {} } = assetCategory
        let hasSpecificAssets = !isEmpty(includedAssetIds)
        return hasSpecificAssets
          ? `${includedAssetIds.length} ${assetCategory.primaryValue}${
              includedAssetIds.length > 1 ? 's' : ''
            }`
          : this.$t('summary.all_resource_label', { ns: 'rule', displayName })
      }
      return '---'
    },
    getSeverityDisplayName(record) {
      let { alarmDetails: { severity } = {} } = record || {}
      return severity
    },
    getSeverityAccentColor(record) {
      let { accentObject } = this
      let { alarmDetails: { severity } = {} } = record || {}
      let { accentColor } = accentObject[severity]
      return accentColor
    },
    getSeverityAccentLevel(record) {
      let { accentObject } = this
      let { alarmDetails: { severity } = {} } = record || {}
      let { accentLevel } = accentObject[severity]
      return accentLevel
    },
    async updateStatus(record) {
      let { id, status } = record || {}
      let url = 'v3/modules/data/patch'
      let params = {
        data: { status: status === 'No' },
        moduleName: this.moduleName,
        id: id,
      }
      let { error, data = {} } = await API.updateRecord(this.moduleName, params)

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
    editRule(record) {
      let { id } = record || {}
      let { viewname, moduleName } = this

      if (isWebTabsEnabled()) {
        let { name } = findRouteForModule(moduleName, pageTypes.EDIT) || {}
        name && this.$router.push({ name, params: { viewname, id } })
      } else {
        this.$router.push({
          name: 'new-rule-edit',
          params: { viewname, id },
          query: this.$route.query,
        })
      }
    },
    async deleteRule(id) {
      let { moduleName, moduleDisplayName } = this
      let value = await fDialog.warning({
        title: `${this.$t('summary.delete', {
          ns: 'rule',
        })} ${moduleDisplayName}`,
        description: `${this.$t('summary.delete_confirmation', {
          ns: 'rule',
        })} ${moduleDisplayName}?`,
        saveText: this.$t('summary.delete', { ns: 'rule' }),
      })
      if (value) {
        this.isLoading = true

        try {
          await this.modelDataClass.delete(moduleName, id)
          ftoast.success(
            `${moduleDisplayName} ${this.$t('summary.delete_success', {
              ns: 'rule',
            })}`
          )
          await this.loadRecords()
        } catch (errorMsg) {
          ftoast.critical(errorMsg)
        }
        this.isLoading = false
      }
    },
    closeEditForm(close) {
      if (close) {
        this.canShowEditForm = false
      }
    },
    slotsContent() {
      let { slotList, mainFieldName } = this || {}
      return {
        [slotList[0].name]: ({ record } = {}) => {
          return (
            <FContainer>
              <FTags
                appearance="accent"
                text={record.alarmDetails.severity}
                accentColor={this.getSeverityAccentColor(record)}
                accentLevel={this.getSeverityAccentLevel(record)}
              />
            </FContainer>
          )
        },
        [slotList[1].name]: ({ record } = {}) => {
          return (
            <FText appearance="bodyReg14">{this.getSpaceOrAsset(record)}</FText>
          )
        },
        [slotList[2].name]: ({ record } = {}) => {
          return <FText appearance="bodyReg14">{this.getType(record)}</FText>
        },
        [slotList[3].name]: ({ record } = {}) => {
          return (
            <FContainer>
              {this.$access.hasPermission('newreadingrules:UPDATE') && (
                <FSwitch
                  value={record.status === 'Yes'}
                  vOn:change={() => this.updateStatus(record)}
                ></FSwitch>
              )}
            </FContainer>
          )
        },
        [slotList[4].name]: ({ record } = {}) => {
          return (
            <FTooltip placement="bottomLeft" mouseEnterDelay={1}>
              <FText
                slot="title"
                fontsize="body3"
                fontWeight="medium"
                color="backgroundCanvas"
              >
                {record[mainFieldName]}
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
                  {record[mainFieldName]}
                </FText>
              </FButton>
            </FTooltip>
          )
        },

        [slotList[5].name]: ({ record } = {}) => {
          return (
            <div>
              <FText color="textMain">{`#${record.id}`}</FText>
            </div>
          )
        },
        [slotList[6].criteria]: ({ record } = {}) => {
          return (
            <FText appearance="bodyReg14">
              {this.getRecordData(record, 'assetCategory.displayName') ||
                this.$t('summary.space', { ns: 'rule' })}
            </FText>
          )
        },

        [slotList[7].criteria]: ({ record } = {}) => {
          return (
            <FText appearance="bodyReg14">
              {this.getRecordData(record, 'readingFieldName')}
            </FText>
          )
        },
        [slotList[8].criteria]: ({ record } = {}) => {
          return (
            <FText appearance="bodyReg14">
              {this.getRecordData(record, 'readingModuleName')}
            </FText>
          )
        },

        [slotList[9].name]: ({ record } = {}) => {
          return this.systemCustomButtons(record)
        },
      }
    },
  },
}
</script>
