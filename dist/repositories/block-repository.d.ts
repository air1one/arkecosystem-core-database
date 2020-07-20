import { Interfaces } from "@arkecosystem/crypto";
import { Block } from "../models";
import { AbstractRepository } from "./abstract-repository";
export declare class BlockRepository extends AbstractRepository<Block> {
    findLatest(): Promise<Interfaces.IBlockData | undefined>;
    findRecent(limit: number): Promise<{
        id: string;
    }[]>;
    findTop(limit: number): Promise<Block[]>;
    findByHeight(height: number): Promise<Block | undefined>;
    findByHeights(heights: number[]): Promise<Block[]>;
    findByHeightRange(start: number, end: number): Promise<Block[]>;
    findByHeightRangeWithTransactions(start: number, end: number): Promise<Interfaces.IBlockData[]>;
    getStatistics(): Promise<{
        numberOfTransactions: number;
        totalFee: string;
        totalAmount: string;
        count: number;
    }>;
    getBlockRewards(): Promise<{
        generatorPublicKey: string;
        rewards: string;
    }[]>;
    getDelegatesForgedBlocks(): Promise<{
        generatorPublicKey: string;
        totalRewards: string;
        totalFees: string;
        totalProduced: number;
    }[]>;
    getLastForgedBlocks(): Promise<{
        id: string;
        height: string;
        generatorPublicKey: string;
        timestamp: number;
    }[]>;
    saveBlocks(blocks: Interfaces.IBlock[]): Promise<void>;
    deleteBlocks(blocks: Interfaces.IBlockData[]): Promise<void>;
    deleteTopBlocks(count: number): Promise<void>;
}
