"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockFilter = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const { handleAndCriteria, handleOrCriteria, handleNumericCriteria, optimizeExpression } = core_kernel_1.Utils.Search;
let BlockFilter = class BlockFilter {
    async getExpression(...criteria) {
        const expressions = await Promise.all(criteria.map((c) => handleOrCriteria(c, (c) => this.handleBlockCriteria(c))));
        return optimizeExpression({ op: "and", expressions });
    }
    async handleBlockCriteria(criteria) {
        return handleAndCriteria(criteria, async (key) => {
            switch (key) {
                case "id":
                    return handleOrCriteria(criteria.id, async (c) => {
                        return { property: "id", op: "equal", value: c };
                    });
                case "version":
                    return handleOrCriteria(criteria.version, async (c) => {
                        return { property: "version", op: "equal", value: c };
                    });
                case "timestamp":
                    return handleOrCriteria(criteria.timestamp, async (c) => {
                        return handleNumericCriteria("timestamp", c);
                    });
                case "previousBlock":
                    return handleOrCriteria(criteria.previousBlock, async (c) => {
                        return { property: "previousBlock", op: "equal", value: c };
                    });
                case "height":
                    return handleOrCriteria(criteria.height, async (c) => {
                        return handleNumericCriteria("height", c);
                    });
                case "numberOfTransactions":
                    return handleOrCriteria(criteria.numberOfTransactions, async (c) => {
                        return handleNumericCriteria("numberOfTransactions", c);
                    });
                case "totalAmount":
                    return handleOrCriteria(criteria.totalAmount, async (c) => {
                        return handleNumericCriteria("totalAmount", c);
                    });
                case "totalFee":
                    return handleOrCriteria(criteria.totalFee, async (c) => {
                        return handleNumericCriteria("totalFee", c);
                    });
                case "reward":
                    return handleOrCriteria(criteria.reward, async (c) => {
                        return handleNumericCriteria("reward", c);
                    });
                case "payloadLength":
                    return handleOrCriteria(criteria.payloadLength, async (c) => {
                        return handleNumericCriteria("payloadLength", c);
                    });
                case "payloadHash":
                    return handleOrCriteria(criteria.payloadHash, async (c) => {
                        return { property: "payloadHash", op: "equal", value: c };
                    });
                case "generatorPublicKey":
                    return handleOrCriteria(criteria.generatorPublicKey, async (c) => {
                        return { property: "generatorPublicKey", op: "equal", value: c };
                    });
                case "blockSignature":
                    return handleOrCriteria(criteria.blockSignature, async (c) => {
                        return { property: "blockSignature", op: "equal", value: c };
                    });
                default:
                    return { op: "true" };
            }
        });
    }
};
BlockFilter = __decorate([
    core_kernel_1.Container.injectable()
], BlockFilter);
exports.BlockFilter = BlockFilter;
//# sourceMappingURL=block-filter.js.map