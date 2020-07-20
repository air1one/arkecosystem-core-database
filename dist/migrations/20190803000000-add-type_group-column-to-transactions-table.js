"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTypeGroupColumnToTransactionsTable20190803000000 = void 0;
class AddTypeGroupColumnToTransactionsTable20190803000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE transactions ADD COLUMN type_group INTEGER NOT NULL DEFAULT 1;
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE transactions DROP COLUMN type_group;
        `);
    }
}
exports.AddTypeGroupColumnToTransactionsTable20190803000000 = AddTypeGroupColumnToTransactionsTable20190803000000;
//# sourceMappingURL=20190803000000-add-type_group-column-to-transactions-table.js.map