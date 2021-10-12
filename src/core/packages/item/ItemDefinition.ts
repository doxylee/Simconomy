import BigNumber from "@core/common/BigNumber";

export class ItemDefinition {
    id: string;
    volume: BigNumber;
    basePrice: BigNumber;

    constructor({ id, volume = new BigNumber(1), basePrice = new BigNumber(10) }: Partial<ItemDefinition> & Pick<ItemDefinition, "id">) {
        this.id = id;
        this.volume = volume;
        this.basePrice = basePrice;
    }
}
