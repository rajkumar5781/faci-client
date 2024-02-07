<template>
  <FContainer>
    <FModal
      :visible="visible"
      :size="size"
      :hideFooter="true"
      :maskClosable="true"
      type="default"
      padding="containerNone"
      :title="title"
      @cancel="handleCancel"
    >
      <ConnectedApp
        :style="{ height: height }"
        :widgetId="widgetId"
        :recordId="recordId"
        :context="context"
        :handlers="handlers"
        :exportMode="exportMode"
      ></ConnectedApp>
    </FModal>
  </FContainer>
</template>

<script>
import { FContainer, FModal } from '@facilio/design-system'
import { ConnectedApp } from '@facilio/ui/connected-app'
export default {
  props: ['widgetId', 'record', 'exportMode', 'title'],
  components: { FContainer, FModal, ConnectedApp },
  data() {
    return {
      visible: true,
      height: '500px',
      size: 'M',
      handlers: {},
    }
  },
  created() {
    this.initWidgetHandlers()
  },
  mounted() {},
  computed: {
    recordId() {
      return this.record?.id || null
    },
    context() {
      return this.record || null
    },
  },
  methods: {
    initWidgetHandlers() {
      let resize = ({ size, height }) => {
        this.size = size || this.size
        this.height = height || this.height
      }
      let hide = () => {
        this.$emit('onClose')
      }
      let setTitle = ({ title }) => {
        this.title = title || this.title
      }
      let reloadData = () => {
        this.$emit('loadData')
      }
      this.handlers = {
        resize,
        hide,
        setTitle,
        reloadData,
      }
    },
    handleCancel() {
      this.$emit('onClose')
    },
  },
}
</script>
