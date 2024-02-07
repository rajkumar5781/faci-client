<template>
  <FContainer v-if="isDialogForm" height="100%">
    <FModal
      :visible="true"
      size="L"
      :hideFooter="false"
      :maskClosable="false"
      type="default"
      padding="containerNone"
      :title="``"
      @cancel="closeForm"
      @ok="saveForm"
    >
      <NewSpaceManagementForms
        v-if="!isLoading"
        ref="space-form"
        :dataObj="dataObj"
        :isDialogForm="isDialogForm"
        :formModuleName="formModuleName"
        :fromSummary="true"
        :edit="isEdit"
        :recordId="isEdit ? recordId : -1"
        :parentId="parentId"
        @afterSave="refreshList"
        @onClose="closeForm"
      >
      </NewSpaceManagementForms>
      <FContainer v-else>
        <LiveFormLoader formWidthStyle="width:520px" :dialog="true" />
      </FContainer>
    </FModal>
  </FContainer>
  <FContainer v-else>
    <NewSpaceManagementForms
      v-if="!isLoading"
      :dataObj="dataObj"
      :isDialogForm="false"
    >
    </NewSpaceManagementForms>
  </FContainer>
</template>
<script>
import { LiveFormLoader } from '@facilio/forms'
import { FModal, FContainer } from '@facilio/design-system'
import NewSpaceManagementForms from './NewSpaceManagementForms.vue'
import { CustomModuleData } from '../../../data/CustomModuleData'
export default {
  props: [
    'isDialogForm',
    'parentId',
    'parentModule',
    'formModuleName',
    'isEdit',
    'recordId',
  ],
  components: { NewSpaceManagementForms, LiveFormLoader, FModal, FContainer },
  data() {
    return {
      dataObj: null,
      isLoading: false,
    }
  },
  created() {
    this.init()
  },
  computed: {
    modelDataClass() {
      return CustomModuleData
    },
  },
  methods: {
    async init() {
      this.isLoading = true
      if (this.isDialogForm) {
        let { parentModule } = this
        const id = this.parentId
        let parentModuleData = {}
        let dataObj
        if (parentModule == 'site') {
          parentModuleData = await this.fetchSpaceDetails('site', id) //site as parent
          dataObj = {
            site: parentModuleData,
            siteId: parseInt(id),
          }
        } else if (parentModule == 'building') {
          let buildingData = await this.fetchSpaceDetails('building', id) //site as parent
          dataObj = {
            building: buildingData,
            buildingId: parseInt(buildingData.id),
            site: buildingData.site,
            siteId: parseInt(buildingData.site.id),
          }
        } else if (parentModule == 'floor') {
          let floorData = await this.fetchSpaceDetails('floor', id) //site as parent
          dataObj = {
            floor: floorData,
            floorId: parseInt(id),
          }
        } else if (parentModule == 'space') {
          dataObj = {
            parentSpace: parseInt(id),
          }
        }
        this.dataObj = dataObj
      }
      this.isLoading = false
    },
    async fetchSpaceDetails(moduleName, id) {
      let parentModuleData = await this.modelDataClass.fetch({
        moduleName,
        id,
      })
      return parentModuleData
    },
    saveForm() {
      this.$refs['space-form']?.save()
    },
    closeForm() {
      this.$emit('close')
    },
    refreshList(data) {
      this.$emit('refresh', data)
    },
  },
}
</script>
