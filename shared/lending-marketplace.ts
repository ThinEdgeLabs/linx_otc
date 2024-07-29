import {
  ALPH_TOKEN_ID,
  DUST_AMOUNT,
  DeployContractResult,
  ExecuteScriptResult,
  MINIMAL_CONTRACT_DEPOSIT,
  SignerProvider,
  ZERO_ADDRESS
} from '@alephium/web3'
import {
  CancelLoan,
  CreateLoan,
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

    const owner = (await this.signer.getSelectedAccount()).address

    const lendingMarketplaceDeployResult = await LendingMarketplace.deploy(this.signer, {
      initialFields: {
        loanTemplateId: lendingOfferDeployTx.contractInstance.contractId,
        totalLoans: 0n,
        feeRate: 100n,
        lendingEnabled: true,
        upgradeDelay: 604800000n, // 1 week
        owner: owner,
        newOwner: ZERO_ADDRESS,
        upgradeInitiated: 0n,
        newCode: '',
        newImmFieldsEncoded: '',
        newMutFieldsEncoded: ''
      }
    })

    this.contractId = lendingMarketplaceDeployResult.contractInstance.contractId
    return lendingMarketplaceDeployResult
  }

  async createLoan(
    signer: SignerProvider,
    lendingTokenId: string,
    collateralTokenId: string,
    lendingAmount: bigint,
    collateralAmount: bigint,
    interestRate: bigint,
    duration: bigint
  ): Promise<ExecuteScriptResult> {
    return CreateLoan.execute(signer, {
      initialFields: {
        lendingTokenId,
        collateralTokenId,
        lendingAmount,
        collateralAmount,
        interestRate,
        duration,
        marketplace: this.contractId!
      },
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
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
    loanId: string,
    collateralTokenId: string,
    collateralAmount: bigint
  ): Promise<ExecuteScriptResult> {
    if (collateralTokenId === ALPH_TOKEN_ID) {
      return Borrow.execute(signer, {
        initialFields: {
          loanId,
          lendingMarketplace: this.contractId!
        },
        attoAlphAmount: collateralAmount + DUST_AMOUNT
      })
    }

    return Borrow.execute(signer, {
      initialFields: {
        loanId,
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
