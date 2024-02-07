<template>
  <FModal
    :visible="true"
    size="S"
    @ok="saveSpecification"
    saveText="Next"
    :confirmLoading="isSaving && !isEmpty(selectedClsfiModuleId)"
    @cancel="closeDialog"
  >
    <template #header>
      <FText appearance="headingMed16" color="textMain">
        {{ $t('setup.classification').toUpperCase() }}</FText
      >
    </template>
    <template #close-icon>
      <FPagination
        v-if="count > perPage"
        :currentPage.sync="page"
        :total="count"
        :pageCount="perPage"
      ></FPagination>
    </template>
    <FInput
      ref="quickSearchQuery"
      type="text"
      v-model="clsfiModuleSearch"
      clearable
      :clearValue="loadClassificationListOnClear"
      @change="loadClassificationListOnSearch()"
      placeholder="Search Classification"
      class="quick-search-input-specification"
    >
      <template #prefix>
        <FIcon group="action" name="search" size="14"></FIcon> </template
    ></FInput>
    <FContainer padding="containerXLarge sectionSmall">
      <ClassificationBreadCrumbs
        v-if="!searchResult"
        :breadCrumb="breadCrumb"
        @onGetBreadcrumbList="getBreadcrumbList"
      ></ClassificationBreadCrumbs>
      <FText v-else appearance="headingMed16" color="textInverseDescription">{{
        $t('results')
      }}</FText>
    </FContainer>
    <FContainer padding="containerNone sectionSmall" height="350px">
      <FContainer
        v-if="searchLoading"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <FSpinner :size="30"></FSpinner>
      </FContainer>
      <FContainer v-else-if="isEmpty(clsfiModuleList)">
        {{ $t('setup.no_classifications_avaliable') }}
      </FContainer>
      <FContainer
        v-else
        v-for="item in clsfiModuleList"
        :key="item.id"
        display="flex"
        justifyContent="space-between"
      >
        <FContainer
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexGrow="1"
          cursor="pointer"
          @click="selectedClsfiModuleId = item.id"
          padding="containerLarge containerNone"
          lineHeight="sectionMedium"
        >
          <FContainer
            class="text-containter-content"
            display="flex"
            flexDirection="column"
            gap="containerMedium"
          >
            <FText
              appearance="bodyReg14"
              :color="isSelected(item.id) ? 'borderPrimaryPressed' : 'textMain'"
            >
              {{ item.name }}
            </FText>
            <FText v-if="searchResult" appearance="captionReg12">
              {{ item.classificationPath }}
            </FText>
          </FContainer>
          <FIcon
            v-if="isSelected(item.id)"
            group="action"
            name="tick-circle-filled"
            size="16"
            color="borderPrimaryPressed"
            :pressable="false"
          ></FIcon>
        </FContainer>
        <FContainer width="24px" @click="getClassificationListChild(item)">
          <FIcon
            v-if="item.hasChild && !searchResult"
            group="navigation"
            name="accordion-right"
            size="16"
          ></FIcon>
        </FContainer>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import ClassificationBreadCrumbs from './ClassificationBreadCrumbs.vue'
import { isEmpty } from '@facilio/utils/validation'
import { ClassificationListModel } from './ClassificationModel.js'
import {
  FPagination,
  FButton,
  FIcon,
  FSpinner,
  FModal,
  FInput,
  FText,
  FContainer,
} from '@facilio/design-system'
import dlv from 'dlv'

export default {
  props: ['isAttributeInherited', 'fromModuleName'],
  components: {
    FContainer,
    FText,
    ClassificationBreadCrumbs,
    FPagination,
    FButton,
    FIcon,
    FSpinner,
    FModal,
    FInput,
  },
  data() {
    return {
      isSaving: false,
      searchLoading: false,
      clsfiModuleList: [],
      selectedClsfiModuleId: null,
      clsfiModuleSearch: null,
      count: null,
      parentClassificationDataId: null,
      searchResult: false,
      perPage: 10,
      page: 1,
      breadCrumb: [
        {
          name: 'All classification',
        },
      ],
      isEmpty,
    }
  },
  created() {
    this.getClassificationList()
  },
  computed: {
    onSaveButton() {
      return this.isAttributeInherited ? this.$t('next') : this.$t('save')
    },
  },
  watch: {
    page() {
      this.getClassificationList()
    },
  },
  methods: {
    isSelected(currentId) {
      return this.selectedClsfiModuleId === currentId
    },
    getBreadcrumbList(item) {
      let index = null
      let { id } = item

      index = this.breadCrumb.findIndex(obj => obj.id === id) || 0
      this.breadCrumb.splice(++index)
      this.parentClassificationDataId = id || null
      this.getClassificationList()
    },
    loadClassificationListOnSearch() {
      let recentCrumbIndex = (this.breadCrumb || []).length - 1
      let recentCrumb = dlv(this.breadCrumb, `${recentCrumbIndex}`) || {}
      let { id } = recentCrumb
      if (isEmpty(this.clsfiModuleSearch)) {
        this.loadClassificationListOnClear()
        return
      }
      this.searchResult = true
      this.page = 1
      this.parentClassificationDataId = id || null
      this.getClassificationList()
    },
    loadClassificationListOnClear() {
      this.searchResult = false
      this.clsfiModuleSearch = null
      this.getClassificationList()
    },
    getClassificationListChild(item) {
      let { name, id } = item || {}
      this.page = 1
      this.breadCrumb.push({ name, id })
      this.parentClassificationDataId = id || null
      this.getClassificationList()
    },
    async getClassificationList() {
      let { clsfiModuleSearch, parentClassificationDataId } = this
      this.searchLoading = true
      let { page, perPage, fromModuleName } = this
      let search = clsfiModuleSearch || null
      let params = {
        page,
        perPage,
        search,
        parentClassificationId: !isEmpty(parentClassificationDataId)
          ? parentClassificationDataId
          : null,
        withCount: true,
        fetchAll: isEmpty(fromModuleName),
        hasChild: true,
        classificationResolvePath: !isEmpty(search),
      }
      if (!isEmpty(fromModuleName)) params = { ...params, fromModuleName }

      this.clsfiModuleList = await ClassificationListModel.fetchAll(params)
      this.count = ClassificationListModel.totalCount
      this.searchLoading = false
    },
    async saveSpecification() {
      if (isEmpty(this.selectedClsfiModuleId)) return
      this.isSaving = true
      let { clsfiModuleList, selectedClsfiModuleId, breadCrumb } = this
      let selectedModule = clsfiModuleList.find(
        cls => cls.id === selectedClsfiModuleId
      )

      if (this.isAttributeInherited) {
        await this.onSaveClassification(selectedModule)
      } else {
        this.$emit('onSave', selectedModule, breadCrumb)
      }
      this.isSaving = false

      this.closeDialog()
    },
    closeDialog() {
      this.$emit('onClose')
    },
    async onSaveClassification(item) {
      this.isSaving = true
      let classificationData = await ClassificationListModel.fetch({
        id: item.id,
      })
      let attributesList = classificationData.attributes
      this.$emit('specificationAttributes', attributesList)
      this.$emit('onSave', item, this.breadCrumb)

      this.isSaving = false
    },
  },
}
</script>
