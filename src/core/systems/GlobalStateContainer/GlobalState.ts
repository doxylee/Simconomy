import { Entity, EntityConstructionParam } from "@core/common/entity";
import { DateTime } from "@core/common/DateTime";

export class GlobalState extends Entity {
    entityType: "GlobalState" = "GlobalState";
    gameDate: DateTime;

    constructor({ gameDate, ...data }: Pick<GlobalState, "gameDate"> & EntityConstructionParam) {
        super(data);
        this.gameDate = gameDate;
    }
}
