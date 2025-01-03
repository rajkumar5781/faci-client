<script>
import { isEmpty } from '@facilio/utils/validation'
import { API } from '@facilio/api'
import { ftoast } from '@facilio/design-system'
export default {
  components: {
    ftoast,
  },
  computed: {
    getCatalogName() {
      let { catalogItem = {} } = this
      let { name = '---' } = catalogItem
      return name
    },
    getDescription() {
      let { catalogItem = {} } = this
      let { description } = catalogItem
      return description
    },
    getPhotoUrl() {
      let { catalogItem = {} } = this
      let { photoUrl } = catalogItem
      return photoUrl
    },
  },
  methods: {
    async loadCatalogsData() {
      return API.get(`v2/servicecataloggroup/list`).then(({ data, error }) => {
        if (!error) {
          let { serviceCatalogGroups = [] } = data
          this.catalogGroups = [
            {
              name: 'All',
              id: -1,
            },
            ...serviceCatalogGroups,
          ]

          let { groupId, catalogGroups } = this
          if (!isEmpty(groupId)) {
            let selectedCatalog = catalogGroups.find(
              catalog => catalog.id === groupId
            )
            if (!isEmpty(selectedCatalog)) {
              this.activeCatalog = selectedCatalog
            }
          } else if (!isEmpty(catalogGroups)) {
            this.activeCatalog = catalogGroups[0]
          }
        } else {
          ftoast.critical(error.message)
        }
      })
    },

    loadCatalogsList({ loadMore = false, forceFetch = false } = {}) {
      let { allCatalogsLoaded, activeCatalog, searchText, appId } = this
      let { id: groupId = null } = activeCatalog || {}

      if (forceFetch || !allCatalogsLoaded) {
        if (loadMore) {
          this.page = this.page + 1
        }
        let { page, perPage } = this
        this.$set(this, 'isCatalogLoading', !loadMore)
        this.$set(this, 'loadingMoreCatalogs', loadMore)

        return API.get(`v2/servicecatalog/list`, {
          page,
          perPage,
          groupId: !isEmpty(groupId) ? groupId : null,
          searchString: searchText || null,
          appId,
        })
          .then(({ data, error }) => {
            if (!error) {
              let { serviceCatalogs = [] } = data
              let { filteredCatalogItems } = this
              if (loadMore) {
                let filteredArr = [
                  ...filteredCatalogItems,
                  ...(serviceCatalogs || []),
                ]

                this.filteredCatalogItems = filteredArr
                this.allCatalogsLoaded = serviceCatalogs.length < perPage
              } else {
                this.filteredCatalogItems = serviceCatalogs
              }
              this.loadRoles()
            } else {
              ftoast.critical(error.message)
            }
          })
          .finally(() => {
            this.isCatalogLoading = false
            this.loadingMoreCatalogs = false
          })
      }
    },
    loadRoles() {
      let { appId } = this
      if (appId > 0) {
        API.get(`/setup/roles?appId=${appId}`).then(({ data, error }) => {
          if (error) {
            ftoast.critical(error.message || this.$t('error_occurred'))
          } else {
            let { roles } = data || []
            this.roles = roles
          }
        })
      }
    },
    getModuleFromFormObj(formObj = {}) {
      let { module = {} } = formObj
      let { name } = module
      return name
    },
  },
}
</script>
