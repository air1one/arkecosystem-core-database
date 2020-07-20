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
exports.Round = void 0;
const crypto_1 = require("@arkecosystem/crypto");
const typeorm_1 = require("typeorm");
const transform_1 = require("../utils/transform");
let Round = class Round {
};
__decorate([
    typeorm_1.Column({
        primary: true,
        type: "varchar",
        length: 66,
        nullable: false,
    }),
    __metadata("design:type", String)
], Round.prototype, "publicKey", void 0);
__decorate([
    typeorm_1.Column({
        primary: true,
        type: "bigint",
        transformer: transform_1.transformBigInt,
        nullable: false,
    }),
    __metadata("design:type", crypto_1.Utils.BigNumber)
], Round.prototype, "round", void 0);
__decorate([
    typeorm_1.Column({
        type: "bigint",
        transformer: transform_1.transformBigInt,
        nullable: false,
    }),
    __metadata("design:type", crypto_1.Utils.BigNumber)
], Round.prototype, "balance", void 0);
Round = __decorate([
    typeorm_1.Entity({
        name: "rounds",
    })
], Round);
exports.Round = Round;
//# sourceMappingURL=round.js.map