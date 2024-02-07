<template>
  <FModal
    :title="
      $t('roles_access.access_management', 'Access Management', {
        ns: 'account',
      })
    "
    size="M"
    type="default"
    :visible="visiblity"
    :cancelText="$t('previous')"
    @cancel="closeDialog()"
  >
    <FContainer
      v-if="isScopingEnabled"
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding="containerXLarge sectionSmall"
      backgroundColor="backgroundMidgroundSubtle"
    >
      <FSteps :steps="stepsData" :currentStep="currentStep" />
    </FContainer>
    <FContainer
      v-if="loading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="400px"
      minWidth="800px"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else>
      <FContainer
        v-show="currentStep == 1"
        display="flex"
        flexDirection="column"
        minHeight="388px"
        rowGap="containerXxLarge"
        padding="containerXxLarge sectionSmall"
      >
        <FContainer
          padding="containerXLarge containerXxLarge"
          border="1px solid"
          borderRadius="medium"
          borderColor="borderNeutralBaseSubtler"
          backgroundColor="backgroundMidgroundSubtle"
          display="flex"
          flexDirection="column"
        >
          <FContainer display="flex" justifyContent="space-between">
            <FText appearance="headingMed14" color="textDescription">{{
              getHeaderName
            }}</FText>
            <FSwitch
              v-model="userObj[linkNameVsAccessKey[linkName]]"
              size="small"
            ></FSwitch>
          </FContainer>
          <AccessForm
            ref="access-form"
            :selectedSecuritypolicy="selectedSecuritypolicy"
            :userObj="userObj"
            :userData="userData"
            :invitedBy="invitedBy"
            :linkName="linkName"
            :moduleName="moduleName"
            :linkNameVsAccessKey="linkNameVsAccessKey"
            :isNew="isNew[linkName]"
            @loadData="reloadData()"
            @revokeAppAccess="revokeAccess(linkName)"
          />
        </FContainer>
        <FContainer
          v-if="moduleName === 'tenantcontact'"
          padding="containerXLarge containerXxLarge"
          border="1px solid"
          borderRadius="medium"
          borderColor="borderNeutralBaseSubtler"
          backgroundColor="backgroundMidgroundSubtle"
          display="flex"
          flexDirection="column"
        >
          <FContainer display="flex" justifyContent="space-between">
            <FText appearance="headingMed14" color="textDescription">
              {{ $t('roles_access.occupant_portal', { ns: 'account' }) }}
            </FText>
            <FSwitch
              v-model="userObj[linkNameVsAccessKey['service']]"
              size="small"
            ></FSwitch
          ></FContainer>
          <AccessForm
            ref="service-access-form"
            :selectedSecuritypolicy="selectedSecuritypolicy"
            :userObj="userObj"
            :userData="userData"
            :invitedBy="invitedBy"
            linkName="service"
            :moduleName="moduleName"
            :linkNameVsAccessKey="linkNameVsAccessKey"
            :isNew="isNew['service']"
            @loadData="reloadData()"
            @revokeAppAccess="revokeAccess('service')"
          />
        </FContainer>
      </FContainer>
      <FContainer v-if="isScopingEnabled">
        <DataSharing
          ref="data-sharing"
          :user="user"
          v-show="currentStep == 2"
        />
      </FContainer>
    </FContainer>
    <template v-if="currentStep == 1 && isScopingEnabled" #footer>
      <FContainer
        display="flex"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-end"
      >
        <!-- <FButton
          v-if="showSaveButton"
          :loading="saving"
          appearance="primary"
          size="medium"
          @click="save()"
        >
          {{ $t('save', 'Save') }}
        </FButton> -->
        <FButton
          :loading="saving"
          appearance="primary"
          :disabled="
            !userObj[linkNameVsAccessKey[linkName]] &&
            !userObj[linkNameVsAccessKey['service']] &&
            !showSaveButton
          "
          size="medium"
          @click="next"
        >
          {{ $t('next', 'Next') }}
        </FButton>
      </FContainer>
    </template>
    <template v-else #footer>
      <FContainer
        display="flex"
        padding="containerXLarge sectionSmall"
        width="100%"
        borderTop="solid 1px"
        borderColor="borderNeutralBaseSubtler"
        justifyContent="flex-end"
      >
        <FContainer v-if="isScopingEnabled" marginRight="containerLarge">
          <FButton appearance="secondary" size="medium" @click="goToAccessTab">
            {{ $t('previous', 'Previous') }}
          </FButton>
        </FContainer>
        <FButton
          :loading="saving"
          appearance="primary"
          size="medium"
          @click="save()"
        >
          {{ $t('save', 'Save') }}
        </FButton>
      </FContainer>
    </template>
  </FModal>
