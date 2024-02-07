<template>
  <FContainer>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="sectionLarge"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(items)"
      paddingTop="containerXLarge"
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <FEmptyState
        :illustration="'add-item'"
        :title="emptyStateMsg"
        :vertical="true"
        :size="'S'"
      >
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
          :data="items"
          :rounded="false"
          :hideBorder="false"
        />
      </FContainer>
    </FContainer>

    <portal :to="`footer-${widget.id}-${widget.name}`" v-if="!isEmpty(items)">
      <FContainer padding="containerLarge">
        <FPagination
          :pageSize="pageSize"
          :total="totalCount"
          :currentPage="currentPage"
          :disabled="disabled"
          @nextClick="currentChange"
          @prevClick="currentChange"
          @currentChange="currentChange"
        />
      </FContainer>
    </portal>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
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
import { LookupWizard } from '@facilio/ui/new-forms'
import { CustomModuleData } from '../../../../../data/CustomModuleData'
import getProperty from 'dlv'

export default {
  props: ['details', 'widget', 'fitMyContent'],
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
    LookupWizard,
    FEmptyState,
    FPagination,
    FInput,
  },
  data() {
    return {
      isLoading: false,
      column: [
        {
          displayName: 'Asset',
          name: 'assetName',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'Description',
          name: 'assetDescription',
          id: 2,
          fixed: false,
        },
        {
          displayName: 'Required Count',
          name: 'requiredCount',
          id: 3,
          fixed: false,
        },
        { displayName: 'Remarks', name: 'remarks', id: 4, fixed: false },
      ],
      items: [],
      pageSize: 5,
      totalCount: 0,
      currentPage: 1,
      disabled: false,
      allItemStoreRoom: [],
    }
  },
  created() {
    this.loadSparePart()
  },
  computed: {
    moduleName() {
      return 'assetSpareParts'
    },
    emptyStateMsg() {
      return this.$t('inventory.storeroom.where_used_empty', {
        ns: 'inventory',
      })
    },
    itemTypeId() {
      let { details } = this || {}
      if (details.moduleName === 'itemTypes') {
        return JSON.stringify(details?.id)
      } else {
        return JSON.stringify(details?.itemType?.id)
      }
    },
  },
  methods: {
    isEmpty,
    async loadSparePart() {
      let { moduleName, itemTypeId, details, currentPage: page } = this

      let filters = { itemType: { operatorId: 9, value: [itemTypeId + ''] } }
      let params = {
        moduleName,
        viewname: 'whereUsed',
        filters,
        page,
        force: true,
        withCount: true,
        fetchOnlyViewGroupColumn: false,
        withoutCustomButtons: true,
      }

      this.isLoading = true
      let data = []
      let dataList = (await CustomModuleData.fetchAll(params)) || []
      if (!isEmpty(dataList)) {
        data = dataList.map(list => {
          let { asset = {} } = list || {}
          let { name = '---', description = '---' } = asset

          return { ...list, assetName: name, assetDescription: description }
        })

        let totalCount = getProperty(data, 'length', 0)
        this.totalCount = totalCount
      }
      this.items = data || []

      this.isLoading = false
      this.$nextTick(() => {
        this.fitMyContent()
      })
    },

    currentChange(page) {
      this.currentPage = page
      this.loadSparePart()
      this.$nextTick(() => {
        this.fitMyContent()
      })
    },
  },
}
</script>
