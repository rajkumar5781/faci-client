<template>
  <FContainer display="flex" justifyContent="center" alignItems="flex-start">
    <FContainer width="84%" height="100%">
      <FContainer display="flex" justifyContent="space-between">
        <FContainer
          display="flex"
          flexDirection="column"
          rowGap="containerLarge"
          width="80%"
        >
          <FText appearance="headingMed16">{{
            $t(
              'apiclient.efficient_api_integration',
              'Efficient API Integration',
              {
                ns: 'account',
              }
            )
          }}</FText>
          <FText color="textCaption">{{
            $t('apiclient.apiclient_desc', { ns: 'account' })
          }}</FText>
        </FContainer>
        <fc-illustration name="api-client" size="S"></fc-illustration>
      </FContainer>
      <FContainer padding="sectionMedium containerNone">
        <FDivider width="100%" />
      </FContainer>
      <FContainer
        height="80%"
        display="flex"
        flexDirection="column"
        gap="containerXxLarge"
      >
        <FContainer display="flex" justifyContent="space-between">
          <FContainer
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <FText appearance="headingMed20">{{
              $t('apiclient.api_clients', 'API Clients', { ns: 'account' })
            }}</FText>
          </FContainer>
          <FButton @click="handleShowApiForm">{{
            $t('apiclient.add_api_client', { ns: 'account' })
          }}</FButton>
        </FContainer>
        <FContainer height="80%" v-if="isEmpty(apiClientsList)">
          <FContainer
            height="100%"
            border="1px solid"
            borderRadius="high"
            borderColor="borderNeutralBaseSubtler"
          >
            <FEmptyState
              :title="$t('apiclient.no_apiClient', { ns: 'account' })"
              :description="$t('apiclient.description', { ns: 'account' })"
              :vertical="true"
              size="M"
              illustration="no-activities"
            ></FEmptyState>
          </FContainer>
        </FContainer>
        <FContainer maxHeight="88%">
          <FTable
            v-if="!isEmpty(apiClientsList)"
            :columns="column"
            :data="apiClientsList"
          >
            <template #[`cell.authType`]="{ row }">
              <FText v-if="row?.authType" appearance="bodyReg14">
                {{ row.authType === 2 ? 'API Key' : '--' }}
              </FText>
            </template>
            <template #[`cell.createdTime`]="{ row }">
              <FText v-if="row?.createdTime" appearance="bodyReg14">
                {{ apiClientCreatedTime(row.createdTime) }}
              </FText>
              <FText v-else color="textCaption">{{ '--' }}</FText>
            </template>
            <template #[`cell.action`]="{ row }">
              <FContainer>
                <FIcon
                  @click="deleteApiClient(row?.id)"
                  group="action"
                  name="delete"
                  size="16"
                />
              </FContainer>
            </template>
          </FTable>
        </FContainer>
      </FContainer>
    </FContainer>
    <FModal
      v-if="showApiClientForm"
      :title="$t('apiclient.add_api_client', { ns: 'account' })"
      :visible="showApiClientForm"
      :confirmLoading="loading"
      size="S"
      @cancel="handleCancel"
    >
      <FContainer
        display="flex"
        justifyContent="center"
        overflow="scroll"
        height="100%"
        width="100%"
      >
        <FForm
          ref="apiClientForm"
          :model="apiClient"
          :rules="rules"
          position="top"
          class="flex flex-col gap-y-4 p-6 w-7/12 h-72"
        >
          <FFormItem prop="name">
            <FContainer marginBottom="containerMedium">
              <FText appearance="captionReg12" color="textMain">{{
                $t('apiclient.name', 'Name', { ns: 'account' })
              }}</FText>
            </FContainer>
            <FInput
              :placeholder="
                $t('profile.enter_name', 'Enter Name', { ns: 'account' })
              "
              v-model="apiClient.name"
            />
          </FFormItem>
          <FFormItem prop="authType">
            <FContainer marginBottom="containerMedium">
              <FText appearance="captionReg12" color="textMain">{{
                $t('apiclient.client_type', 'Client Type', { ns: 'account' })
              }}</FText>
            </FContainer>
            <FSelect
              v-model="apiClient.authType"
              :placeholder="
                $t('apiclient.select_type', 'Select Type', { ns: 'account' })
              "
              :filterable="true"
              :options="apiClientTypes"
            >
            </FSelect>
          </FFormItem>
        </FForm>
      </FContainer>
      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          justifyContent="flex-end"
        >
          <FButton
            :loading="saving"
            appearance="primary"
            size="medium"
            @click="addApiClient"
          >
            {{ $t('apiclient.confirm', 'Confirm', { ns: 'account' }) }}
          </FButton>
        </FContainer>
      </template>
    </FModal>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FTable,
  FTags,
  FText,
  FIcon,
  FDropdown,
  FSpinner,
  FDivider,
  FButton,
  FModal,
  FForm,
  FFormItem,
  FInput,
  FSelect,
  FEmptyState,
  ftoast,
  fDialog,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { formatDate } from '../../../utils/formatter'
