import { Contracts } from "@arkecosystem/core-kernel";
import { Block } from "./models/block";
export declare class BlockFilter implements Contracts.Database.BlockFilter {
    getExpression(...criteria: Contracts.Shared.OrBlockCriteria[]): Promise<Contracts.Search.Expression<Block>>;
    private handleBlockCriteria;
}
