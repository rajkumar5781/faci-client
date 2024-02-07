<template>
  <FContainer height="100%">
    <portal :to="actionPortal">
      <FContainer display="flex" gap="containerLarge" alignItems="center">
        <MainFieldSearch
          v-if="searchFieldCheck"
          :mainFieldObj="mainFieldObj"
          :search.sync="searchText"
        ></MainFieldSearch>
        <FButton
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="redirectPageToForm"
        >
          <FText appearance="headingMed14">{{
            $t('summary.widgets.clients.add_client_contact', 'Add Contact')
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

    <FEmptyState
      v-else-if="!recordNotEmptyCheck"
      :title="emptyStateText"
      illustration="no-entries"
      :vertical="true"
    ></FEmptyState>
    <CommonList
      v-else
      :viewDetail="viewDetail"
      :records="recordList"
      :slotList="[]"
      :hideBorder="true"
      :orgDetails="orgDetails"
      selectType=""
      :mainFieldAction="mainFieldAction"
    ></CommonList>

    <portal :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <Pagination
          v-if="recordNotEmptyCheck"
          :key="`pagination-${moduleName}`"
          :totalCount="recordCount"
          :currentPageNo.sync="page"
          :currentPageCount="recordList.length"
          :perPage="perPage"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import SingleRelatedList from '../../../../components/page-builder/widgets/relatedList/SingleRelatedList.vue'
import { FButton, FIcon } from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'

export default {
  extends: SingleRelatedList,
  components: { FButton, FIcon },
  props: ['actionPortal', 'footerPortal'],
  computed: {
    moduleName() {
      return 'tenantcontact'
    },
    searchFieldCheck() {
      return this.recordNotEmptyCheck || !isEmpty(this.searchText)
    },
    recordNotEmptyCheck() {
      return !isEmpty(this.recordList)
    },
    moduleDisplayName() {
      return 'Tenant Contacts'
    },
    viewname() {
      return this.widget?.widgetParams?.viewName || 'all'
    },
  },

  methods: {
    redirectPageToForm() {
      let { details, relatedFieldName: fieldName, moduleName } = this
      let { id } = details || {}
      let query = { [`${fieldName}`]: id }
      let { name } = findRouteForModule(moduleName, pageTypes.CREATE) || {}

      if (name) {
        let route = this.$router.resolve({ name, query }).href
        window.open(route, '_blank')
      }
    },
  },
}
</script>
