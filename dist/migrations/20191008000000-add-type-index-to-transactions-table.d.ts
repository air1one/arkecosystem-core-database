import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddTypeIndexToTransactionsTable20191008000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
