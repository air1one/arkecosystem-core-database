"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTypeIndexToTransactionsTable20191008000000 = void 0;
class AddTypeIndexToTransactionsTable20191008000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE INDEX "transactions_type" ON transactions ("type");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX "transactions_type";
        `);
    }
}
exports.AddTypeIndexToTransactionsTable20191008000000 = AddTypeIndexToTransactionsTable20191008000000;
//# sourceMappingURL=20191008000000-add-type-index-to-transactions-table.js.map