<template>
  <FModal
    :visible="true"
    size="L"
    :maskClosable="true"
    type="default"
    padding="containerNone"
    :hideFooter="hideFooter"
    @cancel="closeAction"
    :title="formSubject"
    class="catalog-request-form-container"
  >
    <FContainer
      padding="containerXxLarge"
      display="flex"
      width="100%"
      paddingBottom="sectionLarge"
    >
      <FContainer width="25%">
        <catalog-data-widget :catalogItem="catalogItem" />
      </FContainer>
      <FContainer v-if="isLoading" marginLeft="containerXLarge">
        <LiveFormLoader formWidthStyle="width:520px" :dialog="true" />
      </FContainer>
      <FContainer
        v-else
        marginLeft="containerXLarge"
        borderRadius="high"
        marginBottom="sectionMedium"
      >
        <LiveForm
          ref="live-form"
          :moduleName="moduleName"
          :form="formObj"
          :formsList="forms"
          :isV3Api="isV3Api"
          :dialog="true"
          liveFormWidthStyle="medium"
          :showHeader="true"
          :isEdit="isEdit"
          :moduleDataId="moduleDataId"
          :moduleData="moduleData"
          :saving="isSaving"
          :loading="isLoading"
          :connectedAppEventChannel="getConnectedAppsInstance()"
          :account="$account"
          @save="submitForm"
          @cancel="closeAction"
          @hasConnectedApp="hasConnectedApp"
        />
      </FContainer>
    </FContainer>
    <FContainer
      v-if="hideFooter"
      width="100%"
      padding="containerXLarge sectionSmall"
      display="flex"
      justifyContent="flex-end"
      borderTop="solid 1px"
      borderColor="borderNeutralBaseSubtler"
      position="absolute"
      left="0"
      bottom="0"
      backgroundColor="backgroundCanvas"
    >
      <FButton appearance="primary" @click="onClickSaveRecord()">
        <FText>
          {{ $t('catalog.submit_request', { ns: 'servicecatalog' }) }}
        </FText>
      </FButton>
    </FContainer>
  </FModal>
</template>
<script>
import DialogForm from '../../form/DialogForm.vue'
import {
  FContainer,
  FText,
  FIcon,
  FButton,
  FDivider,
} from '@facilio/design-system'
import CatalogDataWidget from './CatalogDataWidget.vue'
import CatalogMixinVue from './CatalogMixin.vue'

export default {
  extends: DialogForm,
  mixins: [CatalogMixinVue],
  props: ['formSubject', 'catalogItem'],
  components: {
    FContainer,
    FText,
    FIcon,
    CatalogDataWidget,
    FButton,
    FDivider,
  },
  data() {
    return {
      hideFooter: true,
    }
  },
  methods: {
    submitForm(data) {
      this.isSaving = true
      let { formObj = {}, moduleData } = this

      let moduleName = this.getModuleFromFormObj(formObj)

      this.moduleData = new this.modelDataClass({
        moduleName,
        ...(data || {}),
      })

      let serializedData = this.moduleData.serialize(formObj, data)

      let params = {
        formObj,
        data: serializedData,
        moduleData,
      }

      this.$emit('saveRecord', params)
    },
    onClickSaveRecord() {
      let liveform = this.$refs['live-form']
      liveform.saveRecord()
    },
  },
}
</script>
