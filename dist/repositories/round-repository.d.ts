import { Contracts } from "@arkecosystem/core-kernel";
import { Repository } from "typeorm";
import { Round } from "../models";
export declare class RoundRepository extends Repository<Round> {
    findById(id: string): Promise<Round[]>;
    getRound(round: number): Promise<Round[]>;
    save(delegates: readonly Contracts.State.Wallet[]): Promise<never>;
}
