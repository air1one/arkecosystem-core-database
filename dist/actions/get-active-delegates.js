"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActiveDelegatesAction = void 0;
const core_kernel_1 = require("@arkecosystem/core-kernel");
class GetActiveDelegatesAction extends core_kernel_1.Services.Triggers.Action {
    constructor(app) {
        super();
        this.app = app;
    }
    async execute(args) {
        const roundInfo = args.roundInfo;
        const delegates = args.delegates;
        const database = this.app.get(core_kernel_1.Container.Identifiers.DatabaseService);
        return database.getActiveDelegates(roundInfo, delegates);
    }
}
exports.GetActiveDelegatesAction = GetActiveDelegatesAction;
//# sourceMappingURL=get-active-delegates.js.map