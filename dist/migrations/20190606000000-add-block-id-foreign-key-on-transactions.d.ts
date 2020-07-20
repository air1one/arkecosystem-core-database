import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddBlockIdForeignKeyOnTransactionsTable20190606000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
