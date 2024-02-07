<template>
  <FContainer height="100%">
    <portal :to="actionPortal">
      <FContainer gap="containerLarge" display="flex" alignItems="center">
        <MainFieldSearch
          v-if="searchFieldCheck"
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch>

        <FButton
          v-if="!isEmpty(recordList)"
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="openLookupWizard"
        >
          <FText appearance="headingMed14">{{
            $t('summary.widgets.clients.associate_site', 'Associate Site')
          }}</FText>
        </FButton>
      </FContainer>
    </portal>
    <FContainer
      v-if="showLoading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>

    <FContainer
      v-else-if="isEmpty(recordList)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :title="emptyStateText"
        illustration="no-entries"
        :vertical="true"
        size="M"
      >
        <template #buttons v-if="isEmpty(searchText)">
          <FButton
            appearance="secondary"
            size="small"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            @click="openLookupWizard"
          >
            <FText appearance="headingMed14">{{
              $t('summary.widgets.clients.associate_site', 'Associate Site')
            }}</FText>
          </FButton>
        </template></FEmptyState
      >
    </FContainer>
    <CommonList
      v-else
      :viewDetail="viewDetail"
      :records="recordList"
      :slotList="slotList"
      :hideBorder="true"
      :orgDetails="orgDetails"
      selectType=""
      :mainFieldAction="mainFieldAction"
    >
      <template #[slotList[0].name]="{ record }">
        <FText color="textCaption">{{ '#' + record.id }}</FText>
      </template>
      <template #[slotList[1].name]="{ record }">
        <FContainer @click="deleteRecord(record)">
          <FIcon group="action" name="delete" size="16"></FIcon>
        </FContainer>
      </template>
    </CommonList>
    <LookupWizard
      v-if="showLookupWizard"
      parentModuleName="site"
      :canShowLookupWizard.sync="showLookupWizard"
      :field="getFields"
      @setLookupFieldValue="saveRecord"
    >
    </LookupWizard>
    <portal :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <Pagination
          v-if="!isEmpty(recordList)"
          :key="`pagination-${moduleName}`"
          :totalCount="recordCount"
          :currentPageNo.sync="page"
          :currentPageCount="(recordList || []).length"
          :perPage="perPage"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import SingleRelatedList from '../../../../components/page-builder/widgets/relatedList/SingleRelatedList.vue'
import { ftoast } from '@facilio/design-system'
import { FButton, FIcon } from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'
import getProperty from 'dlv'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'

export default {
  extends: SingleRelatedList,
  props: ['actionPortal', 'footerPortal'],
  components: {
    LookupWizard,
    FButton,
    FIcon,
  },
  data() {
    return {
      showLookupWizard: false,
    }
  },
  computed: {
    moduleName() {
      return 'site'
    },
    searchFieldCheck() {
      let { searchText, recordList } = this
      return !isEmpty(recordList) || !isEmpty(searchText)
    },
    moduleDisplayName() {
      return 'Sites'
    },
    slotList() {
      return [
        {
          name: 'id',
          isHardcodedColumn: true,
          columnAttrs: {
            width: 80,
            displayName: 'ID',
            fixed: true,
          },
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
    getFields() {
      return {
        isDataLoading: false,
        options: [],
        lookupModuleName: 'site',
        name: 'site',
        field: {
          lookupModule: {
            name: 'site',
            displayName: 'Sites',
          },
        },
        multiple: true,
        forceFetchAlways: true,
        customParams: {
          parentModuleName: this.parentModuleName,
        },
      }
    },
    emptyStateText() {
      let { recordList, searchText, moduleDisplayName } = this
      if (isEmpty(searchText) && isEmpty(recordList)) {
        return this.$t(
          'client.emptyState.not_associated.site',
          `No ${moduleDisplayName} Associated`,
          {
            ns: 'client',
          }
        )
      } else if (!isEmpty(searchText) && isEmpty(recordList)) {
        return this.$t(
          'client.emptyState.search.site',
          `No ${moduleDisplayName} Found`,
          {
            ns: 'client',
          }
        )
      }
      return ''
    },
  },
  methods: {
    openLookupWizard() {
      this.showLookupWizard = true
    },
    async deleteRecord(row) {
      let { id, moduleName } = this.details || {}
      let selectedIds = []
      let { id: selectedId } = row || {}

      selectedIds.push(selectedId)
      let successMsg = this.$t(
        'summary.widgets.clients.site_dissociated',
        'Site Dissociated successfully!'
      )

      await this.associateAndDissociateRecord(
        selectedIds,
        id,
        false,
        moduleName,
        successMsg
      )
      this.isLoading = false
      this.init()
      this.closeWizard()
    },
    async saveRecord(value) {
      let { id, moduleName } = this.details || {}
      let field = getProperty(value, 'field')
      let selectedData = getProperty(field, 'selectedItems')

      if (!this.isEmpty(selectedData)) {
        let siteIds = []
        siteIds = selectedData.map(data => {
          return data.value
        })

        let successMsg = this.$t(
          'summary.widgets.clients.site_associated',
          'Site Associated successfully!'
        )
        await this.associateAndDissociateRecord(
          siteIds,
          id,
          true,
          moduleName,
          successMsg
        )
        this.isLoading = false
        this.init()
        this.closeWizard()
      }
    },
    async associateAndDissociateRecord(
      siteIds,
      id,
      isAssociateSites,
      moduleName,
      successMsg
    ) {
      let url = 'v3/modules/client/' + id
      let params = {
        id,
        data: { siteIds },
        params: {
          [isAssociateSites ? 'isAssociateSites' : 'isDisassociateSites']: true,
        },
        moduleName,
      }
      let { error } = await API.patch(url, params, { force: true })

      if (error) {
        ftoast.critical(error?.message || this.$t('error_occurred'))
      } else {
        successMsg && ftoast.success(successMsg)
      }
    },
    closeWizard() {
      this.$set(this.wizardField, 'selectedItems', [])
      this.showLookupWizard = false
    },
  },
}
</script>
