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
            $t('pm_creation.planner_configuration_page_header', {
              ns: 'maintenance',
            })
          "
          :heading="$t('pm_creation.planner', { ns: 'maintenance' })"
          headingAppearance="headingMed16"
          descriptionAppearance="bodyReg14"
        >
          <template #actions>
            <FButton
              appearance="secondary"
              size="medium"
              iconGroup="sign-symbols"
              iconName="addition"
              :iconButton="false"
              iconPosition="prefix"
              @click="
                () => addNewPlanner({ skipLoading: true, hideMessage: false })
              "
            >
              {{ $t('pm_creation.add_planner', { ns: 'maintenance' }) }}
            </FButton>
          </template>
        </PlannedMaintenanceConfigurationHeader>
      </FContainer>

      <FContainer
        v-if="isPlannerStaticAlertBannerVisible"
        marginTop="containerXxLarge"
      >
        <PlannerStaticAlertBanner
          :isPlannerStaticAlertBannerVisible.sync="
            isPlannerStaticAlertBannerVisible
          "
          :staticAlertMessage="staticAlertMessage"
        />
      </FContainer>

      <FContainer marginTop="containerXxLarge" class="w-[700px]">
        <FContainer
          v-if="isPlannerListLoading || isPmLoading"
          height="100%"
          width="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <FSpinner :size="24" />
        </FContainer>
        <FContainer v-else-if="isPlannersNotAvailable">
          <FContainer display="flex" justifyContent="center">
            <FEmptyState
              :title="
                $t('pm_creation.planners_empty_state_title', {
                  ns: 'maintenance',
                })
              "
              :description="
                $t('pm_creation.planners_empty_state_description', {
                  ns: 'maintenance',
                })
              "
              vertical
              size="M"
              illustration="no-entries"
              type="narrow"
            />
          </FContainer>
        </FContainer>
        <FContainer v-else>
          <FContainer ref="plannerList">
            <FContainer v-for="planner in plannerList" :key="planner.id">
              <FContainer marginTop="containerXxLarge">
                <PlannerListItem
                  :ref="`planner-${planner.id}`"
                  :planner="planner"
                  :pmRecord="pmRecord"
                  :moduleName="moduleName"
                  :loading="isPlannerItemLoading"
                  @updatePlannerItem="updatePlannerItem"
                  @reloadPlanners="props => reloadPlanners(props)"
                  @scrollToCurrentPlanner="scrollToCurrentPlanner"
                />
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FButton,
  FSpinner,
  FEmptyState,
  ftoast,
} from '@facilio/design-system'
import PlannedMaintenanceConfigurationHeader from './PlannedMaintenanceConfigurationHeader.vue'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import PlannerListItem from './PlannerListItem.vue'
import PlannerStaticAlertBanner from './PlannerStaticAlertBanner.vue'
import { getPlaceholderText } from './utils/pm-utils.js'

