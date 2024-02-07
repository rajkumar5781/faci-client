<template>
  <FContainer height="100%" ref="spaceList" :key="moduleName" width="100%">
    <FContainer
      v-if="isEmpty(list)"
      display="flex"
      justifyContent="center"
      width="100%"
      height="100%"
      borderTop="1px solid"
      borderColor="borderNeutralBaseSubtle"
    >
      <FEmptyState
        :title="emptyStateMessage"
        :vertical="false"
        size="S"
        illustration="no-entries"
      >
        <template #buttons>
          <FContainer
            v-if="$access.hasPermission('space:CREATE') && !decommission"
            display="flex"
            align-items="center"
            flex-direction="row"
          >
            <FButton
              appearance="secondary"
              size="medium"
              iconGroup="navigation"
              iconName="addition"
              iconPosition="prefix"
              @click="goToSpaceCreation()"
            >
              {{
                $t(
                  `portfolio.list.add_${buttonName.toLowerCase()}`,
                  `Add ${buttonName}`,
                  { ns: 'portfolio' }
                )
              }}
            </FButton>
          </FContainer>
        </template>
      </FEmptyState>
    </FContainer>
    <CommonList
      v-else
      :viewDetail="viewDetail"
      :key="moduleName"
      :records="list"
      :hideBorder="true"
      style="overflow: scroll"
      :showSelectBar="false"
      :moduleName="moduleName"
      :mainFieldAction="mainFieldAction"
      :orgDetails="$account.org"
      :account="$account"
      :baseUrl="getBaseURL()"
      :selectType="null"
      :slotList="slotList"
    >
      <template #[slotList[0].name]="{ record }">
        <FContainer>
          <FIcon
            v-if="$access.hasPermission('EDIT,UPDATE')"
            group="edit"
            name="edit-line"
            size="16"
            @click="editRecord(record)"
          />
          <FIcon
            v-if="$access.hasPermission('DELETE')"
            pressable
            group="action"
            name="delete"
            size="16"
            @click="deleteRecord(record)"
          />
        </FContainer>
      </template>
      <template #[slotList[1].criteria]>
        <FText appearance="bodyReg14">
          {{ details.name }}
        </FText>
      </template>
    </CommonList>
    <BaseSpaceForm
      v-if="showEditForm"
      :isDialogForm="true"
      :parentModule="parentModuleName"
      :parentId="getParentId"
      :recordId="getRecordId"
      :fromSummary="true"
      :fromSpaceList="true"
      :formModuleName="moduleName"
      :isEdit="true"
      @refresh="closeForm"
      @close="closeForm"
    ></BaseSpaceForm>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FAvatar,
  FButton,
  ftoast,
  FIcon,
  fDialog,
  FEmptyState,
} from '@facilio/design-system'
import BaseSpaceForm from '../BaseSpaceForm.vue'
import { CustomModuleData } from '../../../../data/CustomModuleData'
import { CommonList } from '@facilio/ui/new-app'
import { getBaseURL } from '../../../../utils/api/base-url'
import { isWebTabsEnabled, pageTypes, findRouteForTab } from '@facilio/router'
import { API } from '@facilio/api'
import views from '../../../../store/views'
import getProperty from 'dlv'
import { eventBus } from '../../../../components/page-builder/event-bus'
import { isEmpty } from '@facilio/utils/validation'
const viewStore = views()
export default {
  components: {
    FContainer,
    FText,
    FIcon,
    FAvatar,
    BaseSpaceForm,
    FEmptyState,
    CommonList,
    FButton,
  },
  props: [
    'moduleName',
    'list',
    'parentModuleName',
    'fitMyContent',
    'buttonName',
    'details',
  ],
  data() {
    return {
      getBaseURL,
      isEmpty,
      viewDetail: null,
      showForm: false,
      selectedRecord: null,
    }
  },
  async created() {
    await this.getViewDetail()
  },

  mounted() {
    eventBus.$on('refresh-spaceList', this.refreshRecordDetails)
  },
  beforeDestroy() {
    eventBus.$off('refresh-spaceList', this.refreshRecordDetails)
  },
  computed: {
    moduleDisplayName() {
      let { moduleName } = this
      return moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
    },
    routeName() {
      let { name = null } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
      return name
    },
    emptyStateMessage() {
      return `No ${this.moduleName}s have been added yet.`
    },
    getRecordId() {
      let { selectedRecord } = this
      return selectedRecord.id
    },
    getParentId() {
      return getProperty(this, '$route.params.id', null)
    },
    mainFieldAction() {
      return this.routeName ? this.mainFieldRedirection : null
    },
    showEditForm() {
      let { showForm } = this
      return showForm
    },
    decommission() {
      return getProperty(this, 'details.decommission', false)
    },
    modelDataClass() {
      return CustomModuleData
    },
    slotList() {
      return [
        {
          name: 'action',
          isActionColumn: true,
          columnAttrs: {
            width: 130,
            class: 'visibility-visible-actions',
            fixed: 'right',
          },
        },
        { criteria: JSON.stringify({ name: 'site' }) },
      ]
    },
  },
  methods: {
    async getViewDetail() {
      let { moduleName, parentModuleName } = this
      let url = `/v2/views/${parentModuleName}/${moduleName}/hidden-all`
      let params = { moduleName }

      let { data } = await API.get(url, params)
      this.viewDetail = data.viewDetail
    },
    mainFieldRedirection({ record, value }) {
      let { routeName, moduleName } = this
      let { id } = record || {}

      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { moduleName, viewname: 'all', id },
        }).href

        return {
          url: route,
          text: value,
          id,
          clickAction: (field, e) => this.mainFieldClickAction(id, e),
          ...value,
        }
      }
    },
    goToSpaceCreation() {
      this.$emit('openForm')
    },
    async closeForm() {
      await this.refreshRecordDetails()
    },
    async deleteRecord(record) {
      let { moduleDisplayName, moduleName } = this

      let value = await fDialog.danger({
        title: `Delete a ${moduleName}`,
        description: this.$t(
          `portfolio.dialog.warning_${moduleName}`,
          `Are you sure you want to delete this ${moduleName}?`,
          { ns: 'portfolio' }
        ),
        saveText: 'Delete',
      })

      if (value) {
        this.isLoading = true
        try {
          await this.modelDataClass.delete(moduleName, record.id)
          ftoast.success(
            `${moduleDisplayName} ${this.$t(
              'custommodules.list.delete_success'
            )}`
          )
          eventBus.$emit('refresh-tree')
          this.refreshRecordDetails()
        } catch (error) {
          this.showErrorToastMessage(
            error,
            this.$t('custommodules.list.delete_error')
          )
        }
        this.isLoading = false
      }
    },
    async refreshRecordDetails() {
      this.showForm = false
      this.$emit('refresh')
    },
    showErrorToastMessage(error, customMsg) {
      let message = error?.message || customMsg
      ftoast.critical(message)
    },
    editRecord(record) {
      this.selectedRecord = record
      this.showForm = true
    },
    mainFieldClickAction(id, e) {
      let { routeName } = this || {}
      if (routeName) {
        let route = this.$router.resolve({
          name: routeName,
          params: { viewname: 'hidden-all', id },
        }).href
      }
    },
    getManagedBy(space) {
      return space.managedBy?.name ? space.managedBy.name : '__'
    },
    getSite(site) {
      return site?.name ? site.name : '---'
    },
    goToSummary(data) {
      if (isWebTabsEnabled()) {
        let { name = null } = findRouteForTab(pageTypes.PORTFOLIO_SUMMARY) || {}
        if (name) {
          this.$router.push({
            name,
            params: {
              moduleName: this.moduleName,
              viewname: 'all',
              id: data.id,
            },
          })
        }
      }
    },
    getArea(row) {
      let { area = 0 } = row || {}
      if (area == 0) {
        return '---'
      } else {
        return area
      }
    },
  },
}
</script>
