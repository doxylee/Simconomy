import { uuid4 } from "@core/common/uuid";

export class Entity {
    entityType: string = "Entity";
    id: string;

    constructor() {
        this.id = uuid4();
    }
}