<template>
  <FContainer display="flex" height="90%" overflow="auto">
    <FContainer
      display="flex"
      padding="containerLarge"
      maxHeight="100%"
      overflow="auto"
    >
      <FTree
        ref="ftree"
        v-if="!treeLoading"
        :key="renderKey"
        :showIcon="true"
        :treeData="treeData"
        :getChildren="loadNodes"
        :selectedNodeId="selectedNodeId"
        @onSelect="redirectToOverview"
      />
      <FContainer
        v-else
        display="flex"
        flexDirection="column"
        gap="containerMedium"
        width="100%"
        paddingLeft="containerSmall"
      >
        <FContainer display="flex" alignItems="center" gap="containerLarge">
          <FIcon
            name="down-triangle-filled"
            size="12"
            group="navigation"
            color="backgroundMidgroundDark"
            cursor="not-allowed"
            :pressable="false"
          ></FIcon>
          <FShimmer :rounded="false" :height="24" :width="200" />
        </FContainer>
        <FContainer
          paddingLeft="containerXLarge"
          display="flex"
          gap="containerLarge"
          alignItems="center"
          v-for="idx in [1, 2]"
        >
          <FIcon
            name="down-triangle-filled"
            size="12"
            :pressable="false"
            transform="rotate(270deg)"
            color="backgroundMidgroundDark"
            group="navigation"
            cursor="not-allowed"
          ></FIcon>
          <FShimmer :rounded="false" :height="24" :width="188" />
        </FContainer>
      </FContainer>
    </FContainer>
  </FContainer>
