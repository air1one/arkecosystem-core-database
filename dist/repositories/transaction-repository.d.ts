/// <reference types="node" />
import { Utils } from "@arkecosystem/core-kernel";
import { Transaction } from "../models/transaction";
import { AbstractRepository } from "./abstract-repository";
export declare class TransactionRepository extends AbstractRepository<Transaction> {
    findByBlockIds(blockIds: string[]): Promise<Array<{
        id: string;
        blockId: string;
        serialized: Buffer;
    }>>;
    getForgedTransactionsIds(ids: string[]): Promise<string[]>;
    getStatistics(): Promise<{
        count: number;
        totalFee: string;
        totalAmount: string;
    }>;
    getFeeStatistics(days: number, minFee?: number): Promise<{
        type: number;
        typeGroup: number;
        avg: string;
        min: string;
        max: string;
        sum: string;
    }[]>;
    getSentTransactions(): Promise<{
        senderPublicKey: string;
        amount: string;
        fee: string;
        nonce: string;
    }[]>;
    findReceivedTransactions(): Promise<{
        recipientId: string;
        amount: string;
    }[]>;
    findByType(type: number, typeGroup: number, limit?: number, offset?: number): Promise<Array<Transaction & {
        blockHeight: number;
        blockGeneratorPublicKey: string;
        reward: Utils.BigNumber;
    }>>;
    findByHtlcLocks(lockIds: string[]): Promise<Transaction[]>;
    getOpenHtlcLocks(): Promise<Array<Transaction>>;
    getClaimedHtlcLockBalances(): Promise<{
        recipientId: string;
        claimedBalance: string;
    }[]>;
    getRefundedHtlcLockBalances(): Promise<{
        senderPublicKey: string;
        refundedBalance: string;
    }[]>;
}
