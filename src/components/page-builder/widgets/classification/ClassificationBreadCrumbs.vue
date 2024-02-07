<template>
  <FContainer
    text-transform="capitalize"
    alignItems="center"
    height="sectionLarge"
    display="flex"
    cursor="pointer"
  >
    <FContainer
      display="flex"
      v-for="(item, index) in breadCrumbObj"
      :key="index + 'item'"
    >
      <FDropdown
        :options="dropdownBreadcrumb"
        class="dropdown-breadcrumb"
        v-if="item.child"
        @dropdown="getBreadcrumbList"
        trigger="click"
      >
        <FContainer display="flex" alignItems="center">
          <FTooltip placement="bottomEnd">
            <template #title> Show Path</template>
            <FText hover-color="backgroundPrimaryDefault" color="textMain"
              >...</FText
            >
          </FTooltip>
          <FContainer marginLeft="containerMedium" marginRight="containerMedium"
            ><FText hover-color="backgroundPrimaryDefault" color="textMain"
              >/</FText
            ></FContainer
          >
        </FContainer>
      </FDropdown>

      <FContainer
        display="flex"
        alignItems="center"
        color-hover="backgroundPrimaryDefault"
        v-else-if="index === breadCrumbObj.length - 1"
        opacity=".4"
        @click="getBreadcrumbList(item)"
      >
        <FText color="textMain"> {{ item.name }}</FText>
      </FContainer>
      <FContainer
        v-else
        display="flex"
        flexWrap="nowrap"
        alignItems="center"
        @click="getBreadcrumbList(item)"
      >
        <FText hover-color="backgroundPrimaryDefault" color="textMain">{{
          item.name
        }}</FText>
        <FContainer marginLeft="containerMedium" marginRight="containerMedium"
          ><FText hover-color="backgroundPrimaryDefault" color="textMain"
            >/</FText
          ></FContainer
        >
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import { FContainer, FText, FDropdown, FTooltip } from '@facilio/design-system'
import { isEmpty } from '@facilio/utils/validation'
export default {
  name: 'ClassificationBreadCrumbs',
  props: ['breadCrumb'],
  components: { FContainer, FText, FDropdown, FTooltip },
  computed: {
    breadcrumbSize() {
      let size = this.breadCrumb.length
      return size < 4
    },
    dropdownBreadcrumb() {
      let breadcrumb = []

      if (!this.breadcrumbSize)
        breadcrumb = this.breadCrumb.slice(1, this.breadCrumb.length - 2)
      breadcrumb = breadcrumb.map(crumb => {
        let { name, id } = crumb
        return { label: name, value: id }
      })
      return breadcrumb
    },
    breadCrumbObj() {
      let breadCrumbObj = []
      if (!this.breadcrumbSize) {
        breadCrumbObj.push(
          this.breadCrumb[0],
          { child: this.dropdownBreadcrumb },
          ...this.breadCrumb.slice(-2)
        )
      } else {
        breadCrumbObj = this.breadCrumb
      }
      return breadCrumbObj
    },
  },
  methods: {
    getBreadcrumbList(item) {
      let { id, value, name } = item
      let itemId = id || value
      let selectedCrumb = this.breadCrumb.find(crumb => crumb?.id === itemId)
      if (isEmpty(selectedCrumb) && name === 'All classification')
        selectedCrumb = this.breadCrumb[0]
      this.$emit('onGetBreadcrumbList', selectedCrumb)
    },
  },
}
</script>
