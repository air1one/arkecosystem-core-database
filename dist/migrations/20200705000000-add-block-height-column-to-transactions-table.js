"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBlockHeightColumnToTransactionsTable20200705000000 = void 0;
class AddBlockHeightColumnToTransactionsTable20200705000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE blocks ADD CONSTRAINT blocks_id_height_unique UNIQUE (id, height);
            ALTER TABLE transactions ADD COLUMN block_height integer;
            UPDATE transactions SET block_height = (SELECT height FROM blocks WHERE id = block_id);
            ALTER TABLE transactions ALTER COLUMN block_height SET NOT NULL;
            ALTER TABLE transactions ADD CONSTRAINT transactions_block_id_block_height FOREIGN KEY (block_id, block_height) REFERENCES blocks(id, height);
            CREATE INDEX transactions_block_height_sequence ON transactions(block_height, sequence);
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX transactions_block_height_sequence;
            ALTER TABLE transactions DROP CONSTRAINT transactions_block_id_block_height;
            ALTER TABLE transactions DROP COLUMN block_height;
            ALTER TABLE blocks DROP CONSTRAINT blocks_id_height_unique;
        `);
    }
}
exports.AddBlockHeightColumnToTransactionsTable20200705000000 = AddBlockHeightColumnToTransactionsTable20200705000000;
//# sourceMappingURL=20200705000000-add-block-height-column-to-transactions-table.js.map