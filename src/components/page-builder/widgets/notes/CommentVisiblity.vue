<template>
  <FPopover
    :showArrow="true"
    placement="left"
    trigger="clickToOpen"
    :visible="visible"
    @visibleChange="val => (visible = val)"
  >
    <FContainer slot="content">
      <FContainer
        padding="containerXLarge"
        borderBottom="solid 1px"
        borderColor="borderNeutralBaseSubtler"
      >
        <FContainer
          display="flex"
          justifyContent="space-between"
          marginBottom="containerLarge"
        >
          <FText>{{ 'Public' }}</FText>
          <FSwitch
            v-model="allowPublic"
            @change="onTogglePublic"
            size="small"
          />
        </FContainer>
        <FText appearance="captionReg12" color="textDescription">
          {{ 'Org & Portal Users can see this comment' }}
        </FText>
      </FContainer>
      <FContainer padding="containerXLarge">
        <FCheckboxGroup
          v-model="selectedApps"
          :disabled="!allowPublic"
          :options="appOptions"
          @change="onChange"
        />
      </FContainer>
    </FContainer>
    <div>
      <slot></slot>
    </div>
  </FPopover>
</template>
<script>
import {
  FPopover,
  FContainer,
  FText,
  FSwitch,
  FCheckboxGroup,
} from '@facilio/design-system'
export default {
  props: ['value', 'apps', 'disable'],
  name: 'CommentVisiblity',
  components: { FPopover, FContainer, FText, FSwitch, FCheckboxGroup },
  data: () => ({
    visible: false,
    allowPublic: false,
    selectedApps: [],
  }),
  computed: {
    appOptions() {
      let { apps } = this || {}
      return apps.map(app => ({ ...app, label: app.name, value: app.id }))
    },
  },
  mounted() {
    this.init()
  },
  watch: {
    value() {
      this.init()
    },
  },
  methods: {
    init() {
      if (this.value) {
        this.selectedApps = this.value.map(s => {
          return s.appId
        })
        if (this.selectedApps.length) {
          this.allowPublic = true
        }
      }
    },
    onTogglePublic() {
      if (!this.allowPublic) {
        this.selectedApps = []
        this.onChange()
      }
    },
    onChange() {
      let commentSharing = this.selectedApps.map(appId => {
        return { appId: appId }
      })
      this.$emit('input', commentSharing)
      this.$emit('change', commentSharing)
    },
    onHide() {
      this.$emit('hide')
    },
  },
}
</script>
