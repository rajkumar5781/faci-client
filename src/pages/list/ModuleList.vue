<script lang="jsx">
import {
  FContainer,
  FButton,
  FText,
  FDivider,
  FSpinner,
  FInput,
  FSidebar,
  FBulkToolbar,
  FEmptyState,
  FTooltip,
  FIcon,
  FShimmer,
} from '@facilio/design-system'
import Pagination from './Pagination.vue'
import CommonLayout from './views/CommonLayout.vue'
import ListMixin from './data/ListMixin.vue'
import { isEmpty, isObject } from '@facilio/utils/validation'
import { CommonList } from '@facilio/ui/new-app'
import AdvancedSearch from '../../components/search/AdvancedSearch.vue'
import ColumnCustomization from './views/ColumnCustomization.vue'
import ExportSetting from './ExportSetting.vue'
import CustomButton from '../../components/custom-button/CustomButton.vue'
import { POSITION_TYPE } from '../../components/custom-button/CustomButtonUtil.js'
import { getBaseURL } from '../../utils/api/base-url.js'
import CalendarView from './views/CalendarView.vue'
import VisualType from './views/VisualType.vue'
import TimelineView from './views/TimelineView.vue'
import keyBy from 'lodash/keyBy'
import dlv from 'dlv'
import ButtonWrapper from '../../pages/summary/components/ButtonWrapper.vue'
import { getTimeZone } from '../../utils/formatter'
import SystemAndCustomButton from '../../components/SystemAndCustomButton/SystemAndCustomButton.vue'

