<template>
  <FContainer
    display="flex"
    alignItems="center"
    justifyContent="center"
    position="relative"
    height="100%"
  >
    <FTabs
      v-model="currentTab"
      :tabsList="tabsLists"
      appearance="link"
      padding="containerMedium containerNone"
      :hideBorder="false"
      :lazy="false"
    >
      <FTabPane
        v-for="tab in tabsLists"
        :activeKey="tab.value"
        :key="tab.value"
      >
        <FContainer
          v-if="isLoading"
          height="inherit"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <FSpinner :size="30" />
        </FContainer>

        <FContainer
          v-else-if="isRecordEmpty"
          height="inherit"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FEmptyState
            :title="emptyStateTitle"
            :description="emptyStateDescription"
            illustration="no-entries"
            size="M"
          >
            <template v-if="checkIsOccupiedTab" #buttons>
              <FButton
                activeKey="button"
                appearance="secondary"
                size="small"
                iconGroup="navigation"
                iconName="addition"
                iconPosition="prefix"
                @click="addSpacesDialog"
              >
                <FText appearance="headingMed14">{{
                  $t('associate_unit', 'Add Units', { ns: 'tenant' })
                }}</FText>
              </FButton>
            </template>
          </FEmptyState>
        </FContainer>
        <FContainer v-else display="flex" flexDirection="column" height="100%">
          <CommonList
            :viewDetail="viewDetail"
            :records="records"
            :slotList="slotList"
            :hideBorder="true"
            selectType=""
            :getRoute="getRoute"
            :mainfieldAction="mainFieldAction"
          >
            <template #[slotList[0].criteria]="{ record }">
              <FText>{{ getSpaceType(record) }}</FText>
            </template>
            <template
              #[slotList[1].name]="{ record }"
              v-if="checkIsOccupiedTab"
            >
              <FButton
                appearance="secondary"
                size="small"
                @click="markVacant(record)"
              >
                <FText appearance="headingMed14">{{
                  $t('vacant_tenantunit', 'Vacant', { ns: 'tenant' })
                }}</FText>
              </FButton>
            </template>
          </CommonList>
        </FContainer>
      </FTabPane>
    </FTabs>
    <FContainer position="absolute" top="8px" right="10px">
      <FButton
        v-if="checkIsOccupiedTab && !isRecordEmpty && !isLoading"
        activeKey="button"
        appearance="secondary"
        size="small"
        iconGroup="navigation"
        iconName="addition"
        iconPosition="prefix"
        @click="addSpacesDialog"
      >
        <FText appearance="headingMed14">{{
          $t('add_tenantunit', 'Add Units', { ns: 'tenant' })
        }}</FText>
      </FButton>
    </FContainer>

    <LookupWizard
      v-if="canShowWizard"
      :canShowLookupWizard.sync="canShowWizard"
      parentModuleName="tenant"
      :listUrlConfig="listUrlConfig"
      :field.sync="lookupWizardField"
      @setListValues="saveRecord"
    >
    </LookupWizard>

    <portal :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <FPagination
          :pageSize="perPage"
          :total="totalRecords"
          :currentPage="page"
          :disabled="false"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { CommonList } from '@facilio/ui/new-app'
