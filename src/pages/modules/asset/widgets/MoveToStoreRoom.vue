<template>
  <FModal
    title="Move To Storeroom"
    :visible="showStoreRoomPopUp"
    :confirmLoading="isSaving"
    saveText="Ok"
    size="S"
    :hideFooter="false"
    @ok="save()"
    @cancel="closeDialog()"
    padding="containerLarge"
  >
    <FContainer
      height="50%"
      display="flex"
      flexDirection="column"
      gap="containerXxLarge"
      padding="containerXxLarge"
    >
      <div v-if="nonRotatingAsset">
        <FText>Item Type</FText>
        <Lookup
          :field.sync="rotatingItemTypeLookupData"
          v-model="selectedItem.selectedRotatingItemType"
        />
      </div>
      <FText>Store Room</FText>
      <Lookup
        :field.sync="storeRoomLookupData"
        v-model="selectedItem.selectedStoreroom"
      />
    </FContainer>
  </FModal>
</template>
<script>
import { FContainer, FText, FModal } from '@facilio/design-system'
import { Lookup } from '@facilio/ui/new-forms'
export default {
  props: ['showStoreRoomPopUp', 'isSaving', 'nonRotatingAsset'],
  components: { FContainer, FText, FModal, Lookup },
  data() {
    return {
      selectedItem: {
        selectedStoreroom: null,
        selectedRotatingItemType: null,
      },
      rotatingItemTypeLookupData: {
        name: 'itemTypes',
        lookupModule: {
          displayName: 'Rotating Item Type',
          name: 'itemTypes',
        },
        forceFetchAlways: true,
        selectedItems: [],
      },
      storeRoomLookupData: {
        displayName: 'Choose Storeroom',
        name: 'storeRoom',
        lookupModule: {
          displayName: 'Storeroom',
          name: 'storeRoom',
        },
        forceFetchAlways: true,
        selectedItems: [],
      },
    }
  },

  methods: {
    closeDialog() {
      this.$emit('onclose')
    },
    save() {
      this.$emit('onSave', this.selectedItem)
    },
  },
}
</script>
