import { Entity } from "@core/common/entity";
import BigNumber, { BN } from "@core/common/BigNumber";

export class Company extends Entity {
    entityType: "Company" = "Company";
    name: string;
    cash: BigNumber;

    constructor({ name, cash = BN(0), ...data }: Omit<Partial<Company>, "entityType"> & Pick<Company, "name">) {
        super(data);
        this.name = name;
        this.cash = cash;
    }
}
