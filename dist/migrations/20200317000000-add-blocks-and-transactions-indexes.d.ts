import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddBlocksAndTransactionsIndexes20200317000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
