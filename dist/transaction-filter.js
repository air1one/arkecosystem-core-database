"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionFilter = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
const crypto_1 = require("@arkecosystem/crypto");
const { handleAndCriteria, handleOrCriteria, handleNumericCriteria, optimizeExpression, hasOrCriteria, } = core_kernel_1.Utils.Search;
let TransactionFilter = class TransactionFilter {
    async getExpression(...criteria) {
        const expressions = await Promise.all(criteria.map((c) => handleOrCriteria(c, (c) => this.handleTransactionCriteria(c))));
        return optimizeExpression({ op: "and", expressions });
    }
    async handleTransactionCriteria(criteria) {
        const expression = await handleAndCriteria(criteria, async (key) => {
            switch (key) {
                case "address":
                    return handleOrCriteria(criteria.address, async (c) => {
                        return this.handleAddressCriteria(c);
                    });
                case "senderId":
                    return handleOrCriteria(criteria.senderId, async (c) => {
                        return this.handleSenderIdCriteria(c);
                    });
                case "recipientId":
                    return handleOrCriteria(criteria.recipientId, async (c) => {
                        return this.handleRecipientIdCriteria(c);
                    });
                case "id":
                    return handleOrCriteria(criteria.id, async (c) => {
                        return { property: "id", op: "equal", value: c };
                    });
                case "version":
                    return handleOrCriteria(criteria.version, async (c) => {
                        return { property: "version", op: "equal", value: c };
                    });
                case "blockId":
                    return handleOrCriteria(criteria.blockId, async (c) => {
                        return { property: "blockId", op: "equal", value: c };
                    });
                case "sequence":
                    return handleOrCriteria(criteria.sequence, async (c) => {
                        return handleNumericCriteria("sequence", c);
                    });
                case "timestamp":
                    return handleOrCriteria(criteria.timestamp, async (c) => {
                        return handleNumericCriteria("timestamp", c);
                    });
                case "nonce":
                    return handleOrCriteria(criteria.nonce, async (c) => {
                        return handleNumericCriteria("nonce", c);
                    });
                case "senderPublicKey":
                    return handleOrCriteria(criteria.senderPublicKey, async (c) => {
                        return { property: "senderPublicKey", op: "equal", value: c };
                    });
                case "type":
                    return handleOrCriteria(criteria.type, async (c) => {
                        return { property: "type", op: "equal", value: c };
                    });
                case "typeGroup":
                    return handleOrCriteria(criteria.typeGroup, async (c) => {
                        return { property: "typeGroup", op: "equal", value: c };
                    });
                case "vendorField":
                    return handleOrCriteria(criteria.vendorField, async (c) => {
                        return { property: "vendorField", op: "like", pattern: c };
                    });
                case "amount":
                    return handleOrCriteria(criteria.amount, async (c) => {
                        return handleNumericCriteria("amount", c);
                    });
                case "fee":
                    return handleOrCriteria(criteria.fee, async (c) => {
                        return handleNumericCriteria("fee", c);
                    });
                case "asset":
                    return handleOrCriteria(criteria.asset, async (c) => {
                        return { property: "asset", op: "contains", value: c };
                    });
                default:
                    return { op: "true" };
            }
        });
        return { op: "and", expressions: [expression, await this.getAutoTypeGroupExpression(criteria)] };
    }
    async handleAddressCriteria(criteria) {
        const expressions = await Promise.all([
            this.handleSenderIdCriteria(criteria),
            this.handleRecipientIdCriteria(criteria),
        ]);
        return { op: "or", expressions };
    }
    async handleSenderIdCriteria(criteria) {
        const senderWallet = this.walletRepository.findByAddress(criteria);
        if (senderWallet && senderWallet.publicKey) {
            return { op: "equal", property: "senderPublicKey", value: senderWallet.publicKey };
        }
        else {
            return { op: "false" };
        }
    }
    async handleRecipientIdCriteria(criteria) {
        const recipientIdExpression = {
            op: "equal",
            property: "recipientId",
            value: criteria,
        };
        const multipaymentRecipientIdExpression = {
            op: "and",
            expressions: [
                { op: "equal", property: "typeGroup", value: crypto_1.Enums.TransactionTypeGroup.Core },
                { op: "equal", property: "type", value: crypto_1.Enums.TransactionType.MultiPayment },
                { op: "contains", property: "asset", value: { payments: [{ recipientId: criteria }] } },
            ],
        };
        const recipientWallet = this.walletRepository.findByAddress(criteria);
        if (recipientWallet && recipientWallet.publicKey) {
            const delegateRegistrationExpression = {
                op: "and",
                expressions: [
                    { op: "equal", property: "typeGroup", value: crypto_1.Enums.TransactionTypeGroup.Core },
                    { op: "equal", property: "type", value: crypto_1.Enums.TransactionType.DelegateRegistration },
                    { op: "equal", property: "senderPublicKey", value: recipientWallet.publicKey },
                ],
            };
            return {
                op: "or",
                expressions: [recipientIdExpression, multipaymentRecipientIdExpression, delegateRegistrationExpression],
            };
        }
        else {
            return {
                op: "or",
                expressions: [recipientIdExpression, multipaymentRecipientIdExpression],
            };
        }
    }
    async getAutoTypeGroupExpression(criteria) {
        if (hasOrCriteria(criteria.type) && hasOrCriteria(criteria.typeGroup) === false) {
            return { op: "equal", property: "typeGroup", value: crypto_1.Enums.TransactionTypeGroup.Core };
        }
        else {
            return { op: "true" };
        }
    }
};
__decorate([
    core_kernel_1.Container.inject(core_kernel_1.Container.Identifiers.WalletRepository),
    core_kernel_1.Container.tagged("state", "blockchain"),
    __metadata("design:type", Object)
], TransactionFilter.prototype, "walletRepository", void 0);
TransactionFilter = __decorate([
    core_kernel_1.Container.injectable()
], TransactionFilter);
exports.TransactionFilter = TransactionFilter;
//# sourceMappingURL=transaction-filter.js.map