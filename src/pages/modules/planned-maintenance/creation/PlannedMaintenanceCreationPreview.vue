<template>
  <FContainer display="flex" flexDirection="column" alignItems="center">
    <FContainer display="flex" flexDirection="column">
      <FContainer
        paddingTop="containerXxLarge"
        paddingBottom="sectionSmall"
        position="sticky"
        zIndex="20"
        top="0px"
        backgroundColor="backgroundContainer"
        width="100%"
      >
        <PlannedMaintenanceConfigurationHeader
          :description="
            $t('pm_creation.preview_header_description', { ns: 'maintenance' })
          "
          :heading="$t('pm_creation.preview', { ns: 'maintenance' })"
          headingAppearance="headingMed16"
          descriptionAppearance="bodyReg14"
        />
      </FContainer>

      <FContainer display="flex" flexDirection="column" class="w-[700px]">
        <!-- Configuration Preview Container -->
        <FContainer
          border="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          borderRadius="high"
          padding="sectionSmall"
          marginTop="containerXxLarge"
        >
          <FText appearance="headingMed14" color="textMain">
            {{ $t('pm_creation.configuration', { ns: 'maintenance' }) }}
          </FText>
          <FContainer marginTop="sectionSmall">
            <PlannedMaintenanceConfigurationPreview
              marginTop="sectionSmall"
              :pmProps="pmProps"
            />
          </FContainer>
        </FContainer>

        <!-- Planner Preview Container -->
        <FContainer
          border="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          borderRadius="high"
          padding="sectionSmall"
          marginTop="containerXxLarge"
        >
          <FText appearance="headingMed14" color="textMain">
            {{ $t('pm_creation.planner', { ns: 'maintenance' }) }}
          </FText>

          <FContainer v-if="isPlannerListLoading" marginTop="sectionSmall">
            <FShimmer :height="300" :width="650" />
          </FContainer>
          <FContainer
            v-else
            marginTop="sectionSmall"
            v-for="planner in plannerList"
            :key="planner.id"
          >
            <PlannerPreviewItem
              marginTop="sectionSmall"
              :planner="planner"
              :pmRecord="pmRecord"
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>

<script>
import { FContainer, FText, FShimmer, ftoast } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import PlannerPreviewItem from './PlannerPreviewItem.vue'
import PlannedMaintenanceConfigurationPreview from './PlannedMaintenanceConfigurationPreview.vue'
import PlannedMaintenanceConfigurationHeader from './PlannedMaintenanceConfigurationHeader.vue'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'

export default {
  name: 'PlannedMaintenanceCreationPreview',

  components: {
    FContainer,
    FText,
    FShimmer,
    PlannerPreviewItem,
    PlannedMaintenanceConfigurationPreview,
    PlannedMaintenanceConfigurationHeader,
  },

  props: {
    pmProps: {
      type: Object,
      required: true,
    },
    pmRecord: {
      type: Object,
      default: () => {},
    },
    isPmLoading: {
      type: Boolean,
      require: true,
    },
  },

  data() {
    return {
      plannerList: [],
      // Loading states
      isPlannerListLoading: false,
    }
  },

  computed: {},

  async created() {
    await this.loadPm()
    this.loadPlanners({ skipLoading: false })
  },

  methods: {
    /**
     * loadPlanners fetches the Planners
     */
    async loadPlanners(props) {
      // To decided if we have to load the planners list,
      // not needed while adding new planner.
      let moduleName = 'pmPlanner'
      let { skipLoading } = props || {}
      if (!skipLoading) {
        this.isPlannerListLoading = true
      }
      let { pmProps } = this || {}
      let { id } = pmProps || {}
      let params = {}
      if (!isEmpty(id)) {
        let filters = JSON.stringify({
          pmId: { operatorId: 9, value: [`${id}`] },
        })
        params = { ...params, filters }
      }
      let { list, error } = await API.fetchAll(moduleName, params, {
        force: true,
      })
      if (isEmpty(error)) {
        this.plannerList = list
      }
      if (!skipLoading) {
        this.isPlannerListLoading = false
      }
    },

    async onSave() {
      let { pmProps, viewname } = this || {}
      let { id: pmId } = pmProps || {}

      this.$emit('updateIsSaving', true)

      let { error } = await API.post('/v3/plannedmaintenance/publish', { pmId })
      if (!isEmpty(error)) {
        ftoast.critical(error.message || 'Error occured')
      } else {
        ftoast.success(
          this.$t('pm_creation.published_successfully', {
            ns: 'maintenance',
          })
        )

        let params = {
          id: pmId,
          viewname: !isEmpty(viewname) ? viewname : 'all',
        }
        if (isWebTabsEnabled()) {
          let { name } =
            findRouteForModule('plannedmaintenance', pageTypes.OVERVIEW) || {}
          name &&
            this.$router.push({
              name,
              params,
            })
        } else {
          this.$router.push({
            name: 'pm-summary',
            params,
          })
        }
      }

      this.$emit('updateIsSaving', false)
    },

    /**
     * loadPm fetches the PM
     */
    async loadPm() {
      let { pmProps } = this || {}
      let { id } = pmProps
      await this.$emit('loadPMDetail', id)
    },
  },
}
</script>
