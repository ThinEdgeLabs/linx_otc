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
import { default as LendingMarketplaceContractJson } from "../LendingMarketplace.ral.json";
import { getContractByCodeHash } from "./contracts";

// Custom types for the contract
export namespace LendingMarketplaceTypes {
  export type Fields = {
    lendingOfferTemplateId: HexString;
    admin: Address;
    totalLendingOffers: bigint;
    fee: bigint;
    lendingEnabled: boolean;
  };

  export type State = ContractState<Fields>;

  export type AdminUpdatedEvent = ContractEvent<{
    previous: Address;
    new: Address;
  }>;
  export type LoanCreatedEvent = ContractEvent<{
    lendingTokenId: HexString;
    collateralTokenId: HexString;
    lendingAmount: bigint;
    collateralAmount: bigint;
    interestRate: bigint;
    duration: bigint;
    lender: Address;
    loanId: HexString;
  }>;
  export type LoanCancelledEvent = ContractEvent<{ loanId: HexString }>;
  export type LoanPaidEvent = ContractEvent<{ loanId: HexString }>;
  export type LoanStartedEvent = ContractEvent<{
    loanId: HexString;
    borrower: Address;
  }>;
  export type LoanLiquidatedEvent = ContractEvent<{ loanId: HexString }>;

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
    getAdmin: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<Address>;
    };
    getTotalLendingOffers: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getFee: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    createLendingOffer: {
      params: CallContractParams<{
        lendingTokenId: HexString;
        collateralTokenId: HexString;
        lendingAmount: bigint;
        collateralAmount: bigint;
        interestRate: bigint;
        duration: bigint;
      }>;
      result: CallContractResult<Address>;
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
  LendingMarketplaceInstance,
  LendingMarketplaceTypes.Fields
> {
  getInitialFieldsWithDefaultValues() {
    return this.contract.getInitialFieldsWithDefaultValues() as LendingMarketplaceTypes.Fields;
  }

  eventIndex = {
    AdminUpdated: 0,
    LoanCreated: 1,
    LoanCancelled: 2,
    LoanPaid: 3,
    LoanStarted: 4,
    LoanLiquidated: 5,
  };
  consts = {
    Day: BigInt(86400),
    ErrorCodes: {
      AdminAllowedOnly: BigInt(0),
      LendingDisabled: BigInt(1),
      LenderAllowedOnly: BigInt(2),
      BorrowerAllowedOnly: BigInt(3),
      LenderNotAllowed: BigInt(4),
    },
  };

  at(address: string): LendingMarketplaceInstance {
    return new LendingMarketplaceInstance(address);
  }

  tests = {
    blockTimeStampInSeconds: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingMarketplaceTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "blockTimeStampInSeconds", params);
    },
    calculateInterestPayment: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
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
        LendingMarketplaceTypes.Fields,
        { amount: bigint; interest: bigint; days: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "calculateTotalInterestPayment", params);
    },
    calculateMarketplaceFee: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
        { amount: bigint; feeRate: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "calculateMarketplaceFee", params);
    },
    getAdmin: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingMarketplaceTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<Address>> => {
      return testMethod(this, "getAdmin", params);
    },
    getTotalLendingOffers: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingMarketplaceTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getTotalLendingOffers", params);
    },
    getFee: async (
      params: Omit<
        TestContractParamsWithoutMaps<LendingMarketplaceTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getFee", params);
    },
    createLendingOffer: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
        {
          lendingTokenId: HexString;
          collateralTokenId: HexString;
          lendingAmount: bigint;
          collateralAmount: bigint;
          interestRate: bigint;
          duration: bigint;
        }
      >
    ): Promise<TestContractResultWithoutMaps<Address>> => {
      return testMethod(this, "createLendingOffer", params);
    },
    borrow: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
        { offerId: HexString }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "borrow", params);
    },
    cancelOffer: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
        { loanId: HexString }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "cancelOffer", params);
    },
    paybackLoan: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
        { loanId: HexString }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "paybackLoan", params);
    },
    liquidateLoan: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
        { loanId: HexString }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "liquidateLoan", params);
    },
    updateAdmin: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
        { newAdmin: Address }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "updateAdmin", params);
    },
    updateFee: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
        { newFee: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "updateFee", params);
    },
    updateLendingEnabled: async (
      params: TestContractParamsWithoutMaps<
        LendingMarketplaceTypes.Fields,
        { enabled: boolean }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "updateLendingEnabled", params);
    },
  };
}

// Use this object to test and deploy the contract
export const LendingMarketplace = new Factory(
  Contract.fromJson(
    LendingMarketplaceContractJson,
    "",
    "87f53f7f125fd1b1c91a89ffb51022f3719ac70db1c9ef4c2fe05cf3dbc5058f"
  )
);

