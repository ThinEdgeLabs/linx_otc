import { DUST_AMOUNT, DeployContractResult, ExecuteScriptResult, ONE_ALPH, SignerProvider, ZERO_ADDRESS  } from '@alephium/web3'
import { DeployHelpers } from './deploy-helpers'
import { CancelOffer, CreateOffer, LendingMarketplace, LendingMarketplaceInstance, LendingOffer, Borrow, RepayLoan, LiquidateLoan} from '../artifacts/ts'
import { randomContractId } from './utils'

export class LendingMarketplaceHelper extends DeployHelpers {
  public contractId: string | undefined

  async create(signer: SignerProvider = this.signer): Promise<DeployContractResult<LendingMarketplaceInstance>> {
    const lendingOfferDeployTx = await LendingOffer.deploy(signer, {
      initialFields: {
        id: 0n,
        lender: ZERO_ADDRESS,
        lendingTokenId: randomContractId(),
        collateralTokenId: randomContractId(),
        marketplaceContractId: ZERO_ADDRESS,
        lendingAmount: 0n,
        collateralAmount: 0n,
        interestRate: 0n,
        duration: 0n,
        borrower: ZERO_ADDRESS,
        loanTimeStamp: 0n,
      }
    })

    const adminAddress = (await this.signer.getSelectedAccount()).address

    const lendingMarketplaceDeployResult = await LendingMarketplace.deploy(this.signer, {
      initialFields: {
        lendingOfferTemplateId: lendingOfferDeployTx.contractInstance.contractId,
        admin: adminAddress,
        totalLendingOffers: 0n,
        fee: 100n,
        lendingEnabled: true
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
        marketplace: this.contractId!,
        offerId
      },
    })
  }

  async takeOffer(signer: SignerProvider, offerId: string, collateralTokenId: string, collateralAmount: bigint): Promise<ExecuteScriptResult> {
    return Borrow.execute(signer, {
      initialFields: {
        offerId,
        lendingMarketplace: this.contractId!
      },
      tokens: [
        {
          id: collateralTokenId,
          amount: collateralAmount
        }
      ]
    })
  }

  async repayLoan(signer: SignerProvider, loanId: string, borrowedTokenId: string, amount: bigint): Promise<ExecuteScriptResult> {
    return RepayLoan.execute(signer, {
      initialFields: {
        loanId,
        marketplace: this.contractId!,
        borrowedTokenId,
        amount
      },
      attoAlphAmount: DUST_AMOUNT,
      tokens: [
        {
          id: borrowedTokenId,
          amount
        },
      ]
    })
  }

  async liquidateLoan(signer: SignerProvider, loanId: string): Promise<ExecuteScriptResult> {
    return LiquidateLoan.execute(signer, {
      initialFields: {
        loanId,
        marketplace: this.contractId!,
      },
    })
  }
}
