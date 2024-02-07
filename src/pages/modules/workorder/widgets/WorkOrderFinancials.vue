<template>
  <FContainer
    v-if="tabsList.length === 0"
    display="flex"
    justifyContent="center"
    height="100%"
    borderRadius="high"
    border="1px solid"
    borderColor="backgroundMidgroundDark"
  >
    <FEmptyState
      title="No Financial Activity"
      description="There is no financial activities recorded so far"
      vertical
      size="S"
      illustration="no-result"
    >
    </FEmptyState
  ></FContainer>
  <FContainer v-else ref="workOrderFinancialWidget" overflow="auto">
    <portal to="page-builder-sticky-top">
      <FContainer
        display="flex"
        justifyContent="center"
        padding="containerLarge containerXLarge"
      >
        <FTabs
          v-model="financialTab"
          appearance="button"
          :tabsList="tabsList"
          @change="resizeOnLoad"
        />
        <FContainer
          display="flex"
          gap="containerLarge"
          alignItems="center"
          padding="containerNone containerXLarge"
        >
          <portal-target name="financial-create-buttons"></portal-target>
          <FSegmentedControl
            v-model="displayType"
            :tabsList="tabDisplayLists"
            tabWidth="fit-content"
            @change="resizeOnLoad"
          >
            <template v-slot:[`tab.1`]
              ><FIcon
                group="action"
                name="apps-outline"
                size="16"
                :pressable="false"
            /></template>
            <template v-slot:[`tab.2`]
              ><FIcon group="dsm" name="table" size="16" :pressable="false"
            /></template>
          </FSegmentedControl>
        </FContainer>
      </FContainer>
    </portal>
    <FContainer height="100%">
      <WorkOrderQuote
        v-if="financialTab === '1'"
        :workorder="details"
        :config="listConfiguration"
        :displayType="displayType"
        :systemButtonsList="systemButtonsList"
        :allowQuoteCreation="allowQuoteCreation"
      >
      </WorkOrderQuote>
      <WorkOrderInvoice
        v-if="financialTab === '2'"
        :workorder="details"
        :config="listConfiguration"
        :displayType="displayType"
        :allowInvoiceCreation="allowInvoiceCreation"
      ></WorkOrderInvoice>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FTabs,
  FTabPane,
  FEmptyState,
  FButton,
  FSegmentedControl,
  FIcon,
  FDivider,
} from '@facilio/design-system'
import WorkOrderQuote from './WorkOrderQuote.vue'
import WorkOrderInvoice from './WorkOrderInvoice.vue'

export default {
  props: [
    'details',
    'widget',
    'fitMyContent',
    'resizeWidget',
    'calculateDimensions',
    'headerPortal',
  ],
  components: {
    FContainer,
    FTabs,
    FTabPane,
    FEmptyState,
    FButton,
    FSegmentedControl,
    FIcon,
    FDivider,
    WorkOrderQuote,
    WorkOrderInvoice,
  },
  data() {
    return {
      activeTab: 'quote',
      financialTab: '1',
      addButtonName: 'Add Quote',
      displayType: '1',
      tabDisplayLists: [
        { label: 'Card', value: '1' },
        { label: 'List', value: '2' },
      ],
    }
  },
  created() {
    setTimeout(() => {
      this.resizeOnLoad()
    }, 1000)
  },
  async mounted() {},
  computed: {
    systemButtonsList() {
      let { $attrs = {} } = this
      let { systemButtons } = $attrs
      return systemButtons
    },
    allowInvoiceCreation() {
      let { systemButtonsList } = this
      return systemButtonsList.some(obj => obj.identifier === 'generateInvoice')
    },
    allowQuoteCreation() {
      let { systemButtonsList } = this
      return systemButtonsList.some(obj => obj.identifier === 'generateQuote')
    },
    isQuoteEnabled() {
      let { $access = {} } = this
      let { isLicenseEnabled } = $access
      return isLicenseEnabled('QUOTATION')
    },
    isInvoiceEnabled() {
      let { $access = {} } = this
      let { isLicenseEnabled } = $access
      return isLicenseEnabled('INVOICE')
    },
    tabsList() {
      let tabs = []
      let { isQuoteEnabled, isInvoiceEnabled } = this
      if (isQuoteEnabled) {
        tabs.push({
          label: `Quote`,
          value: '1',
        })
      }
      if (isInvoiceEnabled) {
        tabs.push({
          label: `Invoice`,
          value: '2',
        })
      }
      this.financialTab = tabs[0]?.value || null
      return tabs
    },
    columnCustomConfig() {
      return { canShowColumnConfig: false }
    },
    listConfiguration() {
      let { columnCustomConfig, searchAndFilterConfig } = this

      return {
        expand: false,
        isSelectionEnabled: false,
        isIndexEnabled: false,
        canHideFooter: true,
        lookupModuleName: 'quote',
        lookupModuleDisplayName: 'Quote',
        ...(columnCustomConfig || {}),
        ...(searchAndFilterConfig || {}),
        canEnableMainFieldAction: false,
        saveText: 'save',
        selectType: 'bulk',
      }
    },
    searchAndFilterConfig() {
      return { canHideSearch: false, canHideFilter: false }
    },
  },
  methods: {
    resizeOnLoad() {
      this.fitMyContent()
    },
  },
}
</script>
