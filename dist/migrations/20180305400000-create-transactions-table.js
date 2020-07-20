"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionsTable20180305400000 = void 0;
class CreateTransactionsTable20180305400000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE transactions (
                "id" VARCHAR(64) PRIMARY KEY,
                "version" SMALLINT NOT NULL,
                "block_id" VARCHAR(64) NOT NULL,
                "sequence" SMALLINT NOT NULL,
                "timestamp" INTEGER NOT NULL,
                "sender_public_key" VARCHAR(66) NOT NULL,
                "recipient_id" VARCHAR(36),
                "type" SMALLINT NOT NULL,
                "vendor_field_hex" bytea,
                "amount" BIGINT NOT NULL,
                "fee" BIGINT NOT NULL,
                "serialized" bytea NOT NULL
            );

            CREATE INDEX "transactions_unique" ON transactions ("sender_public_key", "recipient_id", "vendor_field_hex", "timestamp");
        `);
    }
    async down(queryRunner) {
        await queryRunner.dropTable("transactions");
    }
}
exports.CreateTransactionsTable20180305400000 = CreateTransactionsTable20180305400000;
//# sourceMappingURL=20180305400000-create-transactions-table.js.map