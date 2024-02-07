<template>
  <FContainer height="100%">
    <template>
      <portal :to="portalName" :key="portalName + '-portalwrap'" slim>
        <FContainer v-if="!isEmpty(list)">
          <router-link :to="resolvePath()">
            <FIcon group="navigation" name="northeast-box" size="16"></FIcon>
          </router-link>
        </FContainer>

        <FContainer @click="listRefresh">
          <FIcon group="action" name="refresh" size="16"></FIcon>
        </FContainer>
      </portal>
    </template>

    <portal
      v-if="!isEmpty(list)"
      paddingTop="sectionLarge"
      class="portal-alignment-ws"
      ref="footer-portal"
      :class="{ height2px: !showFooterDivider }"
      :to="`footer-${widget.id}-${widget.name}`"
      @change="footerChange"
    >
      <FContainer v-if="!isEmpty(list)">
        <FPagination
          v-if="!isEmpty(list)"
          :total="totalCount"
          :pageCount="pageCount()"
          :currentPage.sync="page"
          :pageSize="perPage"
        ></FPagination>
      </FContainer>
    </portal>

    <FContainer
      v-if="loading"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <FSpinner :size="25" />
    </FContainer>
    <FContainer
      v-else-if="isEmpty(list)"
      paddingTop="containerMedium"
      height="100%"
    >
      <FDivider width="100%"></FDivider>

      <FContainer height="100%" display="flex" justifyContent="center">
        <FContainer height="100%" display="flex" justifyContent="center">
          <FContainer
            display="flex"
            justifyContent="center"
            width="500px"
            height="100%"
          >
            <FEmptyState
              title="No Logs available."
              :description="`Currently the ${moduleName} has no logs`"
              vertical
              size="S"
              illustration="no-entries"
            />
          </FContainer>
        </FContainer>
      </FContainer>
    </FContainer>
    <FContainer v-else>
      <FTable :rounded="false" :columns="column" :data="list">
        <template #[`cell.subject`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">{{
            row.field.displayName
          }}</FText>
        </template>
        <template #[`cell.value`]="{ row }">
          <FContainer v-if="row.value == null">
            <FText color="textMain" appearance="bodyReg14"> null</FText>
          </FContainer>
          <FContainer v-else-if="isDecimalField(row.field)">
            <FText color="textMain" appearance="bodyReg14">
              {{ Number(row.value).toFixed(1) }}{{ row.field.unit }}
            </FText>
          </FContainer>
          <FContainer v-else-if="isBooleanField(row.field)">
            <FText color="textMain" appearance="bodyReg14">
              {{ row.value }}</FText
            >
          </FContainer>
          <FContainer v-else>
            <FText color="textMain" appearance="bodyReg14">
              {{ row.value }}</FText
            >
          </FContainer>
        </template>
        <template #[`cell.lastrecorded`]="{ row }">
          <FText color="textMain" appearance="bodyReg14">
            {{ formatDate(row.executedTime) }}
          </FText>
        </template>
        <template #[`cell.executedBy`]="{ row }">
          <FContainer>
            <FContainer v-if="row.executedMode === 1">
              <FContainer
                display="flex"
                alignItems="center"
                gap="containerMedium"
              >
                <FAvatar size="S" :userName="getExecutedByName(row)"></FAvatar>
                <FContainer>
                  <FText color="textMain" appearance="bodyReg14">
                    {{ row.executedBy.name }}</FText
                  >
                </FContainer>
              </FContainer>
            </FContainer>
            <FContainer
              v-else-if="row.executedMode === 2 || row.executedMode === 6"
            >
              <FContainer
                display="flex"
                alignItems="center"
                gap="containerMedium"
              >
                <FAvatar size="S" :userName="getExecutedByName(row)"></FAvatar>
                <FContainer>
                  <FText color="textMain" appearance="bodyReg14">
                    {{ row.executedBy.name }}</FText
                  >
                </FContainer>
              </FContainer>
            </FContainer>
            <FContainer v-else-if="row.executedMode === 3">
              <FContainer>{{
                $t('asset.commands.execute_mode_automatic', { ns: 'asset' })
              }}</FContainer>
            </FContainer>
            <FContainer v-else-if="row.executedMode === 4">
              <FContainer>{{
                $t('asset.commands.execute_mode_automatic', { ns: 'asset' })
              }}</FContainer>
            </FContainer>
            <FContainer v-else-if="row.executedMode === 5">
              <FContainer>{{
                $t('asset.commands.execute_mode_automatic', { ns: 'asset' })
              }}</FContainer>
            </FContainer>
            <FContainer v-else>
              <FContainer>---</FContainer>
            </FContainer>
          </FContainer>
        </template>

        <template #[`cell.status`]="{ row }">
          <FContainer>
            <FContainer v-if="row.status === 1">
              <FTags
                appearance="status"
                text="Success"
                :disabled="false"
                statusType="success"
              />
            </FContainer>

            <FContainer v-else-if="row.status === 2">
              <FTags
                appearance="status"
                text="Sent"
                :disabled="false"
                statusType="warning"
              />
            </FContainer>
            <FContainer v-else-if="row.status === 3">
              <FTags
                appearance="status"
                text="Error"
                :disabled="false"
                statusType="danger"
              />
            </FContainer>
            <FContainer v-else-if="row.status === 4">
              <FTags
                appearance="status"
                text="Sheduled"
                :disabled="false"
                statusType="neutral"
              />
            </FContainer>
            <FContainer v-else-if="row.status === 5">
              <FTags
                appearance="status"
                text="Scheduled without permission"
                :disabled="false"
                statusType="neutral"
              />
            </FContainer>
            <FContainer v-else-if="row.status === 6">
              <FTags
                appearance="status"
                text="Failed"
                :disabled="false"
                statusType="warning"
              />
            </FContainer>
            <FContainer v-else-if="row.status === 7">
              <FTags
                appearance="status"
                text="Status"
                :disabled="false"
                statusType="default
