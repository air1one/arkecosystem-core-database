import { Contracts } from "@arkecosystem/core-kernel";
import { ObjectLiteral, Repository } from "typeorm";
export declare type CustomPropertyHandler<TEntity> = (entity: Partial<TEntity>, key: string, value: unknown) => void;
export declare abstract class AbstractRepository<TEntity extends ObjectLiteral> extends Repository<TEntity> {
    private readonly queryHelper;
    findById(id: string): Promise<TEntity>;
    findManyByExpression(expression: Contracts.Search.Expression<TEntity>, order?: Contracts.Search.ListOrder): Promise<TEntity[]>;
    streamByExpression(expression: Contracts.Search.Expression<TEntity>, order?: Contracts.Search.ListOrder): AsyncIterable<TEntity>;
    listByExpression(expression: Contracts.Search.Expression<TEntity>, order: Contracts.Search.ListOrder, page: Contracts.Search.ListPage, options?: Contracts.Search.ListOptions): Promise<Contracts.Search.ListResult<TEntity>>;
    protected rawToEntity(rawEntity: Record<string, any>, customPropertyHandler?: CustomPropertyHandler<TEntity>): TEntity;
    private addWhere;
    private addOrderBy;
    private addSkipOffset;
}
