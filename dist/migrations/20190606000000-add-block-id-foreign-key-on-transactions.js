"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBlockIdForeignKeyOnTransactionsTable20190606000000 = void 0;
class AddBlockIdForeignKeyOnTransactionsTable20190606000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE transactions ADD CONSTRAINT "transactions_block_id_fkey" FOREIGN KEY (block_id) REFERENCES blocks (id);
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE transactions DROP CONSTRAINT "transactions_block_id_fkey";
        `);
    }
}
exports.AddBlockIdForeignKeyOnTransactionsTable20190606000000 = AddBlockIdForeignKeyOnTransactionsTable20190606000000;
//# sourceMappingURL=20190606000000-add-block-id-foreign-key-on-transactions.js.map