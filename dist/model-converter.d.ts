import { Contracts } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
export declare class ModelConverter implements Contracts.Database.ModelConverter {
    getBlockModels(blocks: Interfaces.IBlock[]): Contracts.Database.BlockModel[];
    getBlockData(models: Contracts.Database.BlockModel[]): Interfaces.IBlockData[];
    getBlockDataWithTransactionData(blockModels: Contracts.Database.BlockModel[], transactionModels: Contracts.Database.TransactionModel[]): Contracts.Shared.BlockDataWithTransactionData[];
    getTransactionModels(transactions: Interfaces.ITransaction[]): Contracts.Database.TransactionModel[];
    getTransactionData(models: Contracts.Database.TransactionModel[]): Interfaces.ITransactionData[];
    getTransactionDataWithBlockData(transactionModels: Contracts.Database.TransactionModel[], blockModels: Contracts.Database.BlockModel[]): Contracts.Shared.TransactionDataWithBlockData[];
}
