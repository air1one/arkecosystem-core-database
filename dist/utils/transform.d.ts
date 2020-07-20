/// <reference types="node" />
import { BigNumber } from "@arkecosystem/utils";
import { FindOperator } from "typeorm";
export declare const transformBigInt: {
    from(value: string | undefined): BigNumber | undefined;
    to(value: BigNumber | FindOperator<any>): string | undefined;
};
export declare const transformVendorField: {
    from: (value: Buffer | undefined | null) => string | undefined;
    to: (value: string | FindOperator<any> | undefined | null) => Buffer | undefined;
};
