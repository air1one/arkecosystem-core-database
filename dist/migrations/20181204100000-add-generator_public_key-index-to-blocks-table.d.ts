import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddGeneratorPublicKeyIndexToBlocksTable20181204100000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
