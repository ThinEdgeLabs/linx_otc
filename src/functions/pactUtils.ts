import type { ChainId } from '@kadena/types'
import { KadenaNetworkId } from '@/types/network'
import type { Account, PactValueWithObject } from '@/types/kadena'
import { Pact as PactClient, createClient } from '@kadena/client'
import Pact from 'pact-lang-api'

const CHAINWEB_NODE = import.meta.env.VITE_CHAINWEB_NODE
const NETWORK_TYPE: 'mainnet' | 'testnet' | 'development' = import.meta.env.VITE_NETWORK_TYPE
const NETWORK_ID = KadenaNetworkId[NETWORK_TYPE]

const creationTime = () => Math.round(new Date().getTime() / 1000)

export const hostAddressGenerator = (options: { chainId: ChainId; networkId: string }) =>
  `${CHAINWEB_NODE}/chainweb/0.0/${options.networkId}/chain/${options.chainId}/pact`

export async function getLocalData(pactCommand: string, data?: Object) {
  const chainId = '18'
  const res = await Pact.fetch.local(
    quickLocalCommand(chainId, pactCommand, data),
    hostAddressGenerator({ chainId, networkId: NETWORK_ID })
  )
  if (res.result.status === 'success') {
    return res.result.data
  } else {
    return []
  }
}

const quickLocalCommand = (chainId: string, pactCode: string, data?: object) => {
  return {
    networkId: 'fast-development',
    keyPairs: Pact.crypto.genKeyPair(),
    pactCode: pactCode,
    envData: data || {},
    meta: {
      creationTime: creationTime(),
      ttl: 28000,
      gasLimit: 80000,
      chainId,
      gasPrice: 0.0000001,
      sender: 'RedLinx'
    }
  }
}

export async function getKeyset(
  module: string,
  account: Account,
  chainId: ChainId
): Promise<{ pred: string; keys: string[] }> {
  const { dirtyRead } = createClient(hostAddressGenerator({ chainId, networkId: NETWORK_ID }))
  const tx = PactClient.builder
    .execution(`(try "NOT_FOUND" (at 'guard (${module}.details "${account}")))`)
    .setMeta({ chainId, gasLimit: 1500000 })
    .createTransaction()
  const res = await dirtyRead(tx)

  if (res.result.status === 'success') {
    if (res.result.data === 'NOT_FOUND') {
      return { pred: 'keys-all', keys: [account.slice(2)] }
    } else if (typeof res.result.data === 'object') {
      return res.result.data as PactValueWithObject as { pred: string; keys: string[] }
    } else {
      throw Error(`Error getting keyset: unexpected result ${JSON.stringify(res.result.data)}`)
    }
  } else {
    throw Error(`Error getting keyset: ${JSON.stringify(res.result.error)}`)
  }
}
