"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoundsTable20180305200000 = void 0;
class CreateRoundsTable20180305200000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE rounds (
                "id" SERIAL PRIMARY KEY,
                "public_key" VARCHAR(66) NOT NULL,
                "balance" BIGINT NOT NULL,
                "round" BIGINT NOT NULL
            );

            CREATE UNIQUE INDEX "rounds_unique" ON rounds ("round", "public_key");
        `);
    }
    async down(queryRunner) {
        await queryRunner.dropTable("rounds");
    }
}
exports.CreateRoundsTable20180305200000 = CreateRoundsTable20180305200000;
//# sourceMappingURL=20180305200000-create-rounds-table.js.map