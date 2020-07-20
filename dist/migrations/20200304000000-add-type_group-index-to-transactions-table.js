"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTypeGroupIndexToTransactionsTable20200304000000 = void 0;
class AddTypeGroupIndexToTransactionsTable20200304000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE INDEX transactions_type_group ON transactions(type_group);
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX transactions_type_group;
        `);
    }
}
exports.AddTypeGroupIndexToTransactionsTable20200304000000 = AddTypeGroupIndexToTransactionsTable20200304000000;
//# sourceMappingURL=20200304000000-add-type_group-index-to-transactions-table.js.map