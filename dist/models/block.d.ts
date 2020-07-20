import { Contracts } from "@arkecosystem/core-kernel";
import { Utils } from "@arkecosystem/crypto";
export declare class Block implements Contracts.Database.BlockModel {
    id: string;
    version: number;
    timestamp: number;
    previousBlock: string;
    height: number;
    numberOfTransactions: number;
    totalAmount: Utils.BigNumber;
    totalFee: Utils.BigNumber;
    reward: Utils.BigNumber;
    payloadLength: number;
    payloadHash: string;
    generatorPublicKey: string;
    blockSignature: string;
}
