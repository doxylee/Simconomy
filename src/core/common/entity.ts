import { uuid4 } from "@core/common/uuid";
import cloneDeep from "lodash/cloneDeep";

export type EntityConstructionParam = Partial<Pick<Entity, "id">>;

export class Entity {
    entityType: string = "Entity";
    id: string;

    /**
     * WARNING:
     * In the subclass, default value assignment is done after calling super().
     * It overwrites properties assigned in the superclass constructor even if values are passed as parameter.
     * Therefore in the subclass's constructor, object must be destructured to only send properties of the super class when calling super,
     * and manually set the subclass's properties after calling super().
     */
    constructor({ id = uuid4() }: EntityConstructionParam = {}) {
        this.id = id;
    }

    /**
     *
     */
    clone(): this {
        return cloneDeep(this);
    }
}
