<template>
  <component :is="pageVersion" v-bind="$attrs" v-on="$listeners"> </component>
</template>
<script>
export default {
  components: {
    pageV1: () => import('./PageBuilderV1.vue'),
    pageV2: () => import('../../pages/summary/page-builder/PageBuilderV2.vue'),
  },
  computed: {
    pageVersion() {
      let isNew = window.localStorage.getItem('newPage')
      return JSON.parse(isNew) === true ? 'pageV2' : 'pageV1'
    },
  },
}
</script>
