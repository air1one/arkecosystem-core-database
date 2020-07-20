"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRepository = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const typeorm_1 = require("typeorm");
const query_helper_1 = require("../utils/query-helper");
class AbstractRepository extends typeorm_1.Repository {
    constructor() {
        super(...arguments);
        this.queryHelper = new query_helper_1.QueryHelper();
    }
    async findById(id) {
        return (await this.findByIds([id]))[0];
    }
    async findManyByExpression(expression, order = []) {
        const queryBuilder = this.createQueryBuilder().select();
        this.addWhere(queryBuilder, expression);
        this.addOrderBy(queryBuilder, order);
        return queryBuilder.getMany();
    }
    async *streamByExpression(expression, order = []) {
        const queryBuilder = this.createQueryBuilder().select("*");
        this.addWhere(queryBuilder, expression);
        this.addOrderBy(queryBuilder, order);
        const stream = await queryBuilder.stream();
        for await (const raw of stream) {
            yield this.rawToEntity(raw);
        }
    }
    async listByExpression(expression, order, page, options) {
        const queryBuilder = this.createQueryBuilder().select();
        this.addWhere(queryBuilder, expression);
        this.addOrderBy(queryBuilder, order);
        this.addSkipOffset(queryBuilder, page);
        if ((options === null || options === void 0 ? void 0 : options.estimateTotalCount) === false) {
            const [rows, count] = await queryBuilder.getManyAndCount();
            return { rows, count, countIsEstimate: false };
        }
        else {
            const rows = await queryBuilder.getMany();
            let count = 0;
            const [query, parameters] = queryBuilder.getQueryAndParameters();
            const explainedQuery = await this.query(`EXPLAIN ${query}`, parameters);
            for (const row of explainedQuery) {
                const match = row["QUERY PLAN"].match(/rows=([0-9]+)/);
                if (match) {
                    count = parseFloat(match[1]);
                }
            }
            return { rows, count: Math.max(count, rows.length), countIsEstimate: true };
        }
    }
    rawToEntity(rawEntity, customPropertyHandler) {
        const entity = this.create();
        for (const [key, value] of Object.entries(rawEntity)) {
            // Replace auto-generated column name with property name, if any.
            const columnName = key.replace(`${this.metadata.givenTableName}_`, "");
            const columnMetadata = this.metadata.columns.find((column) => column.databaseName === columnName);
            if (columnMetadata) {
                let propertyValue;
                if (value === undefined || value === null) {
                    propertyValue = undefined;
                }
                else if (columnMetadata.type === "bigint") {
                    propertyValue = core_kernel_1.Utils.BigNumber.make(value);
                }
                else if (columnMetadata.propertyName === "vendorField") {
                    propertyValue = value.toString("utf8");
                }
                else {
                    propertyValue = value;
                }
                entity[columnMetadata.propertyName] = propertyValue;
            }
            else {
                core_kernel_1.Utils.assert.defined(customPropertyHandler);
                customPropertyHandler(entity, key, value);
            }
        }
        return entity;
    }
    addWhere(queryBuilder, expression) {
        const sqlExpression = this.queryHelper.getWhereExpressionSql(this.metadata, expression);
        queryBuilder.where(sqlExpression.query, sqlExpression.parameters);
    }
    addOrderBy(queryBuilder, order) {
        if (order.length) {
            const column = this.queryHelper.getColumnName(this.metadata, order[0].property);
            queryBuilder.orderBy(column, order[0].direction === "desc" ? "DESC" : "ASC");
            for (const item of order.slice(1)) {
                const column = this.queryHelper.getColumnName(this.metadata, item.property);
                queryBuilder.addOrderBy(column, item.direction === "desc" ? "DESC" : "ASC");
            }
        }
    }
    addSkipOffset(queryBuilder, page) {
        queryBuilder.skip(page.offset).take(page.limit);
    }
}
exports.AbstractRepository = AbstractRepository;
//# sourceMappingURL=abstract-repository.js.map