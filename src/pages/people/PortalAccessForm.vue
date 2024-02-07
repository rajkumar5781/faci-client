<template>
  <FContainer v-if="userObj[linkNameVsAccessKey[linkName]]">
    <FContainer
      v-if="loading"
      marginTop="containerLarge"
      display="flex"
      flexDirection="column"
      rowGap="containerXLarge"
    >
      <FShimmer :rounded="false" :height="61" />
      <FShimmer :rounded="false" :height="58" />
      <FShimmer v-if="isNew" :rounded="false" :height="21" />
      <FShimmer v-if="!isNew" :rounded="false" :height="108" />
    </FContainer>
    <FForm
      v-else
      ref="access-form"
      :rules="rules"
      :model="formData"
      class="flex flex-col gap-y-3"
    >
      <FFormItem prop="role">
        <FText appearance="captionReg12" color="textMain">
          {{ $t('roles_access.role', 'Role', { ns: 'account' }) }}
        </FText>
        <FSelect
          v-model="formData.role"
          :options="roleList[linkName]"
          :placeholder="rolePlaceholder"
          :loading="rolesLoading[linkName]"
          :clearable="false"
        ></FSelect>
      </FFormItem>
      <FFormItem
        :label="
          $t('user_management.security_policy', 'Security Policy', {
            ns: 'account',
          })
        "
      >
        <FSelect
          v-model="formData.securityPolicyId"
          :options="securityPolicies"
          :placeholder="secPolicyPlaceholder"
          :loading="securityPolicyloading"
          :clearable="false"
        ></FSelect>
      </FFormItem>
      <FContainer
        v-if="!isExistingUser"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        rowGap="containerXLarge"
      >
        <FCheckbox :disabled="false" v-model="checked" :indeterminate="false">{{
          $t('user_management.send_invitation', 'Send Invitation', {
            ns: 'account',
          })
        }}</FCheckbox>
        <FContainer v-if="!checked" width="50%">
          <FInput
            v-model="password"
            :placeholder="
              $t(
                'user_management.enter_password',
                'Enter Password (Optional)',
                {
                  ns: 'account',
                }
              )
            "
            size="medium"
          />
        </FContainer>
      </FContainer>
      <UserDetails
        v-if="userObj[linkNameVsAccessKey[linkName]] && !isNew"
        :userData="userData"
        :invitedBy="invitedBy"
        :appLinkName="linkName"
        :moduleName="moduleName"
        @revokeAccess="revokeAccess()"
        @reloadUserData="loadUserData()"
      />
    </FForm>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FSwitch,
  FSelect,
  FCheckbox,
  FInput,
  FForm,
  FFormItem,
  FShimmer,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import UserDetails from './UserDetails.vue'
import { eventBus } from '../../components/page-builder/event-bus.js'
import getProperty from 'dlv'

export default {
  components: {
    FContainer,
    FText,
    FSwitch,
    FSelect,
    FCheckbox,
    FInput,
    FForm,
    FFormItem,
    FShimmer,
    UserDetails,
  },
  props: [
    'userObj',
    'linkName',
    'linkNameVsAccessKey',
    'isNew',
    'userData',
    'invitedBy',
    'selectedSecuritypolicy',
    'moduleName',
  ],
  data() {
    return {
      roleList: {},
      formData: { role: null, securityPolicyId: -1 },
      loading: false,
      rolesLoading: {
        vendor: false,
        tenant: false,
        client: false,
        service: false,
        employee: false,
      },
      sendInvitation: true,
      rolePlaceholder: 'Select Role',
      securityPolicies: [],
      secPolicyPlaceholder: 'Select Security Policy',
      securityPolicyloading: false,
      isExistingUser: false,
      checked: true,
      password: null,
      rules: {
        role: {
          required: true,
          validator: value => {
            value = getProperty(this, `formData.role`, null)
            if (isEmpty(value)) {
              return {
                errorMessage: this.$t(
                  'roles_access.select_role',
                  'Please select role',
                  {
                    ns: 'account',
                  }
                ),
                invalid: true,
              }
            }
          },
        },
      },
    }
  },
  created() {
    this.init()
    eventBus.$on('updated-securitypolicy', newVal => {
      this.formData.securityPolicyId = newVal
    })
    eventBus.$on('updated-state', newVal => {
      this.checked = newVal
    })
    eventBus.$on('updated-password', newVal => {
      this.password = newVal
    })
  },
  watch: {
    checked(newVal, oldVal) {
      if (!newVal) this.sendInvitation = false
      else this.sendInvitation = true
      eventBus.$emit('updated-state', newVal)
    },
    securityPolicyId(newVal, oldVal) {
      this.formData.securityPolicyId = this.selectedSecuritypolicy
      eventBus.$emit('updated-securitypolicy', newVal)
    },
    password(newVal, oldVal) {
      eventBus.$emit('updated-password', newVal)
    },
  },
  computed: {
    securityPolicyId() {
      return this.formData?.securityPolicyId
    },
  },
  methods: {
    async init() {
      this.loading = true
      this.formData.securityPolicyId = this.selectedSecuritypolicy
      let { rolesMap } = this.userObj
      let { linkName } = this
      this.formData.role = getProperty(rolesMap, `${linkName}`, null)
      await this.fetchRoles(linkName)
      await this.getUser(linkName)
      await this.fetchSecurityPolicy()
      this.loading = false
    },
    async fetchRoles(linkName) {
      this.rolesLoading[linkName] = true
      let filters = JSON.stringify({ appLinkNames: [linkName] })

      let { error, data } = await API.get('/v3/picklist/role', { filters })

      if (error) {
        this.$t('error', 'Error Occcured')
      } else {
        let { pickList } = data || {}
        this.roleList[linkName] = pickList || []
      }
      this.rolesLoading[linkName] = false
    },
    async fetchSecurityPolicy() {
      this.securityPolicyloading = true
      let securityPolicy = {
        label: 'None',
        value: -1,
      }
      let { error, data } = await API.get(
        `v2/getAllSecurityPolicies/${this.moduleName}`
      )
      if (error) {
        // this.$message.error(error.message || 'Error Occurred')
      } else {
        let { securityPolicies } = data
        securityPolicies.forEach(securityPolicy => {
          let record = {
            label: securityPolicy.name || {},
            value: securityPolicy.id || {},
          }
          this.securityPolicies.push(record)
        })
        this.securityPolicies.push(securityPolicy)
      }
      this.securityPolicyloading = false
    },
    async getUser(appLinkName) {
      let { userObj } = this
      let { email } = userObj || {}
      let { data, error } = await API.get('/v2/application/users/getIamUser', {
        email,
        appLinkName,
        moduleName: this.moduleName,
      })
      if (error) {
        // this.$message.error(errorObj.message || 'Error Occured')
      } else {
        let existingIamUser = data?.user
        if (!isEmpty(existingIamUser)) {
          this.isExistingUser = true
        }
      }
    },
    getSerializedData() {
      let valid = this.$refs['access-form'].validate()
      if (!valid) {
        return { invalid: true }
      }
      let { password, linkName, formData, sendInvitation } = this
      let securityPolicyId = formData?.securityPolicyId
      let role = formData?.role
      let data = {
        role,
        securityPolicyId,
        password,
        linkName,
        sendInvitation,
      }
      return data
    },
    revokeAccess() {
      this.$emit('revokeAppAccess')
    },
    loadUserData() {
      this.$emit('loadData')
    },
  },
}
</script>
