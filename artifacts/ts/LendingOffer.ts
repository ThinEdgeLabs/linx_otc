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
} from "@alephium/web3";
import { default as LendingOfferContractJson } from "../LendingOffer.ral.json";
import { getContractByCodeHash } from "./contracts";

// Custom types for the contract
export namespace LendingOfferTypes {
  export type Fields = {
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
      params: CallContractParams<{ amount: bigint; feeRate: bigint }>;
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
}

class Factory extends ContractFactory<
  LendingOfferInstance,
  LendingOfferTypes.Fields
> {
  getInitialFieldsWithDefaultValues() {
    return this.contract.getInitialFieldsWithDefaultValues() as LendingOfferTypes.Fields;
  }

  consts = {
    Day: BigInt(86400),
    ErrorCodes: {
      MarketplaceAllowedOnly: BigInt(0),
      LoanIsActive: BigInt(1),
      LoanNotActive: BigInt(2),
      LoanNotOverdue: BigInt(3),
    },
  };

  at(address: string): LendingOfferInstance {
    return new LendingOfferInstance(address);
  }

  tests = {
    blockTimeStampInSeconds: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "blockTimeStampInSeconds", params);
    },
    calculateInterestPayment: async (
      params: TestContractParamsWithoutMaps<
        LendingOfferTypes.Fields,
        {
          currentBlockTimeStamp: bigint;
          loanTimestamp: bigint;
          amount: bigint;
          interest: bigint;
          days: bigint;
        }
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "calculateInterestPayment", params);
    },
    calculateTotalInterestPayment: async (
      params: TestContractParamsWithoutMaps<
        LendingOfferTypes.Fields,
        { amount: bigint; interest: bigint; days: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "calculateTotalInterestPayment", params);
    },
    calculateMarketplaceFee: async (
      params: TestContractParamsWithoutMaps<
        LendingOfferTypes.Fields,
        { amount: bigint; feeRate: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "calculateMarketplaceFee", params);
    },
    getLender: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<Address>> => {
      return testMethod(this, "getLender", params);
    },
    getLendingTokenId: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getLendingTokenId", params);
    },
    getCollateralTokenId: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getCollateralTokenId", params);
    },
    getLendingAmount: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getLendingAmount", params);
    },
    getCollateralAmount: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getCollateralAmount", params);
    },
    getInterestRate: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getInterestRate", params);
    },
    getInterest: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getInterest", params);
    },
    getDuration: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getDuration", params);
    },
    getBorrower: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<Address>> => {
      return testMethod(this, "getBorrower", params);
    },
    getLoanTimeStamp: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getLoanTimeStamp", params);
    },
    take: async (
      params: TestContractParamsWithoutMaps<
        LendingOfferTypes.Fields,
        { caller: Address }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "take", params);
    },
    cancel: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "cancel", params);
    },
    payback: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "payback", params);
    },
    liquidate: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingOfferTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "liquidate", params);
    },
  };
}

// Use this object to test and deploy the contract
export const LendingOffer = new Factory(
  Contract.fromJson(
    LendingOfferContractJson,
    "",
    "fe1b7610dfc20a8a0532554a87952d2794a32e35735599032af7829eb656da1a"
  )
);

