import { Contracts } from "@arkecosystem/core-kernel";
import { Transaction } from "./models/transaction";
export declare class TransactionFilter implements Contracts.Database.TransactionFilter {
    private readonly walletRepository;
    getExpression(...criteria: Contracts.Shared.OrTransactionCriteria[]): Promise<Contracts.Search.Expression<Transaction>>;
    private handleTransactionCriteria;
    private handleAddressCriteria;
    private handleSenderIdCriteria;
    private handleRecipientIdCriteria;
    private getAutoTypeGroupExpression;
}
