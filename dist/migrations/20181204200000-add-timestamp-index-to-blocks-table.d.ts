import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddTimestampIndexToBlocksTable20181204200000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