import { findRouteForModule, pageTypes } from '@facilio/router'
import {
  FContainer,
  FButton,
  FTabs,
  FTabPane,
  FText,
  FIcon,
  FSpinner,
  FTable,
  ftoast,
  fDialog,
  FEmptyState,
  FPagination,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { LookupWizard } from '@facilio/ui/new-forms'

export default {
  props: ['details', 'widget', 'footerPortal'],
  components: {
    FContainer,
    FTabs,
    FTabPane,
    FButton,
    LookupWizard,
    FText,
    CommonList,
    FTable,
    FIcon,
    FSpinner,
    ftoast,
    fDialog,
    FEmptyState,
    FPagination,
    CommonList,
  },
  data() {
    return {
      records: [],
      viewDetail: {},
      emptyStateText: this.$t('empty_state', 'No Tenant Unit', {
        ns: 'tenant',
      }),
      tabsLists: [
        {
          label: this.$t('occupied_unit', 'Occupying Units', { ns: 'tenant' }),
          value: 'occupied',
        },
        {
          label: this.$t('vacant_units', 'Vacated Units', { ns: 'tenant' }),
          value: 'vacated',
        },
      ],
      isLoading: false,
      totalRecords: 0,
      page: 1,
      perPage: 5,
      canShowWizard: false,
      canShowLookupWizard: false,
      moduleName: 'tenant',
      lookupWizardField: {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'tenantunit',
        name: 'tenantunit',
        field: {
          lookupModule: {
            name: 'tenantunit',
            displayName: 'Tenant Unit',
          },
        },
      },
      relatedModuleName: 'tenantunit',
      currentTab: 'occupied',
    }
  },

  created() {
    this.init()
  },

  computed: {
    emptyStateTitle() {
      let emptyStateForOccupiedUnit = this.$t('empty_state', {
        ns: 'tenant',
      })
      let emptyStateForVacatedUnit = this.$t('empty_state_for_vacated_unit', {
        ns: 'tenant',
      })

      return this.checkIsOccupiedTab
        ? emptyStateForOccupiedUnit
        : emptyStateForVacatedUnit
    },
    emptyStateDescription() {
      let emptyStateForOccupiedUnit = this.$t(
        'empty_state_description_for_occupied_unit',
        {
          ns: 'tenant',
        }
      )
      let emptyStateForVacatedUnit = this.$t(
        'empty_state_description_for_vacated_unit',
        {
          ns: 'tenant',
        }
      )

      return this.checkIsOccupiedTab
        ? emptyStateForOccupiedUnit
        : emptyStateForVacatedUnit
    },
    isRecordEmpty() {
      let { isLoading, records } = this
      return !isLoading && isEmpty(records)
    },
    mainFieldAction() {
      return this.getRoute(this.relatedModuleName)
        ? this.mainFieldRedirection
        : null
    },
    slotList() {
      return [
        {
          criteria: JSON.stringify({ name: 'spaceType' }),
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
    checkIsOccupiedTab() {
      return this.currentTab === 'occupied'
    },
    viewName() {
      return getProperty(this, 'widget.widgetParams.viewName', '')
    },
    viewModuleName() {
      return getProperty(this, 'widget.widgetParams.viewModuleName', '')
    },
    listUrlConfig() {
      return {
        url: `v3/unrelated/tenant/fetchAll/tenantunit`,
        toModuleName: 'tenantunit',
        multiple: true,
        params: {
          filters: JSON.stringify({
            isOccupied: {
              operatorId: 15,
              value: ['false'],
            },
          }),
        },
      }
    },
  },

  watch: {
    currentTab() {
      this.page = 1
      this.loadTenant()
    },
  },

  methods: {
    mainFieldRedirection({ record, value }) {
      let { routeName, viewname } = this
      let { id = null } = record || {}
      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { viewname, id },
        }).href
        return {
          url: route,
          text: value,
          id,
          clickAction: (field, e) => this.mainFieldClickAction(id, e),
          ...value,
        }
      }
    },
    getRoute(moduleName) {
      return findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
    },
    async init() {
      this.isLoading = true
      let prom1 = this.loadView()
      let prom2 = this.loadTenant()

      Promise.all([prom1, prom2]).then(() => {
        this.isLoading = false
      })
    },

    async markVacant(record = {}) {
      let value = await fDialog.warning({
        title: this.$t('vacant_dialog.vacant_title', 'Confirmation', {
          ns: 'tenant',
        }),
        description: this.$t(
          'vacant_dialog.vacant_description',
          'Are you sure you want to mark the unit "vacant"?',
          {
            ns: 'tenant',
          }
        ),
        saveText: this.$t('vacant_dialog.save_text', 'Mark Vacant', {
          ns: 'tenant',
        }),
        cancelText: this.$t('vacant_dialog.cancel_text', 'Cancel', {
          ns: 'tenant',
        }),
      })

      if (!value) return

      let { space: spaceObj = {} } = record
      let { id = null } = spaceObj
      let params = {
        id,
        moduleName: this.relatedModuleName,
      }

      let { error } = await API.post(
        'v3/modules/data/patch?markVacant=true',
        params
      )

      if (error) {
        ftoast.critical(error.message)
      } else {
        ftoast.success(
          this.$t(
            'vacant_dialog.success_text',
            'Tenant unit is marked as vacant',
            {
              ns: 'tenant',
            }
          )
        )
        this.loadTenant()
      }
    },
    getSpaceType(row) {
      return isEmpty(row?.spaceTypeVal) ? '---' : row.spaceTypeVal
    },
    async saveRecord(units) {
      let { details = {}, moduleName = '' } = this
      let { id = null } = details
      let space = units.map(unit => ({ id: unit.value }))
      if (isEmpty(space)) return

      let data = {
        spaces: space,
      }
      let params = {
        data,
      }

      let { error } = await API.patch(
        `v3/modules/tenant/${id}?spacesUpdate=true`,
        params
      )

      if (error) {
        ftoast.critical(error.message)
      } else {
        ftoast.success(
          this.$t('vacant_dialog.tenant_added', 'Tenant unit Added', {
            ns: 'tenant',
          })
        )
        this.loadTenant()
      }
    },

    setTenantSpacesForTypes(tenantSpaces = []) {
      this.records = tenantSpaces.map(tenantSpace => {
        return tenantSpace?.space
      })
    },
    addSpacesDialog() {
      this.canShowWizard = true
    },
    async loadTenant() {
      this.isLoading = true
      this.records = []
      let { currentTab = '', details = {}, page = null, perPage = null } = this
      let { id = null } = details
      let filters = JSON.stringify({
        tenant: { operatorId: 36, value: [id + ''] },
        currentlyOccupied: {
          operatorId: 15,
          value: [`${currentTab === 'occupied'}`],
        },
      })

      let params = {
        filters: filters,
        withCount: true,
        page,
        perPage,
      }

      let { data, error, meta } = await API.get(
        'v3/unrelated/tenant/fetchAll/tenantspaces',
        params,
        { force: true }
      )
      if (error) {
        ftoast.critical(error.message)
      } else {
        let { tenantspaces } = data || {}
        this.setTenantSpacesForTypes(tenantspaces)
        this.totalRecords = getProperty(meta, 'pagination.totalCount', null)
      }
      this.isLoading = false
    },
    currentChange(page) {
      this.page = page
      this.loadTenant()
    },
    async loadView() {
      let { viewName, viewModuleName } = this
      let { error, data } = await API.get(
        `v2/views/${viewModuleName}/${viewName}`,
        { moduleName: viewModuleName }
      )

      if (error) {
        ftoast.critical(
          error?.message ||
            this.$t('cannot_fetch_view_details', 'Cannot fetch view details', {
              ns: 'tenant',
            })
        )
      } else {
        this.viewDetail = data?.viewDetail || {}
      }
    },
  },
}
</script>
