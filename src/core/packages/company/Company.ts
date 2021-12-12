import { Entity, EntityConstructionParam } from "@core/common/entity";
import { BigNumber, BN } from "@core/common/BigNumber";

export class Company extends Entity {
    entityType: "Company" = "Company";
    name: string;
    cash: BigNumber;

    constructor({ name, cash = BN(0), ...data }: { name: string; cash?: BigNumber } & EntityConstructionParam) {
        super(data);
        this.name = name;
        this.cash = cash;
    }
}
