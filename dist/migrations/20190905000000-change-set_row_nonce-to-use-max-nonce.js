"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeSetRowNonceToUseMaxNonce20190905000000 = void 0;
class ChangeSetRowNonceToUseMaxNonce20190905000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            DROP TRIGGER transactions_set_nonce ON transactions;

            DROP FUNCTION set_row_nonce();

            CREATE FUNCTION set_row_nonce() RETURNS TRIGGER
            AS
            $$
            BEGIN
                SELECT COALESCE(MAX(nonce), 0) + 1 INTO NEW.nonce
                FROM transactions
                WHERE sender_public_key = NEW.sender_public_key;

                RETURN NEW;
            END;
            $$
            LANGUAGE PLPGSQL
            VOLATILE;

            CREATE TRIGGER transactions_set_nonce
            BEFORE INSERT
            ON transactions
            FOR EACH ROW
            WHEN (NEW.version = 1)
            EXECUTE PROCEDURE set_row_nonce();
        `);
    }
    async down(queryRunner) { }
}
exports.ChangeSetRowNonceToUseMaxNonce20190905000000 = ChangeSetRowNonceToUseMaxNonce20190905000000;
//# sourceMappingURL=20190905000000-change-set_row_nonce-to-use-max-nonce.js.map