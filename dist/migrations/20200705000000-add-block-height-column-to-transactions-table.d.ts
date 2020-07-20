import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddBlockHeightColumnToTransactionsTable20200705000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
