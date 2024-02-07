<template>
  <FContainer class="related-list-widget" height="100%">
    <portal :to="actionPortal">
      <FContainer display="flex" alignItems="center" gap="containerLarge">
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
      >
        <template #buttons>
          <FButton
            v-if="!isEmpty(recordList)"
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
        </template></FEmptyState
      >
    </FContainer>
    <CommonList
      v-else
      :viewDetail="viewDetail"
      :records="recordList"
      :hideBorder="true"
      :orgDetails="orgDetails"
      selectType=""
      :mainFieldAction="mainFieldAction"
    >
    </CommonList>

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
import { FButton, FIcon } from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'

export default {
  extends: SingleRelatedList,
  components: {
    FButton,
    FIcon,
  },
  props: ['actionPortal', 'footerPortal'],
  computed: {
    moduleName() {
      return 'clientcontact'
    },
    searchFieldCheck() {
      let { searchText, recordList } = this
      return !isEmpty(recordList) || !isEmpty(searchText)
    },
    moduleDisplayName() {
      return 'Client Contacts'
    },
    emptyStateText() {
      let { recordList, searchText, moduleDisplayName } = this
      if (isEmpty(searchText) && isEmpty(recordList)) {
        return this.$t(
          'client.emptyState.not_associated.client_contact',
          `No ${moduleDisplayName} Associated`,
          {
            ns: 'client',
          }
        )
      } else if (!isEmpty(searchText) && isEmpty(recordList)) {
        return this.$t(
          'client.emptyState.search.client_contact',
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
    redirectPageToForm() {
      let { details, relatedFieldName: fieldName, moduleName } = this
      let { id } = details || {}
      let query = {
        [`${fieldName}`]: id,
      }
      let { name } = findRouteForModule(moduleName, pageTypes.CREATE) || {}

      if (name) {
        let routeObj = { name, params: { moduleName }, query }
        let path = this.$router.resolve(routeObj).href
        window.open(path, '_blank')
      }
    },
  },
}
</script>
