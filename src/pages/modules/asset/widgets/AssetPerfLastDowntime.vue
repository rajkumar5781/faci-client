<template>
  <FContainer
    display="flex"
    padding="sectionSmall"
    flexDirection="column"
    alignItems="flex-start"
    gap="containerLarge"
    alignSelf="stretch"
  >
    <FText appearance="headingMed14" color="textMain" text-overflow="ellipsis">
      {{ downtime.condition || 'No reason specified.' }}
    </FText>
    <FContainer
      display="flex"
      width="100%"
      alignItems="flex-end"
      gap="containerXxLarge"
    >
      <FContainer
        display="flex"
        padding="containerXLarge containerNone"
        alignItems="center"
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
            <FContainer>
              <FText appearance="headingMed14" color="textMain">From</FText>
            </FContainer>

            <FContainer>
              <FText appearance="bodyReg14" color="textCaption">{{
                downtime.fromtime ? formatDate(downtime.fromtime) : '---'
              }}</FText>
            </FContainer>
          </FContainer>
        </FContainer>

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
            <FContainer>
              <FText appearance="headingMed14" color="textMain">To</FText>
            </FContainer>

            <FContainer>
              <FText appearance="bodyReg14" color="textCaption">{{
                downtime.totime ? formatDate(downtime.totime) : '---'
              }}</FText>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>

      <FContainer
        display="flex"
        padding="containerXLarge containerNone"
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
          <FContainer>
            <FText appearance="headingMed14" color="textMain">Duration</FText>
          </FContainer>

          <FContainer>
            <FText appearance="bodyReg14" color="textCaption">{{
              getFormattedDuration(downtime.duration, 'seconds')
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
import { API } from '@facilio/api'
import { formatDate, getFormattedDuration } from '../../../../utils/formatter'
export default {
  props: [
    'details',
    'layoutParams',
    'resizeWidget',
    'hideTitleSection',
    'groupKey',
    'activeTab',
    'widget',
  ],
  components: {
    FContainer,
    FIcon,
    FText,
    FButton,
    FAvatar,
  },
  data() {
    return {
      downtime: {},
    }
  },
  mounted() {
    this.loadRecentDownTime()
    // this.eventBus.$on('asset-downtime-reported', () => {
    //   this.loadRecentDownTime()
    // })
  },
  methods: {
    formatDate,
    getFormattedDuration,
    async loadRecentDownTime() {
      let params = {
        workflow: {
          expressions: [
            {
              name: 'Recent Downtime',
              moduleName: 'assetbreakdown',
              criteria: {
                pattern: '(1)',
                conditions: {
                  1: {
                    fieldName: 'asset',
                    operatorId: 36,
                    sequence: '1',
                    value: this.details.id,
                  },
                },
              },
              orderByFieldName: 'fromtime',
              sortBy: 'desc',
              limit: 1,
            },
          ],
        },
      }

      let { data } = await API.post('/v2/executeworkflow', params)
      this.downtime = data?.workflowResult || {}
    },
  },
}
</script>
