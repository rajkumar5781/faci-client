<template>
  <FContainer
    padding="containerXxLarge containerNone"
    borderBottom="solid 1px"
    borderColor="borderNeutralBaseSubtler"
  >
    <div class="flex w-full justify-between items-center">
      <FText appearance="headingMed16">Contact</FText>
      <FIcon group="edit" name="edit-line" size="16" @click="canShowDialog" />
    </div>
    <FContainer
      padding="containerXxLarge containerNone"
      class="flex justify-between flex-wrap w-[688px]"
    >
      <FContainer
        v-for="(details, index) in userDetails"
        :key="`${index}-details`"
        class="flex flex-col w-[292px]"
        marginBottom="containerXxLarge"
      >
        <FText appearance="headingMed14" marginBottom="containerMedium">{{
          details.label
        }}</FText>
        <FText
          :color="`${details.value ? 'textDescription' : 'textCaption'}`"
          >{{ details.value ? details.value : '--' }}</FText
        >
      </FContainer>
    </FContainer>
    <EditContactDialog
      v-if="showDialog"
      :user="userData"
      :showDialog="showDialog"
      @onClose="closeContactDialog"
      @onSave="handleContactSave"
    ></EditContactDialog>
  </FContainer>
</template>

<script>
import { FContainer, FText, FIcon } from '@facilio/design-system'
import EditContactDialog from './EditContactDialog.vue'
export default {
  name: 'Contact',
  props: ['user'],
  components: { FContainer, FText, FIcon, EditContactDialog },
  data() {
    return {
      showDialog: false,
    }
  },
  computed: {
    userDetails() {
      let { user } = this || {}
      let {
        name,
        email,
        timezone,
        language,
        phone,
        mobile,
        street,
        city,
        state,
        zip,
        country,
      } = user || {}
      return [
        { label: 'Name', value: name },
        { label: 'Email', value: email },
        { label: 'Timezone', value: timezone },
        { label: 'Language', value: language },
        { label: 'Phone', value: phone },
        { label: 'Mobile', value: mobile },
        { label: 'Street', value: street },
        { label: 'City', value: city },
        { label: 'State', value: state },
        { label: 'Zipcode', value: zip },
        { label: 'Country', value: country },
      ]
    },
    userData() {
      let { user } = this || {}
      return user
    },
  },
  methods: {
    canShowDialog() {
      this.showDialog = true
    },
    closeContactDialog() {
      this.showDialog = false
    },
    handleContactSave() {
      this.showDialog = false
      this.$emit('onSave')
    },
  },
}
</script>
