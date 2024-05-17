import { getMarketplaceConfig } from '@/config'
import { useAccountStore } from '@/stores'
import { useNodeStore } from '@/stores/node'
import { usePopUpStore } from '@/stores/popup'

export async function useValidateGroup() {
  const marketPlaceGroup = getMarketplaceConfig().groupIndex
  const accountStore = useAccountStore()
  const popUpStore = usePopUpStore()

  const addressGroup = await useNodeStore().getGroupForAddress(accountStore.account!.address)
  if (addressGroup.group !== marketPlaceGroup) {
    popUpStore.setPopUp({
      title: 'Invalid account group',
      onAcknowledged: () => {
        popUpStore.closePopUp()
        const store = useAccountStore()
        store.reconnect()
      },
      leftButtonTitle: 'Switch account',
      message: [
        `Your account's group does not match the marketplace's group. Please switch to an account in group ${marketPlaceGroup} to proceed.`
      ],
      showTerms: false,
      showIcon: true,
      type: 'warning'
    })
    return false
  }
  return true
}
