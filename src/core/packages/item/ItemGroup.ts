import { ItemDefinition } from "@core/packages/item/ItemDefinition";
import BigNumber from "@core/common/BigNumber";
import { uuid4 } from "@core/common/uuid";
import { DataObject } from "@core/common/dataobject";
import { InvalidOperationException } from "@core/common/exceptions";

/**
 * Batch of items.
 * Contains data about item type, amount, quality, brand, etc
 */
export class ItemGroup extends DataObject {
    /** Unique id of this item group. Used for selecting which item group to buy/sell/use */
    groupId: string;
    def: ItemDefinition; // TODO: ItemDefinition don't have to be cloned. Optimization opportunity.
    amount: BigNumber;

    /** Total volume of items */
    volume: BigNumber;

    constructor({ groupId = uuid4(), def, amount }: { groupId?: string; def: ItemDefinition; amount: BigNumber }) {
        super();
        this.groupId = groupId;
        this.def = def;
        this.amount = amount;

        this.volume = def.volume.times(amount);
    }

    /**
     * Check if two ItemGroups can be added to another.
     * @param other
     */
    isCompatible(other: ItemGroup) {
        return this.def.id === other.def.id;
    }

    /**
     * Add another ItemGroup to this ItemGroup.
     *
     * @param other
     * @throws InvalidOperationException - itemgroups are incompatible
     */
    add(other: ItemGroup) {
        if (!this.isCompatible(other)) throw new InvalidOperationException({ reason: "Incompatible itemgroup to add" });
        this.amount = this.amount.plus(other.amount);
    }
}
