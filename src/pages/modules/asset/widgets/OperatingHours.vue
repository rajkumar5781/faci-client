<template>
  <FContainer height="100%" width="100%">
    <portal
      :to="widget.key + '-topbar'"
      :key="widget.key + '-topbar' + '-portalwrap'"
    >
    </portal>
    <portal
      :to="`action-${widget.id}-${widget.name}`"
      class="portal-alignment-ws action-ws"
      ><FIcon
        v-if="getBusinessHour && getBusinessHour.id"
        group="edit"
        name="edit-line"
        size="16"
        @click="() => (showOperatingHoursDialog = true)"
      ></FIcon
    ></portal>
    <FContainer
      v-if="isLoading"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
    >
      <FSpinner :size="20"></FSpinner>
    </FContainer>
    <FContainer
      v-else
      display="flex"
      justifyContent="center"
      width="100%"
      height="100%"
      overflow="auto"
      padding="containerXxLarge sectionSmall containerXxLarge containerXxLarge"
    >
      <FContainer
        width="100%"
        v-if="!(getBusinessHour && getBusinessHour.id)"
        :key="renderKey"
      >
        <FEmptyState
          :title="
            $t(
              'asset.no_operating_hours',
              'Operating Hours is not associated',
              { ns: 'asset' }
            )
          "
          vertical
          size="S"
          illustration="no-entries"
        >
          <template #buttons>
            <FButton
              appearance="secondary"
              size="small"
              @click="() => (showOperatingHoursDialog = true)"
              >{{
                $t('asset.assign_operating_hour', 'Assign Operating Hours', {
                  ns: 'asset',
                })
              }}
            </FButton>
          </template>
        </FEmptyState>
      </FContainer>
      <FContainer
        v-else
        width="100%"
        display="flex"
        flexDirection="column"
        gap="containerMedium"
        justifyContent="space-evenly"
      >
        <FContainer
          overflow="auto"
          display="flex"
          width="100%"
          flexDirection="row"
          v-for="(
            operatingDays, index
          ) in getBusinessHour.singleDaybusinessHoursListOrDefault"
          :key="index"
          justifyContent="space-between"
        >
          <FContainer>
            <FText color="textMain" appearance="headingMed14">
              {{ dayOfWeekMap.get(operatingDays.dayOfWeek.toString()) }}
            </FText>
          </FContainer>
          <FContainer>
            <FContainer v-if="getBusinessHour.businessHourTypeVal === 'CUSTOM'">
              <FText color="textMain" appearance="bodyReg14">
                {{ operatingDays.startTime }} - {{ operatingDays.endTime }}
              </FText>
            </FContainer>
            <FContainer v-else class="operating-hour-timing">
              <FText color="textMain" appearance="bodyReg14"> 24 hours</FText>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>

    <OperatingHourChooser
      :loading="isLoading"
      :showOperatingHourDialog.sync="showOperatingHoursDialog"
      @businessHourChangeInChooser="onBHChange"
      :resourceid="resourceId"
      :details="details"
      :businessHour.sync="getBusinessHour"
      @closeOperatingHourChooser="showOperatingHoursDialog = false"
      @refresh="refreshOperatingHour"
      :isAssetBh="isAssetBh"
      :businessHoursList="businessHoursList"
    ></OperatingHourChooser>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import OperatingHourChooser from './OperatingHourChooser.vue'
import { dset as setProperty } from 'dset'
import {
  FSpinner,
  FContainer,
  ftoast,
  FIcon,
  FButton,
  FText,
  FEmptyState,
} from '@facilio/design-system'

export default {
  props: [
    'model',
    'changeBH',
    'hideChangeBtn',
    'widget',
    'isAssetBh',
    'details',
  ],
  components: {
    OperatingHourChooser,
    FSpinner,
    FContainer,
    FButton,
    FText,
    FIcon,
    FEmptyState,
  },
  data() {
    const businessHourtypeMap = new Map()
    businessHourtypeMap.set('DAYS_24_7', '24 Hours 7 Days')
    businessHourtypeMap.set('DAYS_24_5', '24 Hours 5 Days')
    businessHourtypeMap.set('CUSTOM', 'Custom Hours')

    const customHourtypeMap = new Map()
    customHourtypeMap.set('SAME_TIMING_ALLDAY', 'Same timing all day')
    customHourtypeMap.set('DIFFERENT_TIMING_ALLDAY', 'Different timing all day')

    const dayOfWeekMap = new Map()
    dayOfWeekMap.set('1', 'Monday')
    dayOfWeekMap.set('2', 'Tuesday')
    dayOfWeekMap.set('3', 'Wednesday')
    dayOfWeekMap.set('4', 'Thursday')
    dayOfWeekMap.set('5', 'Friday')
    dayOfWeekMap.set('6', 'Saturday')
    dayOfWeekMap.set('7', 'Sunday')

    return {
      loading: false,
      bhChange: false,
      resourceId: this.details.id,
      businessHourtypeMap: businessHourtypeMap,
      customHourtypeMap: customHourtypeMap,
      dayOfWeekMap: dayOfWeekMap,
      showOperatingHoursDialog: false,
      businessHoursList: [],
      businessHour: null,
    }
  },
  mounted() {
    if (this.details && this.details.operatingHour) {
      this.getOperatingHours()
    }
  },
  computed: {
    isLoading() {
      let { loading } = this || {}
      return loading
    },
    moduleName() {
      let { details } = this
      let { moduleName } = details
      return moduleName
    },
    getBusinessHour() {
      let { businessHour } = this
      return businessHour
    },
    renderKey() {
      let { bhChange } = this
      let { businessHour } = this
      let { id = -1 } = businessHour || {}
      return `${businessHour}_${id}_${bhChange}`
    },
  },
  watch: {
    showOperatingHoursDialog(newVal) {
      if (newVal) {
        this.getOperatingHours()
      }
    },
  },
  methods: {
    async getOperatingHours() {
      this.loading = true
      let { moduleName } = this
      let { data, error } = await API.get(
        `/v2/businesshours/${moduleName}/list`
      )
      if (error) {
        ftoast.critical(
          error?.message || 'Error occured while fetching business hours list'
        )
        this.loading = false
      } else {
        this.businessHoursList = data.list
        if (!this.businessHour) {
          this.businessHour = data.list.find(
            businessHour => businessHour.id === this.details.operatingHour
          )
        }
        this.loading = false
      }
    },
    refreshOperatingHour(id) {
      this.businessHour = this.businessHoursList.find(
        businessHour => businessHour.id === id
      )
      setProperty(this, 'details.operatingHour', id)
    },
    onBHChange(businessHour) {
      this.showOperatingHoursDialog = true
      this.businessHour = businessHour
      setProperty(this, 'details.operatingHour', businessHour.id)
      this.bhChange = !this.bhChange
    },
  },
}
</script>
