"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddGeneratorPublicKeyIndexToBlocksTable20181204100000 = void 0;
class AddGeneratorPublicKeyIndexToBlocksTable20181204100000 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE INDEX "blocks_generator_public_key" ON blocks ("generator_public_key");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX "blocks_generator_public_key";
        `);
    }
}
exports.AddGeneratorPublicKeyIndexToBlocksTable20181204100000 = AddGeneratorPublicKeyIndexToBlocksTable20181204100000;
//# sourceMappingURL=20181204100000-add-generator_public_key-index-to-blocks-table.js.map