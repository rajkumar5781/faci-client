<template>
  <FContainer
    height="100vh"
    width="100%"
    display="flex"
    alignItems="center"
    justifyContent="center"
    ><FContainer width="500px" height="fit-content">
      <FCard>
        <FContainer
          padding="sectionSmall"
          display="flex"
          flexDirection="column"
          gap="4px"
        >
          <FContainer
            width="100%"
            padding="containerLarge"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FText appearance="headingMed20">{{ errorCode }}</FText></FContainer
          >
          <FContainer
            width="100%"
            padding="containerLarge"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FText appearance="headingMed16">{{ title }}</FText></FContainer
          >
          <FContainer
            width="100%"
            padding="containerLarge"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FText color="textDescription">{{ description }}</FText></FContainer
          >
          <FContainer
            v-if="!isEmpty(userMail)"
            width="100%"
            padding="containerLarge"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FText color="textCaption">{{ userMail }}</FText></FContainer
          >
          <FContainer
            v-if="hasUserInfoSlot"
            width="100%"
            padding="containerLarge"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <slot name="info"></slot
          ></FContainer>
          <FContainer
            v-if="isPreRequired"
            width="100%"
            padding="containerLarge"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FButton appearance="link" size="medium">
              <a :href="previousRoute">{{ previousRoute }}</a>
            </FButton>
          </FContainer>
          <FContainer
            width="100%"
            padding="containerLarge"
            display="flex"
            justifyContent="end"
            gap="containerLarge"
            ><FButton @click="goHome">{{ buttonText }}</FButton
            ><slot name="action"> </slot
          ></FContainer>
        </FContainer>
      </FCard>
    </FContainer>
  </FContainer>
</template>
<script>
import ErrorMixin from './ErrorMixin'
import { FContainer, FCard, FText, FButton } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
import { getTolgee } from '../../utils/tolgee'

const $t = getTolgee().t
export default {
  mixins: [ErrorMixin],
  props: [
    'errorCode',
    'title',
    'description',
    'userMail',
    'isPreRequired',
    'customEvent',
  ],
  components: {
    FContainer,
    FCard,
    FText,
    FButton,
  },
  data() {
    return {
      isEmpty,
    }
  },
  computed: {
    hasUserInfoSlot() {
      return this.$slots?.info
    },
    haserrorSubText2Slot() {
      return this.$slots?.errorSubText2
    },
    buttonText() {
      return $t('pages.go-home', {
        ns: 'error',
      })
    },
  },
  methods: {
    goHome() {
      let { customEvent } = this
      if (customEvent) {
        this.$emit('onGoHome')
      } else {
        let route = this.$router.resolve({ path: '/' })
        window.location.href = route?.href
      }
    },
  },
}
</script>
<style lang="scss"></style>
