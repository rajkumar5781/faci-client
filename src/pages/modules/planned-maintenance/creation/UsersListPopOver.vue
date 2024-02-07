<template>
  <FContainer
    height="250px"
    width="300px"
    display="flex"
    flexDirection="column"
  >
    <FContainer margin="containerLarge containerXLarge">
      <!-- <MainFieldSearch
        :search.sync="searchText"
        :disabled="isEmpty(searchText)"
        @onSearch="changeInput"
      /> -->
      <FInput
        @change="debounceEmitSearch"
        v-model="searchText"
        appearance="default"
        :placeholder="placeholder"
        size="large"
        :clearable="true"
        wrap
        :autofocus="false"
      />
    </FContainer>
    <FDivider width="100" />

    <FContainer
      v-if="isLoading"
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
    >
      <FSpinner :size="24"></FSpinner>
    </FContainer>

    <FDropdownMenu
      v-else
      :menuList="menuListItems"
      selectType=""
      :selectedValue="selectedValue"
      padding="containerXLarge"
      overflow="scroll"
      @change="onDropDownSelectedValueChange"
    >
      <FMenuItem
        v-for="item in menuListItems"
        :value="item.value"
        :key="item.value"
        width="100%"
      >
        <FText
          padding="containerLarge"
          color="textMain"
          appearance="bodyRegSt14"
        >
          {{ item.label }}
        </FText>
      </FMenuItem>
    </FDropdownMenu>
  </FContainer>
</template>

<script>
import {
  FContainer,
  FDropdownMenu,
  FMenuItem,
  FText,
  FInput,
  FDivider,
  FSpinner,
} from '@facilio/design-system'
import debounce from 'lodash/debounce'

// import { MainFieldSearch } from '../creation/MainFieldSearch.vue'

export default {
  name: 'UsersListPopOver',
  components: {
    FContainer,
    FDropdownMenu,
    FMenuItem,
    FText,
    FInput,
    FDivider,
    FSpinner,
  },
  props: {
    data: {
      /* 
        [
            {
                id: 12,
                name: "For Label"
            }
        ]
      */
      type: Array,
    },
    menuListItems: {
      /*[ 
            {
                label: 'Label-1', 
                value: '1'
            },
            {
                label: 'Lab',
                value: '3',
                iconGroup: 'communication',
                iconName: 'mail',
            }
        ]*/
      type: Array,
    },
    selectedValue: {
      type: Object,
      default: null,
    },
    debounceTime: {
      type: Number,
      default: 500,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    this.debounceEmitSearch = debounce(this.emitSearchText, this.debounceTS)
  },
  data() {
    return {
      searchText: '',
      placeholder: 'Search here',
      debounceTS: this.debounceTime || 500,
    }
  },
  methods: {
    emitSearchText() {
      console.log(this.searchText)
      this.$emit('onSearch', this.searchText)
    },
    onDropDownSelectedValueChange(value) {
      this.$emit('onDropDownSelectedValueChange', value)
    },
  },
}
</script>
