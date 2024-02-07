<template>
  <FContainer>
    <portal :to="actionPortal">
      <FContainer display="flex" alignItems="center">
        <FContainer paddingRight="containerMedium" v-if="!isEmpty(recordList)">
          <FButton
            appearance="secondary"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            size="small"
            @click="showWizard"
            ><FText>{{
              $t('safety_plan.add_work_asset', { ns: 'procurement' })
            }}</FText></FButton
          ></FContainer
        >
        <template v-if="!isEmpty(recordList)">
          <FDivider height="24px" style="margin: 0px 12px" />
          <ColumnCustomization
            :visible.sync="showColumnSettings"
            :moduleName="moduleName"
            :viewName="viewname"
            :relatedViewDetail="viewDetail"
            :relatedMetaInfo="metaInfo"
          ></ColumnCustomization>
        </template>
      </FContainer>
    </portal>
    <FContainer
      v-if="showLoading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FContainer v-else-if="isEmpty(recordList)" height="100%">
      <FEmptyState
        :title="emptyStateText"
        illustration="no-entries"
        :vertical="true"
        size="S"
      >
      <template #buttons>
        <FButton
            appearance="secondary"
            iconGroup="navigation"
            iconName="addition"
            iconPosition="prefix"
            size="small"
            @click="showWizard"
            ><FText>{{
              $t('safety_plan.add_work_asset', { ns: 'procurement' })
            }}</FText></FButton
          >
      </template>
    </FEmptyState>
    </FContainer>
    <CommonList
      v-else-if="!isEmpty(recordList)"
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
          <FContainer display="flex" gap="containerMedium">
            <FIcon
              group="default"
              name="trash-can"
              size="16"
              @click="deleteRecords([record.id])"
            />
          </FContainer>
      </template>
    </CommonList>
    <AddWorkAssetModal
      v-if="showMsgPopup"
      :details="details"
      :moduleDisplayName="moduleDisplayName"
      :availableAssets="availableAssets"
      :availableSpaces="availableSpaces"
      :showWorkAssetModal="showMsgPopup"
      @getWorkAssetHazards="getWorkAssetHazards"
      @loadRecords="loadRecords"
      @closeDialog="closeDialog"
    />
    <portal v-if="recordCount > 0 || !isEmpty(recordList)" :to="footerPortal">
      <FContainer height="40px" display="flex" alignItems="center">
        <Pagination
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
import RelatedList from '../../../../components/page-builder/widgets/relatedList/RelatedList.vue'
import AddWorkAssetModal from '../component/AddWorkAssetModal.vue'
import {
  FButton,
  FIcon,
  ftoast,
  FEmptyState,
  FContainer,
  FText,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'
export default {
  extends: RelatedList,
  components: {
    FButton,
    FIcon,
    AddWorkAssetModal,
    FEmptyState,
    FContainer,
    FText
  },
  data() {
    return {
      availableAssets: [],
      availableSpaces: [],
      showMsgPopup: false,
    }
  },
  computed: {
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
    moduleName() {
      return 'workAsset'
    },
    relatedFieldName() {
      return 'safetyPlan'
    },
    moduleDisplayName() {
      return 'Work Assets'
    },
    title() {
      return 'Work Assets'
    },
  },
  methods: {
    getProperty,
    async deleteRecords(ids) {
      let {moduleName} = this
      await this.modelDataClass.delete(moduleName, ids)
    },
    async showWizard() {
      let { recordList } = this
      if (recordList) {
        let workAssets = recordList
        this.getAvailableSpaceAndAssetIds(workAssets)
      }
      this.showMsgPopup = true
    },
    closeDialog() {
      this.availableAssets = null
      this.availableSpaces = null
      this.showMsgPopup = false
    },
    async getWorkAssetHazards(selectedData, moduleName) {
      this.isLoading = true
      let filter = {
        [moduleName]: {
          operatorId: 9,
          value: [`${selectedData}`],
        },
      }
      let params = {
        withCount: true,
        filters: JSON.stringify(filter),
      }
      let { list, error } = await API.fetchAll(`${moduleName}Hazard`, params, {
        force: true,
      })
      if (!error) {
        if (!isEmpty(list)) this.addSpecialModuleHazards(list)
      }
      this.isLoading = false
    },
    async addSpecialModuleHazards(list = []) {
      let safetyPlanId = getProperty(this, 'details.id', null)
      if (!isEmpty(list)) {
        let safetyPlanHazards = list.map(data => {
          let { hazard = {} } = data
          let { id = null } = hazard
          if (!isEmpty(id))
            return { safetyPlan: { id: safetyPlanId }, hazard: { id } }
          return null
        })
        let safetyPlanHazardList = safetyPlanHazards.filter(
          data => !isEmpty(data)
        )

        let url = 'v3/modules/data/bulkCreate'
        let params = {
          data: {
            safetyPlanHazard: safetyPlanHazardList,
          },
          moduleName: 'safetyPlanHazard',
          params: {
            safetyPlan: safetyPlanId,
          },
        }
        let { error } = await API.post(url, params)
        if (error) {
          let { message } = error
          ftoast.critical(message || this.$t('error_occured'))
        }
      }
      await this.loadRecords(true)
      this.closeDialog()
    },
    getAvailableSpaceAndAssetIds(workAssets = []) {
      let filteredAssets = workAssets.filter(
        woAsset => !isEmpty(woAsset?.asset?.id)
      )
      let filteredSpaces = workAssets.filter(
        woAsset => !isEmpty(woAsset?.space?.id)
      )
      this.availableAssets = filteredAssets.map(
        woAsset => `${woAsset?.asset?.id}`
      )
      this.availableSpaces = filteredSpaces.map(
        woAsset => `${woAsset?.space?.id}`
      )
    },
    async deleteRecords(idList) {
      let { moduleDisplayName, moduleName } = this
      this.isLoading = true
      try {
        await this.modelDataClass.delete(moduleName, idList)
        let successmsg = `${moduleDisplayName} ${this.$t(
          'safety_plan.deleted_success',
          { ns: 'procurement' }
        )}`
        ftoast.success(successmsg)
        this.selectedListItemsIds = []
        this.selectedListItemsObj = []
        await this.loadRecords(true)
      } catch (error) {
        let { message } = error
        ftoast.critical(
          message || this.$t('safety_plan.delete_error', { ns: 'procurement' })
        )
      }
      this.isLoading = false
    },
  },
}
</script>
