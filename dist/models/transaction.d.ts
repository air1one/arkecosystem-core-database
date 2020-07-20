/// <reference types="node" />
import { Contracts } from "@arkecosystem/core-kernel";
import { Utils } from "@arkecosystem/crypto";
export declare class Transaction implements Contracts.Database.TransactionModel {
    id: string;
    version: number;
    blockId: string;
    blockHeight: number;
    sequence: number;
    timestamp: number;
    nonce: Utils.BigNumber;
    senderPublicKey: string;
    recipientId: string;
    type: number;
    typeGroup: number;
    vendorField: string | undefined;
    amount: Utils.BigNumber;
    fee: Utils.BigNumber;
    serialized: Buffer;
    asset: Record<string, any>;
}
