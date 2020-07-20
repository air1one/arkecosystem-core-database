"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConverter = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const crypto_1 = require("@arkecosystem/crypto");
const block_1 = require("./models/block");
const transaction_1 = require("./models/transaction");
let ModelConverter = class ModelConverter {
    getBlockModels(blocks) {
        return blocks.map((b) => Object.assign(new block_1.Block(), b.data));
    }
    getBlockData(models) {
        return models;
    }
    getBlockDataWithTransactionData(blockModels, transactionModels) {
        const blockData = this.getBlockData(blockModels);
        const transactionData = this.getTransactionData(transactionModels);
        const blockDataWithTransactions = blockData.map((data) => {
            const transactions = transactionData.filter((t) => t.blockId === data.id);
            return { data, transactions };
        });
        return blockDataWithTransactions;
    }
    getTransactionModels(transactions) {
        return transactions.map((t) => {
            return Object.assign(new transaction_1.Transaction(), t.data, {
                timestamp: t.timestamp,
                serialized: t.serialized,
            });
        });
    }
    getTransactionData(models) {
        return models.map((model) => {
            const data = crypto_1.Transactions.TransactionFactory.fromBytesUnsafe(model.serialized, model.id).data;
            // set_row_nonce trigger
            data.nonce = model.nonce;
            // block constructor
            data.blockId = model.blockId;
            data.blockHeight = model.blockHeight;
            data.sequence = model.sequence;
            return data;
        });
    }
    getTransactionDataWithBlockData(transactionModels, blockModels) {
        const transactionData = this.getTransactionData(transactionModels);
        const blockData = this.getBlockData(blockModels);
        return transactionData.map((data) => {
            const block = blockData.find((b) => b.id === data.blockId);
            core_kernel_1.Utils.assert.defined(block);
            return { data, block };
        });
    }
};
ModelConverter = __decorate([
    core_kernel_1.Container.injectable()
], ModelConverter);
exports.ModelConverter = ModelConverter;
//# sourceMappingURL=model-converter.js.map