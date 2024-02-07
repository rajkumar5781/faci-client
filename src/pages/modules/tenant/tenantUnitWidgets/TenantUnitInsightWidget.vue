<template>
  <FContainer height="100%">
    <FContainer
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      height="100%"
      v-if="isLoading"
    >
      <FSpinner :size="20" />
    </FContainer>
    <FContainer padding="sectionSmall containerXLarge">
      <FContainer display="flex" alignItems="center">
        <FContainer
          backgroundColor="borderAccentCyanSubtle"
          borderRadius="full"
          alignItems="flex-start"
          gap="sectionMedium"
          padding="containerLarge"
          paddingBottom="containerMedium"
          marginRight="containerXLarge"
        >
          <FIcon
            group="default"
            name="area-sqft"
            :pressable="false"
            size="20"
          ></FIcon>
        </FContainer>
        <FContainer display="flex" flexDirection="column" gap="containerSmall">
          <FText
            appearance="headingMed14"
            color="backgroundNeutralInverseHovered"
            >{{ area }}</FText
          >
          <FText color="backgroundNeutralGrey01Dark" appearance="captionReg12">
            {{ $t('tenant.area_sq_ft', 'Area(sq.ft)', { ns: 'tenant' }) }}
          </FText>
        </FContainer>
      </FContainer>

      <FDivider
        width="100%"
        marginTop="sectionMedium"
        marginBottom="sectionMedium"
      />

      <FContainer display="flex" alignItems="center">
        <FContainer
          backgroundColor="backgroundAccentVioletSubtle"
          borderRadius="full"
          alignItems="flex-start"
          gap="containerXLarge"
          padding="containerLarge"
          paddingBottom="containerMedium"
          marginRight="containerXLarge"
        >
          <FIcon
            group="action"
            name="home"
            :pressable="false"
            size="20"
          ></FIcon>
        </FContainer>
        <FContainer display="flex" flexDirection="column" gap="containerSmall">
          <FText
            appearance="headingMed14"
            color="backgroundNeutralInverseHovered"
            >{{ maxOccupancy }}</FText
          >
          <FText color="backgroundNeutralGrey01Dark" appearance="captionReg12">
            {{ $t('tenant.max_occupancy', 'Max Occupancy', { ns: 'tenant' }) }}
          </FText>
        </FContainer>
      </FContainer>

      <FDivider
        width="100%"
        marginTop="sectionMedium"
        marginBottom="sectionMedium"
      />

      <FContainer display="flex" alignItems="center">
        <FContainer
          backgroundColor="borderAccentYellowSubtle"
          borderRadius="full"
          alignItems="flex-start"
          gap="containerXLarge"
          padding="containerLarge"
          paddingBottom="containerMedium"
          marginRight="containerXLarge"
        >
          <FIcon
            group="webtabs"
            name="asset"
            :pressable="false"
            size="20"
          ></FIcon>
        </FContainer>
        <FContainer>
          <FButton
            appearance="link"
            size="medium"
            @click="redirectToList(totalAssets)"
          >
            <FText appearance="headingMed14" color="backgroundPrimaryDefault">{{
              totalAssets
            }}</FText>
          </FButton>
          <FText color="backgroundNeutralGrey01Dark" appearance="captionReg12">
            {{ $t('tenant.assets', 'Assets', { ns: 'tenant' }) }}
          </FText>
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
  FDivider,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { findRouteForModule, pageTypes } from '@facilio/router'
import getProperty from 'dlv'

export default {
  components: {
    FContainer,
    FIcon,
    FText,
    FButton,
    FAvatar,
    FSpinner,
    FTooltip,
    FDivider,
  },
  props: ['details'],
  data() {
    return {
      workorder: {},
      isLoading: false,
      moduleName: 'tenant',
      totalAssets: 0,
    }
  },
  async created() {
    await this.getAssetsCount()
  },
  computed: {
    area() {
      return getProperty(this.details, 'area') || 0
    },
    maxOccupancy() {
      return getProperty(this.details, 'maxOccupancy') || 0
    },
  },
  methods: {
    async getAssetsCount() {
      let { id } = this.details || {}

      if (isEmpty(id)) return

      let filters = JSON.stringify({
        space: { operatorId: 36, value: [`${id}`] },
      })
      let queryParams = {
        page: 1,
        moduleName: 'asset',
        viewName: 'all',
        withCount: true,
        filters,
      }
      let { data, error } = await API.get('/v3/modules/data/count', queryParams)

      if (!error) this.totalAssets = data?.count || 0
    },
    async redirectToList(totalAssets) {
      if (!(totalAssets > 0 && this.details?.id)) return

      let filters = { space: { operatorId: 36, value: [`${this.details.id}`] } }
      let query = {
        search: JSON.stringify(filters),
        includeParentFilter: true,
      }

      let { name } = findRouteForModule('asset', pageTypes.LIST) || {}
      if (name) this.$router.push({ name, params: { viewname: 'all' }, query })
    },
  },
}
</script>
