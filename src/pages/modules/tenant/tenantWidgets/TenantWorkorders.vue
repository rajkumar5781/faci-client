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
        <FTags text="Last 30 Days" padding="containerXLarge" />
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

        <FButton appearance="link" size="medium" @click="goToWoList('open')">
          <FText appearance="headingMed20" color="backgroundPrimaryDefault">
            {{ totalOpenWorkorders }}</FText
          >
        </FButton>
      </FContainer>
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
          {{ $t('summary.widgets.tenant.over_due', 'Overdue') }}
        </FText>

        <FButton appearance="link" size="medium" @click="goToWoList('overdue')">
          <FText appearance="headingMed20" color="backgroundPrimaryDefault">
            {{ totalOverdueWorkorders }}</FText
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

dayjs.extend(timezone)

export default {
  props: ['details', 'widget'],
  components: { FContainer, FSpinner, FText, FTags, FButton },
  data() {
    return {
      totalOpenWorkorders: '---',
      totalOverdueWorkorders: '---',
      isLoading: false,
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
    timeZone() {
      return getTimeZone()
    },
    getTime30DaysFromNow() {
      return (dayjs().tz(this.timeZone) - 2592000000).toString() //2592000000 - a month in milli seconds
    },
  },
  methods: {
    async getOpenWorkordersCount() {
      let queryParams = {
        withCount: true,
        viewName: 'open',
        includeParentFilter: true,
        moduleName: 'workorder',
        filters: JSON.stringify({
          tenant: {
            operatorId: 36,
            value: [this.details.id.toString()],
          },
          createdTime: {
            operatorId: 19,
            value: [this.getTime30DaysFromNow],
          },
        }),
      }

      let { data, error } = await API.get('/v3/modules/data/count', queryParams)
      if (!error) {
        this.totalOpenWorkorders = data?.count || 0
      }
    },
    async getOverdueWorkordersCount() {
      let queryParams = {
        withCount: true,
        viewName: 'overdue',
        includeParentFilter: true,
        moduleName: 'workorder',
        orderBy: 'dueDate',
        orderType: 'asc',
        filters: JSON.stringify({
          tenant: {
            operatorId: 36,
            value: [this.details.id.toString()],
          },
          createdTime: {
            operatorId: 19,
            value: [this.getTime30DaysFromNow],
          },
        }),
      }

      let { data, error } = await API.get('/v3/modules/data/count', queryParams)
      if (!error) {
        this.totalOverdueWorkorders = data?.count || 0
      }
    },
    goToWoList(viewName) {
      if (
        (viewName == 'open' && this.totalOpenWorkorders > 0) ||
        (viewName == 'overdue' && this.totalOverdueWorkorders > 0)
      ) {
        let filters = {
          tenant: [{ operatorId: 36, value: [`${this.details.id}`] }],
        }
        let query = {
          search: JSON.stringify(filters),
          includeParentFilter: true,
        }

        let { name } = findRouteForModule('workorder', pageTypes.LIST) || {}

        if (name) {
          this.$router.push({
            name,
            params: { viewname: viewName },
            query,
          })
        }
      }
    },
  },
}
</script>
