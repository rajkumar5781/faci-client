<template>
  <FContainer>
    <NewOperatingHour
      @businessHourChange="changeBH"
      v-if="showDialog"
      :isNew="true"
      :resourceid="resourceid"
      :visibility.sync="showDialog"
      @close="handleclose"
      :details="details"
    ></NewOperatingHour>
    <FModal
      title="Operating hours"
      v-if="showOperatingHourDialog"
      :visible="showOperatingHourDialog"
      :hideFooter="hideFooter"
      size="M"
      @cancel="handleclose"
      @ok="updateOperatingHour()"
    >
      <FContainer
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100px"
        v-if="isLoading"
      >
        <FSpinner :size="20" />
      </FContainer>
      <FContainer v-else>
        <FContainer class="fc-alert-msg-info" v-if="showScheduleNotification">
          <i class="fa fa-exclamation-triangle pR10" aria-hidden="true"></i>
          Out of Schedule alarm will be re-calculated with this operational hour
          for last one year.
        </FContainer>
        <FContainer>
          <FContainer
            v-if="businessHoursList.length !== 0"
            position="absolute"
            top="10px"
            right="52px"
          >
            <FButton
              appearance="secondary"
              @click="newOperatingHour"
              size="medium"
            >
              {{
                $t('asset.sites.add_operating_hour', 'Add Operating hour', {
                  ns: 'asset',
                })
              }}
            </FButton>
          </FContainer>
          <FContainer>
            <FContainer
              padding="sectionSmall"
              v-if="businessHoursList.length === 0"
            >
              <FContainer height="100%" display="flex" justifyContent="center">
                <FContainer
                  display="flex"
                  justifyContent="center"
                  width="500px"
                  height="100%"
                >
                  <FEmptyState
                    title="No data"
                    :description="
                      $t(
                        'asset.operating_hours.no_data',
                        'No operating hours configured.',
                        { ns: 'asset' }
                      )
                    "
                    vertical
                    size="S"
                    illustration="no-entries"
                  >
                    <template #buttons>
                      <FButton appearance="secondary" @click="newOperatingHour">
                        {{
                          $t(
                            'asset.sites.add_operating_hour',
                            'Add Operating hour',
                            {
                              ns: 'asset',
                            }
                          )
                        }}
                      </FButton>
                    </template>
                  </FEmptyState>
                </FContainer>
              </FContainer>
            </FContainer>

            <FContainer v-else>
              <FTable
                :key="renderKey"
                :rounded="false"
                :columns="column"
                :data="businessHoursList"
                selectType="single"
                :selectedList="getSelection"
                @recordSelected="toggleSelect"
              >
                <template #[`cell.name`]="{ row }">
                  <FText color="textMain" appearance="bodyReg14">{{
                    row.name
                  }}</FText>
                </template>
                <template #[`cell.operatinghourtype`]="{ row }">
                  <FText color="textMain" appearance="bodyReg14">{{
                    businessHourtypeMap.get(row.businessHourTypeVal)
                  }}</FText>
                </template>
                <template #[`cell.customtype`]="{ row }">
                  <FText color="textMain" appearance="bodyReg14">{{
                    customHourtypeMap.get(row.customHourTypeVal)
                  }}</FText>
                </template>
              </FTable>
            </FContainer>
          </FContainer>
        </FContainer>
      </FContainer>
    </FModal>
  </FContainer>
</template>
<script>
import NewOperatingHour from './NewOperatingHour.vue'

