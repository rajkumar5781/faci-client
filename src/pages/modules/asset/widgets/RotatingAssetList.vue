<template>
  <FContainer>
    <FModal
      title="Exclude Asset"
      :visible="true"
      size="M"
      :hideFooter="true"
      @cancel="closeDialog()"
    >
      <FContainer height="50%">
        <FTabs v-model="activeTab" :tabsList="tabList">
          <FTabPane
            v-for="tab in tabList"
            :activeKey="tab.value"
            :key="tab.value"
          >
            <RotatingAssetTable
              :list="tab.list"
              :moduleName="tab.moduleName"
            ></RotatingAssetTable>
          </FTabPane>
        </FTabs>
      </FContainer>
    </FModal>
  </FContainer>
</template>

<script>
import RotatingAssetTable from './RotatingAssetTable.vue'
import { isEmpty } from '@facilio/utils/validation'
import {
  FContainer,
  FText,
  FModal,
  FTabs,
  FTabPane,
} from '@facilio/design-system'
import getProperty from 'dlv'

export default {
  props: ['plannedMaintenanceList', 'inspectionTemplateList'],
  components: {
    RotatingAssetTable,
    FContainer,
    FText,
    FModal,
    FTabs,
    FTabPane,
  },
  created() {
    this.init()
  },
  data() {
    return {
      activeTab: null,
      tabList: [],
    }
  },
  methods: {
    init() {
      let tabList = []
      if (!isEmpty(this.plannedMaintenanceList)) {
        tabList.push({
          name: 'plannedPreventiveMaintenanace',
          value: 'plannedPreventiveMaintenanace',
          label: 'Planned Preventive Maintenanace',
          message: this.$t(
            'asset.pm_warning_msg',
            'To proceed, kindly exclude the asset from the below Planned Maintenance records.',
            { ns: 'asset' }
          ),
          list: this.plannedMaintenanceList,
          moduleName: 'plannedmaintenance',
        })
      }
      if (!isEmpty(this.inspectionTemplateList)) {
        tabList.push({
          name: 'inspectionTemplate',
          value: 'inspectionTemplate',
          label: 'Inspection Template',
          message: this.$t(
            'asset.inspection_warning_msg',
            'To proceed, kindly exclude the asset from the below Inspection Template records',
            { ns: 'asset' }
          ),
          list: this.inspectionTemplateList,
          moduleName: 'inspectionTemplate',
        })
      }
      this.tabList = tabList
      this.activeTab = getProperty(tabList, '0.name')
    },
    closeDialog() {
      this.$emit('onClose')
    },
  },
}
</script>
