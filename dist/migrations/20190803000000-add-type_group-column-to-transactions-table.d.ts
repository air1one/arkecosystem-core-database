import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddTypeGroupColumnToTransactionsTable20190803000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
