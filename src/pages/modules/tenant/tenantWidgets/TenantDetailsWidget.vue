<template>
  <FContainer
    display="flex"
    padding="containerXxLarge containerXLarge"
    gap="sectionLarge"
    alignItems="center"
    justifyContent="space-around"
    overflow="scroll"
  >
    <FContainer display="flex" flexDirection="column" justifyContent="center">
      <FText
        appearance="bodyReg14"
        color="textMain"
        marginBottom="containerLarge"
        >{{
          $t('tenant.lease_start_date', 'Lease Start Date', { ns: 'tenant' })
        }}</FText
      >
      <FText appearance="headingMed16" color="textMain">
        {{ getLeaseStartDate }}
      </FText>
    </FContainer>

    <FDivider height="28px" />
    <FContainer display="flex" flexDirection="column" justifyContent="center">
      <FText
        appearance="bodyReg14"
        color="textMain"
        marginBottom="containerLarge"
        >{{
          $t('tenant.lease_end_date', 'Lease End Date', { ns: 'tenant' })
        }}</FText
      >
      <FText appearance="headingMed16" color="textMain">
        {{ getLeaseEndDate }}
      </FText>
    </FContainer>

    <FDivider height="28px"></FDivider>

    <FContainer display="flex" flexDirection="column" justifyContent="center">
      <FText
        appearance="bodyReg14"
        color="textMain"
        marginBottom="containerLarge"
        >{{ $t('tenant.type', 'Type', { ns: 'tenant' }) }}</FText
      >
      <FText
        appearance="headingMed16"
        color="textMain"
        textTransform="uppercase"
      >
        {{ getTenantType }}
      </FText>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FAvatar, FText, FDivider } from '@facilio/design-system'
import { formatDate } from '../../../../utils/formatter'
import getProperty from 'dlv'

export default {
  props: ['details'],
  components: { FContainer, FAvatar, FText, FDivider },
  computed: {
    getDescription() {
      return getProperty(this.details, 'description') || '---'
    },
    getLeaseStartDate() {
      let { inTime } = this.details || {}
      return inTime ? formatDate(inTime, true) : '---'
    },
    getLeaseEndDate() {
      let { outTime } = this.details || {}
      return outTime ? formatDate(outTime, true) : '---'
    },
    getTenantType() {
      let { tenantType } = this.details || {}
      const tenantTypeHash = { 1: 'Commercial', 2: 'Residential' }

      return tenantTypeHash[tenantType] || '---'
    },
    getTenantName() {
      return getProperty(this.details, 'name') || '---'
    },
  },
}
</script>
