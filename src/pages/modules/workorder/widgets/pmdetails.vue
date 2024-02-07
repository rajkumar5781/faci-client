<template>
  <FContainer height="100%" width="100%" ref="wo-plans">
    <portal
      :to="`title-${widget.id}-${widget.name}`"
      class="portal-alignment-ws"
    >
      <FContainer padding="containerLarge">
        <FText appearance="headingMed14">Plans</FText>
      </FContainer></portal
    >
    <FContainer
      height="100%"
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      v-if="loading"
      ><FSpinner :size="25"></FSpinner
    ></FContainer>
    <FContainer
      v-else-if="!IsJobplan && !isPlannedMaintenance"
      display="flex"
      justifyContent="center"
      height="100%"
      width="100%"
      padding="containerLarge"
    >
      <FEmptyState
        title="No Job Plans Associated."
        description="This Work Order does not have any Job Plans Associated"
        :vertical="false"
        size="S"
        illustration="end-of-list"
        type="narrow"
      />
    </FContainer>
    <FContainer
      v-else
      display="flex"
      padding="containerXLarge containerXxLarge"
      gap="containerXLarge"
      flexDirection="column"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        gap="containerSmall"
        v-if="IsJobplan"
      >
        <FContainer>
          <FText appearance="captionReg12" color="textCaption">Job Plan</FText>
        </FContainer>

        <FContainer display="flex" gap="containerMedium">
          <FContainer display="flex" gap="containerXLarge" width="100%">
            <FContainer
              padding="containerNone containerSmall"
              display="flex"
              alignItems="center"
              width="15%"
            >
              <FContainer
                display="flex"
                backgroundColor="iconAccentViolet"
                borderRadius="high"
                alignItems="center"
                gap="containerXLarge"
                padding="containerLarge"
                justifyContent="center"
                color="iconNeutralInverse"
              >
                <FIcon
                  group="modules"
                  name="job-plan"
                  :pressable="false"
                  size="16"
                  padding="containerLarge"
                ></FIcon>
              </FContainer>
            </FContainer>
            <FContainer
              display="flex"
              flexDirection="column"
              gap="containerMedium"
              width="65%"
            >
              <FContainer
                overflow="hidden"
                textOverflow="ellipsis"
                white-space="nowrap"
              >
                <FTooltip placement="top" :mouseEnterDelay="1">
                  <template #title>{{ getName }}</template>
                  <FText appearance="headingMed14" color="textMain">{{
                    getName
                  }}</FText>
                </FTooltip>
              </FContainer>
              <FContainer display="flex" gap="containerMedium">
                <FContainer>
                  <FText apperance="captionReg12" color="textCaption">{{
                    jobplanDetails
                  }}</FText>
                </FContainer>
                <FContainer>
                  <FTags
                    appearance="simple"
                    :text="getCategory"
                    :disabled="false"
                /></FContainer>
              </FContainer>
            </FContainer>
            <FContainer
              display="flex"
              padding="containerSmall"
              flexDirection="column"
              gap="containerSmall"
              width="20%"
            >
              <FButton
                appearance="link"
                size="medium"
                iconGroup="navigation"
                iconName="open-window"
                @click="redirectToOverview()"
              />
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
      <FDivider
        v-if="IsJobplan && isPlannedMaintenance"
        width="100%"
      ></FDivider>
      <FContainer
        display="flex"
        flexDirection="column"
        gap="containerSmall"
        v-if="isPlannedMaintenance"
      >
        <FContainer>
          <FText appearance="captionReg12" color="textCaption"
            >Planned Maintenance</FText
          >
        </FContainer>

        <FContainer display="flex" gap="containerMedium">
          <FContainer display="flex" gap="containerXLarge" width="100%">
            <FContainer
              padding="containerNone containerSmall"
              display="flex"
              alignItems="center"
              width="15%"
            >
              <FContainer
                display="flex"
                backgroundColor="iconAccentCyan"
                borderRadius="high"
                alignItems="center"
                gap="containerXLarge"
                padding="containerLarge"
                justifyContent="center"
                color="iconNeutralInverse"
              >
                <FIcon
                  group="webtabs"
                  name="maintenance"
                  :pressable="false"
                  size="16"
                  padding="containerLarge"
                ></FIcon>
              </FContainer>
            </FContainer>
            <FContainer
              display="flex"
              flexDirection="column"
              gap="containerMedium"
              width="65%"
            >
              <FContainer
                overflow="hidden"
                textOverflow="ellipsis"
                white-space="nowrap"
              >
                <FTooltip placement="top" :mouseEnterDelay="1">
                  <template #title>{{ pmRecord.subject }}</template>
                  <FText appearance="headingMed14" color="textMain">{{
                    pmRecord.subject
                  }}</FText>
                </FTooltip>
              </FContainer>
              <FContainer display="flex" gap="containerMedium">
                <FContainer>
                  <FText apperance="captionReg12" color="textCaption"
                    >#{{ pmRecord.id }}</FText
                  >
                </FContainer>
                <FContainer>
                  <FTags
                    appearance="simple"
                    :text="pmRecord.assignmentTypeEnum"
                    :disabled="false"
                /></FContainer>
              </FContainer>
            </FContainer>
            <!-- RHS -->
            <FContainer
              display="flex"
              padding="containerSmall"
              flexDirection="column"
              gap="containerSmall"
              width="20%"
            >
              <FButton
                appearance="link"
                size="medium"
                iconGroup="navigation"
                iconName="open-window"
                @click="redirectToPM()"
              />
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
  FText,
  FIcon,
  FTags,
  FButton,
  FEmptyState,
  FTooltip,
  FDivider,
  ftoast,
  FSpinner,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { findRouteForModule, pageTypes } from '@facilio/router'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'