"
              />
            </FContainer>
          </FContainer>
        </template>
      </FTable>
    </FContainer>
  </FContainer>
</template>
<script>
import { API } from '@facilio/api'
import {
  FContainer,
  FText,
  FTable,
  FSpinner,
  FPagination,
  FTags,
  FIcon,
  FAvatar,
  FEmptyState,
  FDivider,
} from '@facilio/design-system'
import { isBooleanField, isDecimalField } from '@facilio/utils/field'
import { isEmpty } from '@facilio/utils/validation'
import isEqual from 'lodash/isEqual'
import { findRouteForTab, tabTypes, getApp } from '@facilio/router'
import { formatDate } from '../../../../utils/formatter'
export default {
  components: {
    FContainer,
    FText,
    FTable,
    FPagination,
    FIcon,
    FTags,
    FSpinner,
    FAvatar,
    FEmptyState,
    FDivider,
  },
  props: [
    'isActive',
    'portalName',
    'assetId',
    'resize',
    'reset',
    'details',
    'moduleName',
    'widget',
  ],
  data() {
    return {
      loading: false,
      list: null,
      totalCount: null,
      page: 1,
      perPage: 50,
      column: [
        { displayName: 'Subject', name: 'subject', id: 1, fixed: true },
        {
          displayName: 'Value',
          name: 'value',
          id: 2,
          resize: true,
          width: 200,
        },
        {
          displayName: 'Last Recorded',
          name: 'lastrecorded',
          id: 3,
          width: 250,
          clickable: true,
        },
        {
          displayName: 'Executed By',
          name: 'executedBy',
          id: 4,
          width: 250,
          clickable: true,
        },
        {
          displayName: '',
          name: 'status',
          id: 5,
          width: 250,
          clickable: true,
        },
      ],
    }
  },
  watch: {
    page(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.loadControlPoints()
      }
    },
  },
  mounted() {
    this.loadControlPoints()
  },
  methods: {
    formatDate,
    isEmpty,
    isBooleanField,
    isDecimalField,
    getExecutedByName(field) {
      return field.executedBy?.name ? field.executedBy.name : ''
    },
    pageCount() {
      return Math.ceil(this.totalCount / this.perPage)
    },
    async loadControlPoints(force) {
      this.loading = true
      let params = {
        moduleName: 'controlActionCommand',
        page: this.page,
        perPage: this.perPage,
        withCount: true,
      }
      params.filters = JSON.stringify({
        resource: {
          operatorId: 36,
          value: [this.assetId.toString()],
        },
      })
      let url = '/v3/modules/data/list'
      let { data, meta } = await API.get(url, params, { force })
      this.list = data['controlActionCommand']
      let { pagination } = meta
      let { totalCount } = pagination
      this.totalCount = totalCount
      this.loading = false
    },
    addEnumMapField(fields) {
      let enumMap = fields.values.reduce((acc, object) => {
        acc[object.index.toString()] = object.value
        return acc
      }, {})
      fields.enumMap = enumMap
      return fields
    },
    listRefresh() {
      this.page = 1
      this.totalCount = 0
      this.list = null
      this.loadControlPoints(true)
    },
    resolvePath() {
      let filters = { resource: { operatorId: 36, value: [`${this.assetId}`] } }
      let { path } = findRouteForTab(tabTypes.CUSTOM, {
        config: { type: 'commands' },
      })
      let actualPath = `/${getApp()?.linkName}/${path}/commands/all`
      return {
        path: `${actualPath}?search=${encodeURIComponent(
          JSON.stringify(filters)
        )}`,
      }
    },
  },
}
</script>
