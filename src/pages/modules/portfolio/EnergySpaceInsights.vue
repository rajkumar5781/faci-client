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
import SpaceInsights from './components/CommonEnergySpaceInsights.vue'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import getProperty from 'dlv'
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
            name: this.$t('portfolio.insights.buildings', { ns: 'portfolio' }),
            count: this.count['buildings'],
          },
          {
            name: this.$t('portfolio.insights.independent_spaces', { ns: 'portfolio' }),
            count: this.count['independent_spaces'],
          },
          {
            name: this.$t('portfolio.insights.spaces', { ns: 'portfolio' }),
            count: this.count['spaces'],
          },
          {
            name: this.$t('portfolio.insights.assets', { ns: 'portfolio' }),
            count: this.count['assets'],
          },
          {
            name: this.$t('portfolio.insights.floors', { ns: 'portfolio' }),
            count: this.count['floors'],
          },
          {
            name: this.$t('portfolio.insights.sub_spaces', { ns: 'portfolio' }),
            count: this.count['sub_spaces'],
          },
          {
            name: this.$t('portfolio.insights.meters', { ns: 'portfolio' }),
            count: this.count['meters'],
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
    async fetchSiteInsights(details = {}) {
      let campusId = getProperty(details, 'id')
      let { data, error } = await API.get(
        `/campus/spaceInsights?campusId=${campusId}`
      )
      if (error) {
        this.loading = false
        this.$message.error(
          error?.message || this.$t('portfolio.insights.error', { ns: 'portfolio' })
        )
      } else {
        this.count = getProperty(data, 'reports')
        this.loading = false
      }
    },
    async fetchBuildingInsights(details = {}) {
      let buildingId = getProperty(details, 'id')
      let { data, error } = await API.get(
        `/building/spaceInsights?buildingId=${buildingId}`
      )
      if (error) {
        this.loading = false
        this.$message.error(
          error?.message || this.$t('portfolio.insights.error', { ns: 'portfolio' })
        )
      } else {
        this.count = getProperty(data, 'reports')
        this.loading = false
      }
    },
    async fetchFloorInsights(details = {}) {
      let floorId = getProperty(details, 'id')
      let { data, error } = await API.get(
        `/floor/spaceInsights?floorId=${floorId}`
      )
      if (error) {
        this.loading = false
        this.$message.error(
          error?.message || this.$t('portfolio.insights.error', { ns: 'portfolio' })
        )
      } else {
        this.count = getProperty(data, 'reports')
        this.loading = false
      }
    },
    async fetchSpaceInsights(details = {}) {
      let spaceId = getProperty(details, 'id')
      let { data, error } = await API.get(
        `/space/spaceInsights?spaceId=${spaceId}`
      )
      if (error) {
        this.loading = false
        ftoast.critical(
          error?.message || this.$t('portfolio.insights.error', { ns: 'portfolio' })
        )
      } else {
        this.count = getProperty(data, 'reports')
        this.loading = false
      }
    },
  },
}
</script>
