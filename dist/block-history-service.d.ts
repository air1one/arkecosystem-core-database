import { Contracts } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
export declare class BlockHistoryService implements Contracts.Shared.BlockHistoryService {
    private readonly blockRepository;
    private readonly transactionRepository;
    private readonly blockFilter;
    private readonly transactionFilter;
    private readonly modelConverter;
    findOneByCriteria(criteria: Contracts.Shared.OrBlockCriteria): Promise<Interfaces.IBlockData | undefined>;
    findManyByCriteria(criteria: Contracts.Shared.OrBlockCriteria): Promise<Interfaces.IBlockData[]>;
    listByCriteria(criteria: Contracts.Shared.OrBlockCriteria, order: Contracts.Search.ListOrder, page: Contracts.Search.ListPage, options?: Contracts.Search.ListOptions): Promise<Contracts.Search.ListResult<Interfaces.IBlockData>>;
    findOneByCriteriaJoinTransactions(blockCriteria: Contracts.Shared.OrBlockCriteria, transactionCriteria: Contracts.Shared.OrTransactionCriteria): Promise<Contracts.Shared.BlockDataWithTransactionData | undefined>;
    findManyByCriteriaJoinTransactions(blockCriteria: Contracts.Shared.OrBlockCriteria, transactionCriteria: Contracts.Shared.OrTransactionCriteria): Promise<Contracts.Shared.BlockDataWithTransactionData[]>;
    listByCriteriaJoinTransactions(blockCriteria: Contracts.Search.OrCriteria<Contracts.Shared.BlockCriteria>, transactionCriteria: Contracts.Search.OrCriteria<Contracts.Shared.TransactionCriteria>, order: Contracts.Search.ListOrder, page: Contracts.Search.ListPage, options?: Contracts.Search.ListOptions): Promise<Contracts.Search.ListResult<Contracts.Shared.BlockDataWithTransactionData>>;
}
