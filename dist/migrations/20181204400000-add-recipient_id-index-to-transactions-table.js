"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRecipientIdIndexToTransactionsTable20181204400000 = void 0;
class AddRecipientIdIndexToTransactionsTable20181204400000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE INDEX "transactions_recipient_id" ON transactions ("recipient_id");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX "transactions_recipient_id";
        `);
    }
}
exports.AddRecipientIdIndexToTransactionsTable20181204400000 = AddRecipientIdIndexToTransactionsTable20181204400000;
//# sourceMappingURL=20181204400000-add-recipient_id-index-to-transactions-table.js.map