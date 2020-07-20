"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionHistoryService = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const assert_1 = __importDefault(require("assert"));
const block_repository_1 = require("./repositories/block-repository");
const transaction_repository_1 = require("./repositories/transaction-repository");
let TransactionHistoryService = class TransactionHistoryService {
    async findOneByCriteria(criteria) {
        const data = await this.findManyByCriteria(criteria);
        assert_1.default(data.length <= 1);
        return data[0];
    }
    async findManyByCriteria(criteria) {
        const expression = await this.transactionFilter.getExpression(criteria);
        const order = [
            { property: "blockHeight", direction: "asc" },
            { property: "sequence", direction: "asc" },
        ];
        const models = await this.transactionRepository.findManyByExpression(expression, order);
        return this.modelConverter.getTransactionData(models);
    }
    async *streamByCriteria(criteria) {
        const expression = await this.transactionFilter.getExpression(criteria);
        const order = [
            { property: "blockHeight", direction: "asc" },
            { property: "sequence", direction: "asc" },
        ];
        for await (const model of this.transactionRepository.streamByExpression(expression, order)) {
            yield this.modelConverter.getTransactionData([model])[0];
        }
    }
    async listByCriteria(criteria, order, page, options) {
        const expression = await this.transactionFilter.getExpression(criteria);
        const modelListResult = await this.transactionRepository.listByExpression(expression, order, page, options);
        const models = modelListResult.rows;
        const data = this.modelConverter.getTransactionData(models);
        return { ...modelListResult, rows: data };
    }
    async findOneByCriteriaJoinBlock(criteria) {
        const data = await this.findManyByCriteriaJoinBlock(criteria);
        return data[0];
    }
    async findManyByCriteriaJoinBlock(transactionCriteria) {
        const transactionExpression = await this.transactionFilter.getExpression(transactionCriteria);
        const transactionModels = await this.transactionRepository.findManyByExpression(transactionExpression);
        const blockCriteria = { id: transactionModels.map((t) => t.blockId) };
        const blockExpression = await this.blockFilter.getExpression(blockCriteria);
        const blockModels = await this.blockRepository.findManyByExpression(blockExpression);
        return this.modelConverter.getTransactionDataWithBlockData(transactionModels, blockModels);
    }
    async listByCriteriaJoinBlock(transactionCriteria, order, page, options) {
        const transactionExpression = await this.transactionFilter.getExpression(transactionCriteria);
        const transactionListResult = await this.transactionRepository.listByExpression(transactionExpression, order, page, options);
        const transactionModels = transactionListResult.rows;
        const blockCriteria = { id: transactionModels.map((t) => t.blockId) };
        const blockExpression = await this.blockFilter.getExpression(blockCriteria);
        const blockModels = await this.blockRepository.findManyByExpression(blockExpression);
        const transactionDataWithBlockData = this.modelConverter.getTransactionDataWithBlockData(transactionModels, blockModels);
        return { ...transactionListResult, rows: transactionDataWithBlockData };
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseBlockRepository),
    __metadata("design:type", block_repository_1.BlockRepository)
], TransactionHistoryService.prototype, "blockRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseTransactionRepository),
    __metadata("design:type", transaction_repository_1.TransactionRepository)
], TransactionHistoryService.prototype, "transactionRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseTransactionFilter),
    __metadata("design:type", Object)
], TransactionHistoryService.prototype, "transactionFilter", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseBlockFilter),
    __metadata("design:type", Object)
], TransactionHistoryService.prototype, "blockFilter", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseModelConverter),
    __metadata("design:type", Object)
], TransactionHistoryService.prototype, "modelConverter", void 0);
TransactionHistoryService = __decorate([
    core_kernel_1.Container.injectable()
], TransactionHistoryService);
exports.TransactionHistoryService = TransactionHistoryService;
//# sourceMappingURL=transaction-history-service.js.map