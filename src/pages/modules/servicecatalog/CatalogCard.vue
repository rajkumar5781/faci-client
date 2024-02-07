<template>
  <FContainer
    border="1px solid"
    padding="containerXxLarge"
    borderColor="borderNeutralBaseSubtler"
    borderRadius="high"
    cursor="pointer"
    hover-boxShadow="lightMed"
    @mouseover="showRequest = true"
    @mouseleave="showRequest = false"
    height="130px"
  >
    <FContainer
      display="flex"
      justifyContent="space-between"
      marginBottom="containerXLarge"
      height="30px"
    >
      <div>
        <FContainer
          v-if="isEmpty(getPhotoUrl)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="medium"
          padding="containerLarge"
          backgroundColor="backgroundMidgroundMedium"
        >
          <FIcon
            group="dsm"
            name="image"
            key="dsm-image"
            size="20"
            :pressable="false"
            color="textDescription"
          >
          </FIcon>
        </FContainer>
        <div v-else>
          <img :src="getPhotoUrl" class="catalog-image" />
        </div>
      </div>
      <div>
        <FButton
          v-if="showRequest"
          @click="redirectToCatalogRequest(catalogItem)"
        >
          <FText> {{ $t('catalog.request', { ns: 'servicecatalog' }) }}</FText>
        </FButton>
      </div>
    </FContainer>
    <FContainer marginBottom="containerLarge" display="flex">
      <FText
        appearance="headingMed14"
        color="textDescription"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {{ getCatalogName }}
      </FText>
    </FContainer>
    <FContainer display="flex">
      <FTooltip
        placement="bottom"
        v-if="!isEmpty(getDescription)"
        :mouseEnterDelay="1"
      >
        <template #title>{{ getDescription }}</template>
        <FText
          appearance="captionReg12"
          color="textCaption"
          overflow="hidden"
          textOverflow="ellipsis"
          class="text-ellipsis"
        >
          {{ getDescription }}
        </FText>
      </FTooltip>
      <FText
        v-else
        appearance="captionReg12"
        color="textCaption"
        overflow="hidden"
        textOverflow="ellipsis"
        class="text-ellipsis"
      >
        {{ emptyText }}
      </FText>
    </FContainer>
    <FContainer v-if="openCatalogRequest">
      <Catalog-request
        :catalogItem="catalogItem"
        :visible="openCatalogRequest"
        @closeCatalogRequest="closeCatalogRequest"
      />
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FButton,
  FIcon,
  FTooltip,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import CatalogRequest from './CatalogRequest.vue'
import CatalogMixin from './CatalogMixin.vue'
export default {
  props: ['catalogItem'],
  mixins: [CatalogMixin],
  components: {
    FContainer,
    FText,
    FTooltip,
    FButton,
    FIcon,
    CatalogRequest,
  },
  data() {
    return {
      showRequest: false,
      isEmpty,
      openCatalogRequest: false,
      emptyText: '---',
    }
  },
  methods: {
    redirectToCatalogRequest(catalog) {
      let { externalURL } = catalog
      if (!isEmpty(externalURL)) {
        window.open(externalURL, '_blank', 'noopener,noreferrer')
      } else {
        this.openCatalogRequest = true
      }
    },
    closeCatalogRequest() {
      this.openCatalogRequest = false
    },
  },
}
</script>
<style scoped lang="scss">
.text-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.catalog-image {
  height: 32px;
  width: 32px;
  border-radius: 4px;
}
</style>
