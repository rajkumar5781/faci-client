<template>
  <div>
    <Input
      v-if="showMainFieldSearch"
      v-model="searchText"
      ref="mainFieldSearchInput"
      clearable
      class="fc-input-full-border2 width-auto mL-auto"
      @blur="hideMainFieldSearch"
      @clear="hideMainFieldSearch"
      @change="debounceEmitSearch"
      placeholder="Search"
    ></Input>
    <div v-else @click="openSearch" class="f-wizard-mainfield-search">
      <fc-icon
        group="default"
        name="search"
        color="#6c6a91"
        size="20"
      ></fc-icon>
    </div>
    <slot></slot>
  </div>
</template>
<script>
import { isEmpty } from '@facilio/utils/validation'
import debounce from 'lodash/debounce'
import { Input } from 'element-ui'
import { defineCustomElements as fcIcon } from '@facilio/icons/dist/loader'
fcIcon(window)
export default {
  props: ['mainFieldObj', 'debounceTime', 'search'],
  components: { Input },
  watch: {
    search(newVal) {
      if (newVal === '') {
        this.searchText = null
        this.showMainFieldSearch = false
      }
    },
  },
  data() {
    return {
      showMainFieldSearch: false,
      searchText: null,
      debounceTS: this.debounceTime || 500,
    }
  },
  created() {
    if (!isEmpty(this.search)) this.searchText = this.search
    this.debounceEmitSearch = debounce(this.emitSearchText, this.debounceTS)
  },
  computed: {
    canShowMainFieldSearch() {
      let { dataTypeEnum } = this.mainFieldObj || {}
      return dataTypeEnum === 'STRING'
    },
  },
  methods: {
    openSearch() {
      this.showMainFieldSearch = true
      this.$nextTick(() => {
        let searchBox = this.$refs['mainFieldSearchInput']
        !isEmpty(searchBox) && searchBox.focus()
      })
    },
    hideMainFieldSearch() {
      if (isEmpty(this.searchText)) this.showMainFieldSearch = false
    },
    emitSearchText() {
      this.$emit('update:search', this.searchText)
      this.$emit('onSearch', this.searchText)
    },
    clearSearch() {
      this.debounceEmitSearch()
      this.hideMainFieldSearch()
    },
  },
}
</script>

<style lang="scss">
.f-wizard-mainfield-search {
  height: 16px !important;
  box-sizing: content-box;
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  border: 1px solid transparent;
  &:hover {
    color: #615e88;
    background: #f5f6f8;
    border-color: #dae0e8;
  }
}
</style>
