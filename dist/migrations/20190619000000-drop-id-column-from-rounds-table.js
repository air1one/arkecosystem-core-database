"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropIdColumnFromRoundsTable20190619000000 = void 0;
class DropIdColumnFromRoundsTable20190619000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE rounds DROP COLUMN id, ADD PRIMARY KEY (round, public_key);
            DROP INDEX rounds_unique;
        `);
    }
    async down(queryRunner) { }
}
exports.DropIdColumnFromRoundsTable20190619000000 = DropIdColumnFromRoundsTable20190619000000;
//# sourceMappingURL=20190619000000-drop-id-column-from-rounds-table.js.map