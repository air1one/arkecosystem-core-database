import { MigrationInterface, QueryRunner } from "typeorm";
export declare class DropIdColumnFromRoundsTable20190619000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