export default {
  name: 'PlannerConfiguration',
  components: {
    FContainer,
    FButton,
    FSpinner,
    FEmptyState,
    PlannedMaintenanceConfigurationHeader,
    PlannerListItem,
    PlannerStaticAlertBanner,
  },

  created() {
    this.init()
  },
  mounted() {},

  props: {
    pmProps: {
      type: Object,
      required: true,
    },
    pmRecord: {
      type: Object,
      required: true,
    },
    isPmLoading: {
      type: Boolean,
      require: true,
    },
  },

  data() {
    return {
      //Constants
      moduleName: 'pmPlanner',

      // Data
      plannerList: [],
      newPlannerID: null,

      //Loading states
      isSavingPlanner: false,
      isPlannerListLoading: false,
      isPlannerItemLoading: false,

      // States
      isPlannerStaticAlertBannerVisible: true,
    }
  },

  computed: {
    isPlannersNotAvailable() {
      let { plannerList } = this || {}
      return isEmpty(plannerList)
    },
    staticAlertMessage() {
      let { pmRecord } = this || {}

      return getPlaceholderText({
        pmRecord,
        text: this.$t('pm_creation.planner_static_alert_banner_message', {
          ns: 'maintenance',
        }),
        isUpperCase: false,
        replaceAll: false,
        isSingular: false,
      })
    },
  },

  watch: {
    newPlannerID(newVal, oldVal) {
      if (newVal !== oldVal && !isEmpty(newVal)) {
        this.scrollToNewPlanner(newVal)
      }
    },
  },

  methods: {
    /**
     * Load planners
     */
    async init() {
      this.$emit('updateIsSaving', false)
      this.isPlannerListLoading = true
      await this.loadPm()
      await this.loadPlanners({ skipLoading: true })
      let { plannerList } = this || {}
      if (isEmpty(plannerList)) {
        await this.addNewPlanner({ skipLoading: false, hideMessage: true })
      }
      this.isPlannerListLoading = false
    },

    /* API calls */

    /**
     * loadPm fetches the PM
     */
    async loadPm() {
      let { pmProps } = this || {}
      let { id } = pmProps
      this.$emit('loadPMDetail', id)
    },

    /**
     * loadPlanners fetches the Planners
     */
    async loadPlanners(props) {
      // To decided if we have to load the planners list,
      // not needed while adding new planner.
      let { skipLoading } = props || {}
      if (!skipLoading) {
        this.isPlannerListLoading = true
      }
      let { moduleName, pmProps } = this || {}
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

    /**
     * reloadPlanners reloads the planner list
     * @param {*} props
     */
    reloadPlanners(props) {
      this.loadPlanners(props)
    },

    // async loadPlanner() {
    //   this.isPlannerLoading = true
    //   let { moduleName, selectedPlanner: id } = this || {}
    //   let { [moduleName]: record, error } = await API.fetchRecord(
    //     moduleName,
    //     {
    //       id,
    //     },
    //     { force: true }
    //   )
    //   if (isEmpty(error)) this.selectedPlannerRecord = record
    //   this.isPlannerLoading = false
    // },

    /**
     * addNewPlanner adds a new Planner with option to skip loading, and showing messages
     * @param {*} props
     */
    async addNewPlanner(props) {
      let { skipLoading, hideMessage } = props || {}
      this.isSavingPlanner = true
      let { moduleName, pmProps, plannerList } = this || {}
      let { length } = plannerList || []
      let { id: pmId } = pmProps || {}
      let data = { pmId, name: `Planner ${length + 1}` }
      let { [moduleName]: record, error } = await API.createRecord(moduleName, {
        data,
      })
      if (isEmpty(error)) {
        await this.loadPlanners({ skipLoading })

        if (!hideMessage) {
          let { name: plannerName } = record || {}
          let message =
            plannerName +
            this.$t('pm_creation.planner_added_message_suffix', {
              ns: 'maintenance',
            })
          ftoast.success(message)
        }
        let { id } = record || {}
        this.newPlannerID = id
      }
      this.isSavingPlanner = false
    },

    /**
     * Helper Functions
     */

    /**
     * scrollToNewPlanner function scrolls the UI to newly added Planner
     * @param {} plannerId
     */
    scrollToNewPlanner(plannerId) {
      this.$nextTick(function () {
        let elements = this.$refs[`planner-${plannerId}`]
        if (
          !isEmpty(elements) &&
          elements instanceof Array &&
          elements.length > 0
        ) {
          let { $el: element } = elements[0] || {}
          element.scrollIntoView({ behavior: 'smooth' })
        }
      })
    },

    /**
     * scrollToCurrentPlanner function scrolls the UI to #plannerId
     * @param {} plannerId
     */
    scrollToCurrentPlanner(plannerId) {
      this.$nextTick(function () {
        let elements = this.$refs[`planner-${plannerId}`]
        if (
          !isEmpty(elements) &&
          elements instanceof Array &&
          elements.length > 0
        ) {
          let { $el: element } = elements[0] || {}
          element.classList.add('blink-alert-box')
          // code to apply animation on the alert banner
          // let { children = [] } = element || []
          // if (!isEmpty(children) && children.length > 2) {
          //   children[1].classList.add('blink-alert-box')
          //   if (
          //     !isEmpty(children[1].children) &&
          //     children[1].children.length > 0
          //   ) {
          //     children[1].children[0].classList.add('blink-alert-box')
          //   }
          // }
          element.scrollIntoView({ behavior: 'smooth' })
        }
      })
    },

    /**
     * updatePlannerItem updates the planner item in plannerList.
     * This is done when data in planner item gets updated from child component
     * @param {*} currPlanner
     */
    updatePlannerItem(currPlanner) {
      this.isPlannerItemLoading = true
      let { plannerList } = this
      this.plannerList = plannerList.map(planner => {
        if (planner.id === currPlanner.id) return currPlanner
        else return planner
      })

      this.isPlannerItemLoading = false
    },

    /**
     * MultiStepper component callback function to do validation
     */
    async onSave() {
      let { plannerList } = this
      if (isEmpty(plannerList)) {
        ftoast.critical(
          this.$t('pm_creation.atleast_one_planner_is_required', {
            ns: 'maintenance',
          })
        )
        return false
      }
      let validated = true
      let doNavigateToFirstInValidPlanner = true
      plannerList.forEach(planner => {
        let element = this.$refs[`planner-${planner.id}`]
        if (!isEmpty(element)) {
          if (element instanceof Array && element.length > 0) {
            element = element[0]
          }
          validated =
            validated & element.validate({ doNavigateToFirstInValidPlanner })
          if (doNavigateToFirstInValidPlanner && !validated) {
            doNavigateToFirstInValidPlanner = false
          }
        }
      })
      if (!validated) {
        ftoast.critical(
          this.$t('pm_creation.please_check_planner_configuration', {
            ns: 'maintenance',
          })
        )
      }
      return validated
    },
  },
}
</script>
<style scoped>
.blink-alert-box {
  animation: blink 0.75s linear 3;
}
@keyframes blink {
  25% {
    opacity: 0.75;
  }
  50% {
    opacity: 0.4;
  }
  75% {
    opacity: 0.75;
  }
}
</style>
