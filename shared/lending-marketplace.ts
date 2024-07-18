import {
  DUST_AMOUNT,
  DeployContractResult,
  ExecuteScriptResult,
  MINIMAL_CONTRACT_DEPOSIT,
  ONE_ALPH,
  SignerProvider,
  ZERO_ADDRESS
} from '@alephium/web3'
import {
  CancelLoan,
  CreateOffer,
  LendingMarketplace,
  LendingMarketplaceInstance,
  Loan,
  Borrow,
  RepayLoan,
  LiquidateLoan,
  AddFeeToken,
  RemoveFeeToken
} from '../artifacts/ts'
import { randomContractId } from './utils'

export class LendingMarketplaceHelper {
  public contractId: string | undefined
  signer: SignerProvider

  constructor(signer: SignerProvider) {
    this.signer = signer
  }

  async create(signer: SignerProvider = this.signer): Promise<DeployContractResult<LendingMarketplaceInstance>> {
    const lendingOfferDeployTx = await Loan.deploy(signer, {
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
        loanTimeStamp: 0n
      }
    })

    const adminAddress = (await this.signer.getSelectedAccount()).address

    const lendingMarketplaceDeployResult = await LendingMarketplace.deploy(this.signer, {
      initialFields: {
        loanTemplateId: lendingOfferDeployTx.contractInstance.contractId,
        admin: adminAddress,
        totalLoans: 0n,
        feeRate: 100n,
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
    duration: bigint
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

  async cancelLoan(signer: SignerProvider, loanId: string): Promise<ExecuteScriptResult> {
    return CancelLoan.execute(signer, {
      initialFields: {
        marketplace: this.contractId!,
        loanId
      }
    })
  }

  async borrow(
    signer: SignerProvider,
    offerId: string,
    collateralTokenId: string,
    collateralAmount: bigint
  ): Promise<ExecuteScriptResult> {
    return Borrow.execute(signer, {
      initialFields: {
        offerId,
        lendingMarketplace: this.contractId!
      },
      attoAlphAmount: DUST_AMOUNT,
      tokens: [
        {
          id: collateralTokenId,
          amount: collateralAmount
        }
      ]
    })
  }

  async repayLoan(
    signer: SignerProvider,
    loanId: string,
    borrowedTokenId: string,
    amount: bigint
  ): Promise<ExecuteScriptResult> {
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
        }
      ]
    })
  }

  async liquidateLoan(signer: SignerProvider, loanId: string): Promise<ExecuteScriptResult> {
    return LiquidateLoan.execute(signer, {
      initialFields: {
        loanId,
        marketplace: this.contractId!
      },
      attoAlphAmount: DUST_AMOUNT
    })
  }

  async addFeeToken(signer: SignerProvider, tokenId: string): Promise<ExecuteScriptResult> {
    return AddFeeToken.execute(signer, {
      initialFields: {
        marketplace: this.contractId!,
        tokenId
      },
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT
    })
  }

  async removeFeeToken(signer: SignerProvider, tokenId: string): Promise<ExecuteScriptResult> {
    return RemoveFeeToken.execute(signer, {
      initialFields: {
        marketplace: this.contractId!,
        tokenId
      }
    })
  }
}
