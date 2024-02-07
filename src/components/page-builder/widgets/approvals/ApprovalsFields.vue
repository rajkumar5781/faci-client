<template lang="">
  <FContainer height="100%">
    <portal :to="actionPortal">
      <FButton appearance="secondary" size="small" @click="redirectToOverview">
        {{
          $t('approval_fields.go_to_summary', {
            ns: 'approvals',
          })
        }}
      </FButton>
    </portal>
    <portal :to="footerPortal">
      <FContainer
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding="containerLarge containerXLarge"
        color="borderPrimaryDefault"
        class="m-auto"
        v-if="showShowMore && !isEmpty(detailsLayout)"
      >
        <FContainer padding="containerMedium containerLarge">
          <FButton
            @click="toggleVisibility"
            appearance="link"
            size="medium"
            iconGroup="navigation"
            iconName="diagonal-expand"
            iconPosition="prefix"
          >
            {{ $t('summary.view_more', 'View More') }}
          </FButton>
        </FContainer>
      </FContainer></portal
    >
    <FContainer
      v-if="isLoading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="20" ref="content-container"></FSpinner>
    </FContainer>
    <FContainer
      height="100%"
      v-else-if="
        isEmpty(detailsLayout) || isEmpty(dlv(clippedLayout, '0.fields'))
      "
    >
      <FEmptyState
        :title="
          $t(
            'summary.page_api_fail',
            'We were not able to show the required info, please retry later !!'
          )
        "
        :vertical="true"
        illustration="no-entries"
      ></FEmptyState>
    </FContainer>
    <FContainer
      padding="containerNone containerXLarge containerXLarge containerXLarge"
      overflow="hidden"
      height="fit-content"
      v-else
    >
      <FieldsGroup
        style="overflow: hidden"
        ref="content-container"
        :title="widgetTitle"
        :detailsLayout="clippedLayout"
        :details="details"
        :config="config"
        :getRoute="getRoute"
        :sites="sites"
        @mounted="callResize"
        @redirectToSummary="redirectToSummary"
      ></FieldsGroup>
    </FContainer>
    <FModal
      :visible="canShowInPopOver"
      @cancel="() => (canShowInPopOver = !canShowInPopOver)"
      :title="widgetTitle"
      :hideFooter="true"
      size="L"
    >
      <FContainer
        padding="containerNone containerXxLarge"
        height="100%"
        overflow="hidden"
      >
        <FieldsGroup
          v-if="!isLoading"
          style="overflow: hidden"
          :title="widgetTitle"
          :detailsLayout="detailsLayout"
          :details="details"
          :config="config"
          :sites="sites"
          :insidePop="true"
          :getRoute="getRoute"
          @redirectToSummary="redirectToSummary"
          @possibleOverflow="setShowMore"
          :getTimeZone="getTimeZone"
        ></FieldsGroup>
      </FContainer>
    </FModal>

    <iframe
      v-if="exportDownloadUrl"
      :src="exportDownloadUrl"
      style="display: none"
    ></iframe>
    <PreviewFile
      :visibility.sync="showPreview"
      v-if="showPreview"
      :previewFile="previewFile"
      :files="[previewFile]"
    ></PreviewFile>
  </FContainer>
</template>
<script>
import { FContainer } from '@facilio/design-system'
import SummaryFieldsWidget from '../../widgets/fieldSummary/SummaryFieldsWidget.vue'
import { isEmpty } from '@facilio/utils/validation'
import { findRouteForModule, pageTypes } from '@facilio/router'
import FetchViews from '../../../views/FetchViews.vue'
import dlv from 'dlv'
import { getTimeZone } from '../../../../utils/formatter'

export default {
  mixins: [FetchViews],
  extends: SummaryFieldsWidget,
  props: [
    'details',
    'widget',
    'approvalMeta',
    'metaFields',
    'moduleMeta',
    'actionPortal',
  ],
  data() {
    return {
      dlv,
      isEmpty,
      getTimeZone,
    }
  },
  components: {
    FContainer,
  },
  watch: {
    detailsLayout(newVal) {
      if (!isEmpty(newVal.fields)) {
        this.isLoading = false
      }
    },
  },
  methods: {
    async redirectToOverview() {
      let { details } = this
      let url = await this.getSummaryRoute(details)
      window.open(url, '_blank')
    },
    async getSummaryRoute(record) {
      let { moduleName, $router } = this
      let viewname = await this.fetchView(moduleName)
      let params = { viewname, id: record.id, moduleName }
      let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW)

      if (name) {
        let { href } = $router.resolve({ name, params }) || {}
        return href
      }
    },
  },
}
</script>