import {
  FContainer,
  FButton,
  FText,
  FModal,
  FEmptyState,
  ftoast,
  FSpinner,
  FTable,
} from '@facilio/design-system'
import { cloneObject } from '../../../../utils/helpers'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
export default {
  props: [
    'resourceid',
    'businessHour',
    'showOperatingHourDialog',
    'isAssetBh',
    'details',
    'businessHoursList',
    'loading',
  ],
  components: {
    NewOperatingHour,
    FContainer,
    FButton,
    FText,
    FSpinner,
    FModal,
    FTable,
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
    return {
      showDialog: false,
      selectedList: [],
      operatingHourValueSaving: false,
      businessHourtypeMap: businessHourtypeMap,
      customHourtypeMap: customHourtypeMap,
      showScheduleNotification: false,
      column: [
        { displayName: 'Name', name: 'name', id: 1, fixed: true },
        {
          displayName: 'Operating hour type',
          name: 'operatinghourtype',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Custom hour type',
          name: 'customtype',
          id: 3,
          width: 250,
          clickable: true,
        },
      ],
    }
  },
  created() {
    this.checkRunStatus()
  },
  mounted() {},
  computed: {
    hideFooter() {
      return isEmpty(this.businessHoursList)
    },
    parentModuleName() {
      return dlv(this, 'details.moduleName')
    },
    isLoading() {
      let { loading } = this
      return loading
    },
    getSelection() {
      let { businessHour } = this
      let list = [businessHour]
      return list
    },
    renderKey() {
      let { businessHour } = this
      let { name, id } = businessHour || {}
      return `${name}_${id}`
    },
  },
  watch: {
    async showOperatingHourDialog(newVal) {
      if (newVal == true) {
        await this.checkRunStatus()
      }
    },
  },
  methods: {
    changeBH(businesshour) {
      this.$emit('businessHourChangeInChooser', businesshour)
    },
    handleclose() {
      this.$emit('update:showOperatingHourDialog', false)
      this.$emit('closeOperatingHourChooser')
    },
    async checkRunStatus() {
      if (
        this.isAssetBh &&
        this.$access.isLicenseEnabled('OPERATIONAL_ALARM')
      ) {
        let { error, data } = await API.get(
          `/v2/assets/checkrunstatus?assetId=${this.resourceid}`
        )
        if (error) {
          ftoast.critical(
            error?.message || 'Error occured while checking run status'
          )
        } else {
          this.showScheduleNotification = data?.runStatusAvailable
        }
      }
    },
    async updateOperatingHour() {
      if (this.selectedList.length > 0) {
        let id = this.selectedList[0].id
        this.operatingHourValueSaving = true
        let { resourceid, moduleName } = this
        if (resourceid > 0) {
          let { error, data } = await API.post(
            `/v2/businesshours/${moduleName}/updateresource`,
            { id, resourceid }
          )
          if (error) {
            ftoast.critical(
              error?.message || 'Error occured while checking run status'
            )
            this.operatingHourValueSaving = false
          } else {
            this.operatingHourValueSaving = false
            this.onSelect()
            if (data && data.runStatusAvailable) {
              this.showScheduleNotification = data.runStatusAvailable
            }
            this.$emit('refresh', id)
          }
        } else {
          this.onSelect()
        }
      }
    },
    onSelect() {
      this.changeBH(this.selectedList[0])
      this.$emit('update:showOperatingHourDialog', false)
    },
    newOperatingHour() {
      this.showDialog = true
      this.$emit('update:showOperatingHourDialog', false)
    },
    toggleSelect(resource, alreadyChanged) {
      this.selectedList = []
      for (let i in this.businessHoursList) {
        this.businessHoursList[i].selected = false
      }
      if (!alreadyChanged) {
        this.$set(resource, 'selected', !resource.selected)
      }
      this.setSelectedResource(resource)
    },
    setSelectedResource(resource) {
      if (resource.selected) {
        this.selectedList.push(cloneObject(resource))
        let idx = this.businessHoursList.findIndex(bh => bh.id === resource.id)
        this.businessHoursList[idx].selected = true
        this.businessHoursList.splice(idx, 0, resource)
        this.businessHoursList.splice(idx + 1, 1)
      } else {
        let idx = this.selectedList.findIndex(sr => sr.id === resource.id)
        if (idx !== -1) {
          this.selectedList.splice(idx, 1)
        }
      }
    },
  },
}
</script>
