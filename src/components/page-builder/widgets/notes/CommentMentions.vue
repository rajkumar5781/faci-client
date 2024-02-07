<template>
  <div class="mention-popover">
    <div
      v-if="isLoading"
      class="comment-mentions-popover w-60 h-20 flex items-center justify-center"
    >
      <FSpinner :show="isLoading" :size="30"></FSpinner>
    </div>
    <div v-else-if="isPeopleSelection" class="comment-mentions-popover">
      <FMenuItem
        v-for="(people, index) in recordsList"
        :key="index"
        :isSelected="selectedIndex == index"
        @click="selectItem(index)"
      >
        <FContainer
          class="flex items-center justify-center"
          gap="containerLarge"
        >
          <FAvatar size="S" :userName="people.name"></FAvatar>
          {{ people.name }}
          <FDivider height="10px" />
          <FText
            appearance="captionReg10"
            color="textCaption"
            v-if="people.fields"
          >
            {{ people.subtitle }}
          </FText>
        </FContainer>
      </FMenuItem>
    </div>
    <div v-else class="comment-mentions-popover">
      <FMenuItem
        v-for="(record, index) in recordsList"
        :key="index"
        :isSelected="selectedIndex == index"
        @click="selectItem(index)"
      >
        <FContainer
          class="flex items-center justify-center"
          gap="containerLarge"
        >
          <FText appearance="headingMed14" color="textCaption">
            {{ record.id }}
          </FText>
          <FDivider height="10px" />
          {{ record.name }}
        </FContainer>
      </FMenuItem>
    </div>
  </div>
</template>

<script>
import {
  FSpinner,
  FAvatar,
  FMenuItem,
  FContainer,
  FText,
  FDivider,
} from '@facilio/design-system'
import debounce from 'lodash/debounce'
import { isEmpty } from '@facilio/utils/validation'
import { getApp } from '@facilio/router'
import { API } from '@facilio/api'
import { getFieldOptions } from '../../../../utils/picklist'
import './comment.css'

