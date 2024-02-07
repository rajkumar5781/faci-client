<script>
import webtabStore from '../../store/webtabs'
import { getTabInfo } from '@facilio/router'
import router from '../../router'

const webtabStoreObj = webtabStore()

// having this here because pinia will not be initialzed in router file
router.beforeEach(async (to, from, next) => {
  let meta = getTabInfo(to) || {}

  if (meta.groupId) {
    await webtabStoreObj.setTabGroup(meta.groupId)
  } else {
    await webtabStoreObj.setTabGroup(null)
  }

  if (meta.tabId) {
    await webtabStoreObj.setTab(meta.tabId)
  }
  next()
})

export default {
  async beforeRouteEnter(to, from, next) {
    let meta = getTabInfo(to) || {}
    if (meta.groupId) {
      await webtabStoreObj.setTabGroup(meta.groupId)
    } else {
      await webtabStoreObj.setTabGroup(null)
    }
    if (meta.tabId) {
      await webtabStoreObj.setTab(meta.tabId)
    }
    next()
  },
}
</script>
