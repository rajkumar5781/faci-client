<template>
  <FContainer>
    <portal :to="groupActionPortal">
      <FContainer
        top="var(--spacing-containerMedium)"
        right="var(--spacing-containerLarge)"
        position="relative"
      >
        <FButton
          appearance="secondary"
          size="small"
          iconGroup="navigation"
          iconName="addition"
          iconPosition="prefix"
          @click="openLookupWizard"
        >
          <FText textTransform="capitalize">{{
            $t('calendar.associate_btn', { ns: 'energy', moduleName })
          }}</FText>
        </FButton>
      </FContainer>
    </portal>
    <FContainer>
      <FContainer
        v-if="showLoading"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <FSpinner :size="20" />
      </FContainer>
      <FContainer v-else-if="isEmpty(recordList)" height="100%" display="flex" justifyContent="center" marginTop="sectionLarge">
        <FEmptyState
          :title="emptyStateText"
          illustration="no-entries"
          :vertical="true"
          size="S"
        ></FEmptyState>
      </FContainer>
      <FTable
        v-else-if="!isEmpty(recordList)"
        :data="recordList"
        :columns="columns"
        :hideBorder="true"
        selectType="bulk"
        :selectedList="selectedItemList"
        @recordSelected="recordSelected"
        :showSelectBar="true"
      >
        <template #float-bar>
            <FButton @click="disassociateAction()" class="mr-2">
              <FText textTransform="capitalize">{{
            $t('calendar.disassociate_btn', { ns: 'energy', moduleName })
          }}</FText>
            </FButton
            >
        </template>
        <template #cell.id="{ row }">
          <FText color="textCaption">{{
            `#${getProperty(row, 'id', '')}`
          }}</FText>
        </template>
        <template #cell.managedBy="{ row, prop }">
          <FText>{{ getEnumFieldValue(row, prop) }}</FText>
        </template>
        <template #cell.category="{ row, prop }">
          <FText>{{ getEnumFieldValue(row, prop) }}</FText>
        </template>
        <template #cell.department="{ row, prop }">
          <FText>{{ getEnumFieldValue(row, prop) }}</FText>
        </template>
        <template #cell.action="{ row }">
          <FIcon
            @click="disassociateAction(row)"
            group="action"
            name="delete"
            size="16"/>
        </template>
      </FTable>
      <LookupWizard
        v-if="canShowLookupWizard"
        :field.sync="field"
        :canShowLookupWizard.sync="canShowLookupWizard"
        :listUrlConfig="listUrlConfig"
        @closeWizard="cancelLookupWizard"
        @setListValues="setLookupFieldValue"
      ></LookupWizard>
      <portal v-if="!isEmpty(recordList)" :to="footerPortal">
        <FContainer height="40px" display="flex" alignItems="center">
          <Pagination
            :key="`pagination-${moduleName}`"
            :totalCount="recordCount"
            :currentPageNo.sync="page"
            :currentPageCount="(recordList || []).length"
            :perPage="perPage"
          />
        </FContainer>
      </portal>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FButton, FTable, ftoast , FIcon} from '@facilio/design-system'
import RelatedList from '../../../../components/page-builder/widgets/relatedList/RelatedList.vue'
import getProperty from 'dlv'
import { LookupWizard } from '@facilio/ui/new-forms'
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'

