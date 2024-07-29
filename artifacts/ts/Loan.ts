/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Contract,
  ContractState,
  TestContractResult,
  HexString,
  ContractFactory,
  EventSubscribeOptions,
  EventSubscription,
  CallContractParams,
  CallContractResult,
  TestContractParams,
  ContractEvent,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
  callMethod,
  multicallMethods,
  fetchContractState,
  ContractInstance,
  getContractEventsCurrentCount,
  TestContractParamsWithoutMaps,
  TestContractResultWithoutMaps,
  SignExecuteContractMethodParams,
  SignExecuteScriptTxResult,
  signExecuteMethod,
  addStdIdToFields,
  encodeContractFields,
} from "@alephium/web3";
import { default as LoanContractJson } from "../Loan.ral.json";
import { getContractByCodeHash } from "./contracts";

// Custom types for the contract
export namespace LoanTypes {
  export type Fields = {
    id: bigint;
    lender: Address;
    lendingTokenId: HexString;
    collateralTokenId: HexString;
    marketplaceContractId: HexString;
    lendingAmount: bigint;
    collateralAmount: bigint;
    interestRate: bigint;
    duration: bigint;
    borrower: Address;
    loanTimeStamp: bigint;
  };

  export type State = ContractState<Fields>;

  export interface CallMethodTable {
    blockTimeStampInSeconds: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    calculateInterestPayment: {
      params: CallContractParams<{
        currentBlockTimeStamp: bigint;
        loanTimestamp: bigint;
        amount: bigint;
        interest: bigint;
        days: bigint;
      }>;
      result: CallContractResult<bigint>;
    };
    calculateTotalInterestPayment: {
      params: CallContractParams<{
        amount: bigint;
        interest: bigint;
        days: bigint;
      }>;
      result: CallContractResult<bigint>;
    };
    calculateMarketplaceFee: {
      params: CallContractParams<{ amount: bigint; feeRateValue: bigint }>;
      result: CallContractResult<bigint>;
    };
    getId: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getLender: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<Address>;
    };
    getLendingTokenId: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getCollateralTokenId: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getLendingAmount: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getCollateralAmount: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getInterestRate: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getInterest: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getDuration: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getBorrower: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<Address>;
    };
    getLoanTimeStamp: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    borrow: {
      params: CallContractParams<{ caller: Address }>;
      result: CallContractResult<null>;
    };
    cancel: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<null>;
    };
    repay: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<null>;
    };
    liquidate: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<null>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };

  export interface SignExecuteMethodTable {
    blockTimeStampInSeconds: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    calculateInterestPayment: {
      params: SignExecuteContractMethodParams<{
        currentBlockTimeStamp: bigint;
        loanTimestamp: bigint;
        amount: bigint;
        interest: bigint;
        days: bigint;
      }>;
      result: SignExecuteScriptTxResult;
    };
    calculateTotalInterestPayment: {
      params: SignExecuteContractMethodParams<{
        amount: bigint;
        interest: bigint;
        days: bigint;
      }>;
      result: SignExecuteScriptTxResult;
    };
    calculateMarketplaceFee: {
      params: SignExecuteContractMethodParams<{
        amount: bigint;
        feeRateValue: bigint;
      }>;
      result: SignExecuteScriptTxResult;
    };
    getId: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getLender: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getLendingTokenId: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getCollateralTokenId: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getLendingAmount: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getCollateralAmount: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getInterestRate: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getInterest: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getDuration: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getBorrower: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getLoanTimeStamp: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    borrow: {
      params: SignExecuteContractMethodParams<{ caller: Address }>;
      result: SignExecuteScriptTxResult;
    };
    cancel: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    repay: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    liquidate: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<LoanInstance, LoanTypes.Fields> {
  encodeFields(fields: LoanTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      []
    );
  }

  getInitialFieldsWithDefaultValues() {
    return this.contract.getInitialFieldsWithDefaultValues() as LoanTypes.Fields;
  }

  consts = {
    Day: BigInt("86400"),
    ErrorCodes: {
      MarketplaceAllowedOnly: BigInt("0"),
      LoanIsActive: BigInt("1"),
      LoanNotActive: BigInt("2"),
      LoanNotOverdue: BigInt("3"),
    },
  };

  at(address: string): LoanInstance {
    return new LoanInstance(address);
  }

  tests = {
    blockTimeStampInSeconds: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(
        this,
        "blockTimeStampInSeconds",
        params,
        getContractByCodeHash
      );
    },
    calculateInterestPayment: async (
      params: TestContractParamsWithoutMaps<
        LoanTypes.Fields,
        {
          currentBlockTimeStamp: bigint;
          loanTimestamp: bigint;
          amount: bigint;
          interest: bigint;
          days: bigint;
        }
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(
        this,
        "calculateInterestPayment",
        params,
        getContractByCodeHash
      );
    },
    calculateTotalInterestPayment: async (
      params: TestContractParamsWithoutMaps<
        LoanTypes.Fields,
        { amount: bigint; interest: bigint; days: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(
        this,
        "calculateTotalInterestPayment",
        params,
        getContractByCodeHash
      );
    },
    calculateMarketplaceFee: async (
      params: TestContractParamsWithoutMaps<
        LoanTypes.Fields,
        { amount: bigint; feeRateValue: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(
        this,
        "calculateMarketplaceFee",
        params,
        getContractByCodeHash
      );
    },
    getId: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getId", params, getContractByCodeHash);
    },
    getLender: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<Address>> => {
      return testMethod(this, "getLender", params, getContractByCodeHash);
    },
    getLendingTokenId: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(
        this,
        "getLendingTokenId",
        params,
        getContractByCodeHash
      );
    },
    getCollateralTokenId: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(
        this,
        "getCollateralTokenId",
        params,
        getContractByCodeHash
      );
    },
    getLendingAmount: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(
        this,
        "getLendingAmount",
        params,
        getContractByCodeHash
      );
    },
    getCollateralAmount: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(
        this,
        "getCollateralAmount",
        params,
        getContractByCodeHash
      );
    },
    getInterestRate: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getInterestRate", params, getContractByCodeHash);
    },
    getInterest: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getInterest", params, getContractByCodeHash);
    },
    getDuration: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getDuration", params, getContractByCodeHash);
    },
    getBorrower: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<Address>> => {
      return testMethod(this, "getBorrower", params, getContractByCodeHash);
    },
    getLoanTimeStamp: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(
        this,
        "getLoanTimeStamp",
        params,
        getContractByCodeHash
      );
    },
    borrow: async (
      params: TestContractParamsWithoutMaps<
        LoanTypes.Fields,
        { caller: Address }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "borrow", params, getContractByCodeHash);
    },
    cancel: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "cancel", params, getContractByCodeHash);
    },
    repay: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "repay", params, getContractByCodeHash);
    },
    liquidate: async (
      params: Omit<
        TestContractParamsWithoutMaps<LoanTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "liquidate", params, getContractByCodeHash);
    },
  };
}

