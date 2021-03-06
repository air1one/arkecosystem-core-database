import { Contracts } from "@arkecosystem/core-kernel";
import { Interfaces } from "@arkecosystem/crypto";
export declare class DatabaseService {
    private readonly app;
    private readonly connection;
    private readonly blockRepository;
    private readonly transactionRepository;
    private readonly roundRepository;
    private readonly stateStore;
    private readonly stateBlockStore;
    private readonly stateTransactionStore;
    private readonly handlerRegistry;
    private readonly walletRepository;
    private readonly blockState;
    private readonly dposState;
    private readonly getDposPreviousRoundState;
    private readonly triggers;
    private readonly logger;
    private readonly events;
    blocksInCurrentRound: Interfaces.IBlock[] | undefined;
    restoredDatabaseIntegrity: boolean;
    forgingDelegates: Contracts.State.Wallet[] | undefined;
    initialize(): Promise<void>;
    disconnect(): Promise<void>;
    restoreCurrentRound(height: number): Promise<void>;
    reset(): Promise<void>;
    applyBlock(block: Interfaces.IBlock): Promise<void>;
    applyRound(height: number): Promise<void>;
    getActiveDelegates(roundInfo?: Contracts.Shared.RoundInfo, delegates?: Contracts.State.Wallet[]): Promise<Contracts.State.Wallet[]>;
    getBlock(id: string): Promise<Interfaces.IBlock | undefined>;
    getBlocks(offset: number, limit: number, headersOnly?: boolean): Promise<Interfaces.IBlockData[]>;
    getBlocksForDownload(offset: number, limit: number, headersOnly?: boolean): Promise<Contracts.Shared.DownloadBlock[]>;
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
    getBlocksByHeight(heights: number[]): Promise<Interfaces.IBlockData[]>;
    getBlocksForRound(roundInfo?: Contracts.Shared.RoundInfo): Promise<Interfaces.IBlock[]>;
    getLastBlock(): Promise<Interfaces.IBlock>;
    getCommonBlocks(ids: string[]): Promise<Interfaces.IBlockData[]>;
    getRecentBlockIds(): Promise<string[]>;
    getTopBlocks(count: number): Promise<Interfaces.IBlockData[]>;
    getTransaction(id: string): Promise<import("./models").Transaction | undefined>;
    loadBlocksFromCurrentRound(): Promise<void>;
    revertBlock(block: Interfaces.IBlock): Promise<void>;
    revertRound(height: number): Promise<void>;
    saveRound(activeDelegates: readonly Contracts.State.Wallet[]): Promise<void>;
    deleteRound(round: number): Promise<void>;
    verifyBlockchain(): Promise<boolean>;
    private detectMissedBlocks;
    private initializeLastBlock;
    private loadTransactionsForBlocks;
    private getTransactionsForBlocks;
    private createGenesisBlock;
    private configureState;
    private detectMissedRound;
    private initializeActiveDelegates;
    private setForgingDelegatesOfRound;
    private calcPreviousActiveDelegates;
    private emitTransactionEvents;
}
