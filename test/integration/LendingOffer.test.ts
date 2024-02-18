import { ALPH_TOKEN_ID, NodeProvider, ONE_ALPH, Project, SignerProvider, addressFromContractId, contractIdFromAddress, contractIdFromTx, web3 } from "@alephium/web3"
import { getSigners, testNodeWallet } from "@alephium/web3-test"
import { LendingMarketplaceHelper } from "../../shared/lending-marketplace"
import { balanceOf, deployTestToken, expandTo18Decimals, getToken } from "../../shared/utils"
import { GetToken, LendingMarketplaceInstance, LendingOffer, LendingOfferInstance } from "../../artifacts/ts"
import { waitTxConfirmed } from "@alephium/cli"
import { PrivateKeyWallet } from "@alephium/web3-wallet"


describe('LendingOffer', () => {
  let provider: NodeProvider
  let marketplace: LendingMarketplaceHelper
  let admin: PrivateKeyWallet
  let lender: PrivateKeyWallet
  let borrower: PrivateKeyWallet
  let lendingTokenId: string
  const startingAlphBalance  = 1000n

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    await Project.build()
    provider = web3.getCurrentNodeProvider();
    [admin, lender] = await getSigners(3, ONE_ALPH * startingAlphBalance, 0);
    [borrower] = await getSigners(1, ONE_ALPH * 3000n, 0)
    marketplace = new LendingMarketplaceHelper(admin)
    await marketplace.buildProject()
    await marketplace.create()
    lendingTokenId = await deployTestToken(admin)
  })

  describe('cancel offer', () => {
    const lendingAmount = expandTo18Decimals(1000n)
    const collateralAmount = expandTo18Decimals(2000n)
    const interestRate = 100n
    const duration = 30n

    beforeEach(async () => {
      await getToken(lender, lendingTokenId, expandTo18Decimals(1000n))
    })

    it('should cancel a lending offer', async () => {
      expect(marketplace.contractId).toBeDefined()
      console.log('LendingMarketplace contractId:', marketplace.contractId)

      const { txId } = await marketplace.createOffer(lender, lendingTokenId, ALPH_TOKEN_ID, lendingAmount, collateralAmount, interestRate, duration)
      await waitTxConfirmed(provider, txId, 1, 1000)

      expect(await balanceOf(lendingTokenId, lender.address)).toEqual(0n)

      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address

      await marketplace.cancelOffer(lender, lendingOfferAddress)

      expect(await balanceOf(lendingTokenId, lender.address)).toBeGreaterThan(0n)
      await expect(new LendingOfferInstance(lendingOfferAddress).fetchState()).rejects.toThrow(Error)
    })

    it('should not cancel a lending offer if not the lender', async () => {
      const { txId } = await marketplace.createOffer(lender, lendingTokenId, ALPH_TOKEN_ID, lendingAmount, collateralAmount, interestRate, duration)
      await waitTxConfirmed(provider, txId, 1, 1000)
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address
      await expect(marketplace.cancelOffer(borrower, lendingOfferAddress)).rejects.toThrow(Error)
    })
    it('should not cancel a lending offer if it\'s already taken', async () => {
      const { txId } = await marketplace.createOffer(lender, lendingTokenId, ALPH_TOKEN_ID, lendingAmount, collateralAmount, interestRate, duration)
      await waitTxConfirmed(provider, txId, 1, 1000)
      const txDetails = await provider.transactions.getTransactionsDetailsTxid(txId)
      const lendingOfferAddress = txDetails.generatedOutputs[0].address
      await marketplace.takeOffer(borrower, lendingOfferAddress, ALPH_TOKEN_ID, collateralAmount)
      await expect(marketplace.cancelOffer(lender, lendingOfferAddress)).rejects.toThrow(Error)
    })
  })
})