// Use this object to test and deploy the contract
export const Loan = new Factory(
  Contract.fromJson(
    LoanContractJson,
    "",
    "941541606759ea1b19ac884ff05703ebf2b01480d2b18830b5441f3593e80365",
    []
  )
);

// Use this class to interact with the blockchain
export class LoanInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<LoanTypes.State> {
    return fetchContractState(Loan, this);
  }

  view = {
    blockTimeStampInSeconds: async (
      params?: LoanTypes.CallMethodParams<"blockTimeStampInSeconds">
    ): Promise<LoanTypes.CallMethodResult<"blockTimeStampInSeconds">> => {
      return callMethod(
        Loan,
        this,
        "blockTimeStampInSeconds",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    calculateInterestPayment: async (
      params: LoanTypes.CallMethodParams<"calculateInterestPayment">
    ): Promise<LoanTypes.CallMethodResult<"calculateInterestPayment">> => {
      return callMethod(
        Loan,
        this,
        "calculateInterestPayment",
        params,
        getContractByCodeHash
      );
    },
    calculateTotalInterestPayment: async (
      params: LoanTypes.CallMethodParams<"calculateTotalInterestPayment">
    ): Promise<LoanTypes.CallMethodResult<"calculateTotalInterestPayment">> => {
      return callMethod(
        Loan,
        this,
        "calculateTotalInterestPayment",
        params,
        getContractByCodeHash
      );
    },
    calculateMarketplaceFee: async (
      params: LoanTypes.CallMethodParams<"calculateMarketplaceFee">
    ): Promise<LoanTypes.CallMethodResult<"calculateMarketplaceFee">> => {
      return callMethod(
        Loan,
        this,
        "calculateMarketplaceFee",
        params,
        getContractByCodeHash
      );
    },
    getId: async (
      params?: LoanTypes.CallMethodParams<"getId">
    ): Promise<LoanTypes.CallMethodResult<"getId">> => {
      return callMethod(
        Loan,
        this,
        "getId",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getLender: async (
      params?: LoanTypes.CallMethodParams<"getLender">
    ): Promise<LoanTypes.CallMethodResult<"getLender">> => {
      return callMethod(
        Loan,
        this,
        "getLender",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getLendingTokenId: async (
      params?: LoanTypes.CallMethodParams<"getLendingTokenId">
    ): Promise<LoanTypes.CallMethodResult<"getLendingTokenId">> => {
      return callMethod(
        Loan,
        this,
        "getLendingTokenId",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCollateralTokenId: async (
      params?: LoanTypes.CallMethodParams<"getCollateralTokenId">
    ): Promise<LoanTypes.CallMethodResult<"getCollateralTokenId">> => {
      return callMethod(
        Loan,
        this,
        "getCollateralTokenId",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getLendingAmount: async (
      params?: LoanTypes.CallMethodParams<"getLendingAmount">
    ): Promise<LoanTypes.CallMethodResult<"getLendingAmount">> => {
      return callMethod(
        Loan,
        this,
        "getLendingAmount",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCollateralAmount: async (
      params?: LoanTypes.CallMethodParams<"getCollateralAmount">
    ): Promise<LoanTypes.CallMethodResult<"getCollateralAmount">> => {
      return callMethod(
        Loan,
        this,
        "getCollateralAmount",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getInterestRate: async (
      params?: LoanTypes.CallMethodParams<"getInterestRate">
    ): Promise<LoanTypes.CallMethodResult<"getInterestRate">> => {
      return callMethod(
        Loan,
        this,
        "getInterestRate",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getInterest: async (
      params?: LoanTypes.CallMethodParams<"getInterest">
    ): Promise<LoanTypes.CallMethodResult<"getInterest">> => {
      return callMethod(
        Loan,
        this,
        "getInterest",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getDuration: async (
      params?: LoanTypes.CallMethodParams<"getDuration">
    ): Promise<LoanTypes.CallMethodResult<"getDuration">> => {
      return callMethod(
        Loan,
        this,
        "getDuration",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getBorrower: async (
      params?: LoanTypes.CallMethodParams<"getBorrower">
    ): Promise<LoanTypes.CallMethodResult<"getBorrower">> => {
      return callMethod(
        Loan,
        this,
        "getBorrower",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getLoanTimeStamp: async (
      params?: LoanTypes.CallMethodParams<"getLoanTimeStamp">
    ): Promise<LoanTypes.CallMethodResult<"getLoanTimeStamp">> => {
      return callMethod(
        Loan,
        this,
        "getLoanTimeStamp",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    borrow: async (
      params: LoanTypes.CallMethodParams<"borrow">
    ): Promise<LoanTypes.CallMethodResult<"borrow">> => {
      return callMethod(Loan, this, "borrow", params, getContractByCodeHash);
    },
    cancel: async (
      params?: LoanTypes.CallMethodParams<"cancel">
    ): Promise<LoanTypes.CallMethodResult<"cancel">> => {
      return callMethod(
        Loan,
        this,
        "cancel",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    repay: async (
      params?: LoanTypes.CallMethodParams<"repay">
    ): Promise<LoanTypes.CallMethodResult<"repay">> => {
      return callMethod(
        Loan,
        this,
        "repay",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    liquidate: async (
      params?: LoanTypes.CallMethodParams<"liquidate">
    ): Promise<LoanTypes.CallMethodResult<"liquidate">> => {
      return callMethod(
        Loan,
        this,
        "liquidate",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    blockTimeStampInSeconds: async (
      params: LoanTypes.SignExecuteMethodParams<"blockTimeStampInSeconds">
    ): Promise<
      LoanTypes.SignExecuteMethodResult<"blockTimeStampInSeconds">
    > => {
      return signExecuteMethod(Loan, this, "blockTimeStampInSeconds", params);
    },
    calculateInterestPayment: async (
      params: LoanTypes.SignExecuteMethodParams<"calculateInterestPayment">
    ): Promise<
      LoanTypes.SignExecuteMethodResult<"calculateInterestPayment">
    > => {
      return signExecuteMethod(Loan, this, "calculateInterestPayment", params);
    },
    calculateTotalInterestPayment: async (
      params: LoanTypes.SignExecuteMethodParams<"calculateTotalInterestPayment">
    ): Promise<
      LoanTypes.SignExecuteMethodResult<"calculateTotalInterestPayment">
    > => {
      return signExecuteMethod(
        Loan,
        this,
        "calculateTotalInterestPayment",
        params
      );
    },
    calculateMarketplaceFee: async (
      params: LoanTypes.SignExecuteMethodParams<"calculateMarketplaceFee">
    ): Promise<
      LoanTypes.SignExecuteMethodResult<"calculateMarketplaceFee">
    > => {
      return signExecuteMethod(Loan, this, "calculateMarketplaceFee", params);
    },
    getId: async (
      params: LoanTypes.SignExecuteMethodParams<"getId">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getId">> => {
      return signExecuteMethod(Loan, this, "getId", params);
    },
    getLender: async (
      params: LoanTypes.SignExecuteMethodParams<"getLender">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getLender">> => {
      return signExecuteMethod(Loan, this, "getLender", params);
    },
    getLendingTokenId: async (
      params: LoanTypes.SignExecuteMethodParams<"getLendingTokenId">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getLendingTokenId">> => {
      return signExecuteMethod(Loan, this, "getLendingTokenId", params);
    },
    getCollateralTokenId: async (
      params: LoanTypes.SignExecuteMethodParams<"getCollateralTokenId">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getCollateralTokenId">> => {
      return signExecuteMethod(Loan, this, "getCollateralTokenId", params);
    },
    getLendingAmount: async (
      params: LoanTypes.SignExecuteMethodParams<"getLendingAmount">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getLendingAmount">> => {
      return signExecuteMethod(Loan, this, "getLendingAmount", params);
    },
    getCollateralAmount: async (
      params: LoanTypes.SignExecuteMethodParams<"getCollateralAmount">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getCollateralAmount">> => {
      return signExecuteMethod(Loan, this, "getCollateralAmount", params);
    },
    getInterestRate: async (
      params: LoanTypes.SignExecuteMethodParams<"getInterestRate">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getInterestRate">> => {
      return signExecuteMethod(Loan, this, "getInterestRate", params);
    },
    getInterest: async (
      params: LoanTypes.SignExecuteMethodParams<"getInterest">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getInterest">> => {
      return signExecuteMethod(Loan, this, "getInterest", params);
    },
    getDuration: async (
      params: LoanTypes.SignExecuteMethodParams<"getDuration">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getDuration">> => {
      return signExecuteMethod(Loan, this, "getDuration", params);
    },
    getBorrower: async (
      params: LoanTypes.SignExecuteMethodParams<"getBorrower">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getBorrower">> => {
      return signExecuteMethod(Loan, this, "getBorrower", params);
    },
    getLoanTimeStamp: async (
      params: LoanTypes.SignExecuteMethodParams<"getLoanTimeStamp">
    ): Promise<LoanTypes.SignExecuteMethodResult<"getLoanTimeStamp">> => {
      return signExecuteMethod(Loan, this, "getLoanTimeStamp", params);
    },
    borrow: async (
      params: LoanTypes.SignExecuteMethodParams<"borrow">
    ): Promise<LoanTypes.SignExecuteMethodResult<"borrow">> => {
      return signExecuteMethod(Loan, this, "borrow", params);
    },
    cancel: async (
      params: LoanTypes.SignExecuteMethodParams<"cancel">
    ): Promise<LoanTypes.SignExecuteMethodResult<"cancel">> => {
      return signExecuteMethod(Loan, this, "cancel", params);
    },
    repay: async (
      params: LoanTypes.SignExecuteMethodParams<"repay">
    ): Promise<LoanTypes.SignExecuteMethodResult<"repay">> => {
      return signExecuteMethod(Loan, this, "repay", params);
    },
    liquidate: async (
      params: LoanTypes.SignExecuteMethodParams<"liquidate">
    ): Promise<LoanTypes.SignExecuteMethodResult<"liquidate">> => {
      return signExecuteMethod(Loan, this, "liquidate", params);
    },
  };

  async multicall<Calls extends LoanTypes.MultiCallParams>(
    calls: Calls
  ): Promise<LoanTypes.MultiCallResults<Calls>> {
    return (await multicallMethods(
      Loan,
      this,
      calls,
      getContractByCodeHash
    )) as LoanTypes.MultiCallResults<Calls>;
  }
}