export default {
  props: ['moduleName', 'details', 'widget', 'viewname', 'resizeWidget'],
  components: {
    FIcon,
    FContainer,
    FText,
    FTags,
    FButton,
    FEmptyState,
    FTooltip,
    FDivider,
    FSpinner,
  },
  data() {
    return {
      pmRecord: [],
      loading: false,
    }
  },
  async mounted() {
    await this.loadPMDetail()
    this.autoResize()
  },
  computed: {
    jobplanDetails() {
      return (
        '#' +
        this.details.jobPlan.id +
        '/v' +
        this.details.jobPlan.jobPlanVersion
      )
    },
    getCategory() {
      return this.details.jobPlan.jobPlanCategoryEnum
    },
    IsJobplan() {
      return this.details.jobPlan ? true : false
    },
    isPlannedMaintenance() {
      return this.details.pmV2 ? true : false
    },
    getName() {
      return this.details.jobPlan.name
    },
  },
  methods: {
    redirectToOverview() {
      let { viewname } = this
      let { jobPlan } = this.details
      let { group, jobPlanVersion: version } = jobPlan || {}
      let groupId = getProperty(group, 'id', null)
      version = `v${version}`
      let params = {
        viewname: !isEmpty(viewname) ? viewname : 'all',
        id: groupId,
      }

      let { name } = findRouteForModule('jobplan', pageTypes.OVERVIEW) || {}
      name &&
        this.$router.push({
          name,
          params,
          query: { jpversion: version },
        })
    },
    redirectToPM() {
      let Id = getProperty(this.pmRecord, 'id', null)
      let params = {
        viewname: 'all',
        id: Id,
      }

      let { name } =
        findRouteForModule('plannedmaintenance', pageTypes.OVERVIEW) || {}
      name &&
        this.$router.push({
          name,
          params,
        })
    },
    autoResize() {
      this.$nextTick(() => {
        setTimeout(() => {
          let container = this.$refs['wo-plans']
          if (this.isPlannedMaintenance && this.IsJobplan) {
            let height = container.scrollHeight || container.$el.scrollHeight
            height = height + 10
            let width = container.scrollWidth || container.$el.scrollWidth
            if (this.resizeWidget) {
              this.resizeWidget({ height: height, width })
            }
          }
        })
      })
    },
    async loadPMDetail() {
      let pmId = this.details.pmV2
      if (isEmpty(pmId)) {
        return
      }
      this.loading = true
      let moduleName = 'plannedmaintenance'
      let { [moduleName]: data, error } = await API.fetchRecord(
        moduleName,
        {
          id: pmId,
        },
        { force: true }
      )
      if (isEmpty(error)) {
        this.pmRecord = data
      } else {
        ftoast.critical(
          error.message || 'Error occured while fetching planned maintenance'
        )
      }
      this.loading = false
    },
  },
}
</script>
