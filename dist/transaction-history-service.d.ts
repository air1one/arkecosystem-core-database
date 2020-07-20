import { Contracts } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
export declare class TransactionHistoryService implements Contracts.Shared.TransactionHistoryService {
    private readonly blockRepository;
    private readonly transactionRepository;
    private readonly transactionFilter;
    private readonly blockFilter;
    private readonly modelConverter;
    findOneByCriteria(criteria: Contracts.Shared.OrTransactionCriteria): Promise<Interfaces.ITransactionData | undefined>;
    findManyByCriteria(criteria: Contracts.Shared.OrTransactionCriteria): Promise<Interfaces.ITransactionData[]>;
    streamByCriteria(criteria: Contracts.Search.OrCriteria<Contracts.Shared.TransactionCriteria>): AsyncIterable<Interfaces.ITransactionData>;
    listByCriteria(criteria: Contracts.Shared.OrTransactionCriteria, order: Contracts.Search.ListOrder, page: Contracts.Search.ListPage, options?: Contracts.Search.ListOptions): Promise<Contracts.Search.ListResult<Interfaces.ITransactionData>>;
    findOneByCriteriaJoinBlock(criteria: Contracts.Shared.OrTransactionCriteria): Promise<Contracts.Shared.TransactionDataWithBlockData | undefined>;
    findManyByCriteriaJoinBlock(transactionCriteria: Contracts.Shared.OrTransactionCriteria): Promise<Contracts.Shared.TransactionDataWithBlockData[]>;
    listByCriteriaJoinBlock(transactionCriteria: Contracts.Shared.OrTransactionCriteria, order: Contracts.Search.ListOrder, page: Contracts.Search.ListPage, options?: Contracts.Search.ListOptions): Promise<Contracts.Search.ListResult<Contracts.Shared.TransactionDataWithBlockData>>;
}
