import BigNumber, { BN } from "@core/common/BigNumber";

export class ItemDefinition {
    id: string;
    volume: BigNumber;
    basePrice: BigNumber;

    constructor({ id, volume = BN(1), basePrice = BN(10) }: Partial<ItemDefinition> & Pick<ItemDefinition, "id">) {
        this.id = id;
        this.volume = volume;
        this.basePrice = basePrice;
    }
}
