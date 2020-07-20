import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddRecipientIdIndexToTransactionsTable20181204400000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