</template>
<script>
import {
  FContainer,
  FModal,
  FButton,
  FText,
  FSwitch,
  FSelect,
  FTags,
  FDivider,
  FAvatar,
  FCheckbox,
  FSpinner,
  FSteps,
  FInput,
  FForm,
  FFormItem,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import cloneDeep from 'lodash/cloneDeep'
import DataSharing from './DataSharing.vue'
import AccessForm from './PortalAccessForm.vue'
import getProperty from 'dlv'

export default {
  components: {
    FContainer,
    FModal,
    FButton,
    FText,
    FSwitch,
    FSelect,
    FTags,
    FDivider,
    FAvatar,
    FCheckbox,
    DataSharing,
    AccessForm,
    FInput,
    FSpinner,
    FSteps,
    FForm,
    FFormItem,
  },
  props: ['showRolesAndAccess', 'user', 'moduleName', 'linkName'],
  data() {
    return {
      visiblity: this.showRolesAndAccess,
      saving: false,
      loading: false,
      isRevokeAccess: false,
      rolesMap: {},
      userObj: {},
      userData: {},
      invitedBy: {},
      sendInvitation: true,
      selectedSecuritypolicy: -1,
      currentStep: 1,
      stepsData: ['Portal Access', 'Data Sharing'],
      isNew: {
        vendor: false,
        tenant: false,
        client: false,
        service: false,
        employee: false,
      },
      linkNameVsAccessKey: {
        vendor: 'isVendorPortalAccess',
        tenant: 'isTenantPortalAccess',
        client: 'isClientPortalAccess',
        service: 'isOccupantPortalAccess',
        employee: 'isEmployeePortalAccess',
      },
      successMsg: '',
      manualClear: false,
      menuType: 'alerts',
      timeout: 1000,
    }
  },
  created() {
    this.init()
  },
  computed: {
    options() {
      return {
        manualClear: this.manualClear,
        menuType: this.menuType,
        timeout: this.timeout,
      }
    },
    getHeaderName() {
      let { linkName } = this
      if (linkName === 'tenant') {
        return this.$t('roles_access.tenant_portal', 'Tenant Portal', {
          ns: 'account',
        })
      } else if (linkName === 'vendor') {
        return this.$t('roles_access.vendor_portal', 'Vendor Portal', {
          ns: 'account',
        })
      } else if (linkName === 'client') {
        return this.$t('roles_access.client_portal', 'Client Portal', {
          ns: 'account',
        })
      }
    },
    isScopingEnabled() {
      return this.$access.isLicenseEnabled('PEOPLE_USER_SCOPING')
    },
    showSaveButton() {
      let { isNew, linkName, userObj, linkNameVsAccessKey } = this
      let accessKey = linkNameVsAccessKey[linkName]
      let isaccessEnabled
      let isOldForm
      if (linkName === 'tenant') {
        let isTenantAccessEnabled = getProperty(userObj, `${accessKey}`, false)
        let isOccupantAccessEnabled = userObj?.isOccupantPortalAccess || 'false'
        isaccessEnabled = isTenantAccessEnabled && isOccupantAccessEnabled
        isOldForm = !isNew[linkName] || !isNew['service']
      } else {
        isaccessEnabled = getProperty(userObj, `${accessKey}`, false)
        isOldForm = !isNew[linkName]
      }
      return !isaccessEnabled && isOldForm
    },
  },
  methods: {
    async init() {
      this.loading = true
      let { linkName, linkNameVsAccessKey } = this
      let allowedLinkNames
      let { user } = this
      this.userObj = cloneDeep(user) || {}
      let { rolesMap } = user
      this.rolesMap = cloneDeep(rolesMap) || {}
      if (linkName === 'tenant') {
        allowedLinkNames = ['tenant', 'service']
      } else {
        allowedLinkNames = [linkName]
      }
      allowedLinkNames.forEach(appLinkName => {
        this.isNew[appLinkName] = this.isNewUser(this.rolesMap, appLinkName)
        let accessKey = linkNameVsAccessKey[linkName]
        this.$set(this.userObj, accessKey, user[accessKey])
      })
      await this.getUserData()

      this.loading = false
    },
    async getUserData() {
      let { userObj } = this
      let { id } = userObj || {}
      let { data, error } = await API.get(
        '/v2/application/users/getUserFromPeopleId',
        {
          peopleId: id,
          moduleName: this.moduleName,
        }
      )
      if (error) {
        this.$t('error', 'Error Occcured')
      } else {
        this.userData = getProperty(data, 'user', null)
        this.invitedBy = getProperty(data, 'invitedBy', null)
        this.selectedSecuritypolicy = this.userData?.securityPolicyId || -1
      }
    },
    isNewUser(rolesMap, linkName) {
      return isEmpty(rolesMap[linkName])
    },
    closeDialog(isSave = false) {
      this.visiblity = false
      if (isSave) this.$emit('onSave')
      else this.$emit('onClose')
    },
    next() {
      let { rolesMap, userObj, linkNameVsAccessKey, linkName } = this
      if (userObj[linkNameVsAccessKey[linkName]]) {
        let serializedData = this.$refs['access-form'].getSerializedData() || {}
        let { invalid } = serializedData || {}
        if (invalid) {
          return
        }
        let { linkName, role, securityPolicyId, password, sendInvitation } =
          serializedData || {}
        rolesMap[linkName] = role
        this.selectedSecuritypolicy = securityPolicyId
        this.password = password
        this.sendInvitation = sendInvitation
      }
      if (userObj[linkNameVsAccessKey['service']]) {
        let serializedServiceData =
          this.$refs['service-access-form'].getSerializedData() || {}
        let {
          role: serviceRole,
          securityPolicyId: serviceSecurityPolicyId,
          password: servicepassword,
          sendInvitation: serviceSendInvitation,
        } = serializedServiceData || {}
        rolesMap['service'] = serviceRole
        this.selectedSecuritypolicy = serviceSecurityPolicyId
        this.password = servicepassword
        this.sendInvitation = serviceSendInvitation
      }
      this.currentStep = 2
    },
    goToAccessTab() {
      this.currentStep = 1
    },
    save(isRevokeAccess = false) {
      let { rolesMap, userObj } = this
      if (this.isScopingEnabled) {
        let data = this.$refs['data-sharing'].getData() || {}
        userObj.scopingId = data?.scopingId
        userObj.permissionSets = data?.permissionSets
      }
      let userRolesMap = userObj.rolesMap || {}
      rolesMap = { ...userRolesMap, ...rolesMap }
      this.saving = true
      if (isRevokeAccess) {
        this.successMsg = this.$t('roles_access.app_access_revoked', {
          ns: 'account',
        })
      } else {
        this.successMsg = this.$t('roles_access.role_updated_successfully', {
          ns: 'account',
        })
      }
      this.savePortalUser({
        ...userObj,
        rolesMap,
      })
        .then(() => {
          this.closeDialog(true)
        })
        .catch(() => {})
        .finally(() => (this.saving = false))
    },
    async savePortalUser(userObj) {
      let {
        id,
        email,
        rolesMap,
        scopingId,
        permissionSets,
        isTenantPortalAccess,
        isOccupantPortalAccess,
        isVendorPortalAccess,
        isClientPortalAccess,
        isEmployeePortalAccess,
      } = userObj || {}

      let {
        options,
        selectedSecuritypolicy,
        sendInvitation,
        password,
        successMsg,
      } = this

      if (isEmpty(email)) {
        ftoast.critical(
          this.$t('roles_access.enter_valid_email', {
            ns: 'account',
          }),
          options
        )
        return
      }

      let { moduleName } = this
      let params = {
        data: {
          id,
          rolesMap,
          scopingId,
          permissionSets,
          selectedSecuritypolicy,
          sendInvitation,
          password,
        },
        moduleName,
        id,
      }

      if (moduleName === 'tenantcontact') {
        params.data.isTenantPortalAccess = isTenantPortalAccess
        params.data.isOccupantPortalAccess = isOccupantPortalAccess
      } else if (moduleName === 'vendorcontact') {
        params.data.isVendorPortalAccess = isVendorPortalAccess
      } else if (moduleName === 'clientcontact') {
        params.data.isClientPortalAccess = isClientPortalAccess
      } else if (moduleName === 'employee') {
        params.data.isEmployeePortalAccess = isEmployeePortalAccess
      }

      let { error } = await API.updateRecord(moduleName, params)

      if (error) {
        ftoast.critical(
          this.$t('user_management.error_occurred', { ns: 'account' }),
          options
        )
      } else {
        ftoast.success(successMsg, options)
      }
    },
    revokeAccess(linkName) {
      let { linkNameVsAccessKey, userObj } = this
      userObj[linkNameVsAccessKey[linkName]] = false
      this.save(true)
    },
    reloadData() {
      this.init()
    },
  },
}
</script>
