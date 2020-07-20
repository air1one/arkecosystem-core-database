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
exports.Transaction = void 0;
const crypto_1 = require("@arkecosystem/crypto");
const typeorm_1 = require("typeorm");
const transform_1 = require("../utils/transform");
// TODO: Fix model to have undefined type on nullable fields
let Transaction = class Transaction {
};
__decorate([
    typeorm_1.Column({
        primary: true,
        type: "varchar",
        length: 64,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: "smallint",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "version", void 0);
__decorate([
    typeorm_1.Column({
        type: "varchar",
        length: 64,
        nullable: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "blockId", void 0);
__decorate([
    typeorm_1.Column({
        type: "integer",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "blockHeight", void 0);
__decorate([
    typeorm_1.Column({
        type: "smallint",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "sequence", void 0);
__decorate([
    typeorm_1.Column({
        type: "integer",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "timestamp", void 0);
__decorate([
    typeorm_1.Column({
        type: "bigint",
        transformer: transform_1.transformBigInt,
        default: undefined,
    }),
    __metadata("design:type", crypto_1.Utils.BigNumber)
], Transaction.prototype, "nonce", void 0);
__decorate([
    typeorm_1.Column({
        type: "varchar",
        length: 66,
        nullable: false,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "senderPublicKey", void 0);
__decorate([
    typeorm_1.Column({
        default: undefined,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "recipientId", void 0);
__decorate([
    typeorm_1.Column({
        type: "smallint",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "type", void 0);
__decorate([
    typeorm_1.Column({
        type: "integer",
        nullable: false,
        default: 1,
    }),
    __metadata("design:type", Number)
], Transaction.prototype, "typeGroup", void 0);
__decorate([
    typeorm_1.Column({
        type: "bytea",
        default: undefined,
        transformer: transform_1.transformVendorField,
    }),
    __metadata("design:type", Object)
], Transaction.prototype, "vendorField", void 0);
__decorate([
    typeorm_1.Column({
        type: "bigint",
        transformer: transform_1.transformBigInt,
        nullable: false,
    }),
    __metadata("design:type", crypto_1.Utils.BigNumber)
], Transaction.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column({
        type: "bigint",
        transformer: transform_1.transformBigInt,
        nullable: false,
    }),
    __metadata("design:type", crypto_1.Utils.BigNumber)
], Transaction.prototype, "fee", void 0);
__decorate([
    typeorm_1.Column({
        type: "bytea",
        nullable: false,
    }),
    __metadata("design:type", Buffer)
], Transaction.prototype, "serialized", void 0);
__decorate([
    typeorm_1.Column({
        type: "jsonb",
    }),
    __metadata("design:type", Object)
], Transaction.prototype, "asset", void 0);
Transaction = __decorate([
    typeorm_1.Entity({
        name: "transactions",
    }),
    typeorm_1.Index(["type"]),
    typeorm_1.Index(["blockId"]),
    typeorm_1.Index(["senderPublicKey"]),
    typeorm_1.Index(["recipientId"]),
    typeorm_1.Index(["timestamp"])
], Transaction);
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map