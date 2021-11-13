import { GlobalStateContainer } from "@core/systems/GlobalStateContainer/GlobalStateContainer";
import { ConflictException, UnexpectedError } from "@core/common/exceptions";

const TURN_PROGRESS_CALLBACK_CALL_ORDER = ["factoryStep", "retailSaleStep", "wholesaleStep"];

type TurnProgressCallback = () => void | Promise<void>;

export class TurnProgressSystem {
    globalStateContainer!: GlobalStateContainer;

    turnProgressCallbacks: Record<string, TurnProgressCallback> = {};

    constructor() {
        // TODO: repository for TurnProgressSystem
    }

    initialize({ globalStateContainer }: { globalStateContainer: GlobalStateContainer }) {
        this.globalStateContainer = globalStateContainer;
    }

    /**
     * Register callback function to be called on turn progress.
     *
     * @param callbackName
     * @param callbackFunction
     */
    registerCallback(callbackName: string, callbackFunction: TurnProgressCallback) {
        if (this.turnProgressCallbacks[callbackName] !== undefined)
            throw new ConflictException({ reason: `Turn progress callback ${callbackName} already registered.` });
        this.turnProgressCallbacks[callbackName] = callbackFunction;
    }

    /**
     * Progress 1 turn of the game.
     */
    async progressTurn() {
        for (const callbackName of TURN_PROGRESS_CALLBACK_CALL_ORDER) {
            const callback = this.turnProgressCallbacks[callbackName];
            if (callback === undefined) throw new UnexpectedError({ reason: `Turn progress callback ${callbackName} is not registered.` });
            await callback();
        }
    }
}
