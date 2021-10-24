import { ItemDefinition } from "@core/packages/item/ItemDefinition";
import { EntityNotFoundException } from "@core/common/exceptions";

// TODO: freeze definitions if needed
const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
    coal: new ItemDefinition({ id: "coal" }),
    ironOre: new ItemDefinition({ id: "ironOre" }),
    steel: new ItemDefinition({ id: "steel" }),
};

export class ItemLibrary {
    getItemDef(itemId: string) {
        const itemDef = ITEM_DEFINITIONS[itemId];
        if (itemDef) return itemDef;
        // TODO: EntityNotFoundException is thrown even when ItemDefinition is not an entity.
        throw new EntityNotFoundException({ entityType: "ItemDefinition", entityId: itemId });
    }
}