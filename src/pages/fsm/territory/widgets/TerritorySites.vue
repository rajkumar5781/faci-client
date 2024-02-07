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
          @click="associateSite()"
        >
          {{ $t('territory.associate_site', { ns: 'fsm' }) }}
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
      v-else-if="isEmpty(sites)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :illustration="'add-item'"
        :title="$t('territory.no_sites_available', { ns: 'fsm' })"
        :description="
          $t('territory.no_sites_available_description', { ns: 'fsm' })
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
            @click="associateSite()"
          >
            {{ $t('territory.associate_site', { ns: 'fsm' }) }}
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
        <FTable
          :columns="column"
          :data="sites"
          :hideBorder="true"
          :rounded="false"
        >
          <template #[`cell.action`]="data">
            <FIcon
              group="default"
              name="trash-can"
              size="16"
              @click="dissociateSite(data)"
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
        :field.sync="siteField"
        :canShowLookupWizard.sync="showPopup"
        @closeWizard="cancelDialog"
        @setListValues="saveSites"
        :parentModule="moduleName"
        :listUrlConfig="listUrlConfig"
      ></LookupWizard>
    </FContainer>
  </div>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty, isArray } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FTable,
  FButton,
  ftoast,
  FSpinner,
  FEmptyState,
  FPagination,
  FIcon,
} from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'
import { RelatedListData } from '../../../../components/page-builder/widgets/relatedList/RelatedListData'

export default {
  props: ['details', 'widget', 'fitToViewArea', 'moduleName'],
  components: {
    FText,
    FContainer,
    FTable,
    FButton,
    LookupWizard,
    FSpinner,
    FEmptyState,
    FPagination,
    FIcon,
  },
  data() {
    return {
      siteField: {
        lookupModule: {
          name: 'site',
          displayName: 'Site',
        },
        multiple: true,
      },
      sites: [],
      isLoading: false,
      showPopup: false,
      column: [
        { displayName: 'Name', name: 'name', id: 1, fixed: true },
        {
          displayName: 'Location',
          name: 'siteLocation',
          id: 2,
          width: 250,
        },
        {
          displayName: 'Modified By',
          name: 'modifiedBy',
          id: 3,
          width: 250,
        },
      ],
      pageSize: 10,
      totalPage: 1,
      pageCount: 1,
      currentPage: 1,
      totalRecords: 0,
      disabled: false,
      relatedFieldName: 'territory',
      relatedModuleName: 'site',
      listUrlConfig: {
        url: 'v3/unrelated/territory/fetchAll/site',
        toModuleName: 'site',
        multiple: true,
      },
    }
  },
  created() {
    this.fitToViewArea()
    this.getAllSites()
  },
  methods: {
    isEmpty,
    async getAllSites(force = true) {
      this.isLoading = true
      let {
        details,
        moduleName,
        relatedFieldName,
        relatedModuleName,
        currentPage,
        pageSize,
      } = this
      let { id: recordId } = details || {}
      let filters = { territory: { operatorId: 36, value: [String(recordId)] } }
      // Adding lookup wizard filters here
      this.$set(this.siteField, 'filters', {
        territory: { operatorId: 37, value: [String(recordId)] },
      })
      let params = {
        moduleName: relatedModuleName,
        viewname: 'hidden-all',
        page: currentPage,
        perPage: pageSize,
        force,
        recordId,
        relatedFieldName,
        currentModuleName: moduleName,
        filters,
      }
      try {
        let recordList = await RelatedListData.fetchAll(params)
        if (isArray(recordList)) {
          this.sites = recordList
          ;(this.sites || []).forEach(record => {
            let { location, sysModifiedBy } = record
            let { lat, lng } = location || {}
            let latLng = null
            let modifiedBy = null
            if (!isEmpty(lat) && !isEmpty(lng)) {
              latLng = lat + ', ' + lng
            }
            if (!isEmpty(sysModifiedBy)) {
              let { name, email } = sysModifiedBy || {}
              modifiedBy = name || email
            }
            record.siteLocation = !isEmpty(latLng) ? latLng : '---'
            record.modifiedBy = !isEmpty(modifiedBy) ? modifiedBy : '---'
          })
        }
        this.totalRecords = RelatedListData.recordListCount
      } catch (error) {
        let { message, title = '' } = error
        ftoast.critical(message || this.$t('error_occurred'), {
          title,
          menuType: 'alerts',
          timeout: 5000,
        })
      }
      this.isLoading = false
    },
    async associateSite() {
      this.showPopup = true
    },
    reLoadPage() {
      this.getAllSites()
    },
    cancelDialog() {
      this.showPopup = false
    },
    async saveSites(selectedItems) {
      let { relatedModuleName, details } = this
      let { id } = details || {}
      ;(selectedItems || []).forEach(item => {
        item.territory = { id }
        item.id = item.value
      })

      let params = {
        moduleName: relatedModuleName,
        data: {
          [relatedModuleName]: selectedItems,
        },
      }

      let { error, data } = await API.post(
        `v3/modules/data/territory/site/bulkPatch`,
        params
      )
      if (error) {
        let { message } = error
        ftoast.critical(message, {
          title: '',
          timeout: 1000,
        })
      } else if (!isEmpty(data)) {
        ftoast.success('Site associated successfully', {
          title: '',
          timeout: 1000,
        })
      }
      this.reLoadPage()
    },
    async dissociateSite(record) {
      let { relatedModuleName } = this
      let { row } = record || {}
      let { id } = row || {}
      if (!isEmpty(id)) {
        let params = {
          moduleName: relatedModuleName,
          data: {
            [relatedModuleName]: [{ id, territory: null }],
          },
        }
        let { error } = await await API.post(
          `v3/modules/data/territory/site/bulkPatch`,
          params
        )
        if (error) {
          let { message } = error || this.$t('error_occurred')
          ftoast.critical(message, {
            menuType: 'alerts',
            timeout: 3000,
          })
        } else {
          ftoast.success('Deleted Successfully', {
            menuType: 'alerts',
            timeout: 3000,
          })
          this.reLoadPage()
        }
      }
    },
    currentChange(page) {
      this.currentPage = page
      this.reLoadPage()
    },
  },
}
</script>
