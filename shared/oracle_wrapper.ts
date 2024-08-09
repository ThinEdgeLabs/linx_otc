import {
  CallContractResult,
  DeployContractResult,
  MINIMAL_CONTRACT_DEPOSIT,
  SignerProvider,
  ZERO_ADDRESS
} from '@alephium/web3'
import { OracleWrapper, OracleWrapperInstance } from '../artifacts/ts'
import { PairInfo } from '../artifacts/ts/types'

export class OracleHelper {
  public contractId: string | undefined
  signer: SignerProvider

  constructor(signer: SignerProvider) {
    this.signer = signer
  }

  async deploy(
    diaOracleContractId: string,
    signer: SignerProvider = this.signer
  ): Promise<DeployContractResult<OracleWrapperInstance>> {
    const owner = (await signer.getSelectedAccount()).address
    return OracleWrapper.deploy(signer, {
      initialFields: {
        oracleContractId: diaOracleContractId,
        upgradeDelay: 604800000n, // 1 week
        owner: owner,
        newOwner: ZERO_ADDRESS,
        upgradeInitiated: 0n,
        newCode: '',
        newImmFieldsEncoded: '',
        newMutFieldsEncoded: ''
      }
    })
  }

  async addPair(address: string, tokenId: string, pairInfo: PairInfo, caller: SignerProvider = this.signer) {
    return OracleWrapper.at(address).transact.addPair({
      args: { tokenId, pairInfo },
      signer: caller,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
    })
  }

  async getPair(address: string, tokenId: string): Promise<CallContractResult<PairInfo>> {
    return OracleWrapper.at(address).view.getPairInfo({
      args: { tokenId }
    })
  }

  async getTokenPrice(address: string, tokenId: string): Promise<CallContractResult<[bigint, bigint, bigint]>> {
    return OracleWrapper.at(address).view.getTokenPrice({
      args: { tokenId }
    })
  }
}