</template>
<script>
import {
  FContainer,
  FText,
  FInput,
  FIcon,
  ftoast,
  FButton,
  FShimmer,
} from '@facilio/design-system'
import { API } from '@facilio/api'
import { isEmpty } from '@facilio/utils/validation'
import { FTree } from '@facilio/design-system'
import { eventBus } from '../../../../components/page-builder/event-bus'
export default {
  components: {
    FContainer,
    FText,
    FShimmer,
    FInput,
    FIcon,
    ftoast,
    FTree,
    FButton,
  },
  props: ['site', 'renderKey', 'dataObj'],
  data() {
    return {
      treeData: [],
      treeProps: {},
      childSpaceMap: {},
      treeLoading: true,
      loading: false,
      searchText: null,
      buildings: [],
      selectedNode: null,
      floors: {},
    }
  },
  created() {
    this.initData()
  },
  mounted() {
    eventBus.$on('refresh-tree', this.reloadTree)
  },
  beforeDestroy() {
    eventBus.$off('refresh-tree', this.reloadTree)
  },
  computed: {
    moduleName() {
      let { $route: { params: { moduleName } = {} } = {} } = this || {}
      return moduleName
    },
    id() {
      let { $route: { params: { id } = {} } = {} } = this || {}
      return id
    },
    selectedNodeId() {
      return parseInt(this.id)
    },
  },
  watch: {
    renderKey() {
      this.refreshTree()
    },
  },
  methods: {
    async initData() {
      let { moduleName, id } = this
      this.treeLoading = true
      if (moduleName == 'site') {
        await this.loadFirstLevelChildren()
      } else {
        await this.loadSelectedChildren(id)
      }
      this.treeLoading = false
    },
    async reloadTree() {
      this.treeData = []
      await this.initData()
    },
    refreshTree() {
      let treeData = this.treeData
      let selectedNodes = this.$refs.ftree.selectedNodes
      treeData.map(node => {
        if (node.id == selectedNodes[0]) {
          this.getSelectedChildNode(
            1,
            node.children,
            selectedNodes,
            this.dataObj
          )
        }
      })
      this.treeData = treeData
    },
    getSelectedChildNode(i, node, selectedNodes, dataObj) {
      if (i < selectedNodes.length) {
        if (i == selectedNodes.length - 1) {
          node.map(childNode => {
            if (childNode.id == selectedNodes[i]) {
              if (!childNode.children) {
                childNode.children = []
              }
              childNode.isOpen = true
              childNode.children.push({
                title: dataObj.name,
                id: dataObj.id,
                moduleName: dataObj.moduleName,
                isEnd: false,
                isOpen: false,
                ...this.getSpaceIcon(dataObj.moduleName),
              })
            }
          })
        } else {
          node.map(childNode => {
            if (childNode.id == selectedNodes[i]) {
              this.getSelectedChildNode(
                i + 1,
                childNode.children,
                selectedNodes,
                dataObj
              )
            }
          })
        }
      }
    },
    async loadNodes(treeNode) {
      if (treeNode.children) {
        return false
      } else {
        let { moduleName, id } = treeNode || {}
        if (['Floor', 'Building', 'Space'].includes(moduleName)) {
          await this.loadTreeNodeData(moduleName, id, treeNode)
          return true
        }
      }
    },
    async loadSelectedChildren(id) {
      let { data, error } = await API.get(
        `v2/basespace/tree/fetchParentNodes?baseSpaceId=${id}`,
        null,
        { force: true }
      )
      this.treeData.push({
        title: this.site.name,
        id: this.site.id,
        isLoading: false,
        moduleName: 'site',
        isEnd: false,
        isOpen: true,
        children: [],
        ...this.getSpaceIcon('site'),
      })
      this.treeData[0].children = data?.nodes || []
      this.selectedNode = data.selectedNode
    },
    async loadTreeNodeData(moduleName, key, treeNode) {
      switch (moduleName) {
        case 'Building':
          await this.loadChildrenForBuilding(key, treeNode)
          break
        case 'Floor':
          await this.loadChildrenForFloor(key, treeNode)
          break
        case 'Space':
          await this.loadChildrenForSpace(key, treeNode)
          break
      }
    },
    async loadChildrenForBuilding(id, treeNode) {
      this.loading = true
      let { data, error } = await API.get(
        `v2/basespace/getBaseSpaceChildren?baseSpaceId=${id}`,
        null,
        { force: true }
      )
      if (error) {
        ftoast.critical(
          error?.message ||
            `Error occured while fetching base space for site ${id}`
        )
        this.loading = false
      } else {
        let { basespaces } = data || {}
        if (isEmpty(basespaces)) {
          this.loading = false
        } else {
          treeNode.children = []
          let { treeData } = this || {}
          basespaces.forEach(space => {
            this.treeProps[space.id] = 'floor'
            treeNode.children.push({
              title: space.name,
              id: space.id,
              moduleName: space.spaceTypeVal,
              isEnd: false,
              isOpen: false,
              ...this.getSpaceIcon(space.spaceTypeVal),
            })
          })
          this.loading = false
        }
      }
    },
    async loadChildrenForFloor(id, treeNode) {
      let filter = this.getFloorSpacesFilter(id)
      let { data, error } = await API.get(
        `/v3/pickList/modules/space?filters=${filter}&viewName=hidden-all&perPage=1000`,
        null,
        { force: true }
      )
      if (error) {
        ftoast.critical(
          error?.message ||
            `Error occured while fetching spaces for floor ${id}`
        )
      } else {
        let { pickList = {} } = data
        if (!isEmpty(pickList)) {
          treeNode.children = []
          pickList.forEach(record => {
            this.treeProps[record.value] = 'space'
            treeNode.children.push({
              title: record.label,
              id: record.value,
              moduleName: 'Space',
              isEnd: false,
              isOpen: false,
              ...this.getSpaceIcon('space'),
            })
          })
        }
      }
    },
    async loadChildrenForSpace(id, treeNode) {
      let filter = this.getSubSpaceFilter(id)
      let { data, error } = await API.get(
        `/v3/pickList/modules/space?filters=${filter}&viewName=hidden-all&perPage=1000`,
        null,
        { force: true }
      )
      if (error) {
        ftoast.critical(
          error?.message ||
            `Error occured while fetching spaces for floor ${id}`
        )
      } else {
        let { pickList = {} } = data
        if (!isEmpty(pickList)) {
          treeNode.children = []
          pickList.forEach(record => {
            this.treeProps[record.value] = 'space'
            treeNode.children.push({
              title: record.label,
              id: record.value,
              moduleName: 'Space',
              isEnd: false,
              isOpen: false,
              ...this.getSpaceIcon('space'),
            })
          })
        }
      }
    },
    async redirectToSiteOverview() {
      this.$emit('redirect', this.site.id, 'site')
    },
    async redirectToOverview(treeNode) {
      this.$emit('redirect', treeNode.id, treeNode.moduleName)
    },
    getFloorSpacesFilter(id) {
      let filter = {}
      filter = {
        floor: {
          operatorId: 36,
          value: [id.toString()],
        },
        space1: {
          operatorId: 1,
          value: null,
        },
        space2: {
          operatorId: 1,
          value: null,
        },
        space3: {
          operatorId: 1,
          value: null,
        },
        space4: {
          operatorId: 1,
          value: null,
        },
        space5: {
          operatorId: 1,
          value: null,
        },
        spaceType: {
          operatorId: 9,
          value: ['4'],
        },
      }
      let uriFilter = encodeURIComponent(JSON.stringify(filter))
      return uriFilter
    },
    getSubSpaceFilter(id) {
      let filter = {}
      filter = {
        space1: {
          operatorId: 36,
          value: [id.toString()],
        },
        space2: {
          operatorId: 1,
          value: null,
        },
        space3: {
          operatorId: 1,
          value: null,
        },
        space4: {
          operatorId: 1,
          value: null,
        },
        space5: {
          operatorId: 1,
          value: null,
        },
        spaceType: {
          operatorId: 9,
          value: ['4'],
        },
      }
      let uriFilter = encodeURIComponent(JSON.stringify(filter))
      return uriFilter
    },
    async loadFirstLevelChildren() {
      this.loading = true
      let { data, error } = await API.get(
        `v2/basespace/getBaseSpaceChildren?baseSpaceId=${this.site.id}`,
        null,
        { force: true }
      )
      if (error) {
        ftoast.critical(
          error?.message ||
            `Error occured while fetching base space for site ${id}`
        )
        this.loading = false
      } else {
        this.treeProps[this.site.id] = 'site'
        this.treeData.push({
          title: this.site.name,
          id: this.site.id,
          isLoading: false,
          moduleName: 'site',
          isEnd: false,
          isOpen: true,
          children: [],
          ...this.getSpaceIcon('site'),
        })
        let { basespaces } = data || {}
        if (isEmpty(basespaces)) {
          this.loading = false
        } else {
          let { treeData } = this || {}
          basespaces.forEach(space => {
            if (isEmpty(this.site)) {
              this.site = space.site
            }
            this.treeProps[space.id] = space.spaceTypeVal
            treeData[0].children.push({
              title: space.name,
              id: space.id,
              isLoading: false,
              moduleName: space.spaceTypeVal,
              isEnd: false,
              isOpen: false,
              ...this.getSpaceIcon(space.spaceTypeVal),
            })
          })
          this.treeData = treeData
          this.loading = false
        }
      }
    },
    getSpaceIcon(spaceType) {
      if (spaceType) {
        if (spaceType.toLowerCase() == 'site') {
          return {
            icongroup: 'default',
            iconname: 'site',
          }
        } else if (spaceType.toLowerCase() == 'building') {
          return {
            icongroup: 'portfolio',
            iconname: 'building',
          }
        } else if (spaceType.toLowerCase() == 'floor') {
          return {
            icongroup: 'default',
            iconname: 'floorstack',
          }
        } else {
          return {
            icongroup: 'default',
            iconname: 'workspace',
          }
        }
        return {}
      }
    },
  },
}
</script>
