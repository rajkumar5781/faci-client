<script>
import ServiceOrders from './ServiceOrders.vue'

export default {
  name: 'PreGeneratedServiceOrders',
  extends: ServiceOrders,
  data() {
    return {
      columns: [
        {
          displayName: 'Name',
          name: 'name',
          id: 1,
          fixed: true,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Created Time',
          name: 'createdTime',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Preferred Start Time',
          name: 'preferredStartTime',
          id: 3,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Preferred End Time',
          name: 'preferredEndTime',
          id: 4,
          resize: true,
          width: 200,
        },
      ],
    }
  },
  computed: {
    filters() {
      let { details } = this
      let { id } = details
      return {
        servicePlannedMaintenance: {
          operatorId: 36,
          value: [id + ''],
        },
        oneLevelLookup: {
          status: [
            {
              operatorId: 35,
              criteriaValue: { status: { operatorId: 3, value: ['upcoming'] } },
            },
          ],
        },
      }
    },
  },
}
</script>
