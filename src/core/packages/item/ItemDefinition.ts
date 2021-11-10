import BigNumber, { BN } from "@core/common/BigNumber";

export class ItemDefinition {
    /** Unique id of the type of item */
    id: string;
    /** Mass in kg */
    mass: BigNumber;
    /** Volume in m³ */
    volume: BigNumber;
    /** Base price of item */
    basePrice: BigNumber;

    constructor({ id, mass = BN(1), volume = BN(1), basePrice = BN(1) }: Partial<ItemDefinition> & Pick<ItemDefinition, "id">) {
        this.id = id;
        this.mass = mass;
        this.volume = volume;
        this.basePrice = basePrice;
    }
}