// Use this class to interact with the blockchain
export class LendingMarketplaceInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<LendingMarketplaceTypes.State> {
    return fetchContractState(LendingMarketplace, this);
  }

  async getContractEventsCurrentCount(): Promise<number> {
    return getContractEventsCurrentCount(this.address);
  }

  subscribeAdminUpdatedEvent(
    options: EventSubscribeOptions<LendingMarketplaceTypes.AdminUpdatedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      LendingMarketplace.contract,
      this,
      options,
      "AdminUpdated",
      fromCount
    );
  }

  subscribeLoanCreatedEvent(
    options: EventSubscribeOptions<LendingMarketplaceTypes.LoanCreatedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      LendingMarketplace.contract,
      this,
      options,
      "LoanCreated",
      fromCount
    );
  }

  subscribeLoanCancelledEvent(
    options: EventSubscribeOptions<LendingMarketplaceTypes.LoanCancelledEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      LendingMarketplace.contract,
      this,
      options,
      "LoanCancelled",
      fromCount
    );
  }

  subscribeLoanPaidEvent(
    options: EventSubscribeOptions<LendingMarketplaceTypes.LoanPaidEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      LendingMarketplace.contract,
      this,
      options,
      "LoanPaid",
      fromCount
    );
  }

  subscribeLoanStartedEvent(
    options: EventSubscribeOptions<LendingMarketplaceTypes.LoanStartedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      LendingMarketplace.contract,
      this,
      options,
      "LoanStarted",
      fromCount
    );
  }

  subscribeLoanLiquidatedEvent(
    options: EventSubscribeOptions<LendingMarketplaceTypes.LoanLiquidatedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      LendingMarketplace.contract,
      this,
      options,
      "LoanLiquidated",
      fromCount
    );
  }

  subscribeAllEvents(
    options: EventSubscribeOptions<
      | LendingMarketplaceTypes.AdminUpdatedEvent
      | LendingMarketplaceTypes.LoanCreatedEvent
      | LendingMarketplaceTypes.LoanCancelledEvent
      | LendingMarketplaceTypes.LoanPaidEvent
      | LendingMarketplaceTypes.LoanStartedEvent
      | LendingMarketplaceTypes.LoanLiquidatedEvent
    >,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvents(
      LendingMarketplace.contract,
      this,
      options,
      fromCount
    );
  }

  methods = {
    blockTimeStampInSeconds: async (
      params?: LendingMarketplaceTypes.CallMethodParams<"blockTimeStampInSeconds">
    ): Promise<
      LendingMarketplaceTypes.CallMethodResult<"blockTimeStampInSeconds">
    > => {
      return callMethod(
        LendingMarketplace,
        this,
        "blockTimeStampInSeconds",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    calculateInterestPayment: async (
      params: LendingMarketplaceTypes.CallMethodParams<"calculateInterestPayment">
    ): Promise<
      LendingMarketplaceTypes.CallMethodResult<"calculateInterestPayment">
    > => {
      return callMethod(
        LendingMarketplace,
        this,
        "calculateInterestPayment",
        params,
        getContractByCodeHash
      );
    },
    calculateTotalInterestPayment: async (
      params: LendingMarketplaceTypes.CallMethodParams<"calculateTotalInterestPayment">
    ): Promise<
      LendingMarketplaceTypes.CallMethodResult<"calculateTotalInterestPayment">
    > => {
      return callMethod(
        LendingMarketplace,
        this,
        "calculateTotalInterestPayment",
        params,
        getContractByCodeHash
      );
    },
    calculateMarketplaceFee: async (
      params: LendingMarketplaceTypes.CallMethodParams<"calculateMarketplaceFee">
    ): Promise<
      LendingMarketplaceTypes.CallMethodResult<"calculateMarketplaceFee">
    > => {
      return callMethod(
        LendingMarketplace,
        this,
        "calculateMarketplaceFee",
        params,
        getContractByCodeHash
      );
    },
    getAdmin: async (
      params?: LendingMarketplaceTypes.CallMethodParams<"getAdmin">
    ): Promise<LendingMarketplaceTypes.CallMethodResult<"getAdmin">> => {
      return callMethod(
        LendingMarketplace,
        this,
        "getAdmin",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getTotalLendingOffers: async (
      params?: LendingMarketplaceTypes.CallMethodParams<"getTotalLendingOffers">
    ): Promise<
      LendingMarketplaceTypes.CallMethodResult<"getTotalLendingOffers">
    > => {
      return callMethod(
        LendingMarketplace,
        this,
        "getTotalLendingOffers",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getFee: async (
      params?: LendingMarketplaceTypes.CallMethodParams<"getFee">
    ): Promise<LendingMarketplaceTypes.CallMethodResult<"getFee">> => {
      return callMethod(
        LendingMarketplace,
        this,
        "getFee",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    createLendingOffer: async (
      params: LendingMarketplaceTypes.CallMethodParams<"createLendingOffer">
    ): Promise<
      LendingMarketplaceTypes.CallMethodResult<"createLendingOffer">
    > => {
      return callMethod(
        LendingMarketplace,
        this,
        "createLendingOffer",
        params,
        getContractByCodeHash
      );
    },
  };

  async multicall<Calls extends LendingMarketplaceTypes.MultiCallParams>(
    calls: Calls
  ): Promise<LendingMarketplaceTypes.MultiCallResults<Calls>> {
    return (await multicallMethods(
      LendingMarketplace,
      this,
      calls,
      getContractByCodeHash
    )) as LendingMarketplaceTypes.MultiCallResults<Calls>;
  }
}
