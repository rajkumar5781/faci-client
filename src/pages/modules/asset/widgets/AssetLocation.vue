<template>
  <FContainer overflow="scroll">
      <FContainer
        v-if="loading"
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding="sectionLarge"
        ><FSpinner :size="30"
      /></FContainer>
      <FEmptyState
      v-else-if="isEmpty(hierarchyList)"
        description="No location specified for this asset."
        vertical
        size="S"
        illustration="broken-location"
        type="narrow"
      />
      <FContainer
        v-else
        display="flex"
        justifyContent="space-between"
        gap="sectionLarge"
        padding="containerXxLarge containerNone"
        marginRight="sectionLarge"
      >   
        <FContainer :width="this.currentLocation ? '70%' : '100%'">
          <FContainer padding="containerNone containerXxLarge"  overflow="hidden"
                    textOverflow="ellipsis" white-space="nowrap">
            <FTooltip placement="top" :mouseEnterDelay="1">
                  <template #title>{{ asset.space.name }}</template>
               <FText appearance="headingMed14" color="textMain">{{ asset.space.name }}</FText>
               </FTooltip>
          </FContainer>
          
          <FContainer
            padding="containerLarge containerXxLarge"
            height="100%"
          >        
            <FContainer
              v-for="(item, index) in hierarchyList"
              :key="index"
              width="100%"
              display="flex"
            >
              <FContainer
                @click="redirect(item.routeParams)"
                marginRight="containerMedium"
                overflow="hidden"
                textOverflow="ellipsis" white-space="nowrap"
                class="cursor-pointer"
              >
                <FTooltip placement="top" :mouseEnterDelay="1">
                  <template #title>{{ item.displayName }}</template>
                  <FText
                    appearance="bodyReg14"
                    color="textMain"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    >{{ item.displayName }}</FText
                  >
                </FTooltip>
              </FContainer>
            </FContainer>
          </FContainer>
        </FContainer>
        <FContainer
          display="inline-flex"
          flex-direction="column"
          gap="containerMedium"
          marginTop="containerXxLarge"
          v-if="this.currentLocation"
        >
        <FContainer textAlign="center">
          <FIcon class="h-8 w-12" group="illustration" name="location"></FIcon>
        </FContainer>         
          <FContainer
            display="flex"
            marginTop="containerXLarge"
            justifyContent="center"
          >
          <FButton appearance="link" size="small">
              <a :href="openInGoogleMaps()" target="_blank">View on maps</a>
            </FButton>
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
  </template>
  <script>
    import { FContainer, FText, FIcon, FButton,FSpinner,FEmptyState,FTooltip } from '@facilio/design-system'
  import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
  import getProperty from 'dlv'
  import SpaceCardMixin from '../../workorder/widgets/SpaceCardMixin'
  
  import {
    getTimeZone,
    getDateFormat,
    getTimeFormat,
  } from '../../../../utils/formatter'
  export default {
    props: ['moduleName', 'details'],
    components: {
      FContainer,
      FIcon,
      FText,
      FButton,
      FSpinner,
      FEmptyState,
      FTooltip
    },
    mixins: [SpaceCardMixin],
  data() {
    return {
      hierarchyList: [],
      loading: false,
      currentLocation: '',
      fieldDetail: {},
    }
  },
  computed: {
    currModuleName() {
      return 'workorder'
    },
    widgetTitle() {
      return 'Resource'
    },
    asset() {
      return this.details
    },
    getSpaceorAsset() {
      return this.details.resource?.name ? this.details.resource.name : '___'
    },
    multiCurrency() {
      let { displaySymbol, currencyCode, multiCurrencyEnabled } =
        this.$account.data.currencyInfo || {}
      return { displaySymbol, currencyCode, multiCurrencyEnabled }
    },
    config() {
      let { multiCurrency } = this
      return {
        dateformat: getDateFormat(),
        timezone: getTimeZone(),
        timeformat: getTimeFormat(),
        org: this.$account.org,
        multiCurrency,
      }
    },
  },
  created() {
    this.loadHierarchy()
  },
  methods: {
      isEmpty,
      async loadHierarchy() {
        this.hierarchyList = []
  
        let resourceId = this.details.id
        this.loading = true
  
        let { data,error } = await API.get(
          `/v2/assets/${resourceId}?fetchHierarchy=true`
        )
        if (error) {
          ftoast.critical(error.message)
        } else {
          let space = getProperty(data.asset, 'space', {})
          if (!isEmpty(space)) {
            this.hierarchyList = await this.initHierarchy(space)
          }
        }
  
        if (data?.asset?.space) {
          this.currentLocation = data?.asset?.currentLocation
        }
        this.currentLocation = data?.asset?.currentLocation
        this.loading = false
      },
      openInGoogleMaps() {
        let href = `https://www.google.com/maps/search/?api=1&query=${this.currentLocation}`
        return href
      },
    },
  }
  </script>
