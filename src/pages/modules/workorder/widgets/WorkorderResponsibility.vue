<template>
  <FContainer
    padding="containerXxLarge"
    gap="containerXLarge"
    class="flex flex-col"
    ref="wo-responsibility"
  >
    <FRow>
      <FCol :span="6">
        <FContainer gap="containerMedium" display="flex" flexDirection="column">
          <FContainer display="flex" alignItems="center" gap="containerLarge">
            <FText appearance="captionMed12" color="textMain">Staff</FText>
          </FContainer>

          <FContainer
            display="flex"
            alignItems="center"
            gap="containerMedium"
            class="truncate"
          >
            <FAvatar
              size="S"
              class="shrink-0"
              :userName="getStaffText"
            ></FAvatar>
            <FText appearance="bodyReg14" color="textMain" :title="getStaff">{{
              getStaff
            }}</FText>
          </FContainer>
        </FContainer>
      </FCol>
      <FCol :span="6" v-if="isTeam">
        <FContainer gap="containerMedium" display="flex" flexDirection="column">
          <FContainer display="flex" alignItems="center" gap="containerLarge">
            <FText appearance="captionMed12" color="textMain">Team</FText>
          </FContainer>

          <FContainer
            display="flex"
            alignItems="center"
            gap="containerMedium"
            class="truncate"
          >
            <FAvatar
              size="S"
              class="shrink-0"
              :userName="getTeamText"
            ></FAvatar>
            <FText appearance="bodyReg14" color="textMain" :title="getTeam">{{
              getTeam
            }}</FText>
          </FContainer>
        </FContainer>
      </FCol>
    </FRow>
    <FRow>
      <FCol :span="12" v-if="isVendor">
        <FContainer gap="containerMedium" display="flex" flexDirection="column">
          <FContainer>
            <FText appearance="captionMed12" color="textMain">Vendor</FText>
          </FContainer>

          <FContainer
            display="flex"
            alignItems="center"
            gap="containerMedium"
            class="truncate"
          >
            <FAvatar
              size="S"
              class="shrink-0"
              :userName="getVendorText"
            ></FAvatar>
            <FText appearance="bodyReg14" color="textMain" :title="getVendor">{{
              getVendor
            }}</FText>
          </FContainer>
        </FContainer>
      </FCol>
    </FRow>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FAvatar,
  FRow,
  FCol,
  FDivider,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import getProperty from 'dlv'


export default {
  name: 'Responsibility',
  props: ['moduleName', 'details', 'widget','resizeWidget'],
  components: {
    FAvatar,
    FContainer,
    FText,
    FRow,
    FCol,
    FDivider,
  },
  data() {
    return {
      excludeFields: [],
    }
  },
  mounted(){
    this.autoResize()
  },
  computed: {
    currModuleName() {
      return 'workorder'
    },
    widgetTitle() {
      return 'Responsibility'
    },
    workorder() {
      return this.details
    },
    getStaff() {
      return this.details?.assignedTo?.name
        ? this.details.assignedTo.name
        : '---'
    },
    getTeam() {
      return this.details?.assignmentGroup?.name
        ? this.details.assignmentGroup.name
        : '---'
    },
    getVendor() {
      return this.details?.vendor?.name ? this.details.vendor.name : '---'
    },
    getStaffText() {
      return this.details?.assignedTo?.name ? this.details.assignedTo.name : ''
    },
    getTeamText() {
      return this.details?.assignmentGroup?.name
        ? this.details.assignmentGroup.name
        : ''
    },
    getVendorText() {
      return this.details?.vendor?.name ? this.details.vendor.name : ''
    },
    isVendor(){
      return getProperty(this.workorder,'vendor.name',false)

    },
    isTeam(){
      return getProperty(this.workorder,'assignmentGroup.name',false)
    },
  },
  methods: {
    canHideField(fieldName) {
      return this.excludeFields.includes(fieldName)
    },
    vendorLicenseEnabled() {
      const vendorLicense = this.$access.isLicenseEnabled('VENDOR')
      return vendorLicense
    },
    autoResize(){
      this.$nextTick(() => {
        setTimeout(() => {
          let container = this.$refs['wo-responsibility']
          if (!this.details?.vendor) {
            let height = container.scrollHeight || container.$el.scrollHeight
            height = height - 40
            let width = container.scrollWidth || container.$el.scrollWidth
            if (this.resizeWidget) {
              this.resizeWidget({ height: height, width })
            }
          }
        })
      })
    },
  },
}
</script>
