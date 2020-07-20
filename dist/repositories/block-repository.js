"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockRepository = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const typeorm_1 = require("typeorm");
const models_1 = require("../models");
const abstract_repository_1 = require("./abstract-repository");
let BlockRepository = class BlockRepository extends abstract_repository_1.AbstractRepository {
    async findLatest() {
        return this.findOne({
            order: { height: "DESC" },
        }); // TODO: refactor
    }
    async findRecent(limit) {
        return this.find({
            select: ["id"],
            order: {
                timestamp: "DESC",
            },
            take: limit,
        });
    }
    async findTop(limit) {
        return this.find({
            order: {
                height: "DESC",
            },
            take: limit,
        });
    }
    async findByHeight(height) {
        return this.findOne({
            where: { height },
        });
    }
    async findByHeights(heights) {
        return this.find({
            where: { height: typeorm_1.In(heights) },
        });
    }
    async findByHeightRange(start, end) {
        return this.createQueryBuilder()
            .where("height BETWEEN :start AND :end", { start, end })
            .orderBy("height")
            .getMany();
    }
    async findByHeightRangeWithTransactions(start, end) {
        const [query, parameters] = this.manager.connection.driver.escapeQueryWithParameters(`
                SELECT *,
                    ARRAY
                        (SELECT serialized
                        FROM transactions
                        WHERE transactions.block_id = blocks.id
                        ORDER BY transactions.sequence ASC
                    ) AS transactions
                FROM blocks
                WHERE height
                    BETWEEN :start AND :end
                ORDER BY height ASC
            `, { start, end }, {});
        const blocks = await this.query(query, parameters);
        return blocks.map((block) => {
            return this.rawToEntity(block, 
            // @ts-ignore
            (entity, _, value) => {
                if (value && value.length) {
                    entity.transactions = value.map((buffer) => buffer.toString("hex"));
                }
                else {
                    entity.transactions = [];
                }
            });
        });
    }
    async getStatistics() {
        return this.createQueryBuilder()
            .select([])
            .addSelect("COALESCE(SUM(number_of_transactions), 0)", "numberOfTransactions")
            .addSelect("COALESCE(SUM(total_fee), 0)", "totalFee")
            .addSelect("COALESCE(SUM(total_amount), 0)", "totalAmount")
            .addSelect("COUNT(DISTINCT(height))", "count")
            .getRawOne();
    }
    async getBlockRewards() {
        return this.createQueryBuilder()
            .select([])
            .addSelect("generator_public_key", "generatorPublicKey")
            .addSelect("SUM(reward + total_fee)", "rewards")
            .groupBy("generator_public_key")
            .getRawMany();
    }
    async getDelegatesForgedBlocks() {
        return this.createQueryBuilder()
            .select([])
            .addSelect("generator_public_key", "generatorPublicKey")
            .addSelect("SUM(total_fee)", "totalFees")
            .addSelect("SUM(reward)", "totalRewards")
            .addSelect("COUNT(total_amount)", "totalProduced")
            .groupBy("generator_public_key")
            .getRawMany();
    }
    async getLastForgedBlocks() {
        return this.query(`SELECT id,
                        height,
                        generator_public_key AS "generatorPublicKey",
                        TIMESTAMP
                FROM blocks
                WHERE height IN (
                SELECT MAX(height) AS last_block_height
                FROM blocks
                GROUP BY generator_public_key
                )
                ORDER BY TIMESTAMP DESC
        `);
        // TODO: subquery
        // return this.createQueryBuilder()
        //     .select(["id", "height", "timestamp"])
        //     .addSelect("generator_public_key", "generatorPublicKey")
        //     .groupBy("generator_public_key")
        //     .orderBy("timestamp", "DESC")
        //     .getRawMany();
    }
    async saveBlocks(blocks) {
        return this.manager.transaction(async (manager) => {
            const blockEntities = [];
            const transactionEntities = [];
            for (const block of blocks) {
                const blockEntity = Object.assign(new models_1.Block(), {
                    ...block.data,
                });
                if (block.transactions.length > 0) {
                    const transactions = block.transactions.map((tx) => Object.assign(new models_1.Transaction(), {
                        ...tx.data,
                        timestamp: tx.timestamp,
                        serialized: tx.serialized,
                    }));
                    transactionEntities.push(...transactions);
                }
                blockEntities.push(blockEntity);
            }
            await manager.save(blockEntities);
            await manager.save(transactionEntities);
        });
    }
    async deleteBlocks(blocks) {
        const continuousChunk = blocks.every((block, i, arr) => {
            return i === 0 ? true : block.height - arr[i - 1].height === 1;
        });
        if (!continuousChunk) {
            throw new Error("Blocks chunk to delete isn't continuous");
        }
        return this.manager.transaction(async (manager) => {
            const lastBlockHeight = blocks[blocks.length - 1].height;
            const targetBlockHeight = blocks[0].height - 1;
            const roundInfo = core_kernel_1.Utils.roundCalculator.calculateRound(targetBlockHeight);
            const targetRound = roundInfo.round;
            const blockIds = blocks.map((b) => b.id);
            const afterLastBlockCount = await manager
                .createQueryBuilder()
                .select()
                .from(models_1.Block, "blocks")
                .where("blocks.height > :lastBlockHeight", { lastBlockHeight })
                .getCount();
            if (afterLastBlockCount !== 0) {
                throw new Error("Removing blocks from the middle");
            }
            await manager
                .createQueryBuilder()
                .delete()
                .from(models_1.Transaction)
                .where("block_id IN (:...blockIds)", { blockIds })
                .execute();
            const deleteBlocksResult = await manager
                .createQueryBuilder()
                .delete()
                .from(models_1.Block)
                .where("id IN (:...blockIds)", { blockIds })
                .execute();
            if (deleteBlocksResult.affected !== blockIds.length) {
                throw new Error("Failed to delete all blocks from database");
            }
            await manager
                .createQueryBuilder()
                .delete()
                .from(models_1.Round)
                .where("round > :targetRound", { targetRound })
                .execute();
        });
    }
    async deleteTopBlocks(count) {
        await this.manager.transaction(async (manager) => {
            const maxHeightRow = await manager
                .createQueryBuilder()
                .select("MAX(height) AS max_height")
                .from(models_1.Block, "blocks")
                .getRawOne();
            const targetHeight = maxHeightRow["max_height"] - count;
            const roundInfo = core_kernel_1.Utils.roundCalculator.calculateRound(targetHeight);
            const targetRound = roundInfo.round;
            const blockIdRows = await manager
                .createQueryBuilder()
                .select(["id"])
                .from(models_1.Block, "blocks")
                .where("height > :targetHeight", { targetHeight })
                .getRawMany();
            const blockIds = blockIdRows.map((row) => row["id"]);
            if (blockIds.length !== count) {
                throw new Error("Corrupt database");
            }
            await manager
                .createQueryBuilder()
                .delete()
                .from(models_1.Transaction)
                .where("block_id IN (:...blockIds)", { blockIds })
                .execute();
            await manager
                .createQueryBuilder()
                .delete()
                .from(models_1.Block)
                .where("id IN (:...blockIds)", { blockIds })
                .execute();
            await manager
                .createQueryBuilder()
                .delete()
                .from(models_1.Round)
                .where("round > :targetRound", { targetRound })
                .execute();
        });
    }
};
BlockRepository = __decorate([
    typeorm_1.EntityRepository(models_1.Block)
], BlockRepository);
exports.BlockRepository = BlockRepository;
//# sourceMappingURL=block-repository.js.map