"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWalletsTable20180305100000 = void 0;
class CreateWalletsTable20180305100000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE wallets (
                "address" VARCHAR(36) PRIMARY KEY NOT NULL,
                "public_key" VARCHAR(66) UNIQUE NOT NULL,
                "second_public_key" VARCHAR(66) UNIQUE,
                "vote" VARCHAR(66),
                "username" VARCHAR(64) UNIQUE,
                "balance" BIGINT NOT NULL,
                "vote_balance" BIGINT NOT NULL,
                "produced_blocks" BIGINT NOT NULL,
                "missed_blocks" BIGINT NOT NULL
            );

            CREATE UNIQUE INDEX "wallets_votes_unique" ON wallets ("public_key", "vote");
        `);
    }
    async down(queryRunner) {
        await queryRunner.dropTable("wallets");
    }
}
exports.CreateWalletsTable20180305100000 = CreateWalletsTable20180305100000;
//# sourceMappingURL=20180305100000-create-wallets-table.js.map