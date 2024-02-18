import { ALPH_TOKEN_ID, DUST_AMOUNT, DeployContractResult, ExecuteScriptResult, ONE_ALPH, SignerProvider, ZERO_ADDRESS, web3 } from '@alephium/web3'
import { DeployHelpers } from './deploy-helpers'
import { CancelOffer, CreateOffer, GetToken, LendingMarketplace, LendingMarketplaceInstance, LendingOffer, LendingOfferInstance, TakeOffer, TestToken } from '../artifacts/ts'
import { randomContractAddress, randomContractId, testPrivateKey } from '@alephium/web3-test'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

export class LendingMarketplaceHelper extends DeployHelpers {
  public contractId: string | undefined

  async create(signer: SignerProvider = this.signer): Promise<DeployContractResult<LendingMarketplaceInstance>> {
    const lendingOfferDeployTx = await LendingOffer.deploy(signer, {
      initialFields: {
        lender: ZERO_ADDRESS,
        lendingTokenId: randomContractId(),
        collateralTokenId: randomContractId(),
        lendingAmount: 0n,
        collateralAmount: 0n,
        interestRate: 0n,
        duration: 0n,
        borrower: ZERO_ADDRESS
      }
    })

    const adminAddress = (await this.signer.getSelectedAccount()).address

    const lendingMarketplaceDeployResult = await LendingMarketplace.deploy(this.signer, {
      initialFields: {
        lendingOfferTemplateId: lendingOfferDeployTx.contractInstance.contractId,
        admin: adminAddress,
        totalLendingOffers: 0n,
        fee: 100n
      }
    })

    this.contractId = lendingMarketplaceDeployResult.contractInstance.contractId
    return lendingMarketplaceDeployResult
  }

  async createOffer(
    signer: SignerProvider,
    lendingTokenId: string,
    collateralTokenId: string,
    lendingAmount: bigint,
    collateralAmount: bigint,
    interestRate: bigint,
    duration: bigint,
  ): Promise<ExecuteScriptResult> {
    return CreateOffer.execute(signer, {
      initialFields: {
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        lendingMarketplace: this.contractId!
      },
      attoAlphAmount: ONE_ALPH + DUST_AMOUNT,
      tokens: [
        {
          id: lendingTokenId,
          amount: lendingAmount
        }
      ]
    })
  }

  async cancelOffer(signer: SignerProvider, offerId: string): Promise<ExecuteScriptResult> {
    return CancelOffer.execute(signer, {
      initialFields: {
        offer: offerId
      },
    })
  }

  async takeOffer(signer: SignerProvider, offerId: string, collateralTokenId: string, collateralAmount: bigint): Promise<ExecuteScriptResult> {
    return TakeOffer.execute(signer, {
      initialFields: {
        offer: offerId,
      },
      tokens: [
        {
          id: collateralTokenId,
          amount: collateralAmount + DUST_AMOUNT
        }
      ]
    })
  }
}