import { isEmpty } from '@facilio/utils/validation'

export default {
  components: {
    FContainer,
    FTable,
    FTags,
    FText,
    FIcon,
    FDropdown,
    FSpinner,
    FDivider,
    FButton,
    FModal,
    FForm,
    FFormItem,
    FInput,
    FSelect,
    FEmptyState,
  },
  data() {
    return {
      isEmpty,
      loading: false,
      saving: false,
      apiClientsList: [],
      apiClient: {
        name: null,
        authType: null,
      },
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
      showApiClientForm: false,
      apiType: null,
      clientId: null,
      token: null,
      canShowSecret: false,
      column: [
        { displayName: 'Name', name: 'name', id: 1, width: '150' },
        {
          displayName: 'Type',
          name: 'authType',
          id: 2,
          width: '150',
        },
        { displayName: 'Client ID', name: 'id', id: 3, width: '150' },
        {
          displayName: 'Created Time',
          name: 'createdTime',
          id: 4,
          width: '200',
        },
      ],
      rules: {
        name: {
          required: true,
          message: 'Please enter name',
          trigger: 'blur',
        },
        authType: {
          required: true,
          message: 'Please select type',
          trigger: 'change',
        },
      },
      apiClientTypes: [
        {
          label: 'API Key',
          value: 2,
        },
        // {
        //   label: 'Oauth2',
        //   value: 1,
        // },
      ],
    }
  },
  created() {
    this.fetchApiClients()
  },
  computed: {
    options() {
      return {
        manualClear: this.manualClear,
        menuType: this.menuType,
        timeout: this.timeout,
      }
    },
  },
  methods: {
    async triggerNotification() {
      let copyToken = await fDialog.info({
        title: 'Secret API Key',
        description:
          'Your API key has been successfully generated. Please copy and securely store the following key for future use: ',
        subInfo: { title: this.token },
        hideCancel: true,
        saveText: 'Copy & Close',
        saveButtonProp: {
          appearance: 'secondary',
          iconGroup: 'files',
          iconName: 'copy',
          iconPosition: 'prefix',
        },
      })
      if (copyToken) {
        await navigator.clipboard.writeText(this.token)
        let { options } = this || {}
        let message = 'Copied !'
        ftoast.success(message, options)
      }
    },
    async fetchApiClients() {
      this.loading = true
      let { error, data } = await API.get(`/v2/dev/listApiClients`)
      if (error) {
        let { options } = this || {}
        let { message } = error || 'Error Occured'
        ftoast.critical(message, options)
      } else {
        this.apiClientsList = data.apiClients
      }
      this.loading = false
    },
    apiClientCreatedTime(createdTime) {
      return formatDate(createdTime)
    },
    async addApiClient() {
      let valid = this.$refs['apiClientForm'].validate()
      if (!valid) return false
      this.saving = true
      let { error, data } = await API.post('/v2/dev/createAPIClient', {
        apiClient: this.apiClient,
      })
      let { options } = this || {}
      if (error) {
        let { message } = error || 'Error Occured'
        ftoast.critical(message, options)
      } else {
        this.clientId = data.clientId
        this.token = data.token
        this.showApiClientForm = true
        let message = this.$t('apiclient.api_client_added', {
          ns: 'account',
        })
        ftoast.success(message, options)
        this.canShowSecret = true
      }
      this.saving = false
      this.apiClient = {
        name: null,
        authType: null,
      }
      this.showApiClientForm = false
      await this.triggerNotification()
      await this.fetchApiClients()
    },
    async deleteApiClient(id) {
      let { error } = await API.post(`/v2/dev/deleteClient`, { id })
      if (error) {
        let { options } = this || {}
        let { message } = error || 'Error Occured'
        ftoast.critical(message, options)
      } else {
        let { options } = this || {}
        let message = this.$t('apiclient.api_deleted_successfully', {
          ns: 'account',
        })
        ftoast.success(message, options)
        await this.fetchApiClients()
      }
    },
    handleShowApiForm() {
      this.showApiClientForm = true
    },
    handleCancel() {
      this.apiClient = {
        name: null,
        authType: null,
      }
      this.showApiClientForm = false
    },
  },
}
</script>
