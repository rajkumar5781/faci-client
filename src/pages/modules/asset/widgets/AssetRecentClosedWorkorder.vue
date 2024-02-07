<template>
  <FContainer
    display="flex"
    alignItems="center"
    alignSelf="stretch"
    padding="containerXxLarge containerXxLarge sectionSmall containerXxLarge"
  >
    <FContainer
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap="sectionSmall"
    >
      <FButton
        appearance="link"
        size="medium"
        @click="goToSummary(workorder.id)"
      >
        <FText appearance="bodyReg14"> {{ workorder.subject }}</FText>
      </FButton>

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
            <FText color="textMain" appearance="headingMed14">Closed on</FText>
            <FText
              v-if="workorder.actualWorkEnd"
              appearance="bodyReg14"
              color="textCaption"
              >{{ workorder.actualWorkEnd || formatDate }}</FText
            >
            <FText v-else appearance="bodyReg14" color="textCaption">__</FText>
          </FContainer>
        </FContainer>

        <FContainer
          display="flex"
          alignItems="flex-start"
          gap="containerXLarge"
        >
          <FAvatar
            size="M"
            :userName="workorder.assignedTo ? workorder.assignedTo.name : '__'"
          />

          <FContainer
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="containerMedium"
          >
            <FText color="textMain" appearance="headingMed14">{{
              workorder.assignedTo ? workorder.assignedTo.name : '__'
            }}</FText>
            <FText appearance="bodyReg14" color="textCaption">__</FText>
            <!-- <FText v-else appearance="bodyReg14" color="textCaption">__</FText> -->
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
              >Time taken to resolve
            </FText>
            <FText appearance="bodyReg14" color="textCaption">{{
              formattedResolveTime
            }}</FText>
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
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { formatDate, getFormattedDuration } from '../../../../utils/formatter'
import { API } from '@facilio/api'
import { findRouteForModule, pageTypes } from '@facilio/router'
import dlv from 'dlv'

export default {
  components: {
    FContainer,
    FIcon,
    FText,
    FButton,
    FAvatar,
  },
  props: [
    'details',
    'layoutParams',
    'hideTitleSection',
    'activeTab',
    'widget',
    'resizeWidget',
  ],
  data() {
    return {
      workorder: {},
    }
  },
  filters: {
    formatDate: formatDate,
  },
  mounted() {
    this.loadData()
  },
  computed: {
    moduleName() {
      return dlv(this, 'details.moduleName')
    },
  },
  methods: {
    async loadData() {
      let filters = encodeURIComponent(
        JSON.stringify({
          resource: { operatorId: 36, value: [this.details.id + ''] },
        })
      )
      let url = `/v2/workorders/view/${this.moduleName}/closed?filters=${filters}&page=1&perPage=1&orderBy=actualWorkEnd&orderType=desc&overrideViewOrderBy=true&includeParentFilter=true`
      let { data } = await API.get(url)
      this.workorder = data?.workorders?.length ? data?.workorders[0] : {}
      this.loading = false
    },
    goToSummary(id) {
      let { name } = findRouteForModule('workorder', pageTypes.OVERVIEW) || {}
      if (name) {
        this.$router.push({
          name,
          params: { viewname: 'all', id },
        })
      }
    },
  },
  computed: {
    formattedResolveTime() {
      if (isEmpty(this.workorder.actualWorkDuration)) {
        return '00:00 Hrs'
      } else {
        return getFormattedDuration(
          this.workorder.actualWorkDuration,
          'seconds'
        )
      }
    },
  },
}
</script>
