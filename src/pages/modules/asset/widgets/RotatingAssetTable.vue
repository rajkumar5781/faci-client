<template>
  <div>
    <FNotification
      description="To proceed, kindly exclude the asset from the below Planned Maintenance records."
      intent="warning"
      menuType="alerts"
      rounded
      :hideCloseIcon="true"
    >
    </FNotification>
    <FTable :rounded="false" :columns="column" :data="list">
      <template #[`cell.id`]="{ row }">
        <FText color="textMain">{{ getId(row) }}</FText>
      </template>

      <template #[`cell.view`]="{ row }">
        <FButton
          appearance="link"
          size="small"
          @click="redirectToSummary(row.id)"
        >
          View</FButton
        >
      </template>
    </FTable>
  </div>
</template>
<script>
import {
  FContainer,
  FText,
  FTable,
  FButton,
  FNotification,
} from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
export default {
  components: {
    FContainer,
    FText,
    FTable,
    FButton,
    FNotification,
  },
  props: ['list', 'moduleName'],
  computed: {
    getSummaryName() {
      let { moduleName } = this
      return moduleName === 'plannedmaintenance'
        ? 'pm-summary'
        : 'inspectionTemplateSummary'
    },
  },
  data() {
    return {
      column: [
        {
          displayName: 'ID',
          name: 'id',
          id: 1,
          clickable: true,
        },
        {
          displayName: 'NAME',
          name: 'name',
          id: 2,
        },
        {
          displayName: '',
          name: 'view',
          id: 3,
        },
      ],
    }
  },
  methods: {
    getId(val) {
      return `#${val.id}`
    },
    redirectToSummary(id) {
      let route
      let { name } =
        findRouteForModule(this.moduleName, pageTypes.OVERVIEW) || {}

      if (name) {
        route = this.$router.resolve({
          name,
          params: { viewname: 'all', id },
        }).href
      }
      route && window.open(route, '_blank')
    },
  },
}
</script>
