<template>
  <div class="dsm-main-container">
    <div class="form-pattern-container">
      <FormBackground />
    </div>
    <div v-if="showEmptyState" class="form-empty-container z-20">
      <FEmptyState
        illustration="no-entries"
        title=" No template configured"
        description="Please contact administrator"
        :vertical="true"
      />
    </div>
    <div v-else class="dsm-form-container" id="dsm-form-container">
      <div :style="`width:${switchWidthStyle}`" class="form-header-blur">
        <FormSwitch
          :form="selectedForm"
          :formsList="forms"
          :moduleDisplayName="moduleDisplayName"
          :isEdit="isEdit"
          class="form-switch"
          @switchForm="switchForm"
        />
      </div>
      <!-- <FShimmer v-else :width="190" :height="23" class="mT20 mB20" /> -->
      <div v-if="isLoading" class="loading-container">
        <LiveFormLoader :formWidthStyle="formLoaderWidthStyle" />
      </div>
      <template v-else>
        <div v-if="!isCreateEditWidgetConfigured" class="dsm-form-wrapper z-20">
          <LiveForm
            ref="live-form"
            :form="formObj"
            :formsList="forms"
            :isV3Api="isV3Api"
            :showHeader="true"
            :isEdit="isEdit"
            :moduleDataId="moduleDataId"
            :moduleData="moduleData"
            :saving="isSaving"
            :loading="isLoading"
            :connectedAppEventChannel="getConnectedAppsInstance()"
            :modifyFieldPropsHook="modifyFieldPropsHook"
            :modifySectionPropsHook="modifySectionPropsHook"
            :account="$account"
            :moduleName="moduleName"
            :liveFormWidthStyle="formSwitchStyle"
            :queryData="queryData"
            @save="saveRecord"
            @cancel="redirectToList"
            @hasConnectedApp="hasConnectedApp"
          />
        </div>
      </template>
      <DialogForm
        v-if="showDialogForm"
        :moduleName="quickCreateModuleName"
        :formId="quickCreateFormId"
        :saveAction="saveDialogForm"
        :closeAction="closeDialogForm"
      ></DialogForm>
      <FContainer
        v-if="!dialog"
        class="footer-container"
        border="1px solid"
        borderColor="borderNeutralBaseSubtle"
        :width="switchWidthStyle"
        marginTop="containerLarge"
      >
        <FContainer marginRight="containerLarge">
          <FButton
            appearance="secondary"
            size="medium"
            :block="true"
            @click="cancel"
          >
            Cancel
          </FButton>
        </FContainer>
        <FButton :block="true" size="medium" :loading="isSaving" @click="save">
          Submit
        </FButton>
      </FContainer>
    </div>
  </div>
</template>

<script>
import FormMixin from './FormMixin'
import DialogForm from './DialogForm.vue'
import QuickCreateMixin from './QuickCreateMixin'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'form-creation',
  mixins: [FormMixin, QuickCreateMixin],
  components: { DialogForm },
  computed: {
    moduleName() {
      let {
        $route: {
          params: { moduleName },
        },
      } = this

      if (!moduleName) moduleName = this.$attrs.moduleName

      return isEmpty(moduleName) ? null : moduleName
    },
  },
  methods: {
    modifyFieldPropsHook() {
      // Overriding field object in consuming component
    },
  },
}
</script>

<style scoped>
.dsm-main-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
}
.dsm-form-wrapper {
  width: 100%;
}

.form-empty-container {
  z-index: 20;
  width: 700px;
  height: calc(100vh - 160px);
  margin-top: 60px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 8px;
  box-shadow:
    0 0 1px rgba(67, 90, 111, 0.3),
    0 2px 4px -2px rgba(67, 90, 111, 0.47);
}

.dsm-form-container {
  z-index: 20;
  height: calc(100vh - 90px);
  overflow-y: scroll;
  padding: 0px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.loading-container {
  width: 700px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.form-switch {
  width: 600px;
}
.form-pattern-container {
  height: 320px;
  top: 0px;
  z-index: 10;
  border-radius: 8px;
  position: absolute;
  overflow: hidden;
  opacity: 0.4;
}
.form-background-pattern {
  width: 100%;
  border-radius: 23px;
  overflow: hidden;
  height: 40%;
}

.form-header-blur {
  position: sticky;
  top: -15px;
  z-index: 99;
}

.footer-container {
  padding: 12px 32px;
  background-color: #ffffff;
  display: flex;
  justify-content: flex-end;
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  position: sticky;
  bottom: 0px;
  border: 1px solid #eae9e9;
  z-index: 99;
}
</style>
