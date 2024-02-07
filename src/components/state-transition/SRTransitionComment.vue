<template>
  <FContainer>
    <FModal
      :visible="true"
      size="M"
      :title="title"
      @ok="onSave"
      @cancel="onClose"
    >
      <ServiceRequestMailer
        ref="ServiceRequestCommentBox"
        :visibility="true"
        :messageType="messageType"
        :details="record"
        :hideActionButton="true"
      ></ServiceRequestMailer>
    </FModal>
  </FContainer>
</template>

<script>
import ServiceRequestMailer from '../../pages/modules/servicerequest/widgets/ServiceRequestMailer.vue'
import { FContainer, FModal } from '@facilio/design-system'

export default {
  props: ['record', 'moduleName', 'transition'],
  data() {
    return {
      messageType: 3, // 3 : private note
    }
  },
  components: {
    ServiceRequestMailer,
    FContainer,
    FModal,
  },
  computed: {
    title() {
      return this.transition?.name
    },
  },
  methods: {
    onClose() {
      this.$emit('onClose')
    },
    onSave() {
      let data =
        this.$refs['ServiceRequestCommentBox']?.getFormattedMailerModel()
      this.$emit('onSave', data)
    },
  },
}
</script>
