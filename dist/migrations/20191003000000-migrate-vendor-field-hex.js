"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateVendorFieldHex20191003000000 = void 0;
class MigrateVendorFieldHex20191003000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            UPDATE transactions SET vendor_field_hex = ('\\x' || ENCODE(vendor_field_hex, 'escape'))::BYTEA;
            ALTER TABLE transactions RENAME vendor_field_hex TO vendor_field;
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE transactions RENAME vendor_field TO vendor_field_hex;
            UPDATE transactions SET vendor_field_hex = SUBSTRING(ENCODE(vendor_field_hex, 'escape'), 2)::BYTEA;
        `);
    }
}
exports.MigrateVendorFieldHex20191003000000 = MigrateVendorFieldHex20191003000000;
//# sourceMappingURL=20191003000000-migrate-vendor-field-hex.js.map