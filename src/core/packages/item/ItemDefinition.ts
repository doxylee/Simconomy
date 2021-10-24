import BigNumber, { BN } from "@core/common/BigNumber";

export class ItemDefinition {
    /** Unique id of the type of item */
    id: string;
    /** Volume in ㎥ */
    volume: BigNumber;
    /** Base price of item */
    basePrice: BigNumber;

    constructor({ id, volume = BN(1), basePrice = BN(10) }: Partial<ItemDefinition> & Pick<ItemDefinition, "id">) {
        this.id = id;
        this.volume = volume;
        this.basePrice = basePrice;
    }
}
