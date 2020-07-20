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
exports.BlockHistoryService = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const assert_1 = __importDefault(require("assert"));
const block_repository_1 = require("./repositories/block-repository");
const transaction_repository_1 = require("./repositories/transaction-repository");
let BlockHistoryService = class BlockHistoryService {
    async findOneByCriteria(criteria) {
        const data = await this.findManyByCriteria(criteria);
        assert_1.default(data.length <= 1);
        return data[0];
    }
    async findManyByCriteria(criteria) {
        const expression = await this.blockFilter.getExpression(criteria);
        const order = [{ property: "height", direction: "asc" }];
        const models = await this.blockRepository.findManyByExpression(expression, order);
        return this.modelConverter.getBlockData(models);
    }
    async listByCriteria(criteria, order, page, options) {
        const expression = await this.blockFilter.getExpression(criteria);
        const modelListResult = await this.blockRepository.listByExpression(expression, order, page, options);
        const models = modelListResult.rows;
        const data = this.modelConverter.getBlockData(models);
        return { ...modelListResult, rows: data };
    }
    async findOneByCriteriaJoinTransactions(blockCriteria, transactionCriteria) {
        const data = await this.findManyByCriteriaJoinTransactions(blockCriteria, transactionCriteria);
        return data[0];
    }
    async findManyByCriteriaJoinTransactions(blockCriteria, transactionCriteria) {
        const blockExpression = await this.blockFilter.getExpression(blockCriteria);
        const blockModels = await this.blockRepository.findManyByExpression(blockExpression);
        const transactionBlockCriteria = blockModels.map((b) => ({ blockId: b.id }));
        const transactionExpression = await this.transactionFilter.getExpression(transactionCriteria, transactionBlockCriteria);
        const transactionModels = await this.transactionRepository.findManyByExpression(transactionExpression);
        const blockDataWithTransactionData = this.modelConverter.getBlockDataWithTransactionData(blockModels, transactionModels);
        return blockDataWithTransactionData;
    }
    async listByCriteriaJoinTransactions(blockCriteria, transactionCriteria, order, page, options) {
        const blockExpression = await this.blockFilter.getExpression(blockCriteria);
        const blockListResult = await this.blockRepository.listByExpression(blockExpression, order, page, options);
        const blockModels = blockListResult.rows;
        const transactionBlockCriteria = blockModels.map((b) => ({ blockId: b.id }));
        const transactionExpression = await this.transactionFilter.getExpression(transactionCriteria, transactionBlockCriteria);
        const transactionModels = await this.transactionRepository.findManyByExpression(transactionExpression);
        const blockDataWithTransactionData = this.modelConverter.getBlockDataWithTransactionData(blockModels, transactionModels);
        return { ...blockListResult, rows: blockDataWithTransactionData };
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseBlockRepository),
    __metadata("design:type", block_repository_1.BlockRepository)
], BlockHistoryService.prototype, "blockRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseTransactionRepository),
    __metadata("design:type", transaction_repository_1.TransactionRepository)
], BlockHistoryService.prototype, "transactionRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseBlockFilter),
    __metadata("design:type", Object)
], BlockHistoryService.prototype, "blockFilter", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseTransactionFilter),
    __metadata("design:type", Object)
], BlockHistoryService.prototype, "transactionFilter", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseModelConverter),
    __metadata("design:type", Object)
], BlockHistoryService.prototype, "modelConverter", void 0);
BlockHistoryService = __decorate([
    core_kernel_1.Container.injectable()
], BlockHistoryService);
exports.BlockHistoryService = BlockHistoryService;
//# sourceMappingURL=block-history-service.js.map