import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddNonceColumnToTransactionsTable20190806000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
