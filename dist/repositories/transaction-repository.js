"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const crypto_1 = require("@arkecosystem/crypto");
const dayjs_1 = __importDefault(require("dayjs"));
const typeorm_1 = require("typeorm");
const block_1 = require("../models/block");
const transaction_1 = require("../models/transaction");
const abstract_repository_1 = require("./abstract-repository");
let TransactionRepository = class TransactionRepository extends abstract_repository_1.AbstractRepository {
    async findByBlockIds(blockIds) {
        return this.find({
            select: ["id", "blockId", "serialized"],
            where: {
                blockId: typeorm_1.In(blockIds),
            },
            order: { sequence: "ASC" },
        });
    }
    async getForgedTransactionsIds(ids) {
        const transactions = await this.find({
            select: ["id"],
            where: {
                id: typeorm_1.In(ids),
            },
        });
        return transactions.map((t) => t.id);
    }
    async getStatistics() {
        return this.createQueryBuilder()
            .select([])
            .addSelect("COUNT(DISTINCT(id))", "count")
            .addSelect("COALESCE(SUM(fee), 0)", "totalFee")
            .addSelect("COALESCE(SUM(amount), 0)", "totalAmount")
            .getRawOne();
    }
    async getFeeStatistics(days, minFee) {
        minFee = minFee || 0;
        const age = crypto_1.Crypto.Slots.getTime(dayjs_1.default().subtract(days, "day").valueOf());
        return this.createQueryBuilder()
            .select(['type_group AS "typeGroup"', "type"])
            .addSelect("COALESCE(AVG(fee), 0)::int8", "avg")
            .addSelect("COALESCE(MIN(fee), 0)::int8", "min")
            .addSelect("COALESCE(MAX(fee), 0)::int8", "max")
            .addSelect("COALESCE(SUM(fee), 0)::int8", "sum")
            .where("timestamp >= :age AND fee >= :minFee", { age, minFee })
            .groupBy("type_group")
            .addGroupBy("type")
            .orderBy("type_group")
            .getRawMany();
    }
    async getSentTransactions() {
        return this.createQueryBuilder()
            .select([])
            .addSelect("sender_public_key", "senderPublicKey")
            .addSelect("SUM(amount)", "amount")
            .addSelect("SUM(fee)", "fee")
            .addSelect("COUNT(id)::int8", "nonce")
            .groupBy("sender_public_key")
            .getRawMany();
    }
    // TODO: stuff like this is only needed once during bootstrap
    // shouldnt be part of the repository
    async findReceivedTransactions() {
        return this.createQueryBuilder()
            .select([])
            .addSelect("recipient_id", "recipientId")
            .addSelect("SUM(amount)", "amount")
            .where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
            .andWhere(`type = ${crypto_1.Enums.TransactionType.Transfer}`)
            .groupBy("recipient_id")
            .getRawMany();
    }
    async findByType(type, typeGroup, limit, offset) {
        const transactions = await this.createQueryBuilder("transactions")
            .select()
            .addSelect('blocks.height as "blockHeight"')
            .addSelect('blocks.generatorPublicKey as "blockGeneratorPublicKey"')
            .addSelect('blocks.reward as "reward"')
            .addFrom(block_1.Block, "blocks")
            .where("block_id = blocks.id")
            .andWhere("type = :type", { type })
            .andWhere("type_group = :typeGroup", { typeGroup })
            .orderBy("transactions.timestamp", "ASC")
            .addOrderBy("transactions.sequence", "ASC")
            .skip(offset)
            .take(limit)
            .getRawMany();
        return transactions.map((transaction) => {
            return this.rawToEntity(transaction, 
            // @ts-ignore
            (entity, key, value) => {
                if (key === "reward") {
                    entity[key] = core_kernel_1.Utils.BigNumber.make(value);
                }
                else {
                    entity[key] = value;
                }
            });
        });
    }
    async findByHtlcLocks(lockIds) {
        return this.createQueryBuilder()
            .select()
            .where(new typeorm_1.Brackets((qb) => {
            qb.where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
                .andWhere(`type = ${crypto_1.Enums.TransactionType.HtlcClaim}`)
                .andWhere("asset->'claim'->>'lockTransactionId' IN (:...lockIds)", { lockIds });
        }))
            .orWhere(new typeorm_1.Brackets((qb) => {
            qb.where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
                .andWhere(`type = ${crypto_1.Enums.TransactionType.HtlcRefund}`)
                .andWhere("asset->'refund'->>'lockTransactionId' IN (:...lockIds)", { lockIds });
        }))
            .getMany();
    }
    async getOpenHtlcLocks() {
        return this.createQueryBuilder()
            .select()
            .where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
            .andWhere(`type = ${crypto_1.Enums.TransactionType.HtlcLock}`)
            .andWhere((qb) => {
            const claimedIdsSubQuery = qb
                .subQuery()
                .select("asset->'claim'->>'lockTransactionId'")
                .from(transaction_1.Transaction, "t")
                .where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
                .andWhere(`type = ${crypto_1.Enums.TransactionType.HtlcClaim}`);
            return `id NOT IN ${claimedIdsSubQuery.getQuery()}`;
        })
            .andWhere((qb) => {
            const refundedIdsSubQuery = qb
                .subQuery()
                .select("asset->'refund'->>'lockTransactionId'")
                .from(transaction_1.Transaction, "t")
                .where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
                .andWhere(`type = ${crypto_1.Enums.TransactionType.HtlcRefund}`);
            return `id NOT IN ${refundedIdsSubQuery.getQuery()}`;
        })
            .getMany();
    }
    async getClaimedHtlcLockBalances() {
        return this.createQueryBuilder()
            .select(`recipient_id AS "recipientId"`)
            .addSelect("SUM(amount)", "claimedBalance")
            .where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
            .andWhere(`type = ${crypto_1.Enums.TransactionType.HtlcLock}`)
            .andWhere((qb) => {
            const claimedLockIdsSubQuery = qb
                .subQuery()
                .select("asset->'claim'->>'lockTransactionId'")
                .from(transaction_1.Transaction, "t")
                .where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
                .andWhere(`type = ${crypto_1.Enums.TransactionType.HtlcClaim}`);
            return `id IN ${claimedLockIdsSubQuery.getQuery()}`;
        })
            .groupBy("recipient_id")
            .getRawMany();
    }
    async getRefundedHtlcLockBalances() {
        return this.createQueryBuilder()
            .select(`sender_public_key AS "senderPublicKey"`)
            .addSelect("SUM(amount)", "refundedBalance")
            .where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
            .andWhere(`type = ${crypto_1.Enums.TransactionType.HtlcLock}`)
            .andWhere((qb) => {
            const refundedLockIdsSubQuery = qb
                .subQuery()
                .select("asset->'refund'->>'lockTransactionId'")
                .from(transaction_1.Transaction, "t")
                .where(`type_group = ${crypto_1.Enums.TransactionTypeGroup.Core}`)
                .andWhere(`type = ${crypto_1.Enums.TransactionType.HtlcRefund}`);
            return `id IN ${refundedLockIdsSubQuery.getQuery()}`;
        })
            .groupBy("sender_public_key")
            .getRawMany();
    }
};
TransactionRepository = __decorate([
    typeorm_1.EntityRepository(transaction_1.Transaction)
], TransactionRepository);
exports.TransactionRepository = TransactionRepository;
//# sourceMappingURL=transaction-repository.js.map