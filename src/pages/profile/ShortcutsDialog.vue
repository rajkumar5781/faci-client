<template>
  <FModal
    title="Shortcuts"
    size="M"
    type="default"
    :visible="visiblity"
    :hideFooter="true"
    @cancel="handleCancel"
    padding="containerNone"
  >
    <FTable
      :columns="column"
      :data="shortCuts"
      :hideBorder="false"
      :showSelectBar="false"
    >
      <template #[`cell.shortcut`]="{ row, prop }">
        <FContainer display="flex">
          <FContainer marginRight="containerLarge">
            <FTags appearance="simple" :text="row[prop].mainKey" />
          </FContainer>
          <FContainer>
            <FTags appearance="simple" :text="row[prop].secondaryKey" />
          </FContainer>
        </FContainer>
      </template>
    </FTable>
  </FModal>
</template>
<script>
import { FModal, FContainer, FTable, FTags } from '@facilio/design-system'
export default {
  name: 'ShortcutsDialog',
  props: ['showShortCutDialog'],
  components: {
    FModal,
    FContainer,
    FTable,
    FTags,
  },
  data() {
    return {
      visiblity: this.showShortCutDialog,
      shortCuts: [
        {
          actionName: 'Open QuickSwitch',
          shortcut: {
            mainKey: 'Cmd',
            secondaryKey: 'K',
          },
        },
        {
          actionName: 'Focus to tab group',
          shortcut: {
            mainKey: 'Shift',
            secondaryKey: 'G',
          },
        },
        {
          actionName: 'Focus to tab',
          shortcut: {
            mainKey: 'Shift',
            secondaryKey: 't',
          },
        },
        {
          actionName: 'Go to next page',
          shortcut: {
            mainKey: 'Shift',
            secondaryKey: '→',
          },
        },
        {
          actionName: 'Go to previous page',
          shortcut: {
            mainKey: 'Shift',
            secondaryKey: '←',
          },
        },
        {
          actionName: 'Open advanced filters',
          shortcut: {
            mainKey: 'Shift',
            secondaryKey: '/',
          },
        },
        {
          actionName: 'Apply selected criteria in advanced filter',
          shortcut: {
            mainKey: 'Cmd',
            secondaryKey: '↵',
          },
        },
        {
          actionName: 'Create New',
          shortcut: {
            mainKey: 'Shift',
            secondaryKey: 'n',
          },
        },
        {
          actionName: 'Keyboard shortcuts',
          shortcut: {
            mainKey: 'Cmd',
            secondaryKey: '?',
          },
        },
      ],
      column: [
        { displayName: 'Action', name: 'actionName', id: 1 },
        { displayName: 'Shortcut', name: 'shortcut', id: 2 },
      ],
    }
  },
  methods: {
    handleCancel() {
      this.visiblity = false
      this.$emit('onClose')
    },
  },
}
</script>
