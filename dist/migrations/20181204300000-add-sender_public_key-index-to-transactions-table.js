"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSenderPublicKeyIndexToTransactionsTable20181204300000 = void 0;
class AddSenderPublicKeyIndexToTransactionsTable20181204300000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE INDEX "transactions_sender_public_key" ON transactions ("sender_public_key");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX "transactions_sender_public_key";
        `);
    }
}
exports.AddSenderPublicKeyIndexToTransactionsTable20181204300000 = AddSenderPublicKeyIndexToTransactionsTable20181204300000;
//# sourceMappingURL=20181204300000-add-sender_public_key-index-to-transactions-table.js.map