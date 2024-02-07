<script lang="jsx">
import { isEmpty, isFunction } from '@facilio/utils/validation'
import AdvancedSearch from '/src/components/search/AdvancedSearch.vue'
import { POSITION_TYPE } from '../../../../components/custom-button/CustomButtonUtil.js'
import FetchViewsMixin from '../../../../components/views/FetchViews.vue'
import { CustomModuleData } from '../../../../data/CustomModuleData'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { API } from '@facilio/api'
import getProperty from 'dlv'
import { getUnRelatedModuleList } from '/src/utils/relatedFieldUtil.js'

import {
  FContainer,
  FText,
  FIcon,
  FTable,
  FModal,
  FButton,
  FSelect,
  ftoast,
  FSpinner,
  FForm,
  FFormItem,
  FEmptyState,
  FPagination,
  FInput,
} from '@facilio/design-system'

export default {
  name: 'InventoryRelatedList',
  props: ['details', 'widget', 'fitMyContent'],
  mixins: [FetchViewsMixin],

  components: {
    FText,
    FContainer,
    FIcon,
    FTable,
    FModal,
    FButton,
    FSelect,
    FSpinner,
    FForm,
    FFormItem,
    FEmptyState,
    FPagination,
    FInput,
    AdvancedSearch,
  },
  data() {
    return {
      loading: false,
      recordList: [],
      perPage: 5,
      totalCount: 0,
      page: 1,
      disabled: false,
      POSITION: POSITION_TYPE,
      appliedFilter: {},
      systemButtonLoading: false,
      columns: [],
      systemBtnList: [],
      routeName: null,
    }
  },
  created() {
    this.init()
  },
  computed: {
    emptyStateMsg() {
      return `No Records Associated`
    },
    canShowHeaderSlot() {
      let { headerButtonsList, canShowAdvancedSearch } = this
      return !isEmpty(headerButtonsList) || canShowAdvancedSearch
    },
    modelDataClass() {
      return CustomModuleData
    },
    defaultFilter() {
      return {}
    },
    canShowPagination() {
      return !this.isEmpty(this.recordList)
    },
    canRedirectToSummary() {
      let { routeName } = this
      return !isEmpty(routeName)
    },
    canShowAdvancedSearch() {
      return true
    },
    headerButtonsList() {
      return []
    },
  },
  methods: {
    isEmpty,
    async init() {
      this.loading = true
      await this.loadRecords()
      this.routeName = await this.fetchRouteName()
      await this.loadSystemButtons()
      this.loading = false
    },
    async loadSystemButtons(force = false) {
      try {
        let { details = {}, POSITION } = this
        let { id, moduleName } = details

        let params = { moduleName, position: POSITION.SUMMARY, force }
        this.systemBtnList =
          await this.modelDataClass.loadSystemButtonsForRecord({
            ...params,
            id,
          })
      } catch (error) {
        ftoast.critical(error?.message || 'Unable to fetch system buttons')
      }
    },
    fetchRouteName() {
      let { moduleName } = this
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
      return name
    },

    getActiveSystemButtons(buttonList = []) {
      let { systemBtnList = [] } = this

      return buttonList.filter(button => {
        let existingBtn = systemBtnList.find(
          sysBtn => sysBtn.identifier === button.identifier
        )
        return !isEmpty(existingBtn)
      })
    },
    async redirectToOverview(record = {}) {
      let { moduleName, routeName, $route } = this
      if (isEmpty(routeName)) {
        return
      }
      let { id } = record
      if (isEmpty(id)) {
        return
      }
      let viewname = await this.fetchView(moduleName)
      if (isEmpty(viewname)) {
        return
      }
      let { query } = $route
      let route = { name: routeName, params: { viewname, id }, query }
      this.$router.push(route)
    },

    table() {
      return (
        <FContainer overflow="scroll">
          <FTable
            columns={this.columns}
            data={this.recordList}
            rounded={false}
            hideBorder={false}
            {...{
              scopedSlots: {
                ['cell.name']: prop => {
                  let { row } = prop
                  let { name } = row
                  return this.canRedirectToSummary ? (
                    <FButton
                      appearance="link"
                      vOn:click={() => this.redirectToOverview(row)}
                    >
                      {name}
                    </FButton>
                  ) : (
                    name
                  )
                },
              },
            }}
          ></FTable>
        </FContainer>
      )
    },

    async loadRecords(force = false) {
      let {
        moduleName: unRelatedModuleName,
        details = {},
        page,
        perPage,
        defaultFilter,
        appliedFilter,
        modifyRecordsAfterFetch = {},
      } = this
      let { moduleName } = details
      let filters = { ...defaultFilter, ...appliedFilter }
      let params = {
        filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
        withCount: true,
        page,
        perPage,
        force,
      }
      let { error, list, meta } = await getUnRelatedModuleList(
        moduleName,
        unRelatedModuleName,
        params
      )

      this.totalCount = getProperty(meta, 'pagination.totalCount', null)

      if (error) {
        ftoast.critical(error || 'Error Occured')
      } else {
        if (isFunction(modifyRecordsAfterFetch)) {
          list = list.map(record => modifyRecordsAfterFetch(record))
        }
        this.recordList = list
      }
    },

    currentChange(page) {
      this.page = page
      this.loadRecords()
    },
    setAppliedfilter({ filters }) {
      this.appliedFilter = filters || {}
      this.loadRecords()
    },

    advancedSearch() {
      let { canShowAdvancedSearch, moduleName } = this
      if (canShowAdvancedSearch) {
        return (
          <AdvancedSearch
            key={`filter-${moduleName}`}
            moduleName={moduleName}
            moduleDisplayName={moduleName}
            hideQuery="true"
            onSave={this.setAppliedfilter}
            filterList={this.appliedFilter}
          >
            <template slot="icon">
              <FIcon group="default" name="filter-outline" size="16"></FIcon>
            </template>
          </AdvancedSearch>
        )
      }
    },
    headerButtons() {
      let { headerButtonsList } = this

      let sysBtnList = this.getActiveSystemButtons(headerButtonsList)

      if (!isEmpty(sysBtnList)) {
        return (
          <FContainer display="flex">
            {sysBtnList.map(button => {
              return (
                <FContainer marginLeft="containerLarge">
                  <FButton
                    appearance="secondary"
                    size="small"
                    iconGroup={button.iconGroup}
                    iconName={button.iconName}
                    iconPosition="prefix"
                    v-on:click={button.clickAction}
                  >
                    {button.name}
                  </FButton>
                </FContainer>
              )
            })}
          </FContainer>
        )
      }
    },

    defaultSpace() {},
  },
  render() {
    return (
      <FContainer>
        {this.canShowHeaderSlot && (
          <FContainer
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <portal to={`action-${this.widget.id}-${this.widget.name}`}>
              {this.headerButtons()}
              {this.advancedSearch()}
            </portal>
          </FContainer>
        )}

        {this.loading ? (
          <FContainer
            display="flex"
            justifyContent="center"
            alignItems="center"
            padding="sectionLarge"
            width="100%"
            height="100%"
          >
            <FSpinner size={30} />
          </FContainer>
        ) : this.isEmpty(this.recordList) ? (
          <FContainer
            paddingTop="containerXLarge"
            display="flex"
            justifyContent="center"
            height="100%"
          >
            <FEmptyState
              illustration={'add-item'}
              title={this.emptyStateMsg}
              vertical={true}
              size={'M'}
            ></FEmptyState>
          </FContainer>
        ) : (
          <FContainer
            display="flex"
            flexDirection="column"
            height="100%"
            justifyContent="space-between"
          >
            {this.table()}
          </FContainer>
        )}

        {this.canShowPagination && (
          <portal to={`footer-${this.widget.id}-${this.widget.name}`}>
            <FContainer padding="containerLarge">
              <FPagination
                currentPage={this.page}
                total={this.totalCount}
                perPage={this.perPage}
                v-on:nextClick={this.currentChange}
                v-on:prevClick={this.currentChange}
                v-on:currentChange={this.currentChange}
              ></FPagination>
            </FContainer>
          </portal>
        )}
        {this.defaultSpace()}
      </FContainer>
    )
  },
}
</script>