export default {
  name: 'ModuleList',
  mixins: [ListMixin],
  props: ['moduleName'],
  components: { ButtonWrapper, SystemAndCustomButton },
  data() {
    return {
      selectType: 'bulk',
    }
  },
  computed: {
    hideIdColumn() {
      return false
    },
    idSlotValue() {
      return 'id'
    },
    recordsList() {
      return this.records
    },
    currentLayoutView() {
      if (this.showListView) return 'list'
      else if (!this.showLoading && this.showType) return 'calendar'
    },
    modifiedViewDetails() {
      return this.viewDetail
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
      ]
    },
    canDefaultOpenSummarySideBar() {
      let moduleList = [
        'workorder',
        'plannedmaintenance',
        'controlAction',
        'controlActionTemplate',
        'budget',
      ]
      return !moduleList.includes(this.moduleName)
    },
    getPageCount() {
      let { recordCount, currentPageCount, filterObj } = this
      if (!isEmpty(currentPageCount) && recordCount > 1) {
        let { fromCount, toCount } = this
        return `${fromCount + '-' + toCount} ${this.$t(
          'of',
          'of'
        )} ${recordCount} ${this.$t('records', 'Records')}`
      } else if (recordCount == 1) {
        return `${recordCount} ${this.$t('record', 'Record')}`
      } else if (!isEmpty(filterObj)) {
        return this.$t('no_records', 'No records')
      }
      return ''
    },
  },
  methods: {
    onToggleQuickSearch() {
      this.showQuickSearch = !this.showQuickSearch
      this.updateQuickSearch(this.showQuickSearch)
    },
    updateQuickSearch(value) {
      let { filterObj } = this
      if (!value && !isEmpty(filterObj)) {
        this.isLoading = true
        this.setFilters({})
      }
    },
    getFieldName(record) {
      let mainField = record[this.mainFieldName]
      if (isObject(mainField)) return mainField?.name
      return mainField
    },
    header() {
      let {
        canHideFilter,
        metaInfo,
        createBtnText,
        moduleName,
        viewname,
        modelDataClass,
        canShowVisualSwitch,
      } = this || {}
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
          {canShowVisualSwitch && (
            <FDivider
              height="16px"
              margin="containerNone containerLarge containerNone containerMedium"
            />
          )}
          {canShowVisualSwitch && (
            <VisualType
              currentView={this.currentLayoutView}
              vOn:onSwitchVisualize={val => (this.canShowListView = val)}
            ></VisualType>
          )}
          {!isEmpty(metaInfo) && this.$access.hasPermission('CREATE') && (
            <FDivider
              height="16px"
              margin="containerNone containerLarge containerNone containerMedium"
            />
          )}
          {!this.metaLoading && this.TopBarSystemButtons()}
        </div>
      )
    },
    TopBarSystemButtons() {
      let { topBarSystemButtonsConfig, listTopSystemBtns } = this
      let availBtns = (listTopSystemBtns['topBar'] || []).map(
        btn => btn.identifier
      )
      let topBar = topBarSystemButtonsConfig.filter(conf =>
        availBtns.includes(conf.identifier)
      )
      return (topBar || []).map(button => {
        return (
          <ButtonWrapper
            attrs={button}
            appearance={button.appearance || 'tertiary'}
            vOn:click={button.action}
            name={this.getSystemBtnDisplayName(button)}
          ></ButtonWrapper>
        )
      })
    },
    tableTopSystemButtons() {
      let { listTopSystemBtns } = this
      return (listTopSystemBtns['tableTop'] || []).map(button => {
        return (
          <FContainer display="flex" alignItems="center">
            <ButtonWrapper
              attrs={button}
              appearance={button.appearance || 'tertiary'}
              name={this.getSystemBtnDisplayName(button)}
              vOn:click={button.action}
            ></ButtonWrapper>
            <FDivider height="14px" margin="containerNone containerMedium" />
          </FContainer>
        )
      })
    },
    viewHeaderSlot() {},
    subHeader() {
      let {
        currentPageCount,
        recordCount,
        records,
        page,
        fromCount,
        toCount,
        getPageCount,
        perPage,
        showListView,
        listTopSystemBtns,
        filterObj,
        viewHeaderSlot,
        customizationCountText,
        customizableData,
      } = this || {}
      let exportBtn = dlv(listTopSystemBtns, 'exports', {})
      let { options = [] } = exportBtn
      let exportBtnCopy = {
        ...exportBtn,
        options: options.map(btn => {
          return { ...btn, name: this.getSystemBtnDisplayName(btn) }
        }),
      }
      return (
        <div>
          {showListView && (
            <FContainer
              padding={'containerLarge containerXLarge'}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={!isEmpty(records) ? '1px solid' : ''}
              borderColor={!isEmpty(records) ? 'borderNeutralBaseSubtler' : ''}
            >
              <FContainer
                flexDirection="row"
                display="flex"
                alignItems="center"
                gap="containerLarge"
              >
                {viewHeaderSlot()}
                <FText color="textMain" appearance="headingMed14">
                  {getPageCount}
                </FText>

                {!isEmpty(customizableData) &&
                  this.hasEditAccess &&
                  this.applyModifications()}
              </FContainer>
              <FContainer display="flex">
                {(!isEmpty(records) ||
                  !isEmpty(filterObj) ||
                  this.showQuickSearch) &&
                  showListView && (
                    <div class="flex items-center">
                      {((!isEmpty(recordCount) && recordCount > perPage) ||
                        page != 1) && (
                        <Pagination
                          totalCount={recordCount}
                          currentPageCount={this.currentPageCount}
                          perPage={perPage}
                        />
                      )}
                      <FDivider
                        height="14px"
                        margin="containerNone containerMedium"
                      />
                      {this.isColumnCustomizable && (
                        <FContainer display="flex" alignItems="center">
                          <ColumnCustomization
                            moduleName={this.moduleName}
                            viewName={this.viewname}
                            viewFields={this.viewDetailFields}
                            fitToScreen={this.canScrollToTop}
                          />
                          <FDivider
                            height="14px"
                            margin="containerNone containerMedium"
                          />
                        </FContainer>
                      )}
                      {!this.isEmpty(options) && (
                        <ExportSetting
                          moduleName={this.moduleName}
                          viewDetails={this.modifiedViewDetails}
                          filters={this.filters}
                          exportOptions={exportBtnCopy}
                        />
                      )}
                      <FDivider
                        display="flex"
                        alignItems="center"
                        height="14px"
                        margin="containerNone containerMedium"
                      />
                      {
                        <FTooltip placement="topLeft" open-delay="200">
                          <template slot="title">
                            <FText>
                              {this.$t('list.column_search', 'Column Search')}
                            </FText>
                          </template>
                          <FIcon
                            group="files"
                            name="search-file"
                            size="18"
                            pressable={true}
                            vOn:click={this.onToggleQuickSearch}
                            class={
                              this.showQuickSearch && 'active-icon-quick-search'
                            }
                          />
                        </FTooltip>
                      }
                    </div>
                  )}
                {this.tableTopSystemButtons()}
              </FContainer>
            </FContainer>
          )}
        </div>
      )
    },
    applyModifications() {
      let { customizationCountText, modificationChanges } = this
      return (
        <FContainer display="flex" alignItems="center" gap="containerXLarge">
          <FDivider height="14px" margin="containerNone containerMedium" />
          <FContainer display="flex" alignItems="center" gap="containerMedium">
            <FTooltip placement="bottomLeft">
              <template slot="title">
                {(modificationChanges || []).map(changes => {
                  return (
                    <FContainer tag="li">
                      <FText> • {changes} </FText>
                    </FContainer>
                  )
                })}
              </template>
              <FIcon
                group="alert"
                name="circle-warning-filled"
                size="16"
                pressable={false}
              ></FIcon>
            </FTooltip>
            <FText appearance="headingMed14" color="textMain">
              {this.$t('custommodules.list.made_changes', {
                value: customizationCountText,
              })}
            </FText>
          </FContainer>
          <FButton
            appearance="secondary"
            iconGroup="alert"
            iconName="circle-clear-all-filled"
            iconPosition="prefix"
            vOn:click={this.resetModification}
          >
            {this.$t('custommodules.list.discard')}
          </FButton>
          <FButton
            id="saveChanges"
            appearance="primary"
            loading={this.modificationLoading}
            vOn:click={this.saveColumnModification}
            class="modify-save-btn"
          >
            <FIcon
              group="alert"
              name="circle-tick-filled"
              size="16"
              pressable={false}
              color="currentColor"
              marginLeft={this.modificationLoading ? 'containerLarge' : ''}
              marginRight="containerLarge"
              style={{ visibility: 'visible' }}
            ></FIcon>
            {this.$t('custommodules.list.save_changes')}
          </FButton>
        </FContainer>
      )
    },
    body() {
      let {
        showLoading,
        viewname,
        records,
        filterObj,
        showMask,
        showQuickSearch,
      } = this || {}
      return (
        <FContainer flexGrow="1" overflow="hidden">
          {showLoading && !showMask ? (
            <FContainer
              height="calc(100vh - 210px)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FSpinner size={30} />
            </FContainer>
          ) : isEmpty(viewname) ? (
            this.viewEmptyState()
          ) : (
            [
              (!isEmpty(records) || !isEmpty(filterObj) || showQuickSearch) &&
                this.moduleTable(),
              isEmpty(records) && this.recordEmptyState(),
            ]
          )}
        </FContainer>
      )
    },
    viewEmptyState() {
      let { showSideBarSummary } = this
      return (
        <div>
          <FContainer
            height="calc(100vh - 210px)"
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <FEmptyState
              description={this.$t(
                'list.no_view_configured',
                'No View Configured'
              )}
              vertical={true}
              {...{
                scopedSlots: {
                  buttons: () => {
                    return showSideBarSummary ? (
                      <FButton vOn:click={this.openViewCreation}>
                        <FText>{this.$t('list.add_view', 'Add View')}</FText>
                      </FButton>
                    ) : null
                  },
                },
              }}
            ></FEmptyState>
          </FContainer>
          <div class="mB20"></div>
        </div>
      )
    },
    recordEmptyState() {
      let { emptyStateMsg } = this || {}
      return (
        <FContainer
          height="calc(100vh - 210px)"
          width="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <FEmptyState
            title={emptyStateMsg.title}
            description={emptyStateMsg.description}
            vertical={true}
          />
        </FContainer>
      )
    },
    maskLoading() {
      let { currentPageCount, records } = this
      return (
        <FContainer
          position="absolute"
          z-index="2000"
          backgroundColor="backgroundContainer"
          alignItems="center"
          justifyContent="center"
          display="flex"
          opacity=".7"
          margin="containerNone"
          top="0"
          right="0"
          bottom="0"
          left="0"
          height={
            currentPageCount > 10 || isEmpty(records)
              ? 'calc(100vh - 210px)'
              : ''
          }
        >
          {' '}
          <FSpinner size={30} />
        </FContainer>
      )
    },
    moduleTable() {
      let { currentPageCount, slotsContent } = this || {}
      return (
        <FContainer position="relative" height="100%">
          {' '}
          <CommonList
            ref="common-list"
            viewDetail={this.modifiedViewDetails}
            records={this.records}
            slotList={this.slotList}
            hideBorder={true}
            showSelectBar={false}
            hideIdColumn={this.hideIdColumn}
            getRoute={this.getRoute}
            sites={this.sites}
            moduleName={this.moduleName}
            idSlotValue={this.idSlotValue}
            resizeColumn={true}
            customWidth={this.alteredWidthObj}
            customAlignment={this.alteredAlignObj}
            style={{
              height: `${currentPageCount > 10 ? '100%' : ''}`,
              overflow: 'scroll',
            }}
            orgDetails={this.$account.org}
            mainFieldAction={this.mainFieldAction}
            account={this.$account}
            baseUrl={getBaseURL()}
            vOn:recordSelected={this.selectItems}
            {...{
              scopedSlots: slotsContent(),
            }}
            actionColumnWidth="120"
            selectType={this.selectType}
            sortableFields={this.sortableFields}
            filterableFields={this.filterableFields}
            hasEditPermission={this.hasEditAccess}
            vOn:sortUpdate={this.loadSortedList}
            vOn:onQuickSearch={this.setFilters}
            vOn:redirectToSummary={this.redirectToSummary}
            getTimeZone={getTimeZone}
            vOn:onColumnResize={this.onChangeColumnwidth}
            vOn:onAlignmentUpdate={this.onAlignmentUpdate}
            showQuickSearch={this.showQuickSearch}
          ></CommonList>
          {this.showMask && this.maskLoading()}
        </FContainer>
      )
    },
    calendarContent() {
      let { calendarView = false, timelineView = false } = this.viewDetail || {}
      return timelineView ? (
        <TimelineView
          moduleName={this.moduleName}
          metaInfo={this.metaInfo}
          record={this.records}
          timelineViewDetail={this.viewDetail}
          viewname={this.viewname}
          filters={this.filters}
        ></TimelineView>
      ) : calendarView ? (
        <CalendarView
          ref="calendar"
          moduleName={this.moduleName}
          metaInfo={this.metaInfo}
          record={this.records}
          viewDetail={this.viewDetail}
          viewname={this.viewname}
          filters={this.filters}
        ></CalendarView>
      ) : (
        {}
      )
    },
    bodyContainer() {
      let { showListView, showType } = this
      return !showListView && showType && this.calendarContent()
    },
    systemCustomButtons(record) {
      let { recordSystemButtonsConfig } = this

      return (
        <SystemAndCustomButton
          key={`${this.moduleName}_${record.id}_${POSITION_TYPE.LIST_ITEM}`}
          moduleName={this.moduleName}
          position={POSITION_TYPE.LIST_ITEM}
          record={record}
          recordSystemButtonsConfig={recordSystemButtonsConfig}
          listModelDataClass={this.modelDataClass}
          vOn:onSuccess={this.refreshRecordDetails}
          vOn:onError={() => {}}
        ></SystemAndCustomButton>
      )
    },
    slotsContent() {
      let { slotList } = this || {}
      return {
        [slotList[0].name]: ({ record } = {}) => {
          return this.systemCustomButtons(record)
        },
      }
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
                      <fc-icon group="action" name="search" size="16"></fc-icon>
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
                    hover-backgroundColor="backgroundNeutralHovered"
                    backgroundColor={
                      selectedRecordId === record.id
                        ? 'backgroundNeutralHovered'
                        : ''
                    }
                    padding="containerXLarge"
                    marginTop="containerSmall"
                    marginBottom="containerSmall"
                    borderRadius="medium"
                    cursor="pointer"
                    overflow="hidden"
                    vOn:click={() => this.redirectToOverview(record)}
                  >
                    <FText
                      appearance={
                        selectedRecordId == record.id
                          ? 'headingMed14'
                          : 'bodyReg14'
                      }
                      color="textMain"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      display="block"
                    >
                      {this.getFieldName(record)}
                    </FText>
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
    bulkActionButtons() {
      let { bulkSystemButtonsConfig } = this
      let systemButtonConfig = keyBy(bulkSystemButtonsConfig, 'identifier')

      return (this.bulkSystemButtons || []).map(buttonIdentifier => {
        let buttonConfig = systemButtonConfig[buttonIdentifier] || {}

        return (
          !isEmpty(buttonConfig) && (
            <ButtonWrapper
              appearance={buttonConfig.appearance || 'tertiary'}
              attrs={buttonConfig}
              maxWidth="112px"
              name={this.getSystemBtnDisplayName(buttonConfig)}
              vOn:click={() => buttonConfig.action(this.selectedListItemsIds)}
            ></ButtonWrapper>
          )
        )
      })
    },
    onCustomButtonSuccess() {
      this.loadDebouncedRecords(false)
      this.selectedListItemsIds = []
    },
    defaultSpace() {},
  },
  render() {
    let { selectedListItemsIds, viewname, showSideBarSummary } = this || {}
    let { length: selectedLength } = selectedListItemsIds || []
    return (
      <FContainer display="flex" height="100%" position="relative" width="100%">
        {this.isSummaryOpen ? (
          !showSideBarSummary ? (
            <FContainer width="100%">
              <router-view></router-view>
            </FContainer>
          ) : (
            <FSidebar
              sidebarWidth={280}
              toggleText={this.viewDetail.displayName}
              title={this.viewDetail.displayName}
              defaultOpen={this.canDefaultOpenSummarySideBar}
              {...{
                scopedSlots: {
                  sidebar: () => {
                    return this.sidebar()
                  },
                  content: () => {
                    return <router-view></router-view>
                  },
                },
              }}
            ></FSidebar>
          )
        ) : (
          <CommonLayout
            moduleName={this.moduleName}
            getPageTitle={() => 'List'}
            withTabs={false}
            {...{
              scopedSlots: {
                header: () => {
                  return this.header()
                },
                ['body-content']: () => {
                  if (!this.showListView && viewname)
                    return this.bodyContainer()
                },
                ['sub-header']: () => {
                  return this.subHeader()
                },
              },
            }}
          >
            {this.body()}
          </CommonLayout>
        )}
        <FContainer
          position="absolute"
          bottom="90px"
          display="flex"
          justifyContent="center"
          width="100%"
        >
          <FBulkToolbar
            recordCount={selectedLength}
            vOn:close={this.unselectAll}
            animate={true}
          >
            {this.bulkSysButtonLoading ? (
              <FShimmer height={32} width={100} />
            ) : (
              <FContainer display="flex" columnGap="containerLarge">
                {this.bulkActionButtons()}
                <CustomButton
                  key={`${this.moduleName}_${this.viewname}_${POSITION_TYPE.LIST_BULK}`}
                  moduleName={this.moduleName}
                  position={POSITION_TYPE.LIST_BULK}
                  selectedRecords={this.selectedListItemsObj}
                  modelDataClass={this.modelDataClass}
                  vOn:onSuccess={this.onCustomButtonSuccess}
                  vOn:onError={() => {}}
                ></CustomButton>
              </FContainer>
            )}
          </FBulkToolbar>
        </FContainer>
        {this.defaultSpace()}
      </FContainer>
    )
  },
}
</script>
<style>
.sidebar-content-collapse .empty-scroll-box {
  display: block;
  height: 36px;
}
.sidebar-content-open .empty-scroll-box {
  display: none;
}
.active-icon-quick-search {
  background-color: var(--colors-backgroundNeutralPressed);
}
</style>
