import { BigNumber, BN } from "@core/common/BigNumber";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { DataObject } from "@core/common/dataobject";
import { EntityNotFoundException, InvalidOperationException } from "@core/common/exceptions";

export class ItemStorage extends DataObject {
    /**
     * Maximum volume this storage can store in m³.
     * More than this volume can be stored, but it causes additional costs.
     */
    maxVolume: BigNumber; // TODO: incur additional cost
    
    /**
     * ItemGroups in this storage.
     * Must not delete empty ItemGroup, and use existing item groups whenever possible.
     * This is because other services depend on the groupId of ItemGroup.
     */
    items: ItemGroup[]; // TODO: ItemGroup.def don't have to be cloned. Optimization opportunity.
    
    /** Used volume of storage in m³. */
    volume: BigNumber;
    
    /**
     *
     * @param maxVolume
     * @param items
     * @throws InvalidOperationException - volume of items is bigger than maxVolume
     */
    constructor({maxVolume, items = []}: { maxVolume: BigNumber; items?: ItemGroup[] }) {
        super();
        this.maxVolume = maxVolume;
        this.items = items;
        this.volume = this.items.reduce((acc, itemGroup) => acc.plus(itemGroup.volume), BN(0));
        
        if (this.volume.gt(this.maxVolume)) throw new InvalidOperationException({reason: "Max storage volume exceeded"});
    }
    
    /**
     * Add ItemGroup to storage.
     * Add as new ItemGroup or merge to compatible ItemGroup if exists.
     *
     * @param itemGroup
     */
    addItemGroup(itemGroup: ItemGroup) {
        const compatibleItemGroup = this.items.find((i) => i.isCompatible(itemGroup));
        if (compatibleItemGroup) compatibleItemGroup.add(itemGroup);
        else this.items.push(itemGroup);
    }
    
    /**
     * Find an ItemGroup in this storage by its id.
     *
     * @param id
     * @throws EntityNotFoundException
     */
    getItemGroup(id: string) {
        const itemGroup = this.items.find((i) => i.groupId === id);
        if (itemGroup === undefined) throw new EntityNotFoundException({entityType: "ItemGroup", entityId: id});
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
    takeItems({itemGroupId, amount}: { itemGroupId: string; amount: BigNumber }) {
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
