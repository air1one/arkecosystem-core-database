"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformVendorField = exports.transformBigInt = void 0;
const utils_1 = require("@arkecosystem/utils");
const typeorm_1 = require("typeorm");
exports.transformBigInt = {
    from(value) {
        if (value !== undefined) {
            return utils_1.BigNumber.make(value);
        }
        return undefined;
    },
    to(value) {
        if (value !== undefined) {
            return value instanceof typeorm_1.FindOperator ? value.value : value.toString();
        }
        return undefined;
    },
};
exports.transformVendorField = {
    from: (value) => {
        if (value !== undefined && value !== null) {
            return value.toString("utf8");
        }
        return undefined;
    },
    to: (value) => {
        if (value !== undefined && value !== null) {
            return Buffer.from(value instanceof typeorm_1.FindOperator ? value.value : value, "utf8");
        }
        return undefined;
    },
};
//# sourceMappingURL=transform.js.map