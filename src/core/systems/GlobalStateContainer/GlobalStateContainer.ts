import { GlobalStateRepository } from "@core/systems/GlobalStateContainer/GlobalStateRepository";
import { isServiceException } from "@core/common/exceptions";
import { GlobalState } from "@core/systems/GlobalStateContainer/GlobalState";
import { DateTime } from "@core/common/DateTime";

const GLOBAL_ENTITY_ID = "main";

export class GlobalStateContainer {
    repository: GlobalStateRepository;

    constructor({ repository }: { repository: GlobalStateRepository }) {
        this.repository = repository;
    }

    async initialize() {
        await this.createGlobalStateEntityIfNotExists();
    }

    private async createGlobalStateEntityIfNotExists() {
        try {
            await this.repository.read(GLOBAL_ENTITY_ID);
        } catch (e) {
            if (isServiceException(e) && e.name === "EntityNotFoundException")
                await this.repository.create(new GlobalState({ gameDate: DateTime.fromObject({ year: 1990, month: 1, day: 1 }) }));
        }
    }

    /**
     * Get global state.
     */
    async getState() {
        return this.repository.read(GLOBAL_ENTITY_ID);
    }

    /**
     * Update global state.
     *
     * @param payload
     */
    async setState(payload: Pick<GlobalState, "gameDate">) {
        return this.repository.update({ ...payload, id: GLOBAL_ENTITY_ID });
    }
}
