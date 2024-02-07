<template>
  <FContainer>
    <FPopover
      v-model="visiblity"
      :showArrow="false"
      placement="bottom"
      trigger="clickToOpen"
    >
      <FTooltip placement="top">
        <template slot="title"> Export </template>
        <FIcon group="action" name="export" size="18" :pressable="true" />
      </FTooltip>
      <template #content>
        <FContainer
          display="flex"
          alignTtems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <FContainer
            v-for="option in exportOptions.options"
            :key="option.identifier"
            padding="containerMedium"
            hover-backgroundColor="backgroundAccentBlueSubtle"
            width="100%"
            cursor="pointer"
            @click="exportModuleList(option.type)"
          >
            <FButton :appearance="option.appearance" v-bind="option">{{
              option.name
            }}</FButton>
          </FContainer>
        </FContainer>
      </template>
    </FPopover>
    <iframe
      v-if="exportDownloadUrl"
      :src="exportDownloadUrl"
      style="display: none"
    ></iframe>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import {
  FContainer,
  FPopover,
  FIcon,
  FText,
  FTooltip,
  ftoast,
  FButton,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  props: ['moduleName', 'viewDetails', 'filters', 'exportOptions'],
  components: { FContainer, FPopover, FIcon, FText, FTooltip, FButton },
  data() {
    return {
      visiblity: false,
      exportDownloadUrl: null,
    }
  },
  computed: {
    viewName() {
      return this.viewDetails?.name || null
    },
  },
  methods: {
    async exportModuleList(type) {
      let { moduleName, viewName, filters } = this
      let url = `${moduleName}/exportModule`
      let params = {
        type,
        moduleName,
        viewName,
        specialFields: false,
        filters: !isEmpty(filters) ? JSON.stringify(filters) : null,
      }

      ftoast.success('Downloading...')
      let { data, error } = await API.post(url, params)

      if (error) {
        ftoast.critical('Export failed')
      } else {
        this.exportDownloadUrl = data.fileUrl
      }
    },
  },
}
</script>
