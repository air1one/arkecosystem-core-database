"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAssetColumnToTransactionsTable20190917000000 = void 0;
class AddAssetColumnToTransactionsTable20190917000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE transactions ADD COLUMN asset JSONB;
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE transactions DROP COLUMN asset;
        `);
    }
}
exports.AddAssetColumnToTransactionsTable20190917000000 = AddAssetColumnToTransactionsTable20190917000000;
//# sourceMappingURL=20190917000000-add-asset-column-to-transactions-table.js.map