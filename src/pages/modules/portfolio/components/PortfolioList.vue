<script lang="jsx">
import ModuleList from '../../../list/ModuleList.vue'
import CommonLayout from './PortfolioCommonLayout.vue'
import ColumnCustomization from '../../../list/views/ColumnCustomization.vue'
import {
  FContainer,
  FText,
  FDivider,
  FTooltip,
  FIcon,
  fDialog,
  FButton,
  FSpinner,
  ftoast,
} from '@facilio/design-system'
import FMapWidget from './FMapWidget.vue'
import { isEmpty } from '@facilio/utils/validation'
import ExportSetting from '../../../list/ExportSetting.vue'
import { mapActions } from 'pinia'
import Pagination from '../../../list/Pagination.vue'
import { findRouteForTab, pageTypes } from '@facilio/router'
import { CommonList } from '@facilio/ui/new-app'
import viewStore from '../../../../store/views'
import CustomButton from '../../../../components/custom-button/CustomButton.vue'
import AdvancedSearch from '../../../../components/search/AdvancedSearch.vue'
import VisualType from '../../../list/views/VisualType.vue'
import { POSITION_TYPE } from '../../../../components/custom-button/CustomButtonUtil'
import PortfolioSearch from './PortfolioSearch.vue'
import PortfolioMap from './PortfolioMap.vue'
import isEqual from 'lodash/isEqual'
import portfolioMixin from '../portfolioMixin.vue'
import debounce from 'lodash/debounce'
import getProperty from 'dlv'
import { API } from '@facilio/api/dist/index.mjs'
import SpaceRelationDialog from '../widgets/SpaceRelationDialog.vue'

