import access from './access/index'
import { getTolgee } from './tolgee'

let Utils = {}
Utils.install = function (Vue, options) {
  Object.defineProperties(Vue.prototype, {
    $access: {
      get() {
        return access
      },
    },
    $account: {
      get() {
        return options.account
      },
    },
    $t: {
      get() {
        return getTolgee().t
      },
    },
  })
}

export default Utils
