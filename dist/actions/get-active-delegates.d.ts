import { Contracts, Services } from "@arkecosystem/core-kernel";
import { ActionArguments } from "@arkecosystem/core-kernel/src/types";
export declare class GetActiveDelegatesAction extends Services.Triggers.Action {
    private app;
    constructor(app: Contracts.Kernel.Application);
    execute(args: ActionArguments): Promise<Contracts.State.Wallet[]>;
}
