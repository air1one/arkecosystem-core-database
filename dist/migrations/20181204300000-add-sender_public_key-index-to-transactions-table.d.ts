import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddSenderPublicKeyIndexToTransactionsTable20181204300000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