export default {
  name: 'CalendarAssociation',
  extends: RelatedList,
  props: ['groupActionPortal', 'footerPortal'],
  components: { FContainer, FButton, FTable, LookupWizard , FIcon},
  data() {
    return {
      canShowLookupWizard: false,
      selectedItemList: [],
    }
  },
  computed: {
    moduleName() {
      return getProperty(this, 'widget.widgetParams.moduleName', 'asset')
    },
    listUrlConfig() {
      let { moduleName, relatedFieldName } = this
      let params = {}

      return {
        url: `v3/unrelated/${relatedFieldName}/fetchAll/${moduleName}`,
        toModuleName:moduleName,
        params,
        multiple: true,
      }
    },
    emptyStateText(){
      let { moduleName } = this
      return this.$t('calendar.empty_state_associated', { ns : 'energy', moduleName})
    },
    relatedFieldName() {
      return 'calendar'
    },
    field() {
      let { moduleName } = this
      return {
        isDataLoading: false,
        options: [],
        lookupModuleName: moduleName,
        field: {
          lookupModule: {
            name: moduleName,
            displayName: moduleName,
          },
        },
        multiple: true,
        filters: {
          calendar: { operatorId: 1, value: null },
          oneLevelLookup: {},
        },
      }
    },
    perPage() {
      return 10
    },
    columns() {
      let { moduleName } = this
      let column = [
        {
          name: 'id',
          displayName: this.$t('calendar.table_column.id', { ns: 'energy' }),
          id: 1,
        },
        {
          name: 'name',
          displayName: this.$t('calendar.table_column.name', { ns: 'energy' }),
          id: 2,
        },
      ]
      let additionalColumns = []
      if (moduleName === 'asset') {
        additionalColumns = [
          {
            name: 'category',
            displayName: this.$t('calendar.table_column.category', {
              ns: 'energy',
            }),
            id: 3,
          },
          {
            name: 'department',
            displayName: this.$t('calendar.table_column.department', {
              ns: 'energy',
            }),
            id: 4,
          },
        ]
      } else {
        additionalColumns = [
          {
            name: 'managedBy',
            displayName: this.$t('calendar.table_column.managed_by', {
              ns: 'energy',
            }),
            id: 3,
          },
          {
            name: 'area',
            displayName: this.$t('calendar.table_column.total_area', {
              ns: 'energy',
            }),
            id: 4,
          },
        ]
      }
      return [...column, ...additionalColumns]
    },
  },
  methods: {
    getProperty,
    getEnumFieldValue(row, prop) {
      return getProperty(row, `${prop}.name`, '---')
    },
    openLookupWizard() {
      this.canShowLookupWizard = true
    },
    cancelLookupWizard() {
      this.canShowLookupWizard = false
    },
    recordSelected(list) {
      this.selectedItemList = list
    },    
    async disassociateAction(record = {}) {
      let { selectedItemList = [] ,moduleName , recordList= [] , page} = this
      let params = {
          moduleName,
          parentModuleName:'calendar'
        }
      if(!isEmpty(record)){
        let {id = null} = record
        params = { 
          ...params,
          [moduleName]: [{ id, calendar: { id: null }}],
        }
      }
      else if (!isEmpty(selectedItemList)) {
        params = {
          ...params,
          [moduleName]: selectedItemList.map(data => {
            let { id } = data || {}
            return { id, calendar: { id: null } }
          }),
        }
        if(recordList.length === selectedItemList.length){
          this.page = page > 1 ? page-1 : page
        }
      }
      if(!isEmpty(record) || !isEmpty(selectedItemList)){
        let { error = {} } = await API.post('v3/bulkPatch/calendar', params)

        if (error) {
          let { message = this.$t('error_occured') } = error
          ftoast.critical(message)
        } else {
          ftoast.success(
            this.$t('calendar.disassociate_success_msg', {
              ns: 'energy',
              moduleName,
            })
          )
          this.loadRecords(true)
        }
      
      this.selectedItemList = []
      }
    },
    async setLookupFieldValue(selectedData=[]) {
      let { moduleName, details = {} } = this
      let { id: calendarId } = details
      if (!isEmpty(selectedData)) {
        let params = {
          moduleName,
          [moduleName]: selectedData.map(data => {
              let { value = null } = data
              return { id: value, calendar: { id: calendarId } }
            }),
          parentModuleName:'calendar'
        }

        let { error = {} } = await API.post('v3/bulkPatch/calendar', params)

        if (error) {
          let { message = this.$t('error_occured') } = error
          ftoast.critical(message)
        } else {
          ftoast.success(
            this.$t('calendar.associate_success_msg', {
              ns: 'energy',
              moduleName,
            })
          )
          this.loadRecords(true)
        }
      }
    },
  },
}
</script>