// Use this class to interact with the blockchain
export class LendingOfferInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<LendingOfferTypes.State> {
    return fetchContractState(LendingOffer, this);
  }

  methods = {
    blockTimeStampInSeconds: async (
      params?: LendingOfferTypes.CallMethodParams<"blockTimeStampInSeconds">
    ): Promise<
      LendingOfferTypes.CallMethodResult<"blockTimeStampInSeconds">
    > => {
      return callMethod(
        LendingOffer,
        this,
        "blockTimeStampInSeconds",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    calculateInterestPayment: async (
      params: LendingOfferTypes.CallMethodParams<"calculateInterestPayment">
    ): Promise<
      LendingOfferTypes.CallMethodResult<"calculateInterestPayment">
    > => {
      return callMethod(
        LendingOffer,
        this,
        "calculateInterestPayment",
        params,
        getContractByCodeHash
      );
    },
    calculateTotalInterestPayment: async (
      params: LendingOfferTypes.CallMethodParams<"calculateTotalInterestPayment">
    ): Promise<
      LendingOfferTypes.CallMethodResult<"calculateTotalInterestPayment">
    > => {
      return callMethod(
        LendingOffer,
        this,
        "calculateTotalInterestPayment",
        params,
        getContractByCodeHash
      );
    },
    calculateMarketplaceFee: async (
      params: LendingOfferTypes.CallMethodParams<"calculateMarketplaceFee">
    ): Promise<
      LendingOfferTypes.CallMethodResult<"calculateMarketplaceFee">
    > => {
      return callMethod(
        LendingOffer,
        this,
        "calculateMarketplaceFee",
        params,
        getContractByCodeHash
      );
    },
    getLender: async (
      params?: LendingOfferTypes.CallMethodParams<"getLender">
    ): Promise<LendingOfferTypes.CallMethodResult<"getLender">> => {
      return callMethod(
        LendingOffer,
        this,
        "getLender",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getLendingTokenId: async (
      params?: LendingOfferTypes.CallMethodParams<"getLendingTokenId">
    ): Promise<LendingOfferTypes.CallMethodResult<"getLendingTokenId">> => {
      return callMethod(
        LendingOffer,
        this,
        "getLendingTokenId",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCollateralTokenId: async (
      params?: LendingOfferTypes.CallMethodParams<"getCollateralTokenId">
    ): Promise<LendingOfferTypes.CallMethodResult<"getCollateralTokenId">> => {
      return callMethod(
        LendingOffer,
        this,
        "getCollateralTokenId",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getLendingAmount: async (
      params?: LendingOfferTypes.CallMethodParams<"getLendingAmount">
    ): Promise<LendingOfferTypes.CallMethodResult<"getLendingAmount">> => {
      return callMethod(
        LendingOffer,
        this,
        "getLendingAmount",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCollateralAmount: async (
      params?: LendingOfferTypes.CallMethodParams<"getCollateralAmount">
    ): Promise<LendingOfferTypes.CallMethodResult<"getCollateralAmount">> => {
      return callMethod(
        LendingOffer,
        this,
        "getCollateralAmount",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getInterestRate: async (
      params?: LendingOfferTypes.CallMethodParams<"getInterestRate">
    ): Promise<LendingOfferTypes.CallMethodResult<"getInterestRate">> => {
      return callMethod(
        LendingOffer,
        this,
        "getInterestRate",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getInterest: async (
      params?: LendingOfferTypes.CallMethodParams<"getInterest">
    ): Promise<LendingOfferTypes.CallMethodResult<"getInterest">> => {
      return callMethod(
        LendingOffer,
        this,
        "getInterest",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getDuration: async (
      params?: LendingOfferTypes.CallMethodParams<"getDuration">
    ): Promise<LendingOfferTypes.CallMethodResult<"getDuration">> => {
      return callMethod(
        LendingOffer,
        this,
        "getDuration",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getBorrower: async (
      params?: LendingOfferTypes.CallMethodParams<"getBorrower">
    ): Promise<LendingOfferTypes.CallMethodResult<"getBorrower">> => {
      return callMethod(
        LendingOffer,
        this,
        "getBorrower",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getLoanTimeStamp: async (
      params?: LendingOfferTypes.CallMethodParams<"getLoanTimeStamp">
    ): Promise<LendingOfferTypes.CallMethodResult<"getLoanTimeStamp">> => {
      return callMethod(
        LendingOffer,
        this,
        "getLoanTimeStamp",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  async multicall<Calls extends LendingOfferTypes.MultiCallParams>(
    calls: Calls
  ): Promise<LendingOfferTypes.MultiCallResults<Calls>> {
    return (await multicallMethods(
      LendingOffer,
      this,
      calls,
      getContractByCodeHash
    )) as LendingOfferTypes.MultiCallResults<Calls>;
  }
}
