<template>
  <FContainer>
    <FContainer
      display="flex"
      justifyContent="center"
      marginTop="containerXxLarge"
    >
      <FContainer
        minHeight="370px"
        width="370px"
        display="flex"
        flexDirection="column"
        class="gap-y-4"
      >
        <FContainer display="flex" flexDirection="column" class="gap-y-1">
          <FContainer display="flex" flexDirection="row" alignItems="center">
            <FText
              appearance="captionReg12"
              color="textMain"
              marginRight="containerLarge"
              >{{ $t('roles_access.user_scoping', { ns: 'account' }) }}</FText
            >
          </FContainer>
          <FSelect
            v-model="scopingId"
            :options="userScopingList"
            :placeholder="$t('select')"
            :loading="fetchScopingLoading"
          />
        </FContainer>
        <FContainer
          v-if="$access.isLicenseEnabled('PERMISSION_SET')"
          display="flex"
          flexDirection="column"
          class="gap-y-1"
        >
          <FContainer display="flex" flexDirection="row" alignItems="center">
            <FText
              appearance="captionReg12"
              color="textMain"
              marginRight="containerLarge"
              >{{ $t('roles_access.permission_set', { ns: 'account' }) }}</FText
            >
          </FContainer>
          <FSelect
            v-model="permissionSets"
            :options="permissionSetsList"
            :placeholder="$t('select')"
            :loading="fetchPermissionSetsloading"
            :clearable="true"
            :multiple="true"
          />
          <FContainer display="flex" gap="containerMedium">
            <FContainer
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FIcon
                group="action"
                name="info"
                size="14"
                color="iconNeutralLight"
                :pressable="false"
              />
            </FContainer>
            <FText appearance="captionReg12" color="textCaption">{{
              $t('roles_access.data_sharing_desc', { ns: 'account' })
            }}</FText>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FModal,
  FButton,
  FText,
  FSelect,
  FIcon,
  ftoast,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import getProperty from 'dlv'

export default {
  props: ['user'],
  components: { FContainer, FModal, FButton, FText, FSelect, FIcon },
  data() {
    return {
      saving: false,
      loading: false,
      userScopingList: [],
      scopingId: null,
      fetchScopingLoading: false,
      fetchPermissionSetsloading: false,
      permissionSets: [],
      permissionSetsList: [],
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
  },
  methods: {
    async init() {
      let { user } = this
      let { scopingId, permissionSets } = user || {}
      this.permissionSets = permissionSets
      this.scopingId = scopingId
      await this.fetchUserScopingList()
      await this.fetchPermissionSets()
    },
    async fetchUserScopingList(force = true) {
      this.fetchScopingLoading = true
      let { error, data } = await API.get(
        `/v2/scoping/list?perPage=50&page=1`,
        { force }
      )
      if (error) {
        let msg = error.message || this.$t('error', 'Error Occured')
        ftoast.critical(msg, this.options)
      } else {
        let userScopingList = getProperty(data, 'userScopingList', [])
        userScopingList.forEach(userScope => {
          let record = {
            label: userScope.scopeName || {},
            value: userScope.id || {},
          }
          this.userScopingList.push(record)
        })
      }
      this.fetchScopingLoading = false
    },
    async fetchPermissionSets() {
      this.fetchPermissionSetsloading = true
      let { error, data } = await API.get(
        '/v2/permissionSets/list?perPage=50&page=1'
      )
      if (error) {
        let msg = error.message || this.$t('error', 'Error Occured')
        ftoast.critical(msg, this.options)
      } else {
        let { permissionSet } = data || {}
        permissionSet.forEach(permissionSetList => {
          let permission = {
            label: permissionSetList.displayName || {},
            value: permissionSetList.id || {},
          }
          this.permissionSetsList.push(permission)
        })
      }
      this.fetchPermissionSetsloading = false
    },
    getData() {
      let { scopingId, permissionSets } = this
      let data = { scopingId, permissionSets }
      return data
    },
  },
}
</script>
