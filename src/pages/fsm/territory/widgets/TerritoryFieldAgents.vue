<template>
  <div class="h-full">
    <FContainer
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <portal :to="`action-${widget.id}-${widget.name}`">
        <FButton
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="associateFieldAgent()"
        >
          {{ $t('territory.associate_field_agent', { ns: 'fsm' }) }}
        </FButton>
      </portal>
    </FContainer>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
      ><FSpinner :size="30"
    /></FContainer>
    <FContainer
      v-else-if="isEmpty(agents)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :illustration="'add-item'"
        :title="$t('territory.no_field_agents_available', { ns: 'fsm' })"
        :description="
          $t('territory.no_field_agents_available_description', { ns: 'fsm' })
        "
        :vertical="true"
        :size="'M'"
      >
        <template #buttons>
          <FButton
            appearance="secondary"
            size="medium"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            @click="associateFieldAgent()"
          >
            {{ $t('territory.associate_field_agent', { ns: 'fsm' }) }}
          </FButton>
        </template>
      </FEmptyState>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="space-between"
    >
      <FContainer overflow="scroll">
        <FTable :columns="column" :data="agents">
          <template #[`cell.action`]="data">
            <FIcon
              group="default"
              name="trash-can"
              size="16"
              @click="dissociateFieldAgent(data)"
            />
          </template>
        </FTable>
      </FContainer>
      <portal :to="`footer-${widget.id}-${widget.name}`">
        <FContainer padding="containerLarge" width="100%">
          <FPagination
            :pageSize="pageSize"
            :total="totalRecords"
            :currentPage="currentPage"
            :disabled="disabled"
            @nextClick="currentChange"
            @prevClick="currentChange"
            @currentChange="currentChange"
          />
        </FContainer>
      </portal>
    </FContainer>
    <FContainer v-if="showPopup">
      <LookupWizard
        v-if="showPopup"
        :field.sync="peopleField"
        :canShowLookupWizard.sync="showPopup"
        @closeWizard="cancelDialog"
        @setListValues="saveFieldAgent"
        :parentModuleName="moduleName"
        :listUrlConfig="listUrlConfig"
      ></LookupWizard>
    </FContainer>
  </div>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
import {
  FContainer,
  FText,
  FTable,
  FButton,
  ftoast,
  FSpinner,
  FEmptyState,
  FPagination,
  FIcon
} from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'
import { getUnRelatedModuleList } from '../../../../utils/relatedFieldUtil'

export default {
  props: ['details', 'widget', 'fitToViewArea', 'moduleName'],
  components: {
    FText,
    FContainer,
    FTable,
    FButton,
    FSpinner,
    LookupWizard,
    FEmptyState,
    FPagination,
    FIcon
  },
  data() {
    return {
      listUrlConfig: {
        url: 'v3/unrelated/territory/fetchAll/people',
        toModuleName: 'people',
        multiple: true,
      },
      peopleField: {
        lookupModule: {
          name: 'people',
          displayName: 'People',
        },
        multiple: true,
      },
      isLoading: false,
      showPopup: false,
      column: [
        { displayName: 'Agent Name', name: 'name', id: 1, fixed: true },
        {
          displayName: 'Email',
          name: 'email',
          id: 2,
          width: 250,
        },
        {
          displayName: 'Phone',
          name: 'phone',
          id: 3,
          width: 250,
        },
      ],
      agents: [],
      pageSize: 10,
      totalPage: 1,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      relatedFieldName: 'territories',
      relatedModuleName: 'people',
    }
  },
  created() {
    this.fitToViewArea()
    this.fetchPeopleList()
  },
  methods: {
    isEmpty,
    async fetchPeopleList(force = true) {
      this.isLoading = true
      let { details, moduleName, relatedModuleName, currentPage, pageSize } =
        this
      let { id } = details || {}
      let filters = JSON.stringify({
        territories: {
          operatorId: 90,
          value: [String(id)],
        },
      })
      // Adding lookup wizard filters here
      this.$set(this.peopleField, 'filters', {
        territories: { operatorId: 91, value: [String(id)] },
      })
      let params = {
        page: currentPage,
        perPage: pageSize,
        withCount: true,
        viewName: 'hidden-all',
        force,
        moduleName: relatedModuleName,
        filters,
      }
      let { list, meta, error } = await getUnRelatedModuleList(
        moduleName,
        relatedModuleName,
        params
      )
      if (error) {
        let { message = '', title = '' } = error
        ftoast.critical(message, {
          title,
          timeout: 5000,
        })
      } else {
        this.totalRecords = getProperty(meta, 'pagination.totalCount', null)
        this.agents = list || []
      }
      this.isLoading = false
    },
    async associateFieldAgent() {
      this.showPopup = true
    },
    reLoadPage() {
      this.fetchPeopleList()
    },
    cancelDialog() {
      this.showPopup = false
    },
    async saveFieldAgent(selectedItems) {
      let { details, relatedModuleName } = this
      let { id: territoryId } = details || {}

      let recordIds = (selectedItems || []).map(item => item.value)
      if (!isEmpty(recordIds)) {
        let { error, data } = await API.post(
          `v3/modules/data/territory/people/associate`,
          {
            recordIds,
            territoryId,
          }
        )
        if (error) {
          let { message } = error
          ftoast.error(message, {
            title: '',
            timeout: 1000,
          })
        } else if (!isEmpty(data)) {
          ftoast.success('Field Agent associated successfully', {
            title: '',
            timeout: 1000,
          })
        }
        this.reLoadPage()
      }
    },
    async dissociateFieldAgent(record) {
      let { details } = this
      let { id : territoryId } = details || {}
      let { row } = record || {}
      let { id: peopleId } = row || {}
      if (!isEmpty(peopleId)) {
        let { error, data } = await API.delete(
          `v3/modules/data/territory/people/dissociate`,
          {
            recordIds: [peopleId],
            territoryId,
          }
        )
        if (error) {
          let { message } = error
          ftoast.error(message, {
            title: '',
            timeout: 1000,
          })
        } else if (!isEmpty(data)) {
          ftoast.success('Field Agent associated successfully', {
            title: '',
            timeout: 1000,
          })
        }
        this.reLoadPage()
      }
    },
    currentChange(page) {
      this.currentPage = page
      this.fetchPeopleList()
    },
  },
}
</script>
