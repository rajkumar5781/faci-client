import { initPendo } from './pendo'
import { initDataDog } from './datadog'

export const initializeTrackers = (account, instance) => {
  initPendo(account, instance)
  initDataDog(account, instance)
}
