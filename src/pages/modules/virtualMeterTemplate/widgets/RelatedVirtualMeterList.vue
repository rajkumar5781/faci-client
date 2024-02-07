<template>
  <FContainer>
    <portal :to="`action-${widget.id}-${widget.name}`">
      <FContainer
        v-if="!isEmpty(data)"
        display="flex"
        cursor="pointer"
        @click="redirectToList()"
      >
        <FText
          color="borderPrimaryDefault"
          appearance="headingMed14"
          paddingTop="containerMedium"
          hover-textDecoration="underline"
          >{{ $t('meter.vmTemplate.go_to_list_view', { ns: 'energy' }) }}</FText
        >
        <FIcon
          group="navigation"
          name="right"
          size="16"
          color="borderPrimaryDefault"
        ></FIcon>
      </FContainer>
    </portal>
    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
      height="100%"
    >
      <FSpinner :size="30" />
    </FContainer>
    <FContainer v-else height="100%">
      <FContainer
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="relative"
        height="100%"
        v-if="isEmpty(data)"
      >
        <FEmptyState
          :title="$t('meter.vmTemplate.no_associated_vm', { ns: 'energy' })"
          :description="
            $t('meter.vmTemplate.no_associated_vm_desc', { ns: 'energy' })
          "
          illustration="no-entries"
          :vertical="true"
          size="S"
        />
      </FContainer>
      <FTable
        v-else
        :columns="columns"
        :data="data"
        hideBorder
        :showSelect="false"
      >
        <template #[`cell.id`]="{ row }">
          <FContainer>
            <FText color="textMain" appearance="bodyReg14">{{
              getRecordId(row)
            }}</FText>
          </FContainer>
        </template>
        <template #[`cell.name`]="{ row }">
          <FContainer cursor="pointer" @click="redirectToSummary(row)">
            <FText color="borderPrimaryDefault" appearance="bodyReg14">{{
              getRecordName(row)
            }}</FText>
          </FContainer>
        </template>
      </FTable>
    </FContainer>
  </FContainer>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import {
  FTable,
  FContainer,
  FText,
  FIcon,
  FEmptyState,
  FSpinner,
  ftoast,
} from '@facilio/design-system'
import getProperty from 'dlv'
import { formatDate } from '../../../../utils/formatter'
import {
  isWebTabsEnabled,
  findRouteForModule,
  pageTypes,
} from '@facilio/router'
export default {
  props: ['details', 'widget'],
  components: {
    FTable,
    FContainer,
    FText,
    FIcon,
    FEmptyState,
    FSpinner,
  },
  data() {
    return {
      isLoading: false,
      relatedList: [],
      relatedResource: {},
      data: [],
    }
  },
  async created() {
    await this.loadRelatedMeters()
    await this.getRelatedVMData()
  },
  computed: {
    columns() {
      return [
        { displayName: this.$t('id', { ns: 'energy' }), name: 'id', id: 1 },
        { displayName: this.$t('name', { ns: 'energy' }), name: 'name', id: 2 },
        {
          displayName: this.$t('related_to', { ns: 'energy' }),
          name: 'relatedTo',
          id: 3,
        },
        {
          displayName: this.$t('created_date', { ns: 'energy' }),
          name: 'createdDate',
          id: 4,
        },
      ]
    },
  },
  methods: {
    isEmpty,
    async loadRelatedMeters() {
      this.isLoading = true
      let id = getProperty(this, 'details.id')
      let params = {
        page: 1,
        perPage: 5000,
        withCount: true,
        filters: JSON.stringify({
          virtualMeterTemplate: {
            operatorId: 36,
            value: [`${id}`],
          },
        }),
      }
      let moduleName = 'meter'
      let currentModuleName = 'virtualMeterTemplate'
      let relatedFieldName = 'virtualMeterTemplate'
      let url = `v3/modules/${currentModuleName}/${id}/relatedList/${moduleName}/${relatedFieldName}`
      let { data, error, meta } = await API.get(url, params, {
        force: true,
      })
      if (isEmpty(error)) {
        this.relatedList = getProperty(data, moduleName) || []
        this.relatedResource =
          getProperty(meta, 'supplements.meter.meterLocation', {}) || {}
      } else {
        ftoast.critical(
          error?.message || this.$t('error_occurred_short_message')
        )
      }
      this.isLoading = false
    },
    getRecordId(record) {
      let id = getProperty(record, 'id', '---')
      return `#${id}`
    },
    getRecordName(record) {
      return getProperty(record, 'name', '---')
    },
    getRecordRelatedTo(record) {
      let id = getProperty(record, 'meterLocation.id', null)
      let { relatedResource } = this
      return getProperty(relatedResource, `${id}.name`, '---')
    },
    getRecordCreatedDate(record) {
      let time = getProperty(record, 'sysCreatedTime')
      return !isEmpty(time) ? formatDate(time) : '---'
    },
    redirectToList() {
      let moduleName = 'meter'
      let { details } = this
      let id = getProperty(details, 'id')
      let filterObj = {
        virtualMeterTemplate: {
          operatorId: 36,
          value: [`${id}`],
        },
      }
      let { name } = findRouteForModule(moduleName, pageTypes.LIST) || {}
      let filter = JSON.stringify(filterObj)
      if (name) {
        this.$router.push({ name, query: { search: filter } })
      }
    },
    redirectToSummary(record) {
      let { id } = record || {}
      if (!isEmpty(id)) {
        let moduleName = 'meter'
        let { name } = findRouteForModule(moduleName, pageTypes.OVERVIEW) || {}
        if (name) {
          this.$router.push({
            name,
            params: {
              id,
              viewname: 'all',
            },
          })
        }
      }
    },
    getRelatedVMData() {
      let { relatedList = [] } = this
      this.data = relatedList.map(record => {
        let { id, name } = record || {}
        return {
          id: id,
          name: name,
          relatedTo: this.getRecordRelatedTo(record),
          createdDate: this.getRecordCreatedDate(record),
        }
      })
    },
  },
}
</script>
