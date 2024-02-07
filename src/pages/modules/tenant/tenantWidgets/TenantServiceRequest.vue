<template>
  <FContainer>
    <portal :to="`header-${widget.id}-${widget.name}`">
      <FContainer
        display="flex"
        padding="containerLarge containerXLarge"
        justifyContent="space-between"
        width="100%"
        alignItems="center"
      >
        <FText appearance="headingMed14">
          {{ widget.displayName || widget.name }}
        </FText>
        <FTags
          :text="$t('tenant.last_30_days', { ns: 'tenant' })"
          padding="containerXLarge"
        />
      </FContainer>
    </portal>
    <FContainer
      v-if="isLoading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <FSpinner :size="20" />
    </FContainer>

    <FContainer
      v-else
      display="flex"
      gap="containerXxLarge"
      padding="containerXxLarge"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <FContainer
        display="flex"
        padding="containerLarge containerNone"
        flexDirection="column"
        alignItems="center"
        gap="containerMedium"
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
        width="50%"
        height="100%"
        justifyContent="center"
      >
        <FText
          appearance="bodyReg14"
          color="backgroundNeutralInverse"
          marginBottom="containerMedium"
        >
          {{ $t('tenant.open', 'Lease Start Date', { ns: 'tenant' }) }}
        </FText>

        <FButton
          appearance="link"
          size="medium"
          @click="goToServiceRequestList()"
        >
          <FText appearance="headingMed20" color="backgroundPrimaryDefault">
            {{ totalOpenServiceRequest }}</FText
          >
        </FButton>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import {
  FContainer,
  FText,
  FSpinner,
  FTags,
  FButton,
} from '@facilio/design-system'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { getTimeZone } from '../../../../utils/formatter'
import { findRouteForModule, pageTypes } from '@facilio/router'
import dlv from 'dlv'
import { isEmpty } from '@facilio/utils/validation'

dayjs.extend(timezone)

export default {
  props: ['details', 'widget'],
  components: { FContainer, FSpinner, FText, FTags, FButton },
  data() {
    return {
      totalOpenServiceRequest: 0,
      isLoading: false,
      isEmpty,
    }
  },
  async created() {
    this.isLoading = true
    await this.getOpenServiceRequestCount()
    this.isLoading = false
  },
  computed: {
    timeZone() {
      return getTimeZone()
    },
    getTime30DaysFromNow() {
      return (dayjs().tz(this.timeZone) - 2592000000).toString() //2592000000 - a month in milli seconds
    },
    tenantPrimaryContactId() {
      let primaryTenantContact = this.details?.peopleTenantContacts.filter(
        p => p.isPrimaryContact
      )
      if (isEmpty(primaryTenantContact)) {
        return -1
      }
      return primaryTenantContact[0]?.id
    },
  },
  methods: {
    async getOpenServiceRequestCount() {
      if (isEmpty(this.tenantPrimaryContactId)) {
        return
      }
      let queryParams = {
        withCount: true,
        viewName: 'all',
        includeParentFilter: true,
        moduleName: 'serviceRequest',
        filters: JSON.stringify({
          requester: {
            operatorId: 36,
            value: [`${this.tenantPrimaryContactId}`],
          },
          sysCreatedTime: {
            operatorId: 19,
            value: [this.getTime30DaysFromNow],
          },
          oneLevelLookup: {
            moduleState: [
              {
                operatorId: 35,
                criteriaValue: { status: { operatorId: 3, value: ['open'] } },
              },
            ],
          },
        }),
      }

      let { data, error } = await API.get('/v3/modules/data/count', queryParams)
      if (!error) {
        this.totalOpenServiceRequest = data?.count || 0
      }
    },
    async goToServiceRequestList() {
      if (this.totalOpenServiceRequest < 0) {
        return
      }

      let filters = {
        requester: {
          operatorId: 36,
          value: [`${this.tenantPrimaryContactId}`],
        },
        sysCreatedTime: {
          operatorId: 19,
          value: [this.getTime30DaysFromNow],
        },
        oneLevelLookup: {
          moduleState: [
            {
              operatorId: 35,
              criteriaValue: { status: { operatorId: 3, value: ['open'] } },
            },
          ],
        },
      }
      let query = {
        search: JSON.stringify(filters),
        includeParentFilter: true,
        moduleName: 'serviceRequest',
        filters: JSON.stringify(filters),
      }

      let { name } = findRouteForModule('serviceRequest', pageTypes.LIST) || {}
      if (name) {
        this.$router.push({
          name,
          params: { viewname: 'all' },
          query,
        })
      }
    },
  },
}
</script>
