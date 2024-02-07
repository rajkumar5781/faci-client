<script lang="jsx">
import ModuleList from '../../list/ModuleList.vue'
import NewAlarmMixin from './mixins/NewAlarmMixin'
import AlarmModel from './AlarmModel.vue'
import cloneDeep from 'lodash/cloneDeep'
import { isEmpty } from '@facilio/utils/validation'
import AdvancedSearch from '../../../components/search/AdvancedSearch.vue'
import Pagination from '../../list/Pagination.vue'
import CustomButton from '../../../components/custom-button/CustomButton.vue'
import { POSITION_TYPE } from '../../../components/custom-button/CustomButtonUtil'
import {
  FContainer,
  FText,
  FTags,
  FInput,
  FIcon,
  FSpinner,
  FTooltip,
} from '@facilio/design-system'
export default {
  extends: ModuleList,
  name: 'CommonAlarmList',
  mixins: [NewAlarmMixin],
  components: {
    FContainer,
    FTags,
    FText,
    AlarmModel,
    FInput,
    FIcon,
    FSpinner,
    FTooltip,
  },
  computed: {
    hideIdColumn() {
      return true
    },
    mainFieldName() {
      return 'subject'
    },
    modifiedViewDetails() {
      let { viewDetail } = this
      let clonedViewDetail = cloneDeep(viewDetail)
      let { fields } = clonedViewDetail
      if (!isEmpty(fields)) {
        clonedViewDetail.fields = fields.filter(
          field => field.fieldName !== 'severity'
        )
      }
      return clonedViewDetail
    },
  },
  methods: {
    getRecordData(record, property) {
      return record[property] ? record[property] : '--'
    },
    async confirmWoModel() {
      this.dialogVisible = false
      await this.refreshRecordDetails()
    },
    getDropdownOptions(record) {
      let option = [
        {
          label: this.isWoCreated(record)
            ? this.$t('alarm.view_workorder', 'View WorkOrder', { ns: 'alarm' })
            : this.$t('alarm.create_workorder', 'Create WorkOrder', {
                ns: 'alarm ',
              }),
          value: 'createWo',
          record,
        },
      ]
      if (this.$access.hasPermission('DELETE')) {
        option.push({
          label: 'Delete',
          value: 'delete',
          record,
        })
      }
      return option
    },
    handleDropdown(command) {
      let { value, record } = command
      let { id, lastOccurrenceId, lastWoId } = record || {}
      if (value === 'createWo') {
        lastWoId > 0
          ? this.openWorkorder(lastWoId)
          : this.createWoDialog(lastOccurrenceId)
      } else {
        this.deleteRecords([id])
      }
    },
    defaultSpace() {
      return (
        <AlarmModel
          modalVisible={this.dialogVisible}
          woIds={this.createWoIds}
          moduleName={this.moduleName}
          vOn:confirmWoModel={this.confirmWoModel}
          vOn:closeWoDialog={this.closeWoDialog}
        />
      )
    },
    sidebar() {
      let {
        recordCount,
        perPage,
        currentPageCount,
        records,
        selectedRecordId,
      } = this || {}
      return (
        <FContainer
          display="flex"
          flexDirection="column"
          flex="1"
          width="100%"
          height="100%"
        >
          <FContainer
            padding="containerLarge containerXLarge"
            borderBottom="solid 0.5px"
            borderColor="borderNeutralBaseSubtle"
          >
            <FInput
              placeholder="Search"
              v-model={this.searchText}
              {...{
                scopedSlots: {
                  prefix: () => {
                    return (
                      <FIcon group="action" name="search" size="16"></FIcon>
                    )
                  },
                },
              }}
            ></FInput>
          </FContainer>

          <FContainer
            flex="1 0 0"
            padding="containerLarge containerXLarge"
            overflow="scroll"
          >
            {this.showLoading ? (
              <div class="h-full flex items-center justify-center">
                <FSpinner size={30} />
              </div>
            ) : (
              records.map(record => {
                return (
                  <FContainer
                    key={record.id}
                    display="flex"
                    flexDirection="column"
                    hover-backgroundColor="backgroundNeutralPressed"
                    backgroundColor={
                      selectedRecordId === record.id
                        ? 'backgroundNeutralPressed'
                        : ''
                    }
                    padding="containerXLarge containerXLarge"
                    margin="containerSmall containerLarge"
                    borderRadius="medium"
                    cursor="pointer"
                    vOn:click={() => this.redirectToOverview(record.id)}
                  >
                    <FContainer
                      display="flex"
                      columnGap="containerLarge"
                      justifyContent="space-between"
                      paddingBottom="containerMedium"
                    >
                      <FTooltip placement="bottomLeft" mouseEnterDelay={1}>
                        <FText
                          slot="title"
                          appearance="bodyReg14"
                          color="backgroundCanvas"
                        >
                          {record[this.mainFieldName]}
                        </FText>
                        <FText
                          width="160px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          appearance={
                            selectedRecordId === record.id
                              ? 'headingMed14'
                              : 'bodyReg14'
                          }
                        >
                          {record[this.mainFieldName] || '---'}
                        </FText>
                      </FTooltip>
                      <FTags
                        paddingLeft="containerLarge"
                        appearance="accent"
                        text={this.getAlarmDisplayName(record)}
                        accentColor={this.getAccentColor(record)}
                        accentLevel={this.getAccentLevel(record)}
                      />
                    </FContainer>
                    <FContainer display="flex">
                      <FIcon
                        group="webtabs"
                        name="asset"
                        size="16"
                        pressable={false}
                        color="textCaption"
                      />
                      <FText
                        appearance="bodyReg14"
                        color="textCaption"
                        paddingLeft="containerMedium"
                      >
                        {this.getResourceNameForAlarm(record)}
                      </FText>
                    </FContainer>
                  </FContainer>
                )
              })
            )}
          </FContainer>

          <FContainer
            borderTop="solid 0.5px"
            borderColor="borderNeutralBaseSubtle"
            padding="containerLarge"
            width="100%"
          >
            {!isEmpty(recordCount) && (
              <Pagination
                totalCount={recordCount}
                currentPageCount={currentPageCount}
                perPage={perPage}
              />
            )}
          </FContainer>
        </FContainer>
      )
    },
    header() {
      let { canHideFilter, moduleName, viewname, modelDataClass } = this || {}
      return (
        <div class="flex items-center">
          {viewname && (
            <CustomButton
              key={`${moduleName}_${viewname}_${POSITION_TYPE.LIST_TOP}`}
              moduleName={moduleName}
              position={POSITION_TYPE.LIST_TOP}
              modelDataClass={modelDataClass}
              vOn:onSuccess={this.onCustomButtonSuccess}
              vOn:onError={() => {}}
            ></CustomButton>
          )}
          {!canHideFilter && (
            <AdvancedSearch
              filters={this.filters}
              moduleName={this.moduleName}
              moduleDisplayName={this.moduleDisplayName}
            ></AdvancedSearch>
          )}
        </div>
      )
    },
  },
}
</script>