export default {
  extends: ModuleList,
  mixins: portfolioMixin,
  props: ['tab'],
  components: {
    CommonLayout,
    VisualType,
    PortfolioSearch,
    ColumnCustomization,
    FContainer,
    PortfolioMap,
    SpaceRelationDialog,
    ExportSetting,
    fDialog,
    FSpinner,
    FText,
    Pagination,
    FTooltip,
    FDivider,
    FIcon,
    CommonList,
    FButton,
    CustomButton,
    AdvancedSearch,
    FMapWidget,
    ftoast,
  },
  data() {
    return {
      showSearchComponent: false,
      mapData: [],
      siteList: [],
      isEqual,
      errorMap: null,
      errorType: null,
      getProperty,
      showMapFilter: false,
      selectType: null,
      canScrollToTop: true,
      showDeleteDialog: false,
      deletingRecordId: null,
    }
  },
  computed: {
    routeName() {
      let { name = null } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      return name
    },
    canShowFilter() {
      let { showMapFilter = false } = this
      return showMapFilter
    },
    mainFieldAction() {
      return this.routeName ? this.mainFieldRedirection : null
    },
    isListView() {
      let { $route: { params: { viewname } = {} } = {} } = this || {}
      if (viewname == 'mapView') {
        return false
      }
      return true
    },
    viewFields() {
      return this.viewDetail?.fields || []
    },
    searchDialog() {
      return this.showSearchComponent
    },
    slotList() {
      let slotList = [
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
      return slotList
    },
  },
  methods: {
    ...mapActions(viewStore, ['clearViews']),
    showMapView(value) {
      if (value == this.isListView) {
        let query = getProperty(this, '$route.query', null)
        let params = null
        if (this.isListView != false) {
          params = {
            viewname: 'mapView',
          }
        } else {
          params = {
            viewname: null,
          }
          this.showMapFilter = false
        }
        if (!this.isListView) {
          this.clearViews()
          this.resetData()
          this.init()
          this.refreshRecordDetails()
        }
        this.$router.push({ params, query })
      }
    },
    header() {
      let {
        canHideFilter,
        canShowFilter,
        metaInfo,
        createBtnText,
        moduleName,
        viewname,
        modelDataClass,
        canShowVisualSwitch,
        isListView,
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
          <FContainer display="flex" gap="containerLarge">
            <FContainer>
              <FTooltip placement="top">
                <template slot="title"> Search</template>
                <FIcon
                  group="action"
                  name="search"
                  size="16"
                  vOn:click={this.showSearchDialog}
                ></FIcon>
              </FTooltip>
            </FContainer>
            <FContainer>
              <FTooltip placement="top">
                <template slot="title"> Map View</template>
                <FContainer
                  backgroundColor={
                    !isListView ? `backgroundNeutralHovered` : ``
                  }
                  borderRadius="medium"
                >
                  <FIcon
                    group="map-travel"
                    name="map-setting"
                    size="16"
                    color="#7B91B0"
                    vOn:click={() => this.showMapView(true)}
                  ></FIcon>
                </FContainer>
              </FTooltip>
            </FContainer>
            <FContainer>
              <FTooltip placement="top">
                <template slot="title">List View</template>
                <FContainer
                  backgroundColor={isListView ? `backgroundNeutralHovered` : ``}
                  borderRadius="medium"
                >
                  <FIcon
                    group="action"
                    name="medium-priority"
                    size="16"
                    pressable={true}
                    vOn:click={() => this.showMapView(false)}
                  ></FIcon>
                </FContainer>
              </FTooltip>
            </FContainer>
          </FContainer>
          {
            <FDivider
              height="16px"
              margin="containerNone containerLarge containerNone containerMedium"
            />
          }
          {canShowVisualSwitch && (
            <VisualType
              currentView={this.currentLayoutView}
              vOn:onSwitchVisualize={val => (this.canShowListView = val)}
            ></VisualType>
          )}
          {canShowVisualSwitch && (
            <FDivider
              height="16px"
              margin="containerNone containerLarge containerNone containerMedium"
            />
          )}
          {(!canHideFilter || canShowFilter) && (
            <AdvancedSearch
              filters={this.filters}
              moduleName={this.moduleName}
              moduleDisplayName={this.moduleDisplayName}
            ></AdvancedSearch>
          )}
          {(!canHideFilter || canShowFilter) && (
            <FDivider
              height="16px"
              margin="containerNone containerLarge containerNone containerMedium"
            />
          )}
          {!isEmpty(metaInfo) && (
            <FButton
              appearance="primary"
              vOn:click={() => this.redirectToFormCreation()}
            >
              <FText
                fontsize="body3"
                fontWeight="medium"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {createBtnText}
              </FText>
            </FButton>
          )}
        </div>
      )
    },
    viewHeaderSlot() {
      return <portal-target name="viewHeaderSection"></portal-target>
    },
    redirectToFormCreation() {
      let { moduleName } = this
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_CREATE) || {}

      name &&
        this.$router.push({
          name,
          params: {
            moduleName,
          },
        })
    },
    showSearchDialog() {
      this.showSearchComponent = !this.showSearchComponent
    },
    tabSection() {
      return <portal-target name="viewheader"></portal-target>
    },
    async closeSearchDialog() {
      this.showSearchComponent = false
    },
    body() {
      let {
        showLoading,
        viewname,
        moduleName,
        records,
        isListView,
        showQuickSearch,
        filterObj,
      } = this || {}
      return (
        <div>
          {!isListView ? (
            <PortfolioMap
              type={'profile'}
              moduleName={moduleName}
              vOn:hasData={value => {
                this.showMapFilter = value
              }}
            ></PortfolioMap>
          ) : showLoading ? (
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
        </div>
      )
    },
    redirectToBuildingSite(siteId) {
      let { viewname, $route } = this
      let { query } = $route

      let { name } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      let route = {
        name,
        params: { moduleName: `site`, viewname, id: siteId },
        query,
      }

      this.$router.push(route)
    },
    getRoute() {
      return findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
    },
    editModule(row) {
      let { moduleName } = this
      let { id } = row
      let { name } = findRouteForTab(pageTypes.PORTFOLIO_EDIT) || {}

      name &&
        this.$router.push({
          name,
          params: { moduleName, id },
        })
    },
    redirectToOverview(record) {
      let { moduleName, viewname, $route } = this
      let { query } = $route
      let id = record?.id || record
      delete query.tabName //to remove preserved tabName from pageBuilder

      let { name } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      let route = {
        name,
        params: { moduleName, viewname, id: id },
        query,
      }

      this.$router.push(route)
    },
    async deleteRecords(idList) {
      let { moduleName, moduleDisplayName } = this
      let id = idList[0]
      let { error } = await API.fetchRecord(
        moduleName,
        {
          id,
          fetchChildCount: true,
        },
        { force: true }
      )

      if (!error) {
        let value = await fDialog.danger({
          title: `Delete ${moduleDisplayName}`,
          description: `Are you sure you want to delete this ${moduleDisplayName}(s) ?`,
          saveText: 'Delete',
        })

        if (value) {
          this.deleteSpace(idList)
        }
      } else {
        this.deletingRecordId = id
        let map = JSON.parse(error.message)
        this.errorMap = map
        this.errorType = error.code
        this.showDeleteDialog = true
      }
    },
    async deleteSpace(idList) {
      let { moduleDisplayName, moduleName } = this
      this.isLoading = true
      try {
        await this.modelDataClass.delete(moduleName, idList)
        ftoast.success(
          `${moduleDisplayName} ${this.$t('custommodules.list.delete_success')}`
        )
        this.showDeleteDialog = false
        await this.refreshRecordDetails(true)
      } catch (error) {
        this.showErrorToastMessage(
          error,
          this.$t('custommodules.list.delete_error')
        )
      }
      this.isLoading = false
    },
  },
  render() {
    let { isListView, moduleName, errorMap, errorType, deletingRecordId } =
      this || {}
    return (
      <FContainer height="100%" position="relative">
        <CommonLayout
          moduleName={moduleName}
          getPageTitle={() => 'List'}
          {...{
            scopedSlots: {
              header: () => {
                return this.header()
              },
              ['sub-header']: () => {
                if (isListView) return this.subHeader()
              },
              viewheader: () => {
                return this.tabSection()
              },
            },
          }}
        >
          {this.body()}
        </CommonLayout>
        {this.searchDialog && (
          <PortfolioSearch vOn:show={this.closeSearchDialog}></PortfolioSearch>
        )}
        {this.showDeleteDialog && (
          <SpaceRelationDialog
            vOn:show={this.showDeleteDialog}
            vOn:delete={deletingRecordId => this.deleteSpace(deletingRecordId)}
            moduleName={moduleName}
            errorMap={errorMap}
            type={errorType}
            id={deletingRecordId}
            vOn:close={() => (this.showDeleteDialog = false)}
          ></SpaceRelationDialog>
        )}
      </FContainer>
    )
  },
}
</script>
