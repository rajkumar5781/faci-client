<template>
  <FContainer height="100%">
    <FContainer
      display="flex"
      justifyContent="center"
      height="100%"
      v-if="isLoading"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FEmptyState
      v-else-if="isEmpty(workorder)"
      illustration="no-data"
      size="S"
      :description="
        $t('no_workorders_have_been_closed_so_far', 'No data', {
          ns: 'tenant',
        })
      "
      :vertical="true"
    ></FEmptyState>
    <FContainer
      v-else
      display="flex"
      alignItems="flex-start"
      alignSelf="stretch"
      padding="containerXxLarge containerXxLarge sectionSmall containerXxLarge"
    >
      <FContainer
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap="sectionSmall"
        width="100%"
      >
        <FContainer width="80%">
          <FButton
            appearance="link"
            size="medium"
            @click="redirectToOverview(workorder.id)"
          >
            <FTooltip placement="top">
              <template slot="title">
                {{ workorderSubject }}
              </template>

              <FContainer
                textOverflow="ellipsis"
                overflow="hidden"
                whiteSpace="nowrap"
              >
                <FText>
                  {{ workorderSubject }}
                </FText>
              </FContainer>
            </FTooltip>
          </FButton>
        </FContainer>

        <FContainer
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap="containerXxLarge"
        >
          <FContainer
            display="flex"
            alignItems="flex-start"
            gap="containerXLarge"
          >
            <FContainer display="flex" alignItems="flex-start">
              <FContainer
                backgroundColor="borderAccentBlueSubtle"
                borderRadius="full"
                alignItems="flex-start"
                gap="containerXLarge"
                padding="containerLarge"
                paddingBottom="containerMedium"
              >
                <FIcon
                  group="dsm"
                  name="calendar"
                  :pressable="false"
                  size="16"
                ></FIcon>
              </FContainer>
            </FContainer>

            <FContainer
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap="containerMedium"
            >
              <FText color="textMain" appearance="headingMed14">
                {{
                  $t('tenant.closed_on', 'Closed On', { ns: 'tenant' })
                }}</FText
              >
              <FText
                v-if="workorder.actualWorkEnd"
                appearance="bodyReg14"
                color="textCaption"
                >{{ formattedClosedTime || '' }}</FText
              >
              <FText v-else appearance="bodyReg14" color="textCaption"
                >__</FText
              >
            </FContainer>
          </FContainer>

          <FContainer
            display="flex"
            alignItems="flex-start"
            gap="containerXLarge"
          >
            <FAvatar size="M" :userName="assignedTo" />

            <FContainer
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap="containerMedium"
            >
              <FText color="textMain" appearance="headingMed14">{{
                assignedTo
              }}</FText>
              <FText appearance="bodyReg14" color="textCaption">__</FText>
            </FContainer>
          </FContainer>

          <FContainer
            display="flex"
            alignItems="flex-start"
            gap="containerXLarge"
          >
            <FContainer display="flex" alignItems="flex-start">
              <FContainer
                backgroundColor="backgroundAccentYellowSubtle"
                borderRadius="full"
                alignItems="flex-start"
                gap="containerXLarge"
                padding="containerLarge"
                paddingBottom="containerMedium"
              >
                <FIcon
                  group="dsm"
                  name="clock"
                  :pressable="false"
                  size="16"
                ></FIcon>
              </FContainer>
            </FContainer>

            <FContainer
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap="containerMedium"
            >
              <FText color="textMain" appearance="headingMed14"
                >{{
                  $t(
                    'summary.widgets.tenant.wo_time_taken',
                    'Time taken to resolve'
                  )
                }}
              </FText>
              <FText appearance="bodyReg14" color="textCaption">{{
                formattedResolveTime
              }}</FText>
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
  FIcon,
  FText,
  FButton,
  FAvatar,
  FSpinner,
  FTooltip,
  FEmptyState,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate } from '../../../../utils/formatter'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
import { findRouteForModule, pageTypes } from '@facilio/router'
export default {
  components: {
    FContainer,
    FIcon,
    FText,
    FButton,
    FAvatar,
    FSpinner,
    FTooltip,
    FEmptyState,
  },
  props: ['details'],
  async created() {
    await this.loadData()
  },
  data() {
    return {
      workorder: {},
      isLoading: false,
      moduleName: 'tenant',
      isEmpty,
    }
  },
  computed: {
    workorderSubject() {
      return this.workorder?.subject || ''
    },
    assignedTo() {
      return this.workorder?.assignedTo?.name || '__'
    },
    formattedResolveTime() {
      let { actualWorkDuration } = this.workorder || {}

      return !isEmpty(actualWorkDuration)
        ? formatDate(actualWorkDuration)
        : '00:00 Hrs'
    },
    formattedClosedTime() {
      let { actualWorkEnd } = this.workorder || {}
      return !isEmpty(actualWorkEnd) ? formatDate(actualWorkEnd) : '00:00 Hrs'
    },
  },
  methods: {
    async loadData() {
      this.isLoading = true

      let filters = JSON.stringify({
        resource: {
          operatorId: 36,
          value: [this.details.id.toString()],
        },
      })
      let queryParams = {
        viewName: 'closed',
        includeParentFilter: true,
        orderBy: 'id',
        orderType: 'desc',
        page: 1,
        perPage: 1,
        selectableFieldNames:
          'subject,actualWorkDuration,actualWorkEnd,assignedTo',
        filters,
      }

      let { data, error } = await API.get(
        `v3/unrelated/${this.moduleName}/fetchAll/workorder`,
        queryParams
      )

      if (error) {
        let { message } = error
        ftoast.critical(
          message ||
            this.$t('tenant.unable_to_fetch_wo', 'Unable to fetch workorder', {
              ns: 'tenant',
            })
        )
      } else {
        let { workorder } = data || {}
        this.workorder = !isEmpty(workorder) ? workorder[0] : {}
      }
      this.isLoading = false
    },
    async redirectToOverview(id) {
      if (isEmpty(id)) return

      let { name } = findRouteForModule('workorder', pageTypes.OVERVIEW) || {}

      if (name) {
        let viewname = await this.fetchView(moduleName)
        let route = this.$router.resolve({
          name,
          params: { id, viewname },
        }).href
        window.open(route, '_blank')
      }
    },
  },
}
</script>
