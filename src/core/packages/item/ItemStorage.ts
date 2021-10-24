import BigNumber, { BN } from "@core/common/BigNumber";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { DataObject } from "@core/common/dataobject";
import { EntityNotFoundException, InvalidOperationException } from "@core/common/exceptions";

export class ItemStorage extends DataObject {
    maxVolume: BigNumber;

    /**
     * ItemGroups in this storage.
     * Must not delete empty ItemGroup, and use existing item groups whenever possible.
     * This is because other services depend on the groupId of ItemGroup.
     */
    items: ItemGroup[]; // TODO: ItemGroup.def don't have to be cloned. Optimization opportunity.

    /** Used volume of storage. */
    volume: BigNumber;

    /**
     *
     * @param maxVolume
     * @param items
     * @throws InvalidOperationException - volume of items is bigger than maxVolume
     */
    constructor({ maxVolume, items = [] }: { maxVolume: BigNumber; items?: ItemGroup[] }) {
        super();
        this.maxVolume = maxVolume;
        this.items = items;
        this.volume = this.items.reduce((acc, itemGroup) => acc.plus(itemGroup.volume), BN(0));

        if (this.volume > this.maxVolume) throw new InvalidOperationException({ reason: "Max storage volume exceeded" });
    }

    /**
     * Add ItemGroup to storage.
     * Add as new ItemGroup or merge to compatible ItemGroup if exists.
     *
     * @param itemGroup
     * @throws InvalidOperationException - Volume of items is bigger than maxVolume
     */
    addItemGroup(itemGroup: ItemGroup) {
        if (this.volume.plus(itemGroup.volume) > this.maxVolume)
            throw new InvalidOperationException({ reason: "Max storage volume exceeded" });
        const compatibleItemGroup = this.items.find((i) => i.isCompatible(itemGroup));
        if (compatibleItemGroup) compatibleItemGroup.add(itemGroup);
        else this.items.push(itemGroup)
    }

    /**
     * Find an ItemGroup in this storage by its id.
     *
     * @param id
     * @throws EntityNotFoundException
     */
    getItemGroup(id: string) {
        const itemGroup = this.items.find((i) => i.groupId === id);
        if (itemGroup === undefined) throw new EntityNotFoundException({ entityType: "ItemGroup", entityId: id });
        return itemGroup;
    }

    /**
     * Take items from requested itemgroup in this storage.
     *
     * @param itemGroupId
     * @param amount
     * @throws EntityNotFoundException
     * @throws InvalidOperationException - Insufficient amount of items in ItemGroup
     */
    takeItems({ itemGroupId, amount }: { itemGroupId: string; amount: BigNumber }) {
        return this.getItemGroup(itemGroupId).take(amount);
    }
    
    /**
     * Get all ItemGroups of given item type.
     *
     * @param itemId
     */
    getAllItemGroupsOfItemType(itemId: string) {
        return this.items.filter((itemGroup) => itemGroup.def.id === itemId);
    }
}
