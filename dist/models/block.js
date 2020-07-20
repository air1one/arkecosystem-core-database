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
exports.Block = void 0;
const crypto_1 = require("@arkecosystem/crypto");
const typeorm_1 = require("typeorm");
const transform_1 = require("../utils/transform");
let Block = class Block {
};
__decorate([
    typeorm_1.Column({
        primary: true,
        type: "varchar",
        length: 64,
    }),
    __metadata("design:type", String)
], Block.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: "smallint",
    }),
    __metadata("design:type", Number)
], Block.prototype, "version", void 0);
__decorate([
    typeorm_1.Column({
        type: "integer",
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", Number)
], Block.prototype, "timestamp", void 0);
__decorate([
    typeorm_1.Column({
        type: "varchar",
        unique: true,
        length: 64,
        default: undefined,
    }),
    __metadata("design:type", String)
], Block.prototype, "previousBlock", void 0);
__decorate([
    typeorm_1.Column({
        type: "integer",
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", Number)
], Block.prototype, "height", void 0);
__decorate([
    typeorm_1.Column({
        type: "integer",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Block.prototype, "numberOfTransactions", void 0);
__decorate([
    typeorm_1.Column({
        type: "bigint",
        nullable: false,
        transformer: transform_1.transformBigInt,
    }),
    __metadata("design:type", crypto_1.Utils.BigNumber)
], Block.prototype, "totalAmount", void 0);
__decorate([
    typeorm_1.Column({
        type: "bigint",
        nullable: false,
        transformer: transform_1.transformBigInt,
    }),
    __metadata("design:type", crypto_1.Utils.BigNumber)
], Block.prototype, "totalFee", void 0);
__decorate([
    typeorm_1.Column({
        type: "bigint",
        nullable: false,
        transformer: transform_1.transformBigInt,
    }),
    __metadata("design:type", crypto_1.Utils.BigNumber)
], Block.prototype, "reward", void 0);
__decorate([
    typeorm_1.Column({
        type: "integer",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Block.prototype, "payloadLength", void 0);
__decorate([
    typeorm_1.Column({
        type: "varchar",
        length: 64,
        nullable: false,
    }),
    __metadata("design:type", String)
], Block.prototype, "payloadHash", void 0);
__decorate([
    typeorm_1.Column({
        type: "varchar",
        length: 66,
        nullable: false,
    }),
    __metadata("design:type", String)
], Block.prototype, "generatorPublicKey", void 0);
__decorate([
    typeorm_1.Column({
        type: "varchar",
        length: 256,
        nullable: false,
    }),
    __metadata("design:type", String)
], Block.prototype, "blockSignature", void 0);
Block = __decorate([
    typeorm_1.Entity({
        name: "blocks",
    }),
    typeorm_1.Index(["generatorPublicKey"])
], Block);
exports.Block = Block;
//# sourceMappingURL=block.js.map