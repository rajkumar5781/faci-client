<!-- COMPONENT NOT USED -- CAN BE REMOVED LATER IF NOT REQUIRED -->
<template>
  <FModal
    :title="title"
    :visible="isVisible"
    :confirmLoading="false"
    size="XS"
    type="default"
    padding="containerNone"
  >
    <FContainer padding="containerXLarge sectionSmall" height="500px">
      <FContainer display="flex" flexDirection="column">
        <FContainer>
          <FIcon
            group="alert"
            name="triangle-warning-filled"
            size="32"
            :pressable="false"
            color="textCaption"
          />
        </FContainer>

        <FContainer
          v-if="showHighlightedDescriptionFirst"
          display="flex"
          flexDirection="row"
        >
          <FText> {{ descriptionHighlighted }}</FText>
          <FText marginTop="containerLarge"> {{ description }} </FText>
        </FContainer>
        <FContainer
          v-if="showHighlightedDescriptionFirst"
          display="flex"
          flexDirection="row"
        >
          <FText> {{ description }} </FText>
          <FText marginTop="containerLarge">
            {{ descriptionHighlighted }}
          </FText>
        </FContainer>
      </FContainer>

      <!-- Modal Footer -->
      <template #footer>
        <FContainer
          display="flex"
          padding="containerXLarge sectionSmall"
          width="100%"
          borderTop="solid 1px"
          borderColor="borderNeutralBaseSubtler"
          justifyContent="flex-end"
        >
          <FContainer gap="containerLarge">
            <FButton
              v-if="!isEmpty(confirmButtonText)"
              @click="onClickSaveButton"
            >
              {{ confirmButtonText }}
            </FButton>
            <FButton
              v-if="!isEmpty(cancelButtonText)"
              appearance="secondary"
              @click="onClickCancelButton"
            >
              {{ cancelButtonText }}
            </FButton>
          </FContainer>
        </FContainer>
      </template>
    </FContainer>
  </FModal>
</template>

<script>
import {
  FContainer,
  FText,
  FModal,
  FIcon,
  FButton,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  name: 'CustomAlertDialog',
  components: {
    FContainer,
    FText,
    FModal,
    FIcon,
    FButton,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    descriptionHighlighted: {
      type: String,
      default: '',
    },
    confirmButtonText: {
      type: String,
      default: '',
    },
    cancelButtonText: {
      type: String,
      default: '',
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    isAlert: {
      type: Boolean,
      default: false,
    },
    showHighlightedDescriptionFirst: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onClickSaveButton() {
      this.$emit('')
    },
    onClickCancelButton() {
      this.$emit('')
    },
  },
}
</script>
