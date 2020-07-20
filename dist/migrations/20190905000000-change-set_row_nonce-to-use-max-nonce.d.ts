import { MigrationInterface, QueryRunner } from "typeorm";
export declare class ChangeSetRowNonceToUseMaxNonce20190905000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
