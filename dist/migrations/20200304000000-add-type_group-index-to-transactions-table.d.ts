import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddTypeGroupIndexToTransactionsTable20200304000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
