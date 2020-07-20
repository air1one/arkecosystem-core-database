"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBlockIdIndexToTransactionsTable20181129400000 = void 0;
class AddBlockIdIndexToTransactionsTable20181129400000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE INDEX "transactions_block_id" ON transactions ("block_id");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX "transactions_block_id";
        `);
    }
}
exports.AddBlockIdIndexToTransactionsTable20181129400000 = AddBlockIdIndexToTransactionsTable20181129400000;
//# sourceMappingURL=20181129400000-add-block_id-index-to-transactions-table.js.map