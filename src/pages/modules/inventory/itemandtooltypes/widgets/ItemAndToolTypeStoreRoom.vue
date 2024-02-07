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
        :title="$t('inventory.service.no_data_available', { ns: 'inventory' })"
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
        >
          <template #[`cell.storeRoomName`]="{ row }">
            <FButton
              v-if="canRedirectToSummary"
              appearance="link"
              @click="redirectToOverview(row)"
            >
              {{ row.storeRoomName }}
            </FButton>
            <FText v-else> {{ row.storeRoomName }} </FText>
          </template>
        </FTable>
      </FContainer>
    </FContainer>

    <portal :to="`footer-${widget.id}-${widget.name}`" v-if="!isEmpty(items)">
      <FContainer padding="containerLarge">
        <FPagination
          :pageSize="pageSize"
          :total="getTotalRecords"
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
  FSpinner,
  FForm,
  FFormItem,
  FEmptyState,
  FPagination,
  FInput,
} from '@facilio/design-system'
import { LookupWizard } from '@facilio/ui/new-forms'
import { findRouteForModule, pageTypes } from '@facilio/router'
import FetchViewsMixin from '../../../../../components/views/FetchViews.vue'

export default {
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
          displayName: 'Store Room',
          name: 'storeRoomName',
          id: 1,
          fixed: true,
        },
        {
          displayName: 'Description',
          name: 'storeRoomDescription',
          id: 2,
          fixed: false,
        },
        {
          displayName: 'Current balance',
          name: 'quantity',
          id: 3,
          fixed: false,
        },
        { displayName: 'Cost type', name: 'costTypeEnum', id: 4, fixed: false },
      ],
      items: [],
      pageSize: 5,
      currentPage: 1,
      disabled: false,
      allItemStoreRoom: [],
      routeName: null,
    }
  },
  async created() {
    this.loadItemStoreRoom()
    this.routeName = await this.fetchRouteName()
  },
  computed: {
    moduleName() {
      let { details } = this
      let { moduleName } = details || {}
      return moduleName
    },
    getTotalRecords() {
      let { allItemStoreRoom = [] } = this
      return allItemStoreRoom.length
    },
    canShowFilter() {
      return !isEmpty(this.items)
    },
    canRedirectToSummary() {
      let { routeName } = this
      return !isEmpty(routeName)
    },
  },
  methods: {
    isEmpty,
    async getFilteredItemList(filters) {
      let params = {
        filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
      }
      let { moduleName } = this
      if (moduleName === 'itemTypes') {
        let { error, list } = await API.fetchAll('item', params)

        if (!error) {
          return list
        } else {
          return []
        }
      } else if (moduleName === 'toolTypes') {
        let { error, list } = await API.fetchAll('tool', params)

        if (!error) {
          return list
        } else {
          return []
        }
      }
    },
    fetchRouteName() {
      let { moduleName } = this
      let targetModuleName = moduleName === 'itemTypes' ? 'item' : 'tool'
      let { name } =
        findRouteForModule(targetModuleName, pageTypes.OVERVIEW) || {}
      return name
    },
    async redirectToOverview(record = {}) {
      let { moduleName: currentModuleName, routeName, $route } = this
      let moduleName = currentModuleName === 'itemTypes' ? 'item' : 'tool'
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
    async loadItemStoreRoom() {
      let itemTypeId = this.details?.id

      let filters = {}
      let { moduleName } = this
      if (moduleName === 'itemTypes') {
        filters = {
          itemType: {
            operatorId: 36,
            value: [String(itemTypeId)],
          },
        }
      } else if (moduleName === 'toolTypes') {
        filters = {
          toolType: {
            operatorId: 36,
            value: [String(itemTypeId)],
          },
        }
      }
      this.isLoading = true
      if (itemTypeId) {
        let itemStoreRoom = await this.getFilteredItemList(filters)

        this.allItemStoreRoom = itemStoreRoom.map(item => {
          let { storeRoom = {} } = item
          let { name: storeRoomName, description: storeRoomDescription } =
            storeRoom
          return {
            ...item,
            storeRoomName,
            storeRoomDescription,
          }
        })

        this.getListForCurrentPage()

        this.isLoading = false
        this.$nextTick(() => {
          this.fitMyContent()
        })
      }
    },
    getListForCurrentPage() {
      this.isLoading = true
      let { currentPage, pageSize } = this
      let list = this.allItemStoreRoom || []
      list =
        list.slice((currentPage - 1) * pageSize, currentPage * pageSize) || []
      this.items = list || []
      this.isLoading = false
    },
    currentChange(page) {
      this.currentPage = page
      this.getListForCurrentPage()
      this.$nextTick(() => {
        this.fitMyContent()
      })
    },
  },
}
</script>
