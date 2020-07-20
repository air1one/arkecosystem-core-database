import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddBlockIdIndexToTransactionsTable20181129400000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
