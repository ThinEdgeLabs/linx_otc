/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  ExecutableScript,
  ExecuteScriptParams,
  ExecuteScriptResult,
  Script,
  SignerProvider,
  HexString,
} from "@alephium/web3";
import { default as BorrowScriptJson } from "../scripts/Borrow.ral.json";
import { default as CancelOfferScriptJson } from "../scripts/CancelOffer.ral.json";
import { default as CreateOfferScriptJson } from "../scripts/CreateOffer.ral.json";
import { default as GetTokenScriptJson } from "../test/GetToken.ral.json";
import { default as LiquidateLoanScriptJson } from "../scripts/LiquidateLoan.ral.json";
import { default as RepayLoanScriptJson } from "../scripts/RepayLoan.ral.json";

export const Borrow = new ExecutableScript<{
  offerId: HexString;
  lendingMarketplace: HexString;
}>(Script.fromJson(BorrowScriptJson, ""));

export const CancelOffer = new ExecutableScript<{
  marketplace: HexString;
  offerId: HexString;
}>(Script.fromJson(CancelOfferScriptJson, ""));

export const CreateOffer = new ExecutableScript<{
  lendingTokenId: HexString;
  collateralTokenId: HexString;
  lendingAmount: bigint;
  collateralAmount: bigint;
  interestRate: bigint;
  duration: bigint;
  lendingMarketplace: HexString;
}>(Script.fromJson(CreateOfferScriptJson, ""));

export const GetToken = new ExecutableScript<{
  token: HexString;
  sender: Address;
  amount: bigint;
}>(Script.fromJson(GetTokenScriptJson, ""));

export const LiquidateLoan = new ExecutableScript<{
  marketplace: HexString;
  loanId: HexString;
}>(Script.fromJson(LiquidateLoanScriptJson, ""));

export const RepayLoan = new ExecutableScript<{
  marketplace: HexString;
  loanId: HexString;
  borrowedTokenId: HexString;
  repayAmount: bigint;
}>(Script.fromJson(RepayLoanScriptJson, ""));
