import { Entity } from "@core/common/entity";
import BigNumber from "@core/common/BigNumber";

export class Company extends Entity {
    entityType: "Company" = "Company";
    name: string;
    cash: BigNumber;
    
    constructor({name = "company", cash = new BigNumber(0), ...data}: Omit<Partial<Company>, "entityType"> = {}) {
        super(data);
        this.name = name;
        this.cash = cash;
    }
}
