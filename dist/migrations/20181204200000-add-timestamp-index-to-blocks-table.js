"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTimestampIndexToBlocksTable20181204200000 = void 0;
class AddTimestampIndexToBlocksTable20181204200000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE INDEX "transactions_timestamp" ON transactions ("timestamp");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX "transactions_timestamp";
        `);
    }
}
exports.AddTimestampIndexToBlocksTable20181204200000 = AddTimestampIndexToBlocksTable20181204200000;
//# sourceMappingURL=20181204200000-add-timestamp-index-to-blocks-table.js.map