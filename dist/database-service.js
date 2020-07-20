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
exports.DatabaseService = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const crypto_1 = require("@arkecosystem/crypto");
const assert_1 = __importDefault(require("assert"));
const typeorm_1 = require("typeorm");
const events_1 = require("./events");
const block_repository_1 = require("./repositories/block-repository");
const round_repository_1 = require("./repositories/round-repository");
const transaction_repository_1 = require("./repositories/transaction-repository");
// TODO: maybe we should introduce `BlockLike`, `TransactionLike`, `RoundLke` interfaces to remove the need to cast
let DatabaseService = class DatabaseService {
    constructor() {
        // TODO: make private readonly
        this.blocksInCurrentRound = undefined;
        // TODO: make private readonly
        this.restoredDatabaseIntegrity = false;
        // TODO: make private readonly
        this.forgingDelegates = undefined;
    }
    async initialize() {
        try {
            this.events.dispatch(core_kernel_1.Enums.StateEvent.Starting);
            const genesisBlockJson = crypto_1.Managers.configManager.get("genesisBlock");
            const blockTimeLookup = await core_kernel_1.Utils.forgingInfoCalculator.getBlockTimeLookup(this.app, genesisBlockJson.height);
            const genesisBlock = crypto_1.Blocks.BlockFactory.fromJson(genesisBlockJson, blockTimeLookup);
            this.stateStore.setGenesisBlock(genesisBlock);
            if (process.env.CORE_RESET_DATABASE) {
                await this.reset();
            }
            await this.initializeLastBlock();
            await this.loadBlocksFromCurrentRound();
        }
        catch (error) {
            this.logger.error(error.stack);
            this.app.terminate("Failed to initialize database service.", error);
        }
    }
    async disconnect() {
        this.logger.debug("Disconnecting from database");
        this.events.dispatch(events_1.DatabaseEvent.PRE_DISCONNECT);
        await this.connection.close();
        this.events.dispatch(events_1.DatabaseEvent.POST_DISCONNECT);
        this.logger.debug("Disconnected from database");
    }
    async restoreCurrentRound(height) {
        await this.initializeActiveDelegates(height);
        await this.applyRound(height);
    }
    async reset() {
        await this.connection.query("TRUNCATE TABLE blocks, rounds, transactions RESTART IDENTITY;");
        await this.createGenesisBlock();
    }
    // TODO: move out of core-database to get rid of BlockState dependency
    async applyBlock(block) {
        await this.blockState.applyBlock(block);
        if (this.blocksInCurrentRound) {
            this.blocksInCurrentRound.push(block);
        }
        await this.detectMissedBlocks(block);
        await this.applyRound(block.data.height);
        for (const transaction of block.transactions) {
            await this.emitTransactionEvents(transaction);
        }
        this.events.dispatch(core_kernel_1.Enums.BlockEvent.Applied, block.data);
    }
    // TODO: move out of core-database to get rid of WalletState dependency
    async applyRound(height) {
        // ! this doesn't make sense
        // ! next condition should be modified to include height === 1
        const nextHeight = height === 1 ? 1 : height + 1;
        if (core_kernel_1.Utils.roundCalculator.isNewRound(nextHeight)) {
            const roundInfo = core_kernel_1.Utils.roundCalculator.calculateRound(nextHeight);
            const { round } = roundInfo;
            if (nextHeight === 1 ||
                !this.forgingDelegates ||
                this.forgingDelegates.length === 0 ||
                this.forgingDelegates[0].getAttribute("delegate.round") !== round) {
                this.logger.info(`Starting Round ${roundInfo.round.toLocaleString()}`);
                try {
                    if (nextHeight > 1) {
                        this.detectMissedRound(this.forgingDelegates);
                    }
                    this.dposState.buildDelegateRanking();
                    this.dposState.setDelegatesRound(roundInfo);
                    await this.setForgingDelegatesOfRound(roundInfo, this.dposState.getRoundDelegates().slice());
                    await this.saveRound(this.dposState.getRoundDelegates());
                    // ! set it to empty array and why it can be undefined at all?
                    this.blocksInCurrentRound.length = 0;
                    this.events.dispatch(core_kernel_1.Enums.RoundEvent.Applied);
                }
                catch (error) {
                    // trying to leave database state has it was
                    // ! this.saveRound may not have been called
                    // ! try should be moved below await this.setForgingDelegatesOfRound
                    await this.deleteRound(round);
                    throw error;
                }
            }
            else {
                // ! then applyRound should not be called at all
                this.logger.warning(`Round ${round.toLocaleString()} has already been applied. This should happen only if you are a forger.`);
            }
        }
    }
    async getActiveDelegates(roundInfo, delegates) {
        if (!roundInfo) {
            // ! use this.stateStore.getLastBlock()
            const lastBlock = await this.getLastBlock();
            roundInfo = core_kernel_1.Utils.roundCalculator.calculateRound(lastBlock.data.height);
        }
        const { round } = roundInfo;
        if (this.forgingDelegates &&
            this.forgingDelegates.length &&
            this.forgingDelegates[0].getAttribute("delegate.round") === round) {
            return this.forgingDelegates;
        }
        // When called during applyRound we already know the delegates, so we don't have to query the database.
        if (!delegates) {
            delegates = (await this.roundRepository.getRound(round)).map(({ publicKey, balance }) => {
                // ! find wallet by public key and clone it
                const wallet = this.walletRepository.createWallet(crypto_1.Identities.Address.fromPublicKey(publicKey));
                wallet.publicKey = publicKey;
                wallet.setAttribute("delegate", {
                    voteBalance: crypto_1.Utils.BigNumber.make(balance),
                    username: this.walletRepository.findByPublicKey(publicKey).getAttribute("delegate.username", ""),
                });
                return wallet;
            });
        }
        for (const delegate of delegates) {
            // ! throw if delegate round doesn't match instead of altering argument
            delegate.setAttribute("delegate.round", round);
        }
        // ! extracting code below can simplify many call stacks and tests
        const seedSource = round.toString();
        let currentSeed = crypto_1.Crypto.HashAlgorithms.sha256(seedSource);
        delegates = delegates.map((delegate) => delegate.clone());
        for (let i = 0, delCount = delegates.length; i < delCount; i++) {
            for (let x = 0; x < 4 && i < delCount; i++, x++) {
                const newIndex = currentSeed[x] % delCount;
                const b = delegates[newIndex];
                delegates[newIndex] = delegates[i];
                delegates[i] = b;
            }
            currentSeed = crypto_1.Crypto.HashAlgorithms.sha256(currentSeed);
        }
        return delegates;
    }
    async getBlock(id) {
        // TODO: caching the last 1000 blocks, in combination with `saveBlock` could help to optimise
        const block = (await this.blockRepository.findOne(id));
        if (!block) {
            return undefined;
        }
        const transactions = await this.transactionRepository.find({ blockId: block.id });
        block.transactions = transactions.map(({ serialized, id }) => crypto_1.Transactions.TransactionFactory.fromBytesUnsafe(serialized, id).data);
        const blockTimeLookup = await core_kernel_1.Utils.forgingInfoCalculator.getBlockTimeLookup(this.app, block.height);
        return crypto_1.Blocks.BlockFactory.fromData(block, blockTimeLookup);
    }
    // ! three methods below (getBlocks, getBlocksForDownload, getBlocksByHeight) can be merged into one
    async getBlocks(offset, limit, headersOnly) {
        // The functions below return matches in the range [start, end], including both ends.
        const start = offset;
        const end = offset + limit - 1;
        let blocks = this.stateStore.getLastBlocksByHeight(start, end, headersOnly);
        if (blocks.length !== limit) {
            // ! assumes that earlier blocks may be missing
            // ! but querying database is unnecessary when later blocks are missing too (aren't forged yet)
            blocks = headersOnly
                ? await this.blockRepository.findByHeightRange(start, end)
                : await this.blockRepository.findByHeightRangeWithTransactions(start, end);
        }
        return blocks;
    }
    // TODO: move to block repository
    async getBlocksForDownload(offset, limit, headersOnly) {
        // ! method is identical to getBlocks, but skips faster stateStore.getLastBlocksByHeight
        if (headersOnly) {
            return this.blockRepository.findByHeightRange(offset, offset + limit - 1);
        }
        // TODO: fix types
        return this.blockRepository.findByHeightRangeWithTransactions(offset, offset + limit - 1);
    }
    /**
     * Get the blocks at the given heights.
     * The transactions for those blocks will not be loaded like in `getBlocks()`.
     * @param {Array} heights array of arbitrary block heights
     * @return {Array} array for the corresponding blocks. The element (block) at index `i`
     * in the resulting array corresponds to the requested height at index `i` in the input
     * array heights[]. For example, if
     * heights[0] = 100
     * heights[1] = 200
     * heights[2] = 150
     * then the result array will have the same number of elements (3) and will be:
     * result[0] = block at height 100
     * result[1] = block at height 200
     * result[2] = block at height 150
     * If some of the requested blocks do not exist in our chain (requested height is larger than
     * the height of our blockchain), then that element will be `undefined` in the resulting array
     * @throws Error
     */
    async getBlocksByHeight(heights) {
        // TODO: add type
        const blocks = [];
        // Map of height -> index in heights[], e.g. if
        // heights[5] == 6000000, then
        // toGetFromDB[6000000] == 5
        // In this map we only store a subset of the heights - the ones we could not retrieve
        // from app/state and need to get from the database.
        const toGetFromDB = {};
        for (const [i, height] of heights.entries()) {
            const stateBlocks = this.stateStore.getLastBlocksByHeight(height, height, true);
            if (Array.isArray(stateBlocks) && stateBlocks.length > 0) {
                blocks[i] = stateBlocks[0];
            }
            if (blocks[i] === undefined) {
                toGetFromDB[height] = i;
            }
        }
        const heightsToGetFromDB = Object.keys(toGetFromDB).map((height) => +height);
        if (heightsToGetFromDB.length > 0) {
            const blocksByHeights = await this.blockRepository.findByHeights(heightsToGetFromDB);
            for (const blockFromDB of blocksByHeights) {
                const index = toGetFromDB[blockFromDB.height];
                blocks[index] = blockFromDB;
            }
        }
        return blocks;
    }
    async getBlocksForRound(roundInfo) {
        // ! it should check roundInfo before assuming that lastBlock is what's have to be returned
        let lastBlock = this.stateStore.getLastBlock();
        if (!lastBlock) {
            lastBlock = await this.getLastBlock();
        }
        if (!lastBlock) {
            return [];
        }
        else if (lastBlock.data.height === 1) {
            return [lastBlock];
        }
        if (!roundInfo) {
            roundInfo = core_kernel_1.Utils.roundCalculator.calculateRound(lastBlock.data.height);
        }
        // ? number of blocks in round may not equal roundInfo.maxDelegates
        // ? see round-calculator.ts handling milestone change
        const blocks = await this.getBlocks(roundInfo.roundHeight, roundInfo.maxDelegates);
        const builtBlockPromises = blocks.map(async (block) => {
            if (block.height === 1) {
                return this.stateStore.getGenesisBlock();
            }
            const blockTimeLookup = await core_kernel_1.Utils.forgingInfoCalculator.getBlockTimeLookup(this.app, block.height);
            return crypto_1.Blocks.BlockFactory.fromData(block, blockTimeLookup, { deserializeTransactionsUnchecked: true });
        });
        return Promise.all(builtBlockPromises);
    }
    async getLastBlock() {
        const block = await this.blockRepository.findLatest();
        if (!block) {
            // @ts-ignore Technically, this cannot happen
            // ! but this is public method so it can happen
            return undefined;
        }
        const blockTimeLookup = await core_kernel_1.Utils.forgingInfoCalculator.getBlockTimeLookup(this.app, block.height);
        const transactions = await this.transactionRepository.findByBlockIds([block.id]);
        block.transactions = transactions.map(({ serialized, id }) => crypto_1.Transactions.TransactionFactory.fromBytesUnsafe(serialized, id).data);
        const lastBlock = crypto_1.Blocks.BlockFactory.fromData(block, blockTimeLookup);
        return lastBlock;
    }
    async getCommonBlocks(ids) {
        let commonBlocks = this.stateStore.getCommonBlocks(ids);
        if (commonBlocks.length < ids.length) {
            // ! do not query blocks that were found
            // ! why method is called commonBlocks, but is just findByIds?
            commonBlocks = (await this.blockRepository.findByIds(ids));
        }
        return commonBlocks;
    }
    async getRecentBlockIds() {
        // ! why getLastBlockIds returns blocks and not ids?
        let blocks = this.stateStore.getLastBlockIds().reverse().slice(0, 10);
        if (blocks.length < 10) {
            // ! blockRepository.findRecent returns objects containing single id property in reverse order
            // ! where recent block id is first in array
            blocks = await this.blockRepository.findRecent(10);
        }
        return blocks.map((block) => block.id);
    }
    async getTopBlocks(count) {
        // ! blockRepository.findTop returns blocks in reverse order
        // ! where recent block is first in array
        const blocks = (await this.blockRepository.findTop(count));
        await this.loadTransactionsForBlocks(blocks);
        return blocks;
    }
    async getTransaction(id) {
        return this.transactionRepository.findOne(id);
    }
    async loadBlocksFromCurrentRound() {
        // ! this should not be public, this.blocksInCurrentRound is used by DatabaseService only
        this.blocksInCurrentRound = await this.getBlocksForRound();
    }
    async revertBlock(block) {
        await this.revertRound(block.data.height);
        await this.blockState.revertBlock(block);
        // ! blockState is already reverted if this check fails
        assert_1.default(this.blocksInCurrentRound.pop().data.id === block.data.id);
        for (let i = block.transactions.length - 1; i >= 0; i--) {
            this.events.dispatch(core_kernel_1.Enums.TransactionEvent.Reverted, block.transactions[i].data);
        }
        this.events.dispatch(core_kernel_1.Enums.BlockEvent.Reverted, block.data);
    }
    async revertRound(height) {
        const roundInfo = core_kernel_1.Utils.roundCalculator.calculateRound(height);
        const { round, nextRound, maxDelegates } = roundInfo;
        // ! height >= maxDelegates is always true
        if (nextRound === round + 1 && height >= maxDelegates) {
            this.logger.info(`Back to previous round: ${round.toLocaleString()}`);
            this.blocksInCurrentRound = await this.getBlocksForRound(roundInfo);
            await this.setForgingDelegatesOfRound(roundInfo, await this.calcPreviousActiveDelegates(roundInfo, this.blocksInCurrentRound));
            // ! this will only delete one round
            await this.deleteRound(nextRound);
        }
    }
    async saveRound(activeDelegates) {
        this.logger.info(`Saving round ${activeDelegates[0].getAttribute("delegate.round").toLocaleString()}`);
        await this.roundRepository.save(activeDelegates);
        this.events.dispatch(core_kernel_1.Enums.RoundEvent.Created, activeDelegates);
    }
    async deleteRound(round) {
        await this.roundRepository.delete({ round });
    }
    async verifyBlockchain() {
        const errors = [];
        const lastBlock = this.stateStore.getLastBlock();
        // Last block is available
        if (!lastBlock) {
            errors.push("Last block is not available");
        }
        else {
            // ! can be checked using blockStats.count instead
            const numberOfBlocks = await this.blockRepository.count();
            // Last block height equals the number of stored blocks
            if (lastBlock.data.height !== +numberOfBlocks) {
                errors.push(`Last block height: ${lastBlock.data.height.toLocaleString()}, number of stored blocks: ${numberOfBlocks}`);
            }
        }
        const blockStats = await this.blockRepository.getStatistics();
        const transactionStats = await this.transactionRepository.getStatistics();
        // Number of stored transactions equals the sum of block.numberOfTransactions in the database
        if (blockStats.numberOfTransactions !== transactionStats.count) {
            errors.push(`Number of transactions: ${transactionStats.count}, number of transactions included in blocks: ${blockStats.numberOfTransactions}`);
        }
        // Sum of all tx fees equals the sum of block.totalFee
        if (blockStats.totalFee !== transactionStats.totalFee) {
            errors.push(`Total transaction fees: ${transactionStats.totalFee}, total of block.totalFee : ${blockStats.totalFee}`);
        }
        // Sum of all tx amount equals the sum of block.totalAmount
        if (blockStats.totalAmount !== transactionStats.totalAmount) {
            errors.push(`Total transaction amounts: ${transactionStats.totalAmount}, total of block.totalAmount : ${blockStats.totalAmount}`);
        }
        const hasErrors = errors.length > 0;
        if (hasErrors) {
            this.logger.error("FATAL: The database is corrupted");
            this.logger.error(JSON.stringify(errors, undefined, 4));
        }
        return !hasErrors;
    }
    async detectMissedBlocks(block) {
        const lastBlock = this.stateStore.getLastBlock();
        if (lastBlock.data.height === 1) {
            return;
        }
        const blockTimeLookup = await core_kernel_1.Utils.forgingInfoCalculator.getBlockTimeLookup(this.app, lastBlock.data.height);
        const lastSlot = crypto_1.Crypto.Slots.getSlotNumber(blockTimeLookup, lastBlock.data.timestamp);
        const currentSlot = crypto_1.Crypto.Slots.getSlotNumber(blockTimeLookup, block.data.timestamp);
        const missedSlots = Math.min(currentSlot - lastSlot - 1, this.forgingDelegates.length);
        for (let i = 0; i < missedSlots; i++) {
            const missedSlot = lastSlot + i + 1;
            const delegate = this.forgingDelegates[missedSlot % this.forgingDelegates.length];
            this.logger.debug(`Delegate ${delegate.getAttribute("delegate.username")} (${delegate.publicKey}) just missed a block.`);
            this.events.dispatch(core_kernel_1.Enums.ForgerEvent.Missing, {
                delegate,
            });
        }
    }
    async initializeLastBlock() {
        // ? attempt to remove potentially corrupt blocks from database
        let lastBlock;
        let tries = 5; // ! actually 6, but only 5 will be removed
        // Ensure the config manager is initialized, before attempting to call `fromData`
        // which otherwise uses potentially wrong milestones.
        let lastHeight = 1;
        const latest = await this.blockRepository.findLatest();
        if (latest) {
            lastHeight = latest.height;
        }
        crypto_1.Managers.configManager.setHeight(lastHeight);
        const getLastBlock = async () => {
            try {
                return await this.getLastBlock();
            }
            catch (error) {
                this.logger.error(error.message);
                if (tries > 0) {
                    const block = (await this.blockRepository.findLatest());
                    await this.blockRepository.deleteBlocks([block]);
                    tries--;
                }
                else {
                    this.app.terminate("Unable to deserialize last block from database.", error);
                    throw new Error("Terminated (unreachable)");
                }
                return getLastBlock();
            }
        };
        lastBlock = await getLastBlock();
        if (!lastBlock) {
            this.logger.warning("No block found in database");
            lastBlock = await this.createGenesisBlock();
        }
        this.configureState(lastBlock);
    }
    async loadTransactionsForBlocks(blocks) {
        const dbTransactions = await this.getTransactionsForBlocks(blocks);
        const transactions = dbTransactions.map((tx) => {
            const { data } = crypto_1.Transactions.TransactionFactory.fromBytesUnsafe(tx.serialized, tx.id);
            data.blockId = tx.blockId;
            return data;
        });
        for (const block of blocks) {
            if (block.numberOfTransactions > 0) {
                block.transactions = transactions.filter((transaction) => transaction.blockId === block.id);
            }
        }
    }
    async getTransactionsForBlocks(blocks) {
        if (!blocks.length) {
            return [];
        }
        const ids = blocks.map((block) => block.id);
        return this.transactionRepository.findByBlockIds(ids);
    }
    async createGenesisBlock() {
        const genesisBlock = this.stateStore.getGenesisBlock();
        await this.blockRepository.saveBlocks([genesisBlock]);
        return genesisBlock;
    }
    configureState(lastBlock) {
        this.stateStore.setLastBlock(lastBlock);
        const { blocktime, block } = crypto_1.Managers.configManager.getMilestone();
        const blocksPerDay = Math.ceil(86400 / blocktime);
        this.stateBlockStore.resize(blocksPerDay);
        this.stateTransactionStore.resize(blocksPerDay * block.maxTransactions);
    }
    detectMissedRound(delegates) {
        if (!delegates || !this.blocksInCurrentRound) {
            // ! this.blocksInCurrentRound is impossible
            // ! otherwise this.blocksInCurrentRound!.length = 0 in applyRound will throw
            return;
        }
        if (this.blocksInCurrentRound.length === 1 && this.blocksInCurrentRound[0].data.height === 1) {
            // ? why skip missed round checks when first round has genesis block only?
            return;
        }
        for (const delegate of delegates) {
            // ! use .some() instead of .fitler()
            const producedBlocks = this.blocksInCurrentRound.filter((blockGenerator) => blockGenerator.data.generatorPublicKey === delegate.publicKey);
            if (producedBlocks.length === 0) {
                const wallet = this.walletRepository.findByPublicKey(delegate.publicKey);
                this.logger.debug(`Delegate ${wallet.getAttribute("delegate.username")} (${wallet.publicKey}) just missed a round.`);
                this.events.dispatch(core_kernel_1.Enums.RoundEvent.Missed, {
                    delegate: wallet,
                });
            }
        }
    }
    async initializeActiveDelegates(height) {
        // ! may be set to undefined to early if error is raised
        this.forgingDelegates = undefined;
        const roundInfo = core_kernel_1.Utils.roundCalculator.calculateRound(height);
        await this.setForgingDelegatesOfRound(roundInfo);
    }
    async setForgingDelegatesOfRound(roundInfo, delegates) {
        // ! it's this.getActiveDelegates(roundInfo, delegates);
        // ! only last part of that function which reshuffles delegates is used
        const result = await this.triggers.call("getActiveDelegates", { roundInfo, delegates });
        this.forgingDelegates = result;
    }
    async calcPreviousActiveDelegates(roundInfo, blocks) {
        // ! make blocks required parameter forcing caller to specify blocks explicitly
        blocks = blocks || (await this.getBlocksForRound(roundInfo));
        const prevRoundState = await this.getDposPreviousRoundState(blocks, roundInfo);
        for (const prevRoundDelegateWallet of prevRoundState.getAllDelegates()) {
            // ! name suggest that this is pure function
            // ! when in fact it is manipulating current wallet repository setting delegate ranks
            const username = prevRoundDelegateWallet.getAttribute("delegate.username");
            const delegateWallet = this.walletRepository.findByUsername(username);
            delegateWallet.setAttribute("delegate.rank", prevRoundDelegateWallet.getAttribute("delegate.rank"));
        }
        // ! return readonly array instead of taking slice
        return prevRoundState.getRoundDelegates().slice();
    }
    async emitTransactionEvents(transaction) {
        this.events.dispatch(core_kernel_1.Enums.TransactionEvent.Applied, transaction.data);
        const handler = await this.handlerRegistry.getActivatedHandlerForData(transaction.data);
        // ! no reason to pass this.emitter
        handler.emitEvents(transaction, this.events);
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.Application),
    __metadata("design:type", Object)
], DatabaseService.prototype, "app", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseConnection),
    __metadata("design:type", typeorm_1.Connection)
], DatabaseService.prototype, "connection", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseBlockRepository),
    __metadata("design:type", block_repository_1.BlockRepository)
], DatabaseService.prototype, "blockRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseTransactionRepository),
    __metadata("design:type", transaction_repository_1.TransactionRepository)
], DatabaseService.prototype, "transactionRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DatabaseRoundRepository),
    __metadata("design:type", round_repository_1.RoundRepository)
], DatabaseService.prototype, "roundRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.StateStore),
    __metadata("design:type", Object)
], DatabaseService.prototype, "stateStore", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.StateBlockStore),
    __metadata("design:type", Object)
], DatabaseService.prototype, "stateBlockStore", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.StateTransactionStore),
    __metadata("design:type", Object)
], DatabaseService.prototype, "stateTransactionStore", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.TransactionHandlerRegistry),
    core_kernel_1.Container.tagged("state", "blockchain"),
    __metadata("design:type", Object)
], DatabaseService.prototype, "handlerRegistry", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.WalletRepository),
    core_kernel_1.Container.tagged("state", "blockchain"),
    __metadata("design:type", Object)
], DatabaseService.prototype, "walletRepository", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.BlockState),
    core_kernel_1.Container.tagged("state", "blockchain"),
    __metadata("design:type", Object)
], DatabaseService.prototype, "blockState", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DposState),
    core_kernel_1.Container.tagged("state", "blockchain"),
    __metadata("design:type", Object)
], DatabaseService.prototype, "dposState", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.DposPreviousRoundStateProvider),
    __metadata("design:type", Function)
], DatabaseService.prototype, "getDposPreviousRoundState", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.TriggerService),
    __metadata("design:type", core_kernel_1.Services.Triggers.Triggers)
], DatabaseService.prototype, "triggers", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.LogService),
    __metadata("design:type", Object)
], DatabaseService.prototype, "logger", void 0);
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.EventDispatcherService),
    __metadata("design:type", Object)
], DatabaseService.prototype, "events", void 0);
DatabaseService = __decorate([
    core_kernel_1.Container.injectable()
], DatabaseService);
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database-service.js.map