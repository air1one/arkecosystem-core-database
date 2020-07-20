import { Contracts } from "@arkecosystem/core-kernel";
import { EntityMetadata } from "typeorm";
export declare type SqlExpression = {
    query: string;
    parameters: Record<string, any>;
};
export declare class QueryHelper<TEntity> {
    private paramNo;
    getColumnName(metadata: EntityMetadata, property: keyof TEntity): string;
    getWhereExpressionSql(metadata: EntityMetadata, expression: Contracts.Search.Expression<TEntity>): SqlExpression;
}
