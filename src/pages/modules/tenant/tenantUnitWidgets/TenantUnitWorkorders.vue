<template>
  <FContainer>
    <portal :to="`header-${widget.id}-${widget.name}`">
      <FContainer
        display="flex"
        alignItems="center"
        padding="containerLarge containerXLarge"
        justifyContent="space-between"
        width="100%"
      >
        <FText appearance="headingMed14">
          {{ widget.displayName || widget.name }}
        </FText>
        <FTags
          padding="containerXLarge"
          :text="$t('tenant.last_30_days', 'Last 30 Days', { ns: 'tenant' })"
        />
      </FContainer>
    </portal>
    <FContainer
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      v-if="isLoading"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FContainer
      v-else
      display="flex"
      gap="containerXxLarge"
      flexWrap="nowrap"
      flexDirection="row"
      padding="containerXxLarge containerXLarge"
      overflow="hidden"
      alignItems="center"
      height="100%"
    >
      <FContainer
        padding="containerLarge"
        display="flex"
        width="50%"
        flexDirection="column"
        alignItems="center"
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
      >
        <FText
          appearance="bodyReg14"
          color="backgroundNeutralInverse"
          marginBottom="containerMedium"
        >
          {{ $t('summary.widgets.tenant.open', 'Lease Start Date') }}
        </FText>
        <FButton
          appearance="link"
          size="medium"
          @click="redirectToList('open', totalOpenWorkorders)"
        >
          <FText appearance="headingMed20" color="backgroundPrimaryDefault">
            {{ totalOpenWorkorders }}
          </FText>
        </FButton>
      </FContainer>
      <FContainer
        padding="containerLarge"
        display="flex"
        width="50%"
        flexDirection="column"
        alignItems="center"
        backgroundColor="backgroundMidgroundSubtle"
        borderRadius="high"
      >
        <FText
          appearance="bodyReg14"
          color="backgroundNeutralInverse"
          marginBottom="containerMedium"
        >
          {{ $t('tenant.over_due', 'Overdue', { ns: 'tenant' }) }}
        </FText>
        <FButton
          appearance="link"
          size="medium"
          @click="redirectToList('overdue', totalOverdueWorkorders)"
        >
          <FText appearance="headingMed20" color="backgroundPrimaryDefault">
            {{ totalOverdueWorkorders }}
          </FText>
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
import { findRouteForModule, pageTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { getTimeZone } from '../../../../utils/formatter'

dayjs.extend(timezone)

export default {
  props: ['details', 'widget'],
  components: { FContainer, FSpinner, FText, FTags, FButton },
  data() {
    return {
      totalOpenWorkorders: '---',
      totalOverdueWorkorders: '---',
      isLoading: false,
      isEmpty,
    }
  },
  async created() {
    this.isLoading = true
    await Promise.all([
      this.getOpenWorkordersCount(),
      this.getOverdueWorkordersCount(),
    ])
    this.isLoading = false
  },
  computed: {
    getTime30DaysFromNow() {
      return (dayjs().tz(getTimeZone()) - 2592000000).toString() //2592000000 - a month in milli seconds
    },
  },
  methods: {
    async getOpenWorkordersCount() {
      let filters = JSON.stringify({
        resource: {
          operatorId: 36,
          value: [this.details.id.toString()],
        },
        createdTime: {
          operatorId: 19,
          value: [this.getTime30DaysFromNow],
        },
      })
      let queryParams = {
        withCount: true,
        viewName: 'open',
        includeParentFilter: true,
        moduleName: 'workorder',
        filters,
      }

      let { data, error } = await API.get('/v3/modules/data/count', queryParams)

      if (!error) this.totalOpenWorkorders = data?.count || 0
    },
    async getOverdueWorkordersCount() {
      let filters = JSON.stringify({
        resource: {
          operatorId: 36,
          value: [this.details.id.toString()],
        },
        createdTime: {
          operatorId: 19,
          value: [this.getTime30DaysFromNow],
        },
      })
      let queryParams = {
        withCount: true,
        viewName: 'overdue',
        includeParentFilter: true,
        moduleName: 'workorder',
        orderBy: 'dueDate',
        orderType: 'asc',
        filters,
      }

      let { data, error } = await API.get('/v3/modules/data/count', queryParams)

      if (!error) this.totalOverdueWorkorders = data?.count || 0
    },
    async redirectToList(viewname, value) {
      if (!(value > 0 && this.details?.id)) return

      let filters = {
        resource: {
          operatorId: 36,
          value: [`${this.details.id}`],
        },
        createdTime: {
          operatorId: 19,
          value: [this.getTime30DaysFromNow],
        },
      }
      let query = {
        search: JSON.stringify(filters),
        includeParentFilter: true,
      }
      let { name } = findRouteForModule('workorder', pageTypes.LIST) || {}

      if (name) this.$router.push({ name, params: { viewname, id }, query })
    },
  },
}
</script>
