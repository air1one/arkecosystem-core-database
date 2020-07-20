"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProvider = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const typeorm_1 = require("typeorm");
const actions_1 = require("./actions");
const block_filter_1 = require("./block-filter");
const block_history_service_1 = require("./block-history-service");
const database_service_1 = require("./database-service");
const events_1 = require("./events");
const model_converter_1 = require("./model-converter");
const repositories_1 = require("./repositories");
const transaction_filter_1 = require("./transaction-filter");
const transaction_history_service_1 = require("./transaction-history-service");
const snake_naming_strategy_1 = require("./utils/snake-naming-strategy");
class ServiceProvider extends core_kernel_1.Providers.ServiceProvider {
    async register() {
        const logger = this.app.get(core_kernel_1.Container.Identifiers.LogService);
        logger.info("Connecting to database: " + this.config().all().connection.database);
        this.app.bind(core_kernel_1.Container.Identifiers.DatabaseConnection).toConstantValue(await this.connect());
        logger.debug("Connection established.");
        this.app.bind(core_kernel_1.Container.Identifiers.DatabaseRoundRepository).toConstantValue(this.getRoundRepository());
        this.app.bind(core_kernel_1.Container.Identifiers.DatabaseBlockRepository).toConstantValue(this.getBlockRepository());
        this.app.bind(core_kernel_1.Container.Identifiers.DatabaseBlockFilter).to(block_filter_1.BlockFilter);
        this.app.bind(core_kernel_1.Container.Identifiers.BlockHistoryService).to(block_history_service_1.BlockHistoryService);
        this.app
            .bind(core_kernel_1.Container.Identifiers.DatabaseTransactionRepository)
            .toConstantValue(this.getTransactionRepository());
        this.app.bind(core_kernel_1.Container.Identifiers.DatabaseTransactionFilter).to(transaction_filter_1.TransactionFilter);
        this.app.bind(core_kernel_1.Container.Identifiers.TransactionHistoryService).to(transaction_history_service_1.TransactionHistoryService);
        this.app.bind(core_kernel_1.Container.Identifiers.DatabaseModelConverter).to(model_converter_1.ModelConverter);
        this.app.bind(core_kernel_1.Container.Identifiers.DatabaseService).to(database_service_1.DatabaseService).inSingletonScope();
        this.registerActions();
    }
    async boot() {
        await this.app.get(core_kernel_1.Container.Identifiers.DatabaseService).initialize();
    }
    async dispose() {
        await this.app.get(core_kernel_1.Container.Identifiers.DatabaseService).disconnect();
    }
    async required() {
        return true;
    }
    async connect() {
        const connection = this.config().all().connection;
        this.app
            .get(core_kernel_1.Container.Identifiers.EventDispatcherService)
            .dispatch(events_1.DatabaseEvent.PRE_CONNECT);
        if (this.app.isBound(core_kernel_1.Container.Identifiers.DatabaseLogger)) {
            connection.logging = "all";
            connection.logger = this.app.get(core_kernel_1.Container.Identifiers.DatabaseLogger);
        }
        return typeorm_1.createConnection({
            ...connection,
            namingStrategy: new snake_naming_strategy_1.SnakeNamingStrategy(),
            migrations: [__dirname + "/migrations/*.js"],
            migrationsRun: true,
            // TODO: expose entities to allow extending the models by plugins
            entities: [__dirname + "/models/*.js"],
        });
    }
    getRoundRepository() {
        return typeorm_1.getCustomRepository(repositories_1.RoundRepository);
    }
    getBlockRepository() {
        return typeorm_1.getCustomRepository(repositories_1.BlockRepository);
    }
    getTransactionRepository() {
        return typeorm_1.getCustomRepository(repositories_1.TransactionRepository);
    }
    registerActions() {
        this.app
            .get(core_kernel_1.Container.Identifiers.TriggerService)
            .bind("getActiveDelegates", new actions_1.GetActiveDelegatesAction(this.app));
    }
}
exports.ServiceProvider = ServiceProvider;
//# sourceMappingURL=service-provider.js.map