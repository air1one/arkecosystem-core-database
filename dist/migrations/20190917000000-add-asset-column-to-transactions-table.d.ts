import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddAssetColumnToTransactionsTable20190917000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
