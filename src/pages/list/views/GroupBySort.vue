<template>
  <FPopover
    trigger="clickToOpen"
    placement="bottom-start"
    v-model="showSort"
    @show="showSort = true"
    @hide="showSort = false"
  >
    <FIcon group="sort" name="sort-arrow" size="14"></FIcon>
    <template #content>
      <FContainer v-for="sort in sortData" :key="sort.val">
        <FMenuItem
          :value="sort.val"
          @click="updateSort(sort)"
          :isSelected="sort.val === sortConfig.orderType"
          >{{ sort.name }}
        </FMenuItem>
      </FContainer>
    </template>
  </FPopover>
</template>
<script>
import {
  FPopover,
  FContainer,
  FText,
  FIcon,
  FMenuItem,
} from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'

export default {
  props: ['sortByField', 'sortObj'],
  components: { FPopover, FContainer, FText, FIcon, FMenuItem },
  data() {
    return {
      showSort: false,
      sortData: [
        { name: 'Ascending', val: 'asc' },
        { name: 'Descending', val: 'desc' },
      ],
      sortConfig: {
        orderBy: null,
        orderType: null,
      },
    }
  },
  created() {
    if (!isEmpty(this.sortObj)) this.sortConfig = this.sortObj
  },
  methods: {
    updateSort(data) {
      this.sortConfig = {
        orderType: data.val,
        orderBy: this.sortByField.name,
      }
      this.$emit('onSortChange', this.sortConfig)
    },
  },
}
</script>