export default {
  components: {
    FSpinner,
    FAvatar,
    FMenuItem,
    FContainer,
    FText,
    FDivider,
  },
  props: {
    editor: {
      type: Object,
      required: false,
    },

    items: {
      type: Object,
      required: true,
    },
    query: {
      type: String,
      required: false,
    },

    command: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      selectedIndex: 0,
      visible: true,
      isLoading: false,
      recordsList: [],
      clientContact: null,
    }
  },
  async created() {
    await this.init()
    this.loadRecords()
  },

  watch: {
    query() {
      this.searchRecords()
    },
  },
  computed: {
    moduleName() {
      return this.items.moduleName
    },
    isPeopleSelection() {
      return this.items.moduleName === 'people'
    },
    getPeopleTypeFromApplinkName() {
      let linkName = getApp().linkName
      if (linkName === 'tenant') {
        return '1'
      } else if (linkName === 'vendor') {
        return '2'
      } else if (linkName === 'employee') {
        return '3'
      } else if (linkName === 'client') {
        return '4'
      } else if (linkName === 'service') {
        return '5'
      }
      return null
    },
  },

  methods: {
    searchRecords: debounce(function () {
      this.loadRecords()
    }, 400),
    async init() {
      // this special handle for only get the client contacts which is related to the user contact
      if (this.getAPPlinkname === 'client') {
        await this.getClientContact()
      }
    },
    async getClientContact() {
      let { user } = this.$account
      if (user?.peopleId) {
        let id = user.peopleId
        if (id) {
          let url = `v3/modules/clientcontact/${id}?id=4&moduleName=clientcontact`
          let { data } = await API.get(url)
          if (data?.clientcontact) {
            this.clientContact = data.clientcontact
          }
        }
      }
    },
    async loadRecords() {
      let { query, moduleName, isPeopleSelection, items } = this
      let { peopleFromRecordFields } = items || []
      let peopleFromFields = []
      let recordsForIds = []
      let recordsFromSearch = []

      this.isLoading = true
      if (isPeopleSelection && !isEmpty(peopleFromRecordFields)) {
        peopleFromFields = this.searchPeopleFromFields(query)
      }
      if (query && !isNaN(query)) {
        recordsForIds = await this.getRecordsForIds(query, moduleName)
      }
      recordsFromSearch = await this.getRecordForQuery(query, moduleName)
      this.recordsList = this.getUniqueRecords(
        peopleFromFields,
        recordsForIds,
        recordsFromSearch
      )
      this.isLoading = false
    },

    async getRecordForQuery(query, moduleName) {
      // this menthod is used to fetch the mention people list and module records
      let { getPeopleTypeFromApplinkName, clientContact } = this
      let filters = {}
      if (!isEmpty(getPeopleTypeFromApplinkName)) {
        filters['peopleType'] = {
          operatorId: 36,
          value: [getPeopleTypeFromApplinkName],
        }
      }
      let field = {
        lookupModuleName: moduleName,
        filters,
      }
      if (clientContact?.client?.id) {
        field['lookupModuleName'] = 'clientcontact'
        filters['client'] = {
          operatorId: 36,
          value: ['' + clientContact.client.id],
        }
      }
      let { error, options } = await getFieldOptions({
        field,
        searchText: query,
      })
      if (error) {
        return []
      } else {
        let recordsFromSearch = options.map(mod => ({
          name: mod.label,
          id: mod.value,
        }))
        return recordsFromSearch
      }
    },
    async getRecordsForIds(query, moduleName) {
      let filters = {
        id: { operatorId: 36, value: [`${query}`] },
      }

      let field = {
        lookupModuleName: moduleName,
        filters,
      }

      let params = {
        field,
      }
      let { error, options } = await getFieldOptions(params)
      if (!error) {
        let recordsForIds = options.map(mod => ({
          name: mod.label,
          id: mod.value,
        }))
        return recordsForIds
      } else {
        return []
      }
    },
    searchPeopleFromFields(query) {
      let { items } = this
      let { peopleFromRecordFields } = items || []
      if (!peopleFromRecordFields || !peopleFromRecordFields.length) {
        return []
      }
      let people = peopleFromRecordFields.map(ppl => {
        if (ppl?.fields) {
          ppl.subtitle = this.constructSubtitle(ppl.fields)
        }
        return ppl
      })
      if (!isEmpty(query)) {
        return people.filter(ppl => ppl.name.startsWith(query.toLowerCase()))
      } else return people
    },

    constructSubtitle(fields, maxItems = 3) {
      const MAXCHAR = 45
      let subtitle

      if (fields.length > maxItems) {
        subtitle = fields.slice(0, maxItems).join(', ')
        let remainingCount = fields.length - maxItems
        subtitle = subtitle + ` + ${remainingCount}`
      } else {
        subtitle = fields.join(', ')
      }
      if (subtitle.length > MAXCHAR) {
        if (maxItems > 1) {
          return this.constructSubtitle(fields, maxItems - 1)
        }
      }
      return subtitle
    },
    getUniqueRecords(...recordLists) {
      const resultMap = new Map()
      recordLists.forEach(list => {
        list.forEach(obj => {
          if (!resultMap.has(obj.id)) {
            resultMap.set(obj.id, obj)
          }
        })
      })
      const result = Array.from(resultMap.values())
      return result
    },

    onKeyDown({ event }) {
      if (event.key === 'ArrowUp') {
        this.upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        this.downHandler()
        return true
      }

      if (event.key === 'Enter') {
        this.enterHandler()
        return true
      }

      return false
    },

    upHandler() {
      let minIndex = 0
      if (this.selectedIndex - 1 < minIndex) {
        this.selectedIndex = minIndex
      } else {
        this.selectedIndex = this.selectedIndex - 1
      }
      this.fixScrolling()
    },

    downHandler() {
      let maxIndex = this.recordsList.length - 1
      if (this.selectedIndex + 1 > maxIndex) {
        this.selectedIndex = maxIndex
      } else {
        this.selectedIndex = this.selectedIndex + 1
      }
      this.fixScrolling()
    },

    fixScrolling() {
      /* AUTO SCROLL WHEN UP/DOWN ARROW
      let container = document.getElementsByClassName(
        'comment-mentions-popover'
      )[0]
      let selectedItem = document.getElementById('record-' + this.selectedIndex)
      console.log(
        container.offsetTop,
        container.offsetHeight,
        selectedItem.offsetTop
      )
      const itemPos = selectedItem.offsetTop
      const itemHeight = selectedItem.offsetHeight
      const containerHeight = container.clientHeight
      const scrollOffset = containerHeight - itemHeight

      console.log(scrollOffset, itemPos)
      if (scrollOffset < itemPos) {
        // Scroll the container to bring the active item into view
        container.scrollTop = container.scrollTop + selectedItem.offsetHeight
      }
      */
    },

    enterHandler() {
      this.selectItem(this.selectedIndex)
    },

    selectItem(index) {
      let { moduleName } = this
      const item = this.recordsList[index]
      if (item) {
        if (this.isPeopleSelection) {
          this.command({
            id: `${moduleName}~${item.id}`,
            label: `${item.name}`,
          })
        } else {
          this.command({
            id: `${moduleName}~${item.id}`,
            label: `${item.id}`,
          })
        }
      }
    },
  },
}
</script>
