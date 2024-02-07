<template>
  <div>
    <FContainer v-if="showEmptyState" height="100%">
      <FEmptyState
        illustration="no-entries"
        size="S"
        :title="$t('empty_state_for_occupant', { ns: 'tenant' })"
        :description="
          $t('empty_state_description_for_occupant', { ns: 'tenant' })
        "
        :vertical="false"
      />
    </FContainer>
    <FContainer
      v-else
      display="flex"
      padding="containerXxLarge containerXLarge"
      alignItems="center"
      columnGap="containerXxLarge"
      @click="redirectToOverview()"
      cursor="pointer"
    >
      <FAvatar
        size="XL"
        :userName="tenantPrimaryName"
        marginRight="containerXxLarge"
      />

      <FContainer
        display="flex"
        flexWrap="nowrap"
        flexDirection="column"
        rowGap="containerLarge"
      >
        <FText appearance="headingMed14">
          {{ tenantPrimaryName }}
        </FText>

        <FContainer
          display="flex"
          alignItems="center"
          columnGap="containerMedium"
        >
          <FIcon
            group="communication"
            name="mail"
            size="16"
            color="iconNeutralMedium"
            :pressable="false"
          ></FIcon>
          <FText appearance="bodyReg14" color="backgroundNeutralInverse">
            {{ tenantPrimaryEmail }}
          </FText>
        </FContainer>
        <FContainer
          display="flex"
          alignItems="center"
          columnGap="containerMedium"
        >
          <FIcon
            group="default"
            name="call"
            size="16"
            color="iconNeutralMedium"
            :pressable="false"
          ></FIcon>
          <FText appearance="bodyReg14" color="backgroundNeutralInverse">
            {{ tenantPrimaryPhone }}
          </FText>
        </FContainer>
      </FContainer>
    </FContainer>
  </div>
</template>
<script>
import {
  FContainer,
  FAvatar,
  FText,
  FIcon,
  FEmptyState,
} from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'
export default {
  props: ['details'],
  components: { FContainer, FAvatar, FText, FIcon, FEmptyState },
  data: () => ({ isEmpty }),
  computed: {
    tenantPrimaryName() {
      return getProperty(this.details, 'primaryContactName', '---')
    },
    tenantPrimaryPhone() {
      return getProperty(this.details, 'primaryContactPhone', '---')
    },
    tenantPrimaryEmail() {
      return getProperty(this.details, 'primaryContactEmail', '---')
    },
    showEmptyState() {
      let name = getProperty(this.details, 'primaryContactName', null)
      let phone = getProperty(this.details, 'primaryContactPhone', null)
      let email = getProperty(this.details, 'primaryContactEmail', null)
      return isEmpty(name) && isEmpty(phone) && isEmpty(email)
    },
  },
  methods: {
    redirectToOverview() {
      let { name } =
        findRouteForModule('tenantcontact', pageTypes.OVERVIEW) || {}

      if (name) {
        let { peopleTenantContacts: tenantContacts } = this.details || {}
        let { id } = (tenantContacts || []).find(t => t.isPrimaryContact) || {}

        this.$router.push({ name, params: { id, viewname: 'all' } })
      }
    },
  },
}
</script>
