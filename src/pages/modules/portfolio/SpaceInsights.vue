<template>
  <FContainer style="height: 100%">
    <FContainer v-if="isLoading" height="100%" width="100%">
      <FShimmer :rounded="false" />
    </FContainer>
    <SpaceInsights
      v-else
      :record="details"
      :slotList="slotList"
      :moduleName="moduleName"
    ></SpaceInsights>
  </FContainer>
</template>
<script>
import { FContainer, ftoast, FShimmer } from '@facilio/design-system'
import SpaceInsights from './components/CommonSpaceInsights.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
export default {
  components: {
    FContainer,
    SpaceInsights,
    FShimmer,
  },
  props: [
    'url',
    'moduleName',
    'isActive',
    'portalName',
    'emptyStateMsg',
    'goToSummary',
    'widget',
    'details',
  ],
  created() {
    this.init()
  },
  watch: {
    count(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.slotList = [
          {
            name: 'Buildings',
            count: this.count['buildings'],
          },
          {
            name: 'Independent Spaces',
            count: this.count['independent_spaces'],
          },
          {
            name: 'Spaces',
            count: this.count['spaces'],
          },
          {
            name: 'Assets',
            count: this.count['assets'],
          },
          {
            name: 'Floors',
            count: this.count['floors'],
          },
          {
            name: 'Sub Spaces',
            count: this.count['sub_spaces'],
          },
        ]
      }
    },
  },
  computed: {
    isLoading() {
      let { loading } = this || {}
      return loading
    },
  },
  data() {
    return {
      count: {},
      slotList: [],
      loading: false,
    }
  },
  methods: {
    async init() {
      let { details } = this
      this.loading = true
      if (!isEmpty((details || {}).id)) {
        if (this.moduleName == 'site') {
          this.fetchSiteInsights(details)
        } else if (this.moduleName == 'building') {
          this.fetchBuildingInsights(details)
        } else if (this.moduleName == 'floor') {
          this.fetchFloorInsights(details)
        } else {
          this.fetchSpaceInsights(details)
        }
      }
    },
    async fetchSiteInsights(details) {
      let campusId = (details || {}).id
      let { data, error } = await API.get(
        `/campus/spaceInsights?campusId=${campusId}`
      )
      if (error) {
        this.loading = false
        this.$message.error(
          error?.message || 'Error Occured while fetching insights'
        )
      } else {
        this.count = data?.reports
        this.loading = false
      }
    },
    async fetchBuildingInsights(details) {
      let buildingId = (details || {}).id
      let { data, error } = await API.get(
        `/building/spaceInsights?buildingId=${buildingId}`
      )
      if (error) {
        this.loading = false
        this.$message.error(
          error?.message || 'Error Occured while fetching insights'
        )
      } else {
        this.count = data?.reports
        this.loading = false
      }
    },
    async fetchFloorInsights(details) {
      let floorId = (details || {}).id
      let { data, error } = await API.get(
        `/floor/spaceInsights?floorId=${floorId}`
      )
      if (error) {
        this.loading = false
        this.$message.error(
          error?.message || 'Error Occured while fetching insights'
        )
      } else {
        this.count = data?.reports
        this.loading = false
      }
    },
    async fetchSpaceInsights(details) {
      let spaceId = (details || {}).id
      let { data, error } = await API.get(
        `/space/spaceInsights?spaceId=${spaceId}`
      )
      if (error) {
        this.loading = false
        ftoast.critical(
          error?.message || 'Error Occured while fetching insights'
        )
      } else {
        this.count = data?.reports
        this.loading = false
      }
    },
  },
}
</script>
