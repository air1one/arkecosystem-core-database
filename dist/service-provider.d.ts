import { Providers } from "@arkecosystem/core-kernel";
import { Connection } from "typeorm";
import { BlockRepository, RoundRepository, TransactionRepository } from "./repositories";
export declare class ServiceProvider extends Providers.ServiceProvider {
    register(): Promise<void>;
    boot(): Promise<void>;
    dispose(): Promise<void>;
    required(): Promise<boolean>;
    connect(): Promise<Connection>;
    getRoundRepository(): RoundRepository;
    getBlockRepository(): BlockRepository;
    getTransactionRepository(): TransactionRepository;
    private registerActions;
}
