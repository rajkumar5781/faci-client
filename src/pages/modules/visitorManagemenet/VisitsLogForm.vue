<template>
  <FModal
    :title="
      $t('visitor_type_form.title', 'Choose Visitor Type', {
        ns: 'visitor',
      })
    "
    :visible="isVisible"
    size="S"
    :hideFooter="true"
    padding="containerNone"
    @cancel="closeForm"
  >
    <FContainer padding="sectionXSmall sectionSmall">
      <VisitsLogFormShimmer v-if="loading"> </VisitsLogFormShimmer>
      <FContainer
        v-else-if="isEmpty(visitorTypes)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FEmptyState
          title="no visitor"
          illustration="no-entries"
          :vertical="true"
          size="S"
        ></FEmptyState>
      </FContainer>

      <FContainer
        v-else
        display="flex"
        justifyContent="flex-start"
        maxHeight="358px"
        overflow="scroll"
        flexWrap="wrap"
      >
        <FContainer
          v-for="visitorType in visitorTypes"
          :key="visitorType.id"
          width="118px"
          height="118px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          padding="containerXLarge"
          @click="$emit('loadForm', visitorType)"
        >
          <FIcon
            :group="getIconGroupName(visitorType)"
            :name="getIconName(visitorType)"
            size="36"
          />
          <FText>
            {{ visitorType.name }}
          </FText>
        </FContainer>
      </FContainer>
      <FContainer
        v-if="showInviteCode"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <FButton @click="openInviteCodeForm" appearance="link">
          {{
            $t('visitor_type_form.invite_code', 'Have an Invite code?', {
              ns: 'visitor',
            })
          }}
        </FButton>
      </FContainer>
    </FContainer>
  </FModal>
</template>
<script>
import { API } from '@facilio/api'
import { getApp } from '@facilio/router'
import getProperty from 'dlv'
import {
  FSpinner,
  FContainer,
  FModal,
  FText,
  FEmptyState,
  FButton,
  ftoast,
  FIcon,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import VisitsLogFormShimmer from './VisitsLogFormShimmer.vue'

const visitorTypeIconGroupNameHash = {
  'kiosk-guest': 'modules',
  'kiosk-vendor': 'modules',
  'kiosk-employee': 'webtabs',
  'kiosk-custom': 'modules',
  'kiosk-delivery': 'map-travel',
  employee: 'default',
  electrician: 'default',
  student: 'user',
  doc: 'default',
  'kiosk-message': 'labour',
}

const visitorTypeIconNameHash = {
  'kiosk-guest': 'tenant',
  'kiosk-vendor': 'vendor',
  'kiosk-employee': 'service_request',
  'kiosk-custom': 'job-plan',
  'kiosk-delivery': 'vehicle',
  employee: 'community',
  electrician: 'building',
  student: 'users',
  doc: 'user',
  'kiosk-message': 'outline-labour',
}

export default {
  props: ['showInviteCode', 'moduleName'],
  components: {
    FSpinner,
    FContainer,
    FText,
    FModal,
    FText,
    FEmptyState,
    FButton,
    ftoast,
    FIcon,
    VisitsLogFormShimmer,
  },
  data() {
    return {
      loading: false,
      visitorTypes: [],
      appId: null,
      isVisible: true,
      isEmpty,
    }
  },
  created() {
    this.loadVisitorTypes()
  },
  methods: {
    async loadVisitorTypes() {
      this.loading = true
      let param = { parentModuleName: this.moduleName }
      let { list, error } = await API.fetchAll('visitorType', param)

      if (error) {
        ftoast.critical(
          error?.message || this.$t('error_occurred', 'Error occured')
        )
      } else {
        this.visitorTypes = (list || []).filter(v => v.enabled)
      }
      //temp hardcoded for nmdp employee portal will be removed
      this.appId = (getApp() || {}).id
      if (this.appId === 1511 && this.$account.org.orgId === 429) {
        this.visitorTypes = this.visitorTypes.filter(v => v.id !== 6) || [] //Excluded Vendor type
      }
      this.loading = false
    },
    openInviteCodeForm() {
      this.$emit('openInviteCode')
    },
    closeForm() {
      this.isVisible = false
      this.$emit('onClose')
    },
    getIconName(visitorType) {
      let name = getProperty(visitorType, 'visitorLogoEnum.value')
      return visitorTypeIconNameHash[name]
    },
    getIconGroupName(visitorType) {
      let name = getProperty(visitorType, 'visitorLogoEnum.value')
      return visitorTypeIconGroupNameHash[name]
    },
  },
}
</script>
