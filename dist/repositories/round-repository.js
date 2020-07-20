"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundRepository = void 0;
const typeorm_1 = require("typeorm");
const models_1 = require("../models");
let RoundRepository = class RoundRepository extends typeorm_1.Repository {
    async findById(id) {
        return this.find({
            where: {
                round: id,
            },
        });
    }
    async getRound(round) {
        return this.createQueryBuilder()
            .select()
            .where("round = :round", { round })
            .orderBy("balance", "DESC")
            .addOrderBy("public_key", "ASC")
            .getMany();
    }
    async save(delegates) {
        const round = delegates.map((delegate) => ({
            publicKey: delegate.publicKey,
            balance: delegate.getAttribute("delegate.voteBalance"),
            round: delegate.getAttribute("delegate.round"),
        }));
        return super.save(round);
    }
};
RoundRepository = __decorate([
    typeorm_1.EntityRepository(models_1.Round)
], RoundRepository);
exports.RoundRepository = RoundRepository;
//# sourceMappingURL=round-repository.js.map