import BigNumber from "@core/common/BigNumber";
import { ItemGroup } from "@core/packages/item/ItemGroup";
import { DataObject } from "@core/common/dataobject";
import { InvalidOperationException } from "@core/common/exceptions";

export class Storage extends DataObject {
    maxVolume: BigNumber;
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
        this.volume = this.items.reduce((acc, itemGroup) => acc.plus(itemGroup.volume), new BigNumber(0));

        if (this.volume > this.maxVolume) throw new InvalidOperationException({ reason: "Max storage volume exceeded" });
    }
    
    /**
     * Add itemgroup to storage
     *
     * @param itemGroup
     * @throws InvalidOperationException - Volume of items is bigger than maxVolume
     */
    addItemGroup(itemGroup: ItemGroup) {
        if (this.volume.plus(itemGroup.volume) > this.maxVolume)
            throw new InvalidOperationException({ reason: "Max storage volume exceeded" });
        const compatibleItemGroup = this.items.find(i=>i.isCompatible(itemGroup));
        if(compatibleItemGroup) compatibleItemGroup.add(itemGroup);
    }
}
